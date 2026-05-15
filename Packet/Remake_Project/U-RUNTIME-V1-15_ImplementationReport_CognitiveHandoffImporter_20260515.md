# U-RUNTIME-V1-15 Implementation Report

File: U-RUNTIME-V1-15_ImplementationReport_CognitiveHandoffImporter_20260515.md
Role: Worker
Scope: CognitiveOS Handoff Importer v0
Date: 2026-05-15

---

## Decision

PASS with fixes applied during verification

Implemented `import-handoff <input.md>` to import existing CognitiveOS Snapshot blocks from long external handoff text before any AI Snapshotizer is introduced.

---

## Summary

- Added `importCognitiveHandoff(input.md)`.
- Added CLI command: `npm.cmd run cognitive-db -- import-handoff <input.md>`.
- Detects existing Snapshot blocks using:
  - `# SNAP-xxx`
  - `Snapshot ID: SNAP-xxx`
  - `Snapshot ID` followed by `SNAP-xxx`
- Imports detected Snapshot bodies into Working DB using their existing `SNAP-xxx` ID.
- Records:
  - `source_path`
  - `source_start_line`
  - `source_end_line`
  - `sha256`
  - `body_path`
- Prevents duplicate registration by `snapshot_id` and content hash.
- Saves non-Snapshot Phase/Decision-like remaining material into `inbox_items`.
- No Reference/Decision adoption occurs automatically.

---

## Bug Found and Fixed

### Bug 1 — `Save Status` Snapshot ID was detected as a second Snapshot start

Initial detection picked up both:

- main `Snapshot ID` block
- `Save Status` → `Snapshot ID: SNAP-010`

Result:

```text
Imported snapshots: 1
Skipped snapshots: 1
```

Fix:

- Ignore `Snapshot ID` / `Snapshot ID: SNAP-xxx` when the previous non-empty line is `Save Status`.

### Bug 2 — Existing import kept the earlier truncated range

After Bug 1 fix, the already-imported `SNAP-010` still had the old end line. Added update behavior:

- If same `snapshot_id` exists with different content hash, update the existing record/body instead of creating a duplicate.
- Re-running after fix updated `SNAP-010` from `source_end_line: 1985` to `source_end_line: 1991`.

---

## Changed Files

| File | Change |
| :--- | :--- |
| `runtime/cognitiveDb.ts` | Added handoff importer, snapshot block detection, inbox candidate creation, update-on-existing-ID |
| `runtime/cognitiveDbCli.ts` | Added `import-handoff` command and status inbox count |
| `CognitiveOS_Runtime_Workspace/db/working.json` | Added imported `SNAP-010` and `INBOX-001` |
| `CognitiveOS_Runtime_Workspace/db/snapshots/SNAP-010.md` | Imported Snapshot body |
| `CognitiveOS_Runtime_Workspace/inbox/INBOX-001.md` | Non-Snapshot handoff candidate |

---

## Verification

### Import Handoff

Command:

```powershell
npm.cmd run cognitive-db -- import-handoff input/my-session-note.md
```

Initial result after fixes:

```text
Imported snapshots: 0
Updated snapshots: 1
- SNAP-010: SNAP-010 AI事業OS Runtime / CognitiveOS DB Runtime / 冒険の書回収 Branch
Skipped snapshots: 0
Inbox items: 0
```

Final idempotency result:

```text
Imported snapshots: 0
Updated snapshots: 0
Skipped snapshots: 1
- SNAP-010
Inbox items: 0
```

### Status

```text
Working snapshots: 5
Active/ready working snapshots: 1
Closed working snapshots: 0
Archived working snapshots: 0
Reference documents: 5
Snapshot index entries: 5
Inbox items: 1
Pending decisions: 10
Human decisions: 0
```

### Imported Snapshot

- Snapshot ID: `SNAP-010`
- Body: `CognitiveOS_Runtime_Workspace/db/snapshots/SNAP-010.md`
- Source range: `input/my-session-note.md:1569-1991`
- `record_status: ready`

### Inbox Candidate

- Inbox ID: `INBOX-001`
- Kind: `human_decision_candidate`
- Body: `CognitiveOS_Runtime_Workspace/inbox/INBOX-001.md`
- Source range: `input/my-session-note.md:1-1568`
- Status: `needs_human_review`

### Build

- Command: `npm.cmd run build`
- Result: PASS

---

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| `import-handoff <file.md>` command exists | PASS | CLI command added |
| Existing `SNAP-xxx` can be detected | PASS | `SNAP-010` detected |
| Snapshot body is saved to Working DB | PASS | `SNAP-010.md` |
| Source line range is recorded | PASS | `1569-1991` |
| Duplicate snapshot is not re-registered | PASS | final rerun skips `SNAP-010` |
| Existing incomplete import can be updated | PASS | end line corrected |
| Phase/Decision-like residual material goes to inbox | PASS | `INBOX-001` |
| No automatic adoption occurs | PASS | Human decisions remain 0 |
| Build passes | PASS | Next.js build completed |

---

## Observations

| # | Observation | Recommendation |
| :--- | :--- | :--- |
| 1 | Snapshot block detection is still rule-based. It handles the current `Branch Snapshot / Snapshot ID / SNAP-010 / Save Status` pattern. | Add more patterns only when real handoff examples require them. |
| 2 | Inbox classification is keyword-based and broad; `INBOX-001` became `human_decision_candidate` because the pre-Snapshot section contains Human Decision language. | Keep as `needs_human_review`. Do not auto-promote. |
| 3 | `SNAP-010` is now a Working Snapshot with `record_status: ready`, while older `WSNAP` test records remain `draft`. | This matches the intended lifecycle: imported checked Snapshot is ready; raw/normalized tests are drafts. |
| 4 | This importer should run before any future AI Snapshotizer. | Maintains the safety rule: import existing Snapshots first, then process only remaining material. |


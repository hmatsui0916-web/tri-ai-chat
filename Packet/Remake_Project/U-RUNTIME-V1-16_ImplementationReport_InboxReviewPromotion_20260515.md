# U-RUNTIME-V1-16 Implementation Report

File: U-RUNTIME-V1-16_ImplementationReport_InboxReviewPromotion_20260515.md
Role: Worker
Scope: CognitiveOS Inbox Review + Promotion
Date: 2026-05-15

---

## Decision

PASS with one fix applied

Inbox items can now be listed, inspected, status-updated, and promoted into Working Snapshots while preserving the original Inbox record as an auditable source item.

---

## Summary

- Added Inbox review commands to `cognitive-db`.
- Added Inbox status update support.
- Added Inbox-to-Working-Snapshot promotion.
- Preserved source lineage through `linked_record_ids`.
- Verified `INBOX-001` promotion to `WSNAP-005`.
- Fixed one TypeScript status vocabulary issue discovered during build.
- `npm.cmd run build` PASS.

---

## Changed Files

| File | Change |
| :--- | :--- |
| `runtime/cognitiveDb.ts` | Added Inbox list/read/status/promotion functions and metadata backfill for Inbox items |
| `runtime/cognitiveDbCli.ts` | Added `list-inbox`, `show-inbox`, `set-inbox-status`, `promote-inbox-to-snapshot` commands |
| `CognitiveOS_Runtime_Workspace/db/working.json` | `INBOX-001` marked `promoted`; `WSNAP-005` generated |
| `CognitiveOS_Runtime_Workspace/db/snapshots/WSNAP-005.md` | New promoted snapshot body |
| `CognitiveOS_Runtime_Workspace/exports/cognitive-os-db-summary.md` | Summary regenerated |

---

## Added Commands

```powershell
npm.cmd run cognitive-db -- list-inbox
npm.cmd run cognitive-db -- show-inbox <INBOX-ID>
npm.cmd run cognitive-db -- set-inbox-status <INBOX-ID> <needs_human_review|active|closed|archived|promoted|rejected|parked>
npm.cmd run cognitive-db -- promote-inbox-to-snapshot <INBOX-ID>
```

---

## Behavior

### Inbox Review

`list-inbox` shows:

- Inbox ID
- candidate kind
- lifecycle status
- source path and source line range
- linked promoted snapshot IDs, if any

`show-inbox` prints the full stored Inbox body from `CognitiveOS_Runtime_Workspace/inbox/`.

### Inbox Status

`set-inbox-status` supports:

- `needs_human_review`
- `active`
- `closed`
- `archived`
- `promoted`
- `rejected`
- `parked`

Invalid IDs and invalid statuses return explicit errors.

### Promotion

`promote-inbox-to-snapshot INBOX-001`:

- reads the Inbox body
- creates a normalized Working Snapshot
- writes the body to `db/snapshots/`
- marks the Inbox item as `promoted`
- links the Inbox item to the new snapshot via `linked_record_ids`
- keeps the original Inbox file for traceability

This is intentionally non-destructive.

---

## Verification

### List Inbox

```text
INBOX-001: human_decision_candidate (needs_human_review) input/my-session-note.md:1-1568
```

### Show Inbox

- Command: `npm.cmd run cognitive-db -- show-inbox INBOX-001`
- Result: PASS
- Full body was read from `CognitiveOS_Runtime_Workspace/inbox/INBOX-001.md`.

### Status Update

```text
Updated INBOX-001: active
Updated INBOX-001: needs_human_review
```

### Error Handling

Unknown ID:

```text
Inbox item "INBOX-999" was not found.
```

Invalid status:

```text
Unsupported inbox item status "promoted_bad". Valid statuses: needs_human_review, active, closed, archived, promoted, rejected, parked
```

### Promotion

```text
Promoted INBOX-001: WSNAP-005
Body: CognitiveOS_Runtime_Workspace/db/snapshots/WSNAP-005.md
```

After promotion:

```text
INBOX-001: human_decision_candidate (promoted) input/my-session-note.md:1-1568 -> WSNAP-005
```

`list-snapshots` includes:

```text
WSNAP-005: INBOX-001 / Human Decision Candidate / Promoted Snapshot (ready)
```

Duplicate promotion is rejected:

```text
Inbox item "INBOX-001" is already promoted.
```

### Status

```text
Working snapshots: 6
Active/ready working snapshots: 2
Closed working snapshots: 0
Archived working snapshots: 0
Reference documents: 5
Snapshot index entries: 5
Inbox items: 1
Pending decisions: 10
Human decisions: 0
```

### Export Summary

- Command: `npm.cmd run cognitive-db -- export-summary`
- Result: PASS
- Output: `CognitiveOS_Runtime_Workspace/exports/cognitive-os-db-summary.md`

### Build

- Command: `npm.cmd run build`
- Result: PASS

---

## Fix Applied

### Bug 1 — `needs_human_review` Missing from `CognitiveRecordStatus`

**Problem:**

The Inbox item status type reused `CognitiveRecordStatus`, but `needs_human_review` existed only in `CognitiveDbStatus`, not in `CognitiveRecordStatus`.

`npm.cmd run build` failed with:

```text
Type '"needs_human_review"' is not assignable to type ...
```

**Fix:**

Added `needs_human_review` to `CognitiveRecordStatus`.

**Result:**

`npm.cmd run build` PASS.

---

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| Inbox items can be listed | PASS | `list-inbox` |
| Inbox item body can be inspected | PASS | `show-inbox INBOX-001` |
| Inbox item status can be updated | PASS | `set-inbox-status` |
| Invalid inbox status is rejected | PASS | explicit valid-status list |
| Unknown inbox ID is rejected | PASS | clear error |
| Inbox item can be promoted to snapshot | PASS | `INBOX-001` -> `WSNAP-005` |
| Original Inbox material is preserved | PASS | item remains, status becomes `promoted` |
| Linkage is recorded | PASS | `linked_record_ids: ["WSNAP-005"]` |
| Duplicate promotion is blocked | PASS | second promotion rejected |
| Export summary includes new state | PASS | regenerated summary |
| Build passes | PASS | Next.js build complete |

---

## Observations

| # | Observation | Recommendation |
| :--- | :--- | :--- |
| 1 | Promotion creates a normalized snapshot from the full Inbox body. Large Inbox material can still produce very large promoted snapshots. | Later add AI-assisted split/summarize promotion for large Inbox items. |
| 2 | Inbox promotion marks the target snapshot `ready`. This makes the promoted material auto-loadable. | Keep for now because promotion is a Human operation. Add `--draft` option later if needed. |
| 3 | Inbox status transitions are permissive. | Add stricter transition rules later only if misuse appears. |
| 4 | `show-inbox` can print very large bodies. | Add `--head` / `--summary` later if the CLI becomes noisy. |

---

## Next Recommended Unit

U-RUNTIME-V1-17: Rehydration Export v0

Purpose:

- select one or more ready snapshots
- export a compact Markdown packet for the next chat/session
- include Return Query, source IDs, false closure warning, and load instructions

This is the natural "ロード" side after save/import/promote.

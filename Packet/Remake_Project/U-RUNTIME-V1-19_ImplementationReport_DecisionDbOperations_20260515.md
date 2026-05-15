# U-RUNTIME-V1-19 Implementation Report

File: U-RUNTIME-V1-19_ImplementationReport_DecisionDbOperations_20260515.md
Role: Worker
Scope: Decision DB Operations v0
Date: 2026-05-15

---

## Decision

PASS

Decision DB now supports listing pending decision candidates, inspecting a candidate, recording a Human decision, and listing recorded Human decisions.

---

## Summary

- Added `HumanDecisionRecord` type.
- Added Decision DB helpers:
  - `listPendingDecisions`
  - `readPendingDecision`
  - `recordHumanDecision`
  - `listHumanDecisions`
- Added CLI commands:
  - `list-decisions`
  - `show-decision`
  - `decide`
  - `list-human-decisions`
- Recorded one Human decision:
  - `HD-CAND-007 -> HD-001 -> trial_only`
- Duplicate decision recording is blocked.
- Unknown candidate IDs and invalid statuses are rejected.
- `npm.cmd run build` PASS.

---

## Changed Files

| File | Change |
| :--- | :--- |
| `runtime/cognitiveDb.ts` | Added HumanDecisionRecord and Decision DB operation functions |
| `runtime/cognitiveDbCli.ts` | Added Decision DB CLI commands |
| `CognitiveOS_Runtime_Workspace/db/decision.json` | Added `HD-001`; updated `HD-CAND-007` status/link |
| `CognitiveOS_Runtime_Workspace/exports/cognitive-os-db-summary.md` | Regenerated summary |

---

## Added Commands

```powershell
npm.cmd run cognitive-db -- list-decisions
npm.cmd run cognitive-db -- show-decision <HD-CAND-ID>
npm.cmd run cognitive-db -- decide <HD-CAND-ID> <adopted|adopted_with_conditions|trial_only|parked|rejected> "note"
npm.cmd run cognitive-db -- list-human-decisions
```

---

## Behavior

### Pending Decision Listing

`list-decisions` shows each `HD-CAND-*` item with:

- ID
- decision item
- current record status
- recommended status
- linked Human decision ID, if present

### Human Decision Recording

`decide`:

- creates an `HD-*` Human decision record
- links it to the source `HD-CAND-*`
- updates the candidate `record_status`
- preserves the pending candidate record instead of deleting it

This follows the existing no-physical-delete lifecycle policy.

---

## Verification

### List Decisions

Command:

```powershell
npm.cmd run cognitive-db -- list-decisions
```

Result:

- 10 pending decision candidates listed.
- `HD-CAND-007` initially showed `pending`, later `trial_only`.

PASS.

### Show Decision

Command:

```powershell
npm.cmd run cognitive-db -- show-decision HD-CAND-007
```

Result after decision:

```text
# HD-CAND-007: TransferPacket as trial cross-runtime package

Recommended: trial_only
Status: trial_only
Condition: Start with a light format; formal schema remains parked.
Source: REF-2deb7c82188b / CognitiveOS DB phase material
Linked records: HD-001
```

PASS.

### Record Human Decision

Command:

```powershell
npm.cmd run cognitive-db -- decide HD-CAND-007 trial_only TransferPacket is allowed as trial material only
```

Result:

```text
Recorded HD-001: HD-CAND-007 -> trial_only
```

PASS.

Note: A semicolon in the original unquoted note caused PowerShell to split the shell command. The decision record was still created successfully. Use quoted notes for normal operation:

```powershell
npm.cmd run cognitive-db -- decide HD-CAND-007 trial_only "TransferPacket is allowed as trial material only; formal schema remains parked."
```

### List Human Decisions

Command:

```powershell
npm.cmd run cognitive-db -- list-human-decisions
```

Result:

```text
HD-001: HD-CAND-007 -> trial_only (TransferPacket as trial cross-runtime package)
```

PASS.

### Duplicate Decision Rejection

Command:

```powershell
npm.cmd run cognitive-db -- decide HD-CAND-007 trial_only "duplicate should be blocked"
```

Result:

```text
Pending decision "HD-CAND-007" already has human decision: HD-001.
```

PASS.

### Unknown ID Rejection

Command:

```powershell
npm.cmd run cognitive-db -- decide HD-CAND-999 trial_only "unknown id"
```

Result:

```text
Pending decision "HD-CAND-999" was not found.
```

PASS.

### Invalid Status Rejection

Command:

```powershell
npm.cmd run cognitive-db -- decide HD-CAND-006 invalid_status "bad status"
```

Result:

```text
Unsupported human decision status "invalid_status". Valid statuses: adopted, adopted_with_conditions, trial_only, parked, rejected
```

PASS.

### Status

```text
Working snapshots: 6
Active/ready working snapshots: 2
Closed working snapshots: 0
Archived working snapshots: 0
Reference documents: 5
Snapshot index entries: 5
Inbox items: 1
Outbox items: 1
Pending decisions: 10
Human decisions: 1
```

PASS.

### Export Summary

`cognitive-os-db-summary.md` now shows:

```text
Decision DB
  - pending: 9
  - trial_only: 1

Human Decisions
- HD-001: HD-CAND-007 -> trial_only
```

PASS.

### Build

Command:

```powershell
npm.cmd run build
```

Result: PASS.

---

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| Pending decisions can be listed | PASS | `list-decisions` |
| Pending decision can be inspected | PASS | `show-decision HD-CAND-007` |
| Human decision can be recorded | PASS | `HD-001` |
| Candidate links to Human decision | PASS | `linked_record_ids: ["HD-001"]` |
| Candidate status updates | PASS | `HD-CAND-007 -> trial_only` |
| Duplicate decision is blocked | PASS | one Human decision per candidate |
| Unknown ID is rejected | PASS | clear error |
| Invalid status is rejected | PASS | clear valid-status list |
| Summary reflects Decision DB state | PASS | pending/trial_only counts |
| Build passes | PASS | Next.js build complete |

---

## Observations

| # | Observation | Recommendation |
| :--- | :--- | :--- |
| 1 | Decision candidates remain in `pending_decisions` even after a Human decision is recorded. | Acceptable for v0 because `record_status` and `linked_record_ids` are authoritative. Later rename the collection or add filtered commands. |
| 2 | `decide` accepts note text from remaining CLI args. Shell metacharacters like `;` require quoting in PowerShell. | Document quoted note usage in user-facing command examples. |
| 3 | There is no amend/reopen command for Human decisions. | Add only when a real correction workflow is needed. |

---

## Next Recommended Unit

U-RUNTIME-V1-20: Human Decision Export / Handoff Summary

Purpose:

- export decisions and selected snapshots together
- produce a compact "current operating state" handoff
- make next-session loading lighter than full body rehydration

# U-RUNTIME-V1-14 Implementation Report

File: U-RUNTIME-V1-14_ImplementationReport_LifecycleStatusCommands_20260515.md
Role: Worker
Scope: Lifecycle Status Commands
Date: 2026-05-15

---

## Decision

PASS with one implementation bug fixed during verification

Working Snapshot の `record_status` を CLI から変更できるようにした。検証中に `workingSnapshotStatuses` の初期化順バグを発見し、即時修正した。

---

## Summary

- Added `updateWorkingSnapshotStatus(snapshotId, recordStatus)`.
- Added CLI commands:
  - `set-snapshot-status <WSNAP-ID> <status>`
  - `mark-snapshot-ready <WSNAP-ID>`
  - `close-snapshot <WSNAP-ID>`
  - `archive-snapshot <WSNAP-ID>`
- Status commands update `record_status` and `updated_at`; no files are deleted.
- Verified active/ready, closed, archived counts respond correctly.
- Restored test snapshots to their original `draft` state after verification.
- `npm.cmd run build` PASS.

---

## Bug Found and Fixed

### Bug 1 — `workingSnapshotStatuses` used before initialization

**Issue:**

`workingSnapshotStatuses` was declared after `main().catch(...)`. Because `main()` is invoked before the const declaration executes, `set-snapshot-status` hit a temporal dead zone error:

```text
Cannot access 'workingSnapshotStatuses' before initialization
```

**Fix:**

Moved `workingSnapshotStatuses` above `main()`.

---

## Changed Files

| File | Change |
| :--- | :--- |
| `runtime/cognitiveDb.ts` | Added `updateWorkingSnapshotStatus` |
| `runtime/cognitiveDbCli.ts` | Added status update commands and validation |

---

## Verification

### Status Commands

Commands verified:

```powershell
npm.cmd run cognitive-db -- mark-snapshot-ready WSNAP-001
npm.cmd run cognitive-db -- close-snapshot WSNAP-001
npm.cmd run cognitive-db -- archive-snapshot WSNAP-001
npm.cmd run cognitive-db -- set-snapshot-status WSNAP-002 active
npm.cmd run cognitive-db -- set-snapshot-status WSNAP-002 draft
npm.cmd run cognitive-db -- set-snapshot-status WSNAP-001 draft
```

### Unknown ID

```powershell
npm.cmd run cognitive-db -- set-snapshot-status WSNAP-999 ready
```

Expected error:

```text
Working snapshot "WSNAP-999" was not found.
```

### Final Restored Status

```text
Working snapshots: 4
Active/ready working snapshots: 0
Closed working snapshots: 0
Archived working snapshots: 0
Reference documents: 5
Snapshot index entries: 5
Pending decisions: 10
Human decisions: 0
```

### Build

- Command: `npm.cmd run build`
- Result: PASS

---

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| Working Snapshot can be marked ready | PASS | `mark-snapshot-ready` |
| Working Snapshot can be closed | PASS | `close-snapshot` |
| Working Snapshot can be archived | PASS | `archive-snapshot` |
| Arbitrary supported status can be set | PASS | `set-snapshot-status` |
| No physical delete occurs | PASS | status-only update |
| Active/closed/archived counts update | PASS | verified during status transitions |
| Unknown ID returns clear error | PASS | `WSNAP-999` |
| Final test data restored | PASS | all WSNAP records back to draft |
| Build passes | PASS | Next.js build completed |

---

## Observations

| # | Observation | Recommendation |
| :--- | :--- | :--- |
| 1 | Commands operate only on Working Snapshot records. | Reference and Decision status commands should be separate future units. |
| 2 | `record_status` and legacy `status` can now diverge. | Treat `record_status` as lifecycle control and legacy `status` as original record status until migration is complete. |
| 3 | There is no audit trail for status changes yet. | Add lightweight lifecycle event log later if needed. |


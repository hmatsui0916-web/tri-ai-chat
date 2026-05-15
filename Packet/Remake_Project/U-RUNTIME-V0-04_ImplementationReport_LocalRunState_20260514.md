# U-RUNTIME-V0-04 Implementation Report

File: U-RUNTIME-V0-04_ImplementationReport_LocalRunState_20260514.md
Role: Codex
Scope: U-RUNTIME-V0-04 Local Run State
Date: 2026-05-14

---

## Decision

PASS

U-RUNTIME-V0-04 was implemented as a minimal file-based run state enhancement. No database or lifecycle system was introduced.

---

## Summary

- Expanded `run.json` with inspectable local state fields.
- Added workflow version, run folder path, total step count, completed step count, failed step, final output path, and last-updated timestamp.
- Added per-role `started_at`, `finished_at`, and `duration_ms`.
- Preserved the existing sequential file-based runner.
- Verified both normal execution and a failure path.

---

## Changed Files

| File | Change |
| :--- | :--- |
| `runtime/workflow.ts` | Added local run state fields to `RunLog` and per-role state fields to `RunRoleRecord` |

---

## run.json Additions

Top-level fields added:

- `workflow_version`
- `run_folder`
- `total_steps`
- `completed_steps`
- `failed_step`
- `final_output_path`
- `last_updated_at`

Per-role fields added:

- `started_at`
- `finished_at`
- `duration_ms`

These fields are intended for quick inspection and later resume preparation only. They are not a database, Snapshot, or Decision lifecycle.

---

## Verification

### Normal Run

- Command: `npm.cmd run workflow -- input/request.md`
- Result: PASS
- Run folder: `runs/20260514-092048-420`

Confirmed in `run.json`:

- `"status": "completed"`
- `"total_steps": 6`
- `"completed_steps": 6`
- `"failed_step": null`
- `"final_output_path": "runs/20260514-092048-420/06-integrator-c.output.md"`
- Each role includes `started_at`, `finished_at`, and `duration_ms`.

### Failure Path

- Method: temporarily moved `runtime/roles/debugger.md`, ran workflow, then restored the file.
- Run folder: `runs/20260514-092107-067`
- Result: PASS

Confirmed in `run.json`:

- `"status": "failed"`
- `"current_role": "debugger"`
- `"completed_steps": 4`
- `"failed_step": 5`
- Debugger role record has `"status": "failed"`
- `"final_output_path": null`
- Error message records the missing role instruction file.

Note: the PowerShell verification wrapper restored the temporarily moved file after execution. Because that restoration command succeeded, the wrapper command itself returned exit code 0; the generated `run.json` correctly records the workflow failure.

### Build

- Command: `npm.cmd run build`
- Result: PASS

---

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| A Human can see what ran | PASS | `run_id`, `run_folder`, role records |
| A Human can see what succeeded | PASS | `completed_steps`, per-role statuses |
| A Human can see where it stopped | PASS | `current_role`, `failed_step`, error message |
| Existing run folders are not overwritten | PASS | Existing unique folder behavior preserved |
| No DB layer is introduced | PASS | State remains in `runs/{run_id}/run.json` |
| Build still passes | PASS | Existing app unaffected |

---

## Observations

| # | Observation | Recommendation |
| :--- | :--- | :--- |
| 1 | `last_updated_at` updates on every `run.json` write. | Keep; this is useful for inspection and cheap. |
| 2 | `duration_ms` is very small in mock mode. | Expected. Real executor timing will be more meaningful later. |
| 3 | Failure before run folder creation still fails fast without `run.json`, matching U-RUNTIME-V0-03 behavior for input/template load failures. | Keep for v0. Only in-run failures need run state. |

---

## Next Recommended Unit

U-RUNTIME-V0-05: Manual Resume

Recommended focus:

- Resume from a selected role using existing output files.
- Reuse `completed_steps`, `failed_step`, and role output paths from `run.json`.
- Avoid Branch / Reopen / Fork lifecycle.

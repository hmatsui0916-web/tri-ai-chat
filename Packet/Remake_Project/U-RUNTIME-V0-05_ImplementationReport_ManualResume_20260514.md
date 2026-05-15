# U-RUNTIME-V0-05 Implementation Report

File: U-RUNTIME-V0-05_ImplementationReport_ManualResume_20260514.md
Role: Codex
Scope: U-RUNTIME-V0-05 Manual Resume
Date: 2026-05-14

---

## Decision

PASS

U-RUNTIME-V0-05 was implemented as a minimal manual resume feature. It reuses the existing file-based run folder and does not introduce Branch, Reopen, Fork, Snapshot, or Decision lifecycle behavior.

---

## Summary

- Added resume CLI mode.
- New run behavior remains unchanged.
- Resume mode loads an existing `run.json`, reads prior completed role outputs, truncates run state from the selected role, and reruns that role onward.
- Added `resume_history` to `run.json`.
- Verified resume from a completed run.
- Verified resume from a failed run after restoring the missing role file.

---

## CLI

New run:

```bash
npm.cmd run workflow -- input/request.md
```

Resume:

```bash
npm.cmd run workflow -- --resume runs/<run_id> --from <role>
```

Example:

```bash
npm.cmd run workflow -- --resume runs/20260514-093240-702 --from debugger
```

Valid role names:

- `pm`
- `designer`
- `reviewer`
- `worker`
- `debugger`
- `integrator-c`

---

## Changed Files

| File | Change |
| :--- | :--- |
| `runtime/workflow.ts` | Added CLI parsing, run log loading, prior output collection, resume state preparation, and `resume_history` |

---

## Resume Behavior

When resuming from a role:

1. Load `runs/{run_id}/run.json`.
2. Read the original `input_path` from the run log.
3. Read completed output files for roles before the selected role.
4. Remove role records from the selected role onward.
5. Clear prior failure state.
6. Add a `resume_history` entry.
7. Rerun the selected role and all following roles.
8. Write updated `run.json`.

This does not delete old files. Files for resumed roles are overwritten if the resumed run reaches those writes. Stale files are not referenced if a resumed role fails before writing.

---

## Verification

### Normal Run

- Command: `npm.cmd run workflow -- input/request.md`
- Result: PASS
- Run folder: `runs/20260514-093217-483`

### Resume From Completed Run

- Command: `npm.cmd run workflow -- --resume runs/20260514-093217-483 --from debugger`
- Result: PASS
- Confirmed:
  - Same run folder reused.
  - PM through Worker records preserved.
  - Debugger and Integrator-C records regenerated.
  - `resume_history` includes `from_role: "debugger"`.
  - `completed_steps: 6`.
  - `final_output_path` points to Integrator-C output.

### Resume From Failed Run

- Method: temporarily moved `runtime/roles/debugger.md`, ran workflow to create a failed run, restored the file, then resumed from debugger.
- Failed run folder: `runs/20260514-093240-702`
- Resume command: `npm.cmd run workflow -- --resume runs/20260514-093240-702 --from debugger`
- Result: PASS
- Confirmed:
  - Failed debugger state was replaced by completed debugger state.
  - Integrator-C completed after resume.
  - `error` cleared.
  - `failed_step: null`.
  - `completed_steps: 6`.

### Build

- Command: `npm.cmd run build`
- Result: PASS

---

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| A failed run does not need to restart from the beginning | PASS | Failed debugger run resumed from debugger |
| Resume remains file-based | PASS | Uses existing `run.json` and role output files |
| No Branch / Reopen / Fork lifecycle introduced | PASS | Resume is a direct rerun from selected role |
| Prior completed outputs feed resumed role | PASS | Debugger received 4 previous outputs when resumed |
| Existing run folder is reused | PASS | Resume prints the same run folder |
| Build still passes | PASS | Existing app unaffected |

---

## Observations

| # | Observation | Recommendation |
| :--- | :--- | :--- |
| 1 | Resume overwrites prompt/output files for roles it reruns. | Accept for v0. Add copy-on-resume only if Human needs historical attempts. |
| 2 | Resume requires all prior role `output_path` files to exist. | Correct for v0; missing prior output is a hard stop. |
| 3 | Stale files from old attempts may remain on disk if a resumed run fails before overwriting them. | Accept because `run.json` is authoritative. Avoid cleanup until there is a real need. |

---

## Next Recommended Unit

U-RUNTIME-V0-06: Minimal Review Loop

Recommended focus:

- Make Reviewer, Debugger, and Integrator-C outputs more useful even in mock or semi-manual mode.
- Keep the loop lightweight.
- Do not introduce Decision lifecycle.

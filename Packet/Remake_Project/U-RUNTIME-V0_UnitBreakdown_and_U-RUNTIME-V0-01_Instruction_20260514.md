# U-RUNTIME-V0 Unit Breakdown and U-RUNTIME-V0-01 Instruction

Date: 2026-05-14

## 1. PM Decision

This document treats the supplied runtime redesign log as the starting material for the AI Business OS Runtime redesign.

PM decision:

- Freeze the current Runtime as a reference implementation.
- Do not continue extending the current Runtime toward a complete AI Business OS.
- Start a zero-start Workflow Runner v0 that runs inside the VSCode workspace.
- Extract only the minimum Role / I/O / Step needed for v0 from the existing AI Business OS specification.
- Define success as: easier to run than manual cross-chat operation.

## 2. Runtime v0 Scope Lock

Workflow Runner v0 is not the completed AI Business OS.

In scope for v0:

- Sequential role execution.
- Minimal role prompts.
- File-based input and output.
- A run folder per execution.
- A simple run log.
- Manual review of outputs by Human/PM.

Out of scope for the initial MVP:

- Document management.
- Context pollution prevention framework.
- Database design.
- Snapshot.
- Decision lifecycle.
- Branch / Reopen / Fork lifecycle.
- Access control design.
- Complete RoleExecutionContext.
- Complete Handoff Packet schema.
- UI.
- Git automation.
- Automatic final PM judgment.

## 3. Success Condition

The v0 succeeds when a Human can run:

```bash
npm run workflow -- input/request.md
```

and receive ordered role outputs in the workspace without manually copying context across multiple chats.

Minimum success conditions:

- The workflow runs from a single command.
- Each role output is saved as a file.
- The run log shows the current status and failure point.
- The process is visibly easier than manual cross-chat execution.

## 4. Unit Breakdown

### U-RUNTIME-V0-00: Runtime Freeze / Scope Lock

Purpose:
Fix the redesign boundary so v0 does not expand into a complete AI Business OS.

Deliverables:

- Runtime v0 scope statement.
- In-scope / out-of-scope list.
- Adoption note that the current Runtime is frozen as reference only.

Acceptance Criteria:

- The excluded items are explicit.
- Later Units can be judged against the v0 scope.
- The project does not drift back into DB, Snapshot, Decision lifecycle, or document management.

### U-RUNTIME-V0-01: VSCode Workflow Runner Minimal Execution

Purpose:
Build the smallest executable Workflow Runner v0.

Core sequence:

```text
Human input
-> PM
-> Designer
-> Reviewer
-> Worker
-> Debugger
-> Integrator-C
```

Deliverables:

- CLI command to start a workflow run.
- Input file loading.
- Role prompt loading.
- Sequential role execution scaffold.
- Role output file creation.
- Run log creation.

Acceptance Criteria:

- `npm run workflow -- input/request.md` starts a run.
- Outputs are written to `runs/{run_id}/`.
- Each role gets the previous role output as input.
- Failure records the role where execution stopped.
- The run can be inspected from files without opening the app UI.

### U-RUNTIME-V0-02: Role Contract v0

Purpose:
Define the minimum input/output contract for each role.

Deliverables:

- `runtime/roles/pm.md`
- `runtime/roles/designer.md`
- `runtime/roles/reviewer.md`
- `runtime/roles/worker.md`
- `runtime/roles/debugger.md`
- `runtime/roles/integrator-c.md`

Acceptance Criteria:

- Each role has one clear responsibility.
- Each role has a minimal output shape.
- The output of one role can be passed to the next role without manual rewriting.

### U-RUNTIME-V0-03: Prompt Template Loader

Purpose:
Generate role prompts mechanically from templates and prior outputs.

Deliverables:

- Prompt builder.
- Shared role-run template.
- Generated prompt files per run.

Acceptance Criteria:

- Role prompts are generated without hand editing.
- The generated prompts can be inspected after the run.
- The template does not include DB, Snapshot, Decision lifecycle, or document management assumptions.

### U-RUNTIME-V0-04: Local Run State

Purpose:
Track one workflow run without introducing a database.

Deliverables:

- `runs/{run_id}/run.json`
- Status fields for input, current role, output files, errors, and timestamps.

Acceptance Criteria:

- A Human can see what ran, what succeeded, and where it stopped.
- Existing run folders are not overwritten.
- No DB layer is introduced.

### U-RUNTIME-V0-05: Manual Resume

Purpose:
Allow a stopped run to continue from a selected role.

Deliverables:

- Resume command option.
- Previous output loading.
- Safe overwrite behavior.

Acceptance Criteria:

- A failed run does not need to restart from the beginning.
- Resume remains file-based.
- No Branch / Reopen / Fork lifecycle is introduced.

### U-RUNTIME-V0-06: Minimal Review Loop

Purpose:
Make the workflow more useful than a direct PM-to-Worker chain.

Deliverables:

- Reviewer output focused on risks, missing items, and regressions.
- Debugger output focused on blockers and implementation failure points.
- Integrator-C output that consolidates the final result.

Acceptance Criteria:

- The run includes at least one review pass and one debug pass.
- Integrator-C receives enough information to produce a final integrated output.
- This remains a lightweight review loop, not a Decision lifecycle.

## 5. First Implementation Unit Instruction

Unit ID:
U-RUNTIME-V0-01

Unit Name:
VSCode Workflow Runner Minimal Execution

Target Role:
Worker

Target Environment:
VSCode workspace

## 6. Worker Mission

Implement the first minimal Workflow Runner v0 in this repository.

The Worker must create a command-line runner that:

- Reads a Human request from a markdown file.
- Runs the fixed role sequence:
  - PM
  - Designer
  - Reviewer
  - Worker
  - Debugger
  - Integrator-C
- Builds a prompt for each role from:
  - the original Human request
  - the current role instruction
  - previous role outputs
- Saves each role output to a run folder.
- Saves a machine-readable run log.

This Unit may use a mock role execution function if real model/API integration is not already available or would enlarge scope.

## 7. Proposed Minimal File Layout

The Worker may adjust exact paths if the repository structure requires it, but should keep the implementation simple.

```text
runtime/
  workflow.ts
  promptBuilder.ts
  roles/
    pm.md
    designer.md
    reviewer.md
    worker.md
    debugger.md
    integrator-c.md
input/
  request.md
runs/
  {run_id}/
    run.json
    01-pm.prompt.md
    01-pm.output.md
    02-designer.prompt.md
    02-designer.output.md
    03-reviewer.prompt.md
    03-reviewer.output.md
    04-worker.prompt.md
    04-worker.output.md
    05-debugger.prompt.md
    05-debugger.output.md
    06-integrator-c.prompt.md
    06-integrator-c.output.md
```

## 8. Required CLI Behavior

Add a package script equivalent to:

```bash
npm run workflow -- input/request.md
```

Expected behavior:

- Create a unique `run_id`.
- Create `runs/{run_id}/`.
- Read the input markdown file.
- Execute roles in order.
- Write prompt and output files for each role.
- Write `run.json`.
- Print the run folder path.

## 9. Minimal run.json Schema

```json
{
  "run_id": "20260514-123456",
  "input_path": "input/request.md",
  "status": "completed",
  "current_role": "integrator-c",
  "roles": [
    {
      "step": 1,
      "role": "pm",
      "status": "completed",
      "prompt_path": "runs/20260514-123456/01-pm.prompt.md",
      "output_path": "runs/20260514-123456/01-pm.output.md"
    }
  ],
  "error": null,
  "started_at": "2026-05-14T00:00:00.000Z",
  "finished_at": "2026-05-14T00:00:00.000Z"
}
```

## 10. Role Output v0 Shape

Each role output should be markdown and should include at least:

```markdown
# {Role} Output

## Summary

## Decisions / Findings

## Next Input For Following Role
```

This is a lightweight shape only. Do not introduce a complete artifact schema in this Unit.

## 11. Implementation Constraints

Do:

- Keep the runner file-based.
- Keep role execution sequential.
- Keep the role list fixed.
- Prefer simple TypeScript/Node implementation if compatible with the repo.
- Make the first version runnable even if role outputs are mocked.
- Keep generated files out of source edits unless necessary.

Do not:

- Add a database.
- Add Snapshot.
- Add Decision lifecycle.
- Add Branch / Reopen / Fork.
- Add document management.
- Add UI.
- Add complex validation.
- Add multi-agent orchestration.
- Replace the current app Runtime.
- Treat this as the final AI Business OS.

## 12. Verification

Worker should verify:

- `npm run workflow -- input/request.md` runs successfully.
- A new `runs/{run_id}/` folder is created.
- Prompt and output files exist for all six roles.
- `run.json` ends in `completed` for a successful mock run.
- If an error is induced or encountered, `run.json` records `failed` and the failed role.

## 13. PM Notes

This Unit is intentionally small.

The goal is not conceptual correctness of the entire AI Business OS. The goal is to produce the first mechanical runtime feeling:

```text
input file -> role chain -> saved outputs -> inspectable run folder
```

Once this works, later Units can improve role contracts, prompt templates, resume behavior, and review loops without re-opening the full Runtime redesign.

File:
U-RUNTIME-V0-01_WorkerPacket_WorkflowRunnerV0_20260514.md

Role: Integrator-S
Scope: Physical Worker Packet
Date: 2026-05-14

# Japanese Summary

このPacketは、PM指示書
`Packet/Remake_Project/U-RUNTIME-V0_UnitBreakdown_and_U-RUNTIME-V0-01_Instruction_20260514.md`
をWorkerが実装できる物理Packetへ変換したものです。

本Unitの目的は、既存Runtimeを拡張することではなく、VSCode workspace内で動く最小の
`Workflow Runner v0` を新規に切り出すことです。

初期MVPでは、DB、Snapshot、Decision lifecycle、文書管理、UI、Git automation、
自動PM最終判断、Branch/Reopen/Fork lifecycleは扱いません。

---

# Handoff Packet U-RUNTIME-V0-01 Worker

## 1. Envelope Metadata

- Unit ID: U-RUNTIME-V0-01
- Unit Name: VSCode Workflow Runner Minimal Execution
- Source Instruction:
  - `Packet/Remake_Project/U-RUNTIME-V0_UnitBreakdown_and_U-RUNTIME-V0-01_Instruction_20260514.md`
- Source Role: PM / Integrator-S
- Target Role: Worker
- Target Environment: VSCode workspace
- Handoff Type: manual external handoff
- Runtime Policy:
  - Current Runtime is frozen as reference only.
  - Do not continue extending the current Runtime toward a complete AI Business OS.
  - Implement a separate minimal file-based Workflow Runner v0.
- API Request: forbidden unless the repository already contains an approved local integration.
- Model/API Integration: optional and out of scope for this Unit.
- Mock Execution: allowed and preferred for the first MVP if it keeps the runner executable.
- Return Method: paste Worker Report to chat or attach a file.

## 2. Worker Mission

Implement the first minimal `Workflow Runner v0` in this repository.

The runner must support this command:

```bash
npm run workflow -- input/request.md
```

The command must:

1. Read a Human request from a markdown file.
2. Create a unique run folder under `runs/{run_id}/`.
3. Run this fixed role sequence:
   - PM
   - Designer
   - Reviewer
   - Worker
   - Debugger
   - Integrator-C
4. For each role, build a prompt from:
   - the original Human request
   - the current role instruction
   - previous role outputs
5. Save each generated prompt file.
6. Execute each role through a minimal mock executor unless real integration already exists and is trivial to reuse.
7. Save each role output file.
8. Save a machine-readable `run.json`.
9. Print the run folder path at the end.

The target feeling is:

```text
input file -> role chain -> saved outputs -> inspectable run folder
```

## 3. Background

PM decision for Runtime v0:

- Freeze the current Runtime as a reference implementation.
- Do not enlarge the existing Runtime into a complete AI Business OS.
- Start a zero-start Workflow Runner v0 inside the VSCode workspace.
- Extract only the minimum Role / I/O / Step needed for v0.
- Define success as: easier to run than manual cross-chat operation.

This Unit is intentionally mechanical. The goal is not to design the complete AI Business OS runtime.

## 4. Input Artifacts

Primary source:

- `Packet/Remake_Project/U-RUNTIME-V0_UnitBreakdown_and_U-RUNTIME-V0-01_Instruction_20260514.md`

Repository context:

- `package.json`
- `tsconfig.json`
- `README.md`
- Existing source tree only as needed to avoid collisions and preserve current app behavior.

## 5. Allowed File Access

### Read-only reference files

Worker may read:

- `Packet/Remake_Project/U-RUNTIME-V0-01_WorkerPacket_WorkflowRunnerV0_20260514.md`
- `Packet/Remake_Project/U-RUNTIME-V0_UnitBreakdown_and_U-RUNTIME-V0-01_Instruction_20260514.md`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `README.md`
- `.gitignore`
- Existing `runtime/**`, `input/**`, and `runs/**` only if they already exist.
- Existing app files only for collision awareness:
  - `app/**`
  - `public/**`

### Editable files

Worker may create or edit:

- `package.json`
- `.gitignore`
- `runtime/workflow.ts`
- `runtime/promptBuilder.ts`
- `runtime/roleExecutor.ts`
- `runtime/roles/pm.md`
- `runtime/roles/designer.md`
- `runtime/roles/reviewer.md`
- `runtime/roles/worker.md`
- `runtime/roles/debugger.md`
- `runtime/roles/integrator-c.md`
- `input/request.md`
- Supporting files under `runtime/**` if needed for a clean minimal implementation.

### Generated runtime files

The runner may create files under:

- `runs/{run_id}/`

Generated run folders should not be treated as source edits. If needed, update `.gitignore` so generated `runs/` output does not pollute source control.

## 6. Prohibited Files and Areas

Do not modify:

- `app/page.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `app/api/**`
- `public/**`
- Any existing Flow JSON or app Runtime behavior.
- Any file under `Packet/**`.
- `package-lock.json`, unless a dependency change is explicitly approved.

Do not add dependencies unless the implementation is impossible with the current TypeScript/Node toolchain. This Unit should be possible without new dependencies.

## 7. In Scope

- CLI command for starting a workflow run.
- Input markdown loading.
- Role instruction markdown loading.
- Fixed sequential role list.
- Prompt generation for each role.
- File-based output writing.
- File-based `run.json`.
- Mock role execution.
- Failure recording that identifies the role where execution stopped.
- A small default `input/request.md` for smoke testing.

## 8. Out of Scope

Do not implement:

- Database.
- Snapshot.
- Decision lifecycle.
- Branch / Reopen / Fork lifecycle.
- Document management.
- UI.
- Git automation.
- Access control.
- Complete `RoleExecutionContext`.
- Complete Handoff Packet schema.
- Automatic final PM judgment.
- Multi-agent orchestration.
- Streaming chat integration.
- Automatic API calls to external models.
- Refactor of existing app Runtime.

## 9. Required File Layout

Prefer this exact layout unless the repository requires a minor adjustment:

```text
runtime/
  workflow.ts
  promptBuilder.ts
  roleExecutor.ts
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

## 10. CLI Requirements

Add a package script equivalent to:

```json
{
  "scripts": {
    "workflow": "..."
  }
}
```

The script must allow:

```bash
npm run workflow -- input/request.md
```

Expected behavior:

- If the input path is missing, fail with a clear error and no partial role execution.
- Create a unique `run_id`.
- Create `runs/{run_id}/`.
- Write `run.json` early enough that failure status can be recorded.
- Execute all six roles in order.
- Write one prompt and one output file per role.
- Update `run.json` after each role.
- Print the created run folder path.

## 11. Role Sequence

Use this fixed sequence:

| Step | Role | File stem |
| :--- | :--- | :--- |
| 1 | PM | `01-pm` |
| 2 | Designer | `02-designer` |
| 3 | Reviewer | `03-reviewer` |
| 4 | Worker | `04-worker` |
| 5 | Debugger | `05-debugger` |
| 6 | Integrator-C | `06-integrator-c` |

Do not make this configurable in U-RUNTIME-V0-01.

## 12. Prompt Builder Requirements

Each generated prompt must include:

- Role name.
- Role instruction loaded from `runtime/roles/{role}.md`.
- Original Human request.
- Previous role outputs, in order.
- Expected output shape.

Minimum prompt structure:

```markdown
# Workflow Runner v0 Prompt

## Role

## Role Instruction

## Original Human Request

## Previous Role Outputs

## Required Output Shape
```

## 13. Mock Role Executor Requirements

The mock executor may be simple, but it must produce valid markdown output for every role.

Each output must include at least:

```markdown
# {Role} Output

## Summary

## Decisions / Findings

## Next Input For Following Role
```

The mock output should make it obvious which role ran and which input it received. It does not need to be intelligent.

## 14. `run.json` Minimum Schema

Write `runs/{run_id}/run.json` with at least:

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

Required status values:

- `running`
- `completed`
- `failed`

If a role fails:

- Set top-level `status` to `failed`.
- Set `current_role` to the failed role.
- Mark the failed role as `failed`.
- Record an error object or string that includes the failed role and message.
- Preserve outputs already created before the failure.

## 15. Implementation Guidance

Prefer a small TypeScript/Node implementation.

Suggested responsibilities:

- `runtime/workflow.ts`
  - CLI entrypoint.
  - Input validation.
  - Run folder creation.
  - Role loop.
  - `run.json` writing.
- `runtime/promptBuilder.ts`
  - Build role prompts from request, role instruction, and previous outputs.
- `runtime/roleExecutor.ts`
  - Mock role executor.
  - Later Units may replace this with real execution.
- `runtime/roles/*.md`
  - Minimal role instructions.

Keep functions pure where it is easy, but do not over-abstract. This Unit should remain compact.

## 16. Acceptance Criteria

U-RUNTIME-V0-01 is complete when:

1. `npm run workflow -- input/request.md` starts a run.
2. A new `runs/{run_id}/` folder is created.
3. Prompt files exist for all six roles.
4. Output files exist for all six roles.
5. `run.json` exists.
6. `run.json.status` is `completed` after a successful mock run.
7. Each role receives the previous role output as part of its prompt.
8. Failure handling records the role where execution stopped.
9. The run can be inspected from files without opening the app UI.
10. Existing app UI/runtime files are untouched.
11. No DB, Snapshot, Decision lifecycle, document management, or UI feature is introduced.

## 17. Verification Requirements

Worker must run:

```bash
npm run workflow -- input/request.md
```

Then verify:

- The command exits successfully.
- The printed run folder exists.
- The folder contains:
  - `run.json`
  - six `*.prompt.md` files
  - six `*.output.md` files
- `run.json` has `"status": "completed"`.
- The final role is `integrator-c`.
- At least one later role prompt contains content from the previous role output.

Worker should also run a TypeScript/build-level check if available and appropriate:

```bash
npm run build
```

If build is not runnable or fails for unrelated existing reasons, report the cause.

### Failure-path verification

Worker must verify failure behavior in one of these ways:

- Add a temporary local-only failure trigger and remove it before final output.
- Or explain a manual test procedure that can induce a failure, such as temporarily renaming one role instruction file.

The final report must state how failure handling was verified.

## 18. Worker Report Schema

Return the implementation report in this structure:

```markdown
# U-RUNTIME-V0-01 Worker Report

## Decision

PASS / CONDITIONAL / FAIL

## Summary

- 

## Changed Files

- 

## Implementation Details

- CLI:
- Run folder:
- Prompt builder:
- Role executor:
- Role instructions:
- Run log:
- Failure handling:

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| `npm run workflow -- input/request.md` starts a run | PASS/FAIL | |
| New `runs/{run_id}/` folder is created | PASS/FAIL | |
| Prompt files exist for all six roles | PASS/FAIL | |
| Output files exist for all six roles | PASS/FAIL | |
| `run.json` exists and completes successfully | PASS/FAIL | |
| Each role receives previous role output | PASS/FAIL | |
| Failure records stopped role | PASS/FAIL | |
| Run can be inspected without UI | PASS/FAIL | |
| Existing app Runtime remains untouched | PASS/FAIL | |
| Out-of-scope systems were not introduced | PASS/FAIL | |

## Verification

- Command:
- Result:
- Notes:

## Failure-Path Verification

- Method:
- Result:

## Known Risks / Limitations

- 

## Read Log

| file_path | reason_for_reading | timestamp |
| :--- | :--- | :--- |
|  |  |  |

## Handoff Return

Only include this section if clarification is required.
```

## 19. Final Instruction to Worker

Implement only the minimal file-based Workflow Runner v0. Treat this as a new CLI runtime slice, not a continuation of the current UI Runtime.

If the implementation begins to require DB, Snapshot, Decision lifecycle, document management, UI, or model orchestration design, stop and return a Handoff Return instead of expanding scope.

# U-RUNTIME-V0-03 Implementation Report

File: U-RUNTIME-V0-03_ImplementationReport_PromptTemplateLoader_20260514.md
Role: Codex
Scope: U-RUNTIME-V0-03 Prompt Template Loader
Date: 2026-05-14

---

## Decision

PASS

U-RUNTIME-V0-03 was implemented as a minimal prompt template loader. The workflow remains file-based and sequential.

---

## Summary

- Moved the role-run prompt shape out of `promptBuilder.ts` into `runtime/templates/role-run.md`.
- Updated `workflow.ts` to load the prompt template once per run.
- Updated `promptBuilder.ts` to render placeholders from the template.
- Added a standalone `## Role Contract` prompt section.
- Extracted `Input Contract` and `Output Contract` from each role instruction and surfaced them separately in generated prompts.
- Added `## Role Focus` headings to role instruction files so contract extraction stays clean.
- Did not introduce DB, Snapshot, Decision lifecycle, UI, Branch/Reopen/Fork, document management, or a full schema engine.

---

## Changed Files

| File | Change |
| :--- | :--- |
| `runtime/templates/role-run.md` | Added external prompt template |
| `runtime/promptBuilder.ts` | Added template rendering and contract extraction |
| `runtime/workflow.ts` | Loads `runtime/templates/role-run.md` and passes it to the builder |
| `runtime/roles/*.md` | Added `## Role Focus` heading to keep contract extraction bounded |

---

## Template Placeholders

The v0 template supports these placeholders:

| Placeholder | Meaning |
| :--- | :--- |
| `{{roleName}}` | Current role display name |
| `{{roleInputContract}}` | Extracted `## Input Contract` from role instruction |
| `{{roleOutputContract}}` | Extracted `## Output Contract` from role instruction |
| `{{roleInstruction}}` | Full role instruction markdown |
| `{{humanRequest}}` | Original Human request |
| `{{previousOutputs}}` | Prior role outputs, or empty-state text |

---

## Verification

### Workflow Run

- Command: `npm.cmd run workflow -- input/request.md`
- Result: PASS
- Run folder: `runs/20260514-081342-566`
- Notes: all six roles completed and `run.json` ended with `"status": "completed"`.

### Generated Prompt Check

Confirmed in `runs/20260514-081342-566/01-pm.prompt.md`:

- `## Role Contract` appears as its own prompt section.
- `### Input Contract` contains only the PM input contract.
- `### Output Contract` contains only the PM output contract.
- `## Role Instruction` still includes the full role instruction for human inspectability.

### Build

- Command: `npm.cmd run build`
- Result: PASS
- Notes: Next.js app build completed successfully.

---

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| Prompt shape is loaded from a template file | PASS | `runtime/templates/role-run.md` |
| Generated prompt files remain inspectable | PASS | Prompt files still written under `runs/{run_id}/` |
| Role Contract is available as an independent prompt section | PASS | Extracted from role instruction |
| U-RUNTIME-V0-02 naming observation is addressed | PASS | Prompt uses `Role Contract`; role files retain `Input/Output Contract` as source sections |
| Scope remains v0-minimal | PASS | No lifecycle, DB, UI, or schema engine added |

---

## Observations

| # | Observation | Recommendation |
| :--- | :--- | :--- |
| 1 | Template rendering is simple string replacement. | Keep for v0. Add validation only if missing placeholders become a real failure mode. |
| 2 | Contract extraction depends on `## Input Contract` and `## Output Contract` headings. | Keep these headings stable for v0. |
| 3 | Role instruction content is duplicated in generated prompts: once as extracted contract and once as full instruction. | Accept for inspectability. Revisit only if prompt size becomes a problem. |

---

## Next Recommended Unit

U-RUNTIME-V0-04: Local Run State

Recommended focus:

- Keep `run.json` simple.
- Add only the state fields needed for quick inspection and resume preparation.
- Do not introduce a database.

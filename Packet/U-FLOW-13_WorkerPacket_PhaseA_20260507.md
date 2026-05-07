File:
U-FLOW-13_WorkerPacket_PhaseA_20260507.md

Role: Integrator-S
Scope: Physical Worker Packet

# Japanese Summary

U-FLOW-13 Phase A の Worker 向け Handoff Packet です。目的は、PM 承認済み Spec に基づき、Role Execution Routing / Handoff Runtime を既存 Next.js UI に組み込み、Worker への VSCode 手動ハンドオフを安全に生成できる状態にすることです。

Worker は指定されたファイルのみを Pre-Read 宣言して読み、宣言外ファイルが必要な場合は Access Amendment Request を返してください。実装後の Output には Read Log を必ず含めてください。

---

# Handoff Packet U-FLOW-13-PhaseA-Worker

## Envelope Metadata

- Unit ID: U-FLOW-13
- Phase: A
- Route Context: `fb-specification`
- Source Route: `fb-spec-04` -> `fb-spec-05`
- Current State: `Integrated`
- Target Role: Worker
- Target Environment: `vscode`
- Handoff Target: VSCode Copilot
- Handoff Type: manual external handoff
- API Request: forbidden
- Return Method: paste output to chat or attach a file
- Applied Policies:
  - AI-to-AI artifacts must be written in English.
  - Preserve PM-facing Japanese summaries where useful.
  - Use repository access only for explicitly allowed paths.
  - Pre-Read Declaration is required before any file access.
  - Final Read Log is required.
  - Handoff Packet is an envelope containing the Worker Packet.
  - PM override and policy exemptions must be represented explicitly.
- Policy Exemptions: None
- Ambiguity Handling: Return to PM via Handoff Return. Do not guess.

## Content: Worker Packet

## 1. Mission

Implement U-FLOW-13 Phase A: Role Execution Routing and Handoff Runtime in the existing `tri-ai-chat-flow-ui` Next.js application.

The implementation must allow the runtime to:

- Resolve `execution_env` by Role / Step.
- Determine `requires_repo_access`.
- Display migration recommendations and reasons.
- Support PM environment override and policy-level override metadata.
- Generate a compliant Handoff Packet envelope containing a Worker Packet.
- Include allowed files, input artifacts, applied policies, Pre-Read Declaration rules, Read Log requirements, output schema, prohibitions, and return method.
- Keep Worker handoff manual, with no automatic API call to VSCode or external tools.

## 2. Background

PM approved `U-FLOW-13_Spec_PhaseA_20260507_v3.md` after Reviewer Pass.

Reviewer v3 confirmed:

- All prior Blocking items resolved.
- Handoff Packet mandatory fields restored.
- Read Log required fields restored: `file_path`, `reason_for_reading`, `timestamp`.
- Violation fallback coverage restored.
- Phase A is ready for Integrator-S handoff.

PM accepted the following non-blocking notes:

- Missing and incomplete Read Log handling may be refined later.
- One `requires_repo_access` condition may be made more explicit during Packet creation.
- Translation Boundary may remain flexible, while Integrator-S Physical remains the primary practical conversion point.

This Worker Packet resolves the second note by explicitly including this `requires_repo_access` condition:

- Repository structure is required to create a reliable Worker Packet.

## 3. Input Artifacts

Primary input artifacts:

1. `Packet/U-FLOW-13_Spec_PhaseA_20260507.md`
2. `Packet/U-FLOW-13_PMDecision_Start.md`
3. `Packet/U-FLOW-13_PMDecision_SpecApproval.md`
4. `public/ai-business-os-flow-v1.4.json`
5. `Packet/U-FLOW-13_ReviewerReport_PhaseA_20260507_v3.md`

Implementation context:

- Existing app is a Next.js app.
- Runtime and artifact-save logic are currently concentrated in `app/page.tsx`.
- Styling is primarily in `app/globals.css`.
- Flow v1.4 currently defines Worker as an external role with manual handoff and `send_api_request: false`.

## 4. Pre-Read Declaration Requirement

Before reading any file, the Worker must output exactly this section:

```markdown
## Pre-Read Declaration

I will read only the following files:

- Packet/U-FLOW-13_WorkerPacket_PhaseA_20260507.md
- Packet/U-FLOW-13_Spec_PhaseA_20260507.md
- Packet/U-FLOW-13_PMDecision_Start.md
- Packet/U-FLOW-13_PMDecision_SpecApproval.md
- Packet/U-FLOW-13_ReviewerReport_PhaseA_20260507_v3.md
- public/ai-business-os-flow-v1.4.json
- package.json
- app/page.tsx
- app/globals.css

Reason: implement U-FLOW-13 Phase A Handoff Runtime within the approved scope.
```

If any other file is needed, stop and return:

```markdown
## Access Amendment Request

- Requested file:
- Reason:
- Risk if not approved:
```

Do not read the requested file until approval is granted.

## 5. Allowed Files

Read-only files:

- `Packet/U-FLOW-13_WorkerPacket_PhaseA_20260507.md`
- `Packet/U-FLOW-13_Spec_PhaseA_20260507.md`
- `Packet/U-FLOW-13_PMDecision_Start.md`
- `Packet/U-FLOW-13_PMDecision_SpecApproval.md`
- `Packet/U-FLOW-13_ReviewerReport_PhaseA_20260507_v3.md`
- `public/ai-business-os-flow-v1.4.json`
- `package.json`

Editable files:

- `app/page.tsx`
- `app/globals.css`

Do not modify:

- `public/ai-business-os-flow-v1.4.json`
- `app/api/ask-stream/route.ts`
- `package.json`
- Any file under `Packet/`
- Any generated lockfile or dependency metadata

## 6. Scope

Implement Phase A only.

In scope:

- Role-based execution environment routing.
- `execution_env` display and metadata.
- `requires_repo_access` display and metadata.
- Migration recommendation and reason display.
- PM override display/state for environment override.
- Policy-level PM override / policy exemption metadata in generated packets.
- Handoff Packet generation for Worker / VSCode external handoff.
- Applied policy checklist in generated packets.
- Allowed files display in generated packets.
- Pre-Read Declaration rule embedded in generated packets.
- Read Log requirement embedded in generated packets.
- Packet copy/export behavior if the current UI already supports copy/staging patterns.
- Integration with existing Flow Runtime state, current step, route context, role resolution, prompt generation, artifact save runtime, and external handoff behavior.

Out of scope:

- Full Phase B inbound validation.
- Automated Read Log verification.
- Full schema validation engine.
- Runtime trace persistence beyond existing UI/localStorage patterns.
- Git automation.
- CI/CD automation.
- Direct file writing from the browser to the repository.
- Automatic communication with VSCode Copilot or any external Worker API.

## 7. Required Runtime Semantics

### 7.1 execution_env

Add or derive an `execution_env` value for relevant steps:

- `api_chat`
- `vscode`
- `either`

Default routing:

| Role | Default execution_env | VSCode trigger |
| :--- | :--- | :--- |
| PM | `api_chat` | None |
| Designer | `api_chat` | None |
| Integrator-C | `api_chat` | None |
| Reviewer | `api_chat` | Code review involving multi-file diffs or dependency checks |
| Integrator-S | `api_chat` | Physical Packet generation requiring repository path resolution |
| Worker | `vscode` | Default |
| Debugger | `vscode` | Default |
| Infra | `vscode` | Default |

Step-level interpretation:

- `api_chat`: strategic, logical, orchestration, review, or PM-facing decision work.
- `vscode`: implementation, verification, debugging, infrastructure, or repository-dependent work.
- `either`: minor documentation or single-file logic updates.

### 7.2 requires_repo_access

`requires_repo_access` is true if any condition applies:

- Direct code editing is required.
- Multi-file dependency analysis is necessary.
- Build, test, or runtime error tracing is required.
- Input data size exceeds API Chat context limits.
- Repository search across non-attached files is required.
- Repository structure is required to create a reliable Worker Packet.

### 7.3 Migration Recommendation

Display advisory recommendations:

| Condition | Recommendation |
| :--- | :--- |
| Attachments < 10 files and total size < 100KB | API Chat Recommended |
| `requires_repo_access` is true or Role is Worker / Debugger / Infra | VSCode Recommended |
| Attachments > 20 files or total size > 500KB | VSCode Strongly Recommended |

This is advisory, not a hard gate. PM override may intentionally choose a different environment.

### 7.4 PM Override

Support at least UI/state representation for:

- Environment override: PM forces `execution_env`.
- Policy-level override: PM permits a policy exemption for a specific artifact or partner.

The generated Handoff Packet must show:

- `PM Override Active` when applicable.
- `Policy Exemptions: None` or explicit exemption text.

### 7.5 Handoff Packet Schema

Generated Handoff Packets must follow this envelope structure:

```markdown
# Handoff Packet [Unit-Step-ID]

## Envelope Metadata
- Target Role:
- Target Environment:
- Applied Policies:
- Policy Exemptions:
- Ambiguity Handling: "Return to PM via Handoff Return. Do not guess."

## Content (The Worker Packet)
- Mission:
- Scope:
- Prohibitions:
- Input Artifacts:
- Allowed Files:
- Expected Output:
- Output Schema:
- Return Method:

## Safety Protocols
- Pre-Read Declaration: REQUIRED before any file access.
- Read Log: REQUIRED in the final Output.
```

### 7.6 Read Log Requirement

The generated packet must require the Worker final output to include:

```markdown
## Read Log

| file_path | reason_for_reading | timestamp |
| :--- | :--- | :--- |
|  |  |  |
```

The packet must also state that the Read Log will be cross-checked against the Pre-Read Declaration during inbound processing.

### 7.7 Violation Fallback Display

Represent these fallback rules in generated packets or UI help text:

| Violation | Handling |
| :--- | :--- |
| Missing Pre-Read Declaration | Reject -> Rework |
| Reading undeclared files | Reject -> Rework |
| Missing or incomplete Read Log | Reject -> Request Correction or Re-Handoff |
| Output Schema violation | Reject -> Re-Handoff |
| Guessing ambiguity | Handoff Return to PM |
| Environment mismatch without PM override | Warning to PM |

## 8. Implementation Guidance

Prefer extending existing patterns in `app/page.tsx`.

Expected implementation areas may include:

- Type definitions near existing runtime and artifact types.
- Constants for role environment defaults, repo access triggers, policy IDs, and recommendation thresholds.
- Pure functions for environment resolution, repo-access determination, recommendation building, policy checklist rendering, and Handoff Packet generation.
- Runtime UI panel near the existing Flow Runtime / Prompt Runtime controls.
- Existing copy/stage behavior for generated prompt text.
- Existing `runtimeOutputsText` and saved artifact flow where it naturally fits.

Keep the implementation compact and conservative. Avoid broad refactors.

## 9. Prohibitions

- Do not modify Flow v1.4 JSON.
- Do not create an automated Worker API integration.
- Do not bypass human gates.
- Do not remove or weaken U-FLOW-11 or U-FLOW-12 behavior.
- Do not change role bindings.
- Do not delete existing artifact-save runtime logic.
- Do not infer missing PM decisions.
- Do not read undeclared files.
- Do not add new dependencies unless impossible to complete without them. If a dependency seems necessary, return an Access Amendment / Dependency Request instead.

## 10. Expected Output

Worker must return a report with:

- Summary of implementation.
- Files changed.
- Verification commands and results.
- Acceptance Criteria checklist.
- Known risks or limitations.
- Read Log with required fields.

## 11. Output Schema

Use this exact report structure:

```markdown
# U-FLOW-13 Worker Report

## Decision

PASS / CONDITIONAL / FAIL

## Summary

- 

## Changed Files

- 

## Implementation Details

- execution_env:
- requires_repo_access:
- migration recommendation:
- PM override:
- Handoff Packet generation:
- Pre-Read / Read Log:
- UI:

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| Role-based execution environment routing implemented | PASS/FAIL | |
| `execution_env` can be determined per Role/Step | PASS/FAIL | |
| `requires_repo_access` can be determined | PASS/FAIL | |
| Migration recommendation and reason are displayed | PASS/FAIL | |
| PM override is represented | PASS/FAIL | |
| Handoff Packet envelope is generated | PASS/FAIL | |
| Worker Packet content fields are complete | PASS/FAIL | |
| Applied policies are included | PASS/FAIL | |
| Policy exemptions are included | PASS/FAIL | |
| Allowed files are included | PASS/FAIL | |
| Pre-Read Declaration rule is included | PASS/FAIL | |
| Read Log requirement is included | PASS/FAIL | |
| Manual VSCode handoff remains manual | PASS/FAIL | |
| Existing U-FLOW-11/U-FLOW-12 behavior is preserved | PASS/FAIL | |

## Verification

- Command:
- Result:
- Notes:

## Read Log

| file_path | reason_for_reading | timestamp |
| :--- | :--- | :--- |
|  |  |  |

## Known Risks / Limitations

- 

## Handoff Return

Only include this section if clarification is required.
```

## 12. Verification Requirements

Run the strongest available local verification that does not require undeclared file reads or dependency installation.

Minimum:

- `npm run build`

If build cannot be run, explain why.

Recommended manual checks:

- Select a Worker external handoff step and confirm `Target Environment: vscode`.
- Confirm Worker / Debugger / Infra produce VSCode recommendations.
- Confirm PM / Designer / Integrator-C remain API Chat by default.
- Confirm Integrator-S can display API Chat for logical orchestration and VSCode when physical packet generation requires repo path resolution.
- Confirm generated Handoff Packet includes all mandatory envelope and Worker Packet fields.
- Confirm generated Handoff Packet includes Pre-Read Declaration and Read Log requirements.
- Confirm generated Handoff Packet includes `send_api_request: false` or equivalent manual-handoff indication.
- Confirm generated Handoff Packet can be copied or staged using existing UI patterns.

## 13. Acceptance Criteria

U-FLOW-13 Phase A is complete when:

1. The app can determine `execution_env` for a Role or current Step.
2. The app can determine `requires_repo_access`.
3. The app displays migration recommendation and reason.
4. The app can represent PM override for environment routing.
5. The app can represent policy exemptions.
6. The app generates a Handoff Packet envelope containing a Worker Packet.
7. Generated packets include Target Role, Target Environment, Applied Policies, Policy Exemptions, Ambiguity Handling, Mission, Scope, Prohibitions, Input Artifacts, Allowed Files, Expected Output, Output Schema, Return Method, and Safety Protocols.
8. Generated packets include Pre-Read Declaration rules.
9. Generated packets include Read Log requirements with `file_path`, `reason_for_reading`, and `timestamp`.
10. Existing Worker external handoff remains manual and does not send an API request.
11. Existing Artifact Save Runtime behavior remains intact.
12. Existing Flow Runtime state/route_context behavior remains intact.
13. Build or equivalent verification passes, or failure is reported with cause.

## 14. Return Method

Return the Worker Report by pasting it to chat or attaching it as a file.

Do not commit changes unless PM/Human explicitly requests it.

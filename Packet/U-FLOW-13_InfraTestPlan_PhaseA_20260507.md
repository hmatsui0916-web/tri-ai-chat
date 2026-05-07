# U-FLOW-13 Infra Test Plan Phase A

## 1. Decision Context

U-FLOW-13 Phase A has already passed Worker implementation review, Debugger code check, and build verification. This Infra test plan covers the remaining real-environment confirmation before Integrator-C may move the Unit to Verified.

Decision target:

- Unit: U-FLOW-13
- Phase: A
- Infra decision options: PASS / CONDITIONAL / FAIL
- Verified gate: Do not mark Verified until Infra + Human acceptance passes.

## 2. Test Objective

Confirm in the actual Next.js UI that Role Execution Routing and Handoff Runtime behave according to the approved U-FLOW-13 Phase A spec.

Primary objectives:

- Confirm role-based `execution_env` display.
- Confirm `requires_repo_access` and migration recommendation display.
- Confirm PM override can be represented and shown.
- Confirm manual VSCode handoff packet generation.
- Confirm generated packet contains all mandatory fields, Pre-Read rules, and Read Log requirements.
- Confirm U-FLOW-11 and U-FLOW-12 runtime behavior remains intact.

## 3. Source Artifacts

Read and use the following artifacts as test basis:

- `Packet/U-FLOW-13 Infra＋Human Test Instruction.md`
- `Packet/U-FLOW-13_Spec_PhaseA_20260507.md`
- `Packet/U-FLOW-13_PMDecision_Start.md`
- `Packet/U-FLOW-13_PMDecision_SpecApproval.md`
- `Packet/U-FLOW-13_WorkerPacket_PhaseA_20260507.md`
- `Packet/U-FLOW-13_ReviewerReport_WorkerPacket_20260507.md`
- `Packet/U-FLOW-13_DebuggerReport_PhaseA_20260507.md`
- `public/ai-business-os-flow-v1.4.json`
- `app/page.tsx`
- `app/globals.css`
- `package.json`

## 4. Test Environment

Record actual values before testing:

| Item | Value |
| :--- | :--- |
| OS | |
| Browser | |
| Node version | |
| npm version | |
| Branch | |
| Commit | |
| Test date/time | |
| Tester | Infra |

## 5. Entry Criteria

Testing may start only if:

- Repository is available locally.
- Dependencies are already installed or can be installed by Human approval.
- `npm run build` can be executed, or failure reason can be recorded.
- Browser access to the local dev server is available.
- No known blocking implementation issue is open for U-FLOW-13 Phase A.

## 6. Commands

Run these commands from the repository root.

| Step | Command | Expected Result | Record |
| :--- | :--- | :--- | :--- |
| C1 | `node -v` | Version is printed | PASS / FAIL |
| C2 | `npm -v` | Version is printed | PASS / FAIL |
| C3 | `git branch --show-current` | Branch is printed | PASS / FAIL |
| C4 | `git rev-parse --short HEAD` | Commit hash is printed | PASS / FAIL |
| C5 | `npm run build` | Build completes without errors | PASS / FAIL |
| C6 | `npm run dev` | Next.js dev server starts | PASS / FAIL |

If `npm run dev` selects a port other than 3000, record the actual local URL.

## 7. Manual UI Test Matrix

### T1. App Launch

Steps:

1. Open the dev server URL in a browser.
2. Confirm the main app loads without a fatal runtime error.
3. Confirm Flow Runtime state information is visible.

Expected:

- Page renders successfully.
- Current state, current route context, current step, and next step information are visible.

Result: PASS / FAIL

### T2. Role Execution Routing Defaults

Steps:

1. Locate the Role Execution Routing / U-FLOW-13 runtime area.
2. Check each target role or select equivalent steps that resolve each role.
3. Record displayed `execution_env`.

Expected:

| Role | Expected `execution_env` |
| :--- | :--- |
| PM | `api_chat` |
| Designer | `api_chat` |
| Integrator-C | `api_chat` |
| Reviewer | `api_chat` by default |
| Integrator-S | `api_chat` by default, `vscode` when physical repo-dependent packet generation is selected |
| Worker | `vscode` |
| Debugger | `vscode` |
| Infra | `vscode` |

Result: PASS / FAIL

### T3. Migration Recommendation Display

Steps:

1. Observe recommendation text for a low-complexity API Chat role.
2. Observe recommendation text for Worker, Debugger, and Infra.
3. Observe recommendation text when high attachment thresholds are represented, if the UI allows threshold editing or simulation.

Expected:

- `API Chat Recommended` appears when attachments are under 10 files and under 100KB.
- `VSCode Recommended` appears when `requires_repo_access` is true or role is Worker / Debugger / Infra.
- `VSCode Strongly Recommended` appears when attachments exceed 20 files or 500KB.

Result: PASS / FAIL

### T4. Migration Reason Display

Steps:

1. For each recommendation in T3, check the visible reason text.
2. Confirm at least one concrete reason is shown.

Expected reasons include one or more of:

- Role defaults to VSCode execution.
- `requires_repo_access` is true.
- Attachment or file-size threshold exceeded.
- PM override forced a different environment.

Result: PASS / FAIL

### T5. Repo Access Detection Observation

Steps:

1. Select or create a step description that clearly implies repository access, if the UI allows free-text step simulation.
2. Include keywords such as `grep`, `find`, `search`, or `repository search`.
3. Observe `requires_repo_access` and recommendation reason.

Expected:

- Repository search across non-attached files is reasonably detected as requiring repo access.
- If the UI does not provide a way to simulate the text, record this as `NOT TESTABLE IN UI` rather than FAIL.

Result: PASS / FAIL / NOT TESTABLE

### T6. PM Override

Steps:

1. Enable the PM override control for `execution_env`.
2. Force an environment that differs from the default or recommendation.
3. Observe the runtime panel and generated packet.

Expected:

- `PM Override Active` is displayed when active.
- Recommendation reason mentions override behavior.
- Generated packet includes override status or policy exemption metadata.

Result: PASS / FAIL

### T7. Policy Exemption Metadata

Steps:

1. Enter a policy exemption text if the UI provides an editable exemption field.
2. Generate a handoff packet.
3. Inspect the packet metadata.

Expected:

- `Policy Exemptions: None` is present when no exemption exists.
- Explicit exemption text is present when entered.

Result: PASS / FAIL

### T8. Handoff Packet Generation

Steps:

1. Select a Worker or VSCode handoff target.
2. Generate the handoff packet.
3. Open or expand `Generated Handoff Packet`.
4. Use copy or staging behavior if available.

Expected:

- Handoff packet is generated as Markdown.
- Copy action works.
- Artifact staging action works if available.
- Packet remains a manual handoff artifact.

Result: PASS / FAIL

### T9. Mandatory Handoff Packet Fields

Inspect the generated packet and confirm all fields exist.

Expected mandatory fields:

| Field | Expected |
| :--- | :--- |
| Target Role | Present |
| Target Environment | Present |
| Applied Policies | Present |
| Policy Exemptions | Present |
| Ambiguity Handling | Present |
| Mission | Present |
| Scope | Present |
| Prohibitions | Present |
| Input Artifacts | Present |
| Allowed Files | Present |
| Expected Output | Present |
| Output Schema | Present |
| Return Method | Present |
| Safety Protocols | Present |

Result: PASS / FAIL

### T10. Pre-Read Declaration Requirement

Inspect the generated packet.

Expected:

- Packet states that Pre-Read Declaration is required before any file access.
- Packet contains a concrete Pre-Read Declaration section or template.
- Packet includes Access Amendment Request handling.

Result: PASS / FAIL

### T11. Read Log Requirement

Inspect the generated packet.

Expected:

- Packet states that Read Log is required in final output.
- Packet includes a Read Log table or template.
- Required fields are present:
  - `file_path`
  - `reason_for_reading`
  - `timestamp`
- Packet states Read Log will be cross-checked against Pre-Read Declaration during inbound processing.

Result: PASS / FAIL

### T12. Manual VSCode Handoff

Steps:

1. Generate a Worker / VSCode handoff packet.
2. Observe the UI and browser network behavior if practical.
3. Confirm no automatic send to VSCode, Copilot, or external Worker occurs.

Expected:

- Packet indicates manual handoff.
- Packet includes `send_api_request: false` or equivalent wording.
- No automatic API request is sent to VSCode / Copilot / external Worker.

Result: PASS / FAIL

### T13. Route Context Fallback Observation

Steps:

1. Test handoff packet generation from a main-flow step.
2. Inspect packet `Route Context`.
3. Compare displayed Flow Runtime route context with the generated packet route context.

Expected:

- Main-flow packets should not incorrectly show `feedback_specification` when current route context is `main` or another actual runtime value.
- If mismatch occurs, record exact current step, runtime route context, generated packet route context, and whether normal operation is blocked.

Result: PASS / FAIL

### T14. U-FLOW-11 / U-FLOW-12 Regression

Steps:

1. Confirm Flow Runtime state display remains intact.
2. Confirm `route_context` handling remains functional.
3. Confirm `current_step` and `next_step` display remains functional.
4. Stage or save an artifact through U-FLOW-12 Artifact Save Runtime.
5. Confirm saved artifact appears in saved artifact history or equivalent UI.

Expected:

- U-FLOW-11 behavior is not visibly broken.
- U-FLOW-12 Artifact Save Runtime still supports staging and save flow.
- Runtime state and route context displays remain coherent.

Result: PASS / FAIL

### T15. UI Readability

Steps:

1. Inspect U-FLOW-13 runtime panel and generated packet display on desktop width.
2. Resize browser to a narrower width if practical.

Expected:

- U-FLOW-13-specific UI is readable and usable.
- No blocking CSS issue prevents operation.
- Lack of U-FLOW-13-specific `globals.css` additions is acceptable if the UI remains functional.

Result: PASS / FAIL

## 8. Acceptance Criteria Summary

Infra may return PASS only if all required criteria below pass.

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| App starts successfully | PASS / FAIL | |
| Build succeeds | PASS / FAIL | |
| Dev server launches | PASS / FAIL | |
| Role `execution_env` display is correct | PASS / FAIL | |
| Worker / Debugger / Infra recommend VSCode | PASS / FAIL | |
| PM / Designer / Integrator-C remain API Chat by default | PASS / FAIL | |
| Migration reason is visible | PASS / FAIL | |
| PM Override is visible when active | PASS / FAIL | |
| Handoff Packet can be generated | PASS / FAIL | |
| Handoff Packet includes all mandatory fields | PASS / FAIL | |
| Pre-Read Declaration requirement is included | PASS / FAIL | |
| Read Log requirement with 3 fields is included | PASS / FAIL | |
| Manual handoff is preserved | PASS / FAIL | |
| No automatic VSCode/API send occurs | PASS / FAIL | |
| U-FLOW-11/U-FLOW-12 behavior is not broken | PASS / FAIL | |
| Route Context fallback issue does not block normal operation | PASS / FAIL | |

## 9. Blocking Issue Rules

Classify as blocking if any of the following occur:

- App cannot build and the failure is not an environment-only issue.
- App cannot launch in browser.
- Worker / Debugger / Infra do not route or recommend VSCode.
- PM / Designer / Integrator-C are incorrectly forced to VSCode by default.
- Handoff Packet cannot be generated.
- Generated packet lacks mandatory fields from the approved schema.
- Pre-Read Declaration or Read Log requirement is missing.
- Manual handoff is broken by automatic external sending.
- U-FLOW-11 or U-FLOW-12 core runtime behavior is broken.

Classify as non-blocking observation if:

- Repo search keyword detection is incomplete but Worker / Debugger / Infra role routing still protects normal Phase A use.
- `Handoff Return` is understandable even if conditionally included.
- Route Context fallback mismatch appears but does not block normal operation.
- CSS is imperfect but readable and functional.

## 10. Required Infra Output

Return this report to Integrator-C after execution.

```markdown
# U-FLOW-13 Infra + Human Test Report

## Decision

PASS / CONDITIONAL / FAIL

## Test Environment

- OS:
- Browser:
- Node version:
- npm version:
- App branch:
- App commit:
- Test date/time:

## Commands Run

| Command | Result | Notes |
| :--- | :--- | :--- |
| node -v | PASS / FAIL | |
| npm -v | PASS / FAIL | |
| git branch --show-current | PASS / FAIL | |
| git rev-parse --short HEAD | PASS / FAIL | |
| npm run build | PASS / FAIL | |
| npm run dev | PASS / FAIL | |

## Manual Test Results

| Test Item | Result | Notes |
| :--- | :--- | :--- |
| App launch | PASS / FAIL | |
| Role execution_env display | PASS / FAIL | |
| Migration recommendation display | PASS / FAIL | |
| Migration reason display | PASS / FAIL | |
| Repo access detection observation | PASS / FAIL / NOT TESTABLE | |
| PM Override display | PASS / FAIL | |
| Policy exemption metadata | PASS / FAIL | |
| Handoff Packet generation | PASS / FAIL | |
| Mandatory packet fields | PASS / FAIL | |
| Pre-Read Declaration requirement | PASS / FAIL | |
| Read Log requirement | PASS / FAIL | |
| Manual handoff only | PASS / FAIL | |
| No automatic external send | PASS / FAIL | |
| Route Context fallback observation | PASS / FAIL | |
| U-FLOW-11/U-FLOW-12 regression | PASS / FAIL | |
| UI readability | PASS / FAIL | |

## Findings

-

## Blocking Issues

- None

## Non-Blocking Observations

-

## Recommendation to Integrator-C

Proceed to Verified / Rework / Conditional follow-up
```

## 11. Final Recommendation Logic

Use the following decision rules:

- PASS: All required acceptance criteria pass, with no blocking issues.
- CONDITIONAL: Core behavior passes, but one or more non-blocking observations require Phase B or follow-up tracking.
- FAIL: Any blocking issue is found.

If PASS is returned with no blocking issues, Integrator-C may proceed to Verified judgment for U-FLOW-13 Phase A.

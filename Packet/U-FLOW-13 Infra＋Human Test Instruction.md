# U-FLOW-13 Infra＋Human Test Instruction

## Japanese Summary

U-FLOW-13 Phase A は、Worker実装およびDebuggerコードチェックでは PASS です。
ただし、Infra＋Humanによる実機テストは未実施のため、まだ Verified には進めません。

本テストでは、実装された Role Execution Routing / Handoff Runtime が実ブラウザ上で仕様どおり動作するかを確認してください。

## 1. Unit

U-FLOW-13 Phase A

## 2. Current Status

* Worker Implementation: PASS
* Debugger Code Check: PASS
* Build Verification: PASS
* Blocking Items: None
* Infra＋Human Test: Not yet executed
* Verified Gate: Not allowed until Infra＋Human PASS

## 3. Integrator-C Decision

CONDITIONAL PASS

The implementation may proceed to Infra＋Human real-environment testing.

Do not mark this Unit as Verified until Infra＋Human acceptance passes.

## 4. Test Target

Existing Next.js app:

* `tri-ai-chat-flow-ui`
* Primary implementation file: `app/page.tsx`
* Related style file: `app/globals.css`

## 5. Required Test Scope

Confirm that U-FLOW-13 Phase A behavior works in the actual UI.

### 5.1 Role Execution Routing

Confirm default execution environment:

| Role         | Expected                                                                    |
| ------------ | --------------------------------------------------------------------------- |
| PM           | api_chat                                                                    |
| Designer     | api_chat                                                                    |
| Integrator-C | api_chat                                                                    |
| Reviewer     | api_chat by default                                                         |
| Integrator-S | api_chat by default / vscode when physical repo-dependent packet generation |
| Worker       | vscode                                                                      |
| Debugger     | vscode                                                                      |
| Infra        | vscode                                                                      |

### 5.2 Migration Recommendation

Confirm that the UI displays:

* API Chat Recommended
* VSCode Recommended
* VSCode Strongly Recommended

Also confirm that a migration reason is visible, such as:

* Role requires VSCode
* requires_repo_access is true
* attachment/file threshold exceeded

### 5.3 PM Override

Confirm:

* PM override can be represented in UI/state
* `PM Override Active` is displayed when active
* Generated packet reflects override status or policy exemption metadata

### 5.4 Handoff Packet Generation

Generate a Worker / VSCode handoff packet and confirm it includes:

* Target Role
* Target Environment
* Applied Policies
* Policy Exemptions
* Ambiguity Handling
* Mission
* Scope
* Prohibitions
* Input Artifacts
* Allowed Files
* Expected Output
* Output Schema
* Return Method
* Safety Protocols

### 5.5 Pre-Read / Read Log

Confirm generated packet includes:

* Pre-Read Declaration requirement
* Access Amendment Request handling
* Read Log requirement
* Required Read Log fields:

  * `file_path`
  * `reason_for_reading`
  * `timestamp`

### 5.6 Manual VSCode Handoff

Confirm:

* Handoff remains manual
* No automatic API request is sent to VSCode / Copilot / external Worker
* Packet can be copied, staged, or exported by Human

### 5.7 Regression Check

Confirm existing behavior remains intact:

* U-FLOW-11 behavior
* U-FLOW-12 Artifact Save Runtime
* Flow Runtime state display
* route_context handling
* current_step / next_step display
* artifact staging / save flow

## 6. Special Observation Items

Debugger identified the following non-blocking observations. Please observe them during real-environment testing.

### d-1. repo search keyword detection

Check whether steps requiring repository search across non-attached files are reasonably detected as requiring repo access.

Especially watch for keywords such as:

* grep
* find
* search
* repository search

### d-2. Handoff Return section

Check whether the generated Worker output schema is still understandable even if `Handoff Return` is only conditionally included.

This is non-blocking unless Worker output becomes ambiguous.

### d-3. Route Context fallback

Important observation.

Check whether generated packets for main-flow steps incorrectly show:

`feedback_specification`

when the current route_context should be `main` or another actual runtime value.

If this occurs, report it as a real-environment issue.

### d-4. CSS

No U-FLOW-13-specific CSS was added to `globals.css`.
This is acceptable if UI display is readable and functional.

## 7. Acceptance Criteria for Infra＋Human PASS

Mark PASS only if all of the following are satisfied:

| Criterion                                                    | Result      |
| ------------------------------------------------------------ | ----------- |
| App starts successfully                                      | PASS / FAIL |
| Build or runtime launch succeeds                             | PASS / FAIL |
| Role execution_env is displayed correctly                    | PASS / FAIL |
| Worker / Debugger / Infra recommend VSCode                   | PASS / FAIL |
| PM / Designer / Integrator-C remain API Chat by default      | PASS / FAIL |
| Migration reason is visible                                  | PASS / FAIL |
| PM Override is visible when active                           | PASS / FAIL |
| Handoff Packet can be generated                              | PASS / FAIL |
| Handoff Packet includes all mandatory fields                 | PASS / FAIL |
| Pre-Read Declaration requirement is included                 | PASS / FAIL |
| Read Log requirement with 3 fields is included               | PASS / FAIL |
| Manual handoff is preserved                                  | PASS / FAIL |
| No automatic VSCode/API send occurs                          | PASS / FAIL |
| U-FLOW-11/U-FLOW-12 behavior is not broken                   | PASS / FAIL |
| Route Context fallback issue does not block normal operation | PASS / FAIL |

## 8. Required Infra＋Human Output

Return the following report to Integrator-C.

# U-FLOW-13 Infra＋Human Test Report

## Decision

PASS / CONDITIONAL / FAIL

## Test Environment

* OS:
* Browser:
* Node version:
* npm version:
* App branch / commit if available:

## Commands Run

| Command       | Result      | Notes |
| ------------- | ----------- | ----- |
| npm run build | PASS / FAIL |       |
| npm run dev   | PASS / FAIL |       |

## Manual Test Results

| Test Item                          | Result      | Notes |
| ---------------------------------- | ----------- | ----- |
| Role execution_env display         | PASS / FAIL |       |
| Migration recommendation display   | PASS / FAIL |       |
| Migration reason display           | PASS / FAIL |       |
| PM Override display                | PASS / FAIL |       |
| Handoff Packet generation          | PASS / FAIL |       |
| Mandatory packet fields            | PASS / FAIL |       |
| Pre-Read Declaration requirement   | PASS / FAIL |       |
| Read Log requirement               | PASS / FAIL |       |
| Manual handoff only                | PASS / FAIL |       |
| U-FLOW-11/U-FLOW-12 regression     | PASS / FAIL |       |
| Route Context fallback observation | PASS / FAIL |       |

## Findings

*

## Blocking Issues

* None / list issues

## Non-Blocking Observations

*

## Recommendation to Integrator-C

Proceed to Verified / Rework / Conditional follow-up

## 9. Integrator-C Note

If Infra＋Human returns PASS with no blocking issues, U-FLOW-13 Phase A may proceed to Verified judgment.

If any blocking issue is found, return to Integrator-C for cause classification:

* implementation
* specification
* environment

# U-FLOW-13_DesignerInstruction.md

# U-FLOW-13 Designer Instruction

## 1. Role

Designer

## 2. Unit ID

U-FLOW-13

## 3. Scope

Role Execution Routing / Handoff Runtime
Phase A: API Chat → VSCode / External Role

## 4. Mission

Design the Phase A specification for U-FLOW-13.

This Unit defines the Runtime mechanism that determines the execution environment per Role or Step and safely generates Handoff Packets for either API Chat execution or VSCode / External Role execution.

The design must preserve the AI Business OS principles of Role separation, explicit Input control, Output schema discipline, and context pollution prevention.

U-FLOW-13 must not be framed as a “main platform switch.”
It must be framed as **Role-based execution environment routing**.

## 5. Background

By U-FLOW-12, the Flow Runtime has reached a Human-in-the-loop MVP-operable state.

The Runtime can currently receive Role Outputs, extract and save Artifacts, propose storage destinations, link saved Artifacts to current_step, and reference them as Inputs for next steps.

However, as the development target grows, API Chat attachment and Input handling may become impractical due to file size, repository complexity, dependency analysis, or runtime verification requirements.

At the same time, moving everything to VSCode from the beginning would weaken the AI Business OS principles of strict Role separation, minimal Input exposure, and context pollution prevention.

Therefore, U-FLOW-13 must design a controlled Handoff mechanism that keeps API Chat as the primary orchestration environment while allowing VSCode / External Role execution when Role characteristics or Input requirements justify it.

## 6. Provided PM Decision

The PM decision is as follows.

* Adopt A3: Continue API Chat-centered operation and conditionally route to VSCode when needed.
* Treat this as Role-based execution environment routing, not as a main platform switch.
* Migration recommendation is advisory, not mandatory.
* PM override must be a formal route.
* Context pollution prevention rules must be embedded into generated Handoff Packets.
* Outputs from VSCode / External Roles must be returned and registered as Artifacts in API Chat.
* U-FLOW-13 Phase A should prioritize outbound Handoff generation.
* Phase B will later handle inbound return processing and validation.

## 7. Language and Global Policy

U-FLOW-13 Phase A must include a minimal **Global Policy Injection** mechanism.

The Prompt Builder / Handoff Packet Builder must apply common policies automatically without requiring the user to manually paste the policy into every instruction.

At minimum, the following Common Language Policy must be supported.

### 7.1 Common Language Policy

* AI-to-AI artifacts MUST be written in English.
* This includes Role I/O Schema, Handoff Packet, Worker Packet, Role Output, Runtime schema fields, logs, file names, and code-related artifacts.
* PM-facing decisions, Human approval text, and strategic discussion MAY be written in Japanese.
* English artifacts that require PM judgment SHOULD include a concise Japanese summary.
* Existing artifacts before U-FLOW-13 do not require retroactive translation.

### 7.2 Global Policy Injection Design Target

Designer must define:

* Where common policies are stored.
* How Prompt Builder / Handoff Packet Builder reads common policies.
* How policies are applied by Role, Step, and Artifact type.
* How the policy appears in generated Handoff Packets.
* How PM override works when a policy needs to be bypassed.
* How this mechanism can later support policies other than Language Policy.

### 7.3 Translation Boundary

Designer must also define the translation boundary between PM-facing Japanese and AI-to-AI English.

The recommended model is:

* PM may write decisions and strategic instructions in Japanese.
* Prompt Builder / Handoff Packet Builder converts downstream AI-to-AI instructions into English when generating Handoff Packets.
* English artifacts requiring PM judgment should include a concise Japanese summary.
* Integrator-S may be responsible for logical-to-physical Packet conversion where detailed Worker Packet construction is needed.

Designer may refine this model, but must explicitly define where Japanese-to-English conversion occurs.

## 8. Required Design Targets

Designer must design the following.

### 8.1 execution_env Decision Design

Define how Runtime determines one of the following execution environments per Role or Step.

* api_chat
* vscode
* either

The decision must consider at least:

* Role type
* Step type
* requires_repo_access
* Attachment size
* Number of referenced Artifacts
* Number of referenced files
* Need for repository-wide reference
* Need for build / test / runtime verification

### 8.2 requires_repo_access Decision Design

Define when requires_repo_access should be true.

At minimum, cover cases such as:

* Direct code editing is required.
* Multi-file dependency analysis is required.
* grep, diff, or repository search is required.
* Build or test execution is required.
* Runtime error tracing is required.
* Repository structure is required to create a reliable Worker Packet.

### 8.3 Migration Recommendation Design

Define how Runtime displays one of the following recommendations.

* API Chat recommended
* VSCode recommended
* Either acceptable
* PM confirmation recommended

The recommendation must be advisory, not mandatory.

PM override must be allowed and must be visible in the Runtime behavior.

### 8.4 Handoff Packet Design

Design the structure of Handoff Packets for VSCode / External Roles.

The Packet must include at least:

* Unit ID
* Target Role
* Step ID
* Mission
* Scope
* Input Artifact list
* Allowed file list
* Prohibitions
* Applied Global Policies
* Pre-Read Declaration rule
* Read Log requirement
* Expected Output
* Output Schema
* Return Method
* Ambiguity Handling
* PM override information, if any

### 8.5 Pre-Read Declaration Design

Design the rule requiring VSCode / External Roles to declare files before reading them.

Define:

* Declaration format
* Declaration target
* How undeclared file access is handled
* How additional file access requests are handled after the initial declaration

### 8.6 Read Log Design

Design the rule requiring VSCode / External Roles to record the files they actually read.

Define:

* Read Log format
* Required fields
* Comparison rules against Pre-Read Declaration
* Handling when Read Log is missing or incomplete

### 8.7 Violation Fallback Design

Define fallback behavior for at least the following violations.

| Violation                                      | Handling                          |
| ---------------------------------------------- | --------------------------------- |
| Missing Pre-Read Declaration                   | Reject → Rework                   |
| Reading undeclared files                       | Reject → Rework                   |
| Missing Read Log                               | Reject → Re-Handoff               |
| Output Schema violation                        | Reject → Re-Handoff               |
| Continuing by guessing ambiguous points        | Return → Handoff Return           |
| Choosing an environment against recommendation | Warning only; PM override allowed |

### 8.8 UI Requirements

Design the Phase A UI requirements.

Candidate UI elements:

* Execution environment recommendation for current_step
* Role-specific Handoff Packet generation button
* Packet preview
* Packet copy
* Packet export
* PM override control
* Migration reason display
* Required Artifacts display
* Allowed files display
* Applied Global Policies display
* Warning display for override or missing routing conditions

### 8.9 Phase A / Phase B Boundary

Define what Phase A must provide so that Phase B can later handle returns from VSCode / External Roles.

At minimum, define:

* Return Method assumptions
* Expected return Artifact format
* Required Read Log presence
* Minimal Output Schema expectation
* Conditions that should trigger Phase B design or implementation

Designer does not need to fully design Phase B, but must define enough boundary conditions to avoid rework.

## 9. Out of Scope

Designer must not expand the design into the following areas.

* Full automation of VSCode-side AI operation
* Automatic API Chat ↔ VSCode integration
* Automatic Git operations
* Full Runtime Log / Trace implementation
* Full Review Gate Extension implementation
* Full Output Schema Validation implementation
* Detailed Phase B implementation
* Unrestricted repository access
* Full retroactive translation of pre-U-FLOW-13 Artifacts

Minimal schema assumptions needed for safe handoff and future Phase B connection may be defined.

## 10. Expected Output

Create the following output.

File:

U-FLOW-13_Spec_PhaseA_[timestamp].md

Output Type:

Spec

Required Sections:

1. Overview
2. Background
3. Goals
4. Non-Goals
5. Role Execution Routing Design
6. execution_env Definition
7. requires_repo_access Definition
8. Migration Recommendation Logic
9. PM Override Policy
10. Handoff Packet Schema
11. Global Policy Injection Mechanism
12. Language Policy Application
13. Translation Boundary
14. Pre-Read Declaration Design
15. Read Log Design
16. Violation Fallback Design
17. UI Requirements
18. Data Model Impact
19. Runtime Flow
20. Phase A / Phase B Boundary
21. Acceptance Criteria
22. Risks
23. Open Questions

## 11. Acceptance Criteria for Designer Output

Designer Output must satisfy the following.

* The design is framed as Role-based execution environment routing, not as a main platform switch.
* execution_env values and decision conditions are defined.
* requires_repo_access conditions are defined.
* Migration Recommendation is defined as advisory, not mandatory.
* PM override is defined as a formal route.
* Handoff Packet Schema is defined.
* Common Policy storage location is defined.
* Global Policy injection method is defined.
* Common Language Policy application is defined by Role, Step, or Artifact type.
* Handoff Packet includes applied Global Policies.
* Policy-level PM override is defined.
* Translation boundary between PM-facing Japanese and AI-to-AI English is defined.
* Pre-Read Declaration rule is defined.
* Read Log requirement is defined.
* Violation fallback behavior is defined.
* Phase A UI requirements are defined.
* Phase A / Phase B boundary is defined.
* The design avoids scope expansion into full Output Schema Validation, full Runtime Log / Trace, or full Review Gate Extension.

## 12. Prohibitions

* Do not assume full migration to VSCode.
* Do not assume all Roles execute in VSCode.
* Do not allow unrestricted repository access.
* Do not prohibit PM override.
* Do not make Migration Gate an absolute hard rule.
* Do not allow ambiguous points to be resolved by guessing.
* Do not expand scope into full Output Schema Validation.
* Do not expand scope into full Runtime Log / Trace.
* Do not expand scope into full Review Gate Extension.
* Do not require retroactive translation of pre-U-FLOW-13 Artifacts.
* Do not treat Global Policy Injection as a Language Policy-only one-off mechanism.

## 13. Return Instruction

Create `U-FLOW-13_Spec_PhaseA_[timestamp].md` based on this instruction and return it to PM.

The output should be written in English as an AI-to-AI artifact.
If PM judgment is required, include a concise Japanese summary at the top or bottom.

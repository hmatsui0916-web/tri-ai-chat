# Japanese Summary (PM向け要約)

**再レビュー（Conditional）への対応：修正完了 (U-FLOW-13 Spec Phase A v3)**

Reviewerより指摘のあった「v2での記述簡略化に伴う回帰（デグレード）」をすべて解消し、推奨事項（データモデルの拡充等）も反映した最終版スペックを作成しました。

* **パケット定義の完全復旧**: Handoff Packet内のWorker Packet要素（禁止事項、期待される出力、リターン方法、ターゲットロール等）をすべて再定義しました。
* **ログ・違反定義の厳格化**: Read Logの必須3フィールド（path, reason, timestamp）の定義を復旧し、PM Decisionと整合する違反フォールバック表を再構成しました。
* **データモデルとフローの具体化**: 状態遷移（Integrated → InDev 等）や、追加されたメタデータフィールド（`applied_policies` 等）を追記し、実装フェーズへの移行準備を整えました。
* **ドキュメントのクリーンアップ**: 不要な引用マーカーを削除しました。

本修正をもって、ReviewerのBlocking条件をすべて満たした状態となります。

---

# U-FLOW-13_Spec_PhaseA_20260507_v3.md

## 1. Overview
This specification defines the **Role Execution Routing** and **Handoff Runtime** for the AI Business OS. It establishes a mechanism to route tasks between `api_chat` and `vscode` environments based on Role characteristics, input complexity, and repository access requirements.

## 2. Background
To prevent context pollution while allowing for high-complexity development, the system transitions from manual attachment management to a structured Handoff mechanism. This ensures that VSCode-side execution remains under the strict control of the Flow Runtime principles.

## 3. Goals
* Implement deterministic routing logic for `execution_env`.
* Standardize the **Handoff Packet** as a container for Worker Packets.
* Ensure 100% traceability of file access via Pre-Read and Read Log protocols.
* Preserve Role separation and policy adherence across execution environments.

## 4. Non-Goals
* Direct automated modification of local files by the Flow Runtime.
* Full automation of the Git workflow or CI/CD pipelines.

## 5. Role Execution Routing Design
Roles are assigned default environments, with specific triggers for environment switching.

| Role | Default Env | VSCode Trigger |
| :--- | :--- | :--- |
| PM / Designer / Integrator-C | `api_chat` | None (Always Chat-centered). |
| Reviewer | `api_chat` | **Code Review tasks** involving multi-file diffs or dependency checks. |
| Integrator-S | `api_chat` | Physical Packet generation requiring repository path resolution. |
| Worker / Debugger / Infra | `vscode` | Default (Requires repository access/environment execution). |

## 6. execution_env Definition
The environment is determined per Step:
* **`api_chat`**: Strategic, logical, or orchestration steps.
* **`vscode`**: Implementation, verification, or infrastructure steps.
* **`either`**: Minor documentation or single-file logic updates.

## 7. requires_repo_access Definition
`requires_repo_access` is **TRUE** if any of the following conditions are met:
* Direct code editing is required.
* Multi-file dependency analysis is necessary.
* Build, test, or runtime error tracing is required.
* Input data size exceeds API Chat context limits.
* Repository search (grep/find) across non-attached files is required.

## 8. Migration Recommendation Logic
The Runtime provides advisory recommendations based on complexity thresholds:

| Condition | Recommendation |
| :--- | :--- |
| Attachments < 10 files AND Total Size < 100KB | **API Chat Recommended**. |
| `requires_repo_access` = TRUE OR Role = Worker/Debugger/Infra | **VSCode Recommended**. |
| Attachments > 20 files OR Total Size > 500KB | **VSCode Strongly Recommended**. |

## 9. PM Override Policy
### 9.1 Environment Override
PM may force a change in `execution_env`. The UI will display "PM Override Active" to flag the deviation from system recommendations.

### 9.2 Policy-Level Override
PM may authorize bypass of Global Policies (e.g., allowing Japanese for a specific external partner/artifact). This must be explicitly recorded as a `Policy_Exemption` in the Handoff Packet.

## 10. Handoff Packet Schema
The **Handoff Packet** acts as an **Envelope** for the **Worker Packet**.

```markdown
# Handoff Packet [Unit-Step-ID]

## Envelope Metadata
- Target Role: [Role Name]
- Target Environment: [vscode/external]
- Applied Policies: [Language: English, Security, etc.]
- Policy Exemptions: [None / Specific Exemption]
- Ambiguity Handling: "Return to PM via Handoff Return. Do not guess."

## Content (The Worker Packet)
- Mission: [Specific task description]
- Scope: [Boundary of execution]
- Prohibitions: [Explicit No-Go items and constraints]
- Input Artifacts: [List of attached artifacts/IDs]
- Allowed Files: [Specific file paths in repository]
- Expected Output: [Description of result]
- Output Schema: [Schema ID or Markdown template]
- Return Method: [Paste to Chat / File Attach]

## Safety Protocols
- Pre-Read Declaration: REQUIRED before any file access.
- Read Log: REQUIRED in the final Output.
```

## 11. Global Policy Injection Mechanism
Policies are stored in `system/policy/global_policy.json` and injected based on:
* **Role**: e.g., Worker/Reviewer policies.
* **Step Type**: e.g., implementation vs. design.
* **Artifact Type**: e.g., Code (strict) vs. Doc (flexible).

## 12. Language Policy Application
AI-to-AI interactions must be in English. For any artifact intended for PM approval, the AI must provide a concise Japanese summary accompanying the English content.

## 13. Translation Boundary
The transition from PM-facing Japanese logic to AI-facing English implementation occurs during **Handoff Packet generation** (usually performed by Integrator-S or Designer).

## 14. Pre-Read & Additional Access Design
### 14.1 Initial Declaration
The Role must declare: "Pre-Read Declaration: [List of Paths]".

### 14.2 Access Amendment Request
If a Role discovers a hidden dependency during execution:
1. Role issues an **"Access Amendment Request"**.
2. PM/Human approves or rejects the request.
3. Role proceeds only after approval. Unapproved access is a violation.

## 15. Read Log Design
The Role must provide a Read Log in the final output to maintain an audit trail.
* **Required Fields**: `file_path`, `reason_for_reading`, `timestamp`.
* **Validation**: The Read Log must be cross-checked against the Pre-Read Declaration during the Inbound phase.

## 16. Violation Fallback Design

| Violation | Handling |
| :--- | :--- |
| Missing Pre-Read Declaration | **Reject** -> Rework (Return to start of Step). |
| Reading Undeclared Files | **Reject** -> Rework (Strict violation). |
| Missing or Incomplete Read Log | **Reject** -> Request Correction or Re-Handoff. |
| Output Schema Violation | **Reject** -> Re-Handoff. |
| Guessing Ambiguity | **Handoff Return** to PM (Clarification required). |
| Environment Mismatch (No Override) | **Warning** to PM. |

## 17. UI Requirements
* **Migration Reason Display**: Explains the logic (e.g., "Role: Worker implies VSCode").
* **Allowed Files Display**: Explicit list of repository paths permitted.
* **Packet Export**: Copy-to-clipboard or Markdown download.
* **Policy Checklist**: Show which Global Policies were injected.

## 18. Data Model Impact
New fields for Step and Artifact entities:
* `Step.execution_env`: Enum (api_chat, vscode).
* `Step.pm_override`: Boolean.
* `Step.requires_repo_access`: Boolean.
* `Step.applied_policies`: List of Policy IDs.
* `Step.handoff_packet`: Text (Markdown/JSON).
* `Artifact.read_log`: List of log objects (persisted for audit).

## 19. Runtime Flow
1. **Routing Decision**: Triggered when a Step state transitions to "Active".
2. **Recommendation**: System evaluates thresholds (§8) and suggests environment.
3. **Integrated State**: Integrator-S constructs the Handoff Packet including Global Policies.
4. **Handoff**: PM/Human transfers the Packet to the Target Environment.
5. **InDev/Debug State**: Role performs Pre-Read -> Work -> Read Log.
6. **Inbound Validation**: (Phase B) System verifies the return artifact.

## 20. Phase A / Phase B Boundary
Phase A is complete upon the generation and export of a compliant Handoff Packet. Phase B covers the inbound processing, validation of Read Logs, and schema verification.

## 21. Acceptance Criteria
* Handoff Packets contain all mandatory "Content" fields (§10).
* Reviewer (Code) and Infra roles are correctly routed to VSCode.
* Read Log definition includes path, reason, and timestamp.
* Violation table includes all specified failure modes.

## 22. Risks
* **Manual Overhead**: Increased copying between Chat and VSCode. Mitigation: Optimize Packet size and provide one-click export.
* **Context Pollution**: VSCode AI reading un-mapped files. Mitigation: Strict enforcement of Read Logs and Re-Read Declarations.

## 23. Open Questions
* Should the 100KB threshold be adjusted dynamically based on the model's specific context window?
* How to handle binary file references in the Pre-Read Declaration?
# Japanese Summary (PM向け要約)

**判定結果への対応：修正完了 (U-FLOW-13 Spec Phase A 改訂版)**

ReviewerによるReject判定を受け、指摘事項6点すべてに対応した改訂版スペックを作成しました。

*   **欠落セクションの追加**: データモデルへの影響、ランタイムフロー、リスク、未解決事項の4セクションを新規追加し、構成を是正しました。
*   **PM Decisionとの整合**: Reviewerのコードレビュー時のVSCode利用、およびInfraのVSCode推奨設定を反映しました。
*   **パケット定義の強化**: 「曖昧時の対応（Ambiguity Handling）」フィールドを追加。また、Handoff PacketはWorker Packetを包含する「封筒（Envelope）」であると定義し、既存Flowとの関係を整理しました。
*   **例外処理の具体化**: 実行中の「追加ファイル参照要求」のフローや、「不完全なRead Log」に対する段階的なフォールバックを定義しました。
*   **数値基準の設定**: 移行推奨の判断基準として、添付ファイル数（10ファイル）やサイズ（100KB）の閾値を明示しました。

---

# U-FLOW-13_Spec_PhaseA_20260507_v2.md

## 1. Overview
This specification defines the **Role Execution Routing** and **Handoff Runtime** for the AI Business OS[cite: 1, 2]. It establishes a mechanism to route tasks between `api_chat` and `vscode` environments based on Role characteristics and input complexity[cite: 1, 2, 4].

## 2. Background
To prevent context pollution while allowing for high-complexity development, the system transitions from manual attachment management to a structured Handoff mechanism[cite: 1, 2]. This ensures that VSCode-side execution remains under the strict control of the Flow Runtime principles[cite: 1, 2].

## 3. Goals
*   Implement deterministic routing logic for `execution_env`[cite: 1, 4].
*   Standardize the **Handoff Packet** as a container for Worker Packets[cite: 1, 4].
*   Ensure 100% traceability of file access via Pre-Read and Read Log protocols[cite: 1, 2].

## 4. Non-Goals
*   Direct automated modification of local files by the Runtime[cite: 1, 2].
*   Full automation of the Git workflow[cite: 1, 2].

## 5. Role Execution Routing Design
Roles are assigned default environments, with specific triggers for environment switching[cite: 2, 4].

| Role | Default Env | VSCode Trigger |
| :--- | :--- | :--- |
| PM / Designer / Integrator-C | `api_chat` | None (Always Chat-centered)[cite: 2]. |
| Reviewer | `api_chat` | **Code Review tasks** involving multi-file diffs[cite: 2, 4]. |
| Integrator-S | `api_chat` | Physical Packet generation requiring repo paths[cite: 2]. |
| Worker / Debugger / Infra | `vscode` | Default (Requires repo access/execution)[cite: 2, 4]. |

## 6. execution_env Definition
The environment is determined per Step[cite: 1]:
*   **`api_chat`**: Strategic, logical, or orchestration steps[cite: 1, 2].
*   **`vscode`**: Implementation, verification, or infrastructure steps[cite: 1, 2].
*   **`either`**: Minor documentation or single-file logic updates[cite: 1].

## 7. requires_repo_access Definition
`requires_repo_access` is **TRUE** if any logic requires visibility beyond the attached Artifacts, specifically for dependency mapping, build execution, or multi-file grepping[cite: 1].

## 8. Migration Recommendation Logic
Recommendations are advisory. The Runtime uses the following thresholds[cite: 1, 4]:

| Condition | Recommendation |
| :--- | :--- |
| Attachments < 10 files AND Total Size < 100KB | **API Chat Recommended**[cite: 1, 4]. |
| `requires_repo_access` = TRUE OR Role = Worker/Debugger/Infra | **VSCode Recommended**[cite: 1, 4]. |
| Attachments > 20 files OR Total Size > 500KB | **VSCode Strongly Recommended**[cite: 1, 4]. |

## 9. PM Override Policy
### 9.1 Environment Override
PM may force a change in `execution_env`[cite: 1, 2]. The UI will display "PM Override Active"[cite: 1].

### 9.2 Policy-Level Override
PM may authorize bypass of Global Policies (e.g., allowing Japanese for an external partner)[cite: 1, 4]. This must be explicitly selected in the UI and injected into the Handoff Packet as a `Policy_Exemption`[cite: 4].

## 10. Handoff Packet Schema
The **Handoff Packet** acts as an **Envelope** for the **Worker Packet**[cite: 4].

```markdown
# Handoff Packet [Unit-Step-ID]

## Envelope Metadata
- Target Environment: [vscode/external]
- Applied Policies: [Language: English, etc.]
- Policy Exemptions: [None / Specific Exemption]
- Ambiguity Handling: "Return to PM via Handoff Return. Do not guess."[cite: 4]

## Content (The Worker Packet)
- Mission/Scope: [From Step Instruction]
- Input Artifacts: [List]
- Allowed Files: [Paths]

## Safety Protocols
- Pre-Read Declaration: REQUIRED[cite: 1]
- Read Log: REQUIRED[cite: 1]
```

## 11. Global Policy Injection Mechanism
Policies are injected based on **Role**, **Step**, and **Artifact Type**[cite: 1, 4]:
*   **Code Artifacts**: Security and Language policies always applied[cite: 1].
*   **Doc Artifacts**: Language policy applies unless PM Override is active[cite: 1, 4].

## 12. Language Policy Application
AI-to-AI interactions must be in English[cite: 1]. PM-facing summaries in Japanese are mandatory for any English artifact requiring approval[cite: 1].

## 13. Translation Boundary
Integrator-S (Logical) creates instructions in Japanese; Integrator-S (Physical) translates the mission/scope into English during Packet generation[cite: 1].

## 14. Pre-Read & Additional Access Design
### 14.1 Initial Declaration
Role must declare files: "Pre-Read Declaration: [List]"[cite: 1].

### 14.2 Additional Access Request
If a Role discovers a hidden dependency:
1. Role issues an **"Access Amendment Request"**.
2. PM/Human approves.
3. Role proceeds. *Note: Accessing without amendment is a Violation*[cite: 1, 4].

## 15. Read Log Design
Must be included in the Role Output: `[Read Log: Path A, Path B]`[cite: 1, 2].

## 16. Violation Fallback Design
| Violation | Handling |
| :--- | :--- |
| Missing Pre-Read | **Reject** -> Rework[cite: 1, 2]. |
| Incomplete Read Log | **Request Correction** (Minor feedback)[cite: 4]. |
| Guessing Ambiguity | **Handoff Return** to PM[cite: 1, 4]. |

## 17. UI Requirements
*   **Migration Reason Display**: Explains why VSCode is recommended (e.g., "Input > 100KB")[cite: 1, 4].
*   **Allowed Files List**: Explicit list of repository paths permitted for the current step[cite: 4].
*   **Packet Export**: One-click download/copy[cite: 1, 2].

## 18. Data Model Impact
New fields for the Step/Artifact entities[cite: 4]:
*   `Step.execution_env`: Enum (api_chat, vscode)[cite: 1, 4].
*   `Step.pm_override`: Boolean[cite: 1].
*   `Step.handoff_packet`: String (Markdown/JSON)[cite: 1].
*   `Artifact.read_log`: List of strings (persisted for audit)[cite: 1].

## 19. Runtime Flow
1. **Routing Decision**: Triggered when a Step becomes "Active"[cite: 4].
2. **Recommendation**: Evaluates thresholds and suggests environment[cite: 4].
3. **Packet Construction**: Injects Policies and the Worker Packet[cite: 1, 4].
4. **Handoff**: Human copies Packet to VSCode[cite: 1, 2].
5. **Execution**: Role performs Pre-Read -> Work -> Read Log[cite: 1, 2].

## 20. Phase A / Phase B Boundary
Phase A defines the **Outbound Handoff**[cite: 1, 2]. Phase B will implement the **Inbound Validation** (verifying Read Logs vs. Declarations)[cite: 2].

## 21. Acceptance Criteria
*   Handoff Packet contains "Ambiguity Handling" instructions[cite: 4].
*   Infra and Reviewer (Code) are correctly routed to VSCode[cite: 4].
*   Thresholds (100KB / 10 files) are applied to recommendations[cite: 4].

## 22. Risks
*   **Over-Segmentation**: High-frequency switching between Chat and VSCode may increase human labor[cite: 4].
*   **Policy Bypass**: Improper PM overrides may lead to non-English artifacts polluting the repo[cite: 4].

## 23. Open Questions
*   Should the 100KB threshold be dynamic based on the specific LLM model's context window?[cite: 4]
*   How to handle binary files (images/PDFs) within the Pre-Read Declaration?[cite: 4]
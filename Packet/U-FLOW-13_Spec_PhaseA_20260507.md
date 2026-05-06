# Japanese Summary (PM向け要約)

本設計（U-FLOW-13 Phase A）は、AI事業OSにおいてRoleごとの実行環境（APIチャット または VSCode）を判定し、安全にタスクを引き継ぐための「Handoff Runtime」を定義します。

*   **ルーティングの考え方**: 役割（Role）やリポジトリ参照の必要性、コンテキスト量に基づき、最適な環境を「推奨」として提示します。強制ではなくPMによるオーバーライドを許容します。
*   **Handoff Packet**: VSCode等へ移行する際、ミッション、参照許可ファイル、禁止事項、および「共通ポリシー（英語化等）」をパッケージ化して出力します。
*   **汚染防止策**: VSCode側での「事前読み取り宣言（Pre-Read Declaration）」と「読み取りログ（Read Log）」を必須化し、AIが不要なファイルを読み込んでコンテキストを汚染することを防ぎます。
*   **言語ポリシー**: AI間の成果物は英語、PM向けの判断材料は日本語とする境界線を明確にし、自動注入する仕組みを設計しました。

---

# U-FLOW-13_Spec_PhaseA_20260507.md

## 1. Overview
U-FLOW-13 Phase A defines the **Role Execution Routing** and **Handoff Runtime** for the AI Business OS[cite: 1, 2]. This mechanism determines the optimal execution environment (API Chat or VSCode/External) for each Role/Step and generates a structured **Handoff Packet** to ensure security, context isolation, and adherence to global policies[cite: 1, 2].

## 2. Background
As development scales, managing large repositories and complex dependencies within a standard API Chat interface becomes impractical[cite: 1, 2]. However, shifting entirely to VSCode risks losing the strict role separation and input control provided by the Flow Runtime[cite: 1, 2]. U-FLOW-13 addresses this by treating VSCode as a specialized execution environment routed on a per-role basis[cite: 1, 2].

## 3. Goals
*   Establish a logic for determining `execution_env` and `requires_repo_access`[cite: 1].
*   Design an advisory **Migration Recommendation** system with PM override[cite: 1, 2].
*   Standardize the **Handoff Packet** schema including **Global Policy Injection**[cite: 1].
*   Implement context pollution prevention via **Pre-Read Declarations** and **Read Logs**[cite: 1, 2].

## 4. Non-Goals
*   Full automation of VSCode-side AI tools[cite: 1, 2].
*   Automatic Git operations or repository write access without human gates[cite: 1, 2].
*   Detailed Phase B design (Inbound return processing)[cite: 1, 2].

## 5. Role Execution Routing Design
The Runtime evaluates the current state and Role to determine the execution environment[cite: 1].

| Role | Default Environment | Logic Factor |
| :--- | :--- | :--- |
| PM / Designer / Reviewer / Integrator-C | `api_chat` | Logical design and decision-making focus[cite: 2]. |
| Integrator-S (Logical) | `api_chat` | Structural transformation[cite: 2]. |
| Integrator-S (Physical) | `vscode` | Packet generation requiring repo-wide file path resolution[cite: 2]. |
| Worker / Debugger / Infra | `vscode` | Code editing, build, test, and environment verification[cite: 2]. |

## 6. execution_env Definition
The `execution_env` value for a `current_step` is determined as follows:

*   **`api_chat`**: Execution within the primary chat interface. Default for orchestration and design roles[cite: 1, 2].
*   **`vscode`**: Execution within a local or external IDE environment. Default for implementation and verification roles[cite: 1, 2].
*   **`either`**: Roles or steps where either environment is functionally viable (e.g., small documentation updates)[cite: 1].

## 7. requires_repo_access Definition
`requires_repo_access` is set to **TRUE** if any of the following conditions are met[cite: 1]:
*   Direct code editing is required[cite: 1].
*   Multi-file dependency analysis is necessary[cite: 1].
*   Build, test, or runtime error tracing is required[cite: 1].
*   Input data size exceeds API Chat context limits[cite: 1].
*   Repository search (grep/find) across non-attached files is required[cite: 1].

## 8. Migration Recommendation Logic
The Runtime provides a status message based on the environment routing[cite: 1]:

| Recommendation | Condition |
| :--- | :--- |
| **API Chat Recommended** | `requires_repo_access` = FALSE AND Input size < Threshold[cite: 1]. |
| **VSCode Recommended** | `requires_repo_access` = TRUE OR Role is Worker/Debugger[cite: 1]. |
| **Either Acceptable** | Simple logic updates with minimal attachments[cite: 1]. |
| **PM Confirmation Recommended** | Ambiguous requirements or conflicting Role/Input constraints[cite: 1]. |

## 9. PM Override Policy
*   Migration recommendations are **advisory**, not mandatory[cite: 1, 2].
*   The PM may manually force `api_chat` or `vscode` regardless of the recommendation[cite: 1, 2].
*   Overrides must be recorded in the Step metadata and visible in the UI[cite: 1].

## 10. Handoff Packet Schema
The Handoff Packet is an AI-to-AI artifact generated in English[cite: 1].

```markdown
# Handoff Packet [Unit ID] [Step ID]

## Metadata
- Role: [Target Role]
- Environment: [vscode/external]
- PM Override: [Yes/No]

## Mission & Scope
- Mission: [Specific task description]
- Scope: [Boundary of execution]

## Constraints & Policies
- Global Policies Applied: [Policy List]
- Prohibitions: [Explicit No-Go items]

## Input Data
- Input Artifacts: [List of attached artifacts]
- Allowed Files: [Specific file paths in repository]

## Protocols
- Pre-Read Declaration: REQUIRED before file access.
- Read Log: REQUIRED in Output.

## Expected Output
- Format: [Schema Definition]
- Return Method: [Paste to Chat / File Attach]
```
[cite: 1]

## 11. Global Policy Injection Mechanism
Common policies are stored centrally and injected by the **Handoff Packet Builder**[cite: 1].

*   **Storage**: `system/policy/global_policy.json`
*   **Injection**: The Builder reads the policy and appends relevant sections based on the Role and Step Type[cite: 1].
*   **Policy Types**:
    *   **Language Policy**: Mandatory (English for AI-to-AI)[cite: 1].
    *   **Security Policy**: Mandatory (No PII, no external API calls)[cite: 1].
    *   **Style Policy**: Optional (Code formatting rules)[cite: 1].

## 12. Language Policy Application
The **Common Language Policy** enforces the following[cite: 1]:
*   **AI-to-AI Artifacts**: MUST be English (Schema, Handoff Packets, Worker Packets, Code)[cite: 1].
*   **Human/PM Communication**: MAY be Japanese (Strategic decisions, approval text)[cite: 1].
*   **Summary Rule**: English artifacts for PM judgment must include a concise Japanese summary[cite: 1].

## 13. Translation Boundary
*   **Japanese to English**: Occurs during **Packet Generation** by the Designer or Integrator-S[cite: 1].
*   **English to Japanese**: Occurs when generating a **Handoff Return** or **Review Request** for the PM[cite: 1].

## 14. Pre-Read Declaration Design
To prevent context pollution, the external Role must declare access intentions[cite: 1, 2]:
*   **Format**: "I will read the following files: [List of Paths]"[cite: 1].
*   **Timing**: After receiving the Handoff Packet, before any processing[cite: 1].
*   **Rule**: Accessing undeclared files is a violation[cite: 1, 2].

## 15. Read Log Design
The Role must provide an audit trail of actual file access[cite: 1, 2]:
*   **Format**: Included in the **Role Output**[cite: 1].
*   **Fields**: `file_path`, `reason_for_reading`, `timestamp`[cite: 1].
*   **Validation**: Must match the Pre-Read Declaration[cite: 1].

## 16. Violation Fallback Design
| Violation | Action |
| :--- | :--- |
| Missing Pre-Read Declaration | **Reject** -> Return to start of Step[cite: 1, 2]. |
| Reading Undeclared Files | **Reject** -> Rework required[cite: 1, 2]. |
| Missing Read Log | **Reject** -> Request re-submission[cite: 1, 2]. |
| Output Schema Violation | **Reject** -> Re-Handoff[cite: 1, 2]. |
| Guessing Ambiguity | **Return** -> Handoff Return to PM[cite: 1, 2]. |

## 17. UI Requirements
The Phase A UI must display[cite: 1]:
*   Recommended `execution_env` for the current step[cite: 1, 2].
*   "Generate Handoff Packet" button per Role[cite: 1, 2].
*   Packet Preview/Copy/Export controls[cite: 1, 2].
*   PM Override toggle with a warning display[cite: 1, 2].
*   List of applied Global Policies[cite: 1].

## 18. Phase A / Phase B Boundary
Phase A is complete when a Handoff Packet is successfully exported[cite: 1, 2].
Phase B will handle:
*   Inbound Artifact registration from VSCode[cite: 2].
*   Validation of Read Logs against Declarations[cite: 2].
*   Automated Schema checking for returned Outputs[cite: 2].

## 19. Acceptance Criteria
*   Runtime correctly identifies `vscode` as the environment for Worker/Debugger roles[cite: 2].
*   Handoff Packets are generated in English including Global Policy sections[cite: 1].
*   PM can override a "VSCode Recommended" status to "API Chat"[cite: 1, 2].
*   Pre-Read Declaration and Read Log instructions are explicitly included in the Packet[cite: 1, 2].

---
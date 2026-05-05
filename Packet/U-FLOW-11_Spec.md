File:
U-FLOW-11_Spec.md

Role: Designer
Scope: Chat Runtime Integration Design

# U-FLOW-11 Chat Runtime 組み込み仕様書 (Rev.1)

## 1. current_step → Role / Template 解決仕様
Flow v1.4の定義に基づき、全ステップ（Main/Feedback）における実行対象Role、Template、および処理特性を特定する[cite: 3, 13, 16]。

### 1.1 Main Flow ステップ解決表
| Step ID | Role (Target) | Role Template | 処理特性・備考[cite: 16] |
| :--- | :--- | :--- | :--- |
| main-01 | PM | PM Template | Human GoalInputを受領 |
| main-02 | Designer | Designer Template | PM判断を基にSpec作成 |
| main-03 | Reviewer | Reviewer Template | Specの整合性確認 |
| **main-04** | **Reviewer** | **Reviewer Template** | **分岐ステップ（pass/conditional/reject）** |
| main-05 | PM to Integrator-S | Integrator-S Template | SpecをPacketへ構造化（PM承認担保必須）[cite: 14] |
| main-06 | Integrator-S to Worker| Worker Template | **External Handoff（Copilot連携）**[cite: 13] |
| **main-07** | **Debugger, Infra** | **各 Role Template** | **Parallel（両RoleのPromptを同時生成）** |
| **main-08** | **Integrator-C** | **Integrator-C Template** | **Join（Debugger/Infra両結果の受領待ち）** |
| **main-09** | **Integrator-C** | **Integrator-C Template** | VerifiedからApprovedへの最終判定 |
| **main-10** | **Human** | **None (Guide)** | **Human Gate（最終承認操作のみ）** |

### 1.2 Feedback Flow 代表ステップ解決表
| Step ID | Role (Target) | Role Template | 処理特性・備考[cite: 16] |
| :--- | :--- | :--- | :--- |
| fb-impl-01 | Worker | Worker Template | **iteration count確認必須**（実装修正投入） |
| fb-impl-02 | Debugger, Infra | 各 Role Template | Parallel 再検証 |
| fb-spec-01 | Designer | Designer Template | **iteration count確認必須**（仕様修正投入） |
| fb-spec-03 | Reviewer | Reviewer Template | 分岐ステップ（再レビュー判定） |
| fb-env-01 | Infra | Infra Template | **iteration count確認必須**（環境/手順修正） |
| **fb-env-02** | **Human** | **None (Guide)** | **Manual Execution（実機確認手順の提示）** |

## 2. Variables 埋め込み & Input 判定仕様
定義済みInput Schemaから動的に変数を埋め込み、バリデーションを行う[cite: 13, 14]。

### 2.1 iteration count 確認処理[cite: 16]
Feedback系ステップ（fb-*-01）のPrompt生成前に、Flow Runtimeの `loop_counter` を参照する[cite: 3]。
*   **正常系**: `count < max_iterations` (3回) の場合、Prompt生成を続行。
*   **上限超過時**: Prompt生成を停止。UI上に「Max iterations exceeded」を表示し、PMへエスカレーション（手動介入待ち）を促す[cite: 16]。

### 2.2 Input カテゴリ定義 (再定義)
*   **必須 (Mandatory)**: 欠落時はPrompt生成中断。
*   **条件付き (Conditional)**: `Review Reject` 時の `{{review_report}}` や、`Feedback` 時の `{{rework_instruction}}`[cite: 14, 16]。
*   **任意 (Optional)**: 存在時のみ埋め込み。

## 3. 分岐およびステップ完了制御仕様[cite: 16]

### 3.1 Human Gate / Decision 分岐処理
`main-04` 等の `type: decision` ステップにおいて、Runtimeは以下の挙動を行う[cite: 3, 16]。
1.  **選択肢提示**: Flow定義の `branches`（pass/conditional/reject等）をUI上にボタン提示。
2.  **Human選択**: Humanがいずれかの結果を選択。
3.  **Route/State確定**: 選択結果に基づき、`route_context` および `next_step` を解決。
4.  **context引き継ぎ**: Reject選択時は `{{review_report}}` を次ステップ（Designer）の `Variables` に自動スタックする[cite: 16]。

### 3.2 Prompt 生成 & 投入プロセス
1.  `current_step` からRole/Template解決。
2.  `iteration_counter` 整合性確認。
3.  Template Variables 解決（必須チェック）。
4.  Role Header付与および出力指示の追加[cite: 4]。
5.  対象Roleのチャット入力欄へペースト（AI Roleの場合）。

## 4. 特殊実行ステップのハンドリング[cite: 16]

### 4.1 外部 Role (Worker) Handoff
`external_handoff` ステップでは、AIチャット欄への投入ではなく、クリップボードへの自動コピーおよび「外部ツール（VSCode等）への投入ガイド」をポップアップ表示する[cite: 13]。

### 4.2 Human Manual Execution (fb-env-02)
`manual_execution` ステップでは、以下の運用を行う[cite: 3, 16]。
1.  **手順表示**: Infraが作成した `TestPlan` を「実機確認手順」としてHuman UIに表示。
2.  **結果入力**: Humanが実機操作を行い、結果（ExecutionResult）をテキストエリアに入力。
3.  **完了操作**: 「完了」ボタン押下により、結果を保持して次ステップ（Infraへの結果戻し）へ遷移する[cite: 16]。

## 5. PM承認済みの担保 (申し送りF対応)
Integrator-S 実行条件として、Flow Engine側の `state: Reviewed` かつ `route_context: main` または `feedback_specification` であることを内部フラグで確認し、未承認状態での実行を技術的にブロックする[cite: 3, 14]。

## 6. Acceptance Criteria (U-FLOW-11)[cite: 13, 16]
*   `current_step` から、メインおよびフィードバックの**全ステップ**において正確なRole/Templateが解決されること[cite: 16]。
*   **Reviewer Decision等の分岐ステップ**において、Humanの選択（pass/reject等）に応じて次ステップが正しく解決されること[cite: 16]。
*   **max_iterations超過時**、Prompt生成が停止しPMへの警告が表示されること[cite: 16]。
*   **Human manual_executionステップ**において、手順表示から結果入力、遷移までが正しく行えること[cite: 16]。
*   Worker用Handoff Promptが正常にクリップボードコピー可能な状態で生成されること[cite: 13]。
*   Integrator-S実行時に、Flow状態に基づきPM承認済みであることが担保されていること[cite: 14]。
File:
U-FLOW-11_Spec.md

Role: Designer
Scope: Chat Runtime Integration Design

# U-FLOW-11 Chat Runtime 組み込み仕様書 (Rev.2)

## 1. current_step → Role / Template 解決仕様
Flow v1.4の定義に基づき、全ステップにおける実行対象Role、Template、および処理特性を特定する[cite: 3, 13, 16, 17]。

### 1.1 Main Flow ステップ解決表
| Step ID | Role (Target) | Role Template | 処理特性・備考[cite: 16, 17] |
| :--- | :--- | :--- | :--- |
| main-01 | PM | PM Template | Human GoalInputを受領 |
| main-02 | Designer | Designer Template | PM判断を基にSpec作成 |
| main-03 | Reviewer | Reviewer Template | Specの整合性確認 |
| main-04 | Reviewer | Reviewer Template | 分岐ステップ（pass/conditional/reject） |
| **main-05** | **Integrator-S** | **Integrator-S Template** | **SpecをPacketへ構造化（PM承認担保必須）**[cite: 14, 17] |
| main-06 | Integrator-S to Worker| Worker Template | External Handoff（Copilot連携）[cite: 13] |
| main-07 | Debugger, Infra | 各 Role Template | Parallel（両RoleのPromptを同時生成） |
| main-08 | Integrator-C | Integrator-C Template | Join（Debugger/Infra両結果の受領待ち） |
| **main-09** | **PM** | **PM Template** | **VerifiedからApprovedへの最終判断**[cite: 17] |
| main-10 | Human | None (Guide) | Human Gate（最終承認操作のみ） |

### 1.2 Feedback Flow 代表ステップ解決表
| Step ID | Role (Target) | Role Template | 処理特性・備考[cite: 16, 17] |
| :--- | :--- | :--- | :--- |
| fb-impl-01 | Worker | Worker Template | iteration count確認必須（実装修正投入） |
| fb-impl-03 | Integrator-C | Integrator-C Template | **Join（Integrator-C再判定）**[cite: 17] |
| fb-spec-01 | Designer | Designer Template | iteration count確認必須（仕様修正投入） |
| fb-spec-03 | Reviewer | Reviewer Template | 分岐ステップ（再レビュー判定：main-04と共通仕様）[cite: 16, 17] |
| fb-spec-07 | Integrator-C | Integrator-C Template | **Join（Integrator-C再判定）**[cite: 17] |
| fb-env-01 | Infra | Infra Template | iteration count確認必須（環境/手順修正） |
| fb-env-02 | Human | None (Guide) | Manual Execution（実機確認手順の提示） |
| **fb-env-03** | **Infra** | **Infra Template** | **Humanからの結果戻し受領・整理**[cite: 17] |
| **fb-env-04** | **Integrator-C** | **Integrator-C Template** | **Join（Integrator-C再判定）**[cite: 17] |

## 2. Variables 埋め込み & Input 判定仕様
定義済みInput Schemaから動的に変数を埋め込み、バリデーションを行う[cite: 13, 14]。

### 2.1 iteration count 確認処理[cite: 16]
Feedback系ステップ（fb-*-01）のPrompt生成前に、Flow Runtimeの `loop_counter` を参照する[cite: 3]。
*   **正常系**: `count < max_iterations` (3回) の場合、Prompt生成を続行。
*   **上限超過時**: Prompt生成を停止し、PMへエスカレーション（手動介入待ち）を促す[cite: 16]。

## 3. 分岐およびステップ完了制御仕様[cite: 16, 17]

### 3.1 Human Gate / Decision 分岐処理
`main-04` 等の `type: decision` ステップにおいて、Runtimeは以下の挙動を行う[cite: 3, 16]。
1.  **選択肢提示**: Flow定義の `branches` をUI上にボタン提示。
2.  **Human選択**: Humanがいずれかの結果を選択。
3.  **Route/State確定**: 選択結果に基づき、`route_context` および `next_step` を解決。
4.  **context引き継ぎ**: Reject選択時は `{{review_report}}` を次ステップの `Variables` に自動スタックする[cite: 16]。

### 3.2 Prompt 生成 & 投入プロセス
1.  `current_step` からRole/Template解決。
2.  `iteration_counter` 整合性確認。
3.  Template Variables 解決（必須チェック）。
4.  Role Header付与および出力指示の追加[cite: 4]。
5.  対象Roleのチャット入力欄へペースト（AI Roleの場合）。

### **3.3 Verified 遷移処理**[cite: 17]
`Integrator-C` による再判定（`fb-impl-03` 等）の結果、`Verified` 条件を充足した場合、Runtimeは以下の制御を自動実行する[cite: 3, 17]。
1.  **Route Context リセット**: `route_context` を `main` へリセット[cite: 3, 17]。
2.  **遷移先確定**: 次のステップを `main-09` (PM承認) へ接続する[cite: 3, 17]。

## 4. 特殊実行ステップのハンドリング[cite: 16]

### 4.1 外部 Role (Worker) Handoff
`external_handoff` ステップでは、クリップボードへの自動コピーおよび「外部ツール（VSCode等）への投入ガイド」をポップアップ表示する[cite: 13]。

### 4.2 Human Manual Execution (fb-env-02)
`manual_execution` ステップでは、`Infra` が作成した `TestPlan` をHuman UIに表示し、Humanが入力した `ExecutionResult` を保持して次ステップへ遷移する[cite: 3, 16]。

## 5. PM承認済みの担保 (申し送りF対応)
Integrator-S 実行条件として、Flow Engine側の `state: Reviewed` かつ承認済みであることを内部フラグで確認し、未承認状態での実行をブロックする[cite: 3, 14, 16]。

## 6. Acceptance Criteria (U-FLOW-11)[cite: 13, 16, 17]
*   メインおよびフィードバックの**全ステップ**において正確なRole/Templateが解決されること[cite: 16, 17]。
*   **main-05およびmain-09**において、実行Role（Integrator-S / PM）が正しく解決されること[cite: 17]。
*   **Verified遷移時**に、`route_context` のリセットと `main-09` への接続が正しく行われること[cite: 17]。
*   Reviewer Decision等の分岐ステップにおいて、Humanの選択に応じて次ステップが正しく解決されること[cite: 16]。
*   max_iterations超過時、Prompt生成が停止しPMへの警告が表示されること[cite: 16]。
*   Human manual_executionステップにおいて、手順表示から結果入力、遷移までが正しく行えること[cite: 16]。
*   Integrator-S実行時に、Flow状態に基づきPM承認済みであることが担保されていること[cite: 14]。

---
本Spec（Rev.2）をもって、Reviewer指摘事項[cite: 17] をすべて反映した。
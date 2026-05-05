U-FLOW-11_Spec.md

Role: Designer
Scope: Chat Runtime Integration Design

# U-FLOW-11 Chat Runtime 組み込み仕様書

## 1. current_step → Role / Template 解決仕様
Flow v1.4の定義に基づき、現在のステップから実行対象のRoleと使用するTemplateを特定する[cite: 3, 13]。

| Step ID | Role (Target) | Role Template | 備考 |
| :--- | :--- | :--- | :--- |
| main-01 | PM | PM Template | Humanからの入力を受ける |
| main-02 | Designer | Designer Template | PM判断を基にSpec作成 |
| main-03 | Reviewer | Reviewer Template | Specの整合性確認 |
| main-05 | Integrator-S | Integrator-S Template | SpecをPacketへ構造化[cite: 14] |
| main-06 | Worker | Worker Template | External Handoff用[cite: 13] |
| main-08 | Integrator-C | Integrator-C Template | 検証結果の統合・起因判定 |
| fb-impl-01 | Worker | Worker Template | 実装修正指示を投入 |
| fb-spec-01 | Designer | Designer Template | 仕様修正指示を投入 |

## 2. Variables 埋め込み & Input 判定仕様
各Role実行時に、定義済みInput Schemaから動的に変数を埋め込む[cite: 13, 14]。

### 2.1 Input カテゴリ定義 (申し送りE対応)
Runtime側で以下の3層のバリデーションを実施する[cite: 13, 14]。

*   **必須 (Mandatory)**: 欠落している場合、Prompt生成を中断し警告を表示する。
    *   例: PMへの `{{human_goal}}`, Reviewerへの `{{spec_content}}`。
*   **条件付き (Conditional)**: 特定の `route_context` または前ステップの結果がある場合のみ必須。
    *   例: Workerへの `{{rework_instruction}}` (feedback時のみ必須)[cite: 13, 14]。
    *   例: Designerへの `{{review_report}}` (Review Reject時のみ必須)[cite: 14]。
*   **任意 (Optional)**: 存在すれば埋め込むが、欠落していても進行を許可する。

### 2.2 変数マッピング例
*   `{{unit_id}}`: システム管理IDを自動埋め込み。
*   `{{spec_content}}`: 最新の `[Unit]_Spec.md` の内容を抽出[cite: 6]。
*   `{{control_decision}}`: Integrator-Cが生成した最新の記録。

## 3. Prompt 生成 & 投入仕様
Roleプロンプトの構成およびチャットUIへの自動投入ルールを定義する[cite: 4, 13]。

*   **Role Header 付与**: プロンプトの最上部に `Role: [Name] / Scope: [Scope]` を固定で付与[cite: 4, 7]。
*   **Output Protocol**: `COPY Mode` およびファイル名明示指示を末尾に追加[cite: 4]。
*   **投入プロセス**: 
    1.  current_step 確定。
    2.  Template & Variables 解決。
    3.  Humanによる「プロンプト生成」ボタン押下。
    4.  対象Roleのチャット入力欄へ自動ペースト（Humanによる最終確認後に送信）。

## 4. 外部 Role (Worker) Handoff 仕様
外部ツール（VSCode Copilot等）を使用するRoleへの受け渡し仕様[cite: 3, 13]。

*   **Handoff Prompt 生成**: `main-06` または `fb-impl-01` 時、Worker用の指示プロンプトをクリップボードコピー可能な状態で生成する[cite: 13]。
*   **構成**: `Role Header` + `Packet内容` + `ReworkInstruction (あれば)`。

## 5. PM承認済みの担保 (申し送りF対応)
Integrator-S (`main-05`) 実行時における入力Specの信頼性を以下の仕様で担保する[cite: 14]。

*   **フロー制御による保証**: Flow Engineにおいて、`main-04` (Reviewer Decision) の `pass` 判定および `main-05` への遷移が完了していることを実行条件とする[cite: 3, 14]。
*   **ステータスチェック**: Stateが `Reviewed` かつ `route_context: main` である場合のみ、Integrator-Sの実行を許可する。
*   **Input埋め込み**: `{{spec_content}}` だけでなく、直前の `{{pm_decision}}` (Start/Rework) をプロンプトに含め、承認済み文脈をAIに提示する[cite: 14]。

## 6. Role Output 受領後のステップ完了運用
成果物生成後のフロー進行仕様[cite: 1, 13]。

*   **Output 検知**: AIからの成果物（COPY Modeブロック）をHumanが受領。
*   **Human Gate**: Humanが内容を確認し、UI上の「Complete Step」ボタンを押下[cite: 3, 13]。
*   **遷移実行**: Flow Engineが `current_step` を更新し、次Roleの解決待ち状態へ遷移する[cite: 13]。

## 7. Acceptance Criteria (U-FLOW-11)
本Unitは以下を満たした場合にPASSとする[cite: 13]。

*   `current_step` から正確なRoleおよびTemplateが解決されること。
*   Template Variablesに対し、定義されたInputデータが正しく埋め込まれること。
*   必須Input不足時にPrompt生成が停止され、エラーが表示されること。
*   `{{rework_instruction}}` 等の条件付き変数が文脈に応じて正しく処理されること。
*   Role Header付きのプロンプトが生成され、対象Role列に投入できること。
*   Worker用Handoff Promptが正常に出力されること。
*   Integrator-Sにおいて、Flowの状態管理によりPM承認済みであることを技術的に担保できること。
*   成果物受領後、Human Gateを経て次ステップへ進行できること。
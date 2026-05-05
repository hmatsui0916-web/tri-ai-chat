File:
U-FLOW-10_Spec.md

Role: Designer
Scope: Role Template Design

# U-FLOW-10 Role Template Spec (Rev.2)

## 1. Role Template 共通定義
全Roleのプロンプトに共通して含める基本構造を定義する[cite: 4, 7, 10]。

| 構成要素 | 内容・目的 |
| :--- | :--- |
| **Role Header** | 役割とScopeの宣言。AIの役割ブレを物理的に抑制する[cite: 4]。 |
| **Mission** | Roleが達成すべき目的の要約[cite: 4, 10]。 |
| **Input Policy** | 指定された `{{variables}}` 以外の情報使用（推測・過去文脈）の禁止[cite: 7, 10, 11]。 |
| **Output Schema** | 準拠すべき成果物の構造定義（U-FLOW-09 Rev.1準拠）[cite: 6, 7]。 |
| **Prohibitions** | 役割越境や自己判断による仕様変更の禁止事項[cite: 4, 7]。 |
| **Output Protocol** | COPY Mode、1ブロック出力、ファイル名明示の徹底[cite: 4]。 |

## 2. Role別 Template 要件
U-FLOW-09で定義されたSchemaを確実に生成するための各Role固有の制御要件[cite: 6, 7, 10, 11]。

| Role | テンプレート固有要件 |
| :--- | :--- |
| **Human** | 用途（Goal/Execution/Approval）に応じた変数提示を行い、操作ガイドとして機能させる[cite: 10, 11, 12]。 |
| **PM** | 承認判断に特化。用途別のDecision命名規則を厳守する[cite: 7, 11]。 |
| **Designer** | PM判断、Review Reject、仕様起因フィードバックの3経路の入力を正確に処理する[cite: 11, 12]。 |
| **Reviewer** | 常に「疑う」マインドセット。判定(Pass/Conditional/Reject)を明確化[cite: 4]。 |
| **Integrator-S** | SpecをWorkerが実装可能な最小単位のPacketへ構造化する[cite: 4, 7]。 |
| **Worker** | PacketまたはReworkInstructionへの忠実な実装。自己判断を厳禁する[cite: 4, 7]。 |
| **Debugger** | 破壊的・エッジケース検証。正常系を信用しない判定基準[cite: 4]。 |
| **Infra** | 環境起因時の特殊Rework要件（コード修正禁止、Human連携）を内包[cite: 7, 11]。 |
| **Integrator-C** | 起因判定フレームワークに基づき、検証結果を統合。不備時の再出力要求を主導する[cite: 7, 10, 11]。 |

## 3. Integrator-C 出力制御
制御精度と下流への伝達効率を考慮し、以下のように確定する[cite: 7, 8, 10, 11]。

*   **構成**: `ControlDecision` と `ReworkInstruction` は **別ファイルとして分離出力** する[cite: 10, 11]。
*   **理由**: 状態記録（PM向け）と直接的な修正指示（現場Role向け）のInputを純粋化し、トレーサビリティを高めるため[cite: 6, 11]。

## 4. 意思決定・修正指示系 命名規則
Unit内の履歴管理を厳密化するため、以下の命名規則を適用する[cite: 4, 7, 10, 11]。

### 4.1 Decision系（PM出力）
*   **Unit開始判断**: `[Unit]_PMDecision_Start.md`
*   **Unit完了承認**: `[Unit]_PMDecision_Final.md`
*   **差戻し/再検討判断**: `[Unit]_PMDecision_Rework.md`
*   **保留/中断判断**: `[Unit]_PMDecision_Hold.md`

### 4.2 ReworkInstruction系（Integrator-C出力）
差戻し先Roleを明示し、指示内容の混同を防止する[cite: 11, 12]。
*   **命名規則**: `[Unit]_ReworkInstruction_[TargetRole]_[timestamp].md`
*   **TargetRole**: `Worker` / `Designer` / `Infra`

## 5. Input 制限 & 再出力ルール
AIの自律性を制御し、スキーマ整合性を担保するための厳格なルール[cite: 4, 7, 10, 11]。

*   **Input制限ルール**: プロンプトの冒頭で `{{variables}}` を定義し、それ以外のデータに基づく提案を禁止する[cite: 7, 10, 11]。
*   **Schema Invalid 時の再出力ルール**:
    *   **判定主体**: **Integrator-C** が出力内容を検証する[cite: 10, 11]。
    *   **処理**: Role Header欠落等を検知した場合、「Invalid: Re-output following the schema」と通知し、再出力を強制する[cite: 4, 10, 11]。

## 6. Role Template 定義（変数埋め込み構成案）
U-FLOW-11 Chat Runtimeへの組み込みを前提とした、表記統一済みの構成案[cite: 10, 11, 12]。

### 6.1 Human Template
*   **Variables (用途別整理)**[cite: 11, 12]:
    *   **GoalInput時**: `{{unit_id}}`
    *   **ExecutionResult時**: `{{infra_test_plan}}`
    *   **ApprovalResult時**: `{{pm_approval_request}}`
*   **Output**: GoalInput, ExecutionResult, ApprovalResult[cite: 6]。

### 6.2 PM Template
*   **Variables**: `{{unit_id}}`, `{{human_goal}}`, `{{review_report}}`, `{{control_decision}}`
*   **Output**: `{{unit_id}}_PMDecision_[Start/Final/Rework/Hold].md`[cite: 7, 11]。

### 6.3 Designer Template
*   **Variables (経路別整理)**[cite: 11, 12]:
    *   **初回設計**: `{{pm_decision}}`
    *   **Review Reject時**: `{{review_report}}`
    *   **仕様起因フィードバック時**: `{{rework_instruction}}`
*   **Output**: `{{unit_id}}_Spec.md`[cite: 6]。

### 6.4 Reviewer Template
*   **Variables**: `{{spec_content}}`
*   **Output**: `{{unit_id}}_ReviewReport_[timestamp].md`[cite: 6]。

### 6.5 Integrator-S Template
*   **Variables**: `{{spec_content}}`
*   **Output**: `{{unit_id}}_Packet.md`[cite: 6]。

### 6.6 Worker Template
*   **Variables**: `{{packet_content}}`, `{{rework_instruction}}`
*   **Output**: `{{function_name}}_Code.[ext]`[cite: 4]。

### 6.7 Debugger Template
*   **Variables**: `{{worker_code}}`, `{{packet_content}}`
*   **Output**: `{{target}}_DebugReport_[timestamp].md`[cite: 6]。

### 6.8 Infra Template
*   **Variables**: `{{worker_code}}`, `{{human_execution_result}}`, `{{rework_instruction}}`
*   **Prohibitions**: コード修正の提案禁止。環境/手順修正に限定[cite: 7, 11]。
*   **Output**: `{{target}}_TestPlan_[timestamp].md`, `{{target}}_TestResult_[timestamp].md`[cite: 6]。

### 6.9 Integrator-C Template
*   **Variables (表記統一)**[cite: 11, 12]:
    *   `{{debug_report}}`, `{{infra_result}}`, `{{worker_code}}`, `{{packet_content}}`, `{{spec_content}}`
*   **Output**: `ControlDecision` および `ReworkInstruction` (分離出力)[cite: 10, 11]。

## 7. Acceptance Criteria (U-FLOW-10)
本Specは以下の条件を満たした状態で確定とする[cite: 10, 11]。

*  [cite: 10, 11] **全9RoleのRole Template構成案が完成していること** (Section 6)
*  [cite: 11, 12] **Variablesの表記が全Role間で統一されていること** (Section 6.9等)
*  [cite: 11, 12] **Designerの入力経路（Review Reject/Rework）が変数に反映されていること** (Section 6.3)
*  [cite: 11, 12] **HumanのVariablesが用途別に整理されていること** (Section 6.1)
*  [cite: 11, 12] **ReworkInstructionのTargetRole別命名規則が定義されていること** (Section 4.2)

---
本Spec（Rev.2）をもって、PM判断[cite: 11] および Reviewer指摘[cite: 12] をすべて反映した。
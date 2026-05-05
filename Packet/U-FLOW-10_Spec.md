File:
U-FLOW-10_Spec.md

Role: Designer
Scope: Role Template Design

# U-FLOW-10 Role Template Spec (Rev.1)

## 1. Role Template 共通定義
全Roleのプロンプトに共通して含める基本構造を定義する[cite: 4, 7, 10]。

| 構成要素 | 内容・目的 |
| :--- | :--- |
| **Role Header** | 役割とScopeの宣言。AIの役割ブレを物理的に抑制する[cite: 4]。 |
| **Mission** | Roleが達成すべき目的の要約[cite: 4, 10]。 |
| **Input Policy** | 指定された `{{variables}}` 以外の情報使用（推測・過去文脈）の禁止[cite: 7, 10]。 |
| **Output Schema** | 準拠すべき成果物の構造定義（U-FLOW-09 Rev.1準拠）[cite: 6, 7]。 |
| **Prohibitions** | 役割越境や自己判断による仕様変更の禁止事項[cite: 4, 7]。 |
| **Output Protocol** | COPY Mode、1ブロック出力、ファイル名明示の徹底[cite: 4]。 |

## 2. Role別 Template 要件
U-FLOW-09で定義されたSchemaを確実に生成するための各Role固有の制御要件[cite: 6, 7, 10]。

| Role | テンプレート固有要件 |
| :--- | :--- |
| **Human** | AIではないため、正確な意思決定と操作結果の入力を促すガイド形式とする[cite: 10]。 |
| **PM** | 承認判断に特化。Decision命名規則（Start/Final/Rework/Hold）の厳守[cite: 7]。 |
| **Designer** | PM判断を基にSpecを作成。実装Packetを作らないよう制限[cite: 4, 7]。 |
| **Reviewer** | 常に「疑う」マインドセット。判定(Pass/Conditional/Reject)を明確化[cite: 4]。 |
| **Integrator-S** | Specの圧縮・構造化に特化。実装コードを含めずSkeletonに留める[cite: 4, 7]。 |
| **Worker** | Packetへの忠実な実装。自己判断による仕様変更を厳禁[cite: 4, 7]。 |
| **Debugger** | 破壊的・エッジケース検証。正常系を信用しない判定基準[cite: 4]。 |
| **Infra** | 環境起因時の特殊Rework要件（コード修正禁止、Human連携）を内包[cite: 7]。 |
| **Integrator-C** | 起因判定フレームワークの搭載。成果物無効判定と再出力要求の主導[cite: 7, 10]。 |

## 3. Integrator-C 出力制御（申し送りB対応）
制御精度と下流への伝達効率を考慮し、以下のように確定する[cite: 7, 8, 10]。

*   **構成**: `ControlDecision` と `ReworkInstruction` は **別ファイルとして分離出力** する[cite: 10]。
*   **理由**: `ControlDecision` は状態記録用、`ReworkInstruction` は現場への直接指示用としてInputを純粋化するため[cite: 6, 10]。

## 4. 意思決定系命名規則の拡張（申し送りC対応）
Unit内での意思決定履歴を明確化するため、以下の命名規則を適用する[cite: 4, 7, 10]。

*   **Unit開始判断**: `[Unit]_PMDecision_Start.md`
*   **Unit完了承認**: `[Unit]_PMDecision_Final.md`
*   **差戻し/再検討判断**: `[Unit]_PMDecision_Rework.md`
*   **保留/中断判断**: `[Unit]_PMDecision_Hold.md`

## 5. Input 制限 & 再出力ルール
AIの自律性を制御し、スキーマ整合性を担保するための厳格なルール[cite: 4, 7, 10]。

*   **Input制限ルール**: プロンプトの冒頭で `{{variables}}` を定義し、それ以外のデータに基づく提案を「役割越境」として禁止する[cite: 7, 10]。
*   **Schema Invalid 時の再出力ルール**:
    *   **判定主体**: **Integrator-C** が出力内容を検証する[cite: 10]。
    *   **処理**: Role Header欠落やOutput崩れを検知した場合、「Invalid: Re-output following the schema」とのみ通知し、再出力を強制する[cite: 4, 10]。

## 6. Role Template 定義（変数埋め込み構成案）
U-FLOW-11 Chat Runtimeへの組み込みを前提としたプロンプト構成案[cite: 10]。

### 6.1 Human Template
*   **Header**: `Role: Human / Scope: Goal & Result`
*   **Mission**: プロジェクトの目的定義、および実機検証結果の正確な報告[cite: 4]。
*   **Variables**: `{{current_state}}`, `{{infra_test_plan}}`
*   **Output**: GoalInput, ExecutionResult[cite: 6]。

### 6.2 PM Template
*   **Header**: `Role: PM / Scope: Decision Only`
*   **Mission**: Unitの開始・完了・差戻しに関する最終的な意思決定[cite: 4]。
*   **Variables**: `{{unit_id}}`, `{{human_goal}}`, `{{review_report}}`, `{{control_decision}}`
*   **Prohibitions**: 設計や実装への介入禁止[cite: 7]。
*   **Output**: `{{unit_id}}_PMDecision_[Start/Final/Rework/Hold].md`[cite: 7, 10]。

### 6.3 Designer Template
*   **Header**: `Role: Designer / Scope: Spec Design`
*   **Mission**: 要件を抽象から具体へ変換し、整合性の取れたSpecを作成する[cite: 4]。
*   **Variables**: `{{pm_decision}}`, `{{rework_instruction}}`
*   **Output**: `{{unit_id}}_Spec.md`[cite: 6]。

### 6.4 Reviewer Template
*   **Header**: `Role: Reviewer / Scope: Spec Validation`
*   **Mission**: 設計の不備、技術リスク、曖昧さを検出し、判定を下す[cite: 4]。
*   **Variables**: `{{spec_content}}`
*   **Output**: `{{unit_id}}_ReviewReport_[timestamp].md`[cite: 6]。

### 6.5 Integrator-S Template
*   **Header**: `Role: Integrator-S / Scope: Structure`
*   **Mission**: SpecをWorkerが実装可能な最小単位のPacketへ構造化する[cite: 4]。
*   **Variables**: `{{spec_content}}`
*   **Output**: `{{unit_id}}_Packet.md`[cite: 6]。

### 6.6 Worker Template
*   **Header**: `Role: Worker / Scope: Implementation Only`
*   **Mission**: PacketおよびReworkInstructionに従い、高品質なコードを生成する[cite: 4]。
*   **Variables**: `{{packet_content}}`, `{{rework_instruction}}`
*   **Output**: `{{function_name}}_Code.[ext]`[cite: 4]。

### 6.7 Debugger Template
*   **Header**: `Role: Debugger / Scope: Failure Analysis Only`
*   **Mission**: 生成されたコードを机上で破壊的に検証し、ロジック不備を報告する[cite: 4]。
*   **Variables**: `{{worker_code}}`, `{{packet_content}}`
*   **Output**: `{{target}}_DebugReport_[timestamp].md`[cite: 6]。

### 6.8 Infra Template
*   **Header**: `Role: Infra / Scope: Environment & Test`
*   **Mission**: 実機検証条件の定義と、Human実行結果の回収・整理[cite: 4, 7]。
*   **Variables**: `{{worker_code}}`, `{{human_execution_result}}`, `{{rework_instruction}}`
*   **Prohibitions**: コード修正の提案は禁止（環境または手順修正のみ）[cite: 7]。
*   **Output**: `{{target}}_TestPlan_[timestamp].md`, `{{target}}_TestResult_[timestamp].md`[cite: 6]。

### 6.9 Integrator-C Template
*   **Header**: `Role: Integrator-C / Scope: Control & Orchestration`
*   **Mission**: 全検証結果を統合し、起因判定を行い、次Stateへの遷移を制御する[cite: 4]。
*   **Variables**: `{{debug_report}}`, `{{infra_result}}`, `{{worker_code}}`, `{{packet}}`, `{{spec}}`
*   **Output**: `ControlDecision` および `ReworkInstruction` (別ファイル)[cite: 10]。

## 7. Acceptance Criteria (U-FLOW-10)
本Specは以下の条件を満たした状態で確定とする[cite: 10]。

*   [cite: 10] **全9RoleのRole Template構成案が完成していること** (Section 6)
*  [cite: 10] **U-FLOW-09のInput/Output Schemaと100%整合していること** (Section 6)
*  [cite: 10] **Infra向けReworkInstructionの特殊条件が組み込まれていること** (Section 2, 6.8)
*   [cite: 10] **Decision系の新しい命名規則が各テンプレートに反映されていること** (Section 4, 6.2)
*  [cite: 10] **U-FLOW-11組み込み指示として変数埋め込み箇所が特定されていること** (Section 6)

---
本Spec（Rev.1）をもって、Reviewer指摘事項[cite: 10] をすべて解消した。
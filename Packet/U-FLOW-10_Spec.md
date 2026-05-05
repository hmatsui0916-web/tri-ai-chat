U-FLOW-10_Spec.md

Role: Designer
Scope: Role Template Design

# U-FLOW-10 Role Template Spec

## 1. Role Template 共通定義
全Roleのプロンプトに共通して含める基本構造を定義する[cite: 4, 7]。

| 構成要素 | 内容・目的 |
| :--- | :--- |
| **Role Header** | 役割とScopeの宣言。AIの役割ブレを物理的に抑制する[cite: 4]。 |
| **Mission** | Roleが達成すべき目的の要約[cite: 4]。 |
| **Input Policy** | 指定されたInput Schema以外の情報使用（推測・過去文脈）の禁止[cite: 7]。 |
| **Output Schema** | 準拠すべき成果物の構造定義（U-FLOW-09準拠）[cite: 6, 7]。 |
| **Prohibitions** | 役割越境や自己判断による仕様変更の禁止事項[cite: 4, 7]。 |
| **Output Protocol** | COPY Mode、1ブロック出力、ファイル名明示の徹底[cite: 4]。 |

## 2. Role別 Template 要件
U-FLOW-09で定義されたSchemaを確実に生成するための各Role固有の制御要件[cite: 6, 7]。

| Role | テンプレート固有要件 |
| :--- | :--- |
| **PM** | 承認判断に特化。Decision命名規則（Start/Final/Rework/Hold）の厳守[cite: 7]。 |
| **Designer** | PM判断を基にSpecを作成。実装Packetを作らないよう制限[cite: 4, 7]。 |
| **Reviewer** | 常に「疑う」マインドセット。判定(Pass/Conditional/Reject)を明確化[cite: 4]。 |
| **Integrator-S** | Specの圧縮・構造化に特化。実装コードを含めずSkeletonに留める[cite: 4, 7]。 |
| **Worker** | Packetへの忠実な実装。自己判断による仕様変更を厳禁[cite: 4, 7]。 |
| **Debugger** | 破壊的・エッジケース検証。正常系を信用しない判定基準[cite: 4]。 |
| **Infra** | 環境起因時の特殊Rework要件（コード修正禁止、Human連携）を内包[cite: 7]。 |
| **Integrator-C** | 起因判定フレームワークの搭載。ControlDecisionとReworkInstructionの分離出力[cite: 7]。 |

## 3. Integrator-C 出力制御（申し送りB対応）
制御精度と下流への伝達効率を考慮し、以下のように確定する[cite: 7, 8]。

*   **構成**: `ControlDecision` と `ReworkInstruction` は **別ファイルとして分離出力** する。
*   **理由**: 
    *   `ControlDecision` はプロジェクト全体の「状態制御記録」としてPMへ渡す[cite: 4]。
    *   `ReworkInstruction` は修正担当Role（Worker等）への「直接的な指示書」としてInputを純粋化する[cite: 4, 6]。

## 4. 意思決定系命名規則の拡張（申し送りC対応）
Unit内での意思決定履歴を明確化するため、以下の命名規則を適用する[cite: 4, 7]。

| 成果物種別 | ファイル命名規則 |
| :--- | :--- |
| **Unit開始判断** | `[Unit]_PMDecision_Start.md` |
| **Unit完了承認** | `[Unit]_PMDecision_Final.md` |
| **差戻し/再検討判断** | `[Unit]_PMDecision_Rework.md` |
| **保留/中断判断** | `[Unit]_PMDecision_Hold.md` |

## 5. Input 制限 & 再出力ルール
AIの自律性を制御し、スキーマ整合性を担保するための厳格なルール[cite: 4, 7]。

*   **Input制限ルール**:
    *   プロンプトの冒頭で「利用可能な入力データ」を明示的に定義する。
    *   定義外のデータに基づく提案・修正は「役割越境」として拒否する設定とする[cite: 7]。
*   **Schema Invalid 時の再出力ルール**:
    *   複数ブロック出力、Role Header欠落、必須項目（Dependencies等）の欠落を検知した場合、システム側から「Invalid: Re-output following the schema」とのみ通知し、再出力を強制する[cite: 4]。

## 6. Acceptance Criteria (U-FLOW-10)
*   全9RoleのRole Template構成案が完成していること[cite: 7]。
*   U-FLOW-09のInput/Output Schemaと100%整合していること[cite: 7]。
*   Infra向けReworkInstructionの特殊条件（コード修正禁止等）が組み込まれていること[cite: 7]。
*   Decision系の新しい命名規則が各テンプレートに反映されていること[cite: 7]。
*   U-FLOW-11 Chat Runtimeへの組み込み指示として、変数埋め込み箇所が特定されていること[cite: 7]。
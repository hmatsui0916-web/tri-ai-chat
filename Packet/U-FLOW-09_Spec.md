U-FLOW-09_Spec.md

Role: Designer
Scope: Role I/O Schema Design

# U-FLOW-09 Role I/O Schema Spec

## 1. Role別 Output Schema
各Roleが生成する成果物の基本構造を定義する[cite: 1, 4]。

| Role | Output Artifact | 必須項目[cite: 4] |
| :--- | :--- | :--- |
| **PM** | Decision | 対象, 判断(Approve/Reject/Revise), 理由, 影響, 次アクション |
| **Designer** | Spec | Unit ID, Goal, Scope, Out of Scope, Input, Output, Constraint, Acceptance Criteria |
| **Reviewer** | ReviewReport | 対象, 指摘事項, リスク, 判定(Pass/Conditional/Reject) |
| **Integrator-S** | Packet | Unit, Goal, Target, Purpose, Inputs, Outputs, Constraints, Dependencies, Acceptance Criteria, Implementation Skeleton |
| **Worker** | Code / WorkReport | Code(関数/モジュール単位), 実装内容, 自己検証結果 |
| **Debugger** | DebugReport | 対象, テスト項目, 現象(期待/実際), 判定(Pass/Fail) |
| **Infra** | TestPlan / TestResult | 検証条件, 手順, 環境情報 / 実機確認結果, 判定 |
| **Integrator-C** | ControlDecision | 起因分類(仕様/実装/環境), 理由, 修正先, 修正指示, 次State |
| **Human** | GoalInput / Result | プロジェクト定義, 優先順位 / 最終承認(OK/NG), 実機操作結果 |

## 2. Role別 Input Schema
各Roleが処理を開始するために必要な情報を定義する[cite: 1, 3]。

*   **PM**: Human.GoalInput, Reviewer.ReviewReport, Integrator-C.ControlDecision, Human.ExecutionResult
*   **Designer**: PM.Decision, Reviewer.ReviewReport (Reject時), Integrator-C.ReworkInstruction
*   **Reviewer**: Designer.Spec
*   **Integrator-S**: Designer.Spec (PM承認済み)
*   **Worker**: Integrator-S.Packet, Integrator-C.ReworkInstruction (差戻し時)
*   **Debugger**: Worker.Code, Integrator-S.Packet, Designer.Spec
*   **Infra**: Worker.Code, Integrator-S.Packet, Human.ExecutionResult
*   **Integrator-C**: Debugger.DebugReport, Infra.TestResult, Worker.Code, Integrator-S.Packet, Designer.Spec

## 3. Output → Input 接続表
上流のOutputを下流のどのInputとして扱うかの対応表[cite: 1, 4]。

| From (Output) | To (Role) | 用途 |
| :--- | :--- | :--- |
| Human.GoalInput | PM | Unit定義および判断基準の策定 |
| PM.Decision | Designer | 設計着手指示およびScopeの確定 |
| Designer.Spec | Reviewer / Integrator-S | 仕様検証 / 実装パケットへの分解 |
| Reviewer.ReviewReport | PM / Designer | 承認判断材料 / 仕様修正指示(Reject時) |
| Integrator-S.Packet | Worker / Debugger / Infra | 実装指示 / 検証基準の参照 |
| Worker.Code | Debugger / Infra | ロジック検証 / 実機動作確認の対象 |
| Debugger.DebugReport | Integrator-C | ソフトウェア的欠陥の報告と起因判定材料 |
| Infra.TestResult | Integrator-C | 環境・実機依存不具合の報告と起因判定材料 |
| Integrator-C.ControlDecision| PM / Worker / Designer | 修正・再投入指示 / 完了判定の提示 |

## 4. Flow step → Role I/O 対応表
Flow v1.4の各ステップにおける入出力を定義する[cite: 3]。

| Step ID | Name | Input | Output |
| :--- | :--- | :--- | :--- |
| main-01 | Human to PM | GoalInput | Decision (Unit開始) |
| main-02 | PM to Designer | Decision | Spec |
| main-03 | Designer to Reviewer | Spec | ReviewReport |
| main-04 | Reviewer Decision | ReviewReport | Decision (Pass/Reject) |
| main-05 | PM to Integrator-S | Spec | Packet |
| main-06 | Integrator-S to Worker| Packet | Code |
| main-07 | Worker to Debug/Infra | Code, Packet | DebugReport, TestResult |
| main-08 | Verification to Int-C | DebugReport, TestResult | ControlDecision |
| main-09 | Int-C to PM | ControlDecision | Decision (Final Approval) |
| main-10 | PM to Human | Decision | ApprovalResult |

## 5. Schema Validation 方針
成果物の整合性を維持するための自動・手動検証ルール[cite: 1, 4]。

1.  **Role Header 必須チェック**: [Role], [Scope] の欠落は invalid。
2.  **Naming Convention チェック**: `[対象]_[種別].[ext]` 形式の遵守。
3.  **Dependencies 必須チェック**: `Packet` における依存関係未定義は無効。
4.  **Acceptance Criteria 形式**: 判定不可能な曖昧表現は invalid。
5.  **Output 制限**: COPY Mode（1ブロックのみ）の遵守。

## 6. Out of Scope
*   Role Template のプロンプト本文作成[cite: 1]
*   バリデーションロジックのプログラム実装[cite: 1]
*   成果物保存・永続化機能[cite: 1]

## 7. Acceptance Criteria (U-FLOW-09)
*   全対象Role（Human〜Integrator-C）の入出力Schemaが確定していること[cite: 1]。
*   Inputが「上流Output」または「許可された例外」のみに限定されていること[cite: 1]。
*   各Schemaが U-FLOW-10 のRole Template作成にそのまま利用可能な粒度であること[cite: 1]。
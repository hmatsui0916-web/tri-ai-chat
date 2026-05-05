File:
U-FLOW-09_Spec.md

Role: Designer
Scope: Role I/O Schema Design

# U-FLOW-09 Role I/O Schema Spec (Rev.1)

## 1. Role別 Output Schema
各Roleが生成する成果物の基本構造を定義する[cite: 1, 4]。

| Role | Output Artifact | 必須項目[cite: 4, 5] |
| :--- | :--- | :--- |
| **PM** | Decision | 対象, 判断(Approve/Reject/Revise), 理由, 影響, 次アクション |
| **Designer** | Spec | Unit ID, Goal, Scope, Out of Scope, Input, Output, Constraint, Acceptance Criteria |
| **Reviewer** | ReviewReport | 対象, 指摘事項, リスク, 判定(Pass/Conditional/Reject) |
| **Integrator-S** | Packet | Unit, Goal, Target, Purpose, Inputs, Outputs, Constraints, Dependencies, Acceptance Criteria, Implementation Skeleton |
| **Worker** | Code / WorkReport | Code(関数/モジュール単位), 実装内容, 自己検証結果 |
| **Debugger** | DebugReport | 対象, テスト項目, 現象(期待/実際), 判定(Pass/Fail) |
| **Infra** | TestPlan / TestResult | 検証条件, 手順, 環境情報 / 実機確認結果, 判定 |
| **Integrator-C** | ControlDecision / **ReworkInstruction** | 起因分類, 理由, 修正先, 修正指示, 次State / **修正対象, 主因, 副因, 修正内容, 影響範囲, 再検証方法, 次State** |
| **Human** | GoalInput / Result | プロジェクト定義, 優先順位 / 最終承認(OK/NG), 実機操作結果 |

## 2. Role別 Input Schema
各Roleが処理を開始するために必要な情報を定義する[cite: 1, 3, 5]。

*   **PM**: Human.GoalInput, Reviewer.ReviewReport, Integrator-C.ControlDecision, Human.ExecutionResult
*   **Designer**: PM.Decision, Reviewer.ReviewReport (**Review Reject時**), Integrator-C.ReworkInstruction (**仕様起因フィードバック時**)
*   **Reviewer**: Designer.Spec
*   **Integrator-S**: Designer.Spec (PM承認済み)
*   **Worker**: Integrator-S.Packet (**初回/仕様起因再作成時**), Integrator-C.ReworkInstruction (**実装起因フィードバック時**)
*   **Debugger**: Worker.Code, Integrator-S.Packet, Designer.Spec
*   **Infra**: Worker.Code, Integrator-S.Packet, Human.ExecutionResult, Integrator-C.ReworkInstruction (**環境起因フィードバック時**)
*   **Integrator-C**: Debugger.DebugReport, Infra.TestResult, Worker.Code, Integrator-S.Packet, Designer.Spec

## 3. Output → Input 接続表
上流のOutputを下流のどのInputとして扱うかの対応表[cite: 1, 4, 5]。

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
| **Integrator-C.ReworkInstruction**| **Worker / Designer / Infra** | **不具合修正・仕様変更・環境修正の具体的指示** |
| Integrator-C.ControlDecision| PM | 完了判定(Verified)の提示と承認依頼 |

## 4. Flow step → Role I/O 対応表
Flow v1.4のメインフローおよび代表的なフィードバックステップにおける入出力を定義する[cite: 3, 5]。

### Main Flow
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

### Feedback Flow (Representative)
| Step ID | Name | Input | Output |
| :--- | :--- | :--- | :--- |
| fb-impl-01 | Int-C to Worker | ReworkInstruction | Code (修正版) |
| fb-impl-03 | Debug/Infra to Int-C | DebugReport, TestResult | ControlDecision (再判定) |
| fb-spec-01 | Int-C to Designer | ReworkInstruction | Spec (修正版) |
| fb-spec-07 | Debug/Infra to Int-C | DebugReport, TestResult | ControlDecision (再判定) |
| fb-env-01 | Int-C to Infra | ReworkInstruction | TestPlan (手順修正版) |
| fb-env-04 | Infra to Int-C | TestResult | ControlDecision (再判定) |

## 5. 成果物命名規則
AI Business OS [S16] に基づくファイル命名規則を適用する[cite: 4, 5]。

### 固定ファイル名形式: `[対象]_[成果物種別].[ext]`
設計・指示・実装に関する継続的成果物[cite: 4]。
*   **Spec**: `U09_Spec.md`
*   **Packet**: `U09_Packet.md`
*   **Code**: `LoadCustomers_Code.vb`

### タイムスタンプ付与形式: `[対象]_[成果物種別]_[yyyymmdd]_[hhmmss].[ext]`
判定記録やレポート類[cite: 4]。
*   **Decision**: `U09_Decision_20260505_200000.md`
*   **ReviewReport**: `U09_ReviewReport_20260505_200000.md`
*   **DebugReport / TestResult**: `U09_DebugReport_20260505_200000.md`
*   **ControlDecision / ReworkInstruction**: `U09_ControlDecision_20260505_200000.md`

## 6. Schema Validation 方針
成果物の整合性を維持するための自動・手動検証ルール[cite: 1, 4, 5]。

1.  **Role Header 必須チェック**: [Role], [Scope] の欠落は invalid。
2.  **Naming Convention チェック**: セクション5で定義した固定/タイムスタンプ形式の遵守。
3.  **Dependencies 必須チェック**: `Packet` における依存関係未定義は無効。
4.  **Acceptance Criteria 形式**: 判定不可能な曖昧表現は invalid。
5.  **Output 制限**: COPY Mode（1ブロックのみ）の遵守。
6.  **Loop Exit 整合性**: ControlDecision.次StateがVerifiedである場合、`loop_exit_condition`を全て満たしていることを必須とする。

## 7. Out of Scope
*   Role Template のプロンプト本文作成[cite: 1]
*   バリデーションロジックのプログラム実装[cite: 1]
*   成果物保存・永続化機能[cite: 1]

## 8. Acceptance Criteria (U-FLOW-09)
*   全対象Role（Human〜Integrator-C）の入出力Schemaが確定していること[cite: 1]。
*   Inputが「上流Output」または「許可された例外」のみに限定されていること[cite: 1]。
*   各Schemaが U-FLOW-10 のRole Template作成にそのまま利用可能な粒度であること[cite: 1]。
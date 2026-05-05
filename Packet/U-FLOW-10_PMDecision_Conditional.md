U-FLOW-10_PMDecision_Conditional.md

Role: PM
Scope: Decision Only

# U-FLOW-10 PMDecision Conditional

## 対象

U-FLOW-10
Role Template 定義 / 実装

## 入力

* U-FLOW-10_Spec.md Rev.1
* U-FLOW-10 ReviewReport Rev.1 再レビュー
* U-FLOW-09_Spec.md Rev.1
* AI Business OS v1.6.3

## 判定

Conditional

## 理由

Reviewer再レビューにおいて、U-FLOW-10_Spec.md Rev.1 はConditional判定となった。

前回Reject指摘の主要項目は解消済みであり、以下は達成されている。

* 全9RoleのRole Template構成案追加
* 動的Variablesの明示
* Human Roleの追加
* Schema Invalid通知主体の明確化
* Infra向けReworkInstruction特殊条件の反映
* Decision系命名規則の反映

ただし、U-FLOW-11 Chat Runtime組み込みに進む前に解消すべき不整合が残っている。

## 要修正事項

### C01: Integrator-C Variablesの表記統一

Integrator-C TemplateのVariablesにおいて、以下の表記揺れを修正する。

修正前:

* `{{spec}}`
* `{{packet}}`

修正後:

* `{{spec_content}}`
* `{{packet_content}}`

理由:
他Templateで使用している変数名と揺れており、Runtime実装時に別変数として扱われるリスクがあるため。

### C02: Designer Variablesへのreview_report追加

Designer TemplateのVariablesに、Review Reject時のInputとして以下を追加する。

追加:

* `{{review_report}}`（Review Reject時）

修正後の例:

* `{{pm_decision}}`
* `{{review_report}}`（Review Reject時）
* `{{rework_instruction}}`（仕様起因フィードバック時）

理由:
U-FLOW-09_Spec Rev.1のDesigner Input Schemaでは、Review Reject時にReviewer.ReviewReportを受け取る定義であるため。

### C03: Human Template Variablesの用途別整理

Human TemplateのVariablesをOutput種別ごとに整理する。

修正方針:

* GoalInput時:

  * `{{unit_id}}`

* ExecutionResult時:

  * `{{infra_test_plan}}`

* ApprovalResult時:

  * `{{pm_approval_request}}`

理由:
Human OutputであるGoalInput / ExecutionResult / ApprovalResultとVariablesの対応を明確にするため。

### D: ReworkInstruction命名規則の確定

ControlDecisionとReworkInstructionを分離出力する方針に合わせ、ReworkInstructionのファイル命名規則を定義する。

PM方針:

* ControlDecision:

  * `[Unit]_ControlDecision_[yyyymmdd]_[hhmmss].md`

* ReworkInstruction:

  * `[Unit]_ReworkInstruction_[TargetRole]_[yyyymmdd]_[hhmmss].md`

例:

* `U-FLOW-10_ControlDecision_20260505_203000.md`
* `U-FLOW-10_ReworkInstruction_Worker_20260505_203000.md`
* `U-FLOW-10_ReworkInstruction_Designer_20260505_203000.md`
* `U-FLOW-10_ReworkInstruction_Infra_20260505_203000.md`

理由:
ReworkInstructionは差戻し先Roleによって内容が異なるため、TargetRoleをファイル名に含める。

## PM判断

U-FLOW-10はConditional承認とする。

ただし、U-FLOW-11へ進む前に、DesignerへU-FLOW-10_Spec Rev.2作成を依頼し、上記C01〜C03およびDを反映すること。

## 次アクション

Designerへ差戻し。

作成対象:

* `U-FLOW-10_Spec.md Rev.2`

修正範囲:

* C01 Integrator-C Variables表記統一
* C02 Designer Variablesへのreview_report追加
* C03 Human Template Variables用途別整理
* D ReworkInstruction命名規則確定

Rev.2作成後、Reviewerへ再レビューを依頼する。

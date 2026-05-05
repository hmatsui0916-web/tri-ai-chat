U-FLOW-09_Decision.md

Role: PM
Scope: Decision Only

# U-FLOW-09 Decision

## 対象

U-FLOW-09
Role I/O Schema 定義

## 背景

U-FLOW-01〜U-FLOW-08により、AI Business OS Full Flow v1.4 をUI上で進行できるFlow Runtime基盤は完成した。

完了済み範囲:

* Flow v1.4読込・保存・プレビュー
* template_ref解決
* state + route_context routing resolver
* ControlReview runtime resolver
* Human gate / external handoff UI
* parallel / join handling
* feedback loop iteration counter
* Flow Engine統合動作確認

これにより、Flowを進行させる工程管理エンジンは成立した。

一方で、OSを実運用するには、各Roleが何をInputとして受け取り、何をOutputとして返すかを固定する必要がある。

## 判定

次Unitとして **U-FLOW-09 Role I/O Schema 定義** を開始する。

## 理由

AI事業OSの安定運用において最重要なのは、各RoleのOutputを固定することである。

理由:

* 下流Roleは上流RoleのOutputをInputとして処理する
* Output形式が揺れると、下流Inputが不安定になる
* Inputが不安定になると、Role TemplateやFlow Runtimeがあっても運用が破綻する
* Roleごとの責務境界をSchemaで固定することで、役割越境と推論ブレを抑制できる

したがって、Chat Runtime組み込みより先に、Role I/O Schemaを定義する。

## 基本方針

### 1. Output First

Role設計はOutput定義を最優先とする。

先に定義するもの:

* 各Roleが返す成果物種別
* 成果物の必須項目
* 判定項目
* 次Roleへ渡すべき構造
* 保存ファイル名
* Role Header

### 2. InputはOutputから逆算する

Inputは、Outputを作るために必要なデータとして定義する。

原則:

* 下流RoleのInputは上流RoleのOutputから選択する
* 上流Output以外の任意文脈をInputにしない
* Humanの明示入力、Flow定義、Role Template、固定ルールのみ例外として許可する

### 3. Role Templateは次Unitで扱う

U-FLOW-09ではRole Template本文の完成までは扱わない。

本Unitでは、U-FLOW-10でRole Templateを実装できるように、RoleごとのInput / Output Schemaを固定する。

## 対象Role

U-FLOW-09で定義対象とするRole:

* Human
* PM
* Designer
* Reviewer
* Integrator-S
* Worker
* Debugger
* Infra
* Integrator-C

## 想定Output Schema

### PM

Output:

* Decision

用途:

* Unit開始判断
* Review結果判断
* Integrator-C結果承認
* Human回付判断

### Designer

Output:

* Spec

用途:

* 設計成果物
* ReviewerのInput
* Integrator-SのInput

### Reviewer

Output:

* ReviewReport

用途:

* Spec検証結果
* PM判断Input
* 仕様起因feedback時の再確認結果

### Integrator-S

Output:

* Packet

用途:

* Worker実装指示
* Debugger / Infra検証の参照Input
* Integrator-C起因判定Input

### Worker

Output:

* Code
* WorkReport

用途:

* Debugger机上検証Input
* Infra実機検証Input
* Integrator-C起因判定Input

### Debugger

Output:

* DebugReport

用途:

* Integrator-C起因判定Input

### Infra

Output:

* TestPlan
* TestResult

用途:

* Human実機確認指示
* Integrator-C起因判定Input

### Integrator-C

Output:

* ControlDecision
* ReworkInstruction

用途:

* feedback branch選択
* State / route_context制御
* PM判断Input
* Worker / Designer / Infraへの差戻しInput

### Human

Output:

* GoalInput
* ApprovalResult
* ExecutionResult

用途:

* PM判断Input
* Infra実機確認Input
* 最終承認Input

## U-FLOW-09 Scope

本Unitで作成するもの:

1. Role別Output Schema定義
2. Role別Input Schema定義
3. Output → Input接続表
4. Flow step → Role I/O対応表
5. 成果物種別一覧
6. Schema validationの最低条件
7. U-FLOW-10 Role Template作成に必要な前提

## Out of Scope

本Unitでは以下を扱わない。

* Role Template本文の完成
* プロンプト生成UI
* Chat Runtimeへの実装
* API連携
* 成果物保存機能の実装
* Validationロジック実装
* 自動実行

## Acceptance Criteria

U-FLOW-09は以下を満たした場合にPASSとする。

* 全対象RoleのOutput Schemaが定義されている
* 全対象RoleのInput Schemaが定義されている
* 各RoleのInputが、上流Outputまたは許可された例外入力に限定されている
* Output → Input接続表が定義されている
* Flow step → Role I/O対応表が定義されている
* 成果物種別とファイル命名規則が定義されている
* 必須項目欠落時のSchema invalid条件が定義されている
* U-FLOW-10 Role Template作成に進める粒度になっている

## 次アクション

Designerへ回付し、U-FLOW-09 Role I/O Schema Specを作成する。

## Designerへの依頼

次の成果物を作成すること。

File:
U-FLOW-09_Spec.md

Role:
Designer

Scope:
Role I/O Schema Design

作成内容:

* Role別Output Schema
* Role別Input Schema
* Output → Input接続表
* Flow step → Role I/O対応表
* Schema Validation方針
* Out of Scope
* Acceptance Criteria

## PM判断

U-FLOW-09を開始する。

本Unitでは、AI事業OSの実運用化に向け、Role I/O Schemaを最優先で固定する。

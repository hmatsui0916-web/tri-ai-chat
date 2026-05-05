U-FLOW-10_PMDecision_Start.md

Role: PM
Scope: Decision Only

# U-FLOW-10 PMDecision Start

## 対象

U-FLOW-10
Role Template 定義 / 実装

## 判定

START

## 背景

U-FLOW-09により、AI事業OSのRole I/O Schema定義は完了した。

次に、各Roleが定義済みOutput Schemaに従って安定した成果物を出力できるよう、Role Templateを定義する。

## 目的

Role別に、Output Schemaを安定生成するためのRole Templateを作成する。

Role Templateは人格設定ではなく、以下を固定するための制御テンプレートとする。

* Role責務
* Scope
* Input使用範囲
* Output Schema
* 禁止事項
* 判定基準
* 出力形式
* Schema invalid条件
* 再出力条件

## 対象Role

* Human
* PM
* Designer
* Reviewer
* Integrator-S
* Worker
* Debugger
* Infra
* Integrator-C

## 基本方針

### 1. Output Schema準拠

U-FLOW-09_Spec Rev.1で定義したOutput Schemaに準拠する。

### 2. Input制限

各Roleは、定義済みInput Schemaに含まれる情報のみ使用する。

任意の過去文脈、推測、未指定資料の混入は禁止する。

### 3. 役割越境禁止

各Roleは自Roleの責務を超えない。

例:

* DesignerはPacketを作らない
* ReviewerはSpecを修正しない
* Integrator-Sは実装しない
* Workerは仕様変更しない
* Debuggerは実装しない
* Infraはコード修正しない
* Integrator-Cは起因未分類で差戻ししない

### 4. Templateは実運用可能粒度

Role Templateは、Chat Runtimeが各Role呼び出し時に使用できる粒度で作成する。

## U-FLOW-09からの申し送り

### 申し送りA

Infra向けReworkInstructionは、Worker / Designer向けReworkInstructionと内容差異を明確にする。

特に、環境起因feedbackでは以下を明示する。

* コード修正禁止
* 環境条件修正
* 実機確認手順修正
* Human実行結果の回収・整理

### 申し送りB

ControlDecisionとReworkInstructionの出力単位をU-FLOW-10で確定する。

選択肢:

* ControlDecision内にReworkInstructionを含める
* ControlDecisionとReworkInstructionを別成果物に分離する

### 申し送りC

Decision系成果物は、Unit内で用途が複数発生するため、汎用名 `[Unit]_Decision.md` は使用しない。

今後は以下に分離する。

* `[Unit]_PMDecision_Start.md`
* `[Unit]_PMDecision_Final.md`
* `[Unit]_PMDecision_Rework.md`
* `[Unit]_PMDecision_Hold.md`

## Scope

本Unitで作成するもの:

* Role別Template定義
* Template共通ルール
* Role Header仕様
* Input制限ルール
* Output Schema準拠ルール
* Role別禁止事項
* Schema invalid時の再出力ルール
* U-FLOW-11 Chat Runtime組み込みに必要なTemplate仕様

## Out of Scope

* Chat Runtime実装
* UI実装
* API連携
* 成果物保存実装
* 自動Validation実装
* Flow Engineロジック変更

## Acceptance Criteria

* 全対象RoleのRole Templateが定義されている
* 各Role TemplateがU-FLOW-09のInput / Output Schemaに準拠している
* Role Headerが固定されている
* 各RoleのInput使用範囲が明示されている
* 各Roleの禁止事項が明示されている
* Output崩れ時のSchema invalid条件が定義されている
* 再出力条件が定義されている
* Infra向けReworkInstructionの特殊条件が反映されている
* ControlDecisionとReworkInstructionの出力単位が確定している
* Decision系命名規則が反映されている
* U-FLOW-11 Chat Runtime組み込みに進める粒度になっている

## 次アクション

Designerへ回付し、U-FLOW-10 Role Template Specを作成する。

## PM判断

U-FLOW-10を開始する。

U-FLOW-12_PMDecision_Start.md

Role: PM
Scope: Decision Only

# U-FLOW-12 PMDecision Start

## 対象

U-FLOW-12
Artifact Save Runtime

## 判定

START

## 背景

U-FLOW-11により、Flow Runtime / Prompt Runtime / Chat Runtime の連携は最小運用可能状態に到達した。

ただし現状では、各Role OutputをHumanがコピーし、ファイル名を判断し、保存し、次Roleへ渡す必要がある。

この手作業はAI事業OS運用上の主要ボトルネックである。

## 目的

Role OutputをArtifactとして保存し、Flow Runtime上で次stepのInputとして参照できるようにする。

本Unitでは、完全な成果物管理システムではなく、AI事業OSの最小運用に必要なArtifact保存・参照機能を実装対象とする。

## Scope

本Unitで扱うもの:

* Role Output受領欄
* Output本文からの `File:` 抽出
* Artifact種別判定
* Unit ID判定
* Role判定
* 保存ファイル名決定
* 保存先パス決定
* 保存実行
* 保存済みArtifact一覧表示
* current_stepとの紐付け
* next_step Input候補としての参照
* PMDecision命名Phase対応
* 同名衝突防止

## Out of Scope

* Output Schema Validation完全実装
* Git commit自動化
* 複数バージョン差分比較
* Artifact全文検索
* 高度な依存関係解析
* クラウド同期
* LLMによる自動修正
* 完全自動保存

## 命名ルール

### 基本方針

`[Unit]_Decision.md` のような汎用名は禁止する。

PM判断成果物は用途ごとに分離する。

### PMDecision形式

`[Unit]_PMDecision_[Phase].md`

Phase:

* `Start`
* `SpecApproval`
* `PacketApproval`
* `WorkerApproval`
* `ControlApproval`
* `Final`
* `Conditional`
* `Hold`

差戻し判断:

`[Unit]_PMDecision_Rework_[TargetRole].md`

例:

* `U-FLOW-12_PMDecision_Start.md`
* `U-FLOW-12_PMDecision_SpecApproval.md`
* `U-FLOW-12_PMDecision_PacketApproval.md`
* `U-FLOW-12_PMDecision_ControlApproval.md`
* `U-FLOW-12_PMDecision_Final.md`
* `U-FLOW-12_PMDecision_Rework_Designer.md`

### ReworkInstruction形式

`[Unit]_ReworkInstruction_[TargetRole]_[timestamp].md`

例:

* `U-FLOW-12_ReworkInstruction_Worker_20260506_120000.md`
* `U-FLOW-12_ReworkInstruction_Infra_20260506_120000.md`

### Report系形式

`[Target]_ReviewReport_[timestamp].md`
`[Target]_DebugReport_[timestamp].md`
`[Target]_TestResult_[timestamp].md`

### 固定成果物形式

Spec / Packetなど、改訂管理する成果物は固定名を優先する。

例:

* `U-FLOW-12_Spec.md`
* `U-FLOW-12_Packet.md`

## 保存先ルール案

基本構成:

* `units/[Unit]/decisions/`
* `units/[Unit]/specs/`
* `units/[Unit]/packets/`
* `units/[Unit]/reports/`
* `units/[Unit]/rework/`
* `units/[Unit]/outputs/`
* `units/[Unit]/logs/`

例:

* `units/U-FLOW-12/decisions/U-FLOW-12_PMDecision_Start.md`
* `units/U-FLOW-12/specs/U-FLOW-12_Spec.md`
* `units/U-FLOW-12/packets/U-FLOW-12_Packet.md`
* `units/U-FLOW-12/reports/U-FLOW-12_ReviewReport_20260506_120000.md`

## 基本方針

### 1. Human確認後保存

Artifact保存は完全自動ではなく、Humanが内容確認後に保存ボタンを押す方式とする。

### 2. File Header優先

Role Output先頭の `File:` を第一候補とする。

ただし、PMDecisionなど命名衝突リスクがある成果物はRuntime側でPhase補正できること。

### 3. Flow Context連動

保存時に以下を紐付ける。

* unit_id
* role
* current_step
* state
* route_context
* artifact_type
* filename
* saved_path
* timestamp

### 4. 次Role Input化

保存済みArtifactは、次stepのPrompt生成時にInput候補として選択できること。

## Acceptance Criteria

* Role Output本文を貼り付けられる
* `File:` 行からファイル名を抽出できる
* Artifact種別を判定できる
* Unit IDを判定できる
* 保存先フォルダを自動提案できる
* Human確認後にArtifactを保存できる
* 保存済みArtifact一覧を表示できる
* current_stepとArtifactを紐付けできる
* next_step Prompt生成時に保存済みArtifactをInput候補として参照できる
* PMDecisionはPhase付き命名規則で保存できる
* `[Unit]_Decision.md` を使用しない
* 同名衝突時に上書きせず警告または別名提案できる
* ReworkInstructionはTargetRole付き命名規則で保存できる
* U-FLOW-11のChat Runtimeを壊さない

## 次アクション

Designerへ回付し、U-FLOW-12 Artifact Save Runtime Specを作成する。

## Designerへの依頼

File:
U-FLOW-12_Spec.md

Role:
Designer

Scope:
Artifact Save Runtime Design

作成内容:

* Artifact保存UI仕様
* `File:` 抽出仕様
* Artifact種別判定仕様
* ファイル命名規則
* PMDecision Phase判定仕様
* 保存先フォルダ判定仕様
* 同名衝突防止仕様
* 保存済みArtifact一覧仕様
* current_stepとの紐付け仕様
* next_step Input参照仕様
* Acceptance Criteria

## PM判断

U-FLOW-12を開始する。

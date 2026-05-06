U-FLOW-12_PMDecision_Start.md

Role: PM
Scope: Decision Only

# U-FLOW-12 PMDecision Start Rev.1

## 対象

U-FLOW-12
Artifact Save Runtime

## 判定

START / Conditional修正反映済み

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
* `File:` 欠落時のHuman手動入力 / 候補名提示
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
* PMDecision命名規則の拡張反映
* 同名衝突防止
* 同一Phase複数発生時のRev名提案

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

U-FLOW-12では、U-FLOW-10で定義したPMDecision命名規則を実運用向けに拡張する。

旧定義:

* `[Unit]_PMDecision_Start.md`
* `[Unit]_PMDecision_Final.md`
* `[Unit]_PMDecision_Rework.md`
* `[Unit]_PMDecision_Hold.md`

新定義:

* `[Unit]_PMDecision_Start.md`
* `[Unit]_PMDecision_SpecApproval.md`
* `[Unit]_PMDecision_PacketApproval.md`
* `[Unit]_PMDecision_WorkerApproval.md`
* `[Unit]_PMDecision_ControlApproval.md`
* `[Unit]_PMDecision_Final.md`
* `[Unit]_PMDecision_Conditional.md`
* `[Unit]_PMDecision_Hold.md`
* `[Unit]_PMDecision_Rework_[TargetRole].md`

### 改訂理由

U-FLOW-10の4Phase定義では、実運用時に以下のPM判断が同名または用途不明になりやすい。

* Designerへ渡す開始判断
* Designer Spec承認
* Integrator-S Packet承認
* Integrator-C Verified後のPM承認
* Human承認後のUnit完了判断
* 差戻し判断

そのため、Artifact Save Runtimeでは、PMDecisionをFlow上の用途単位で保存できるようにする。

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
* `U-FLOW-12_PMDecision_Conditional.md`
* `U-FLOW-12_PMDecision_Rework_Designer.md`
* `U-FLOW-12_PMDecision_Rework_IntegratorS.md`
* `U-FLOW-12_PMDecision_Rework_Worker.md`
* `U-FLOW-12_PMDecision_Rework_Infra.md`

### PMDecision Phase定義

| Phase               | 用途                            |
| ------------------- | ----------------------------- |
| Start               | Unit開始判断 / 初回RoleへのInput      |
| SpecApproval        | Designer Spec + Reviewer結果の承認 |
| PacketApproval      | Integrator-S Packetの承認        |
| WorkerApproval      | Worker実装結果に対するPM判断が必要な場合      |
| ControlApproval     | Integrator-C Verified後のPM承認   |
| Final               | Human最終承認後のUnit完了判断           |
| Conditional         | 条件付き承認                        |
| Hold                | 保留判断                          |
| Rework_[TargetRole] | 指定Roleへの差戻し判断                 |

### Rework命名規則

PMDecision_Reworkは、TargetRole付き命名に改訂する。

形式:

`[Unit]_PMDecision_Rework_[TargetRole].md`

例:

* `U-FLOW-12_PMDecision_Rework_Designer.md`
* `U-FLOW-12_PMDecision_Rework_IntegratorS.md`
* `U-FLOW-12_PMDecision_Rework_Worker.md`
* `U-FLOW-12_PMDecision_Rework_Infra.md`

理由:

Rework判断は差戻し先Roleによって内容が異なるため、TargetRoleをファイル名に含める。

なお、`PMDecision_Rework` と `ReworkInstruction` は別成果物とする。

* PMDecision_Rework: PMの差戻し判断
* ReworkInstruction: Integrator-C等が作成する具体的な再投入指示

### 同一Phase複数発生時の扱い

原則として、1Unit内で同一PhaseのPMDecisionは1件のみとする。

ただし、再承認・再判定などにより同一Phaseが複数発生する場合は、上書き禁止とし、保存時に以下の順で処理する。

1. 同名ファイルが存在する場合は警告する
2. Humanに上書き禁止を提示する
3. 別名候補を提示する
4. 別名形式は以下とする

`[Unit]_PMDecision_[Phase]_RevN.md`

例:

* `U-FLOW-12_PMDecision_SpecApproval_Rev2.md`
* `U-FLOW-12_PMDecision_ControlApproval_Rev2.md`

Reworkの場合:

`[Unit]_PMDecision_Rework_[TargetRole]_RevN.md`

例:

* `U-FLOW-12_PMDecision_Rework_Worker_Rev2.md`

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

`File:` 行が存在しない場合、Artifact Save Runtimeは自動保存を停止し、Humanへ警告を表示する。

最小運用として、以下を許可する。

* Humanがファイル名を手動入力する
* RuntimeがArtifact Type / Unit / Role / current_stepから候補名を提示する
* Human確認後に保存する

ただし、Output Schema Validation完全実装は本UnitのOut of Scopeとする。

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
* `File:` 欠落時に保存を停止し、Human手動入力または候補名提示に切り替えられる
* Artifact種別を判定できる
* Unit IDを判定できる
* 保存先フォルダを自動提案できる
* Human確認後にArtifactを保存できる
* 保存済みArtifact一覧を表示できる
* current_stepとArtifactを紐付けできる
* next_step Prompt生成時に保存済みArtifactをInput候補として参照できる
* PMDecisionはPhase付き命名規則で保存できる
* PMDecision_Reworkの場合、TargetRole付き命名規則で保存できる
* `[Unit]_Decision.md` を使用しない
* 同名衝突時に上書きせず警告または別名提案できる
* 同一PhaseのPMDecisionが既存の場合、上書きせず警告またはRev名を提案できる
* ReworkInstructionはTargetRole付き命名規則で保存できる
* U-FLOW-10の旧PMDecision命名規則をU-FLOW-12で拡張したものとして扱える
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
* `File:` 欠落時のHuman手動入力 / 候補名提示仕様
* Artifact種別判定仕様
* ファイル命名規則
* PMDecision Phase判定仕様
* PMDecision命名規則拡張仕様
* PMDecision_Rework TargetRole付き命名仕様
* 保存先フォルダ判定仕様
* 同名衝突防止仕様
* 同一Phase複数発生時のRev名提案仕様
* 保存済みArtifact一覧仕様
* current_stepとの紐付け仕様
* next_step Input参照仕様
* Acceptance Criteria

## PM判断

U-FLOW-12を開始する。

ただし、Designerへ回付する際は、本Rev.1の命名規則改訂を正とする。

U-FLOW-10の旧PMDecision命名規則は、U-FLOW-12以降では本ルールにより拡張されたものとして扱う。

U-FLOW-11_PMDecision_Start.md

Role: PM
Scope: Decision Only

# U-FLOW-11 PMDecision Start

## 対象

U-FLOW-11
Chat Runtime 組み込み

## 判定

START

## 背景

U-FLOW-01〜U-FLOW-08により、Flow Runtime基盤は完了した。

U-FLOW-09により、Role I/O Schema定義は完了した。

U-FLOW-10により、Role Template定義は完了した。

次に、Flow上のcurrent_stepに応じて、対象Roleへ適切なRole TemplateとInputを組み立て、チャット列で実行できるようにする。

## 目的

Flow RuntimeとChat Runtimeを接続し、現在stepに応じてRole実行プロンプトを生成・投入できる状態にする。

## Scope

本Unitで作成するもの:

* current_step から実行対象Roleを解決する処理
* Role Template選択処理
* Template Variables埋め込み処理
* 必須Input / 任意Input / 条件付きInputの判定
* Role Header付きPrompt生成
* 対象Role列へのPrompt投入
* external Worker向けhandoff Prompt生成
* Role Output受領後のstep完了運用
* U-FLOW-10申し送りE/Fの反映

## U-FLOW-10からの申し送り

### 申し送りE

Worker Templateの `{{rework_instruction}}` は条件付きInputである。

初回実装時には存在しないため、Runtimeでは以下を区別すること。

* 必須Input
* 任意Input
* 条件付きInput

### 申し送りF

Integrator-S Templateでは `{{spec_content}}` のみがVariablesとして定義されている。

ただし、Integrator-S Inputは「PM承認済みDesigner.Spec」であるため、U-FLOW-11では以下を整理する。

* PM承認確認をRuntime側で担保するか
* `{{pm_decision}}` をIntegrator-S Template Inputに含めるか
* Flow state / route_contextにより承認済み状態を保証するか

## 基本方針

### 1. Flow優先

Role実行は必ずFlowのcurrent_stepに基づく。

任意のRole呼び出しは禁止する。

### 2. Template優先

PromptはRole Templateから生成する。

Humanが自由文でRole Promptを作る運用は標準経路にしない。

### 3. Input制限

Roleに渡すInputは、U-FLOW-09で定義されたInput Schemaに限定する。

未定義Input、過去文脈、推測補完は禁止する。

### 4. Output保存は次Unit候補

本UnitではPrompt生成とRole実行接続を優先する。

成果物保存・履歴管理・Validation自動化は、必要に応じて後続Unitへ分離する。

## Out of Scope

* LLM API自動送信
* Worker自動API連携
* 成果物永続化の完成
* Output Schema自動Validationの完成
* 複数成果物のバージョン管理
* 本番UI完成
* Flow Engineロジック変更

## Acceptance Criteria

* current_stepから対象Roleを解決できる
* current_stepから使用Role Templateを解決できる
* Template VariablesへInputを埋め込める
* 必須Input不足時にPrompt生成を停止できる
* 条件付きInputを条件に応じて扱える
* Role Header付きPromptを生成できる
* 対象Role列へPromptを投入できる
* Worker external_handoff用Promptを生成できる
* Integrator-S実行時にPM承認済みSpecであることを担保できる
* Role Output受領後、Humanがstep完了操作できる
* U-FLOW-11完了後、Flowに沿ったRole実行の最小運用が可能になる

## 次アクション

Designerへ回付し、U-FLOW-11 Chat Runtime組み込みSpecを作成する。

## Designerへの依頼

File:
U-FLOW-11_Spec.md

Role:
Designer

Scope:
Chat Runtime Integration Design

作成内容:

* current_step → Role解決仕様
* current_step → Role Template解決仕様
* Variables埋め込み仕様
* 必須 / 任意 / 条件付きInput判定仕様
* Prompt生成仕様
* Role列への投入仕様
* external Worker handoff Prompt仕様
* Role Output受領後のstep完了運用
* U-FLOW-10申し送りE/Fへの対応
* Acceptance Criteria

## PM判断

U-FLOW-11を開始する。

U-FLOW-08R1_Packet.md

Role: Integrator-S
Scope: Structure

# U-FLOW-08R1 Worker Packet

## Unit

U-FLOW-08R1

## Title

Flow Engine 統合テスト用 Runtime UI 追加

## Goal

U-FLOW-08_TestPlan Rev1 の TC-01〜TC-12 を Human が UI 上で実行できるように、Flow実行確認用の Runtime UI を追加・補強する。

本Unitの目的は本番完成UIの構築ではない。
U-FLOW-08統合動作確認を実施可能にするための検証用UIを作ることを最優先とする。

## Target

対象リポジトリ:

* tri-ai-chat-flow-ui

主対象ファイル:

* app/page.tsx

補助対象ファイル:

* app/globals.css
* 必要に応じて app/page.tsx 内の型定義・utility関数・state定義・UIブロック

既存構成上、Flow関連の型定義、template_ref解決、routing resolver、ControlReview resolver、parallel/join、loop counter、Runtime UIの一部は `app/page.tsx` に集約されている。
そのため、本Unitでは原則として `app/page.tsx` を中心に実装する。

## Purpose

U-FLOW-08は、Flow Engine基礎実装フェーズ完了後の統合動作確認Unitである。

しかし現状では、Flow定義の入力・保存UIは存在するものの、Humanが以下を確認・操作するUIが不足している。

* Flow構造確認
* Runtime状態確認
* current_step / next_step確認
* step完了操作
* decision branch選択
* cause_classification branch選択
* Verified条件入力
* external_handoff手動完了
* manual_execution完了
* parallel / join状態確認
* loop count確認
* guard状態確認

そのため、U-FLOW-08R1では、U-FLOW-08_TestPlan Rev1をHumanが実行できる状態にする。

## Inputs

Workerへ渡す入力:

1. U-FLOW-08R1_Decision.md
2. U-FLOW-08_TestPlan Rev1.md
3. ai-business-os-flow-v1.4.json
4. tri-ai-chat-flow-ui.zip または対象リポジトリ一式

## Outputs

Workerは以下を提出すること。

1. 実装修正版リポジトリ
2. 修正ファイル一覧
3. 実装内容サマリ
4. U-FLOW-08R1 Acceptance Criteria対応表
5. Human向け操作手順
6. 未実装・制約・既知注意点があれば明記

## Constraints

### Flow定義制約

* ai-business-os-flow-v1.4.json の定義は変更しない
* Flow JSON側でUI都合の項目追加をしない
* route_context / state / step id / branch id / max_iterations の意味を変更しない
* template_ref の解決仕様を変更しない

### 実装制約

* 既存のFlow Engineロジックを優先して使う
* 既存の routing resolver / ControlReview resolver / parallel handler / loop counter を可能な限り再利用する
* 本番完成UI化しすぎない
* 大規模リファクタリングは避ける
* UIは検証用途として見やすく、操作可能であればよい
* 既存チャット機能、カラム設定、モデル設定、添付機能を壊さない
* Worker API自動送信は実装しない
* external_handoff は手動完了扱いのみとする
* manual_execution はHuman実施完了をUIで入力できればよい

### 優先順位

1. TC-01〜TC-12をHumanが実行できること
2. Runtime状態とGuard状態が確認できること
3. 操作ログまたは状態遷移が追えること
4. UIの見た目調整
5. コード分割・設計整理

## Dependencies

本Unitは以下を前提とする。

* U-FLOW-01: Flow v1.4読込・保存・プレビュー対応 PASS
* U-FLOW-02: template_ref解決 PASS
* U-FLOW-03: state + route_context routing resolver PASS
* U-FLOW-04: ControlReview runtime resolver PASS
* U-FLOW-05 / U-FLOW-05R1: Human gate / external handoff UI PASS
* U-FLOW-06: parallel / join handling PASS
* U-FLOW-07: feedback loop iteration counter PASS

## Required UI

## 1. Flow読込結果表示

Flow保存後、選択中Flowについて以下をUI上で確認できること。

表示項目:

* flow_id
* flow name
* version
* source_spec
* main_flow step一覧
* feedback_flow branch一覧
* 各branch内 step一覧
* template_ref解決状態
* template_unresolved状態

main_flow step一覧には最低限以下を表示する。

* id
* name
* type
* route_context
* from
* to
* state_from
* state_to
* human_gate
* template_ref
* template_unresolved

feedback_flow branch一覧には最低限以下を表示する。

* branch key

  * implementation
  * specification
  * environment
* route_context
* loop
* max_iterations
* state_rollback_to
* condition
* fallback
* branch内step一覧

## 2. Runtime状態表示

現在のRuntime状態として以下を表示すること。

* state
* route_context
* current_step
* next_step
* next_step candidates
* current step type
* current step from / to
* current step state_from / state_to
* current step human_gate
* current step route_context
* loop counts

  * implementation
  * specification
  * environment
* effective max_iterations
* parallel状態

  * Debugger完了状態
  * Infra完了状態
  * join mode
  * all_complete判定

補足:

* current_stepは、Humanが今操作対象として認識できるstepを指す
* next_stepは、現在の state + route_context から routing resolver が解決した候補を指す
* 候補が複数またはspecial refの場合は、それもUIに出すこと

## 3. 操作UI

HumanがTC-01〜TC-12を実行できるよう、以下の操作UIを用意すること。

### 3.1 Runtime初期化

* Runtime Resetボタン
* 初期値:

  * state = Draft
  * route_context = main
  * loop counts = 0
  * parallel state = null
  * selected decision / cause / verified inputs = default

### 3.2 state / route_context 手動設定

異常系・分岐系TCを実行するため、以下を手動設定できるUIを用意すること。

* state selector
* route_context selector
* Apply Runtime Stateボタン

用途:

* TC-02
* TC-03
* TC-04
* TC-05
* TC-06
* TC-07
* TC-08
* TC-09
* TC-10
* TC-11
* TC-12

### 3.3 current_step完了ボタン

通常stepについて、Human gate完了またはstep完了として進めるボタンを用意する。

表示名例:

* Complete current step
* Approve human gate
* Advance

動作:

* step.state_to を Runtime state に反映
* step.route_context を Runtime route_context に反映
* 操作後に next_step を再解決
* human_gate が true の場合、Human操作なしで自動進行しない

### 3.4 decision選択

Reviewer Decision stepで以下を選択できること。

* pass
* conditional
* reject

対象step:

* main-04
* fb-spec-03

期待動作:

* pass:

  * to = PM
  * state_to = Reviewed
* conditional:

  * to = PM
  * state_to = Reviewed
* reject:

  * to = Designer
  * state_to = Designed

注意:

* decision_key = review_decision を使用すること
* main_flow と feedback_specification の両方で動作すること
* template_ref解決済みdecision stepとして扱うこと

### 3.5 cause_classification選択

ControlReviewで以下を選択できること。

* implementation
* specification
* environment

期待動作:

* implementation:

  * route_context = feedback_implementation
  * state = InDev
  * first step = fb-impl-01
  * implementation loop count +1
* specification:

  * route_context = feedback_specification
  * state = Designed
  * first step = fb-spec-01
  * specification loop count +1
* environment:

  * route_context = feedback_environment
  * state = Debug
  * first step = fb-env-01
  * environment loop count +1

### 3.6 Verified条件入力

ControlReviewでVerified transitionを確認できるUIを用意する。

最低限、以下を個別に入力できること。

* Debugger Pass
* Infra/Human Acceptance OK
* Acceptance Criteria met
* Integrator-C cause review completed

すべてtrueの場合:

* verified_transitionを優先
* state = Verified
* route_context = main
* next_step = main-09
* feedback branchへ進まない

注意:

* 既存の `controlVerified` booleanのみで簡略化されている場合は、TC-08実行用に4条件のチェックボックスへ拡張する
* 内部判定は4条件ANDで `verified = true` として扱う

### 3.7 external_handoff手動完了ボタン

対象step:

* main-06
* fb-impl-01
* fb-spec-05

表示・操作:

* external_handoff待ち状態を表示
* send_api_request = false を表示
* Worker送信は自動実行しない
* Copy handoff textボタンを維持または追加
* Manual external handoff completedボタンで次へ進める

期待動作:

* Human操作なしで自動進行しない
* 手動完了後に state_to / route_context を反映する

### 3.8 manual_execution完了ボタン

対象step:

* fb-env-02

表示・操作:

* manual_execution待ち状態を表示
* Human実機作業待ちであることを表示
* Manual execution completedボタンで次へ進める

期待動作:

* state は Debug を維持
* route_context は feedback_environment を維持
* 次stepとして fb-env-03 へ進める

### 3.9 Debugger / Infra 完了ボタン

parallel stepで、以下を個別に完了操作できること。

対象step:

* main-07
* fb-impl-02
* fb-spec-06

操作:

* Debugger完了
* Infra完了
* 両方リセット

期待動作:

* Debuggerのみ完了ではjoin不可
* Infraのみ完了ではjoin不可
* 両方完了でjoin可能
* join完了ボタンが有効化される

### 3.10 join完了ボタン

join stepまたはparallel完了後のjoin判定で、all_complete条件を満たした場合のみ次へ進めること。

対象step:

* main-08
* fb-impl-03
* fb-spec-07

期待動作:

* parallel未完了なら進行不可
* all_completeなら state_to を反映
* route_contextは該当stepの route_context を維持
* main-08後は ControlReview に到達する

## 4. Guard表示

以下のGuard状態をUI上で明示すること。

### 4.1 template_unresolved

表示条件:

* step.template_unresolved === true
* template_ref が解決できない
* routing対象外になったstepがある

表示内容:

* template_unresolved: true
* unresolved template_ref名
* 該当step id

期待動作:

* 未解決template stepは実行対象にしない
* 実行ボタンをdisabledにする
* 代替stepがなければ停止状態を表示する

### 4.2 human_gate待ち

表示条件:

* current_step.human_gate === true

表示内容:

* human_gate required
* Human操作待ち

期待動作:

* Human操作なしで自動進行しない

### 4.3 external_handoff待ち

表示条件:

* current_step.type === external_handoff

表示内容:

* external_handoff waiting
* send_api_request = false
* handoff target = Worker / VSCode Copilot
* output_return = paste_or_file_attach

期待動作:

* 自動API送信しない
* 手動完了操作のみで進行する

### 4.4 manual_execution待ち

表示条件:

* current_step.type === manual_execution

表示内容:

* manual_execution waiting
* Human実機確認待ち

期待動作:

* Human手動完了操作が必要

### 4.5 join未完了

表示条件:

* current parallel stepのjoin = all_complete
* Debugger / Infraのどちらかが未完了

表示内容:

* join incomplete
* Debugger status
* Infra status

期待動作:

* join完了前に次工程へ進まない

### 4.6 max_iterations到達

表示条件:

* next loop count === max_iterations
* next loop count > max_iterations

表示内容:

* branch key
* current count
* next count
* max_iterations
* warningまたはblocked reason

期待動作:

* 1〜3回目は許容
* 3回目到達時にwarning
* 4回目は進行停止またはHuman判断待ち
* branch別counterは独立

## Implementation Skeleton

## A. 型定義追加・補強

必要に応じて以下を追加する。

* RuntimeStepStatus
* RuntimeGuardStatus
* VerifiedConditionInputs
* RuntimeActionLog
* DecisionInput
* EnvironmentFallbackInput

例:

type VerifiedConditionInputs = {
debuggerPass: boolean;
infraHumanAcceptanceOk: boolean;
acceptanceCriteriaMet: boolean;
integratorCauseReviewCompleted: boolean;
};

type RuntimeActionLog = {
id: string;
timestamp: string;
action: string;
beforeState: string;
beforeRouteContext: string;
afterState: string;
afterRouteContext: string;
stepId?: string;
note?: string;
};

## B. Runtime state補強

既存stateに以下を追加する。

* currentStepId
* selectedDecision
* verifiedConditionInputs
* codeChangeRequired
* reclassifyCause
* runtimeActionLogs
* guardStatus

ただし、大規模化しすぎる場合は最小構成でよい。

## C. current_step解決

既存の `flowRuntimeNextSteps` は next candidates 表示として維持する。

追加で、Human操作対象として `currentRuntimeStep` を導出する。

優先順:

1. Runtime上で明示選択された currentStepId
2. next candidate が1件ならそのstep
3. specialRefのみの場合はControlReview panelをcurrent扱い
4. 複数候補の場合はUIで選択

## D. Flow構造Preview拡張

既存のFlow Previewを拡張し、以下を表示する。

* main_flow table
* feedback branch table
* branch detail step table
* unresolved template list

## E. Runtime Panel追加

Flow設定欄またはFlow bar直下に、以下のPanelを追加する。

* Flow Runtime Status
* Runtime Controls
* Current Step
* Next Step Candidates
* ControlReview Controls
* Parallel / Join Controls
* Loop Counters
* Guard Status
* Action Log

## F. decision step handler追加

関数例:

function applyDecisionStep(step: ResolvedFlowStepV14, decision: "pass" | "conditional" | "reject") {
// step.branches または flow.review_decision を参照
// branch state_to をRuntimeへ反映
// reject時は state=Designed
// pass/conditional時は state=Reviewed
}

注意:

* template_ref解決後のbranchesを使う
* state_routing上、Reviewed/mainはmain-05へ進む
* feedback_specification上、Reviewed/feedback_specificationはfb-spec-04へ進む

## G. Verified condition handler追加

関数例:

function isVerifiedConditionMet(inputs: VerifiedConditionInputs): boolean {
return (
inputs.debuggerPass &&
inputs.infraHumanAcceptanceOk &&
inputs.acceptanceCriteriaMet &&
inputs.integratorCauseReviewCompleted
);
}

ControlReview実行時:

* isVerifiedConditionMet === true の場合、verified_transitionを優先
* cause_classificationは無視または参考表示に留める
* state = Verified
* routeContext = main
* nextStep = main-09

## H. environment fallback handler追加

TC-07用に、以下を実装する。

入力:

* cause_classification = environment
* code_change_required = true

期待:

* feedback_environmentへ直接進まない
* reclassify_causeを要求する
* allowed reclassifications:

  * implementation
  * specification
* 未選択なら進行不可
* 再分類後は選択branchへ進む

UI:

* code_change_required checkbox
* reclassify_cause selector

  * implementation
  * specification
* Apply reclassification button

## I. parallel / join handler補強

既存の parallelRuntimeState を維持しつつ、以下を明示する。

* Debugger completed
* Infra completed
* joinMode
* isAllComplete
* join button disabled reason

join未完了時:

* joinボタン disabled
* Guardに join未完了 を表示

## J. loop counter表示・制御補強

既存の checkLoopLimit / incrementLoopCount を使う。

UI表示:

* implementation: current / max
* specification: current / max
* environment: current / max

挙動:

* branch進入時に対象branchのみ+1
* branch別counterは独立
* max到達時warning
* max超過時blocked

## K. Action Log追加

HumanがテストEvidenceを残しやすいよう、簡易ログを表示する。

最低限:

* 操作日時
* action
* step id
* before state
* before route_context
* after state
* after route_context
* loop count
* note

ログは画面表示のみでよい。
永続化は必須ではない。

## Acceptance Criteria

本Unitは以下をすべて満たした場合にPASSとする。

### Flow構造表示

* Flow保存後、flow_id / name / version / source_spec がUIで確認できる
* main_flow step一覧が確認できる
* feedback_flow branch一覧が確認できる
* branch内step一覧が確認できる
* template_ref解決状態が確認できる
* template_unresolved stepが識別できる

### Runtime状態表示

* 現在の state が確認できる
* 現在の route_context が確認できる
* current_step が確認できる
* next_step candidates が確認できる
* loop counts がbranch別に確認できる
* parallel状態が確認できる
* Guard状態が確認できる

### 操作

* HumanがUI操作でstepを進行できる
* Runtime Resetができる
* state / route_context を手動設定できる
* decision branch pass / conditional / reject を選択できる
* cause_classification implementation / specification / environment を選択できる
* Verified条件4項目を入力できる
* Verified条件成立時、Verified transitionがfeedback branchより優先される
* external_handoffを手動完了扱いにできる
* manual_executionを完了扱いにできる
* Debugger / Infraのparallel完了状態を個別に操作できる
* join未完了時に進行できない
* loop countとmax_iterations到達が確認できる

### U-FLOW-08_TestPlan対応

* TC-01 Main Route Normal Completion が実行可能
* TC-02 Reviewer Decision Reject Route が実行可能
* TC-03 Reviewer Decision Conditional Route が実行可能
* TC-04 Implementation Feedback Loop が実行可能
* TC-05 Specification Feedback Loop が実行可能
* TC-06 Environment Feedback Loop が実行可能
* TC-07 Environment Fallback Reclassification が実行可能
* TC-08 Verified Transition Priority and Route Reset が実行可能
* TC-09 Loop Max Iterations and Branch Counter Independence が実行可能
* TC-10 Template Unresolved Guard が確認可能
* TC-11 External Handoff Manual Guard が確認可能
* TC-12 Parallel Join Guard が確認可能

## Notes

* 本Unitは「統合テスト実施可能化」が目的であり、本番UX最適化は対象外。
* Flow JSONは変更しない。
* 既存ロジックの削除・置換は避ける。
* 既存Runtime UIがある場合は、それを拡張してよい。
* UI文言は日本語・英語混在でもよいが、HumanがTC実行時に判断できることを優先する。
* 外部WorkerへのAPI送信はしない。
* external_handoffは常に手動投入扱いとする。
* manual_executionはHuman手動作業完了入力として扱う。
* action logは簡易でよい。永続化不要。
* CSSは最低限でよい。視認性と操作性を優先する。

## Worker Instructions

1. 対象リポジトリを展開する
2. `app/page.tsx` の既存Flow関連実装を確認する
3. 既存のFlow Engine関数を再利用する
4. Runtime UI不足分を追加する
5. U-FLOW-08_TestPlan Rev1のTC-01〜TC-12を見ながら、各TCがHuman操作で実行できることを確認する
6. `npm run lint` または利用可能な検証コマンドを実行する
7. 実行できない場合は理由を報告する
8. 修正内容とAcceptance Criteria対応表を提出する

## Expected Worker Report Format

Workerは完了時に以下の形式で報告すること。

# U-FLOW-08R1 Worker Report

## 判定

PASS / CONDITIONAL / FAIL

## 修正ファイル

* app/page.tsx
* app/globals.css
* その他

## 実装内容

* Flow構造表示:
* Runtime状態表示:
* 操作UI:
* Guard表示:
* Loop counter:
* Parallel / join:
* Verified transition:
* Environment fallback:

## Acceptance Criteria対応

| Criteria                    | Result    | Notes |
| --------------------------- | --------- | ----- |
| Flow構造確認                    | PASS/FAIL |       |
| Runtime状態確認                 | PASS/FAIL |       |
| step進行                      | PASS/FAIL |       |
| decision選択                  | PASS/FAIL |       |
| cause_classification選択      | PASS/FAIL |       |
| Verified transition         | PASS/FAIL |       |
| external_handoff手動完了        | PASS/FAIL |       |
| manual_execution完了          | PASS/FAIL |       |
| parallel個別完了                | PASS/FAIL |       |
| join guard                  | PASS/FAIL |       |
| loop count / max_iterations | PASS/FAIL |       |
| TC-01〜TC-12実行可能             | PASS/FAIL |       |

## 検証コマンド

* 実行コマンド:
* 結果:

## Human向け操作手順

1.
2.
3.

## 既知注意点

* なし / あり

## 次Action

* U-FLOW-08_TestPlan Rev1に基づきHumanが統合動作確認を実施する。

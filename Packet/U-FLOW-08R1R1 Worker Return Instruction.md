判定：**U-FLOW-08R1は差戻し。原因分類は「実装不備」**です。
Flow定義・routing設計ではなく、Worker実装がPacket要件を満たしていません。特に **TC-07 / TC-08 が実行不能**なので、このままU-FLOW-08へ進めません。

差戻し先：**Worker**
次Action：**U-FLOW-08R1R1 修正パッチ実装**

こぴぺ用：

File:
U-FLOW-08R1R1_Worker_ReturnInstruction.md

Role: Integrator-C
Scope: Return Instruction

# U-FLOW-08R1R1 Worker Return Instruction

## 判定

FAIL / 差戻し

## 原因分類

実装不備

Flow定義解釈ミス、routing resolver不備、ControlReview resolver不備ではなく、U-FLOW-08R1_Packetで要求したRuntime UIおよび連動処理の実装不足。

## 差戻し理由

Debuggerレビューにより、U-FLOW-08R1実装はビルド通過しているものの、Acceptance Criteria未達と判断された。

特に以下が重大。

1. TC-07 Environment Fallback Reclassification が実行不能
2. TC-08 Verified Transition Priority が実行不能
3. TC-02 / TC-03 の decision 結果の `to` エビデンスが取れない
4. Flow構造表示がstep一覧要件を満たしていない
5. manual_execution 専用UIが弱い

## 修正Scope

本差戻しでは、U-FLOW-08実行前に最低限必要な修正を行う。

優先度A：必須修正

### A-1. TC-08 Verified Transition Priority 修正

現状、`verifiedConditionInputs` の4条件チェックボックスと `controlVerified` が連動していない。

そのため、4条件すべてONでも `controlReviewResolution` が `feedback_branch` を返し、Verified transitionが実処理に反映されない。

修正すること。

実装方針はどちらかでよい。

案1:
`verifiedConditionInputs` の4条件ANDを `controlVerified` に同期する。

```ts
useEffect(() => {
  setControlVerified(isVerifiedConditionMet(verifiedConditionInputs));
}, [verifiedConditionInputs]);
```

案2:
`controlReviewResolution` 側の判定条件を以下に変更する。

```ts
controlVerified || isVerifiedConditionMet(verifiedConditionInputs)
```

期待結果:

* Debugger Pass
* Infra/Human Acceptance OK
* Acceptance Criteria met
* Integrator-C cause review completed

上記4条件がすべてtrueの場合、必ず以下になること。

* feedback branchへ進まない
* state = Verified
* route_context = main
* next_step = main-09
* Verified transition が cause branch より優先される

### A-2. TC-07 Environment Fallback Reclassification UI追加

以下のUIが欠落しているため追加すること。

* code_change_required checkbox
* reclassify_cause selector

  * implementation
  * specification
* Apply reclassification button
* fallback判定ロジック

期待動作:

* cause_classification = environment
* code_change_required = true

の場合、feedback_environmentへ直接進ませない。

代わりに以下を要求する。

* reclassify_cause required
* allowed_reclassifications = implementation / specification
* 未選択では進行不可
* implementation選択時は feedback_implementation へ進む
* specification選択時は feedback_specification へ進む

### A-3. decision結果の `to` をUIまたはAction Logに記録

現状、`applyDecisionStep` は `{ state_to, to }` を返しているが、呼び出し側で `to` がRuntimeまたはログに残っていない。

TC-02 / TC-03 のエビデンスとして、以下が確認できるようにすること。

* decision = pass → to = PM
* decision = conditional → to = PM
* decision = reject → to = Designer

実装は軽量でよい。

例:

* Action Log の note に `decision to: Designer` を記録
* Runtime Status に `last_transition_to` を表示
* Decision Result 表示欄を追加

いずれかで可。

## 優先度B：可能なら対応

### B-1. Flow構造表示のstep一覧化

現状は件数表示のみで、Packet要件のstep一覧表示を満たしていない。

可能なら以下をtableまたはlist表示すること。

main_flow:

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

feedback_flow:

* branch key
* route_context
* max_iterations
* step id
* type
* from
* to
* state_from
* state_to

ただし、A項目完了を最優先する。

### B-2. manual_execution専用ボタン追加

fb-env-02 用に、通常の human_gate 完了ボタンとは別に以下を表示する。

* Manual execution completed

期待動作:

* current_step.type === manual_execution のとき表示
* 完了後、fb-env-03へ進める
* Guard上も manual_execution waiting が確認できる

## Acceptance Criteria

本修正は以下を満たすこと。

* TC-07がHuman操作で実行可能
* TC-08がHuman操作で実行可能
* 4条件Verified入力が実際の遷移処理に反映される
* Verified transition が feedback branch より優先される
* environment + code_change_required=true の場合、environment branchへ直接進まない
* reclassify_cause 未選択では進行できない
* reclassify_cause=implementation で implementation branchへ進める
* reclassify_cause=specification で specification branchへ進める
* decision結果の `to` がUIまたはAction Logで確認できる
* 既存PASS項目を壊さない

  * TC-04
  * TC-05
  * TC-09
  * TC-10
  * TC-11
  * TC-12

## Worker Report要求

修正後、以下の形式で報告すること。

# U-FLOW-08R1R1 Worker Report

## 判定

PASS / CONDITIONAL / FAIL

## 修正ファイル

* app/page.tsx
* その他

## 修正内容

### TC-07修正

* code_change_required UI:
* reclassify_cause UI:
* fallback判定:
* 未選択guard:

### TC-08修正

* verifiedConditionInputs連動方法:
* Verified transition優先確認:
* route_context reset確認:

### decision to記録

* 記録方法:
* 表示位置:

## Acceptance Criteria確認

| Criteria             | Result    | Notes |
| -------------------- | --------- | ----- |
| TC-07実行可能            | PASS/FAIL |       |
| TC-08実行可能            | PASS/FAIL |       |
| Verified 4条件AND反映    | PASS/FAIL |       |
| environment fallback | PASS/FAIL |       |
| decision to確認        | PASS/FAIL |       |
| 既存PASS項目維持           | PASS/FAIL |       |

## 検証コマンド

* 実行コマンド:
* 結果:

## 既知注意点

* なし / あり

## 次Action

修正後、Debuggerへ再チェック回付する。

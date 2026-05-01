File:
U-FLOW-08_TestPlan.md

# U-FLOW-08_TestPlan Rev1

## Unit

U-FLOW-08

## Title

Flow Engine 統合動作確認

## Purpose

AI Business OS Full Flow v1.4 をUI上で実際に進行させ、主経路およびfeedback loopが破綻なく動作することを確認する。

## Scope

対象は実装追加ではなく、既存Flow Engine機能の統合確認とする。

確認対象:

* Flow v1.4読込済み状態
* template_ref解決済み状態
* state + route_context routing
* human_gate
* external_handoff
* manual_execution
* parallel / join
* ControlReview
* feedback branch
* loop counter
* Verified transition
* route_context_reset
* Done到達

## Out of Scope

* 新機能追加
* UI大幅改修
* Flow定義変更
* Worker自動API連携
* 永続化形式の変更
* Role本文生成品質の評価

## Preconditions

* U-FLOW-01〜U-FLOW-07がPASS済み
* ai-business-os-flow-v1.4.json を読み込めること
* Flowプレビューで main_flow / feedback_flow が確認できること
* template_ref が解決され、実行対象stepとして扱えること
* template_unresolved === true のstepはrouting対象外であること
* Human gate操作がUI上で可能であること
* external_handoff stepで手動投入待ち状態を表現できること
* manual_execution stepをUI上で表現できること
* parallel stepでDebugger / Infraの両系統を扱えること
* join stepで両系統完了後に次工程へ進めること

## Test Policy

U-FLOW-08では以下を確認する。

1. 主経路が Draft/main から Done/main まで到達すること
2. Reviewer Decisionの pass / conditional / reject が定義通りに分岐すること
3. ControlReviewでVerified判定された場合、feedback branchよりVerified transitionが優先されること
4. Verified遷移時に route_context が main に戻ること
5. implementation feedback loop が1回以上正常に回ること
6. specification feedback loop がReviewer Decisionを含めて正常に回ること
7. environment feedback loop がInfra→Human→Infra→Integrator-Cの順で正常に回ること
8. max_iterations超過が検出されること
9. routing不能・未解決template・join未完了などの異常系で進行停止できること

## Test Cases

### TC-01 Main Route Normal Completion

目的:
主経路が Draft/main から Done/main まで到達することを確認する。

初期状態:

* state: Draft
* route_context: main
* current_step: main-01 または main-02へ進行可能な状態

手順:

1. main-01 Human to PM を完了する
2. main-02 PM to Designer を完了する
3. main-03 Designer to Reviewer を完了する
4. main-04 Reviewer Decision で pass を選択する
5. main-05 PM to Integrator-S を完了する
6. main-06 Integrator-S to Worker のexternal_handoffを手動完了扱いにする
7. main-07 Worker Output to Debugger and Infra を開始する
8. Debugger側を完了する
9. Infra側を完了する
10. main-08 joinを完了し、ControlReviewへ到達する
11. ControlReviewでVerified条件を満たす入力を与える
12. TC-08のVerified transition確認を実施する
13. main-09 Integrator-C Verified to PM を完了する
14. main-10 PM to Human を完了する

期待結果:

* 最終 state が Done になる
* 最終 route_context が main になる
* main-07は両系統完了前にmain-08へ進まない
* main-06は自動送信されず、手動完了操作を要求する
* TC-08確認後、main-09 → main-10 → Done へ進行できる

判定:
PASS / FAIL

---

### TC-02 Reviewer Decision Reject Route

目的:
Reviewer Decisionでrejectを選択した場合、Designerへ差し戻されることを確認する。

初期状態:

* state: Reviewed
* route_context: main
* current_step: main-04

手順:

1. main-04 Reviewer Decisionで reject を選択する
2. 遷移先を確認する

期待結果:

* to が Designer になる
* state_to が Designed になる
* main-05へ進まない
* decision_key: review_decision が使用される

判定:
PASS / FAIL

---

### TC-03 Reviewer Decision Conditional Route

目的:
Reviewer Decisionでconditionalを選択した場合、PMへ進むことを確認する。

初期状態:

* state: Reviewed
* route_context: main
* current_step: main-04

手順:

1. main-04 Reviewer Decisionで conditional を選択する
2. 遷移先を確認する

期待結果:

* to が PM になる
* state_to が Reviewed のまま維持される
* 次工程として main-05 へ進行可能になる

判定:
PASS / FAIL

---

### TC-04 Implementation Feedback Loop

目的:
実装起因feedback loopが正常に回ることを確認する。

初期状態:

* state: ControlReview
* route_context: main または feedback_implementation
* Debugger / Infra結果に実装起因NGを含む

手順:

1. ControlReviewで cause_classification = implementation を選択する
2. fb-impl-01へ遷移する
3. Worker external_handoffを手動完了扱いにする
4. fb-impl-02でDebugger / Infraへ並列投入する
5. Debugger側を完了する
6. Infra側を完了する
7. fb-impl-03でIntegrator-Cへjoinする
8. 再度ControlReviewへ戻る

期待結果:

* route_context が feedback_implementation になる
* state が ControlReview → InDev → Debug → ControlReview と遷移する
* loop count が +1 される
* max_iterations以内なら再実行可能
* 両系統完了前にfb-impl-03へ進まない

判定:
PASS / FAIL

---

### TC-05 Specification Feedback Loop

目的:
仕様起因feedback loopがDesignerから再開し、Reviewer Decisionを含めて正常に進むことを確認する。

初期状態:

* state: ControlReview
* route_context: main または feedback_specification
* Debugger / Infra結果に仕様起因NGを含む

手順:

1. ControlReviewで cause_classification = specification を選択する
2. fb-spec-01でDesignerへ差し戻す
3. fb-spec-01完了後、state=Designed / route_context=feedback_specification になることを確認する
4. routing resolver が fb-spec-02 をnext stepとして解決することを確認する
5. fb-spec-02でReviewerへ進める
6. fb-spec-03 Reviewer Decisionで pass を選択する
7. fb-spec-04でPMからIntegrator-Sへ進める
8. fb-spec-05でWorker external_handoffを手動完了扱いにする
9. fb-spec-06でDebugger / Infraへ並列投入する
10. 両系統完了後、fb-spec-07でIntegrator-Cへ戻す

期待結果:

* route_context が feedback_specification になる
* state が ControlReview → Designed → Reviewed → Integrated → InDev → Debug → ControlReview と遷移する
* fb-spec-01完了後、routing resolverがfb-spec-02を解決する
* fb-spec-03 の template_ref が解決済みdecision stepとして動作する
* Reviewer Decisionのreject時はDesignerへ戻る
* loop count が +1 される

判定:
PASS / FAIL

---

### TC-06 Environment Feedback Loop

目的:
環境起因feedback loopがInfra→Human→Infra→Integrator-Cの順で正常に進むことを確認する。

初期状態:

* state: ControlReview
* route_context: main または feedback_environment
* Debugger / Infra結果に環境起因NGを含む
* code_change_required = false

手順:

1. ControlReviewで cause_classification = environment を選択する
2. fb-env-01でInfraへ遷移する
3. fb-env-02でHuman manual_executionへ進める
4. fb-env-03でHuman結果をInfraへ返す
5. fb-env-04でIntegrator-Cへ戻す

期待結果:

* route_context が feedback_environment になる
* state は Debug を中心に維持される
* コード修正を要求しない
* fb-env-02 がmanual_executionとして扱われる
* fb-env-04後にControlReviewへ戻る

判定:
PASS / FAIL

---

### TC-07 Environment Fallback Reclassification

目的:
環境起因でコード修正が必要な場合、implementationまたはspecificationへ再分類されることを確認する。

初期状態:

* state: ControlReview
* route_context: main
* cause_classification = environment
* code_change_required = true

手順:

1. ControlReview画面で cause_classification = environment を選択する
2. code_change_required フラグまたは同等の条件入力を true にする
3. environment branchへ進行しようとする
4. fallback判定が発火することを確認する
5. 再分類先として implementation または specification のみ選択可能であることを確認する
6. 再分類先を選択せずに進行できないことを確認する

期待結果:

* feedback_environmentへ直接進まない
* reclassify_causeが要求される
* allowed_reclassifications は implementation / specification のみ
* 未分類のまま進行できない
* 再分類後は選択branchのfeedback route_contextへ進む

判定:
PASS / FAIL

---

### TC-08 Verified Transition Priority and Route Reset

目的:
ControlReviewでVerified条件を満たす場合、feedback branchよりverified_transitionが優先され、route_contextがmainにresetされることを確認する。

初期状態:

* state: ControlReview
* route_context: main または feedback_implementation または feedback_specification または feedback_environment
* Debugger Pass
* Infra/Human Acceptance OK
* Acceptance Criteria met
* Integrator-C cause review completed

手順:

1. ControlReviewでVerified条件を満たす入力を与える
2. cause branch候補が存在する状態で次stepを解決する
3. state_toを確認する
4. route_contextを確認する
5. next_stepを確認する

期待結果:

* feedback branchへ進まない
* state が Verified になる
* route_context が main にresetされる
* next_step が main-09 になる
* Verified transition がfeedback branchより優先される

判定:
PASS / FAIL

---

### TC-09 Loop Max Iterations and Branch Counter Independence

目的:
feedback loopがmax_iterationsを超過した場合に停止できること、およびbranch別loop counterが独立して扱われることを確認する。

初期状態:

* 任意のfeedback branch
* max_iterations = 3

手順A: max_iterations確認

1. 同一branchのfeedback loopを1回実行する
2. 2回目を実行する
3. 3回目を実行する
4. 4回目を実行しようとする

期待結果A:

* 1〜3回目は許容される
* 3回目到達時に警告が出る
* 4回目は進行停止またはHuman判断待ちになる
* branch側max_iterationsが優先される
* branch側未定義の場合はfeedback_flow.max_iterationsがfallbackされる

手順B: branch別counter独立性確認

1. implementation branchを2回実行する
2. specification branchへ切り替える
3. specification branchのloop countを確認する
4. environment branchへ切り替える
5. environment branchのloop countを確認する

期待結果B:

* implementation branchのloop countは2として保持される
* specification branchのloop countはimplementation branchの値を引き継がない
* environment branchのloop countはimplementation / specification branchの値を引き継がない
* branch別にmax_iterations判定される

判定:
PASS / FAIL

---

### TC-10 Template Unresolved Guard

目的:
template_ref未解決stepがrouting対象外になることを確認する。

初期状態:

* template_ref解決前、または意図的にtemplate_unresolved === true のstepを含む

手順:

1. template_unresolved === true のstepをrouting候補に含める
2. 次step解決を実行する

期待結果:

* 該当stepはrouting対象外になる
* 実行ボタンまたは進行操作が抑止される
* 未解決templateであることがUI上識別できる
* 代替の有効stepがなければ停止する

判定:
PASS / FAIL

---

### TC-11 External Handoff Manual Guard

目的:
Worker external_handoffが自動実行されず、手動投入待ちになることを確認する。

初期状態:

* current_step: main-06 / fb-impl-01 / fb-spec-05 のいずれか

手順:

1. external_handoff stepへ到達する
2. 自動進行されないことを確認する
3. 手動完了操作を行う

期待結果:

* WorkerへAPI送信されない
* send_api_request = false として扱われる
* 手動投入待ち状態が表示される
* Human gate完了後に次工程へ進む

判定:
PASS / FAIL

---

### TC-12 Parallel Join Guard

目的:
parallel stepで片系統のみ完了した場合、joinへ進まないことを確認する。

初期状態:

* current_step: main-07 / fb-impl-02 / fb-spec-06 のいずれか

手順:

1. parallel stepを開始する
2. Debugger側のみ完了する
3. 次step解決を確認する
4. Infra側も完了する
5. 次step解決を再確認する

期待結果:

* 片系統完了だけではjoinへ進まない
* 両系統完了後にjoin stepへ進む
* join条件 all_complete が反映される

判定:
PASS / FAIL

---

## Acceptance Criteria

U-FLOW-08は以下をすべて満たした場合にPASSとする。

* TC-01がPASS
* TC-02がPASS
* TC-03がPASS
* TC-04 / TC-05 / TC-06 がPASS
* TC-07がPASS
* TC-08がPASS
* TC-09がPASS
* TC-10 / TC-11 / TC-12 がPASS
* 主経路で Done/main まで到達できる
* Reviewer Decisionの pass / conditional / reject が定義通りに分岐する
* feedback loop後にVerified transitionで main に復帰できる
* 未定義分岐が発生しない
* state + route_context の組み合わせで次stepが一意に解決される
* Human gateなしで遷移できない
* external_handoffが自動送信されない
* manual_executionがUI上で明示される
* join未完了で次工程へ進まない
* branch別loop counterが独立して扱われる

## Evidence to Record

テスト実施時は以下を記録する。

* 実施日時
* 使用Flowファイル名
* 使用アプリ版またはcommit hash
* 各TCのPASS / FAIL
* FAIL時のstate
* FAIL時のroute_context
* FAIL時のcurrent_step
* 期待next_step
* 実際next_step
* loop count
* branch別loop count
* UI表示内容
* 操作ログまたはスクリーンショット

## Final Judgment

判定:

* PASS: 全Acceptance Criteriaを満たす
* CONDITIONAL: 主経路は通るが軽微なUI表示不備がある
* FAIL: routing / state / route_context / join / loop / Verified transition のいずれかが破綻する

## Next Action

U-FLOW-08_TestPlan Rev1に基づき、UI上で統合動作確認を実施する。

FAILが出た場合は、実装追加ではなく、まず原因を以下に分類する。

* Flow定義解釈ミス
* routing resolver不備
* ControlReview resolver不備
* Human gate制御不備
* external_handoff制御不備
* manual_execution制御不備
* parallel / join制御不備
* loop counter不備
* UI表示不備

分類後、U-FLOW-08R1として修正Unit化する。

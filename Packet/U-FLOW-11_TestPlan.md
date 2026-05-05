U-FLOW-11_TestPlan.md

# U-FLOW-11 実機テスト計画

## 1. Unit

U-FLOW-11

## 2. Title

Chat Runtime 組み込み 実機動作確認

## 3. Purpose

Flow Runtime上の `current_step` に応じて、対象Role、Role Template、必要Inputを解決し、Role Header付きPromptを生成して、対象チャット列または外部Workerへ投入できることを確認する。

U-FLOW-08で確認済みのFlow進行制御に加え、U-FLOW-11では **Role実行の最小運用が可能か** を確認する。

## 4. Scope

確認対象：

* current_step → Step定義解決
* Step定義 → Role解決
* Role → Role Template解決
* Template Variables埋め込み
* 必須Input不足時のPrompt生成停止
* 未定義Input混入防止
* Role Header付きPrompt生成
* 対象Role列へのPrompt投入
* Worker external_handoff用Prompt生成
* Worker API自動送信なし
* Reviewer Decision stepのPrompt / Decision制御
* Parallel stepでDebugger / Infra Prompt同時生成
* Join stepでIntegrator-C Prompt生成
* Verified transition後のPM Prompt生成
* Feedback branchでのPrompt生成
* max_iterations超過時のPrompt生成停止
* PM承認済みSpec guard

## 5. Out of Scope

* Flow v1.4 JSONの変更
* Role Template本文の再設計
* Worker API自動連携
* 成果物永続化機能の完成
* 各AIの出力品質評価そのもの

## 6. Preconditions

* U-FLOW-08 PASS済み
* U-FLOW-11 DebugReport最終確認がPass済み
* アプリ：Tri AI Chat / v0.17.0-flow-ui
* Flow：AI Business OS Full Flow v1.4
* Flow ID：ai-business-os-full-v1-4
* Flow v1.4 JSON読込済み
* Runtime Panel表示可能
* Prompt生成UIまたはPrompt投入UIが表示可能
* 各Role列が表示可能

  * PM: col1
  * Designer: col2
  * Reviewer: col3
  * Integrator-S: col4
  * Debugger: col5
  * Infra / Integrator-C: col1 shared
* Workerは外部 / VSCode Copilot / manual handoff扱い
* Worker API自動送信は無効

U-FLOW-11 DebugReportでは、AC-1〜AC-25がDebugger視点でPass確認済みです。実機ではこれをUI操作で再確認します。

## 7. Test Policy

U-FLOW-11では、Flow全体を最後まで通すことよりも、各stepで **正しいRole Promptが生成されるか** を重視する。

判定基準：

* PASS：期待Role / Template / Input / Prompt / 投入先が一致
* CONDITIONAL：Prompt生成は正しいが、表示名・補助表示など軽微不備あり
* FAIL：Role誤解決、Template誤解決、Input不足を無視、未定義Input混入、Worker自動送信、Prompt未生成、誤列投入のいずれか

## 8. Test Cases

## TC-01 Main Flow Role / Template Prompt生成確認

目的：main-01〜main-10で各stepの対象RoleとTemplateが正しく解決されることを確認する。

手順：

1. Runtime Reset
2. main-01に到達
3. Prompt生成を実行
4. main-01〜main-10まで、各stepでPrompt生成内容と投入先を確認する

期待結果：

| Step    | 期待Role           | 期待Template / 処理               |
| ------- | ---------------- | ----------------------------- |
| main-01 | PM               | PM Template                   |
| main-02 | Designer         | Designer Template             |
| main-03 | Reviewer         | Reviewer Template             |
| main-04 | Reviewer         | Reviewer Decision             |
| main-05 | Integrator-S     | Integrator-S Template         |
| main-06 | Worker           | Worker Handoff Prompt         |
| main-07 | Debugger / Infra | parallel Prompt               |
| main-08 | Integrator-C     | Join / ControlDecision Prompt |
| main-09 | PM               | Final Approval Prompt         |
| main-10 | Human            | Approval Guide                |

main-06はFlow上の表示が「Integrator-S to Worker」でも、実行対象RoleはWorker、処理種別はexternal_handoff、Prompt種別はWorker Handoff Promptとして扱う必要があります。

判定：PASS / FAIL

---

## TC-02 Role Header付きPrompt確認

目的：生成PromptにRole Header、Scope、Mission、Input Policy、Output Schema、Prohibitions、Output Protocolが含まれることを確認する。

手順：

1. main-02またはmain-03でPrompt生成
2. 生成Prompt本文を確認
3. Role HeaderとOutput Protocolを確認

期待結果：

* `Role: Designer` 等のRole Headerがある
* `Scope:` がある
* Missionがある
* Input Policyがある
* Output Schemaがある
* Prohibitionsがある
* Output Protocolがある
* COPY Mode / 1ブロック出力 / ファイル名明示が含まれる

Role Template共通構造では、Role Header、Mission、Input Policy、Output Schema、Prohibitions、Output Protocolが共通要素として定義されています。

判定：PASS / FAIL

---

## TC-03 必須Input不足時のPrompt生成停止

目的：必須Inputが不足した場合、Prompt生成が停止し、エラー表示されることを確認する。

対象例：

* main-03 Reviewer：`spec_content` 不足
* main-05 Integrator-S：`spec_content` 不足
* main-07 Debugger：`worker_code` または `packet_content` 不足
* main-08 Integrator-C：`debug_report` / `infra_result` / `worker_code` / `packet_content` / `spec_content` 不足

手順：

1. Runtime Reset
2. 対象stepまで進める
3. 必須Input欄を空にする
4. Prompt生成を実行

期待結果：

* Prompt生成されない
* 対象Roleと不足Inputが明示される
* 空Inputを含むPromptが生成されない
* 次stepへ進まない

U-FLOW-11の実装では、必須Input不足時にPrompt生成を停止することがAcceptance Criteriaに含まれています。

判定：PASS / FAIL

---
TC-04 未定義Input混入防止

目的：Roleごとに許可されたInputだけがPrompt Variablesへ入ることを確認する。

手順：

複数Input欄に値を入れる
Reviewer stepでPrompt生成
Worker stepでPrompt生成
Infra main-07 stepでPrompt生成
Infra fb-env-01 / fb-env-03 stepでもPrompt生成
生成Prompt内のProvided Variables / Input欄を確認する

期待結果：

Reviewerには spec_content のみが入る
Worker main-06 / fb-spec-05には packet_content が入る
Worker fb-impl-01には rework_instruction が入る
Infra main-07には worker_code, packet_content のみが入る
Infra main-07には human_execution_result / rework_instruction が混入しない
Infra fb-env-01には rework_instruction が入る
Infra fb-env-03には human_execution_result が入る
許可外InputがPromptに混入しない

判定：PASS / FAIL
---

## TC-05 main-05 Integrator-S PM承認済みSpec Guard

目的：Integrator-S実行時にPM承認済みSpecであることを担保できるか確認する。

手順：

1. main-05に到達
2. PM承認済みSpecフラグまたは同等条件をOFFにする
3. Prompt生成を実行
4. 次にPM承認済み状態をONにして再実行

期待結果：

OFF時：

* Integrator-S Prompt生成停止
* PM-approved Spec不足エラー表示
* main-05を完了できない

ON時：

* Integrator-S Prompt生成可能
* Role: Integrator-S
* Output Schema: Packet
* main-06へ進行可能

Packetでは、Integrator-S実行時にPM承認済みSpecであることを担保する要件が明示されています。

判定：PASS / FAIL

---

## TC-06 main-06 Worker External Handoff Prompt

目的：Worker向けPromptが生成され、VSCode Copilot手動投入前提で表示されることを確認する。

手順：

1. main-06に到達
2. `packet_content` を入力
3. Worker Prompt生成
4. External Handoff UIを確認

期待結果：

* 対象Role：Worker
* Prompt種別：Worker Handoff Prompt
* VSCode Copilot投入用Promptが生成される
* クリップボードコピー可能
* Worker API自動送信されない
* `send_api_request=false`
* 出力戻し方法が paste_or_file_attach として表示される
* Humanが手動完了するまでmain-07へ進まない

Worker external_handoffは、Promptを生成してVSCode Copilotへ手動投入する前提で、自動API送信しない仕様です。

判定：PASS / FAIL

---

## TC-07 main-07 Parallel Prompt生成

目的：Debugger / InfraのPromptが並列に別々に生成されることを確認する。

手順：

1. main-07に到達
2. `worker_code` / `packet_content` / `spec_content` を入力
3. Prompt生成を実行
4. Debugger PromptとInfra Promptを確認

期待結果：

* Debugger Promptが生成される
* Infra Promptが生成される
* それぞれRole Headerが異なる
* DebuggerはDebugReport出力指示
* InfraはTestPlan / TestResult出力指示
* 片方の完了だけではjoinへ進まない
* 両方完了後のみmain-08へ進む

U-FLOW-11 Packetでは、main-07 / fb-impl-02 / fb-spec-06をparallel対象として、Debugger PromptとInfra Promptを別々に生成する仕様です。

判定：PASS / FAIL

---

## TC-08 main-08 Join / Integrator-C Prompt生成

目的：Debugger / Infra結果を集約し、Integrator-C Promptが生成されることを確認する。

手順：

1. main-07でDebugger / Infra両方完了
2. main-08に到達
3. `debug_report` / `infra_result` / `worker_code` / `packet_content` / `spec_content` を入力
4. Integrator-C Prompt生成

期待結果：

* Role: Integrator-C
* Debugger.DebugReportが含まれる
* Infra.TestResultが含まれる
* Worker.Codeが含まれる
* Packetが含まれる
* Specが含まれる
* ControlDecisionまたはReworkInstruction出力指示がある

判定：PASS / FAIL

---

## TC-09 Reviewer Decision Prompt / Decision制御

目的：main-04とfb-spec-03が共通のReviewer Decision仕様で動作することを確認する。

手順A：main-04

1. main-04に到達
2. Prompt生成
3. pass / conditional / rejectをそれぞれ確認

手順B：fb-spec-03

1. specification feedback loopに入る
2. fb-spec-03に到達
3. Prompt生成
4. pass / reject分岐を確認

期待結果：

* main-04 / fb-spec-03ともReviewer Decisionとして扱われる
* decision未選択では完了不可
* decision選択後のみ進行可能
* pass / conditional / reject の分岐先が正しい
* decision完了後、selectedDecisionがリセットされる

Debugger最終確認では、Decision Controlの二重実装解消とselectedDecisionリセットがPass確認されています。実機ではUI操作で再確認します。

判定：PASS / FAIL

---

## TC-10 Feedback Branch Prompt生成

目的：implementation / specification / environment branchで適切なRole Promptが生成されることを確認する。

手順：

1. ControlReviewへ到達
2. Verified条件OFF
3. cause_classificationを順に選択
4. 各branchの最初のstepでPrompt生成

期待結果：

| Branch         | Step       | 期待Role   | 期待Input            |
| -------------- | ---------- | -------- | ------------------ |
| implementation | fb-impl-01 | Worker   | rework_instruction |
| specification  | fb-spec-01 | Designer | rework_instruction |
| environment    | fb-env-01  | Infra    | rework_instruction |

判定：PASS / FAIL

---
TC-11 Manual Execution Prompt / Guide確認

目的：fb-env-02でHuman向けManual Execution Guideが表示され、fb-env-03でHuman実行結果をInfra Promptへ渡せることを確認する。

手順：

environment feedback loopへ入る
fb-env-01を完了
fb-env-02に到達
Manual Execution Guideを確認
Human実行結果を入力
fb-env-02を完了
fb-env-03へ進む
fb-env-03でInfra Promptを生成する

期待結果：

fb-env-02では Role: Human または Human Guide として表示される
infra_test_plan が提示される
Human実行手順が表示される
Human実行結果を入力できる
入力後、fb-env-03 Infraへ渡せる
fb-env-03では Role: Infra としてPrompt生成される
fb-env-03では human_execution_result がInputとして提供される
fb-env-03のPromptに TestResult 出力指示が含まれる

判定：PASS / FAIL

---
TC-12 max_iterations超過時のPrompt生成停止

目的：loop count上限到達時にPrompt生成が停止し、PM警告が表示されることを確認する。

前提：

Runtime UIに feedbackLoopCounts を直接編集できる機能がある場合は、その機能を使用する
直接編集機能がない場合は、ControlReviewからimplementation branchを繰り返し適用してcounterを進める
各回のloop完走には、fb-impl-01 → fb-impl-02 → fb-impl-03 → ControlReview復帰までを含める

手順A：counter直接設定UIがある場合

Runtime Reset
ControlReviewまで進める
implementation loop countを 3 / 3 に設定する
Verified条件はOFFのままにする
Cause Classificationで implementation を選択
Apply Feedback Branchを押す
Prompt生成またはbranch遷移が停止されることを確認する

手順B：counter直接設定UIがない場合

Runtime Reset
ControlReviewまで進める
Verified条件はOFFのままにする
Cause Classificationで implementation を選択
Apply Feedback Branchを押す
fb-impl-01 → fb-impl-02 → fb-impl-03 を完走し、ControlReviewへ戻る
上記4〜6を繰り返し、implementation: 3 / 3 にする
4回目として再度 Cause Classificationで implementation を選択
Apply Feedback Branchを押す

期待結果：

1〜3回目は許容される
implementation: 3 / 3 到達時に警告が表示される
4回目はfeedback_implementationへ進まない
Prompt生成されない
max_iterations超過エラーが表示される
PM警告または手動介入待ち表示が出る
loop countが 4 / 3 にならない
他branchのcounterには影響しない

期待エラー例：

Loop limit exceeded: Maximum iterations (3) exceeded for branch implementation.

判定：PASS / FAIL
---

## TC-13 Verified Transition後のmain-09 PM Prompt生成

目的：Verified transition後にroute_contextがmainへresetされ、main-09 PM Promptが生成できることを確認する。

手順：

1. ControlReviewに到達
2. Verified条件をすべてON
3. Apply Verified Transition
4. main-09に到達
5. PM Prompt生成

期待結果：

* state：Verified
* route_context：main
* current_step：main-09
* Role：PM
* ControlDecisionをInputとしてFinal Approval Promptが生成される
* main-10へ進行可能

Verified transitionでは、stateをVerifiedにし、route_contextをmainへresetし、main-09へ接続する仕様です。

判定：PASS / FAIL

---

## TC-14 Template Unresolved時のPrompt生成停止

目的：template_ref未解決stepでPrompt生成が停止することを確認する。

手順：

1. Flow設定でmain-04のtemplate_refを存在しない値に変更
2. 保存
3. Runtime Reset
4. main-04に到達
5. Prompt生成を試す

期待結果：

* Template Unresolved Guard表示
* Prompt生成されない
* Decision UIが出ない
* main-05へ進まない
* unresolved template_refが表示される

判定：PASS / FAIL

---

## TC-15 Role列投入先確認

目的：生成PromptがFlow v1.4のrole_bindings通りの列へ投入されることを確認する。

手順：

1. main_flow各stepでPrompt生成
2. 対象列への投入先を確認

期待結果：

| Role         | 期待投入先                     |
| ------------ | ------------------------- |
| PM           | col1                      |
| Designer     | col2                      |
| Reviewer     | col3                      |
| Integrator-S | col4                      |
| Worker       | external / manual handoff |
| Debugger     | col5                      |
| Infra        | col1 shared               |
| Integrator-C | col1 shared               |

Flow v1.4 JSONでは、各Roleのcolumn bindingとWorkerのexternal / manual handoffが定義されています。

判定：PASS / FAIL

---

## 9. Evidence to Record

各TCで以下を記録する。

* 実施日時
* アプリ版 / commit hash
* 使用Flowファイル名
* current_state
* route_context
* current_step
* target Role
* resolved Template
* required Inputs
* generated Prompt有無
* Prompt投入先
* エラー表示
* Action Log
* FAIL時の期待値 / 実際値
* スクリーンショットまたは貼り付けログ

## 10. Acceptance Criteria

以下をすべて満たした場合、U-FLOW-11実機テストをPASSとする。

* TC-01〜TC-15がPASS
* current_stepから対象Roleを解決できる
* current_stepからRole Templateを解決できる
* template_refを解決できる
* Variablesへ許可Inputのみ埋め込める
* 必須Input不足時にPrompt生成を停止できる
* 未定義InputをPromptへ混入しない
* Role Header付きPromptを生成できる
* 対象Role列へPrompt投入できる
* Worker external_handoff用Promptを生成できる
* Worker API自動送信が発生しない
* main-05 / main-06 / main-09の特殊Role解決が正しい
* fb-impl-02 / fb-spec-06でparallel Prompt生成できる
* fb-spec-03をReviewer Decisionとして扱える
* max_iterations超過時にPrompt生成を停止できる
* Verified transition後にmain-09 PM Promptを生成できる
* Flowに沿ったRole実行の最小運用が可能

## 11. Final Judgment

* PASS：全TCがPASS
* CONDITIONAL：Prompt生成・投入は成立するが、表示上の軽微不備がある
* FAIL：Role解決、Template解決、Input検証、Prompt生成、投入先、Worker handoff、Verified後接続のいずれかが破綻

## 12. Next Action

Humanが本テスト計画に基づき実機確認を実施する。
Infraは操作手順案内、証跡確認、PASS / FAIL判定補助を行う。
FAILが出た場合は、Integrator-Cが原因分類し、必要に応じてU-FLOW-11R1として修正Unit化する。

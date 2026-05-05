判定：**TC-04 main-09 はFAILです。**

`main-09 PM` の期待Inputは基本的にこれです。

```text
OK：
- unit_id
- control_decision
```

現状は余計なInputが混入しています。

```text
混入NG：
- human_goal
- review_report
- human_execution_result
```

特に `review_report` と `human_execution_result` は main-09 のPM最終承認Promptには不要です。

## Worker修正要求

```text
修正要求：
Prompt生成時のVariables抽出をRole単位ではなく、step用途単位で制限すること。

対象：
main-09 Integrator-C Verified to PM

期待：
Provided Variables:
- unit_id
- control_decision

現状：
Provided Variables:
- unit_id
- human_goal
- review_report
- control_decision
- human_execution_result

原因：
PM Role全体の許可Inputをそのまま使っており、main-09用途に不要なInputまで混入している可能性がある。

修正方針：
step_id別またはstep purpose別に allowed inputs を定義すること。
main-09では control_decision のみを必須Inputとし、human_goal / review_report / human_execution_result は除外する。
```

ここは **U-FLOW-11の中核AC「未定義Input混入禁止」違反**なので、テスト継続より先に修正が妥当です。

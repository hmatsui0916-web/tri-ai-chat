**TC-14 FAILです。**

壊した `template_ref` が効いていません。
現状は未解決停止せず、通常のReviewer DecisionとしてPrompt生成されています。

```text
Result: ok / step main-04 / roles Reviewer
Reviewer decision is pending
Prompt生成あり
```

期待はこれです。

```text
Result: blocked
Guard: Template Unresolved
unresolved template_ref 表示
Prompt生成なし
Decision UIなし
main-05へ進行不可
```

原因候補は2つです。

```text
1. Flow設定の変更が保存・反映されていない
2. Prompt Runtime側が template_unresolved を見ずに main-04 を id 判定で Reviewer Decision扱いしている
```

たぶん **2が濃厚**です。前にFlow Runtime側ではTemplate Unresolved Guardが効いていたので、今回は **Prompt Runtime側の未解決templateチェック漏れ**に見えます。

Worker修正要求：

```text
修正要求：
Prompt Runtimeでも template_unresolved step のPrompt生成を停止すること。

対象：
main-04 の template_ref を reviewer_decision_s 等の存在しない値に変更した状態

期待：
- Current Step: main-04
- Guard: Template Unresolved
- unresolved template_ref: reviewer_decision_s
- Generate Prompt時に blocked
- Reviewer Promptを生成しない
- Decision Controlを表示しない
- main-05へ進まない

現在：
- Prompt Runtimeが main-04 を id 判定でReviewer Decisionとして扱っている
- template_ref未解決でもPrompt生成できてしまう
- step_type / instruction が none のままReviewer Promptが出る

修正方針：
- resolveTemplateStep() の template_unresolved を Prompt Runtimeにも伝播
- generatePrompt() 前に currentStep.template_unresolved を検査
- template_unresolved=true の場合はPrompt生成を停止
- isReviewerDecisionStep(currentStep) も template_unresolved=true の場合はfalse扱いにする
```

ここはU-FLOW-11のAC違反なので、**TC-14修正後に再確認**です。

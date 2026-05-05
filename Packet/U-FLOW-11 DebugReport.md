```
Role: Debugger
Scope: Failure Analysis Only
```

# U-FLOW-11 DebugReport

## 対象

`page.tsx`（v0.17.0-flow-ui）
U-FLOW-11 Chat Runtime 組み込み実装

照合対象:
- U-FLOW-11_Spec.md Rev.2
- U-FLOW-11_Packet.md（Acceptance Criteria 25項目）
- AI Business OS Full Flow v1.4 JSON

---

## 判定

**Conditional Pass**

主要機能の実装は確認できた。ただし、ロジック上の不整合・エッジケース漏れが複数存在する。運用上のブロッカーとなる項目（Bug-01、Bug-02）を優先修正すること。

---

## テスト項目と判定

### [Pass] AC-1/2: current_stepからRole/Templateを解決できる

`resolveTargetRoles()`（L1289〜1306）が実装されており、main-05→Integrator-S、main-06→Worker、main-09→PMの明示的条件分岐（L1294〜1296）も確認済み。Flow全体のStep探索は`getAllResolvedFlowSteps()`経由で行われており、main/feedback全branchをカバーしている。**Pass**

---

### [Pass] AC-3: template_refを解決できる

`resolveTemplateStep()`（L808〜828）が実装されており、template_refが未解決の場合は`template_unresolved: true`フラグを付与して進行を停止する。`isReviewerDecisionStep()`（L561〜569）でも`template_unresolved`を確認してからDecision処理に入る構造になっている。**Pass**

---

### [Pass] AC-4/5/6/7: Variables埋め込み・必須チェック・条件付きInput・未定義Input禁止

`buildPromptVariables()`（L1342〜1361）は`ROLE_TEMPLATE_DEFINITIONS`のallowed変数セットと`getRequiredInputsForStep()`の必須リストの和集合のみを埋め込む。`validateRequiredInputs()`（L1363〜1372）で必須不足時にPrompt生成を停止する。`cleanPromptVariables()`で空文字列を除去し未定義変数の混入を防止している。**Pass**

---

### [Bug-01] AC-18: Decision stepでHuman選択に応じた次Step解決が不完全（重要度: High）

**該当箇所:** `applyResolvedStep()`（L1828〜1832）

**現象:**
`isReviewerDecisionStep(step)`がtrueの場合、即座に`return`してステップ完了を拒否する実装になっている。これはReviewer Decisionの「完了操作」自体を恒常的にブロックしており、`selectedDecision`（pass/conditional/reject）が選択された後にDecisionを確定・完了させる経路がない。

**期待動作:**
Human が pass/conditional/reject を選択 → 決定を確定 → Decision stepをcompleteとしてstateを更新 → 次Stepへ遷移。

**実際の動作:**
Reviewer Decisionステップにいる間は常に完了操作がブロックされ、Flowが前進しない。

**修正方針:**
`applyResolvedStep()`内のReviewer Decision判定を「`selectedDecision`が未選択の場合のみブロック」に変更すること。`selectedDecision`が確定済みの場合は`applyDecisionStep()`の結果に基づき`state_to`と`route_context`を確定してFlowを前進させること。

---

### [Bug-02] AC-19: feedback stepのloop_counter増分タイミングが誤っている（重要度: High）

**該当箇所:** `applyResolvedStep()`（L1900〜1906）

**現象:**
loop counterの増分条件が`step.type === "cause_classification_resolver"`となっているが、Flow v1.4 JSONにこの`type`値は存在しない。実際のfeedback branch開始step（fb-impl-01, fb-spec-01, fb-env-01）は`type: "external_handoff"`または`type: "single"`である。

**影響:**
`applyControlReviewResolution()`（L2000〜2020）側では`incrementLoopCount()`を呼んでいるが、`applyResolvedStep()`側のカウンタ増分は一切発火しない。feedback branch適用経路とstep完了経路でカウンタ管理が二重に設計されており、整合が取れていない。

**修正方針:**
`applyResolvedStep()`内の`cause_classification_resolver`条件を削除し、loop counterの増分は`applyControlReviewResolution()`の`feedback_branch`経路のみで一元管理する形に統一すること（現状の`applyControlReviewResolution()`側は正しい実装）。

---

### [Pass] AC-20: max_iterations超過時にPrompt生成が停止しPM警告が表示される

`checkLoopLimit()`（L607〜656）が実装されており、`nextCount > maxIterations`の場合に`allowed: false`を返す。`applyControlReviewResolution()`（L2001〜2004）でこれを参照し、超過時は`setGlobalError()`でPM警告を表示する。Guard Status表示もUIに実装されている（L3819〜3894）。**Pass**

---

### [Pass] AC-21: Human manual_executionステップが機能する

`clearedManualExecutionStepIds`による完了管理、UIのManual Execution Completeボタン（L3861〜3890）が実装されている。`applyResolvedStep()`内の`manual_execution`チェック（L1846〜1850）も正常動作する。**Pass**

---

### [Pass] AC-22: Verified遷移時のroute_contextリセットとmain-09接続

`applyControlReviewResolution()`（L1969〜1997）でVerified時に`route_context_reset`を`routeContext`に適用し、`setCurrentStepId(resolution.nextStepId)`でmain-09へ接続する実装が確認できた。`resolveVerifiedTransition()`（L1019〜1041）がJSONの`verified_transition.next_step`を読み取り、`route_context_reset`を返す。**Pass**

---

### [Pass] AC-23: PM承認済みSpec担保

`assertPmApprovedForIntegratorS()`（L1374〜1391）がmain-05とfb-spec-04に対して`current_state === "Reviewed"`および`pmApprovedSpec`フラグを確認し、不許可時はPrompt生成を停止する。UIにpmApprovedSpecのトグルが存在することも確認済み（L1614）。**Pass**

---

### [観察-A] AC-12/13/14: main-05/06/09のRole特殊分岐とfb-spec-03の共通化

`resolveTargetRoles()`（L1294〜1298）でmain-05→Integrator-S、main-06→Worker、main-09→PM、fb-impl-02/fb-spec-06→[Debugger, Infra]、fb-spec-03→selectedDecision経由の分岐が明示的に実装されており、Packet Section 9.2の特殊処理要件を満たしている。**Pass**

---

### [観察-B] `buildPromptVariables()`内に冗長な条件がある（重要度: Low）

**該当箇所:** L1352〜1353

```typescript
for (const key of [...template.variables, ...required]) {
  if (!allowed.has(key) && !required.includes(key)) continue;
```

`template.variables`からのkeyは必ず`allowed`に含まれ、`required`からのkeyは必ず`required.includes(key)`がtrueとなるため、このガード条件は常にfalseとなり実質的に無効である。ロジックの正確さには影響しないが、コードの可読性のため将来的に整理を推奨する。

---

## 指摘サマリー

| # | 種別 | 内容 | 深刻度 | AC# |
|:---|:---|:---|:---|:---|
| Bug-01 | ロジック不整合 | Reviewer Decision完了経路が存在しない | High | AC-18 |
| Bug-02 | ロジック不整合 | loop_counter増分条件が未発火 | High | AC-19 |
| 観察-B | 軽微 | buildPromptVariables内の冗長ガード | Low | — |

---

## 次アクション

Bug-01およびBug-02をIntegrator-Cへ報告し、起因判定（実装起因）の上、Workerへ修正指示を出すこと。観察-Bは次回改善候補として記録する。
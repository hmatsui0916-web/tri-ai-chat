```
Role: Debugger
Scope: Failure Analysis Only
```

# U-FLOW-11 DebugReport（再検証）

## 対象

`page.tsx`（v0.17.0-flow-ui 修正版）
前回DebugReport Bug-01 / Bug-02 の修正確認

---

## 判定

**Conditional Pass**

Bug-02は完全に解消された。Bug-01は部分的に解消されたが、新たな設計上の不整合が生じており修正が必要である。加えて、新規に発見した軽微な問題を1件記録する。

---

## Bug-01 再検証：Reviewer Decision完了経路

### 修正内容の確認

`applyResolvedStep()`（L1828〜1880）が修正され、`selectedDecision`が確定済みの場合に`applyDecisionStep()`を呼び出してFlowを前進させる経路が追加された。ロジック自体は正しい。

### [Bug-01a] UIボタンとapplyResolvedStep経路が二重実装になっており、実際にはapplyResolvedStep経路が到達不能（重要度: High）

**現象:**

Decision Controlボタン（L3602〜3669）のonClickハンドラが、`applyDecisionStep()`の呼び出し・state更新・completedStepIds更新・nextStep解決・ActionLog記録をすべて自己完結で実行している。これにより、Decisionボタン押下時点でFlowは既に前進している。

一方、`applyResolvedStep()`内のReviewer Decision経路（L1828〜1880）は、`isCurrentStepCompleteDisabled`の条件（L2080）により「Complete」ボタンが`isReviewerDecisionStep(currentStep) === true`の間は常にdisabledとなり、`applyResolvedStep()`のReviewer Decision経路は実際には呼ばれない。

さらに`✓ Complete {currentStep.id}`ボタンのrender条件（L3517）が`!isReviewerDecisionStep(currentStep)`を含んでいるため、Reviewer Decisionステップ中はCompleteボタン自体が非表示となる。

**結果:** `applyResolvedStep()`に追加されたReviewer Decision経路は到達不能コードであり、実際のDecision実行はUIボタンのonClickで完結している。

**問題点:** `applyResolvedStep()`と UIボタンonClickで同一ロジックが二重実装されており、将来的な変更時に片方のみ修正される保守リスクがある。また、`selectedDecision`のリセットがDecisionボタンonClick完了後に行われないため、別ステップへ進んだ後も`selectedDecision`が前回の値を保持し続ける。

**修正方針:**
以下いずれかを選択すること。
- UIボタンonClickのDecisionロジックを`applyResolvedStep()`への委譲に統一し、`isCurrentStepCompleteDisabled`の条件を「`isReviewerDecisionStep(currentStep) && !selectedDecision`」に変更する。
- または`applyResolvedStep()`のReviewer Decision経路を削除し、UIボタンonClickを正式な実装として確定した上で、`selectedDecision`リセット処理をonClick完了後に追加する。

---

### [Bug-01b] fb-spec-03がDecision Controlに表示されない（重要度: Medium）

**現象:**

`isReviewerDecisionStep()`（L561〜569）の判定条件は以下の3つである。
```
step.decision_key === "review_decision"
step.template_ref === "reviewer_decision_step"
step.id === "main-04"
```

Flow v1.4 JSONではfb-spec-03は`template_ref: "reviewer_decision_step"`を持つ。`resolveTemplateStep()`によってtemplate_refが解決された場合、解決後のstepオブジェクトには`template_ref`フィールドが残るが、`decision_key`は解決後のtemplate内容（`decision_key: "review_decision"`）がマージされる。

一方、解決が成功した場合（`template_unresolved`がないケース）、`isReviewerDecisionStep()`の`!step.template_unresolved`条件はtrueとなり、`step.template_ref === "reviewer_decision_step"`でfb-spec-03を検出できる。ここまでは問題ない。

しかし、Decision Controlパネルの表示条件（L3594）は`isReviewerDecisionStep(currentStep)`であり、fb-spec-03が`currentStep`になった場合にも表示されるはずである。実際に表示されるかを確認するため、`resolveTemplateStep()`でtemplate解決後のfb-spec-03に`decision_key`がマージされているか確認する。`resolveTemplateStep()`の動作を確認しました。templateのプロパティが先に展開され、stepの値で上書きされる構造（L831〜840）のため、fb-spec-03のtemplate解決後には`decision_key: "review_decision"`がtemplateからマージされる。よってBug-01bは実際には問題にならないことを確認。

---

Bug-01bは**誤検知**。`resolveTemplateStep()`がtemplate→stepの順でマージするため、fb-spec-03解決後に`decision_key: "review_decision"`が付与され、`isReviewerDecisionStep()`は正しくtrueを返す。問題なし。

---

## Bug-02 再検証：loop_counter増分

**確認内容:**

前回指摘のL1900〜1906（`step.type === "cause_classification_resolver"`による増分）が削除されていることを確認済み（L1947でhandlerが終了）。`applyControlReviewResolution()`（L2060）の`incrementLoopCount()`呼び出しのみで一元管理されている。

**判定: Pass** ✅ Bug-02は完全に解消された。

---

## 新規検出事項

### [New-01] `selectedDecision`がフロー遷移後にリセットされない（重要度: Medium）

**該当箇所:** L3651 / Decision Controlボタン

**現象:**
Decisionボタン（pass/conditional/reject）押下のonClickで`setSelectedDecision(decision)`が呼ばれるが（L3651）、フロー遷移完了後に`selectedDecision`をリセットする処理が存在しない。次にReviewer Decisionステップ（fb-spec-03等）へ到達した際、前回選択値が`selectedDecision`に残存する。

**影響:**
fb-spec-03のDecision Controlに前回のmain-04の選択値が反映された状態で表示される。ユーザーが選択を変更せずそのまま確定した場合、意図しない分岐が発生する可能性がある。

**修正方針:**
`applyControlReviewResolution()`の`feedback_branch`経路（L2040〜2073）および`applyResolvedStep()`の正常完了パスの末尾で`setSelectedDecision(null)`を呼び出し、ステップ遷移のたびに選択値をリセットすること。

---

## テスト結果サマリー

| # | 項目 | 判定 |
|:---|:---|:---|
| Bug-01 解消確認 | applyResolvedStep()のReviewer Decision経路追加 | ⚠️ 到達不能コード（Bug-01a） |
| Bug-01b | fb-spec-03のDecision Control表示 | ✅ 誤検知（問題なし） |
| Bug-02 解消確認 | loop_counter増分の一元化 | ✅ Pass |
| New-01 | selectedDecisionリセット漏れ | ⚠️ Medium |

---

## 次アクション

Bug-01aおよびNew-01をIntegrator-Cへ報告すること。いずれも実装起因。Bug-01aは実装の重複・到達不能コードの整理、New-01はリセット処理の追加で対処可能である。
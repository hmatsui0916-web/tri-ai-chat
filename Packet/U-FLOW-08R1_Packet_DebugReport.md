---

## U-FLOW-08R1 page.tsx レビュー

### 結論

**ビルドは通過しているが、Acceptance Criteria観点では未達。**TC-07・TC-08が実行不能、TC-02/03/06に動作懸念があります。Worker Reportが「PASS」で出ているとしたら、それは過剰申告です。

---

### 🔴 重大な未対応

**① TC-07（Environment Fallback Reclassification）UIが完全欠落**

型定義とstateは追加されているが、UI本体が一切ありません。

```
✅ EnvironmentFallbackInput 型定義 (268-271)
✅ codeChangeRequired state (1067)
✅ reclassifyCause state (1068)
❌ code_change_required checkbox  → 未実装
❌ reclassify_cause selector      → 未実装
❌ Apply reclassification button  → 未実装
❌ fallback判定ロジック             → 未実装
```

Packet H節（657-684行）の要件全て、Acceptance Criteriaの「TC-07 が実行可能」が未達です。state変数を定義したまま使っていない状態。

---

**② TC-08（Verified Transition Priority）の4条件→controlVerified連動なし**

これは最も重要な不具合です。

- **既存UI**：`controlVerified` boolean checkbox（2239行）→ `controlReviewResolution` の判定はこれだけを見る
- **新規UI**：`verifiedConditionInputs` の4 checkbox（2550行）→ `isVerifiedConditionMet` で判定

ところがこの2つが**連動していません**。4条件すべてONにしても、`controlReviewResolution` は依然 `controlVerified=false` のまま `feedback_branch` を返します。「✓ すべての条件を満たしています。Verified transition が優先されます」というメッセージは**表示されるだけで、実際の処理には反映されない**状態。

Packet 341行の「内部判定は4条件ANDで verified = true として扱う」が実装されていません。

修正案：
```typescript
useEffect(() => {
  setControlVerified(isVerifiedConditionMet(verifiedConditionInputs));
}, [verifiedConditionInputs]);
```
または `controlReviewResolution` の依存条件を `controlVerified || isVerifiedConditionMet(verifiedConditionInputs)` に変更。

---

### 🟡 動作懸念

**③ applyDecisionStepの`to`フィールドが未反映（TC-02 / TC-03影響）**

```typescript
// 2518行
setFlowRuntimeState({
  state: result.state_to || flowRuntimeState.state,
  routeContext: flowRuntimeState.routeContext,  // ← toは反映されない
});
```

`applyDecisionStep` は `{state_to, to}` を返しているのに、UIは `state_to` しか使っていません。reject時の「to=Designer」がRuntimeに残らないため、TC-02の期待結果「to が Designer になる」のエビデンスが取れません。state_to=Designedで間接的に通る可能性はありますが、Packet 3.4節の `to` 反映要件は満たしていません。

加えて、main-04でdecision後の次stepはmain-05（pass/conditional）またはmain-03相当（reject）に進むはずですが、route_context遷移ロジックが見当たりません。state_routing経由で間接的に解決される設計だとしても、UIが意図通り動くか確認が必要です。

---

**④ Flow構造表示が要件を満たさない**

Packet 1節（141-168行）は `id / name / type / route_context / from / to / state_from / state_to / human_gate / template_ref / template_unresolved` の **table表示**を要求していますが、実装は件数のみ：

```
Main Flow Steps: 10
Feedback Branches: implementation, specification, environment
```

Acceptance Criteria「main_flow step一覧が確認できる」「branch内step一覧が確認できる」未達。これはCONDITIONAL扱いに留めうる軽微版に倒すか、Worker Reportで「未実装」明記すべきだった項目です。

---

**⑤ manual_execution専用ボタンなし（TC-06影響）**

Packet 3.8節は「Manual execution completedボタン」を求めていますが、`type === "manual_execution"` 専用のボタンが見当たりません。`isExternalHandoffStep(step)` の条件でのみ「Copy handoff text」が出る形で、manual_execution stepは通常の「Approve human gate」ボタンで処理される構造になっています。

guardStatus に `manualExecutionWaiting` は表示されるので、TC-06自体は通過しうるものの、UI上の意図明示が弱い。

---

### 🟢 適切に実装されている箇所

- **型定義群**：Packet A節すべて準拠
- **Runtime state拡張**：Packet B節すべて準拠
- **Runtime Reset / state・route_context手動設定**：3.1 / 3.2準拠
- **cause_classification選択**：既存ControlReview UIで動作（2237-2255）
- **Parallel / Join Controls**：Debugger/Infra個別checkbox、join完了ボタン、未完了時メッセージあり
- **loop counts branch別表示**：max_iterations付きで適切
- **Guard状態表示**：5種類のwaiting状態を色分け表示
- **Action Log**：before/after state記録、stepId付き
- **template_unresolved判定**：guard連動済み

---

### Acceptance Criteria 対応表

| TC | 判定 | 状態 |
|---|---|---|
| TC-01 主経路 | △ | TC-08修正必須（main-08後Verified遷移できないため） |
| TC-02 reject | △ | state_toは通るが、to未反映 |
| TC-03 conditional | △ | 同上 |
| TC-04 impl loop | ✅ | 動作可 |
| TC-05 spec loop | ✅ | 動作可 |
| TC-06 env loop | △ | manual_execution UI弱い |
| **TC-07 fallback** | **❌** | **UI完全欠落** |
| **TC-08 Verified優先** | **❌** | **4条件→controlVerified連動なし** |
| TC-09 max iter | ✅ | 動作可 |
| TC-10 template guard | ✅ | 動作可 |
| TC-11 ext handoff | ✅ | 動作可 |
| TC-12 join guard | ✅ | 動作可 |

---

### 推奨アクション

このまま U-FLOW-08 統合動作確認に入ると、TC-07・TC-08で**FAIL確定**します。FAIL分類は明確に「実装不備」（routing resolverやFlow解釈の問題ではない）なので、U-FLOW-08を実施する前に **U-FLOW-08R1自体に修正パッチを当てる**のが効率的です。

最小修正スコープ：

1. `verifiedConditionInputs` → `controlVerified` 連動の useEffect を1個追加（数行）
2. Environment Fallback UI ブロック追加（30〜50行程度）
3. `applyDecisionStep` の呼び出し側で `to` をログに記録（数行）

この3点だけ入れればTC-07・TC-08が動作可能になり、TC-01もチェーン経由でPASSになります。Flow構造tableとmanual_execution専用ボタンは CONDITIONAL 扱いで後回し可。

修正パッチを書くか、Workerへ差戻すかどちらで進めますか？
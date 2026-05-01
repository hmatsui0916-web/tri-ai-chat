ファイルを確認します。Flow v1.4 JSONと照合しながらレビューします。全体的に構造はしっかりしていますが、いくつか指摘事項があります。

---

## U-FLOW-08_TestPlan レビュー

### 総評

構成・カバレッジともに高水準。主経路・feedback branch・異常系がバランスよく揃っており、v1.4定義との整合性も概ね取れています。ただし以下の点で修正または補足を推奨します。

---

### 指摘事項

**🔴 要修正（Flow定義との不整合）**

**① TC-02・TC-03のAcceptance Criteria未記載**

TC-02（reject）とTC-03（conditional）はTest Policyの8番「異常系・routing確認」に相当しますが、Acceptance Criteriaセクションに明示されていません。

```
現状: TC-01 / TC-04〜TC-06 / TC-08〜TC-12 のみ記載
問題: TC-02・TC-03がPASSでなくてもU-FLOW-08全体がPASSになってしまう
```

TC-01の主経路でmain-04はpassルートしか通らないため、reject / conditionalは独立TCとして評価する必要があります。Acceptance CriteriaにTC-02・TC-03を追加することを推奨します。

---

**② TC-05の初期state_routing未定義パスへの注意**

Flow v1.4の`orchestration.state_routing`を確認すると：

```json
{ "state": "Designed", "route_context": "feedback_specification", "next": ["fb-spec-02"] }
```

fb-spec-01完了後の`state_to: "Designed" / route_context: "feedback_specification"`でfb-spec-02へ進むルートは定義済みです。ただし、TC-05の手順2〜3の間で「fb-spec-01完了 → state=Designed/feedback_specification → fb-spec-02へ自動routing」という流れをUIが正しく処理するか、手順に明示されていません。手順2と3の間に「routing resolverがfb-spec-02を解決することを確認する」を追記することを推奨します。

---

**③ TC-08の初期route_contextとmain-08→Verified遷移パスの混在**

TC-08の初期状態に`route_context: feedback_implementation または feedback_specification または feedback_environment`と書かれていますが、TC-01のControlReview（`route_context: main`）でVerifiedになるケースとは別TCとして整理されています。これは正しい分離です。ただし、**TC-01の期待結果にも`state → Verified → main-09`の遷移確認が含まれており、TC-08との重複**があります。

どちらかを「mainルートからのVerified」「feedback後のVerified」と明示的にタイトルで区別するか、TC-01の期待結果からVerified遷移確認を切り出してTC-08へ一本化するか、方針を明確にすることを推奨します。現状では両TCが走った場合に重複エビデンスが発生します。

---

**🟡 補足推奨（定義に存在するが未テスト）**

**④ TC-09のbranch別カウンター独立性が未確認**

v1.4定義では`implementation / specification / environment`それぞれに`max_iterations: 3`が設定されています。TC-09では「任意のfeedback branch」としていますが、**別branchに切り替えた際にカウンターがリセットされるか**（例：implementationで2回消費後にspecificationへ切り替えた場合）は確認対象外になっています。統合テストとして境界ケースに当たるため、TC-09の手順か備考に追記を推奨します。

---

**⑤ fb-env-02のmanual_execution扱いの根拠がPreconditionsに不足**

`fb-env-02`は`type: "manual_execution"`で、`from: Human`という特殊なstepです。外部handoffとも通常のhuman_gateとも異なる扱いですが、Preconditionsに「manual_execution stepをUIで表現できること」が記載されていません。TC-06で初めて登場するため、Preconditionとして明示することを推奨します。

---

**⑤ TC-07の手順が粗い**

TC-07（Environment Fallback Reclassification）は手順が3行で、「どのUIアクションでcode_change_required条件を入力するか」が不明です。他のTCと比べて手順の粒度が明らかに粗く、テスト実施者が操作に迷う可能性があります。実装依存の部分はあるにせよ、「Integrator-CがControlReview画面でenvironmentを選択し、code_change_requiredフラグをtrueに設定した場合」のように操作イメージを補足することを推奨します。

---

**🟢 確認済み（問題なし）**

| 項目 | 評価 |
|---|---|
| state_routing定義との整合 | 問題なし |
| template_refのTC-10・TC-05での二重確認 | 意図的で適切 |
| Verified遷移のroute_context_reset確認 | TC-08に明示あり |
| Evidence to Recordの項目 | 網羅的で適切 |
| Final JudgmentのCONDITIONAL定義 | 明確で運用しやすい |
| Out of Scope | Flow定義変更・永続化変更など適切に除外 |

---

### 修正優先度サマリ

| 優先度 | 対象 | 内容 |
|---|---|---|
| 🔴 高 | Acceptance Criteria | TC-02・TC-03を追加 |
| 🔴 高 | TC-01 vs TC-08 | Verified遷移確認の重複を整理 |
| 🟡 中 | TC-05 手順 | fb-spec-01→fb-spec-02のrouting確認を明示 |
| 🟡 中 | TC-07 手順 | code_change_required入力操作を補足 |
| 🟡 中 | Preconditions | manual_execution UIサポートを追加 |
| 🟢 低 | TC-09 | branch間カウンター独立性を備考追記 |

修正してv1.4Rとして出すか、このままTC実施してFAIL時に分類するか、どちらで進めますか？
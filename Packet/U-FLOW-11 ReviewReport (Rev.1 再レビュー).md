```
Role: Reviewer
Scope: Spec Validation
```

# U-FLOW-11 ReviewReport (Rev.1 再レビュー)

## 対象

U-FLOW-11_Spec.md (Rev.1)
Chat Runtime Integration Design
作成者: Designer

参照照合対象:
- U-FLOW-11_PMDecision_Start.md（PM判断・Scope・Acceptance Criteria）
- AI Business OS Full Flow v1.4（ai-business-os-flow-v1_4.json）
- 前回ReviewReport（指摘-01〜05）

---

## 判定

**Conditional**

前回Conditional指摘の主要項目はすべて解消された。ただし、Section 1のステップ解決表に実装上の問題となる誤りと欠落が残存しており、U-FLOW-11実装着手前に修正を要する。

---

## 前回指摘の解消確認

| 指摘ID | 内容 | 解消状況 |
|:---|:---|:---|
| 指摘-01 | Step解決テーブルが不完全（feedback flow未網羅） | ✅ Section 1.1/1.2に全main stepおよびfeedback代表stepを追加。parallel/join/human_only処理特性も明示。 |
| 指摘-02 | Reviewer Decision分岐処理仕様が未定義 | ✅ Section 3.1に選択肢提示→Human選択→Route確定→context引き継ぎのフローを定義。 |
| 指摘-03 | fb-env Human manual_execution処理が未定義 | ✅ Section 4.2に手順表示→結果入力→完了操作の仕様を定義。 |
| 指摘-04 | feedback loop iteration counterの参照仕様が未定義 | ✅ Section 2.1にloop_counter参照・上限超過時のエスカレーション処理を定義。 |
| 指摘-05 | Acceptance CriteriaにReviewer Decision分岐処理が未記載 | ✅ Section 6に分岐ステップの検証項目を追加。 |

---

## 新規指摘事項（Conditional判定の根拠）

### [指摘-C01] main-05のRole割り当てが誤っている（重要度: High）

**該当箇所:** Section 1.1 Main Flow ステップ解決表 main-05行

**現象:**
現在の記載:
> Step ID: main-05 / Role (Target): **PM to Integrator-S** / Role Template: Integrator-S Template

Flow v1.4 main-05の定義:
```
"from": "PM",
"to": "Integrator-S",
"state_from": "Reviewed",
"state_to": "Integrated"
```

main-05の実行Roleは**Integrator-S**である。「PM to Integrator-S」はFlowのステップ名（遷移の表現）であり、Role列に記載すべき実行主体ではない。PM自身がPromptを実行するステップではなく、PMがIntegrator-SへSpecを渡す遷移であり、Prompt生成対象はIntegrator-Sである。

**影響:**
RuntimeがRole列を参照してTemplate選択する場合、「PM to Integrator-S」という文字列ではTemplate解決ができない。

**修正方針:**
Role列を `Integrator-S` に修正すること。

---

### [指摘-C02] main-09のRole割り当てが誤っている（重要度: High）

**該当箇所:** Section 1.1 Main Flow ステップ解決表 main-09行

**現象:**
現在の記載:
> Step ID: main-09 / Role (Target): **Integrator-C** / Role Template: Integrator-C Template

Flow v1.4 main-09の定義:
```
"from": "Integrator-C",
"to": "PM",
"state_from": "Verified",
"state_to": "Approved"
```

main-09はIntegrator-CからPMへControlDecisionを渡し、PMが承認判断を行うステップである。実行Roleは**PM**であり、Integrator-CはControlDecisionを既に出力済みの状態でこのステップに到達する。

**影響:**
main-08でIntegrator-CのTemplate実行は完結している。main-09でIntegrator-Cのテンプレートを再度呼び出すと、Integrator-CがVerified判定を二重実行するリスクがある。

**修正方針:**
Role列を`PM`、Role Template列を`PM Template`に修正すること。

---

### [指摘-C03] fb-impl-03, fb-spec-07等のjoin stepが解決表から欠落（重要度: Medium）

**該当箇所:** Section 1.2 Feedback Flow 代表ステップ解決表

**現象:**
Section 1.2には「代表ステップ」として一部のstepが記載されているが、以下のjoin stepが存在しない。

- `fb-impl-03`（Debugger/Infra → Integrator-C の再集約）
- `fb-spec-07`（Debugger/Infra → Integrator-C の再集約）
- `fb-env-03`（Human → Infra への結果戻し）
- `fb-env-04`（Infra → Integrator-C への最終集約）

これらはfeedback loopの終端判定（Verified遷移またはloop継続の判定）に直結するステップであり、解決表への記載が必要である。

**修正方針:**
上記4stepを解決表に追加し、処理特性欄に「Join（Integrator-C再判定）」等を明記すること。

---

### [指摘-C04] fb-impl-03, fb-spec-07のjoin完了後にVerified遷移の処理が未定義（重要度: Medium）

**該当箇所:** Section 3「分岐およびステップ完了制御仕様」

**現象:**
Section 3.1はmain-04（Reviewer Decision）の分岐処理を定義しているが、Feedback loop終端でのVerified遷移処理が未定義である。Flow v1.4の`verified_transition`では、条件充足時に`route_context`を`main`へリセットしてmain-09へ接続する。

この処理（Integrator-Cがjoin集約後にVerified判定した際のroute_contextリセットとmain-09への接続）はSection 3.1の分岐処理とは別の制御ロジックであり、明示が必要である。

**修正方針:**
Section 3に「Verified遷移処理」サブセクションを追加し、「Integrator-C join完了後、loop_exit_condition充足時にroute_contextをmainへリセットし、main-09へ接続する」旨を明記すること。

---

### [申し送り-G] fb-spec-03のReviewer Decisionが解決表に記載されているが処理特性の記述が不十分

**該当箇所:** Section 1.2 fb-spec-03行

**現象:**
fb-spec-03は`template_ref: reviewer_decision_step`を使用するステップであり、main-04と同一の分岐処理（pass/conditional/reject）が必要である。現在の解決表では「分岐ステップ（再レビュー判定）」とのみ記載されており、Section 3.1の分岐処理仕様がfb-spec-03にも適用される旨が明示されていない。

U-FLOW-11実装時に「同一処理として共通化するか、別実装とするか」を確認した上で対処すること。本Spec修正の必須対象ではないが、U-FLOW-11実装着手前に確定することを推奨する。

---

## リスク

| # | リスク内容 | 深刻度 |
|:---|:---|:---|
| R-01 | main-05のRole誤記によりIntegrator-S Templateが解決できない | High |
| R-02 | main-09のRole誤記によりPM承認ステップがIntegrator-C二重実行になる | High |
| R-03 | join step欠落によりfeedback loop終端のVerified遷移が未定義のまま実装に進む | Medium |
| R-04 | Verified遷移処理未定義によりroute_contextリセットが実装から漏れる | Medium |

---

## Acceptance Criteria 照合

| Acceptance Criteria | 達成状況 |
|:---|:---|
| 全stepにおいて正確なRole/Templateが解決されること | ⚠️（main-05/09の誤記、join step欠落あり） |
| 分岐ステップでHuman選択に応じて次ステップが正しく解決されること | ✅ |
| max_iterations超過時にPrompt生成が停止しPMへ警告が表示されること | ✅ |
| Human manual_executionステップが正しく機能すること | ✅ |
| Worker用Handoff Promptが生成されること | ✅ |
| Integrator-S実行時にPM承認済みであることが担保されること | ✅ |

---

## 次アクション

Designerへ差し戻し、以下の修正を依頼する。

1. Section 1.1のmain-05 Role列を`Integrator-S`に修正すること。
2. Section 1.1のmain-09 Role列を`PM`、Template列を`PM Template`に修正すること。
3. Section 1.2にfb-impl-03, fb-spec-07, fb-env-03, fb-env-04を追加すること。
4. Section 3にVerified遷移処理サブセクションを追加すること。

修正後、PMへ回付すること。申し送り-GはU-FLOW-11実装着手前に確定すること。
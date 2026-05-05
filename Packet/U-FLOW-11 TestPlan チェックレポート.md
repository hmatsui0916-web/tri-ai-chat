```
Role: Infra
Scope: Environment & Test
```

# U-FLOW-11 TestPlan チェックレポート

## 対象

U-FLOW-11_TestPlan.md
Chat Runtime 組み込み 実機テスト計画

照合対象:
- U-FLOW-11_Spec.md Rev.2（Acceptance Criteria）
- U-FLOW-11_Packet.md（AC 25項目）
- U-FLOW-11 DebugReport 最終確認（Pass済み内容）
- AI Business OS Full Flow v1.4 JSON

---

## 判定

**Conditional**

TestPlanの構造・TC設計・Evidence要件は実機確認に耐えうる品質である。ただし、3点の修正または補足を実施前に確定させること。

---

## 確認済み項目

TestPlanのScope（Section 4）、TC-01〜TC-15の設計、Evidence to Record（Section 9）、Acceptance Criteria（Section 10）はいずれもU-FLOW-11_Spec Rev.2およびPacket AC 25項目と整合している。以下を確認済みとして記録する。

- TC-01: main-01〜10の全Step/Role/Template対応表は正確。main-06の「Integrator-S to Worker」に関する注記も適切に記載されている。
- TC-05: PM承認済みSpec GuardのOFF/ON確認手順は、実装の`assertPmApprovedForIntegratorS()`の動作と整合している。
- TC-09: selectedDecisionリセット確認がTC-09期待結果に明示されており、DebugReport最終確認との接続が適切。
- TC-13: Verified transition後のstate/route_context/current_step/Role確認手順は、`applyControlReviewResolution()`の実装と整合している。

---

## 指摘事項

### [指摘-01] TC-04のInfra main-07手順が未記載（重要度: Medium）

**該当箇所:** TC-04 期待結果

**現象:**
TC-04の期待結果にはWorker / Reviewer / Infra（fb-env-01/fb-env-03）の未定義Input禁止確認が記載されているが、main-07 Infra Promptの確認が抜けている。Infra Template（U-FLOW-10 Section 6.8）のVariablesは`worker_code`, `human_execution_result`, `rework_instruction`, `packet_content`, `target`であり、main-07時点では`human_execution_result`と`rework_instruction`が条件付き/任意Inputとして除外されるべきである。

**修正方針:**
TC-04の期待結果に以下を追加すること。
> Infra main-07には `worker_code`, `packet_content` のみ。`human_execution_result` / `rework_instruction` は混入しない。

---

### [指摘-02] TC-12の手順が操作として実行不可能（重要度: High）

**該当箇所:** TC-12 手順

**現象:**
手順1〜2に「implementation branchを3回実行」「implementation countを3/3にする」とあるが、実機上でfeedback loopを3周するには、毎回Debugger/Infra並列検証とIntegrator-C判定を完了させる必要があり、テストとして現実的でない。また「4回目のimplementation branchへ入ろうとする」手順が、UI上でどの操作を指すか不明確である。

**修正方針:**
RuntimeのfeedbackLoopCountsを直接設定できるUI操作（またはRuntime Resetせずに手動でcounterを進める操作）があればその手順を明記すること。ない場合は「implementation branchを1周実行後、loop counter表示で`implementation: 3/3`になるまでapplyControlReviewResolution()を連続実行する」等、実際の操作に即した手順に修正すること。

---

### [指摘-03] TC-11のfb-env-03手順にInfra Promptの生成確認が欠落（重要度: Low）

**該当箇所:** TC-11 手順・期待結果

**現象:**
TC-11の手順はfb-env-02（Human Manual Execution）の確認に終始しており、手順6「fb-env-03へ進む」の後にInfra Promptが生成されること（fb-env-03: Role: Infra / Input: `human_execution_result`）の確認が期待結果に記載されていない。

**修正方針:**
TC-11の期待結果に以下を追加すること。
> fb-env-03: Role: Infra / `human_execution_result` がInputとして提供される / TestResult出力指示が含まれる

---

## 環境条件チェック

| 確認項目 | 状態 |
|:---|:---|
| U-FLOW-08 PASS済み前提 | ✅ Preconditions Section 6に明記 |
| DebugReport Pass済み前提 | ✅ Preconditions Section 6に明記 |
| アプリ version明記 | ✅ v0.17.0-flow-ui |
| Flow ID明記 | ✅ ai-business-os-full-v1-4 |
| Role別column binding記載 | ✅ Section 6に正確に記載 |
| Worker external / manual handoff扱い明記 | ✅ |
| Worker API自動送信無効明記 | ✅ |
| Evidence記録項目 | ✅ Section 9に15項目 |

---

## Acceptance Criteria照合

| U-FLOW-11 Spec AC | 対応TC | 状態 |
|:---|:---|:---|
| current_stepからRole解決 | TC-01 | ✅ |
| Role Template解決 | TC-01, TC-02 | ✅ |
| template_ref解決 | TC-14 | ✅ |
| Variables埋め込み | TC-04 | ⚠️（Infra main-07確認追加要） |
| 必須Input不足時停止 | TC-03 | ✅ |
| 未定義Input混入禁止 | TC-04 | ✅ |
| Role Header付きPrompt生成 | TC-02 | ✅ |
| Role列投入 | TC-15 | ✅ |
| Worker Handoff Prompt | TC-06 | ✅ |
| Worker API自動送信なし | TC-06 | ✅ |
| main-05/06/09特殊Role解決 | TC-01, TC-05, TC-06 | ✅ |
| fb-impl-02/fb-spec-06 parallel | TC-07 | ✅ |
| fb-spec-03 Reviewer Decision | TC-09 | ✅ |
| max_iterations超過時停止 | TC-12 | ⚠️（手順修正要） |
| Verified後main-09接続 | TC-13 | ✅ |
| Flow最小運用可能 | TC-01〜TC-15全通し | ✅ |

---

## 次アクション

以下3点を修正後、Humanによる実機確認を実施すること。

1. TC-04期待結果にInfra main-07の未定義Input確認を追加。
2. TC-12手順をUI操作として実行可能な記述に変更。
3. TC-11期待結果にfb-env-03 Infra Prompt確認を追加。

修正後のTestPlanをHumanへ提示し、TestResult記録に基づいてIntegrator-Cが起因判定を行う体制を整えること。
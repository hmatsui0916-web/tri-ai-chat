```
Role: Reviewer
Scope: Spec Validation
```

# U-FLOW-11 ReviewReport

## 対象

U-FLOW-11_Spec.md
Chat Runtime Integration Design
作成者: Designer

参照照合対象:
- U-FLOW-11_PMDecision_Start.md（PM判断・Scope・Acceptance Criteria）
- U-FLOW-10_PMDecision_Final.md（申し送りE/F）
- U-FLOW-10_Spec.md Rev.2（Role Template定義・Variables）
- U-FLOW-09_Spec.md Rev.1（Input/Output Schema）
- AI Business OS Full Flow v1.4（ai-business-os-flow-v1_4.json）

---

## 判定

**Conditional**

申し送りE/Fへの対応、Variables埋め込み仕様、Prompt生成仕様の基本構造は妥当である。ただし、PMDecision_StartのScopeおよびAcceptance Criteriaに対して、Spec本体から欠落している項目が複数存在する。修正後、PMへ回付可とする。

---

## 総評

Section 1〜6の構成はPMDecision_StartのScope要求に概ね対応しており、申し送りEの条件付きInput判定（Section 2.1）と申し送りFのPM承認担保（Section 5）はいずれも実用的な方針で解消されている。Flow優先・Template優先・Input制限の基本方針も適切に反映されている。

一方、PMDecision_Startが明示的に要求しているにもかかわらずSpecに記述のない処理が存在する。以下に指摘する。

---

## 指摘事項

### [指摘-01] Section 1のStep解決テーブルが不完全（重要度: High）

**該当箇所:** Section 1「current_step → Role / Template 解決仕様」

**現象:**
テーブルにmain-01〜main-08およびfb-impl-01, fb-spec-01の10ステップが記載されているが、Flow v1.4には以下の未記載ステップが存在する。

主な欠落:
- `main-04`（Reviewer Decision）: human_gate付き分岐ステップ。pass/conditional/rejectの3経路を持つ。
- `main-07`（Worker to Debug/Infra）: parallel stepであり、DebuggerとInfraの両方を対象とする。
- `main-09`（Integrator-C to PM）: VerifiedからApprovedへの遷移。
- `main-10`（PM to Human）: 最終承認ステップ。
- `fb-impl-02`, `fb-impl-03`（実装起因feedbackのDebugger/Infra再検証・再集約）
- `fb-spec-02`〜`fb-spec-07`（仕様起因feedbackの全ステップ）
- `fb-env-01`〜`fb-env-04`（環境起因feedbackの全ステップ）

**影響:**
記載されていないステップに到達した際、RuntimeがRoleとTemplateを解決できず、Flow進行が停止する。特にfeedback flow全体がカバーされていないため、ControlReview以降の運用が成立しない。

**修正方針:**
全main-stepおよびfeedback flowの代表ステップをテーブルに追加すること。parallel stepとjoin stepの処理方針（複数Role同時解決か順次解決か）を備考欄に明示すること。human_gateのみで進行するステップ（main-10等）は「Template不要 / Human操作のみ」として明示すること。

---

### [指摘-02] main-04（Reviewer Decision）の分岐処理仕様が未定義（重要度: High）

**該当箇所:** Section 1、Section 3

**現象:**
Flow v1.4のmain-04はReviewer Decisionであり、pass/conditional/rejectの3分岐を持つhuman_gateステップである。本Specには分岐結果をRuntimeがどう処理するかの記述が存在しない。

具体的に未定義の処理:
- pass → PMへ遷移する際のRoute確定方法
- conditional → PMへ遷移しつつ軽微修正指示をどう扱うか
- reject → DesignerへのRollback時に`{{review_report}}`をどう引き渡すか

**影響:**
Reviewer DecisionはFlow上で最も分岐が多い人間判断ポイントである。RuntimeがHuman Gateの結果（pass/conditional/reject）を受け取り次ステップを解決する処理が未定義のままではU-FLOW-11のAcceptance Criteriaを満たせない。

**修正方針:**
Section 3またはSection 6に「Human Gate結果受領と次ステップ解決」のサブセクションを追加すること。Reviewer Decisionを例として、選択肢提示→Human選択→route確定→次Step解決の処理フローを定義すること。

---

### [指摘-03] Prompt生成仕様にfeedback_environmentの順次実行が未反映（重要度: Medium）

**該当箇所:** Section 3「Prompt生成 & 投入仕様」、Section 4

**現象:**
Flow v1.4のfb-env-02〜fb-env-03はInfra→Human→Infraの順次実行（manual_execution型）であり、通常のAI Role呼び出しとは異なる処理が必要である。Section 3の投入プロセスはAI Roleへの自動ペーストを前提とした記述のみであり、Human実行ステップの処理が未定義。

**修正方針:**
Section 4（Worker Handoff仕様）に倣い、Human manual_executionステップの処理方針（「Human操作ガイドを表示し、完了後にInfraへ結果を戻すフロー」等）をサブセクションとして追加すること。

---

### [指摘-04] feedback loop iteration counterの参照仕様が未定義（重要度: Medium）

**該当箇所:** Section 2、Section 3

**現象:**
Flow v1.4にはfeedback branch別のmax_iterations（最大3回）が定義されている。U-FLOW-01〜08でloop counterは実装済みであるが、U-FLOW-11のPrompt生成・投入仕様においてiteration countを参照し、上限超過時に投入を停止する処理への言及がない。

**影響:**
max_iterations超過時にRuntimeが無条件にWorker等へ再投入し続けるリスクがある。

**修正方針:**
Section 2またはSection 3に「iteration count確認」を処理ステップとして追加し、上限超過時はPrompt生成を停止しPMへエスカレーションする旨を明記すること。

---

### [指摘-05] Acceptance CriteriaにReviewer Decision分岐処理が未記載（重要度: Low）

**該当箇所:** Section 7「Acceptance Criteria」

**現象:**
PMDecision_StartのAcceptance Criteriaに「条件付きInputを条件に応じて扱える」は含まれているが、Reviewer Decision等のhuman_gate分岐結果をRuntimeが受け取り次ステップを解決できることの検証項目が存在しない。

**修正方針:**
「Reviewer Decision等のhuman_gate分岐結果（pass/conditional/reject）に応じて次ステップが正しく解決されること」をAcceptance Criteriaに追加すること。

---

## リスク

| # | リスク内容 | 深刻度 |
|:---|:---|:---|
| R-01 | feedback flow全体がStep解決テーブル未記載のためControlReview以降の運用が成立しない | High |
| R-02 | Reviewer Decision分岐処理未定義によりreject時のDesigner差戻しが機能しない | High |
| R-03 | max_iterations超過時の停止処理欠落によりfeedback loopが無制限継続するリスク | Medium |
| R-04 | fb-env Human manual_execution処理未定義により環境起因フィードバックが停止する | Medium |

---

## Acceptance Criteria 照合

| Acceptance Criteria（PMDecision_Start） | 達成状況 |
|:---|:---|
| current_stepから対象Roleを解決できる | ⚠️（全Stepが未網羅） |
| current_stepから使用Role Templateを解決できる | ⚠️（全Stepが未網羅） |
| Template VariablesへInputを埋め込める | ✅ |
| 必須Input不足時にPrompt生成を停止できる | ✅ |
| 条件付きInputを条件に応じて扱える | ✅ |
| Role Header付きPromptを生成できる | ✅ |
| 対象Role列へPromptを投入できる | ✅ |
| Worker external_handoff用Promptを生成できる | ✅ |
| Integrator-S実行時にPM承認済みSpecであることを担保できる | ✅ |
| Role Output受領後、Humanがstep完了操作できる | ✅ |
| U-FLOW-11完了後、Flowに沿ったRole実行の最小運用が可能になる | ❌（feedback flow未網羅のため） |

---

## 次アクション

Designerへ差し戻し、以下の修正を依頼する。

1. Section 1のStep解決テーブルにfeedback flow全体（fb-env含む）および欠落mainステップを追加すること。parallel/join/human_only stepの処理方針を明示すること。
2. Section 3またはSection 6にhuman_gate分岐結果（pass/conditional/reject）の受領・次ステップ解決処理を追加すること。
3. fb-env Human manual_executionステップの処理方針をSection 4に追加すること。
4. Section 2またはSection 3にiteration count確認と上限超過時のエスカレーション処理を追加すること。
5. Section 7のAcceptance Criteriaにhuman_gate分岐処理の検証項目を追加すること。
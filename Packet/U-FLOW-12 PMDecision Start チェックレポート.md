```
Role: Reviewer
Scope: PMDecision Validation
```

# U-FLOW-12 PMDecision Start チェックレポート

## 対象

U-FLOW-12_PMDecision_Start.md
Artifact Save Runtime
作成者: PM

参照照合対象:
- U-FLOW-09_Spec.md Rev.1（Role I/O Schema・成果物命名規則）
- U-FLOW-10_Spec.md Rev.2（Decision系命名規則・ReworkInstruction命名規則）
- U-FLOW-11_PMDecision_Final.md（U-FLOW-11完了状態）
- AI Business OS v1.6.3 [S16]（命名規則）

---

## 判定

**Conditional**

PMDecisionとしての構造・目的・Scopeはおおむね妥当である。ただし、過去Unit（U-FLOW-09 / U-FLOW-10）で確定した命名規則との不整合が複数存在し、このまま開始するとDesigner Spec作成段階で矛盾が顕在化する。Start前に整合を取ることを推奨する。

---

## 確認済み項目

- 背景の記述は適切。U-FLOW-11完了後のボトルネック（Human手動コピー・命名・保存・受け渡し）を明確に特定している。
- Scope / Out of Scopeの境界が明確。完全な成果物管理システムではなく「最小運用に必要な保存・参照機能」に絞られており、Unit粒度として適切。
- Acceptance Criteriaは14項目で具体的かつ検証可能な形式で記述されている。
- 「U-FLOW-11のChat Runtimeを壊さない」が明示されており、既存実装への影響配慮が取られている。

---

## 指摘事項

### [指摘-01] PMDecision Phase一覧がU-FLOW-10で確定した命名規則と不整合（重要度: High）

**該当箇所:** Section「PMDecision形式」

**現象:**
本DecisionでのPhase一覧:
> Start / SpecApproval / PacketApproval / WorkerApproval / ControlApproval / Final / Conditional / Hold

U-FLOW-10_Spec Rev.2 Section 4.1で確定した命名規則:
> Start / Final / Rework / Hold

両者が以下の点で乖離している。

1. U-FLOW-10では`Rework`が単一Phaseとして定義されているが、本Decisionでは廃止されReworkは別形式（`[Unit]_PMDecision_Rework_[TargetRole].md`）として独立している。
2. U-FLOW-10には存在しない`SpecApproval`, `PacketApproval`, `WorkerApproval`, `ControlApproval`, `Conditional`の5Phaseが新規追加されている。

**影響:**
U-FLOW-10 Section 6.2のPM Template出力定義は`{{unit_id}}_PMDecision_[Start/Final/Rework/Hold].md`となっており、新Phaseに対応していない。U-FLOW-12でArtifact Save Runtime側だけPhaseを拡張すると、PM Template出力との不整合が生じる。

**修正方針:**
以下いずれかを選択すること。
- U-FLOW-10 Section 4.1およびSection 6.2の命名規則を本Decisionで明示的に「拡張」と位置づけ、U-FLOW-12でPM Template側も同時更新する旨をScopeに追加する。
- または、Phase拡張はU-FLOW-12のスコープ外とし、U-FLOW-10と同一の4Phase（Start / Final / Rework / Hold）に揃える。

なお、過去のDecisionファイルでは`PMDecision_Conditional`が既に使用されており（U-FLOW-10_PMDecision_Conditional.md）、`Conditional`の追加自体は実運用と整合している点は確認した。

---

### [指摘-02] Reworkの命名規則がU-FLOW-10と矛盾（重要度: High）

**該当箇所:** Section「PMDecision形式」差戻し判断

**現象:**
本Decisionでの定義:
> 差戻し判断: `[Unit]_PMDecision_Rework_[TargetRole].md`

U-FLOW-10_Spec Rev.2 Section 4.1:
> 差戻し/再検討判断: `[Unit]_PMDecision_Rework.md`

U-FLOW-10ではTargetRoleを含まない命名であるが、本DecisionではTargetRoleを必須としている。

さらに、U-FLOW-10 Section 4.2で`ReworkInstruction`のTargetRole付き命名（`[Unit]_ReworkInstruction_[TargetRole]_[timestamp].md`）が定義されており、PMDecision_ReworkとReworkInstructionが別成果物であることに注意が必要である。

PMが判断のたびにTargetRoleを命名に含める設計意図は理解できるが、U-FLOW-10での確定済みルールを上書きする変更となる。

**修正方針:**
U-FLOW-10との整合のため、以下のどちらかに統一すること。
- U-FLOW-10命名（`[Unit]_PMDecision_Rework.md`）に揃え、TargetRoleはファイル本文内で明示する。
- TargetRole付き命名を採用するなら、U-FLOW-10 Section 4.1の更新を本Decisionで明示的に宣言する。

---

### [指摘-03] PMDecisionにタイムスタンプが付与されない設計の意図が未説明（重要度: Medium）

**該当箇所:** Section「PMDecision形式」「Report系形式」「ReworkInstruction形式」

**現象:**
- ReworkInstruction → タイムスタンプあり
- Report系（ReviewReport / DebugReport / TestResult） → タイムスタンプあり
- PMDecision → タイムスタンプなし（固定ファイル名）

U-FLOW-09_Spec Rev.1 Section 5では、PMDecision系は`U09_Decision_20260505_200000.md`のようにタイムスタンプ付与形式として例示されていた。

本DecisionでPMDecisionをタイムスタンプなし固定名にする方針は、Phase（Start/SpecApproval/Final等）で時系列を識別する設計意図と理解できるが、同一Phaseで複数回判断が発生した場合（例: SpecApprovalを軽微修正後に再発行）の扱いが「同名衝突防止」セクションだけでは不明確である。

**修正方針:**
以下を補強すること。
- 「PMDecisionは1Unit内で同一Phaseが複数発生しないことを前提とする」旨をBasic Policyに明記する。
- もし複数発生を許容するなら、衝突時の挙動（バージョン番号付与 / 警告のみ / タイムスタンプfallback）を具体化する。

---

### [指摘-04] Acceptance Criteriaに「ReworkInstruction命名規則」の検証項目があるが「PMDecision Reworkの命名規則」検証が欠落（重要度: Low）

**該当箇所:** Acceptance Criteria

**現象:**
AC項目に以下は含まれている:
- PMDecisionはPhase付き命名規則で保存できる
- ReworkInstructionはTargetRole付き命名規則で保存できる

一方、本Decisionで新規追加された`PMDecision_Rework_[TargetRole]`形式の保存検証項目が独立してリストアップされていない。「PMDecisionはPhase付き命名規則で保存できる」に内包される解釈もできるが、Reworkの場合のみTargetRoleが必須となる特殊形式のため、明示的なAC項目化を推奨する。

**修正方針:**
以下のAC項目追加を検討すること。
> PMDecision_Reworkの場合、TargetRole付き命名規則で保存できる

---

### [指摘-05] Out of Scopeに「Output Schema Validation完全実装」が含まれているが、`File:`抽出失敗時のフォールバックが未定義（重要度: Low）

**該当箇所:** Out of Scope / 基本方針 2「File Header優先」

**現象:**
基本方針2で「Role Output先頭の`File:`を第一候補とする」と記載されているが、`File:`が欠落しているOutput（AI出力崩れの場合）への対応が未定義。Out of Scopeに「Output Schema Validation完全実装」が含まれるため詳細実装は対象外と理解できるが、最小運用上は`File:`欠落時の挙動（Human入力フォーム表示 / 保存停止 / 警告のみ）を方針として明記すべき。

**修正方針:**
基本方針2に以下のような記述を追加することを推奨。
> `File:`欠落時はHuman側で手動入力可能とする。Validationの自動化は本Unit対象外。

---

## リスク

| # | リスク内容 | 深刻度 |
|:---|:---|:---|
| R-01 | PMDecision Phaseの不整合により、U-FLOW-10で実装されたPM Template出力定義との二重管理発生 | High |
| R-02 | Rework命名規則の上書きにより既存PMDecisionファイル（過去Unit）との後方互換性問題 | Medium |
| R-03 | `File:`欠落時のフォールバック未定義により最小運用時に保存処理が停止する | Low |

---

## 総評

PMDecision Startの目的・背景・Scopeは妥当であり、U-FLOW-12のUnit化判断自体は適切である。ただし、過去Unit（U-FLOW-09 / U-FLOW-10）で確定済みの命名規則を実質的に拡張・改訂する内容を含んでおり、このまま開始するとDesignerが「U-FLOW-10とU-FLOW-12のどちらを正とするか」の判断を強いられる。

Designerへ回付する前に、指摘-01および指摘-02の整合を取り、必要であればU-FLOW-10命名規則を本Decision内で明示的に上書き宣言することを推奨する。

---

## 次アクション

PMへ以下を依頼:

1. 指摘-01: PMDecision Phase拡張をU-FLOW-10の更新として明示するか、4Phaseに揃えるかを確定。
2. 指摘-02: Rework命名規則のU-FLOW-10との整合を取る。
3. 指摘-03: 同一Phase複数発生時の扱いを明記。
4. 指摘-04: PMDecision_Rework命名のAC項目化（任意）。
5. 指摘-05: `File:`欠落時の方針を基本方針2に補強（任意）。

修正後、Designerへ回付してU-FLOW-12 Spec作成を開始することを推奨する。
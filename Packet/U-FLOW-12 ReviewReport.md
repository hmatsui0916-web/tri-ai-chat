```
Role: Reviewer
Scope: Spec Validation
```

# U-FLOW-12 ReviewReport

## 対象

U-FLOW-12_Spec.md
Artifact Save Runtime Design
作成者: Designer

参照照合対象:
- U-FLOW-12_PMDecision_Start.md Rev.1（PM判断・Acceptance Criteria 18項目）
- U-FLOW-10_Spec.md Rev.2（旧PMDecision命名規則）
- U-FLOW-09_Spec.md Rev.1（成果物命名規則・Role I/O Schema）
- U-FLOW-11_Spec.md Rev.2（Chat Runtime / Variables埋め込み）

---

## 判定

**Conditional**

主要設計の方向性は妥当であり、PM判断の核心要件（Phase拡張・Rework命名・Rev名提案・File欠落対応）は反映されている。ただし、PM判断のScope/Acceptance Criteriaに対してSpecの詳細度が不足している箇所、および命名規則の取りこぼしが複数存在する。修正後、PMへ回付可とする。

---

## 総評

Section 1〜6の構造はPM判断のScope要求に概ね対応しており、特にSection 4のPhase判定ロジックがFlow step（main-01/04/05/08/10）と紐付けられている点は実装面での明確化に寄与している。Section 5のRev名提案とReworkInstructionタイムスタンプ形式の使い分けも適切。

一方、PM判断 Acceptance Criteria 18項目のうち複数項目がSpec本体で言及されておらず、Designer SpecがU-FLOW-10との「拡張関係」を明示する記述も欠落している。

---

## 指摘事項

### [指摘-01] 同一Phase複数発生時の処理がPM判断と乖離（重要度: High）

**該当箇所:** Section 5「同名衝突防止およびRev名提案」

**現象:**
PM判断 Rev.1「同一Phase複数発生時の扱い」では、以下4ステップが定義されている。

1. 同名ファイルが存在する場合は警告する
2. Humanに上書き禁止を提示する
3. 別名候補を提示する
4. 別名形式は `[Unit]_PMDecision_[Phase]_RevN.md`

本SpecのSection 5は「保存ボタンを無効化し警告を表示」「`_RevN`接尾辞を自動付与した候補を提示」と記載されているが、以下が欠落している。

- ReworkのRev名形式（`[Unit]_PMDecision_Rework_[TargetRole]_RevN.md`）が未記載。
- 「上書き禁止」の明示的な提示UIが未定義（保存ボタン無効化のみ）。
- Rev番号の決定ロジック（既存最大番号+1か、固定でRev2から開始かなど）が未定義。

**修正方針:**
Section 5に以下を追加すること。
- ReworkのRev名例: `U-FLOW-12_PMDecision_Rework_Worker_Rev2.md`
- Rev番号の決定ロジック明示。

---

### [指摘-02] 「`[Unit]_Decision.md`を使用しない」がSpecに反映されていない（重要度: Medium）

**該当箇所:** Section 4 / Acceptance Criteria

**現象:**
PM判断のAcceptance Criteriaに「`[Unit]_Decision.md` を使用しない」が明示されているが、Specには汎用名禁止の検証ロジックが記載されていない。Section 3の判定基準テーブルにも汎用名検出の項目がない。

**影響:**
Runtime実装時に汎用名（`U-FLOW-12_Decision.md`等）が`File:`抽出されたときの挙動が未定義となり、AC違反のまま保存される可能性がある。

**修正方針:**
Section 4または別セクションに以下を追加すること。
- 汎用名（`*_Decision.md`、Phase欠落の`PMDecision_.md`等）を検出した場合、警告を表示しPhase指定を強制する旨。
- Acceptance CriteriaにSection 7で対応項目を追加する。

---

### [指摘-03] Section 3のArtifact種別判定にPMDecision系のRev名対応がない（重要度: Medium）

**該当箇所:** Section 3 「Artifact 種別・フォルダ判定仕様」

**現象:**
判定基準のテーブルで`*_PMDecision_*`は`units/[Unit]/decisions/`に保存されると定義されているが、`*_PMDecision_Rework_*`の保存先が`decisions/`なのか`rework/`なのかが不明確。

PM判断 Section「保存先ルール案」では`units/[Unit]/decisions/`と`units/[Unit]/rework/`の両方が並列に定義されているため、PMDecision_Rework系がどちらに保存されるかをDesignerが明示する必要がある。

**修正方針:**
Section 3の判定基準テーブルに以下を追加すること。
- `*_PMDecision_Rework_*` → `units/[Unit]/rework/` または `units/[Unit]/decisions/`（明確な選択を行う）
- ReworkInstructionとPMDecision_Reworkが両方とも`rework/`に保存される場合、両者の区別がファイル名のみとなる点を明記。

---

### [指摘-04] Phase判定ロジックの「ControlApproval」のFlow step紐付けが誤り（重要度: Medium）

**該当箇所:** Section 4 Phase一覧

**現象:**
> `ControlApproval`: `main-08`完了後のVerified承認

Flow v1.4の定義では、Verified確定はIntegrator-Cの判定後（main-08のControlReview状態を経てverified_transition）であり、PMによるControlApprovalはmain-09（Integrator-C Verified to PM）の判断となる。

main-08はDebugger/Infra結果のIntegrator-Cへの集約であり、PMが関与しないステップ。Phase紐付けが1step分ずれている。

**修正方針:**
Section 4のControlApproval定義を以下に修正すること。
> `ControlApproval`: `main-09`でのIntegrator-C Verified判定に対するPM承認

---

### [指摘-05] Section 6の「保存済みArtifact一覧表示」の独立記述が欠落（重要度: Low）

**該当箇所:** Section 6 / Acceptance Criteria対応

**現象:**
PM判断 Acceptance Criteriaに「保存済みArtifact一覧を表示できる」とあるが、Specには一覧表示の独立セクションがない。Section 6の「次Step Input参照」で「過去に保存されたArtifactの一覧から最新版を自動選択」という記述に内包される形になっているが、Input参照とは別に「Artifact一覧の閲覧UI」要件が存在するはずである。

**修正方針:**
Section 6またはSection 1にサブセクションとして「保存済みArtifact一覧UI」を追加し、以下を明示すること。
- Unit単位での一覧表示
- Artifact種別フィルター
- ファイル名/作成日時/関連Stepの表示項目

---

### [指摘-06] Acceptance CriteriaがPM判断18項目を網羅していない（重要度: Medium）

**該当箇所:** Section 7

**現象:**
Section 7のAcceptance Criteriaは7項目に集約されているが、PM判断 Rev.1のAC 18項目に対して以下が明示的に対応していない。

| PM判断 AC | Spec反映状況 |
|:---|:---|
| Role Output本文を貼り付けられる | ⚠️ Section 1で言及あるがAC未記載 |
| Artifact種別を判定できる | ⚠️ Section 3にあるがAC未記載 |
| Unit IDを判定できる | ❌ Section/AC共に未記載 |
| 保存先フォルダを自動提案できる | ⚠️ Section 3にあるがAC未記載 |
| Human確認後にArtifactを保存できる | ⚠️ Section 1にあるがAC未記載 |
| `[Unit]_Decision.md`を使用しない | ❌ AC未記載（指摘-02と関連） |
| ReworkInstructionはTargetRole付き命名規則で保存できる | ⚠️ Section 5にあるがAC未記載 |
| U-FLOW-10の旧PMDecision命名規則をU-FLOW-12で拡張したものとして扱える | ❌ Section 4で言及はあるがAC未記載 |

**修正方針:**
Section 7のAcceptance CriteriaをPM判断のAC 18項目と1対1対応するよう拡張すること。または、Spec内で対応箇所を明示してトレーサビリティを確保すること。

---

### [指摘-07] Unit ID判定ロジックが未定義（重要度: Low）

**該当箇所:** Section 2〜3

**現象:**
PM判断のScopeおよびACに「Unit ID判定」が明示されているが、Specには判定ロジックが記載されていない。`File:`から抽出するのか、`current_step`から取得するのか、Phase名から逆引きするのかが未定義。

**修正方針:**
Section 2または3に以下のいずれかを明示すること。
- `File:`抽出時にUnit IDをファイル名先頭から取得する規則。
- `current_step`のFlow Runtime状態からUnit IDを取得する規則。
- 両者の整合チェック（不一致時の警告）。

---

## リスク

| # | リスク内容 | 深刻度 |
|:---|:---|:---|
| R-01 | Rev名提案のRework対応欠落により、Reworkの再判定時に上書きが発生する | High |
| R-02 | 汎用名（`Decision.md`）禁止のValidationロジック未定義により、AC違反のまま保存される可能性 | Medium |
| R-03 | ControlApproval Phase紐付けの1step誤りにより、Runtime実装時に誤Stepでファイル名提案が発火する | Medium |
| R-04 | PMDecision_ReworkとReworkInstructionの保存先重複時の判別が不明確 | Medium |

---

## 改善提案

1. **Section 4のPhase一覧をテーブル化**: 現在は箇条書きだが、Phase × 紐付けStep × 判定条件 × 保存先フォルダの4列テーブルとすることで、Workerの実装時に判定ロジックを直接コード化しやすくなる。
2. **Section 7のAcceptance Criteriaをトレーサビリティ表として再構成**: PM判断AC 18項目とSpec Section参照箇所を1対1対応させる表を追加することで、後続Reviewerおよびテスト計画作成の効率が上がる。

---

## Acceptance Criteria 達成状況

| PM判断AC（抜粋） | Spec反映状況 |
|:---|:---|
| Role Output本文を貼り付けられる | ✅ Section 1 |
| `File:`行からファイル名を抽出できる | ✅ Section 2 |
| `File:`欠落時の手動入力/候補名提示 | ✅ Section 2 |
| Artifact種別を判定できる | ✅ Section 3 |
| Unit IDを判定できる | ❌（指摘-07） |
| 保存先フォルダを自動提案できる | ✅ Section 3 |
| Human確認後にArtifactを保存できる | ✅ Section 1 |
| 保存済みArtifact一覧を表示できる | ⚠️（指摘-05） |
| current_stepとArtifactを紐付けできる | ✅ Section 6 |
| next_step Prompt生成時に保存済みArtifactをInput候補として参照できる | ✅ Section 6 |
| PMDecisionはPhase付き命名規則で保存できる | ✅ Section 4 |
| PMDecision_ReworkはTargetRole付き命名規則で保存できる | ✅ Section 4 |
| `[Unit]_Decision.md`を使用しない | ❌（指摘-02） |
| 同名衝突時に上書きせず警告または別名提案できる | ✅ Section 5 |
| 同一PhaseのPMDecisionが既存の場合、上書きせず警告またはRev名を提案できる | ⚠️（指摘-01） |
| ReworkInstructionはTargetRole付き命名規則で保存できる | ✅ Section 5 |
| U-FLOW-10の旧PMDecision命名規則をU-FLOW-12で拡張したものとして扱える | ⚠️（指摘-06） |
| U-FLOW-11のChat Runtimeを壊さない | ✅ Section 6/7 |

---

## 次アクション

Designerへ差戻し、以下の修正を依頼する。

1. **指摘-01**: Section 5にReworkのRev名形式とRev番号決定ロジックを追加。
2. **指摘-02**: 汎用名禁止の検証ロジックをSection 4または独立セクションに追加。AC化。
3. **指摘-03**: Section 3にPMDecision_Reworkの保存先を明示。
4. **指摘-04**: Section 4のControlApproval紐付けをmain-08からmain-09に修正。
5. **指摘-05**: Section 6またはSection 1に「保存済みArtifact一覧UI」サブセクション追加。
6. **指摘-06**: Section 7のAcceptance CriteriaをPM判断 AC 18項目と1対1対応に拡張。
7. **指摘-07**: Section 2または3にUnit ID判定ロジックを明示。

修正後、PMへ回付すること。
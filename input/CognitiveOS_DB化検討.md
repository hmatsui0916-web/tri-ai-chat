以下、**Phase2 → Phase3 処理**としてまとめます。
対象入力は、実質的に以下です。

* `SNAP-002`: CognitiveOS Runtime / DB Layering Branch
* `SNAP-003`: Transfer / 3層DB / Reopen-Fork Branch
* `SNAP-004`: Scoped Divergence / Phase2前Snapshot Branch
* 添付3ファイル

  * Cognitive OS Prompt Set本体 v0.3.1.1
  * Snapshot / Handoff Addendum
  * Core Discipline Addendum

この出力は **採用ではありません**。
Human Decision 前の Phase3 抽出材料です。Snapshot / Handoff / Rehydration は採用ではなく、採用には Phase3 / Trust Cache Reset / Origin Separation / Human final decision が必要です。

---

# Phase2 / Compression

## 1. 圧縮対象テーマ

今回の発散は、最終的に次の大テーマに収束しています。

**CognitiveOS Runtime を、VSCode上で状態管理可能な運用基盤として構成する。**

そのための主要要素は以下です。

1. CognitiveOS Runtime Workspace
2. Working DB / Reference DB / Decision DB の3層DB
3. Snapshot管理
4. Phase2 / Phase3アウトプット管理
5. Human Decision管理
6. inbox / outbox
7. TransferPacket
8. Reopen / Fork
9. Scoped Divergence
10. Phase2移行前Snapshot

---

## 2. 圧縮後の中核構造

## A. CognitiveOS Runtime Workspace

CognitiveOSを「プロンプトだけの会話運用」から、**状態を持つRuntime Workspace**へ拡張する構想。

想定構成：

```md
CognitiveOS_Runtime_Workspace/
  prompts/
  db/
  inbox/
  outbox/
  exports/
```

役割：

| 領域         | 役割                                    |
| ---------- | ------------------------------------- |
| `prompts/` | CognitiveOS本体・Addendumの参照専用ファイル       |
| `db/`      | Snapshot / Reference / Decision の状態管理 |
| `inbox/`   | セッション中に扱う一時入力                         |
| `outbox/`  | 他Runtime / AI事業OS / Core Dev へ渡す出力    |
| `exports/` | DB内容の人間確認用ビュー                         |

重要点：

* Runtime Workspace は **CognitiveOSを使う場所**
* CognitiveOS本体を更新する場所ではない
* 本体更新候補は `OS Update Candidate` として Core Dev 側へ渡す

---

## B. 3層DB構造

DBは単一ではなく、Phaseの性質に応じて3層に分ける。

```md
Working DB
  ↓
Reference DB
  ↓
Decision DB
```

### Working DB

目的：

* 発散中のSnapshot管理
* Branch保存
* 思考ダイジェスト
* Return Query
* Human Phrase Anchor
* Phase2前の未保存枝の保存

性質：

* 柔らかい
* 一時的
* ノイズを許容
* Phase1a / 1b 向き
* Phase2 / 3移行後にクリア可能

### Reference DB

目的：

* Phase2 / Phase3アウトプット文書を丸ごと保存
* 文書の埋没防止
* 後からDecisionの経緯を追えるようにする

性質：

* 文書アーカイブ
* 検索・参照用
* Decision DBの根拠リンク先

### Decision DB

目的：

* Human Decision List
* Pending Human Decision
* 採用 / 保留 / 却下 / 条件付き採用
* Export status
* Transfer status
* Supersede / Merge / Reopen関係

性質：

* 厳格
* 長期管理
* Governance memory
* Human Decision中心

---

## C. Chat → DB → Chat → outbox

Runtime運用の基本フロー。

```md
Chat
  発散・圧縮・抽出
  ↓
DB
  Snapshot / Reference / Decision を状態管理
  ↓
Chat
  DBから対象をロードして整形・判断
  ↓
outbox
  PM指示書 / TransferPacket / Handoff / Core Dev候補として出力
```

重要点：

* DBから直接outboxへ出さない
* 一度Chatに戻して、目的・出力先・採用状態を整える
* outboxは「外部工程への境界ゲート」

---

## D. inbox / outbox / TransferPacket

Runtime同士は常時接続せず、必要なときだけ `outbox → inbox` で接続する。

```md
Runtime A
  outbox/TransferPacket
      ↓
Runtime B
  inbox/TransferPacket
```

TransferPacketの役割：

* 別Runtimeへ文脈を移植する
* 採用ではない
* 文脈汚染ではなく、管理された文脈接続
* Source / Destination / Purpose / Origin / Suggested Re-entry Phase を明示する

想定用途：

* CognitiveOS Runtimeで出た着想をAI事業OS Runtimeへ渡す
* 共通文書管理テンプレートを各Project Runtimeへ渡す
* あるRuntimeで育った枝を別Runtimeで再発散する

---

## E. Scoped Divergence

CognitiveOS成熟後の発散は、ゼロベース全方位発散から、**範囲指定発散**へ移行する。

```md
初期:
全方位発散

成熟後:
対象領域を決めた発散

締め:
Phase2 / Phase3 / Human Decision
```

重要点：

* 発散の主語でRuntimeを決める
* 範囲内で発散する
* 発散しきったら締める
* 別議題へ進むならセッションを切る
* 必要ならTransferPacketで別Runtimeへ渡す

---

## F. Reopen / Fork

Phase3済み、またはHuman Decision済みの議題を再検討する場合、既存Decisionを壊さずに新しい発散枝を立てる。

```md
Existing Human Decision
  ↓
Reopen / Fork
  ↓
再発散
  ↓
再Phase2 / Phase3
  ↓
New Human Decision Candidate
  ↓
Existing Decisionとの比較
```

最終比較ステータス候補：

* Keep existing
* Revise
* Supersede
* Merge
* Park new
* Reject new

重要点：

* UndoではなくFork
* 旧Decisionは履歴として残す
* 新Decisionと旧Decisionを比較して最終判断する

---

## G. Phase2移行前Snapshot

Phase2へ移行する前に、直前Snapshot以降の未保存発散をSnapshot化する。

理由：

* Snapshot化されていない枝はBranch ID体系に入らない
* Branch IDがないものはCoverage Check対象にならない
* 結果として、Phase2で落ちても欠落検出できない可能性がある

運用ルール候補：

```md
Phase2移行前には、最後のSnapshot以降の未保存発散をSnapshot化する。
そのSnapshot群をPhase2入力セットに含める。
```

これは新機能というより、既存Snapshot運用のタイミングルール。

---

# Phase2 圧縮結論

今回の発散は、以下の1文に圧縮できる。

**CognitiveOS Runtime は、Phaseに応じた3層DB、Snapshot、inbox/outbox、TransferPacketを備えた状態管理型ワークスペースとして設計し、発散・圧縮・抽出・Human Decision・外部移管を管理可能にする。**

---

# Phase3 / Extraction

## Trust Cache Reset Status

**Applied.**

ここでは以下を証拠として扱わない。

* きれいにまとまった感覚
* 会話の納得感
* AIとの合意
* 構造の美しさ
* 「なんとなく良さそう」
* これまでの勢い

判断材料にするもの：

* CognitiveOSの既存Phase設計との整合
* Snapshot Addendumとの整合
* 運用負荷
* 可逆性
* DB化の導入コスト
* Human橋渡し負荷の低減効果
* 文脈汚染リスク
* 実験可能性

Phase3では、Trust Cache Reset、Origin Separation、Human final decisionが必要です。Core Discipline Addendumでも、採用・PM Judgment・仕様変更・運用変更では、証拠分離・リスク・Human final decisionを要求しています。

---

## Adoption Candidates

## AC-001: CognitiveOS Runtime Workspace 構想

### Candidate

CognitiveOSを、VSCode上の専用Runtime Workspaceで運用する。

### Recommendation

**Adopt with conditions**

### Reason

枝・Snapshot・Decisionが増えると、サブスクチャットだけでは状態管理が困難になる。Runtime Workspaceを置くことで、DB・inbox・outbox・exportsを使った管理が可能になる。

### Risk

Medium.

* 運用が重くなる
* サブスクチャットの軽さが失われる可能性
* VSCode上チャットの発散感が変わる可能性

### Reversibility

High.

まずは最小構成で試験できる。

### Suggested Human Decision

**採用候補。小規模Runtime Workspaceとして試験導入する。**

---

## AC-002: Working DB / Reference DB / Decision DB の3層構造

### Candidate

DBを3層に分ける。

* Working DB
* Reference DB
* Decision DB

### Recommendation

**Adopt with conditions**

### Reason

Phaseごとの自由度・厳格さとDBの制約強度が対応する。
発散中のノイズ、Phase3文書、Human Decisionを混ぜずに管理できる。

### Risk

Medium.

* 初期設計が複雑
* テーブル過剰設計になる可能性
* 最初から完全実装しようとすると重い

### Reversibility

Medium-High.

SQLiteで最小スキーマから始めれば戻せる。

### Suggested Human Decision

**採用候補。まずは論理3層として設計し、物理DB分割は後で判断する。**

---

## AC-003: SnapshotはWorking DBで管理する

### Candidate

SnapshotはまずWorking DBに保存する。Phase2 / 3後に必要なものだけReference / Decision側へ昇格する。

### Recommendation

**Adopt**

### Reason

Snapshotは発散中の保存点であり、即Decision管理対象にすると搾りかす問題が起きる。Working DBで受け止めるのが自然。

### Risk

Low-Medium.

* Working DBの掃除ルールが必要
* Snapshotが増えすぎる可能性

### Reversibility

High.

Working DBは一時管理層なのでクリア可能。

### Suggested Human Decision

**採用候補として強い。**

---

## AC-004: Phase2 / Phase3アウトプット文書はReference DBに丸ごと保存する

### Candidate

Phase2 / Phase3の文書出力をReference DBで全文保存し、Decision DBから参照できるようにする。

### Recommendation

**Adopt with conditions**

### Reason

Phase3文書をファイルだけで管理すると埋もれる。
Decision DBに全文を持たせると重い。
Reference DBに文書を保存し、Decision DBは参照IDを持つ構成が妥当。

### Risk

Medium.

* 文書検索設計が必要
* Markdown全文保存の粒度設計が必要
* Reference DBが肥大化する可能性

### Reversibility

Medium.

一度保存した文書は移行可能だが、ID体系は早めに決めたい。

### Suggested Human Decision

**採用候補。最小項目で試験する。**

---

## AC-005: Decision DBはHuman Decision中心にする

### Candidate

Decision DBはPhase3全文ではなく、Human Decision List / Pending Decision / Export statusを管理する。

### Recommendation

**Adopt**

### Reason

最終的に管理したいのは「何を採用・保留・却下したか」。
Decision DBを軽く保つには、判断対象と判断結果に絞るべき。

### Risk

Low.

ただし、DecisionとReference Documentのリンク設計は必要。

### Reversibility

High.

### Suggested Human Decision

**採用候補として強い。**

---

## AC-006: inbox / outbox をRuntime境界として使う

### Candidate

`inbox` は一時入力、`outbox` は外部工程への出力として使う。

### Recommendation

**Adopt**

### Reason

Human橋渡しを明確化できる。
別RuntimeやAI事業OSへの移管も、outboxからパケット化して渡せる。

### Risk

Low-Medium.

* inboxに資料が残り続けると汚染源になる
* outboxに採用前資料が混ざると混乱する

### Reversibility

High.

### Suggested Human Decision

**採用候補。inboxはセッション終了時クリアを原則にする。**

---

## AC-007: TransferPacketをCognitiveOS Runtime間の共通パケットにする

### Candidate

Runtime間で文脈を移植するための共通フォーマットとしてTransferPacketを定義する。

### Recommendation

**Adopt with conditions**

### Reason

複数Runtimeを分離しながら、必要な枝だけを意図的に接続できる。
文脈汚染ではなく管理された文脈接続になる。

### Risk

Medium.

* Handoff Packet / Snapshot Index / TransferPacket の境界が曖昧になる可能性
* フォーマットを早く固定しすぎると硬くなる

### Reversibility

Medium-High.

最初は軽量フォーマットで試せる。

### Suggested Human Decision

**試験採用候補。まずはLight TransferPacketとして始める。**

---

## AC-008: Reopen / Fork モデル

### Candidate

Phase3済み・Human Decision済み議題を再検討する場合、既存Decisionを壊さずReopen / Forkする。

### Recommendation

**Adopt with conditions**

### Reason

締めたものを直接緩めるとDecision履歴が混乱する。
Forkとして再発散すれば、旧Decisionを保持しつつ新Decision候補を作れる。

### Risk

Medium.

* Forkが乱発されるとDecision関係が複雑になる
* Supersede / Mergeルールが必要になる

### Reversibility

Medium.

Decision関係を後から整理するのはやや重い。

### Suggested Human Decision

**採用候補。ただし詳細ライフサイクルは後続設計。**

---

## AC-009: Scoped Divergence

### Candidate

CognitiveOS成熟後の発散は、対象領域を決めたScoped Divergenceとして運用する。

### Recommendation

**Adopt**

### Reason

実務寄りCognitiveOSでは、無限発散よりも、特定領域でHumanの判断可能範囲を引き上げることが重要。
発散スコープがあると、Phase2 / 3で締めやすい。

### Risk

Low.

* 発散の自由度が落ちたように感じる可能性
* ただしPhase1aの自由さ自体は維持できる

### Reversibility

High.

### Suggested Human Decision

**採用候補として強い。**

---

## AC-010: Phase2移行前Snapshot

### Candidate

Phase2へ入る直前に、直前Snapshot以降の未保存発散をSnapshot化してから圧縮へ入る。

### Recommendation

**Adopt**

### Reason

Branch IDが付いていない直近発散はCoverage Check対象にならず、欠落しても検出されない可能性がある。
Phase2入力セットを安全化するために必要。

### Risk

Low.

* Phase2移行前に一手間増える
* ただし欠落防止効果が大きい

### Reversibility

High.

### Suggested Human Decision

**採用候補として非常に強い。**

---

# Origin Separation Map

| Item                                   | Origin Type                    | Notes                           |
| -------------------------------------- | ------------------------------ | ------------------------------- |
| 採用候補が埋もれる問題                            | Human-originated               | Humanが明示した中核課題                  |
| DB化                                    | Human-originated               | SQLite案含む                       |
| VSCode主体化                              | Human-originated               | Human橋渡し負荷から出た                  |
| Working DB / Managed DB                | Human-originated → AI-reframed | Human案をAIが構造化                   |
| 3層DB                                   | Human-originated               | Reference DB追加はHuman提案          |
| Working / Reference / Decision DB 命名整理 | AI-reframed                    | 3層案の整理                          |
| Chat → DB → Chat → outbox              | Human-originated               | Humanが明示                        |
| inbox / outbox                         | Mixed                          | Runtime構成としてAIが補助整理、用途はHumanが拡張 |
| TransferPacket                         | AI-added / Human-accepted      | AI提案後、Humanが共通言語として理解           |
| Reopen / Fork                          | AI-added / Human-accepted      | Humanの再発散懸念に対するAI整理             |
| Scoped Divergence                      | AI-reframed                    | Humanの「範囲内で発散」をAIが命名            |
| Phase2移行前Snapshot                      | Human-originated               | Humanが懸念を明示                     |
| Branch ID未付与領域のCoverage対象外リスク          | Human-originated → AI-reframed | Human懸念をAIが明文化                  |
| プロジェクトごとのRuntime / Workspace分離         | Mixed                          | Human発想＋AI整理                    |
| Common Runtime                         | Mixed                          | Human例をAIが構造化                   |

Origin tags are provisional. Human review may overwrite them.

---

# Risk / Reversibility / Evidence Table

| Candidate                      |       Risk | Reversibility | Evidence / Fit   | Recommendation                     |
| ------------------------------ | ---------: | ------------: | ---------------- | ---------------------------------- |
| Runtime Workspace              |     Medium |          High | 状態管理・outbox連携に適合 | Adopt with conditions              |
| 3層DB                           |     Medium |   Medium-High | Phase性とDB制約が対応   | Adopt with conditions              |
| Snapshot → Working DB          | Low-Medium |          High | Snapshot性質に合う    | Adopt                              |
| Phase2/3文書 → Reference DB      |     Medium |        Medium | 文書埋没防止に有効        | Adopt with conditions              |
| Decision DB = Human Decision中心 |        Low |          High | 管理対象が明確          | Adopt                              |
| inbox / outbox                 | Low-Medium |          High | Runtime境界として有効   | Adopt                              |
| TransferPacket                 |     Medium |   Medium-High | Runtime間接続に有効    | Trial only / Adopt with conditions |
| Reopen / Fork                  |     Medium |        Medium | Decision再検討に必要   | Adopt with conditions              |
| Scoped Divergence              |        Low |          High | 実務寄り運用に適合        | Adopt                              |
| Phase2前Snapshot                |        Low |          High | 欠落防止に有効          | Adopt                              |

---

# Unsupported / Underdefined Claims

以下はまだ未確定です。

1. **SQLiteスキーマの具体構造**

   * tables
   * fields
   * indexes
   * relations
   * JSON保存範囲

2. **Working DB / Reference DB / Decision DBを物理的に分けるか**

   * 1 SQLite内の論理3層か
   * 3 SQLiteファイルに分けるか

3. **TransferPacketの正式フォーマット**

   * Snapshot Handoffとの違い
   * Handoff Packetとの違い
   * 必須フィールド

4. **Reference DBの文書保存粒度**

   * Markdown全文
   * section単位
   * JSON構造化
   * file path + metadata

5. **Decision DBのステータス体系**

   * Adopted
   * Adopted with conditions
   * Parked
   * Rejected
   * Superseded
   * Exported
   * Reopened

6. **Reopen / Forkの詳細ルール**

   * いつFork扱いにするか
   * いつSupersede扱いにするか
   * Merge時のDecision履歴

7. **VSCode上でのChat運用体感**

   * サブスクチャットと同等に発散できるかは未検証

---

# External Grounding Needed

外部Web情報は不要です。

ただし、実装段階では以下の実地検証が必要です。

* VSCode / CODEXでのRuntime Workspace運用感
* SQLiteスキーマ試作
* Snapshot保存・ロードの試験
* Phase2 / 3文書のReference DB投入試験
* Decision DBからoutbox生成する試験
* TransferPacketによるRuntime間移管試験

---

# Cooling Rule Applicability

**Applies lightly.**

これはCognitiveOSの運用基盤変更であり、将来的には作業フローへ影響する。
ただし、現時点では即実装・即正式採用ではなく、採用候補整理なので、最終Decision前にHuman確認を挟めばよい。

---

# Gate Status

| Gate   | Status                      |
| ------ | --------------------------- |
| Gate 1 | 発散済み。Snapshotにより保存済み        |
| Gate 2 | 現在相当。Phase2/3で候補抽出中         |
| Gate 3 | 未到達。Human final decisionが必要 |

---

# Recommended Human Decision List

以下は、Human Decision候補です。
ここでHumanが採用・保留・却下を決める対象になります。

## HD-CAND-001

**Decision Item**
CognitiveOS Runtime Workspace 構想を採用候補とする。

**Recommended Status**
Adopt with conditions

**Condition**
まずは最小構成で試験運用する。

---

## HD-CAND-002

**Decision Item**
Working DB / Reference DB / Decision DB の3層DB構造を採用候補とする。

**Recommended Status**
Adopt with conditions

**Condition**
初期実装では論理3層として設計し、物理分割は後続判断。

---

## HD-CAND-003

**Decision Item**
SnapshotはWorking DBで管理する。

**Recommended Status**
Adopt

**Condition**
Phase2 / 3後に不要なWorking DB内容をクリアする運用を後続設計する。

---

## HD-CAND-004

**Decision Item**
Phase2 / Phase3アウトプット文書はReference DBに保存する。

**Recommended Status**
Adopt with conditions

**Condition**
保存粒度はまず「文書単位 + section metadata」程度で試験する。

---

## HD-CAND-005

**Decision Item**
Decision DBはHuman Decision List中心に管理する。

**Recommended Status**
Adopt

**Condition**
Reference DB文書とのリンクIDを必須にする。

---

## HD-CAND-006

**Decision Item**
inbox / outbox をRuntime Workspaceの標準構成に含める。

**Recommended Status**
Adopt

**Condition**
inboxはセッション終了時クリア、outboxは採用状態を明記する。

---

## HD-CAND-007

**Decision Item**
TransferPacketをCognitiveOS Runtime間の共通移管フォーマットとして試験導入する。

**Recommended Status**
Trial only

**Condition**
最初は軽量版で運用し、正式フォーマット化は後続Phase3で判断。

---

## HD-CAND-008

**Decision Item**
Reopen / Forkを、Phase3済み・Decision済み議題の再発散モデルとして採用候補にする。

**Recommended Status**
Adopt with conditions

**Condition**
詳細なDecision lifecycle / supersessionルールは後続設計。

---

## HD-CAND-009

**Decision Item**
Scoped DivergenceをCognitiveOS通常運用の考え方として採用する。

**Recommended Status**
Adopt

**Condition**
Phase1aの自由度を潰さない。スコープはHumanが自然に指定する。

---

## HD-CAND-010

**Decision Item**
Phase2移行前には、直前Snapshot以降の未保存発散をSnapshot化してから移行する。

**Recommended Status**
Adopt

**Condition**
これは新機能ではなく、Snapshot運用タイミングルールとして扱う。

---

# Recommended PM Options

## Option A: 最小試験採用

以下だけ採用する。

* Runtime Workspace
* 3層DB
* Snapshot → Working DB
* Human Decision → Decision DB
* Phase2前Snapshot

**Recommendation:** Strong.

理由：実験可能で、過剰設計を避けられる。

---

## Option B: 広めに試験採用

Option Aに加えて、以下も試す。

* Reference DB
* inbox / outbox
* TransferPacket
* Reopen / Fork
* Scoped Divergence

**Recommendation:** Good, but heavier.

理由：構想全体を検証できるが、初回試験としては重め。

---

## Option C: 一旦保留

DB化は保留し、Markdown運用だけ継続する。

**Recommendation:** Not recommended.

理由：今回の中核課題である「候補埋没」「Snapshot再利用」「Phase2/3入力管理」が解決しない。

---

# Recommended Decision

## Decision Recommendation

**Adopt with conditions: Option A を採用し、Option B要素の一部をTrial扱いにする。**

具体的には：

### 採用候補として進める

1. CognitiveOS Runtime Workspace
2. 3層DB構想
3. Snapshot → Working DB
4. Phase2 / 3文書 → Reference DB
5. Human Decision → Decision DB
6. Phase2移行前Snapshot

### Trial only

1. TransferPacket
2. Reopen / Fork
3. inbox / outboxによるRuntime間移管

### Park

1. 詳細SQLiteスキーマ
2. TransferPacket正式仕様
3. Decision lifecycle / supersession詳細
4. UI実装
5. 完全自動化

---

# Human Decision Required

ここから先はHuman Decisionが必要です。

推奨する決め方は、まず以下に対して採用 / 条件付き採用 / 保留 / 却下をつけることです。

```md
HD-CAND-001: CognitiveOS Runtime Workspace
HD-CAND-002: 3層DB構造
HD-CAND-003: Snapshot → Working DB
HD-CAND-004: Phase2/3文書 → Reference DB
HD-CAND-005: Human Decision → Decision DB
HD-CAND-006: inbox / outbox
HD-CAND-007: TransferPacket
HD-CAND-008: Reopen / Fork
HD-CAND-009: Scoped Divergence
HD-CAND-010: Phase2移行前Snapshot
```

私の推奨は：

```md
HD-CAND-001: Adopt with conditions
HD-CAND-002: Adopt with conditions
HD-CAND-003: Adopt
HD-CAND-004: Adopt with conditions
HD-CAND-005: Adopt
HD-CAND-006: Adopt
HD-CAND-007: Trial only
HD-CAND-008: Adopt with conditions
HD-CAND-009: Adopt
HD-CAND-010: Adopt
```

このPhase3出力自体は、まだ採用ではありません。

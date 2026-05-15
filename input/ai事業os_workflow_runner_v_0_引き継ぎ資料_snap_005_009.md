# AI事業OS Workflow Runner v0 / CognitiveOS接続
# 次セッション引き継ぎ資料 v0.2

## 0. False Closure Warning

この引き継ぎ資料は、採用・PM Judgment・仕様変更・実装指示・Human final decisionではありません。  
次セッションで再開・再発散・Phase2 / Phase3処理するための入力資料です。

正式な採用・運用変更・仕様化には、必要に応じて以下が必要です。

```md
- Phase2 / Compression
- Phase3 / Extraction
- Trust Cache Reset
- Origin Separation
- Human final decision
```

---

## 1. Handoff Purpose

この資料の目的は、前セッションで保存した以下のチェック済みSnapshot本文を、次セッションへ非加工で引き継ぐことです。

```md
SNAP-005: AI事業OS VSCode母艦 / Workflow Runner原点回帰 Branch
SNAP-006: AI事業OS Runtime凍結 / VSCode Workflow Runner v0 ゼロスタート Branch
SNAP-007: AI事業OS Workflow Runner v0 / 動くもの起点の積み上げ Branch
SNAP-008: 表実況 / 裏実況 / CLI並走 Branch
SNAP-009: チェック済みSnapshot本文 / 引き継ぎ非加工ルール Branch
```

本資料は、Snapshot本文を要約・再編集・Digest置換しません。  
Snapshot本文はCoverage Check / Snapshot Readiness Checkを通した保存単位であり、加工する場合はPhase2→Phase3正式処理を通す必要があります。

---

## 2. Snapshot Index

| Snapshot ID | Title | Status | Return Query |
|---|---|---|---|
| SNAP-005 | AI事業OS VSCode母艦 / Workflow Runner原点回帰 Branch | Ready | `SNAP-005 AI事業OS VSCode母艦 Workflow Runner 原点回帰 汚染リスクより自動実行 Human主導 5分アプリ 文書管理は二の次` |
| SNAP-006 | AI事業OS Runtime凍結 / VSCode Workflow Runner v0 ゼロスタート Branch | Ready | `SNAP-006 AI事業OS Runtime凍結 VSCode Workflow Runner v0 ゼロスタート CognitiveOS差し戻し 今欲しいもの 機械的に回して動くもの` |
| SNAP-007 | AI事業OS Workflow Runner v0 / 動くもの起点の積み上げ Branch | Ready | `SNAP-007 AI事業OS Workflow Runner v0 動くもの優先 圧縮Role PM Lane Debugger Lane アジャイル Running artifact VSCode実装 サブスクCognitiveOS AI呼出し` |
| SNAP-008 | 表実況 / 裏実況 / CLI並走 Branch | Ready | `SNAP-008 表実況 裏実況 VSCode鉄火場 サブスクCognitiveOS工房 モックスタート AIアジャイル 自己開発ループ Snapshot DB格納 PowerShell CLI並走` |
| SNAP-009 | チェック済みSnapshot本文 / 引き継ぎ非加工ルール Branch | Ready | `SNAP-009 チェック済みSnapshot本文 引き継ぎ非加工 Phase2→Phase3以外加工禁止 Coverage Readiness保証 Digest代替禁止 Full Snapshot Bodies` |

Coverage summary:

```md
SNAP-005: Ready / BR-001〜BR-010 complete
SNAP-006: Ready / BR-001〜BR-010 complete
SNAP-007: Ready / BR-001〜BR-010 complete
SNAP-008: Ready / BR-001〜BR-010 complete
SNAP-009: Ready / BR-001〜BR-010 complete
```

---

## 3. Current Implementation Status

前セッション終盤時点の実装状況。

```md
第1段階でフローで順番にロールを呼び出すことができ、
指定したフォルダにファイルを保存することができた。

次は各AIを実際に呼び出せるようにしている。

CODEXで実装完了してCLAUDE CODEでデバッグ中。
まだGEMINIの出番なし。

それぞれ呼び出せたら次はAI事業OSの本来のフロー定義に合わせて、
それぞれのロールに各AIを指定する。
```

Current stage:

```md
Stage 1: Workflow skeleton
- フロー順にRoleを呼び出す
- 指定フォルダにRole outputを保存する
- Status: Passed

Stage 2: AI provider call
- OpenAI / Codex系を呼ぶ
- Claude / Claude Code系を呼ぶ
- Gemini系を呼ぶ
- Status: In progress

Stage 3: Role-to-AI binding
- AI事業OS本来のRole定義に合わせる
- PM = ChatGPT / OpenAI
- Designer = Gemini
- Reviewer / Debugger = Claude
- Worker = Codex / Copilot系
- Integrator系 = ChatGPT
- Status: Next

Stage 4: Simple app E2E trial
- 計算アプリ等で実際にプロダクト生成を試す
- Status: Planned
```

---

## 4. Rehydration Instruction for Next Session

次セッション開始時は、以下のように扱う。

```md
1. この資料をHandoff Inputとして読む。
2. SNAP-005〜SNAP-009のFull Snapshot Bodiesを、Phase2 / Phase3入力可能な保存済みSnapshotとして扱う。
3. Snapshot本文を要約・Digest・再編集で置き換えない。
4. 採用判断はまだ行わない。
5. HumanがPhase1a継続を望む場合は、AI事業OS Workflow Runner v0の実装実況・裏実況として継続する。
6. Humanが「まとめ」「整理」「Phase2」「PM判断」等を明示した場合は、SNAP-005〜SNAP-009を入力としてPhase2 / Phase3へ移行する。
```

Recommended Re-entry Phase:

```md
Phase 1a / Wall-Bounce Divergence

Reason:
まだ実装しながら発見が続いており、正式な採用判断よりも、
動くものを見ながら次のピースを探す段階。
```

---

## 5. Full Snapshot Bodies

以下は、チェック済みSnapshot本文です。  
非加工で引き継ぎます。

---

# Branch Snapshot

## Snapshot ID

SNAP-005

## Snapshot Title

AI事業OS VSCode母艦 / Workflow Runner原点回帰 Branch

## Snapshot Type

Branch Snapshot

## Status

Ready

## False Closure Warning

This Snapshot is not adoption, PM Judgment, rule/spec change, implementation instruction, or Human final decision.  
It is Phase 3-ready material only.  
Formal adoption requires Phase 3 / Trust Cache Reset / Origin Separation / Human final decision.

## Trigger

Human-triggered save request:

```md
いったんセーブしましょう。
```

## Branch Items

| Branch ID | Branch Label | Core Meaning | Temperature | Status |
|---|---|---|---|---|
| BR-001 | SnapshotからWorking DBへ | DB化後はSnapshotが主役ではなく、Working DB上の保存イベントの一種になる | Medium | Preserved |
| BR-002 | セッション切替の意味変化 | DB化により、セッション切替は文脈喪失ではなく実行環境の軽量化になる | Medium-High | Preserved |
| BR-003 | VSCode母艦 | CognitiveOS / AI事業OSともに、VSCode Workspaceを共通作業場として扱える | Medium-High | Preserved |
| BR-004 | AI事業OSのVSCode移行 | APIチャットベースRuntimeは、VSCode版Workflow Runnerへ移行しやすい可能性がある | Medium | Preserved |
| BR-005 | 汚染リスクの再評価 | 汚染リスクをゼロにするより、まず回して観測・改善するほうが速い | High | Preserved |
| BR-006 | Human主導の再定義 | Human主導とは、高度な概念を追うことではなく、一番欲しいものを先に作ること | High | Preserved |
| BR-007 | 原点回帰 | 原点は「楽にプロダクトを完成させたい」「5分でほしいアプリを作りたい」 | High | Preserved |
| BR-008 | フローは悪くない | 分散開発フロー自体は妥当。問題は細部・周辺概念に目が行き過ぎたこと | High | Preserved |
| BR-009 | Workflow Runner MVP | 今あるOS仕様をベースにI/O定義し、VSCode上でワークフローを実装すればよい | High | Preserved |
| BR-010 | 文書管理は二の次 | 文書管理・DB・厳密な状態管理は初期MVPの主役ではない。どうせ見ないものは後回し | Medium-High | Preserved |

## Human-originated Material

```md
やってて思ったんだけど、ターゲット絞った発散だとセッションまたぎってほとんど発生しないかもなって。
ていうかそろそろいったん締めるかってなってPhase3まで回して、新規セッションでHuman Decisionの再発散する気がする。

作業DBの役割は大事でそれはセッションを跨ごうがしまいが常に一定に保たれ参照できる。
いまのスナップショット運用の場合っていう限定的な話です。
DB化したらそんな懸念自体がなくなる。

現状のスナップショット方式だとデータ保持の観点からやっぱりトークン肥大は気になる。
でも作業DB化されるとデータ保持の心配がなくなって、トークン肥大はトークン消費とか動作が重くなるとかそういう心配だけになってくる。

極端な話、セーブごとにセッション切り替えても問題ない。

この運用母艦がVScodeなので実は共通のワークスペースで各AIが共存できる。
タブ切り替えでAIが切り替わる。これも良い。

AI事業OSについて考えてみると、やっぱりVScode上でやるのが一番効率が良いよね。
文脈汚染、ワークスペース内データ汚染のリスクが解決できれば。
そうすればフロー内でのハンドオフ対応がなくなる。これがとても大きい。

そもそもわたしは汚染にたいしてセンシティブになりすぎているのかもしれない。
最初から厳密化を目指しすぎている気がしてる。
汚染されてもフローをまわせば完成度の差は出るかもしれないけどプロダクトは完成する。
そのルーティンの中で改善していったほうが良いんじゃないかな。

今現在試作状態で顧客から依頼されてやってるわけじゃないし、自分が作りたいもの作りたいだけで自己責任で閉じられる話。
AI事業OSの母艦つくるのに厳密化するために手動で回しながらめんどくさい思いするより、自動で回して改善していったほうが何倍も速いよね。

CognitiveOSがそうだからね。こっちのほうが早い。
並列APIチャットも作成5分。そこから回してひとつひとつ機能つけてったから早かった。
AI事業OSは並列APIチャットベースで実装進めてったから早かったんだけど途中でハンドオフとかこれはVScode上でこれはサブスクチャットでとか始まりだして失速した。
AIは高機能だから言ったことを実現する能力は非常に高いんだけど概念先行して概念ベースで実装が進んでいくと人間が置いてかれる。
それなら試験運用ベースで作り替えていったほうがいい。

原点はそれで、たぶんAIと1対1で作っていくと複雑になってきたときにとっ散らかるっていうのが合って分散開発フローにして要件定義から回せばぶれづらいとなって今に至る。
だからフローは悪くない。大枠では完成しているといっていい。
細部に目が行き過ぎてただけ。
単純にVScode上でワークフローを実装すればいいだけ。
で、今あるOS仕様ベースでI/O定義してあげれば完成。
文書管理とかは二の次。
どうせ見ないから。
```

## AI Seed / AI-assisted Framing

```md
AI-assisted framing:
- Snapshot = チャット運用における保存イベント
- Working DB = Runtime運用における常時状態
- DB化後、Session = reasoning runtime / DB = memory state
- AI事業OSは「工程の非コンテキスト依存化」
- CognitiveOS DB化は「思考継続の非コンテキスト依存化」
- VSCode Workspace = 共通の現場
- Handoff Packet → RoleExecutionContext
- 汚染防止は初期条件ではなく改善対象
- 最初に必要なのは厳密なOSではなく、dogfooding可能な最小母艦
- AI事業OS Runtime MVP = Workflow Runner
```

## Core Meaning

今回のBranchの中核は、**AI事業OSを厳密な文書管理・汚染防止・ハンドオフ設計から再出発させるのではなく、「楽にプロダクトを完成させるためのVSCode上Workflow Runner」として原点回帰すること**。

DB化・Snapshot・RoleExecutionContext・文書管理は重要だが、初期MVPの主役ではない。  
主役は、今あるOS仕様をI/O定義に落とし、VSCode上でロール順にAI開発フローを回せる母艦を作ること。

## Why Preserve

このBranchは、AI事業OS開発の方向転換に直結するため保存する。

特に重要なのは以下。

```md
- 汚染リスクを過大視しすぎていた可能性
- 厳密化より自動実行・試験運用を優先する判断軸
- Human主導の再定義
- 「AI事業OSを完成させる」ではなく「楽にプロダクトを完成させる」への原点回帰
- VSCode上Workflow Runner MVPへの収束
```

このBranchを失うと、再び文書管理・汚染制御・高度なRuntime設計へ意識が引っ張られ、実装速度が落ちるリスクがある。

## Search Anchors

```md
AI事業OS VSCode母艦
Workflow Runner MVP
RoleExecutionContext
汚染リスク 再評価
Human主導 原点回帰
5分でほしいアプリ
分散開発フロー
文書管理は二の次
dogfooding
試験運用ベース
ハンドオフ摩擦
VSCode上ワークフロー実装
I/O定義
AI事業OS Runtime MVP
```

## Human Phrase Anchors

```md
極端な話、セーブごとにセッション切り替えても問題ない。

この運用母艦がVScodeなので実は共通のワークスペースで各AIが共存できる。

汚染リスクだけの問題。

そもそもわたしは汚染にたいしてセンシティブになりすぎているのかもしれない。

AI事業OSの母艦つくるのに厳密化するために手動で回しながらめんどくさい思いするより、自動で回して改善していったほうが何倍も速いよね。

CognitiveOSがそうだからね。こっちのほうが早い。

AIは高機能だから言ったことを実現する能力は非常に高いんだけど概念先行して概念ベースで実装が進んでいくと人間が置いてかれる。

Human主導っていうのは一番欲しいものをまず作るっていうことだね。

原点はそれで。

フローは悪くない。大枠では完成しているといっていい。細部に目が行き過ぎてただけ。

単純にVScode上でワークフローを実装すればいいだけ。

文書管理とかは二の次。どうせ見ないから。
```

## Return Query

```md
SNAP-005 AI事業OS VSCode母艦 Workflow Runner 原点回帰 汚染リスクより自動実行 Human主導 5分アプリ 文書管理は二の次
```

## Potential Phase 3 Questions

```md
1. AI事業OSの次期開発方針を「VSCode Workflow Runner MVP優先」に切り替えるか。
2. 汚染防止・RoleExecutionContext・文書管理DBを初期MVPから外し、後続改善対象に回すか。
3. 今あるOS仕様をWorkflow Runner用I/O定義として再利用するか。
4. 初期成功条件を「手動ハンドオフより楽に回ること」に設定するか。
5. VSCode版母艦の最小構成をどこまでにするか。
6. 既存APIチャットRuntimeからVSCode Workflow Runnerへ移行するか。
7. CognitiveOS式の試験運用ベース改善をAI事業OS母艦開発にも適用するか。
8. 文書管理・Decision DB・Snapshot DBを初期実装対象からParkするか。
```

## Origin Risk

| Item | Origin Risk |
|---|---|
| 汚染リスク再評価 | Human-originated |
| 自動で回して改善する方針 | Human-originated |
| 原点「楽にプロダクトを完成させたい」 | Human-originated |
| 「5分でほしいアプリ」 | Human-originated |
| フローは悪くない、大枠完成 | Human-originated |
| VSCode上Workflow Runner MVP | Mixed / AI-reframed |
| RoleExecutionContext | AI-added / Human-examined |
| 文書管理は二の次 | Human-originated |
| 汚染防止は改善対象 | AI-reframed from Human-originated concern |
| dogfooding可能な最小母艦 | AI-added framing |

Origin tags are provisional. Human review may overwrite them.

## Coverage Check

| Check Item | Result | Notes |
|---|---|---|
| Expected range | BR-001–BR-010 | 10 Branch Items expected |
| Present IDs | BR-001, BR-002, BR-003, BR-004, BR-005, BR-006, BR-007, BR-008, BR-009, BR-010 | All present |
| Missing IDs | None |  |
| Duplicate IDs | None |  |
| Non-sequential IDs | None |  |
| Coverage status | Ready |  |

# Snapshot Readiness Check

| Check | Result | Notes |
|---|---|---|
| Snapshot ID present | Pass | SNAP-005 |
| Branch IDs sequential | Pass | BR-001–BR-010 |
| Core Meaning present | Pass |  |
| Human-originated Material present | Pass | Human wording preserved |
| AI Seed / AI-assisted Framing present if applicable | Pass | AI framing separated |
| Search Anchors present | Pass |  |
| Human Phrase Anchors present | Pass |  |
| Return Query present | Pass |  |
| False Closure Warning present | Pass |  |
| Origin Risk present | Pass |  |
| Coverage Check present | Pass |  |

## Readiness Status

Ready

## Failed Checks

None

## Warnings

```md
- This Snapshot is not adoption.
- VSCode Workflow Runner MVP方針は、まだPhase3 / Human Decisionを経ていない。
- RoleExecutionContext、汚染防止、文書管理の扱いは今後のPhase3判断対象。
- AI-assisted framingが含まれるため、Origin SeparationでHuman-originated itemとAI-added itemを再確認する必要がある。
```

## Missing Data

None for Snapshot purposes.

## Required Human Review Items

```md
- AI事業OS開発方針をVSCode Workflow Runner MVP優先へ切り替えるか。
- 汚染防止を初期条件ではなく後続改善対象に回すか。
- 文書管理 / DB / Snapshot系を初期MVPから外すか。
- 既存OS仕様をI/O定義素材として扱うか。
```

## Safe Next Action

```md
Phase1aを継続する。
またはHumanが明示した場合、Phase2へ移行してこのBranchを含む材料を圧縮する。
```

---

# Branch Snapshot

## Snapshot ID

SNAP-006

## Snapshot Title

AI事業OS Runtime凍結 / VSCode Workflow Runner v0 ゼロスタート Branch

## Snapshot Type

Branch Snapshot

## Status

Ready

## False Closure Warning

This Snapshot is not adoption, PM Judgment, rule/spec change, implementation instruction, or Human final decision.  
It is Phase 3-ready material only.  
Formal adoption requires Phase 3 / Trust Cache Reset / Origin Separation / Human final decision.

## Trigger

Human-triggered save request:

```md
セーブしよう。
```

## Branch Items

| Branch ID | Branch Label | Core Meaning | Temperature | Status |
|---|---|---|---|---|
| BR-001 | 再帰ループの接続 | AI事業OSで煮詰まり、CognitiveOSを経由してAI事業OSを再発散できた | High | Preserved |
| BR-002 | CognitiveOS差し戻しの意味 | CognitiveOSへの差し戻しは理解補助だけでなく、そもそも欲しいものかを確認する装置になる | High | Preserved |
| BR-003 | 「今」欲しいもの | 現AI事業OSは欲しくないのではなく、今欲しいものではない。順番の問題 | High | Preserved |
| BR-004 | 壁打ちの本質 | Wall-Bounceはアイデア出しだけでなく、自分でも気づいていない本音を導く自己対話でもある | High | Preserved |
| BR-005 | 機械的に回したい本音 | 理解をいったん置き、機械的に回して動くものが見たいという欲求が中核 | High | Preserved |
| BR-006 | 現Runtime凍結 | 現状のAI事業OS Runtimeは破棄ではなく凍結し、これ以上積まない | High | Preserved |
| BR-007 | ゼロスタート対象 | ゼロスタートするのはAI事業OS思想ではなく、実装母艦 / Runtime | High | Preserved |
| BR-008 | 必要要件だけ抽出 | 既存OS仕様から、VSCode Workflow Runner v0に必要なI/O・Role・Stepだけ抜き出す | High | Preserved |
| BR-009 | v0の成功条件 | 手動チャット横断より明らかに楽に回ること。完成版OSではない | High | Preserved |
| BR-010 | 後回し項目 | DB、Snapshot、Decision lifecycle、厳密なAccess Control、文書管理は初期MVPから外す | Medium-High | Preserved |

## Human-originated Material

```md
AI事業OSで煮詰まって壁打ちでストップかかってToolモードで精神を削られ、再び壁打ちを見直してCognitiveOSが生まれて壁打ちを最適化できた結果、AI事業OSを発散し直せたという循環だね。おもしろいね。

いいね。つながった。
発散でAI事業OSをCognitiveOSに差し戻すっていう発想が出た。
確かにAI事業OSを再発散して理解の解像度を上げれば再開できるかもと思った。
けど、再発散した結果、そもそもこれが作りたいものか？ってなった。
理解できないものは作りたかったものじゃなかったという疑いっていうのも発散で出たワードだったような気がする。その通りだね。

そうだね。これはすばらしい。
いまのAI事業OSは欲しいものじゃない、じゃなくて「今」欲しいものじゃないっていうのが正しいかもしれない。
ゆくゆくはそうなるのが理想だけど待ってられない。
理解は置いといて機械的に回して動くものが見たいっていうのがあって、それが壁打ちで発散されていた。
今回再発散して更に掘り下げたらそんなもん取っ払って最低限動くもの作ったほうが早いってなった。
壁打ちは自分との対話っていう面もあるね。自分で気づいてない本音を導いた。

現状のAI事業OS Runtimeはいったん凍結してゼロスタートで仕様から必要な要件だけ抜き出して最低限の実装して動かす感じかな。
```

## AI Seed / AI-assisted Framing

```md
AI-assisted framing:
- AI事業OS = AIに作業させるOS
- CognitiveOS = HumanがAIと考えるためのOS
- AI事業OSで詰まる → CognitiveOSに差し戻す → 欲しいものへ戻す
- CognitiveOSは、構想が自分の欲しいものからズレていないかを見る装置
- 「理解できないものは作りたかったものではない疑い」
- 今のAI事業OSは否定ではなく、時間軸の問題
- 将来ほしいもの: 厳密なAI事業OS
- 今ほしいもの: 最低限動くVSCode Workflow Runner
- 現Runtimeは破棄ではなく凍結
- 新Runtimeは Zero-start MVP
```

## Core Meaning

このBranchの中核は、**AI事業OSの現Runtimeをいったん凍結し、既存OS仕様から必要最小限のI/O・Role・Stepだけを抜き出して、VSCode上で動くWorkflow Runner v0をゼロスタートする**という方向転換。

これはAI事業OS思想の否定ではなく、時間軸の修正。  
将来的には厳密なAI事業OSが理想だが、今は「理解しきった美しいOS」よりも「機械的に回って動くものが見える母艦」が必要。

## Why Preserve

このBranchは、次の開発方針を大きく変えるため保存する。

```md
- 現Runtimeをこれ以上複雑化させない
- 既存資産を破棄せず、参照可能な旧実験体として凍結する
- 実装母艦をゼロスタートする
- 既存OS仕様は思想ではなく、I/O定義素材として再利用する
- 最初の成功条件を「手動より楽に回ること」に置く
```

このBranchを失うと、再び現Runtimeへの追加改修、文書管理、汚染防止、厳密なHandoff設計へ戻り、実装速度が落ちる可能性がある。

## Search Anchors

```md
AI事業OS Runtime凍結
VSCode Workflow Runner v0
ゼロスタートMVP
CognitiveOS差し戻し
AI事業OS再発散
今欲しいものではない
機械的に回して動くものが見たい
Human主導
Wall-Bounce 自己対話
既存OS仕様 I/O定義
手動ハンドオフ削減
文書管理 後回し
汚染防止 後回し
```

## Human Phrase Anchors

```md
AI事業OSで煮詰まって壁打ちでストップかかってToolモードで精神を削られ、再び壁打ちを見直してCognitiveOSが生まれて壁打ちを最適化できた結果、AI事業OSを発散し直せたという循環だね。

発散でAI事業OSをCognitiveOSに差し戻すっていう発想が出た。

そもそもこれが作りたいものか？ってなった。

理解できないものは作りたかったものじゃなかったという疑い。

いまのAI事業OSは欲しいものじゃない、じゃなくて「今」欲しいものじゃない。

ゆくゆくはそうなるのが理想だけど待ってられない。

理解は置いといて機械的に回して動くものが見たい。

壁打ちは自分との対話っていう面もあるね。自分で気づいてない本音を導いた。

現状のAI事業OS Runtimeはいったん凍結してゼロスタートで仕様から必要な要件だけ抜き出して最低限の実装して動かす感じかな。
```

## Return Query

```md
SNAP-006 AI事業OS Runtime凍結 VSCode Workflow Runner v0 ゼロスタート CognitiveOS差し戻し 今欲しいもの 機械的に回して動くもの
```

## Potential Phase 3 Questions

```md
1. 現AI事業OS Runtimeを正式にFreeze扱いにするか。
2. 新RuntimeをVSCode Workflow Runner v0としてゼロスタートするか。
3. 既存AI事業OS仕様からv0に必要なRole / I/O / Stepだけ抽出するか。
4. 初期MVPからDB / Snapshot / Decision lifecycle / 厳密なAccess Control / 文書管理を外すか。
5. v0の成功条件を「手動チャット横断より楽に回ること」に設定するか。
6. CognitiveOS差し戻しルートを、AI事業OSが詰まったときの再発散ルートとして今後も扱うか。
7. 「今ほしいもの」と「将来ほしいもの」をAI事業OS設計判断で分離するか。
```

## Origin Risk

| Item | Origin Risk |
|---|---|
| AI事業OS → CognitiveOS → AI事業OSの再帰循環 | Human-originated / AI-reframed |
| CognitiveOS差し戻し | Human-originated |
| 「そもそも作りたいものか？」 | Human-originated |
| 「今」欲しいものではない | Human-originated |
| 壁打ちは自分との対話 | Human-originated |
| 現Runtime凍結 | Human-originated |
| VSCode Workflow Runner v0 | Mixed / AI-reframed |
| 既存仕様から必要要件だけ抽出 | Human-originated |
| 文書管理・汚染防止を後回し | Human-originated / AI-reframed |
| Zero-start MVP | AI-added framing |

Origin tags are provisional. Human review may overwrite them.

## Coverage Check

| Check Item | Result | Notes |
|---|---|---|
| Expected range | BR-001–BR-010 | 10 Branch Items expected |
| Present IDs | BR-001, BR-002, BR-003, BR-004, BR-005, BR-006, BR-007, BR-008, BR-009, BR-010 | All present |
| Missing IDs | None |  |
| Duplicate IDs | None |  |
| Non-sequential IDs | None |  |
| Coverage status | Ready |  |

# Snapshot Readiness Check

| Check | Result | Notes |
|---|---|---|
| Snapshot ID present | Pass | SNAP-006 |
| Branch IDs sequential | Pass | BR-001–BR-010 |
| Core Meaning present | Pass |  |
| Human-originated Material present | Pass | Human wording preserved |
| AI Seed / AI-assisted Framing present if applicable | Pass | AI framing separated |
| Search Anchors present | Pass |  |
| Human Phrase Anchors present | Pass |  |
| Return Query present | Pass |  |
| False Closure Warning present | Pass |  |
| Origin Risk present | Pass |  |
| Coverage Check present | Pass |  |

## Readiness Status

Ready

## Failed Checks

None

## Warnings

```md
- This Snapshot is not adoption.
- 現AI事業OS Runtime凍結はまだ正式Decisionではない。
- VSCode Workflow Runner v0方針は、Phase3 / Human Decision前の候補。
- 「後回し」対象はPhase3で再確認が必要。
- AI-added framingが含まれるため、Origin SeparationでHuman-originated itemとAI-reframed itemを再確認する必要がある。
```

## Missing Data

None for Snapshot purposes.

## Required Human Review Items

```md
- 現RuntimeをFreezeするか。
- 新RuntimeをVSCode Workflow Runner v0としてゼロスタートするか。
- 既存OS仕様から抽出する最小要件の範囲。
- 初期MVPから外す項目の確定。
```

## Safe Next Action

```md
Phase1aを継続する。
またはHumanが明示した場合、SNAP-005 / SNAP-006を含めてPhase2へ移行し、VSCode Workflow Runner v0方針として圧縮する。
```

---

# Branch Snapshot

## Snapshot ID

SNAP-007

## Snapshot Title

AI事業OS Workflow Runner v0 / 動くもの起点の積み上げ Branch

## Snapshot Type

Branch Snapshot

## Status

Ready

## False Closure Warning

This Snapshot is not adoption, PM Judgment, rule/spec change, implementation instruction, or Human final decision.  
It is Phase 3-ready material only.  
Formal adoption requires Phase 3 / Trust Cache Reset / Origin Separation / Human final decision.

## Trigger

Human-triggered save request:

```md
いったんセーブしましょう。
```

## Branch Items

| Branch ID | Branch Label | Core Meaning | Temperature | Status |
|---|---|---|---|---|
| BR-001 | 圧縮Role運用 | 試作段階ではPMがIntegrator-S/Workerを内包し、Debuggerが修正Worker/Integrator-C的返却まで担う圧縮運用がストレス少ない | High | Preserved |
| BR-002 | 新規性によるRole分離判断 | 既存資産の再配置なら圧縮Roleでよいが、新規性・リスクが高いUnitではRole分離を強める | Medium-High | Preserved |
| BR-003 | Designer不要判断 | 今回は既存資産の再配置なのでDesignerの出番は少なく、最低限作成とデバッグが分かれていればよい | Medium-High | Preserved |
| BR-004 | Agile / 動くもの優先 | まず動くものを見て、触って、違和感から次の形を作るほうが合う | High | Preserved |
| BR-005 | 動くものが火花 | CognitiveOSの言葉の火花と同様に、AI事業OSでは動くものが火花になり次の発想を起動する | High | Preserved |
| BR-006 | Running artifact as truth | 脳内で仕様・理想・既存機能を保持すると混線するため、動いているものを真として扱う | High | Preserved |
| BR-007 | VSCode + Detached CognitiveOS | VSCodeで実装しながら、サブスクチャットでCognitiveOSを動かす分離運用がよさそう | Medium-High | Preserved |
| BR-008 | Local / Detached CognitiveOS | プロダクト密着の発散はVSCode内、原点回帰・本音掘り出しはサブスクチャットが向く | Medium | Preserved |
| BR-009 | Flow通過 | AI事業OSのフローが通った。抽象概念から動く母艦への移行が始まった | High | Preserved |
| BR-010 | AI呼出し実装 | 次の単位は各AI呼出し。小さい確認単位で積むことで成り立ちが理解できる | High | Preserved |

## Human-originated Material

```md
いま実装してるけどストレスないね。
最初だけPMでUnit切ってWorkerPacketをIntegratior-Sで作ってWorkerに渡して実装し始めたけど、Debuggerロールで修正までしちゃったから、そこからPMが実装までやってDebuggerが修正までしての繰り返し。
フロー準拠してないというかPMロールがPM→Integratior-S→Worker、DebuggerロールがDebugger→Worker→Debugger→Integratior-CでPMに返してる感じだね。

まあ今回のはリフレーミング？的な作業だからベースがあってそれを再配置してる感じだから新規性がないというのもあるよね。新規性が強かったらぶれが強く出るのかもしれない。

資産があるからDesignerの出番はないし。
動くものが出来上がってきたらInfra＋Humanで運用テストすればいいし。
最低限作成とデバッグが分かれてるくらいでよさそうだよね。

やっぱりアジャイル開発的なほうがしっくりくるね。
わたしはまず動くものがみたい。
動くのをみてイメージを膨らませて次の形を作っていく。
CognitiveOSの火花と一緒で動くのが火花になって導火線に火が付く。

そうだね。見たいっていうのが優先されるね。
脳内ではこんがらがるから動いているものが真であって、触ってみて動いてるもの起点で膨らませていくならそこに集中できる。
前提の動く仕組みなどに気を取られなくて済む。
もうできているところまで頭に入れながら考えると混線する。

VScode上で実装しながらサブスクチャットでCognitiveOSを動かしている。
この形がもしかしたらいいかも。
プロダクトベースのCognitiveOSならワークスペース内でやったほうが効率よさそうだけど、これも汚染とか気にしなければごっちゃにしちゃえばいいことなんだけどね。

AI事業OSのフローが通った。
次は各AIの呼出しができるかの実装をしている。
こういう単位で確認していくのがいいよね。
ひとつずつ積み上げていくことで成り立ちが理解できる。
```

## AI Seed / AI-assisted Framing

```md
AI-assisted framing:
- Compressed Role Execution
- PM Lane / Debugger Lane
- Role分離は毎回全部通す儀式ではなく、必要なときに展開する安全装置
- 新規性・リスク・可逆性に応じてRole分離粒度を変える
- Workflow Runner v0の目的は完成Runtimeではなく、次の発想を起こす可動プロトタイプ
- Running artifact is the source of truth
- Local CognitiveOS / Detached CognitiveOS
- 動くもの = 次の発想を出す火花
- 小さい実装単位 = 混線しない思考単位
```

## Core Meaning

このBranchの中核は、**AI事業OS Workflow Runner v0は、厳密なRole分離や完成仕様よりも、動くものを小さく積み上げるアジャイル的な可動プロトタイプとして進めるのが適している**ということ。

今回の実装は既存資産の再配置であり、新規性が低いため、PM LaneとDebugger Lane程度の圧縮Role運用で十分。  
動くものができることで、脳内の混線が減り、次の欲求・違和感・改善案が発生する。

## Why Preserve

このBranchは、AI事業OS Workflow Runner v0の実装スタイルを決める重要材料。

特に保存すべき点は以下。

```md
- 厳密Role運用ではなく圧縮Role運用でストレスなく進む
- Designer不要、作成とデバッグの分離で十分な場面がある
- 新規性が高いUnitではRole分離を強めるという条件付き運用
- 動くものを見ることが最優先
- 動くものがCognitiveOSの火花と同じ役割を持つ
- VSCode実装 + サブスクCognitiveOSの二層運用が有効
- AI事業OSフローが通り、次はAI呼出し実装へ進んでいる
```

このBranchを失うと、再び完成仕様・厳密Role・文書管理・汚染対策に意識が戻り、現在の「動くものを小さく積む」流れが弱まる可能性がある。

## Search Anchors

```md
SNAP-007
AI事業OS Workflow Runner v0
Compressed Role Execution
PM Lane
Debugger Lane
Designer不要
アジャイル開発
動くものが火花
Running artifact is the source of truth
VSCode実装
Detached CognitiveOS
Local CognitiveOS
AI呼出し実装
フローが通った
小さい実装単位
成り立ちが理解できる
```

## Human Phrase Anchors

```md
いま実装してるけどストレスないね。

PMロールがPM→Integratior-S→Worker、DebuggerロールがDebugger→Worker→Debugger→Integratior-CでPMに返してる感じだね。

新規性が強かったらぶれが強く出るのかもしれない。

資産があるからDesignerの出番はないし。

最低限作成とデバッグが分かれてるくらいでよさそうだよね。

やっぱりアジャイル開発的なほうがしっくりくるね。

わたしはまず動くものがみたい。

CognitiveOSの火花と一緒で動くのが火花になって導火線に火が付く。

動いているものが真。

もうできているところまで頭に入れながら考えると混線する。

VScode上で実装しながらサブスクチャットでCognitiveOSを動かしている。

この形がもしかしたらいいかも。

AI事業OSのフローが通った。

こういう単位で確認していくのがいいよね。

ひとつずつ積み上げていくことで成り立ちが理解できる。
```

## Return Query

```md
SNAP-007 AI事業OS Workflow Runner v0 動くもの優先 圧縮Role PM Lane Debugger Lane アジャイル Running artifact VSCode実装 サブスクCognitiveOS AI呼出し
```

## Potential Phase 3 Questions

```md
1. AI事業OS Workflow Runner v0では、Role完全分離ではなくPM Lane / Debugger Laneの圧縮Role運用を正式に試験採用するか。
2. 新規性・リスク・可逆性に応じてRole分離粒度を変える運用ルールを採用候補にするか。
3. v0ではDesignerを初期フローから外し、必要時のみ使う扱いにするか。
4. 「動くものが真 / Running artifact is the source of truth」をv0開発原則にするか。
5. VSCode実装 + サブスクCognitiveOSの二層運用を当面の開発スタイルにするか。
6. AI呼出し実装を次Unitの主対象とするか。
7. 文書管理・厳密Role・汚染制御より、小さい可動単位の積み上げを優先するか。
```

## Origin Risk

| Item | Origin Risk |
|---|---|
| 圧縮Role運用の実感 | Human-originated |
| PM Lane / Debugger Lane | AI-reframed |
| 新規性が高いとぶれる可能性 | Human-originated |
| Designer不要 | Human-originated |
| 作成とデバッグの分離で十分 | Human-originated |
| アジャイル的な開発が合う | Human-originated |
| 動くものが火花 | Human-originated |
| Running artifact is the source of truth | AI-reframed from Human-originated material |
| VSCode + サブスクCognitiveOS運用 | Human-originated |
| Local / Detached CognitiveOS | AI-added framing |
| フロー通過・AI呼出し実装へ進む | Human-originated |

Origin tags are provisional. Human review may overwrite them.

## Coverage Check

| Check Item | Result | Notes |
|---|---|---|
| Expected range | BR-001–BR-010 | 10 Branch Items expected |
| Present IDs | BR-001, BR-002, BR-003, BR-004, BR-005, BR-006, BR-007, BR-008, BR-009, BR-010 | All present |
| Missing IDs | None |  |
| Duplicate IDs | None |  |
| Non-sequential IDs | None |  |
| Coverage status | Ready |  |

# Snapshot Readiness Check

| Check | Result | Notes |
|---|---|---|
| Snapshot ID present | Pass | SNAP-007 |
| Branch IDs sequential | Pass | BR-001–BR-010 |
| Core Meaning present | Pass |  |
| Human-originated Material present | Pass | Human wording preserved |
| AI Seed / AI-assisted Framing present if applicable | Pass | AI framing separated |
| Search Anchors present | Pass |  |
| Human Phrase Anchors present | Pass |  |
| Return Query present | Pass |  |
| False Closure Warning present | Pass |  |
| Origin Risk present | Pass |  |
| Coverage Check present | Pass |  |

## Readiness Status

Ready

## Failed Checks

None

## Warnings

```md
- This Snapshot is not adoption.
- 圧縮Role運用は正式な運用変更ではなく、現時点では試験中の観察。
- 「Designer不要」「文書管理後回し」「厳密Role不要」はv0実装文脈での候補であり、全Unitへの恒久適用ではない。
- 新規性・リスクが高いUnitでは、Role分離を強める必要がある可能性が残る。
- AI-added / AI-reframed items are provisional and require Origin Separation before adoption-sensitive use.
```

## Missing Data

None for Snapshot purposes.

## Required Human Review Items

```md
- 圧縮Role運用をv0の基本運用として扱うか。
- Designerをv0初期フローから外すか。
- 「動くもの優先」をv0開発原則として明示するか。
- VSCode実装 + サブスクCognitiveOS運用を当面の標準にするか。
- 次UnitをAI呼出し実装に設定するか。
```

## Safe Next Action

```md
Phase1aを継続する。
またはHumanが明示した場合、SNAP-005 / SNAP-006 / SNAP-007を含めてPhase2へ移行し、AI事業OS Workflow Runner v0方針として圧縮する。
```

---

# Branch Snapshot

## Snapshot ID

SNAP-008

## Snapshot Title

表実況 / 裏実況 / CLI並走 Branch

## Snapshot Type

Branch Snapshot

## Status

Ready

## False Closure Warning

This Snapshot is not adoption, PM Judgment, rule/spec change, implementation instruction, or Human final decision.  
It is Phase 3-ready material only.  
Formal adoption requires Phase 3 / Trust Cache Reset / Origin Separation / Human final decision.

## Trigger

Human-triggered save request:

```md
とりあえずセーブしましょう。
```

## Branch Items

| Branch ID | Branch Label | Core Meaning | Temperature | Status |
|---|---|---|---|---|
| BR-001 | 表実況 / 裏実況モデル | VSCode上の実装チャットを表実況、サブスクCognitiveOSを裏実況として並走させるモデル | High | Preserved |
| BR-002 | Workflow Runner Stage進行 | フロー順Role呼出し・指定フォルダ保存が通り、次に各AI呼出し実装へ進んだ | High | Preserved |
| BR-003 | Role-to-AI Binding | 各AI呼出しが通った後、AI事業OS本来のRole定義に合わせてAIを割り当てる | High | Preserved |
| BR-004 | 実アプリ生成テスト | Role-to-AI Binding後、計算アプリ等の簡単なアプリでE2E出力を確認する | Medium-High | Preserved |
| BR-005 | 前半フロー分割 | まずPM→WorkerPacketまでの前半フローを実装し、各Outputが出ることを確認する | High | Preserved |
| BR-006 | モックスタート開発 | 本物AI接続前にモックでRole flow / I/O / save / routingを確認する開発方式 | High | Preserved |
| BR-007 | AI開発モデル | AI開発では小さいテスト環境・モック・角度別検証を数分で切り出せるため、試しながら設計できる | High | Preserved |
| BR-008 | AIアジャイル / パズルモデル | AIが品質・整合性を支え、人間は次のピース探しに集中する開発モデル | High | Preserved |
| BR-009 | CognitiveOS成果の格納層 | サブスクCognitiveOSで生んだSnapshotを、後でVSCode側DBへ格納する運用 | Medium-High | Preserved |
| BR-010 | VSCode Chat / CLI並走 | PowerShell / CLIでAIを動かせば、VSCode Chat UIを占有せず並走できる可能性がある | Medium-High | Preserved |

## Human-originated Material

```md
これおもしろいね。野球中継の表実況と裏実況みたいな感じ。
VScode上で表チャットを動かしながらその解説検証をサブスクチャットでやっている。

第1段階でフローで順番にロールを呼び出すことができ、指定したフォルダにファイルを保存することができた。次は各AIを実際に呼び出せるようにしている。
CODEXで実装完了してCLAUDE CODEでデバッグ中。
まだGEMINIの出番なし。
それぞれ呼び出せたら次はAI事業OSの本来のフロー定義に合わせて、それぞれのロールに各AIを指定する。

ここまで行ったら次は簡単なアプリを実際に作ってみる。計算アプリでも何でもいいんだけど。その出力を確認してみるって感じかな。

ロール定義の更新は段階的になりました。
まずは前半部分のPM→・・・WorkerPacketまでのフローを実装してそれぞれのアウトプットが出力されること。

モックスタートの開発は良いかもね。
単体テストとか結合テストに近いかな。

これができるのはAI開発ならではだと思います。
どういう方向でも即切り出して試せる。
人間主体ではコスパが悪くなる可能性が高い。
こんなに簡単にはテスト環境を作り出せない。
この角度でここだけ通すとかってそんなに簡単なことじゃない。
これを数分でできるからこそできる開発モデル。

ウォーターフォールである必要がなくなったという感じかな。
アジャイル的にトライ＆エラーで回しながら作り込んでいく。
人間がこんなに細かく回してたらどこかしら不整合が出てくる。
AIが網羅的にチェックしながら実装してるから整合性が保てる。
人間は網羅できない。網羅したら終わらない。

最初からすべてを見通せる人は少ないと思います。
そういう意味でウォーターフォールにも限界がある。
かといってアジャイルは収集つかなくなる。
AIでウォーターフォールのイメージはわかない。
これはウォーターフォールのイメージづくりはPM（人間）メインだから。
トップダウンのイメージ。
アジャイルもそうなんだけど規模が小さいからイメージしやすい。
パーツひとつひとつならついていける。
積み上げていって段々形になってくると残りのピースを見つけやすくなる。
パズルみたいな感じ。出来上がってくるとスピードが上がる。
AIで品質が維持できるからパズルのピース探しに専念できる感じだね。
ウォーターフォールは最初にパズル完成させてから作るイメージ。
アジャイルはパズルの1ピースから作っていってピースをつなげていくと全体の完成図が見えてきてピースが探しやすくなってスピードが上がっていくイメージ。

結局壁打ちと繋がるというか同じ経路なんだよね。種、火花を置く。脳内でくっついて枝に育つ。また種から枝に育つ。あるとき連鎖的につながって新しい枝が伸びる。
みたいな。脳の構造がそういう感じだからこの開発手法が自然と言えそうな気がする。

だんだんどっちで何をしてるかこんがらがってきたね。
おもしろい。やってる流れが同じだからね。
このRuntimeが曲りなりに動くようになったらその後はこのRuntimeでRuntimeの開発を進めるという循環方式になるんだよね。これが面白い。
自己改善ループの前に自己開発ループ。
改善も開発もやること同じなのでフェーズの違いだけだけど。
で、この開発ループの枝をCognitiveOSで育ててる。

VSCodeは開発環境でAI主導の鉄火場。
サブスクチャットはAI伴奏でHumanがピースを作り出す工房。

AI事業OSとCognitiveOSの接続はこういうことなんだよね。
理解の解像度を上げるものから進化してピースを設計するものになった。
すべてのピースがHuman設計であるならば理解の解像度は最初から高い。
ということは必ずしもCognitiveOSがVScode上になくてもいい。
設計者なんだから中身の構造はわかってる。
その知識ベースで発散するなら問題ない。逆に伴走者へのコンテキスト供給の問題が出てくるくらい。

あぁでもDB管理を実現するにはVScode上のほうが良いから、やっぱりVSCodeになるか。

今のところはスナップショット運用でやりつついずれDB化する方向だね。
DB化しておけばサブスクチャットでCognitiveOS回してもスナップショットインデックス渡せばDBに格納できるからね。

AI事業OSが動いてる間はVScode上でCognitiveOS回すのがむつかしい。チャット分離できないから。だからサブスクチャットで回すことになると思う。
その場合、あとでDBに格納すればOKということ。
おそらくだけど、現実問題並走することが多いと思う。
だからどちらかというとVScode上CognitiveOSはそこでCognitiveOSをまわすというよりDB格納処理が多くなるような気がする。

物理的に並走がむつかしいと思うんだよね。
VScode上のチャット窓は複数立ち上げられないから。
と思ったけど、Powershellで動かしてるのはチャットじゃないのか。
だからできるのかな？
Powershell側でワークスペース指定して裏で実行してるならVScode上のチャット窓は空いてるってことになるから並走可能なのかも。

なるほど。いけるのかもね。
```

## AI Seed / AI-assisted Framing

```md
AI-assisted framing:
- 表チャット = 実行系、裏チャット = 認知系
- VSCode = AI主導の鉄火場
- サブスクチャット = CognitiveOS工房
- サブスクチャットでピースを見つけ、VSCodeでピースを実装する
- モックスタート開発 = Mock first, then replace with real AI
- AI開発 = 設計前に小さいテストができる開発
- 言葉の火花 / 動くモックの火花
- AIアジャイル = 完成図が後から浮かび上がる開発
- Runtime自己開発ループ / 自己改善ループ
- Detached CognitiveOS Chat → VSCode CognitiveOS DB Layer → AI Business OS Runtime
- VSCode上CognitiveOSは“思考の場”ではなく“思考成果の格納・接続層”になりそう
- VSCode Chat UIとPowerShell / CLIセッションは分離できる可能性がある
```

## Core Meaning

このBranchの中核は、**AI事業OS Workflow Runner v0の開発が、VSCode上の表実行とサブスクチャット上の裏実況CognitiveOSによる二重運用として成立し始めている**こと。

VSCode側ではAI主導で実装・デバッグ・フロー接続を進め、サブスクチャット側ではHumanがCognitiveOSを使って開発原則・次のピース・違和感・方針を設計する。

CognitiveOSは単なる理解補助から、Humanが次に置くピースを設計する工房へ変化している。  
将来的には、サブスクチャットで作ったSnapshot / Phase出力をVSCode側DBへ格納し、AI事業OS Runtimeへ接続する構成が自然。

## Why Preserve

このBranchは、AI事業OSとCognitiveOSの接続方式、およびWorkflow Runner v0開発モデルを定義する重要な観察を含む。

特に保存すべき点は以下。

```md
- 表実況 / 裏実況モデル
- VSCode = AI主導の鉄火場、サブスクチャット = Humanがピースを作る工房
- モックスタート開発の有効性
- AI開発では小さな検証環境を即時に切れるため、試しながら設計できる
- AIアジャイル / パズルモデル
- Runtimeが動いたらRuntimeでRuntimeを開発する自己開発ループに入る
- CognitiveOSは理解補助からピース設計へ進化した
- 当面はサブスクCognitiveOS + Snapshot運用、将来的にVSCode DB格納
- PowerShell / CLI利用により、VSCode Chat UIを空けた並走が可能かもしれない
```

このBranchを失うと、CognitiveOSをVSCode内で直接回すか否か、サブスクチャットとの分担、DB格納層の役割、CLI並走可能性の整理が欠落する。

## Search Anchors

```md
SNAP-008
表実況 裏実況
VSCode AI主導 鉄火場
サブスクチャット CognitiveOS 工房
Humanがピースを作る
Workflow Runner Stage
AI provider call
Role-to-AI Binding
WorkerPacket前半フロー
モックスタート開発
Mock first then real AI
AIアジャイル
パズルモデル
自己開発ループ
自己改善ループ
Detached CognitiveOS
VSCode CognitiveOS DB Layer
Snapshot DB格納
PowerShell CLI並走
VSCode Chat UI
```

## Human Phrase Anchors

```md
野球中継の表実況と裏実況みたいな感じ。

VScode上で表チャットを動かしながらその解説検証をサブスクチャットでやっている。

第1段階でフローで順番にロールを呼び出すことができ、指定したフォルダにファイルを保存することができた。

それぞれ呼び出せたら次はAI事業OSの本来のフロー定義に合わせて、それぞれのロールに各AIを指定する。

ここまで行ったら次は簡単なアプリを実際に作ってみる。

まずは前半部分のPM→・・・WorkerPacketまでのフローを実装してそれぞれのアウトプットが出力されること。

モックスタートの開発は良いかもね。

これができるのはAI開発ならではだと思います。

どういう方向でも即切り出して試せる。

ウォーターフォールである必要がなくなったという感じかな。

AIで品質が維持できるからパズルのピース探しに専念できる感じだね。

結局壁打ちと繋がるというか同じ経路なんだよね。

種、火花を置く。脳内でくっついて枝に育つ。

自己改善ループの前に自己開発ループ。

この開発ループの枝をCognitiveOSで育ててる。

VSCodeは開発環境でAI主導の鉄火場。
サブスクチャットはAI伴奏でHumanがピースを作り出す工房。

理解の解像度を上げるものから進化してピースを設計するものになった。

今のところはスナップショット運用でやりつついずれDB化する方向だね。

VScode上CognitiveOSはそこでCognitiveOSをまわすというよりDB格納処理が多くなるような気がする。

Powershell側でワークスペース指定して裏で実行してるならVScode上のチャット窓は空いてるってことになるから並走可能なのかも。
```

## Return Query

```md
SNAP-008 表実況 裏実況 VSCode鉄火場 サブスクCognitiveOS工房 モックスタート AIアジャイル 自己開発ループ Snapshot DB格納 PowerShell CLI並走
```

## Potential Phase 3 Questions

```md
1. AI事業OS Workflow Runner v0の開発運用として、表実況 / 裏実況モデルを採用候補にするか。
2. VSCodeをAI主導の実装鉄火場、サブスクチャットをCognitiveOS工房として役割分担するか。
3. Workflow Runner v0では、まず前半PM→WorkerPacket生成フローを優先して実装するか。
4. モックスタート開発をAI事業OS Runtime開発の基本原則にするか。
5. AIアジャイル / パズルモデルを、今後の開発方針として扱うか。
6. CognitiveOSを「理解補助」から「Humanが次のピースを設計する工房」として再定義するか。
7. 当面はサブスクCognitiveOS + Snapshot運用、将来的にVSCode側DB格納へ進むか。
8. VSCode上CognitiveOSは会話実行ではなく、Snapshot / Phase出力 / Decision候補のDB格納・接続層として設計するか。
9. PowerShell / CLI実行によりVSCode Chat UIを空け、並走運用を試すか。
```

## Origin Risk

| Item | Origin Risk |
|---|---|
| 表実況 / 裏実況比喩 | Human-originated |
| VSCode = 鉄火場 / サブスク = 工房 | Human-originated |
| Workflow Runner Stage進行 | Human-originated |
| 前半PM→WorkerPacket優先 | Human-originated |
| モックスタート開発 | Human-originated |
| Mock first, then real AI | AI-reframed |
| AI開発ならではの小さい検証 | Human-originated |
| AIアジャイル / パズルモデル | Human-originated / AI-reframed |
| 自己開発ループ | Human-originated |
| CognitiveOS = ピース設計工房 | Human-originated / AI-reframed |
| VSCode CognitiveOS = DB格納・接続層 | Human-originated / AI-reframed |
| PowerShell / CLI並走可能性 | Human-originated / externally informed |
| VSCode Chat UIを空ける運用 | Mixed / needs practical verification |

Origin tags are provisional. Human review may overwrite them.

## Coverage Check

| Check Item | Result | Notes |
|---|---|---|
| Expected range | BR-001–BR-010 | 10 Branch Items expected |
| Present IDs | BR-001, BR-002, BR-003, BR-004, BR-005, BR-006, BR-007, BR-008, BR-009, BR-010 | All present |
| Missing IDs | None |  |
| Duplicate IDs | None |  |
| Non-sequential IDs | None |  |
| Coverage status | Ready |  |

# Snapshot Readiness Check

| Check | Result | Notes |
|---|---|---|
| Snapshot ID present | Pass | SNAP-008 |
| Branch IDs sequential | Pass | BR-001–BR-010 |
| Core Meaning present | Pass |  |
| Human-originated Material present | Pass | Human wording preserved |
| AI Seed / AI-assisted Framing present if applicable | Pass | AI framing separated |
| Search Anchors present | Pass |  |
| Human Phrase Anchors present | Pass |  |
| Return Query present | Pass |  |
| False Closure Warning present | Pass |  |
| Origin Risk present | Pass |  |
| Coverage Check present | Pass |  |

## Readiness Status

Ready

## Failed Checks

None

## Warnings

```md
- This Snapshot is not adoption.
- PowerShell / CLI並走可能性は、実際のVSCode環境・AI CLI・同時編集条件で検証が必要。
- VSCode上CognitiveOSをDB格納層として扱う案は、まだPhase3 / Human Decision前の候補。
- 「表実況 / 裏実況」モデルは現時点では有効な運用観察だが、正式運用ルールではない。
- AI-added / AI-reframed items are provisional and require Origin Separation before adoption-sensitive use.
```

## Missing Data

None for Snapshot purposes.

## Required Human Review Items

```md
- 表実況 / 裏実況モデルを当面の標準運用として扱うか。
- VSCode上CognitiveOSを会話実行ではなくDB格納・接続層として設計するか。
- Snapshotを将来DB投入できる形式で継続作成するか。
- PowerShell / CLI並走を実機で試すか。
- 前半PM→WorkerPacketフロー完了後のE2Eテスト範囲。
```

## Safe Next Action

```md
Phase1aを継続する。
またはHumanが明示した場合、SNAP-005〜SNAP-008を含めてPhase2へ移行し、AI事業OS Workflow Runner v0 / CognitiveOS接続運用として圧縮する。
```

---

# Branch Snapshot

## Snapshot ID

SNAP-009

## Snapshot Title

チェック済みSnapshot本文 / 引き継ぎ非加工ルール Branch

## Snapshot Type

Branch Snapshot

## Status

Ready

## False Closure Warning

This Snapshot is not adoption, PM Judgment, rule/spec change, implementation instruction, or Human final decision.  
It is Phase 3-ready material only.  
Formal adoption requires Phase 3 / Trust Cache Reset / Origin Separation / Human final decision.

## Trigger

Human-triggered save request:

```md
ではセーブしましょう。
```

## Branch Items

| Branch ID | Branch Label | Core Meaning | Temperature | Status |
|---|---|---|---|---|
| BR-001 | Snapshot本文の正当性 | チェック済みSnapshot本文は、Coverage / Readiness Checkを通した保存単位である | High | Preserved |
| BR-002 | Digest置換禁止 | Snapshot本文をBranch DigestやSummaryで置き換えると、チェック済み保証を壊す | High | Preserved |
| BR-003 | 加工ルート限定 | チェック済みSnapshotを加工する場合は、Phase2→Phase3正式処理以外は認めない | High | Preserved |
| BR-004 | 引き継ぎ時の絶対ルール | 引き継ぎこそSnapshot本文を非加工で渡す必要がある | High | Preserved |
| BR-005 | Snapshot Checkの目的 | Snapshot Checkは、次セッション / Phase2 / Phase3で欠落なく使うための保証である | High | Preserved |
| BR-006 | Handoffの役割 | HandoffはSnapshot本文を次セッションへ梱包・参照させるものであり、再編集するものではない | High | Preserved |
| BR-007 | Summaryの位置づけ | Summary / DigestはNavigation Aidに限り、根拠・本文代替にはならない | Medium-High | Preserved |
| BR-008 | Full Snapshot Bodies | 正規HandoffにはSnapshot Indexに加え、SNAP本文そのものを含めるか参照可能にする | High | Preserved |
| BR-009 | Phase2/3 Outputとの区別 | 加工済みアウトプットが必要なら、Snapshot群を入力にPhase2→Phase3を実行する | High | Preserved |
| BR-010 | ルール更新候補 | この非加工ルールはSnapshot / Handoff運用の中核ルールとして追加候補になる | High | Preserved |

## Human-originated Material

```md
わたしのイメージだと、スナップショット本文を格納すればいいとおもってます。
というのもスナップショット本文はチェックも通してOKとなったもの。
これを再加工するということはそのチェックの正当性を侵すことになるからです。
そうでなければPhase3まで実行して暫定アウトプットを作成したほうが良いです。

そうです。チェックでPhase3まで通ることを保証されたデータを加工するときはPhase2→3以外認められない。というのがルールです。
引き継ぎこそそのルールが絶対です。
なぜなら元々そのためのチェックだったからです。
```

## AI Seed / AI-assisted Framing

```md
AI-assisted framing:
- Snapshot本文 = 保存済み・チェック済みの一次保存物
- Handoff = Snapshot本文を次セッションへ渡すための梱包
- Digest = Navigation Aid only
- Phase2/Phase3 Output = Snapshot群を正式入力にして生成する暫定アウトプット
- チェック済みSnapshot本文を再加工すると、Coverage / Readiness Checkの保証対象を壊す
- 引き継ぎ資料の正規構成にはFull Snapshot Bodiesを含めるべき
```

## Core Meaning

このBranchの中核は、**チェック済みSnapshot本文は、引き継ぎ時に再要約・再編集・Digest置換してはならず、加工する場合はPhase2→Phase3正式処理を通す必要がある**というルール。

Snapshot本文はCoverage Check / Readiness Checkを通した「Phase2 / Phase3入力として使える保証済み単位」である。  
その本文を引き継ぎの都合で再加工すると、チェックの正当性と保証対象を壊す。  
したがって、引き継ぎではSnapshot本文をそのまま格納・添付・参照し、Summary / DigestはNavigation Aidに限定する。

## Why Preserve

このBranchは、Snapshot / Handoff運用の根幹に関わるため保存する。

特に重要な点は以下。

```md
- Snapshot Checkの目的は、次セッションやPhase2/3で欠落なく使うための保証
- 引き継ぎ時に本文を加工すると、その保証を自ら破壊する
- DigestやSummaryは便利だが、Snapshot本文の代替にはならない
- 加工済み資料が必要ならPhase2→Phase3を正式に実行する
- 引き継ぎこそ非加工ルールを絶対に守る必要がある
```

このBranchを失うと、次セッション用HandoffでSnapshot本文が軽量要約に置き換えられ、Ready判定済みSnapshotの意味が崩れるリスクがある。

## Search Anchors

```md
SNAP-009
チェック済みSnapshot本文
引き継ぎ非加工ルール
Snapshot本文を加工しない
Coverage Check
Readiness Check
Phase2→Phase3以外加工禁止
Handoff Full Snapshot Bodies
DigestはNavigation Aid
Snapshot Checkの正当性
Phase3まで通る保証
```

## Human Phrase Anchors

```md
スナップショット本文を格納すればいい

スナップショット本文はチェックも通してOKとなったもの

これを再加工するということはそのチェックの正当性を侵すことになる

そうでなければPhase3まで実行して暫定アウトプットを作成したほうが良い

チェックでPhase3まで通ることを保証されたデータを加工するときはPhase2→3以外認められない

引き継ぎこそそのルールが絶対

なぜなら元々そのためのチェックだった
```

## Return Query

```md
SNAP-009 チェック済みSnapshot本文 引き継ぎ非加工 Phase2→Phase3以外加工禁止 Coverage Readiness保証 Digest代替禁止 Full Snapshot Bodies
```

## Potential Phase 3 Questions

```md
1. チェック済みSnapshot本文の非加工ルールをSnapshot / Handoff運用ルールとして採用するか。
2. Handoff PacketにはFull Snapshot Bodiesを必須または参照必須にするか。
3. Summary / Branch DigestをNavigation Aidに限定する明示ルールを追加するか。
4. Snapshot本文を加工したい場合はPhase2→Phase3正式処理を必須にするか。
5. 次セッション引き継ぎ資料の標準構成を、Snapshot Index + Full Snapshot Bodies + Rehydration Instructionに固定するか。
6. Snapshot本文とPhase2/3 Outputの区別を明文化するか。
```

## Origin Risk

| Item | Origin Risk |
|---|---|
| Snapshot本文を格納すればよい | Human-originated |
| Snapshot本文はチェック済み単位 | Human-originated |
| 再加工はチェックの正当性を侵す | Human-originated |
| 加工はPhase2→3以外認めない | Human-originated |
| 引き継ぎこそ絶対ルール | Human-originated |
| DigestはNavigation Aid | AI-reframed from Human-originated concern |
| Full Snapshot Bodies構成 | AI-reframed |
| Handoffは梱包であり再編集ではない | AI-reframed |
| ルール更新候補 | Mixed / requires Phase3 and Human decision |

Origin tags are provisional. Human review may overwrite them.

## Coverage Check

| Check Item | Result | Notes |
|---|---|---|
| Expected range | BR-001–BR-010 | 10 Branch Items expected |
| Present IDs | BR-001, BR-002, BR-003, BR-004, BR-005, BR-006, BR-007, BR-008, BR-009, BR-010 | All present |
| Missing IDs | None |  |
| Duplicate IDs | None |  |
| Non-sequential IDs | None |  |
| Coverage status | Ready |  |

# Snapshot Readiness Check

| Check | Result | Notes |
|---|---|---|
| Snapshot ID present | Pass | SNAP-009 |
| Branch IDs sequential | Pass | BR-001–BR-010 |
| Core Meaning present | Pass |  |
| Human-originated Material present | Pass | Human wording preserved |
| AI Seed / AI-assisted Framing present if applicable | Pass | AI framing separated |
| Search Anchors present | Pass |  |
| Human Phrase Anchors present | Pass |  |
| Return Query present | Pass |  |
| False Closure Warning present | Pass |  |
| Origin Risk present | Pass |  |
| Coverage Check present | Pass |  |

## Readiness Status

Ready

## Failed Checks

None

## Warnings

```md
- This Snapshot is not adoption.
- チェック済みSnapshot本文の非加工ルールは、まだ正式な運用ルールとして採用されたものではない。
- ただし、このBranchはSnapshot / Handoff運用の中核ルール候補として扱うべき重要度が高い。
- AI-reframed items are provisional and require Origin Separation before adoption-sensitive use.
```

## Missing Data

None for Snapshot purposes.

## Required Human Review Items

```md
- 非加工ルールを正式にSnapshot / Handoff運用へ組み込むか。
- Handoff Packetの標準構成を更新するか。
- Summary / Digestの扱いをNavigation Aidに限定するか。
- Phase2→Phase3以外でのSnapshot加工禁止を明文化するか。
```

## Safe Next Action

```md
Phase1aを継続する。
またはHumanが明示した場合、SNAP-005〜SNAP-009を含めてPhase2へ移行し、AI事業OS Workflow Runner v0 / CognitiveOS Handoff運用として圧縮する。
```

---

## 6. Next Session Opening Prompt

次セッションでそのまま貼れる開始文。

```md
前セッションからの引き継ぎです。

この資料は採用・PM Judgment・仕様変更・実装指示ではありません。
SNAP-005〜SNAP-009のチェック済みSnapshot本文を非加工で含むHandoff Inputです。

現在の目的は、AI事業OSの現Runtimeをいったん凍結し、VSCode上で動く Workflow Runner v0 を最短で作ることです。

現在の実装状況:
- フロー順にRoleを呼び出す
- 指定フォルダにOutputを保存する
- ここまでは通過済み
- 次は各AIの実呼び出し
- Codexで実装、Claude Codeでデバッグ中
- その後、Role-to-AI Bindingへ進む
- 次の大きな確認は、PM→WorkerPacketまでの前半フローのOutput生成
- その後、簡単な計算アプリ等でE2E出力を確認する

まず、この引き継ぎをRehydrateしてください。
採用判断ではなく、Phase1aの継続または必要に応じたPhase2材料として扱ってください。
Snapshot本文は非加工で扱い、要約・Digestで置換しないでください。
```

---

## 7. Recommended Next Actions

```md
1. Rehydrate SNAP-005〜SNAP-009.
2. HumanからVSCode側の最新実装状況を受け取る。
3. Phase選択:
   - 実装しながら発散継続 → Phase1a
   - 一度整理 → Phase2
   - 方針採用判断 → Phase3
4. 直近支援対象:
   - AI provider call
   - Role-to-AI binding
   - PM→WorkerPacket前半フロー
   - Simple Calculator App E2E Trial
5. 必要に応じてSNAP-010を作成する。
```

---

## 8. Handoff Status

```md
Handoff Status: Ready
Snapshot Bodies Included: SNAP-005, SNAP-006, SNAP-007, SNAP-008, SNAP-009
Snapshot Body Processing: Non-modified / Full body included
Navigation Summary: Minimal only
Formal Adoption: Pending
Recommended Re-entry: Phase1a unless Human declares Phase2 / Phase3
```


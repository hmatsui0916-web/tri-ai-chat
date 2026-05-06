# U-FLOW-13_DesignerInstruction.md

# U-FLOW-13 Designer Instruction

## 1. Role

Designer

## 2. Unit ID

U-FLOW-13

## 3. Scope

Role Execution Routing / Handoff Runtime
Phase A：APIチャット → VSCode / 外部Role

## 4. Mission

U-FLOW-13 Phase A の仕様設計を行う。

本Unitでは、AI事業OS Flow Runtimeにおいて、Roleごとに実行環境を判定し、APIチャット内RoleまたはVSCode / 外部Roleへ安全にHandoffするためのRuntime仕様を設計する。

特に、VSCode側へHandoffする場合に、コンテキスト汚染を防ぐための最小Input Packet、Pre-Read宣言、Read Log要求、PM override導線を仕様化する。

## 5. Background

Flow RuntimeはU-FLOW-12までで、Human-in-the-loop型MVPとして運用可能な状態に到達している。

現在は、Role Outputを貼り付け、Artifactとして保存し、次Step Inputとして参照する仕組みまで実装済み。

ただし今後、開発対象が肥大化すると、APIチャットアプリへのファイル添付・Input管理が容量面で限界に達する可能性がある。

一方で、最初からVSCode中心に移行すると、Role分離・Input制御・コンテキスト汚染防止というAI事業OSの思想が弱くなる。

そのため、U-FLOW-13では「主戦場切替」ではなく、Role単位の実行環境ルーティングとして設計する。

## 6. Provided PM Decision

PM判断は以下。

* A3：APIチャット中心を継続し、条件に応じてVSCodeへ段階移行
* 「主戦場切替」ではなく「Role単位の実行環境ルーティング」とする
* Migration Gateは強制ではなく推奨判定
* PM overrideを正式ルートとして許可
* VSCode側実行時はコンテキスト汚染防止制約をHandoff Packetに埋め込む
* VSCode側Outputは必ずAPIチャット側Artifactとして再登録する

## 7. Required Design Targets

Designerは以下を設計すること。

### 7.1 execution_env 判定仕様

RoleまたはStepごとに、以下を判定する仕様を設計する。

* api_chat
* vscode
* either

判定には少なくとも以下を使う。

* Role種別
* Step種別
* requires_repo_access
* 添付容量
* 参照Artifact数
* 参照ファイル数
* repo横断参照要否
* ビルド / テスト / 実機確認要否

### 7.2 requires_repo_access 判定仕様

以下のようなケースを判定対象とする。

* 実装ファイルの直接編集が必要
* 複数ファイル横断の依存関係確認が必要
* grep / 差分確認が必要
* ビルドまたはテスト実行が必要
* ランタイムエラーのトレースが必要
* リポジトリ構造を前提にPacketを作る必要がある

### 7.3 Migration Recommendation仕様

Runtimeが以下のいずれかを表示できるようにする。

* APIチャット推奨
* VSCode推奨
* どちらでも可
* PM確認推奨

ただし、推奨は強制ではない。

PM override を可能にする。

### 7.4 Handoff Packet仕様

VSCode / 外部Roleに渡すHandoff Packetの構造を設計する。

Packetには最低限以下を含める。

* Unit ID
* Target Role
* Step ID
* Mission
* Scope
* Input Artifact一覧
* 参照許可ファイル一覧
* 禁止事項
* Pre-Read宣言ルール
* Read Log要求
* Expected Output
* Output Schema
* Return Method
* Ambiguity Handling
* PM override情報

### 7.5 Pre-Read宣言仕様

VSCode側Roleが作業開始前に、読む予定のファイルを宣言するルールを設計する。

設計対象。

* 宣言フォーマット
* 宣言対象
* 宣言外ファイルを読んだ場合の扱い
* 宣言後に追加参照が必要になった場合の扱い

### 7.6 Read Log仕様

VSCode側Roleが実際に読んだファイルをOutputに記録する仕様を設計する。

設計対象。

* Read Logフォーマット
* 必須項目
* Pre-Read宣言との照合観点
* 未記載時の扱い

### 7.7 Violation Fallback仕様

以下の違反時処理を仕様化する。

| 違反              | 処理                   |
| --------------- | -------------------- |
| Pre-Read宣言なし    | Reject → Rework      |
| 宣言外ファイル参照       | Reject → Rework      |
| Read Log未記載     | Reject → 再Handoff    |
| Output Schema違反 | Reject → 再Handoff    |
| 曖昧点を推測で続行       | 差戻し → Handoff Return |
| 移行推奨と異なる環境選択    | 警告。ただしPM override可   |

### 7.8 UI要件

Phase Aで必要なUIを設計する。

候補。

* current_stepに対する実行環境推奨表示
* Role別Handoff Packet生成ボタン
* Packetプレビュー
* Packetコピー
* Packetエクスポート
* PM override操作
* migration reason表示
* required artifacts表示
* allowed files表示

## 8. Out of Scope

Designerは以下を本仕様の主対象にしない。

* VSCode側AIの完全自動操作
* APIチャットとVSCodeの自動連携
* Git操作の自動化
* Runtime Log / Trace完全版
* Review Gate Extension完全版
* Output Schema Validation完全版
* Phase B詳細実装

ただし、Phase Bに接続できるよう、戻りOutputの前提条件は簡潔に定義してよい。

## 9. Expected Output

以下の成果物を作成すること。

File:

U-FLOW-13_Spec_PhaseA_[timestamp].md

Output Type:

Spec

Required Sections:

1. Overview
2. Background
3. Goals
4. Non-Goals
5. Role Execution Routing Design
6. execution_env Definition
7. requires_repo_access Definition
8. Migration Recommendation Logic
9. PM Override Policy
10. Handoff Packet Schema
11. Pre-Read Declaration Design
12. Read Log Design
13. Violation Fallback Design
14. UI Requirements
15. Data Model Impact
16. Runtime Flow
17. Acceptance Criteria
18. Risks
19. Open Questions

## 10. Acceptance Criteria for Designer Output

Designer Outputは以下を満たすこと。

* 「主戦場切替」ではなくRole単位の実行環境ルーティングとして設計されている
* execution_env の値と判定条件が定義されている
* requires_repo_access の判定条件が定義されている
* Migration Recommendationが強制ではなく推奨として定義されている
* PM overrideが正式導線として定義されている
* Handoff Packet Schemaが定義されている
* Pre-Read宣言ルールが定義されている
* Read Log要求が定義されている
* 違反時フォールバックが定義されている
* Phase Aで実装すべきUI要件が定義されている
* Phase Bへ接続可能な前提が整理されている

## 11. Prohibitions

* VSCode完全移行を前提にしない
* 全RoleをVSCode実行前提にしない
* repo全体の無制限参照を許可しない
* PM overrideを禁止しない
* Migration Gateを絶対強制ルールにしない
* 曖昧点を推測で処理する仕様にしない
* Output Schema Validation完全版までスコープを拡大しない
* Runtime Log / Trace完全版までスコープを拡大しない

## 12. Return Instruction

Designerは、上記仕様に基づき U-FLOW-13 Phase A Spec を作成し、PMへ返却すること。

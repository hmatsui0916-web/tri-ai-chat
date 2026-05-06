# U-FLOW-13_PMDecision_Start.md

# U-FLOW-13 PMDecision Start

## 1. Unit ID

U-FLOW-13

## 2. Decision Phase

Start

## 3. Decision

U-FLOW-13 の開始を承認する。

本Unitでは、AI事業OS Flow Runtime における Role Execution Routing / Handoff Runtime を設計・実装対象とする。

従来の「主戦場切替」という表現は採用せず、Role単位で実行環境を判定する仕組みとして整理する。

## 4. Background

U-FLOW-01〜U-FLOW-12 により、Flow Runtime は Human-in-the-loop 型MVPとして運用可能な状態に到達した。

U-FLOW-12 では Artifact Save Runtime が実装され、Role Output貼付、Artifact抽出、保存先提案、Human確認後保存、保存済みArtifactの次Step Input参照、PMDecision命名制御、ReworkInstruction命名制御まで完了した。

今後、開発物が肥大化すると、APIチャットアプリ上での添付・Input管理が容量面で限界に達する可能性が高い。

一方で、最初からVSCode中心に移行すると、AI事業OSの基本思想である Input制御・Role分離・コンテキスト汚染防止が弱くなる。

そのため、本Unitでは APIチャットアプリ中心の運用を維持しつつ、Role特性・Input特性・repo参照要否に応じて、VSCode / 外部Roleへ安全にHandoffする仕組みを整備する。

## 5. Adopted Policy

採用方針は以下。

* A3：APIチャット中心を継続し、条件に応じてVSCodeへ段階移行
* 「主戦場切替」ではなく「Role単位の実行環境ルーティング」として扱う
* Migration Gateは強制ではなく推奨判定とする
* PM overrideを正式ルートとして許可する
* VSCode側実行時はコンテキスト汚染防止制約をHandoff Packetに埋め込む
* VSCode側Outputは必ずAPIチャット側Artifactとして再登録する

## 6. Scope

本Unitの対象は以下。

### Phase A：APIチャット → VSCode / 外部Role

* Role別Handoff Packet生成
* execution_env 判定
* requires_repo_access 判定
* Input容量の実測
* 参照ファイル数の実測
* Migration推奨表示
* 最小コンテキストPacket出力
* Packetワンクリックエクスポート
* Pre-Read宣言ルール付与
* Read Log要求文の埋め込み

### Phase B：VSCode / 外部Role → APIチャット

* 戻りOutputのArtifact再登録
* Packet Schema簡易検証
* 戻りOutput Schema簡易検証
* Read Log妥当性チェック
* 違反時Reject / Rework導線

ただし、初回実装では Phase A を優先し、Phase B はPhase A完了後に設計・実装する。

## 7. Out of Scope

本Unitでは以下を対象外とする。

* VSCode側AIの完全自動操作
* repo全体を無制限にAIへ開放する仕組み
* Human橋渡しの完全自動化
* Runtime Log / Traceの完全実装
* Review Gate Extensionの完全実装
* Output Schema Validationの完全版実装

ただし、Phase Bでは戻りOutputを安全に受け取るための最小限のSchema検証は対象に含める。

## 8. Role Execution Policy

基本方針は以下。

| Role         | 原則実行環境                         |
| ------------ | ------------------------------ |
| PM           | APIチャット                        |
| Designer     | APIチャット                        |
| Integrator-C | APIチャット                        |
| Reviewer     | 原則APIチャット。ただしコードレビュー時のみVSCode可 |
| Integrator-S | ハイブリッド                         |
| Worker       | VSCode                         |
| Debugger     | VSCode                         |
| Infra        | VSCode                         |

Integrator-Sは以下に分割して扱う。

* 論理構造化：APIチャット
* Packet物理化 / repo参照：VSCode

## 9. Context Pollution Prevention Policy

VSCode / 外部RoleへHandoffする場合、以下を必須制約とする。

* 1 Unit / 1 Role / 1 New Chat
* PMが指定したArtifact・ファイルのみ参照
* 参照前にPre-Read宣言を行う
* 実際に読んだファイルをRead LogとしてOutputに記録する
* 宣言外ファイルを根拠にしない
* 曖昧点を推測で続行しない
* 解決不能な曖昧点はHandoff ReturnとしてPMへ戻す
* VSCode側OutputはAPIチャット側Artifactとして再登録する
* PM判断はAPIチャット側で行う

## 10. Violation Fallback Policy

| 違反              | 処理                   |
| --------------- | -------------------- |
| Pre-Read宣言なし    | Reject → Rework      |
| 宣言外ファイル参照       | Reject → Rework      |
| Read Log未記載     | Reject → 再Handoff    |
| Output Schema違反 | Reject → 再Handoff    |
| 曖昧点を推測で続行       | 差戻し → Handoff Return |
| 移行推奨と異なる環境選択    | 警告。ただしPM override可   |

## 11. Initial Application Step

第一適用Stepは、U-FLOW-13内の Worker Step または Debugger Step を候補とする。

理由は、VSCode外部執行が自然であり、Handoff Packet生成・Pre-Read宣言・Read Log要求の有効性を検証しやすいため。

## 12. Acceptance Criteria

本UnitのAcceptance Criteriaは以下。

* Roleごとに execution_env を判定できる
* requires_repo_access を判定できる
* Input容量・参照ファイル数を実測または推定表示できる
* APIチャット継続 / VSCode推奨 / PM override の判断が表示できる
* Role別Handoff Packetを生成できる
* Packetに必要Artifact一覧が含まれる
* PacketにPre-Read宣言ルールが含まれる
* PacketにRead Log要求が含まれる
* PacketをHumanがコピーまたはエクスポートできる
* VSCode側から戻るOutputの受領条件が定義されている
* 違反時フォールバックが仕様化されている

## 13. Next Action

DesignerへU-FLOW-13 Phase Aの仕様設計を依頼する。

作成対象：

U-FLOW-13_DesignerInstruction.md

結論：**A3採用で確定してよい**です。
ただし表現は「主戦場切替」ではなく、**Role単位の実行環境ルーティング**として整理した方が安定します。 

## 合議結論

### 1. 方針

**A3：APIチャット中心を継続しつつ、条件に応じてVSCodeへ段階移行**

で合意。

A1は将来容量・リポジトリ参照で破綻。
A2は早すぎて、コンテキスト汚染防止思想を崩す。
A3が、Flow Runtimeのドッグフーディングと実務対応のバランスが最もよい。

---

### 2. 次Unit

次Unitは、

**U-FLOW-13: Handoff Runtime / Migration Gate**

でよいです。

ただし名称・意味としては、

**Role Execution Routing / Handoff Runtime**

に近い。

目的は「VSCode移行」そのものではなく、

* APIチャットで実行するRole
* VSCodeで実行するRole
* 条件次第で切り替えるRole

を、Role定義・Input特性・実測値から判定し、最小コンテキストのHandoff Packetを生成すること。

---

### 3. 優先順位

合議後の優先順位は以下。

1. **Handoff Runtime / Migration Gate**
2. **Output Schema Validation**
3. **Runtime Log / Trace**
4. **Review Gate Extension**

ただし、**Output Schema Validationの最小版はU-FLOW-13に内包**した方がよいです。
理由は、外部VSCode側から戻るOutputがSchema違反だと、Flowに安全に戻せないため。

---

### 4. 実行環境の基本分担

PM判断として、以下で整理。

| Role         | 原則環境                    |
| ------------ | ----------------------- |
| PM           | APIチャット                 |
| Designer     | APIチャット                 |
| Integrator-C | APIチャット                 |
| Reviewer     | 原則API、コードレビュー時のみVSCode可 |
| Integrator-S | ハイブリッド                  |
| Worker       | VSCode                  |
| Debugger     | VSCode                  |
| Infra        | VSCode                  |

Integrator-Sは分けた方がよいです。

* **Integrator-S 論理構造化**：APIチャット
* **Integrator-S Packet物理化 / repo参照**：VSCode

---

### 5. VSCode移行ゲート

移行条件は以下。

* 添付容量・コンテキスト容量を圧迫する
* 参照ファイル数が多い
* 複数ファイル横断の依存関係確認が必要
* repo検索・差分確認・grepが必要
* ビルド・テスト・実機確認が必要
* Step定義で `requires_repo_access: true`
* Worker / Debugger / Infra 系Step

ただし、これはHumanが毎回悩む判断ではなく、**Role定義メタデータ + Input実測値でRuntimeが推奨判定**する形が望ましい。

---

### 6. コンテキスト汚染防止ルール

VSCode側では最低限これを必須化。

* **1 Unit / 1 Role / 1 New Chat**
* PMが指定したArtifact・ファイルのみ参照
* 読む前に対象ファイルを宣言する
* 実際に読んだファイル一覧をOutputに記録する
* 推測で続行しない
* 曖昧点はPMへHandoff Returnする
* VSCode Outputは必ずAPIチャット側Artifactとして再登録
* PM判断はAPIチャット側で行う

特に重要なのは、**Pre-Read宣言**と**Read Log必須**です。

---

## PM最終判断案

採用方針：

**A3。ただし「主戦場切替」ではなく「Role単位の実行環境ルーティング」として設計する。**

次Unit：

**U-FLOW-13: Handoff Runtime / Migration Gate**

U-FLOW-13に含めるべき最小スコープ：

* Role別Handoff Packet生成
* `execution_env` 判定

  * `api_chat`
  * `vscode`
  * `either`
* `requires_repo_access` 判定
* Input容量・参照ファイル数・依存関係の実測
* VSCode移行推奨表示
* コンテキスト最小化済みPacket出力
* Pre-Read宣言ルール付与
* Read Log要求
* 戻りOutputのArtifact再登録
* Packet / 戻りOutputのSchema簡易検証

これで次へ進めてよいです。

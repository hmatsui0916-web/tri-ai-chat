PM最終判断案、内容として承認します。合議の整理は妥当で、特に以下が良くまとまっています。

- 「Role単位の実行環境ルーティング」へのリフレーミング採用
- Integrator-Sのハイブリッド分割（論理構造化 / Packet物理化）
- Output Schema Validation最小版をU-FLOW-13に内包
- Pre-Read宣言とRead Logの明示

Geminiの「Packetワンクリックエクスポート」提案も、Humanの橋渡し負荷軽減として重要なので吸収すべきです。

その上で、**着手前に詰めておきたい点が3つ**あります。

---

## 1. U-FLOW-13のPhase分割を明示する

最小スコープとはいえ10項目あり、一括着手は重い。以下の分割を推奨します。

**Phase A：行き（API → VSCode）**
- Role別Handoff Packet生成
- `execution_env` / `requires_repo_access` 判定
- Input容量・参照ファイル数の実測
- 移行推奨表示
- コンテキスト最小化Packet出力（ワンクリックエクスポート含む）
- Pre-Read宣言ルール付与
- Read Log要求文の埋め込み

→ Phase A完了時点で「VSCodeに渡す」までは動く状態にする。

**Phase B：戻り（VSCode → API）**
- 戻りOutputのArtifact再登録
- Packet / 戻りOutputのSchema簡易検証
- Read Log妥当性チェック

→ Phase Bを別Step扱いにすることで、行きで一度回してから戻りを設計でき、設計の手戻りが減ります。

---

## 2. 違反時のフォールバック表を先に作る

ルールを定めるだけでは形骸化します。違反検出と処理を表で固定すべきです。

| 違反 | 検出方法 | 処理 |
|---|---|---|
| Pre-Read宣言なし、または宣言外ファイル読込 | Read LogとPre-Read宣言の照合 | 戻りOutput Reject → Rework |
| Read Log未記載 | Output Schema検証 | Reject → 再Handoff |
| 戻りOutput Schema違反 | Schema検証 | Reject → 再Handoff |
| 曖昧点を推測で続行 | Reviewerが検出 | 差戻し → Handoff Return要求 |
| 移行推奨に逆らった環境選択 | PM判断履歴 | 警告のみ（オーバーライド許容） |

最後の1行が重要で、**移行ゲートはハードルールではなく推奨**である以上、PMの override 経路を正式化しておかないと、判定が硬直して逆に事故を生みます。

---

## 3. 第一適用Stepを先に仮決めする

U-FLOW-13は抽象機能なので、**最初に通す具体的なStep**を1本決めて、それで動作検証する設計が安全です。

候補は U-FLOW-13 の直後に来るUnit内の Worker Step か Debugger Step（VSCode側執行が確実に必要なもの）。「どのStepでこのRuntimeを最初に走らせるか」を仮決めしてから入ると、過剰汎化と未使用機能の作り込みを避けられます。

---

## まとめ

PM仮決定案 → 最終決定として進めて問題ありません。
着手前に **(1) Phase分割**、**(2) 違反時フォールバック表**、**(3) 第一適用Stepの仮決め** の3点だけ補強しておくと、U-FLOW-13は「動くだけのRuntime」ではなく「**ルールが効くRuntime**」として完成します。

特に(2)は、思想（コンテキスト汚染防止）を運用に翻訳する核なので、Packet生成機能と同等の優先度で扱う価値があります。
# Tri AI Chat - Variable Columns

v0.17.0-flow-ui

## 機能

- 可変カラム
- 最小1カラム / 最大10カラム
- 初期5カラム
- 4カラムずつページ切替
- カラム追加
- カラム削除（設定＋履歴ごと削除）
- カラムごとに Provider / Model / カラム名を設定
- モデル一覧は `public/models.json` を初期値として読み込み
- UIでモデル一覧JSONを編集・localStorage保存
- カラム別システムプロンプト
- カラム別履歴
- 履歴参照送信
- ファイル添付
- 送信対象カラム選択

## 起動

```powershell
npm install
Copy-Item .env.example .env.local
notepad .env.local
npm run dev
```


## v0.17.0-flow-ui display-options

表示カラム数を1〜10で設定できる機能を追加しました。カラム数が表示数を超える場合はページ切替します。各カラムに表示順セレクトを追加し、ナンバリングで並び替えできます。


## v0.17.0-flow-ui ui-cleanup

表示整理を行いました。デフォルトカラム名を Column 1〜 に変更し、カラム名は編集可能です。設定欄を隠すとProvider/Model選択・表示順・削除・個別system欄を非表示にし、カラム名＋モデル名を残します。全カラム共通のシステムプロンプト欄を追加しました。


## v0.17.0-flow-ui ui-cleanup-fix

前バージョンのlocalStorageに保存された旧カラム名がデフォルト名を上書きする問題に対応するため、「カラム初期化」ボタンを追加しました。押すと Column 1〜5 に戻り、履歴も初期化されます。


## v0.17.0 flow-ui

Flow定義UIを追加しました。FlowはJSONで定義し、localStorageに保存できます。Flow選択ドロップダウンとステッププレビューを表示します。現段階では定義UIのみで、実行エンジンは未実装です。

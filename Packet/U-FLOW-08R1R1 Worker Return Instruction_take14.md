判定：**TC-10 FAILです。main-04を壊したのに、main-04をスキップしてmain-05へ進んでいます。**

現状ログ：

```text
main-03 完了
→ main-04 の実行ログなし
→ main-05 完了
→ main-06 到達
```

期待は逆です。

```text
main-03 完了
→ main-04 が template_unresolved として検出
→ main-04 実行不可
→ main-05へ進まない
→ Guard表示：template_unresolved
```

原因分類：

```text
template_ref解決不備
＋ routing resolver不備
＋ template_unresolved guard不備
```

Worker修正要求：

```text
修正要求：
template_ref未解決stepを検出し、routing対象外または進行停止にすること。

対象：
main-04 の template_ref を "__BROKEN_TEMPLATE_REF_FOR_TC10__" に変更した状態

期待：
- main-03完了後、main-04のtemplate_ref未解決を検出
- main-04を通常処理しない
- main-05へ進まない
- UIに template_unresolved / unresolved template_ref を表示
- 実行ボタン、decisionボタンを表示しない
- Action Logに unresolved template_ref を記録

現在の不具合：
main-04が未解決でも、main-03 → main-05へ進行している。
未解決template stepがrouting上スキップされ、結果としてmain-05へ進めてしまっている。
```

ここは修正必須です。TC-10は再実施が必要です。

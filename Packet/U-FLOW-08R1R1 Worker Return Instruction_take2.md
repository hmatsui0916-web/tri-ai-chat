結論：**この状態ではまだU-FLOW-08は開始不可です。R1実装不足です。**

現状はこうです。

```text
確認できた：
- Flow選択表示はある
- Flow設定ボタンはある
- Runtime パネル非表示ボタンはある

問題：
- Runtime パネルを表示できない
- state / route_context / current_step / next_step が確認できない
- Flowが Full v1.4 ではなく Basic / Steps: 7 に見える
```

判定：

```text
U-FLOW-08R1 事前確認結果

判定：
FAIL / テストハーネスUI未達

原因分類：
UI表示不備
または
Runtimeパネル表示制御不備

理由：
Runtimeパネルが表示されず、TC実行に必要な state / route_context / current_step / next_step / loop counts をHumanが確認できない。
そのため、TC-01以降の操作・判定ができない。

追加懸念：
現在表示されているFlowが「AI Business OS Basic / Steps: 7」であり、U-FLOW-08対象の AI Business OS Full Flow v1.4 ではない可能性がある。
```

Workerへの差し戻し内容はこれです。

```text
修正要求：
Runtimeパネル非表示ボタンを押したら、Runtimeパネルが表示されるように修正する。

最低表示項目：
- flow_id
- version
- state
- route_context
- current_step
- next_step
- loop counts
- branch別loop counts
- current_step完了ボタン
- decision選択UI
- cause_classification選択UI
- Verified条件入力
- Debugger完了ボタン
- Infra完了ボタン
- join状態表示
- guard表示

また、現在選択中Flowが AI Business OS Full Flow v1.4 か判別できる表示を追加する。
```

ここでテスト停止。**U-FLOW-08R1は未完了扱いでWorker差し戻し**が妥当です。

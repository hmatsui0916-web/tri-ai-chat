結論：**まだTC-01開始不可。`current_step` が `(none)` なのに `Next Steps: main-02` になっているのが不整合です。**

期待初期状態はこれです。

```text id="ap344f"
Current State: Draft
Current Route Context: main
Current Step ID: main-01
Next Steps: main-02
Guard: Human Gate 待ち
```

現状：

```text id="cx8ylx"
Current State: Draft
Current Route Context: main
Current Step ID: (none)
Next Steps: main-02
Guard: Human Gate 待ち
```

判定：

```text id="zrgsg0"
U-FLOW-08R1 事前確認結果

判定：
FAIL / Runtime初期step表示不備

原因分類：
routing resolver不備
または
Runtime状態表示不備

理由：
Draft/main の初期状態で current_step が main-01 として表示されず、(none) になっている。
一方で Next Steps が main-02 と表示されており、current_step未設定のまま次stepだけ解決されている。
Humanは main-01 を完了すべきか、main-02へ進むべきか判定できない。
```

Worker差し戻し内容はこれです。

```text id="yvlxx5"
修正要求：
Runtime初期化時に Draft/main の current_step を main-01 に設定または表示すること。

期待表示：
- Current State: Draft
- Current Route Context: main
- Current Step ID: main-01
- Next Steps: main-02
- Guard: Human Gate 待ち

禁止状態：
- Current Step ID: (none) のまま Next Steps: main-02 が出る状態

補足：
もし main-01 をHuman入力開始点として「既に完了済み」扱いにする設計なら、画面上に「main-01完了済み / current_step=main-02」と明示すること。
その場合、Current Step ID は main-02 であるべき。
```

ここはテストを進めず、修正でいいです。

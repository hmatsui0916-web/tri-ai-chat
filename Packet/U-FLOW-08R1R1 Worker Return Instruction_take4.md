結論：**まだ不整合あり。`current_step` と `next_steps` が同じ `main-01` になっています。**

期待値はこれです。

```text
Current State: Draft
Current Route Context: main
Current Step ID: main-01
Next Steps: main-02
Guard: Human Gate 待ち
```

現状：

```text
Current Step ID: main-01
Next Steps: main-01
```

このままだと、**main-01を完了した後にmain-01へ戻る表示**になっており、TC-01の進行判定ができません。

```text
U-FLOW-08R1 事前確認結果

判定：
FAIL / next_step解決不備

原因分類：
routing resolver不備
または
Runtime表示不備

理由：
Draft/main/current_step=main-01 の状態で、Next Steps が main-01 と表示されている。
TC-01では main-01完了後に main-02 へ進む必要があるため、期待next_stepは main-02。
```

Worker修正要求はこれです。

```text
修正要求：
current_step と next_step を分離すること。

期待：
- Current Step ID: main-01
- Next Steps: main-02

禁止：
- Current Step ID: main-01
- Next Steps: main-01

補足：
Next Steps は「現在step完了後の遷移先」を表示する。
現在実行中stepを表示する欄ではない。
```

ここもまだテスト開始せず、修正でいいです。

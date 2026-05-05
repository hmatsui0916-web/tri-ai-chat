判定：**まだFAILです。main-04復帰は確認できましたが、main-07→main-08のjoin制御が未解決です。**

```text
改善：
- main-03 → main-04 → main-05 の経路になった
- main-04がログに出た

残課題：
- main-07で Debugger / Infra 両方完了済み
- それでも Guard: Join 未完了 が残っている
- Current Step ID が main-07 のまま
- main-08へ進めていない
```

原因分類：

```text
parallel / join制御不備
＋ Guard解除不備
＋ UI操作表示不備
```

Workerへの修正要求：

```text
修正要求：
main-07 の parallel task 完了状態を join 判定に反映すること。

期待動作：
1. Debugger完了 → main-07-task-1 completed
2. Infra完了 → main-07-task-2 completed
3. 両方 completed になった時点で Join未完了Guardを解除
4. current_step を main-08 に進める、または Complete main-08 ボタンを表示
5. main-08完了後に ControlReview へ進む

現在の不具合：
Action Log上は Debugger / Infra が両方完了しているのに、Join未完了Guardが解除されない。
```

補足：`main-04` はログ上「Step Completed」だけなので、次回TC-02/TC-03では **pass / conditional / reject の選択UIと分岐**を別途確認が必要です。

結論：**おかしい可能性が高いです。少なくとも、main-04は「単純Complete」ではなく「Decision入力待ちGuard」が必要です。**

`main-04 Reviewer Decision` は、TC-02/TC-03の対象なので、ここでは必ず以下が必要です。

```text
main-04で必要なUI/制御：
- decision_key: review_decision
- pass / conditional / reject の選択UI
- decision未選択では進行不可
- pass → main-05
- conditional → main-05相当のPM経路
- reject → Designer / Designed へ差し戻し
```

なので、厳密には **Human Gate** という名前でなくてもよいですが、実体としては、

```text
Reviewer Decision 待ち
Decision未選択Guard
```

が必要です。

今のログは、

```text
Step Completed: main-04
Reviewed/main → Reviewed/main
Step: main-04
```

だけなので、**decisionを選ばずにmain-04を通過している疑い**があります。これはFAILです。

Workerへの指摘はこうでOKです。

```text
追加修正要求：
main-04 Reviewer Decisionを通常stepとしてCompleteできないようにすること。

期待：
- main-04到達時、pass / conditional / reject のDecision UIを表示
- decision未選択ではComplete不可
- decision選択後のみ遷移可能
- Action Logに選択decisionを記録
  例：Reviewer Decision: pass
- passの場合のみ main-05へ進む
- rejectの場合は Designer / Designed に戻る
- conditionalの場合は PM / Reviewed 経路へ進む

補足：
Human Gateという名称である必要はないが、Decision入力待ちGuardは必須。
```

つまり、**main-04にHuman Gateがないこと自体より、Decision Guardがないことが問題**です。

結論：**TC-01は FAIL 寄りの CONDITIONAL。主経路は Done/main まで到達していますが、途中制御がテスト仕様を満たしていません。**

## 良い点

```text
確認できた：
- main-01 → main-10 まで進行できた
- 最終 state は Done
- 最終 route_context は main
- main-10完了後、Current Step / Next Steps が none
```

ここはTC-01の大枠を満たしています。

## 問題点

```text
問題：
1. main-04 Reviewer Decision がログに存在しない
2. main-07 parallel が Debugger / Infra 並列完了を要求していない
3. main-08 join が両系統完了確認なしで完了している
4. main-06 external_handoff が「Worker手動投入待ち」として区別されていない
5. 全stepで Human Gate Completed が必要になっている
6. main-09 が ControlReview → Approved になっているが、Verified transition確認が明示されていない
```

特に重要なのは **main-04 / main-07 / main-08 / Verified transition** です。
U-FLOW-08 Rev1では、Reviewer Decision、external_handoff、parallel/join、Verified transition が確認対象です。

## TC-01 仮判定

```text
TC-01 Main Route Normal Completion

判定：
CONDITIONAL / 実質FAIL寄り

理由：
Done/main到達は確認できた。
ただし、main-04 Reviewer Decision、main-07 parallel、main-08 join、ControlReview Verified transition が仕様通りに操作・判定された証跡がない。
現状はstepを直列にCompleteしているだけに見える。

原因分類：
routing resolver不備
＋ step type制御不備
＋ parallel / join制御不備
＋ ControlReview resolver不備
＋ Human gate制御不備
```

## 次にWorkerへ直すべきこと

```text
修正要求：
step typeごとの専用制御を実装すること。

必須：
1. main-04 は Reviewer Decision UIを出す
   - pass / conditional / reject
   - pass選択時のみ main-05へ進む

2. main-06 は external_handoff UIを出す
   - Worker手動投入待ち
   - 手動完了後のみ main-07へ進む

3. main-07 は parallel UIを出す
   - Debugger完了
   - Infra完了
   - 片方だけでは main-08へ進まない

4. main-08 は join UIにする
   - Debugger / Infra 両方完了済みの場合のみ完了可能

5. ControlReview / Verified transition を明示する
   - Verified条件入力
   - Verified判定時に state=Verified
   - route_context=main
   - next_step=main-09

6. Human Gateは全step共通ではなく、必要stepだけに限定する
```

この状態ではTC-02以降に進むより、**R1を再修正してからTC-01再実施**が妥当です。

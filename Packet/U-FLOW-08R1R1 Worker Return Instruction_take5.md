結論：**TC-01開始不可です。Runtime表示は出たが、操作UIが未実装です。**

現状：

```text
ある：
- Runtime Reset
- state プルダウン
- route_context プルダウン
- 状態表示
- Guard表示
- Action Log

ない：
- main-01 実行 / 完了ボタン
- Human Gate 完了ボタン
- Next Stepへ進むボタン
- decision選択
- cause_classification選択
- external_handoff手動完了
- Debugger / Infra完了
- join進行
```

判定：

```text
U-FLOW-08R1 事前確認結果

判定：
FAIL / 操作UI未達

原因分類：
UI表示不備
＋ Human gate制御UI不備

理由：
Runtime状態は表示されるが、Humanがcurrent/next stepを完了・進行させる操作UIが存在しない。
そのためTC-01の main-01 Human to PM を完了できず、統合動作確認を開始できない。
```

Workerへの修正要求：

```text
修正要求：
Runtime PanelにFlow進行用の操作UIを追加すること。

最低限必要な操作：
1. Next Step開始 / 完了ボタン
   - Next Steps: main-01 の場合、main-01を実行・完了できること

2. Human Gate完了ボタン
   - Guard: Human Gate 待ち の状態を解除できること

3. decision step用UI
   - pass / conditional / reject を選択できること

4. ControlReview用UI
   - Verified条件入力
   - cause_classification: implementation / specification / environment
   - code_change_required: true / false

5. external_handoff用UI
   - Worker手動投入待ち表示
   - 手動完了ボタン

6. parallel用UI
   - Debugger完了
   - Infra完了

7. join用UI
   - 両系統完了後のみjoin完了可能

補足：
Runtime Resetだけではテストハーネスとして不足。
U-FLOW-08はHumanがUI操作でFlowを進められることが前提。
```

ここでまた停止。**U-FLOW-08R1差し戻し継続**でいいです。

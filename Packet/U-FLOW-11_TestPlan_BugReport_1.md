判定：**TC-01は一部FAILです。Prompt生成はPASS、Role列投入がFAILです。**

整理：

```text
TC-01 / main-01

Prompt生成：PASS
- Role: PM
- Scope: Decision
- role_binding: column / col1
- Prompt内容も正常

Stage to Role Columns：FAIL
- 5カラム初期化済み
- Stage to Role Columns 押下
- Column 1 に反映なし
- 反応なし
```

原因分類：

```text
Chat Runtime連携不備
＋ Role column binding反映不備
＋ Stage to Role Columns UI不備
```

Worker修正要求：

```text
修正要求：
Stage to Role Columns 押下時に、生成済みPromptを role_binding に従って対象Columnへ投入すること。

対象例：
main-01
- Resolved Role: PM
- role_binding: column / col1
- 期待投入先: Column 1

期待動作：
1. Generate PromptでPM Prompt生成
2. Stage to Role Columns押下
3. Column 1 の入力欄または送信待ちPrompt欄にPM Promptが入る
4. Column 1 が「未送信」状態になる
5. API送信は自動実行しない
6. Action LogまたはResultに以下を表示
   - Staged to col1
   - Role: PM
   - Step: main-01

現在の不具合：
Stage to Role Columnsを押してもColumn 1にPromptが投入されない。
押下結果も表示されず、Chat Runtime連携が確認できない。
```

ここはU-FLOW-11の中核なので、**先に修正**が妥当です。
TC-01を進める前に、`Stage to Role Columns` の実装確認をWorkerへ戻しましょう。

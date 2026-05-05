結論：**難しいというより、Workerが `main-04` を通常stepとして処理してしまっています。仕様解釈ミスです。**

今のログは前回と同じで、

`Step Completed: main-04`

しか出ていません。これでは **Reviewer Decision stepとして未実装**です。

## Workerに伝えるべき要点

```text
main-04は通常のComplete Stepではない。
decision stepとして専用処理が必要。

現状NG：
- Step Completed: main-04 だけで通過している
- pass / conditional / reject の選択UIがない
- decision未選択Guardがない
- decision_key: review_decision の使用ログがない

期待：
1. main-04到達時に Complete main-04 を出さない
2. 代わりに decision UI を出す
   - pass
   - conditional
   - reject
3. decision未選択では進行不可
4. pass選択時：
   - Action Log: Reviewer Decision: pass
   - Step: main-04
   - next: main-05
5. reject選択時：
   - Action Log: Reviewer Decision: reject
   - state_to: Designed
   - to: Designer
   - main-05へ進まない
6. conditional選択時：
   - Action Log: Reviewer Decision: conditional
   - state_to: Reviewed
   - next: main-05
```

## Infra判定

```text
U-FLOW-08R1 現状判定：
CONDITIONAL / main-04 decision未達

TC-01：
CONDITIONAL継続

理由：
主経路・parallel/join・Verified transition・Done到達は確認済み。
ただし main-04 Reviewer Decision が通常step扱いのため、Reviewer Decision pass経由の確認が成立していない。
```

ここは **main-04だけをピンポイント修正**でよいです。main-07以降は大枠OKです。

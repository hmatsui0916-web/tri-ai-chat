# U-RUNTIME-V0-05 Debugger Report

File: U-RUNTIME-V0-05_DebuggerReport_ManualResume_20260514.md
Role: Debugger
Scope: U-RUNTIME-V0-05 Manual Resume
Date: 2026-05-14

---

## Decision

PASS

バグは発見されなかった。全検証ケースが正常に動作する。

---

## Summary

- 新規 run は従来どおり PASS。
- 完了済み run からの resume (--from debugger) PASS。
- 失敗 run → ファイル復元 → resume PASS。
- PM からの resume (先頭ロール、prior outputs 不要) PASS。
- 不完全な prior role がある状態での後続 resume は明確なエラーで拒否 PASS。
- 無効ロール名・存在しない run folder・引数不足のエラーハンドリング PASS。
- `npm run build` PASS。

---

## Bugs Found

なし。

---

## Verification

### 正常系新規 run

- Command: `npm run workflow -- input/request.md`
- Result: PASS、`runs/20260514-093526-970`

### 完了済み run からの resume

- Command: `npm run workflow -- --resume runs/20260514-093526-970 --from debugger`
- Result: PASS
- 確認:
  - 同一 run folder を再利用
  - PM〜Worker のレコード保持（4件）
  - Debugger〜Integrator-C を再実行（2件）
  - `resume_history: [{ from_role: "debugger", ... }]`
  - `status: "completed"`, `completed_steps: 6`, `failed_step: null`
  - `final_output_path` が integrator-c.output.md を指す

### 失敗 run からの resume

- Method: `debugger.md` を一時退避 → 失敗 run 生成 → 復元 → resume
- Failed run: `runs/20260514-093557-889`
- Command: `npm run workflow -- --resume runs/20260514-093557-889 --from debugger`
- Result: PASS
- 確認:
  - `error: null`、`failed_step: null` にクリア
  - debugger と integrator-c が再実行、`status: "completed"`
  - PM〜Worker の既存出力ファイルを読み込んで前コンテキストとして引き継ぎ

### PM からの resume（先頭ロール）

- Command: `npm run workflow -- --resume runs/20260514-093557-889 --from pm`
- Result: PASS
- 確認:
  - prior outputs が空の状態で PM から全ロールを再実行
  - `resume_history` に2件目のエントリが追加される

### 不完全な prior role がある状態での後続 resume

- Setup: `debugger.md` 欠損で `runs/20260514-093659-290` を失敗させた状態
- Command: `npm run workflow -- --resume runs/20260514-093659-290 --from integrator-c`
- Result: エラーで正しく拒否
- Output: `Cannot resume from step 6; prior role "debugger" is not completed.`
- 確認: `run.json` は変更されない（validation failure はディスクに書かない）

### エラーハンドリング

| ケース | コマンド | 結果 |
| :--- | :--- | :--- |
| 無効ロール名 | `--from unknown-role` | `Unknown role "unknown-role". Valid roles: pm, ...` |
| 存在しない run folder | `--resume runs/nonexistent-run --from debugger` | ENOENT on run.json |
| `--resume` 引数不足 | `--resume` のみ | `Resume target and --from role are required. Usage: ...` |

### ビルド回帰確認

- Command: `npm run build`
- Result: PASS

---

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| 失敗 run を最初からやり直さなくていい | PASS | `--from debugger` で 4 件の prior outputs を引き継いで再実行 |
| Resume がファイルベースで完結する | PASS | `run.json` と role output files のみ使用 |
| Branch / Reopen / Fork lifecycle が導入されていない | PASS | 同一 run folder を直接更新するのみ |
| 前ロールの完了出力を resumed role が受け取る | PASS | collectPreviousOutputs が output_path を読み込んで PreviousRoleOutput に変換 |
| 既存 run folder を再利用する | PASS | resume は既存フォルダ内の run.json を上書き |
| 不正 resume が明確なエラーで拒否される | PASS | prior role 未完了・無効ロール名・引数不足すべて PASS |
| validation 失敗時に run.json が変更されない | PASS | `prepareRunLogForResume` は `collectPreviousOutputs` 成功後にのみ呼ばれる |
| `npm run build` PASS | PASS | 既存アプリへの影響なし |

---

## Observations（スコープ外・次 Unit 向けメモ）

| # | 観察 | 推奨アクション |
| :--- | :--- | :--- |
| 1 | prior role 未完了エラーのメッセージが `Cannot resume from step 6; prior role "debugger" is not completed.` と表示され、ユーザーが指定した role 名ではなく step 番号が見える。ユーザーは「integrator-c」を指定したのに「step 6」と返ってくる。 | UX 改善: `collectPreviousOutputs` に from-role 名を渡してエラーメッセージを `Cannot resume from "integrator-c"...` に変更することを次 Unit 機会があれば対応。 |
| 2 | 存在しない run folder の resume エラーが `ENOENT: no such file or directory, open '...run.json'` と raw Node.js エラーのまま表示される。 | `readRunLog` に try/catch を追加して `Unable to read run log from "${runFolder}"` と包むと UX が改善される。 |
| 3 | Resume 時に古いロールの prompt/output ファイルが残存する（上書きはされるが失敗した場合は stale ファイルが残る）。Worker Report も同様に観察・許容済み。 | `run.json` が authoritativeなので v0 では許容。 |

---

## Read Log

| file_path | reason_for_reading | timestamp |
| :--- | :--- | :--- |
| `Packet/Remake_Project/U-RUNTIME-V0-05_ImplementationReport_ManualResume_20260514.md` | Worker Report 確認 | 2026-05-14 |
| `runtime/workflow.ts` | 全実装確認（parseCliArgs, resolveRunFolder, findRole, readRunLog, collectPreviousOutputs, prepareRunLogForResume, main） | 2026-05-14 |
| `runs/20260514-093526-970/run.json` | resume 後 run.json 確認 | 2026-05-14 |
| `runs/20260514-093557-889/run.json` | 失敗 run → resume 後 run.json 確認 | 2026-05-14 |

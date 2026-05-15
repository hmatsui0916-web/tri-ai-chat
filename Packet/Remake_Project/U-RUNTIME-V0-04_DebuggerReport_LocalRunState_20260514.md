# U-RUNTIME-V0-04 Debugger Report

File: U-RUNTIME-V0-04_DebuggerReport_LocalRunState_20260514.md
Role: Debugger
Scope: U-RUNTIME-V0-04 Local Run State
Date: 2026-05-14

---

## Decision

PASS with fix applied

---

## Summary

- 1件の Medium バグを発見・修正した。
- failure path で role instruction 読み込みが失敗した場合、`run.json` の `prompt_path` / `output_path` が存在しないファイルを指していた。
- 修正: `prompt_path` / `output_path` を実際にファイルを書き込んだ後にのみ設定するよう変更。失敗時は `null` となり、ファイル未生成を正確に反映。
- 修正後、正常系・failure path・`npm run build` すべて PASS。

---

## Bug Found and Fixed

### Bug 1 — 失敗したロールの `prompt_path` / `output_path` が存在しないファイルを指す（Medium）

**問題:**

`RunRoleRecord` の `prompt_path` と `output_path` はロール開始時（role instruction 読み込みより前）に設定されていた。

```
roleRecord = { prompt_path: "runs/.../05-debugger.prompt.md", ... }  // ← ここで設定
runLog.roles.push(roleRecord)
writeRunLog()                  // run.json に path を書く
readFile(debugger.md)          // ← ここで失敗
writeFile(prompt)              // ← 実行されない
```

role instruction 読み込みに失敗した場合（例: `debugger.md` が欠損）:
- `05-debugger.prompt.md` は生成されない
- `05-debugger.output.md` は生成されない
- しかし `run.json` には両ファイルのパスが記録される

**失敗 run の実際のファイル一覧（修正前）:**
```
01-pm.output.md   01-pm.prompt.md
02-designer.output.md   02-designer.prompt.md
03-reviewer.output.md   03-reviewer.prompt.md
04-worker.output.md   04-worker.prompt.md
run.json
# 05-debugger.*.md は存在しない
```

**問題の影響:**
- `run.json` を読んだユーザーが `05-debugger.prompt.md` を開こうとしてファイルが見つからない
- U-RUNTIME-V0-05 (Manual Resume) が `prompt_path` を利用してファイルを読もうとした場合に ENOENT エラーが発生する

**修正:**

`RunRoleRecord.prompt_path` / `output_path` の型を `string | null` に変更し、ロール開始時は `null` で初期化。ファイルを実際に書き込んだ直後にパスを設定するよう変更。

```ts
// 修正前
const roleRecord: RunRoleRecord = {
  prompt_path: toWorkspacePath(promptPath),  // 書く前に設定
  output_path: toWorkspacePath(outputPath),  // 書く前に設定
  ...
};

// 修正後
const roleRecord: RunRoleRecord = {
  prompt_path: null,  // 書く前は null
  output_path: null,  // 書く前は null
  ...
};

await writeFile(promptPath, prompt, "utf8");
roleRecord.prompt_path = toWorkspacePath(promptPath);  // 書いた後に設定

await writeFile(outputPath, output, "utf8");
roleRecord.output_path = toWorkspacePath(outputPath);  // 書いた後に設定
```

---

## Changed Files

| ファイル | 変更内容 |
| :--- | :--- |
| `runtime/workflow.ts` | `RunRoleRecord.prompt_path` / `output_path` を `string \| null` に変更、ファイル書き込み後にのみパスを設定 |

---

## Verification

### 正常系

- Command: `npm run workflow -- input/request.md`
- Result: PASS
- Run folder: `runs/20260514-092848-518`
- 確認: `pm.prompt_path = "runs/.../01-pm.prompt.md"` ✓（ファイル存在）
- 確認: `integrator-c.output_path = "runs/.../06-integrator-c.output.md"` ✓（ファイル存在）
- 確認: `final_output_path` = integrator-c の output_path と一致 ✓

### Failure path — debugger.md 欠損

- Method: `runtime/roles/debugger.md` を一時リネームして実行後、即復元
- Run folder: `runs/20260514-092900-703`
- **修正前**: debugger role の `prompt_path` に存在しないパスが記録される
- **修正後**: debugger role の `prompt_path: null` / `output_path: null` — ファイル未生成を正確に反映

```json
{
  "role": "debugger",
  "status": "failed",
  "prompt_path": null,
  "output_path": null,
  "started_at": "...",
  "finished_at": "...",
  "duration_ms": 0
}
```

### ビルド回帰確認

- Command: `npm run build`
- Result: PASS

---

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| A Human can see what ran | PASS | `run_id`, `run_folder`, role records |
| A Human can see what succeeded | PASS | `completed_steps`, per-role `status` / `duration_ms` |
| A Human can see where it stopped | PASS | `current_role`, `failed_step`, error message |
| `prompt_path` / `output_path` は実在するファイルのみを指す | PASS | 修正後に確認 |
| Existing run folders are not overwritten | PASS | 既存の unique folder 生成ロジック維持 |
| No DB layer is introduced | PASS | 状態は `runs/{run_id}/run.json` のみ |
| `npm run build` PASS | PASS | Next.js アプリへの影響なし |

---

## Observations（スコープ外・次 Unit 向けメモ）

| # | 観察 | 推奨アクション |
| :--- | :--- | :--- |
| 1 | `writeRunLog` が `runLog.last_updated_at` を副作用で書き換えている。"write" 関数が引数を変更するのは意図が分かりにくい。 | v0 では許容。将来クリーンアップする際は pure write + timestamp 計算分離を検討。 |
| 2 | 失敗ロールで `prompt_path: null` の場合、そのロールのプロンプトは生成されていない。Resume 時にはロール実行を先頭（role instruction 読み込み）から再試行する必要がある。 | U-RUNTIME-V0-05 (Manual Resume) の設計時に `prompt_path: null` を「プロンプト未生成」のシグナルとして扱うよう実装する。 |
| 3 | `duration_ms` は mock 実行では 0〜数 ms 程度。実 executor 導入後に意味を持つ。 | 許容。 |

---

## Read Log

| file_path | reason_for_reading | timestamp |
| :--- | :--- | :--- |
| `Packet/Remake_Project/U-RUNTIME-V0-04_ImplementationReport_LocalRunState_20260514.md` | Worker Report 確認 | 2026-05-14 |
| `runtime/workflow.ts` | 新フィールド・failure path 実装確認 | 2026-05-14 |
| `runs/20260514-092655-825/run.json` | 正常系 run.json 全フィールド確認 | 2026-05-14 |
| `runs/20260514-092714-085/run.json` | 修正前 failure path run.json 確認 | 2026-05-14 |
| `runs/20260514-092900-703/run.json` | 修正後 failure path run.json 確認 | 2026-05-14 |

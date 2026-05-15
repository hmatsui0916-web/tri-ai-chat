# U-RUNTIME-V1-01 Debugger Report

File: U-RUNTIME-V1-01_DebuggerReport_ExternalAIExecutorSmoke_20260514.md
Role: Debugger
Scope: U-RUNTIME-V1-01 External AI Executor Smoke Integration
Date: 2026-05-14

---

## Decision

PASS

バグは発見されなかった。全検証ケースが期待動作を示す。

---

## Summary

- `runtime/roleExecutor.ts` および `runtime/workflow.ts` の変更を確認。
- mock executor の回帰なし。
- codex executor は Worker Report 済みの run.json で実行を確認（PM duration 9874ms、mock 比で材料的に長い）。
- claude / gemini は本環境で CLI 未検出。`spawn ENOENT` が `error` イベントで正しく捕捉され、`run.json` に失敗状態として記録される。
- `prompt_path` は失敗時も設定済み（prompt 書き込み後にエグゼキュータを呼ぶ設計が正しく機能）。
- `output_path` は失敗時 `null`（出力なし時は設定しない V0-04 の設計が維持）。
- `npm run build` PASS。

---

## Bugs Found

なし。

---

## Code Review Points

### `runExternalExecutor` のダブルリジェクト可能性（非ブロッキング）

`spawn` が ENOENT で失敗した場合、Node.js は `error` イベントと `close` イベントの両方を発火する。

```
child.on("error", ...)  → reject(ENOENT メッセージ)
child.on("close", ...)  → close 側でも code !== 0 (null !== 0 = true) を通過し reject を試みる
```

Promise は 2 回目の reject を無視するため**機能的バグではない**。ただし `close` 側の reject メッセージ（"exited with code null"）が混入する可能性が理論上残る。実際のテストでは正しいエラーメッセージのみ出力されている。

推奨: 将来の可読性向上のため、`rejected` フラグで二重発火を防ぐか、`close` ハンドラで `code === null` をスキップする条件を追加する。ただし v1-01 スコープでは対応不要。

### `gemini` の stdin 受信方法が未確認（非ブロッキング）

`gemini` アダプタは引数なしでプロセスを起動し、stdin からプロンプトを読む前提となっている。`gemini` CLI が stdin モードを引数なしでサポートするかは CLI インストール後に確認が必要。

### `claude` `-p` フラグの適切性

`claude -p` は Claude Code CLI の print モード（非インタラクティブ、stdin 読み取り）として正しい形状。

---

## Verification

### Mock Regression

- Command: `npm.cmd run workflow -- input/request.md`
- Result: PASS
- Run folder: `runs/20260514-112641-390`
- `status: "completed"` / `completed_steps: 6` / `failed_step: null` ✓
- 全 6 ロール完了、`final_output_path` 設定済み ✓

### Codex Executor Smoke（Worker Report 確認）

- Run folder: `runs/20260514-112216-152`
- Result: PASS（Worker Report 済み、run.json で追確認）
- `executor: "codex"` / `external_role: "pm"` ✓
- PM duration: 9874ms（mock 比で材料的に長く、subprocess 実行を示す）✓
- Designer〜Integrator-C は mock 実行（2〜8ms）✓
- `completed_steps: 6` / `failed_step: null` ✓

### Claude Executor Failure Path

- Command: `npm.cmd run workflow -- input/request.md --executor claude`
- Result: Expected PASS（CLI 未検出による期待失敗）
- Run folder: `runs/20260514-112653-136`

確認項目:

| 項目 | 期待値 | 実値 |
| :--- | :--- | :--- |
| `executor` | `"claude"` | `"claude"` ✓ |
| `external_role` | `"pm"` | `"pm"` ✓ |
| `status` | `"failed"` | `"failed"` ✓ |
| `current_role` | `"pm"` | `"pm"` ✓ |
| `failed_step` | `1` | `1` ✓ |
| `output_path` | `null` | `null` ✓ |
| `prompt_path` | 設定済み | `"runs/.../01-pm.prompt.md"` ✓ |
| `error.message` | ENOENT 含む | `spawn claude ENOENT` ✓ |
| `completed_steps` | `0` | `0` ✓ |

### Gemini Executor Failure Path

- Command: `npm.cmd run workflow -- input/request.md --executor gemini`
- Result: Expected PASS（CLI 未検出による期待失敗）
- Run folder: `runs/20260514-112655-414`

確認項目:

| 項目 | 期待値 | 実値 |
| :--- | :--- | :--- |
| `executor` | `"gemini"` | `"gemini"` ✓ |
| `external_role` | `"pm"` | `"pm"` ✓ |
| `status` | `"failed"` | `"failed"` ✓ |
| `current_role` | `"pm"` | `"pm"` ✓ |
| `failed_step` | `1` | `1` ✓ |
| `output_path` | `null` | `null` ✓ |
| `prompt_path` | 設定済み | `"runs/.../01-pm.prompt.md"` ✓ |
| `error.message` | ENOENT 含む | `spawn gemini ENOENT` ✓ |
| `completed_steps` | `0` | `0` ✓ |

### ビルド回帰確認

- Command: `npm.cmd run build`
- Result: PASS

---

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| mock executor が変更なしで動作する | PASS | `completed_steps: 6` ✓ |
| external executor adapter が存在する | PASS | codex / claude / gemini ブランチ ✓ |
| codex executor が PM 出力を生成する | PASS | Worker Report 確認、duration 差で実行証明 |
| run.json に executor メタデータが記録される | PASS | `executor`, `external_role` フィールド ✓ |
| 外部 executor 失敗が run.json に記録される | PASS | claude / gemini ともに ENOENT 失敗を正確に記録 |
| `output_path: null`（失敗時） | PASS | 両失敗 run で null ✓ |
| `prompt_path` 設定済み（失敗時） | PASS | prompt 書き込み後にエグゼキュータ呼び出しの設計が正しく機能 |
| `npm run build` PASS | PASS | Next.js アプリへの影響なし |

---

## Provider Status

| Provider | CLI 検出 | 実行結果 | 備考 |
| :--- | :--- | :--- | :--- |
| Codex | 本 Debugger セッション時は未検出（Worker 実行時は検出済み） | PASS | Worker Report の run.json で確認 |
| Claude Code | 未検出 | Expected FAIL | ENOENT 正常捕捉、run.json 正確記録 |
| Gemini Code Assist | 未検出 | Expected FAIL | ENOENT 正常捕捉、run.json 正確記録 |

---

## Observations（次フェーズ向けメモ）

| # | 観察 | 推奨アクション |
| :--- | :--- | :--- |
| 1 | `runExternalExecutor` で `error` と `close` が両方発火する場合（ENOENT）、Promise の二重 reject が発生しうる。現状は非機能的だが将来の混乱を防ぐため `rejected` フラグ追加を推奨。 | V1-02 または別クリーンアップ Unit で対応。 |
| 2 | `gemini` アダプタの引数なし stdin 読み取りは CLI インストール後に動作確認が必要。`--prompt -` 等のフラグが必要になる可能性あり。 | Gemini Smoke Unit で確認。 |
| 3 | V1-01 は PM ロールのみ外部実行。全ロールを外部 executor で動かす Multi-Role External Execution は未実装（スコープ外）。 | 将来 Unit の対象。 |

---

## v1 進捗状態

| Unit | 内容 | Debugger 判定 |
| :--- | :--- | :--- |
| U-RUNTIME-V1-01 | External AI Executor Smoke | PASS（バグなし） |

---

## Read Log

| file_path | reason_for_reading | timestamp |
| :--- | :--- | :--- |
| `Packet/Remake_Project/U-RUNTIME-V1-01_ImplementationReport_ExternalAIExecutorSmoke_20260514.md` | Worker Report 確認 | 2026-05-14 |
| `runtime/roleExecutor.ts` | executor アダプタ実装確認 | 2026-05-14 |
| `runtime/workflow.ts` | executor 選択ロジック確認 | 2026-05-14 |
| `runs/20260514-112641-390/run.json` | mock 回帰確認 | 2026-05-14 |
| `runs/20260514-112216-152/run.json` | codex smoke 実行確認 | 2026-05-14 |
| `runs/20260514-112653-136/run.json` | claude 失敗パス確認 | 2026-05-14 |
| `runs/20260514-112655-414/run.json` | gemini 失敗パス確認 | 2026-05-14 |

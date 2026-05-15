# U-RUNTIME-V0-03 Debugger Report

File: U-RUNTIME-V0-03_DebuggerReport_PromptTemplateLoader_20260514.md
Role: Debugger
Scope: U-RUNTIME-V0-03 Prompt Template Loader
Date: 2026-05-14

---

## Decision

PASS with fix applied

---

## Summary

- 1件の Medium バグを発見・修正した。
- テンプレートファイル欠損時に孤立 run フォルダが生成され、`run.json` が一切書き込まれないという failure path の抜け。
- 修正: テンプレート読み込みを `createUniqueRunFolder()` の前に移動し、入力ファイル読み込みと同じパターンで fail-fast 化。
- 修正後、正常系・failure path・`npm run build` すべて PASS。

---

## Bug Found and Fixed

### Bug 1 — テンプレート欠損時に孤立 run フォルダが生成され `run.json` が書かれない（Medium）

**問題:**

[runtime/workflow.ts](runtime/workflow.ts) で、`promptTemplate` の `readFile` が `createUniqueRunFolder()` の後かつ `writeRunLog()` の前に配置されていた。

```
createUniqueRunFolder()   // run フォルダ生成
↓
readFile(role-run.md)     // ← ここで失敗すると...
↓
writeRunLog()             // ← 一度も呼ばれない
```

テンプレートが欠損している場合:
1. run フォルダが生成される（孤立フォルダ）
2. `run.json` が一切書き込まれない（`status: failed` の記録なし）
3. エラーは stderr のみに出力される（`ENOENT: no such file or directory`）
4. ユーザーはどの run が失敗したか run フォルダを見ても判断できない

これは `runtime/roles/*.md` の欠損（U-RUNTIME-V0-01 で failure path 検証済み）とは異なり、`run.json` の初回書き込みすら行われない。

**修正:**

テンプレート読み込みを `createUniqueRunFolder()` の**前**に移動し、入力ファイルと同じ fail-fast パターンを適用。

```ts
// 修正前
const { runId, runFolder } = await createUniqueRunFolder();
// ... runLog 初期化 ...
const promptTemplate = await readFile(...);  // ← フォルダ生成後
await writeRunLog(runFolder, runLog);

// 修正後
try {
  promptTemplate = await readFile(
    path.join(runtimeDir, "templates", "role-run.md"),
    "utf8",
  );
} catch (error) {
  throw new Error(`Unable to read prompt template: ${message}`);
}
const { runId, runFolder } = await createUniqueRunFolder();  // ← 検証後
// ... runLog 初期化 ...
await writeRunLog(runFolder, runLog);
```

テンプレート欠損時のエラーメッセージも `Unable to read prompt template: ENOENT...` と明確になった。

---

## Changed Files

| ファイル | 変更内容 |
| :--- | :--- |
| `runtime/workflow.ts` | `promptTemplate` 読み込みを `createUniqueRunFolder()` の前に移動、エラーメッセージを追加 |

---

## Verification

### 正常系

- Command: `npm run workflow -- input/request.md`
- Result: PASS（警告なし）
- Run folder: `runs/20260514-091813-343`
- 確認: `01-pm.prompt.md` に `## Role Contract` > `### Input Contract` / `### Output Contract` が独立セクションとして生成されている

### Failure path — テンプレート欠損

- Method: `runtime/templates/role-run.md` を一時リネームして実行後、即復元
- **修正前**: 孤立 run フォルダ（`runs/20260514-091742-594`）が生成され、フォルダ内は空（`run.json` なし）
- **修正後**: run フォルダは生成されず、`Unable to read prompt template: ENOENT...` のみ出力
- Result: PASS

### ビルド回帰確認

- Command: `npm run build`
- Result: PASS

---

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| Prompt shape は template ファイルから読み込まれる | PASS | `runtime/templates/role-run.md` |
| 生成 prompt ファイルが検査可能 | PASS | `runs/{run_id}/` に出力 |
| Role Contract が独立した prompt セクションとして存在する | PASS | `### Input Contract` / `### Output Contract` が抽出・配置される |
| U-RUNTIME-V0-02 の命名観察が対処された | PASS | `## Role Contract` セクションとして prompt に独立配置 |
| テンプレート欠損で孤立 run フォルダが生成されない | PASS | 修正後に確認 |
| スコープが v0-minimal に収まっている | PASS | DB / Snapshot / Decision lifecycle / UI なし |
| `npm run build` PASS | PASS | Next.js アプリへの影響なし |

---

## Observations（スコープ外・次 Unit 向けメモ）

| # | 観察 | 推奨アクション |
| :--- | :--- | :--- |
| 1 | `extractSection` の正規表現は `## ` レベルのヘッディングを terminator として使用する。Role ファイルに `## ` 以外のヘッディング（`###` など）が混在しても安全に動作するが、`## ` ヘッディングの命名変更はコントラクト抽出に直接影響する。 | role ファイルの `## Input Contract` / `## Output Contract` / `## Role Focus` のヘッディング名を安定させ、v0 中は変更しない。 |
| 2 | テンプレート内の `{{roleName}}` は Required Output Shape のコードブロック内でも置換される。これは意図的（正しい）だが、テンプレートにリテラルの `{{...}}` を追加する場合は意図せず置換される可能性がある。 | v0 では許容。将来テンプレートを拡張する際は注意。 |
| 3 | Role Instruction の内容はプロンプト内に2回現れる（`## Role Contract` セクションとして抽出された部分 + `## Role Instruction` セクション全体）。 | 実行可能性と検査容易性のトレードオフとして許容。実 executor でプロンプトサイズが問題になれば `## Role Instruction` セクションの省略を検討。 |

---

## Read Log

| file_path | reason_for_reading | timestamp |
| :--- | :--- | :--- |
| `Packet/Remake_Project/U-RUNTIME-V0-03_ImplementationReport_PromptTemplateLoader_20260514.md` | Worker Report 確認 | 2026-05-14 |
| `runtime/templates/role-run.md` | テンプレート内容確認 | 2026-05-14 |
| `runtime/promptBuilder.ts` | extractSection / renderTemplate 実装確認 | 2026-05-14 |
| `runtime/workflow.ts` | template 読み込み順序確認 | 2026-05-14 |
| `runtime/roles/pm.md` | Role Focus 追加確認 | 2026-05-14 |
| `runtime/roles/debugger.md` | Role Focus 追加確認 | 2026-05-14 |
| `runtime/roles/integrator-c.md` | Role Focus 追加確認 | 2026-05-14 |
| `runs/20260514-091718-107/01-pm.prompt.md` | 修正前 prompt 生成内容確認 | 2026-05-14 |
| `runs/20260514-091742-594/` | 修正前 failure path — 孤立フォルダ確認 | 2026-05-14 |
| `runs/20260514-091813-343/` | 修正後 正常系確認 | 2026-05-14 |

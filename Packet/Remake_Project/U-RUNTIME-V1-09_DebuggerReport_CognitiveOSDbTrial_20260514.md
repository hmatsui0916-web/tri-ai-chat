# U-RUNTIME-V1-09 Debugger Report

File: U-RUNTIME-V1-09_DebuggerReport_CognitiveOSDbTrial_20260514.md
Role: Debugger
Scope: CognitiveOS DB Trial
Date: 2026-05-14

---

## Decision

PASS（1件修正済み）

`init` コマンドが冪等でなく既存 DB を上書きするバグを発見・修正した。修正後は全 CLI コマンドが期待通りに動作する。

---

## Summary

- `runtime/cognitiveDb.ts` / `runtime/cognitiveDbCli.ts` / `package.json` の変更を確認。
- `cognitiveDbCli.ts` に `// @ts-ignore` が使われているが、型付きインポートが直接動作する環境では許容範囲。
- **Bug 修正**: `init` コマンドが再実行時に `reference.json` を空の状態に上書きし、ingested documents が消去されていた。`writeJsonIfAbsent` ヘルパーを追加し、既存ファイルがある場合はスキップするよう修正した。
- 修正後に `init → status` を実行し、`Reference documents: 4` が維持されることを確認 ✓
- `status` / `ingest-inputs` / `export-summary` は正常動作 ✓
- `npm run build` PASS ✓

---

## Bugs Found

### Bug 1 — `init` が DB を無条件上書きし、冪等でない（修正済み）

**場所**: `runtime/cognitiveDb.ts` の `initCognitiveDb()` 関数

**症状**:
```text
# init 前
Reference documents: 4

# init 再実行後
Reference documents: 0  ← 全消去
```

**原因**: `initCognitiveDb()` が `writeJson` を使って `manifest.json` / `working.json` / `reference.json` / `decision.json` を**常に上書き**していた。

```typescript
// 修正前（問題のあるコード）
await writeJson(paths.manifest, manifest);
await writeJson(paths.workingDb, workingDb);
await writeJson(paths.referenceDb, referenceDb);  // ← 既存 documents を消去
await writeJson(paths.decisionDb, decisionDb);
```

**修正内容**: `writeJsonIfAbsent` ヘルパーを追加し、ファイルが存在する場合はスキップするよう変更。

```typescript
// 追加したヘルパー
async function writeJsonIfAbsent(filePath: string, value: unknown): Promise<void> {
  try {
    await readFile(filePath, "utf8");
  } catch {
    await writeJson(filePath, value);
  }
}

// 修正後
await writeJsonIfAbsent(paths.manifest, manifest);
await writeJsonIfAbsent(paths.workingDb, workingDb);
await writeJsonIfAbsent(paths.referenceDb, referenceDb);
await writeJsonIfAbsent(paths.decisionDb, decisionDb);
```

**修正後確認**:
```text
# init → init（再実行）→ status
Reference documents: 4  ← ingested documents が維持される ✓
```

---

## Code Review Points

### `cognitiveDbCli.ts` の `// @ts-ignore`（確認・許容）

```typescript
// @ts-ignore Node 24 runs this local CLI directly from TypeScript source.
import { ... } from "./cognitiveDb.ts";
```

Node 24 + `--experimental-strip-types` で `.ts` 拡張子付きのローカルインポートが動作する環境。コメントに理由が記載されており意図的。他の runtime ファイル（`workflow.ts` 等）と一貫した動作 ✓

### `stableId` / `sha256` の実装（確認）

```typescript
function stableId(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}
```

`stableId` はファイルパスから決定的な ID を生成する。同じ入力パスは常に同じ ID になり、`ingest-inputs` を複数回実行しても同じ ID が上書き更新される（`existingById` によるマージ）。重複排除が正しく機能 ✓

### `ingestCognitiveOsInputFiles` の重複排除（確認）

```typescript
const existingById = new Map(referenceDb.documents.map((entry) => [entry.id, entry]));
for (const document of documents) {
  existingById.set(document.id, document);
}
referenceDb.documents = [...existingById.values()].sort((a, b) => a.id.localeCompare(b.id));
```

既存ドキュメントと新規ドキュメントを ID でマージし、重複があれば新しい方で上書き。`ingest-inputs` を複数回実行しても安全 ✓

### `ensureInitialized` の動作（確認）

```typescript
async function ensureInitialized(): Promise<void> {
  const paths = cognitiveDbPaths();
  try {
    await readFile(paths.manifest, "utf8");
  } catch {
    await initCognitiveDb();
  }
}
```

`manifest.json` の存在のみでチェック。`status` / `ingest-inputs` / `export-summary` のような read/write 操作は必ずこれを経由するため、DB が未初期化の場合も安全 ✓

### `classifyReferenceKind` のフォールバック（確認）

日本語ファイル名（`CognitiveOS_DB化検討.md`）はキーワードがマッチしないため `db_phase_material` にフォールバック。実際の ingestion 結果と一致 ✓

### `DecisionDb.status` フィールド名の重複（観察）

`DecisionDb` 型には `status: "trial"` と `pending_decisions[n].status: "pending_human_decision"` が両方存在する。同名フィールドが 2 箇所あるが、スコープが別なので型定義上の問題はない ✓

---

## Verification

### status（修正後）

```text
Workspace: C:\AI_Bussiness_OS\tri-ai-chat-flow-ui\CognitiveOS_Runtime_Workspace
Working snapshots: 0
Reference documents: 4
Pending decisions: 10
Human decisions: 0
```

✓

### init 冪等性テスト（修正後）

1. `ingest-inputs` 実行 → Reference documents: 4
2. `init` 再実行
3. `status` 確認 → Reference documents: 4 ✓（修正前は 0 になっていた）

### export-summary

- Command: `npm.cmd run cognitive-db -- export-summary`
- Result: PASS
- Output: `CognitiveOS_Runtime_Workspace/exports/cognitive-os-db-summary.md` ✓

### Build

- Command: `npm.cmd run build`
- Result: PASS（修正後）

### Workspace ファイル確認

| Path | 状態 |
| :--- | :--- |
| `CognitiveOS_Runtime_Workspace/manifest.json` | ✓ |
| `CognitiveOS_Runtime_Workspace/db/working.json` | ✓ |
| `CognitiveOS_Runtime_Workspace/db/reference.json` | ✓ (4 documents) |
| `CognitiveOS_Runtime_Workspace/db/decision.json` | ✓ (10 pending) |
| `CognitiveOS_Runtime_Workspace/db/reference_documents/` | ✓ (4 files) |
| `CognitiveOS_Runtime_Workspace/exports/cognitive-os-db-summary.md` | ✓ |

---

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| CognitiveOS workspace is created | PASS | `CognitiveOS_Runtime_Workspace/` ✓ |
| 3-layer DB exists | PASS | `working.json`, `reference.json`, `decision.json` ✓ |
| 4 CognitiveOS files are ingested | PASS | Reference DB contains 4 documents ✓ |
| Reference document copies are preserved | PASS | `db/reference_documents/` 4 files ✓ |
| Human decision candidates are represented | PASS | 10 pending decisions ✓ |
| False closure warning is preserved | PASS | manifest + export summary ✓ |
| CLI can initialize / ingest / status / export | PASS | 全コマンド動作確認 ✓ |
| `init` is idempotent | PASS（修正後）| `writeJsonIfAbsent` で既存 DB を保護 ✓ |
| Build passes | PASS | Next.js build 完了 ✓ |

---

## Changed Files（Debugger 修正）

| File | Change |
| :--- | :--- |
| `runtime/cognitiveDb.ts` | `writeJsonIfAbsent` ヘルパー追加、`initCognitiveDb` の `writeJson` → `writeJsonIfAbsent` に変更 |

---

## Observations

| # | 観察 | 推奨アクション |
| :--- | :--- | :--- |
| 1 | `init --force` オプションは現状なし。既存 DB を意図的にリセットしたい場合の手段がない。 | V1-10 以降で `--force` フラグが必要なら追加。現状は不要。 |
| 2 | `ensureInitialized` は `manifest.json` の存在のみチェックする。`manifest.json` が存在して他の DB ファイルが欠損する状態はハンドルされていない。 | v1 許容範囲。partial init の検出は後の Unit で対応可能。 |
| 3 | Working DB の `create-snapshot` は型定義済みだが CLI から未公開（実装報告書 Observation 3 と同じ）。 | V1-10 以降で追加。 |

---

## v1 進捗状態

| Unit | 内容 | Debugger 判定 |
| :--- | :--- | :--- |
| U-RUNTIME-V1-01 | External AI Executor Smoke | PASS |
| U-RUNTIME-V1-02 | Role Executor Assignment Flow | PASS |
| U-RUNTIME-V1-03 | Worker Execution Slot | PASS |
| U-RUNTIME-V1-04 | Debugger Rework Signal + PM Final Decision | PASS |
| U-RUNTIME-V1-05 | Worker Artifact Sandbox | PASS |
| U-RUNTIME-V1-06 | HumanGate Contract | PASS |
| U-RUNTIME-V1-07 | Review Rework Flow | PASS |
| U-RUNTIME-V1-08 | Debug Rework Flow | PASS |
| U-RUNTIME-V1-09 | CognitiveOS DB Trial | PASS（修正1件） |

---

## Read Log

| file_path | reason_for_reading | timestamp |
| :--- | :--- | :--- |
| `Packet/Remake_Project/U-RUNTIME-V1-09_ImplementationReport_CognitiveOSDbTrial_20260514.md` | Worker Report 確認 | 2026-05-14 |
| `runtime/cognitiveDb.ts` | DB module 全体レビュー | 2026-05-14 |
| `runtime/cognitiveDbCli.ts` | CLI コマンド実装確認 | 2026-05-14 |
| `CognitiveOS_Runtime_Workspace/db/decision.json` | pending decisions 内容確認 | 2026-05-14 |

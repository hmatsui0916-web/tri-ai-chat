# U-RUNTIME-V1-11 Debugger Report

File: U-RUNTIME-V1-11_DebuggerReport_WorkingSnapshotCreateRead_20260514.md
Role: Debugger
Scope: Working Snapshot Create + Read
Date: 2026-05-14

---

## Decision

PASS

バグは発見されなかった。全検証ケースが期待動作を示す。

---

## Summary

- `WorkingSnapshotRecord` 型と `WorkingDb.snapshots: Array<BranchSnapshot | WorkingSnapshotRecord>` の union 型設計を確認。
- `createWorkingSnapshot` / `listWorkingSnapshots` / `readWorkingSnapshot` の実装が正確であることを確認。
- `nextWorkingSnapshotId` の連番生成ロジックが正しく動作することを確認。
- `"title" in snapshot` によるランタイム型判別が CLI の `list-snapshots` / `show-snapshot` / `export-summary` で一貫して機能していることを確認。
- `show-snapshot WSNAP-999` で適切なエラーメッセージが返ることを確認 ✓
- `init` 冪等性が V1-11 後も維持されていることを確認（WSNAP-001 消えず）✓
- `npm run build` PASS ✓

---

## Bugs Found

なし。

---

## Code Review Points

### `WorkingDb.snapshots` の union 型設計（確認）

```typescript
export type WorkingDb = {
  snapshots: Array<BranchSnapshot | WorkingSnapshotRecord>;
  ...
};
```

`BranchSnapshot`（既存の複雑な型）と `WorkingSnapshotRecord`（新しい軽量型）の union。discriminated union ではなく `"title" in snapshot` によるランタイムチェックで判別している。

型判別パターンの一貫性:
- `list-snapshots`: `"title" in snapshot ? snapshot.title : snapshot.snapshot_title` ✓
- `show-snapshot`: `"title" in snapshot.record ? snapshot.record.title : snapshot.record.snapshot_title` ✓
- `export-summary`: `"title" in snapshot ? snapshot.title : snapshot.snapshot_title` ✓

`BranchSnapshot` は `snapshot_title` を持ち `title` を持たない。`WorkingSnapshotRecord` は `title` を持つ。フィールド名が異なるため `"title" in snapshot` による判別は安全 ✓

### `nextWorkingSnapshotId` ロジック（確認）

```typescript
function nextWorkingSnapshotId(existingIds: Set<string>): string {
  let nextNumber = 1;
  for (const id of existingIds) {
    const match = id.match(/^WSNAP-(\d+)$/);
    if (!match) { continue; }
    nextNumber = Math.max(nextNumber, Number(match[1]) + 1);
  }
  return `WSNAP-${String(nextNumber).padStart(3, "0")}`;
}
```

- 既存 ID の最大番号 + 1 を採用。ID に欠番があっても安全（例: 001, 003 → 004）✓
- `BranchSnapshot` の `snapshot_id`（`SNAP-xxx` 形式）は regex `^WSNAP-(\d+)$` にマッチしないため無視される ✓
- 3桁ゼロ埋め（`padStart(3, "0")`）✓

### `readWorkingSnapshot` の body_path 解決（確認）

```typescript
const body = await readFile(path.resolve(workspaceRoot, record.body_path), "utf8");
```

`record.body_path` は `toWorkspacePath` で生成した相対パス（`CognitiveOS_Runtime_Workspace/db/snapshots/WSNAP-001.md`）。`path.resolve(workspaceRoot, ...)` で正確に絶対パスに変換される ✓

### `readWorkingSnapshot` のエラーハンドリング（確認）

- 存在しない ID: `throw new Error('Working snapshot "WSNAP-999" was not found.')`
- `body_path` なし（BranchSnapshot 互換）: `return { record, body: null }`
- 実際に `WSNAP-999` でエラーメッセージが正しく表示されることを確認 ✓

### `initCognitiveDb` の snapshots ディレクトリ追加（確認）

```typescript
await mkdir(workingSnapshotRoot, { recursive: true });
// ...
directories: {
  snapshots: toWorkspacePath(workingSnapshotRoot),
  ...
}
```

`manifest.json` の `directories` に `snapshots` エントリが追加された。`writeJsonIfAbsent` により `init` 再実行時はスキップされ、既存 WSNAP-001 が保持される ✓

---

## Verification

### status

```text
Working snapshots: 1
Reference documents: 5
Snapshot index entries: 5
Pending decisions: 10
Human decisions: 0
```

✓

### list-snapshots

```text
WSNAP-001: Working Snapshot Smoke (draft)
```

✓

### show-snapshot WSNAP-001

- title: `Working Snapshot Smoke` ✓
- body テキストが `db/snapshots/WSNAP-001.md` から正確に取得 ✓

### show-snapshot WSNAP-999（エラーハンドリング）

```text
Working snapshot "WSNAP-999" was not found.
```

適切なエラーメッセージ。exit code 1 ✓

### init 冪等性テスト（V1-11 変更後）

- `init` 実行後も `list-snapshots`: `WSNAP-001` が維持 ✓

### Build

- Command: `npm.cmd run build`
- Result: PASS

---

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| Divergence note can be saved as Working Snapshot | PASS | `WSNAP-001` created ✓ |
| Snapshot body is physically stored | PASS | `db/snapshots/WSNAP-001.md` ✓ |
| Snapshot is listed from CLI | PASS | `list-snapshots` ✓ |
| Snapshot body can be retrieved from CLI | PASS | `show-snapshot WSNAP-001` ✓ |
| `working.json` records the snapshot | PASS | `Working snapshots: 1` ✓ |
| Export summary includes Working Snapshot list | PASS | `## Working Snapshots` ✓ |
| Unknown ID returns error | PASS | `WSNAP-999 was not found.` ✓ |
| `init` idempotency preserved | PASS | WSNAP-001 不変 ✓ |
| Build passes | PASS | Next.js build 完了 ✓ |

---

## Observations

| # | 観察 | 推奨アクション |
| :--- | :--- | :--- |
| 1 | `"title" in snapshot` による判別は `WorkingSnapshotRecord` と `BranchSnapshot` の設計上の差異に依存している。将来 `BranchSnapshot` に `title` フィールドが追加されると判別が壊れる可能性がある。 | 判別に使う discriminant フィールドを `type: "working_snapshot"` のような専用フラグに変更すると安全性が上がる。現状は v1 許容範囲。 |
| 2 | `create-snapshot` は毎回新しい WSNAP を生成する（内容ベースの重複排除なし）。同じファイルを2回実行すると WSNAP-001 / WSNAP-002 の2エントリが作成される。 | 意図的設計。作業メモの積み上げには適切。重複チェックが必要な場合は別コマンドで対応。 |
| 3 | `body_path` は `null` でなく文字列フィールドで `WorkingSnapshotRecord` に常に存在する。`"body_path" in record` のガードは `BranchSnapshot` との互換のために使われており正しい。 | このまま維持。 |

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
| U-RUNTIME-V1-09 | CognitiveOS DB Trial | PASS（修正1件）|
| U-RUNTIME-V1-10 | Snapshot Handoff Ingestion | PASS |
| U-RUNTIME-V1-11 | Working Snapshot Create + Read | PASS（バグなし） |

---

## Read Log

| file_path | reason_for_reading | timestamp |
| :--- | :--- | :--- |
| `Packet/Remake_Project/U-RUNTIME-V1-11_ImplementationReport_WorkingSnapshotCreateRead_20260514.md` | Worker Report 確認 | 2026-05-14 |
| `runtime/cognitiveDb.ts` (全体) | WorkingSnapshotRecord 型・新関数・union 型判別確認 | 2026-05-14 |
| `runtime/cognitiveDbCli.ts` | 新コマンド実装・型判別パターン確認 | 2026-05-14 |

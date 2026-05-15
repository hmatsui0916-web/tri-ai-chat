# U-RUNTIME-V1-14 Debugger Report

File: U-RUNTIME-V1-14_DebuggerReport_LifecycleStatusCommands_20260515.md
Role: Debugger
Scope: Lifecycle Status Commands
Date: 2026-05-15

---

## Decision

PASS

バグは発見されなかった。Worker が検証中に自己修正したバグ（`workingSnapshotStatuses` 初期化順）は既に修正済みで正しい配置を確認。全検証ケースが期待動作を示す。

---

## Summary

- `updateWorkingSnapshotStatus(snapshotId, recordStatus)` の実装を確認。
- `set-snapshot-status` / `mark-snapshot-ready` / `close-snapshot` / `archive-snapshot` の各 CLI コマンドを実動作で確認。
- `workingSnapshotStatuses` が `main()` より前に配置されていることを確認（Worker 修正済み）✓
- `isWorkingSnapshotStatus` が関数宣言（巻き上げあり）のため `main()` 後の定義でも正常動作することを確認 ✓
- 不明 ID (`WSNAP-999`) が明確なエラーを返すことを確認 ✓
- 制限外ステータス (`promoted`) が有効ステータス一覧付きエラーを返すことを確認 ✓
- `status` カウンタ（Active/ready / Closed / Archived）が各遷移で正確に更新されることを確認 ✓
- `list-snapshots` が `record_status` を正確に反映することを確認 ✓
- 最終テストデータを全 `draft` に復元 ✓
- `npm run build` PASS ✓

---

## Bugs Found

なし。

---

## Code Review Points

### `updateWorkingSnapshotStatus` の実装（確認）

```typescript
export async function updateWorkingSnapshotStatus(
  snapshotId: string,
  recordStatus: Extract<CognitiveRecordStatus, "draft" | "active" | "ready" | ...>,
): Promise<BranchSnapshot | WorkingSnapshotRecord> {
  const status = await cognitiveDbStatus();     // backfill も兼ねる
  const record = status.working.snapshots.find(...);

  if (!record) throw new Error(`Working snapshot "${snapshotId}" was not found.`);

  record.record_status = recordStatus;
  record.updated_at = now();
  status.working.updated_at = record.updated_at;
  await writeJson(paths.workingDb, status.working);

  return record;
}
```

- `cognitiveDbStatus()` 呼び出しが V1-13 の backfill を内包するため、未 backfill レコードへの書き込みでも正確な metadata が付与される ✓
- `status.working` の参照（オブジェクト）を直接変更してから `writeJson` するため、スナップショット配列の変更がそのまま永続化される ✓
- `WorkingDb.updated_at` も同期更新される ✓

### `workingSnapshotStatuses` の配置（確認）

```typescript
// cognitiveDbCli.ts L12 — main() より前
const workingSnapshotStatuses = [
  "draft", "active", "ready", "closed", "archived", "superseded", "reopened",
] as const;
```

`const` は TDZ（Temporal Dead Zone）があるため `main()` 呼び出し後では参照不可。Worker が修正済みで正しい位置にある ✓

### `isWorkingSnapshotStatus` の配置（観察）

```typescript
// cognitiveDbCli.ts L198 — main().catch(...) より後
function isWorkingSnapshotStatus(value: string): value is ... {
  return workingSnapshotStatuses.includes(...);
}
```

`function` 宣言は JavaScript/TypeScript の巻き上げにより module scope 先頭へ移動されるため、`main()` 内部からの呼び出しは問題なし ✓  
ただし `workingSnapshotStatuses` の直下に配置すると可読性が向上する（観察のみ）。

### ステータス制限の設計（確認）

CLI の `workingSnapshotStatuses` は `CognitiveRecordStatus` の部分集合（7種）に制限される：

| Working Statuses | 除外された CognitiveRecordStatus 値 |
| :--- | :--- |
| draft / active / ready / closed / archived / superseded / reopened | selected / promoted / candidate_source / decision_linked / pending / adopted / … |

Working Snapshot に意味のないステータス値を排除している ✓

### 遷移ガードなし（観察）

`archived → active` など逆方向・非典型的な遷移も現在は許容される。v1 では CLI ツールを適切に使う運用前提のため問題なし。

---

## Verification

### mark-snapshot-ready → status

```text
Updated WSNAP-001: ready
↓
Active/ready working snapshots: 1  ✓
```

### close-snapshot → status

```text
Updated WSNAP-001: closed
↓
Active/ready working snapshots: 0
Closed working snapshots: 1  ✓
```

### archive-snapshot → status

```text
Updated WSNAP-001: archived
↓
Archived working snapshots: 1  ✓
```

### set-snapshot-status active + status

```text
Updated WSNAP-002: active
↓
Active/ready working snapshots: 1
Archived working snapshots: 1  ✓
```

### list-snapshots（中間状態）

```text
WSNAP-001: Working Snapshot Smoke (archived)
WSNAP-002: Raw Session Note / Normalized Snapshot (active)
WSNAP-003: my-session-note.md / Normalized Snapshot (draft)
WSNAP-004: my-session-note.md / Normalized Snapshot (draft)
```

✓

### 不明 ID エラー

```text
Working snapshot "WSNAP-999" was not found.  ✓
```

### 制限外ステータスエラー

```text
Unsupported working snapshot status "promoted". Valid statuses: draft, active, ready, closed, archived, superseded, reopened  ✓
```

### 最終復元後 status

```text
Working snapshots: 4
Active/ready working snapshots: 0
Closed working snapshots: 0
Archived working snapshots: 0
Reference documents: 5
Snapshot index entries: 5
Pending decisions: 10
Human decisions: 0
```

✓

### Build

- Command: `npm.cmd run build`
- Result: PASS

---

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| Working Snapshot can be marked ready | PASS | `mark-snapshot-ready` → `Active/ready: 1` ✓ |
| Working Snapshot can be closed | PASS | `close-snapshot` → `Closed: 1` ✓ |
| Working Snapshot can be archived | PASS | `archive-snapshot` → `Archived: 1` ✓ |
| Arbitrary supported status can be set | PASS | `set-snapshot-status` with all 7 values tested ✓ |
| No physical delete occurs | PASS | `status` counts remain 4 throughout ✓ |
| Active/closed/archived counts update correctly | PASS | 各遷移で正確なカウント変化を確認 ✓ |
| Unknown ID returns clear error | PASS | `WSNAP-999` ✓ |
| Invalid status returns clear error | PASS | `promoted` → 有効値一覧付きエラー ✓ |
| `list-snapshots` reflects updated status | PASS | `record_status` が正確に表示 ✓ |
| Final test data restored | PASS | 全 WSNAP が draft ✓ |
| Build passes | PASS | Next.js build 完了 ✓ |

---

## Observations

| # | 観察 | 推奨アクション |
| :--- | :--- | :--- |
| 1 | `isWorkingSnapshotStatus` が `main().catch(...)` の後に定義されている（L198）。`function` 宣言なので巻き上げにより動作上は問題ないが、`workingSnapshotStatuses` の直下に移動するとより読みやすい。 | v1 許容範囲。コードスタイルの好みによる整理は後続リファクタ機会に。 |
| 2 | 遷移ガードがなく、任意のステータスから任意のステータスへ遷移できる（例: `archived → active`）。 | v1 では CLI を適切に使う運用前提のため問題なし。将来ワークフロー自動化が入る場合は遷移ルールの追加を検討。 |
| 3 | `superseded` / `reopened` は `set-snapshot-status` でのみ設定可能（ショートカットコマンドなし）。 | v1 ではこれら2つの使用頻度が低い前提。必要になれば `reopen-snapshot` 等を追加。 |
| 4 | `updateWorkingSnapshotStatus` は `cognitiveDbStatus()` 経由で毎回 DB 全体を読み込む。Snapshot 数が増えた場合のパフォーマンス影響は現在は無視できる。 | v1 許容範囲。 |

---

## v1 進捗状態

| Unit | 内容 | Debugger 判定 |
| :--- | :--- | :--- |
| U-RUNTIME-V1-01〜08 | Workflow Runner v1 各ロール・フロー | PASS |
| U-RUNTIME-V1-09 | CognitiveOS DB Trial | PASS（修正1件）|
| U-RUNTIME-V1-10 | Snapshot Handoff Ingestion | PASS |
| U-RUNTIME-V1-11 | Working Snapshot Create + Read | PASS |
| U-RUNTIME-V1-12 | Snapshot Normalize | PASS |
| U-RUNTIME-V1-13 | CognitiveOS DB Lifecycle Metadata | PASS |
| U-RUNTIME-V1-14 | Lifecycle Status Commands | PASS（バグなし）|

---

## Read Log

| file_path | reason_for_reading | timestamp |
| :--- | :--- | :--- |
| `Packet/Remake_Project/U-RUNTIME-V1-14_ImplementationReport_LifecycleStatusCommands_20260515.md` | Worker Report 確認 | 2026-05-15 |
| `runtime/cognitiveDbCli.ts` | コマンド実装・定数配置・型ガード確認 | 2026-05-15 |
| `runtime/cognitiveDb.ts` (L512-536) | `updateWorkingSnapshotStatus` 実装確認 | 2026-05-15 |
| `runtime/cognitiveDb.ts` (L147-155) | `WorkingDb.updated_at` フィールド確認 | 2026-05-15 |

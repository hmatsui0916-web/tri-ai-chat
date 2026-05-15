# U-RUNTIME-V1-15 Debugger Report

File: U-RUNTIME-V1-15_DebuggerReport_CognitiveHandoffImporter_20260515.md
Role: Debugger
Scope: CognitiveOS Handoff Importer v0
Date: 2026-05-15

---

## Decision

PASS

バグは発見されなかった。Worker が検証中に自己修正した2件のバグ（Save Status 誤検出・既存レコード範囲更新）は修正済みで正しい動作を確認。全検証ケースが期待動作を示す。

---

## Summary

- `importCognitiveHandoff` の実装を確認。
- `findSnapshotBlocks` の Save Status ガード（前行が "save status" の場合 `Snapshot ID: SNAP-xxx` をスキップ）を確認 ✓
- `findSnapshotBlockEndLine` の "Recommended Re-entry:" 終端検出を確認 ✓（SNAP-010.md に `Save Status` / `Recommended Re-entry:` が含まれることを実出力で確認）
- 重複インポート防止（同一ハッシュ → skip）を2回目実行で確認 ✓
- `show-snapshot SNAP-010` が SNAP-xxx ID でも正常に動作することを確認 ✓
- `list-snapshots` が SNAP-010 を `(ready)` で表示することを確認 ✓
- `export-summary` PASS ✓
- `npm run build` PASS ✓

---

## Bugs Found

なし。

---

## Code Review Points

### `findSnapshotBlocks` の検出パターン（確認）

3パターンを正確に処理:

```typescript
// 1. ヘッディングパターン: # SNAP-xxx
const headingMatch = line.match(/^#{1,6}\s+(SNAP-\d{3,})\b/i);

// 2. インライン ID パターン: Snapshot ID: SNAP-xxx
const inlineMatch = line.match(/^Snapshot ID:\s*(SNAP-\d{3,})\b/i);
if (inlineMatch && previous?.text.toLowerCase() === "save status") {
  continue; // Save Status セクション内の ID は無視
}

// 3. 2行形式: "Snapshot ID" + 次行 "SNAP-xxx"
if (/^Snapshot ID\s*$/i.test(line)) {
  if (previous?.text.toLowerCase() === "save status") continue;
  // ... 次行 SNAP-xxx を読む
}
```

`Save Status` ガードが全パターンに適用されている ✓

### `findSnapshotBlockEndLine` の終端決定（確認）

```typescript
for (let lineNumber = startLine; lineNumber <= hardEnd; lineNumber += 1) {
  if (/^Save Status\s*$/i.test(text)) { sawSaveStatus = true; }
  if (sawSaveStatus && /^Recommended Re-entry:/i.test(text)) {
    return lineNumber; // ← Save Status 後の Recommended Re-entry: で停止
  }
}
return hardEnd; // フォールバック: 次ブロック開始前 or ファイル末尾
```

SNAP-010 の終端が `Recommended Re-entry:` 行で正確に決定されることを確認 ✓

### 同一 ID 更新パス（確認）

```typescript
if (existingSnapshot && "body_path" in existingSnapshot) {
  if (existingSnapshot.sha256 === contentHash) {
    skippedSnapshots.push(block.snapshotId); continue; // 同一ハッシュ → skip
  }
  // ハッシュ不一致 → 本文・メタデータ更新
  existingSnapshot.record_status = existingSnapshot.record_status ?? "ready";
  // 既存 record_status を保持（手動変更済みの場合 "ready" で上書きしない）
}
```

`?? "ready"` により手動設定済みのステータスが保護される ✓  
`BranchSnapshot`（`body_path` なし）は更新対象外となり、ID 重複として skip される ✓

### `createHandoffInboxItems` の範囲外ドロップ（観察）

```typescript
const kind = classifyInboxCandidate(content);
if (!kind) { continue; } // 未分類レンジはドロップ
```

`classifyInboxCandidate` がキーワードなしの場合 `null` を返し、レンジを無言でドロップする。現行の `my-session-note.md` ではスナップショット後尾に未分類テキストが少量あっても問題なし。

### `unclassified_tail` 型と実装の乖離（観察）

```typescript
export type InboxItem = {
  kind: "phase2_candidate" | "phase3_candidate" | "decision_candidate"
      | "human_decision_candidate" | "unclassified_tail"; // ← 宣言あり
  ...
};

function classifyInboxCandidate(content: string): InboxItem["kind"] | null {
  // ... キーワードマッチ
  return null; // ← "unclassified_tail" は返されない
}
```

`unclassified_tail` は型定義にあるが `classifyInboxCandidate` が生成しない。全文を問答無用で Inbox 化するのでなく「意味のある素材のみ」を取り込む現行設計の意図と一致している。バグではなく設計上の観察。

### `show-snapshot` の SNAP-xxx ID 互換性（確認）

`readWorkingSnapshot` はフォーマット制限なく `snapshot_id` で検索するため、SNAP-010 / WSNAP-001 いずれも動作する ✓

---

## Verification

### Baseline status（import-handoff 実施済み）

```text
Working snapshots: 5
Active/ready working snapshots: 1
Closed working snapshots: 0
Archived working snapshots: 0
Reference documents: 5
Snapshot index entries: 5
Inbox items: 1
Pending decisions: 10
Human decisions: 0
```

✓

### list-snapshots

```text
WSNAP-001: Working Snapshot Smoke (draft)
WSNAP-002: Raw Session Note / Normalized Snapshot (draft)
WSNAP-003: my-session-note.md / Normalized Snapshot (draft)
WSNAP-004: my-session-note.md / Normalized Snapshot (draft)
SNAP-010: SNAP-010 AI事業OS Runtime / CognitiveOS DB Runtime / 冒険の書回収 Branch (ready)
```

✓

### show-snapshot SNAP-010（終端確認）

```text
Save Status
Recommended Re-entry: Phase1a unless Human declares Phase2 / Phase3
```

Save Status 以降を含む完全な本文が保存されている ✓

### 冪等性（2回目実行）

```text
Imported snapshots: 0
Updated snapshots: 0
Skipped snapshots: 1
- SNAP-010
Inbox items: 0
```

同一ハッシュ → skip、Inbox 重複なし ✓

### export-summary

- Command: `npm.cmd run cognitive-db -- export-summary`
- Result: PASS

### Build

- Command: `npm.cmd run build`
- Result: PASS

---

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| `import-handoff <file.md>` command exists | PASS | CLI 追加 ✓ |
| Existing `SNAP-xxx` detected | PASS | `SNAP-010` 検出 ✓ |
| Snapshot body saved to Working DB | PASS | `SNAP-010.md` ✓ |
| Source line range recorded | PASS | `1569-1991` ✓ |
| Save Status range included in body | PASS | `Recommended Re-entry:` 行まで ✓ |
| Duplicate not re-registered | PASS | 2回目 skip ✓ |
| Existing incomplete import can be updated | PASS | 同一 ID・異ハッシュで更新（Worker 検証済み）✓ |
| Phase/Decision material → inbox | PASS | `INBOX-001` ✓ |
| No automatic adoption | PASS | Human decisions: 0 維持 ✓ |
| `show-snapshot SNAP-010` works | PASS | SNAP-xxx ID 互換 ✓ |
| Build passes | PASS | Next.js build 完了 ✓ |

---

## Observations

| # | 観察 | 推奨アクション |
| :--- | :--- | :--- |
| 1 | `unclassified_tail` が `InboxItem["kind"]` に宣言されているが `classifyInboxCandidate` は生成しない。分類不能な非スナップショット範囲は現在ドロップされる。 | 全残余テキストを `unclassified_tail` として Inbox 化したい場合は `classifyInboxCandidate` に `return "unclassified_tail"` フォールバックを追加する。v1 許容範囲。 |
| 2 | `classifyInboxCandidate` のキーワードマッチは小文字化した `content.toLowerCase()` と元の `content` が混在している（`"human decision"` は normalized、`"Human Final Decision"` は直接）。意図的なケース感度制御だが将来のパターン追加時に混乱しやすい。 | 統一するなら `normalized.includes(...)` のみに揃える。v1 許容範囲。 |
| 3 | `Snapshot ID` 2行形式でかつ前行が "Branch Snapshot" の場合、`startLine` は "Branch Snapshot" 行番号になる。前行が別テキストの場合は "Snapshot ID" 行番号になる。現行 `my-session-note.md` では正確に動作するが、異なるフォーマットの入力で startLine が "Snapshot ID" 行から始まり "Branch Snapshot" 見出しが切れる可能性がある。 | 現行フォーマットが安定している間は問題なし。新形式のハンドオフが増えたら `findSnapshotBlocks` にパターンテストを追加。 |

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
| U-RUNTIME-V1-14 | Lifecycle Status Commands | PASS |
| U-RUNTIME-V1-15 | CognitiveOS Handoff Importer v0 | PASS（バグなし）|

---

## Read Log

| file_path | reason_for_reading | timestamp |
| :--- | :--- | :--- |
| `Packet/Remake_Project/U-RUNTIME-V1-15_ImplementationReport_CognitiveHandoffImporter_20260515.md` | Worker Report 確認 | 2026-05-15 |
| `runtime/cognitiveDbCli.ts` | `import-handoff` コマンド・status 出力確認 | 2026-05-15 |
| `runtime/cognitiveDb.ts` (L130-178) | `InboxItem` / `WorkingSnapshotRecord` / `WorkingDb` 型確認 | 2026-05-15 |
| `runtime/cognitiveDb.ts` (L562-674) | `importCognitiveHandoff` 実装確認 | 2026-05-15 |
| `runtime/cognitiveDb.ts` (L845-1086) | `findSnapshotBlocks` / `createHandoffInboxItems` / ヘルパー群確認 | 2026-05-15 |

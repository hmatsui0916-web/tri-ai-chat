# U-RUNTIME-V1-12 Debugger Report

File: U-RUNTIME-V1-12_DebuggerReport_SnapshotNormalize_20260514.md
Role: Debugger
Scope: Snapshot Normalize
Date: 2026-05-14

---

## Decision

PASS

バグは発見されなかった。全検証ケースが期待動作を示す。

---

## Summary

- `normalizeWorkingSnapshot` と正規化本文生成ヘルパー群（`buildNormalizedSnapshotBody` / `summarizeCoreMeaning` / `extractBranchItems` / `extractSearchAnchors` / `truncateForLine`）の実装を確認。
- `normalize-snapshot` CLI コマンドの動作を確認。
- WSNAP-002 の全10セクションが正確に生成されることを実際の出力で確認 ✓
- `extractBranchItems` の bullet → heading フォールバックパスを確認 ✓
- `extractSearchAnchors` の ASCII token 抽出ロジックを確認 ✓
- `npm run build` PASS ✓

---

## Bugs Found

なし。

---

## Code Review Points

### `buildNormalizedSnapshotBody` のセクション構成（確認）

全10セクションが正確に生成されることを実出力で確認:

| セクション | 確認内容 |
| :--- | :--- |
| `## False Closure Warning` | `falseClosureWarning` 定数を再利用 ✓ |
| `## Source` | `sourcePath` / transformation 種別 / draft 状態 ✓ |
| `## Core Meaning` | 最初の非見出し段落から抽出、280字上限 ✓ |
| `## Why Preserve` | 固定テキスト ✓ |
| `## Branch Items` | `BR-001` 〜 `BR-004`（bullet 4件から生成）✓ |
| `## Search Anchors` | ASCII token 12件（limit = 12 で停止）✓ |
| `## Return Query` | `snapshotId + title + anchors[0..4]` ✓ |
| `## Potential Phase3 Questions` | 固定 3 項目 ✓ |
| `## Origin Risk` | 固定テキスト ✓ |
| `## Raw Material` | 原文を `trimEnd()` で保持 ✓ |

### `extractBranchItems` のフォールバック順序（確認）

```typescript
// 1. bullet items (- / *) → 最大12件
// 2. headings (##〜######) → 最大12件
// 3. fallback: ["Preserve raw session material for later extraction."]
```

smoke input は bullet 4件を持つため path 1 を使用。`truncateForLine(line, 180)` で各アイテムを180字上限に切り詰め ✓

### `extractSearchAnchors` の挙動（確認）

```typescript
const matches = content.match(/[A-Za-z][A-Za-z0-9_-]{2,}|SNAP-\d+|WSNAP-\d+/g) ?? [];
```

- ASCII英字で始まり3文字以上のトークンを抽出
- `SNAP-xxx` / `WSNAP-xxx` ID も明示的にキャプチャ
- `Set<string>` で重複排除し、12件で打ち切り
- 実出力: `Raw, Session, Note, CognitiveOS, Snapshot, Working, list, show, Human, Reference, false, closure`（12件で停止）✓
- 日本語のみのコンテンツでは0件 → フォールバックで `CognitiveOS` / `Working Snapshot` を補完 ✓

### `summarizeCoreMeaning` の first-paragraph 抽出（確認）

```typescript
const firstParagraph = content
  .split(/\r?\n\r?\n/)
  .map((block) => block.trim())
  .find((block) => block && !block.startsWith("#"));
```

`#` で始まるブロック（見出し）をスキップして最初の本文段落を取得。smoke input の場合、日本語2行を結合した段落が抽出され、280字以内のため切り詰めなし ✓

### `normalizeWorkingSnapshot` と `createWorkingSnapshot` の共通パターン（確認）

両関数は `nextWorkingSnapshotId(existingIds)` で連番 ID を生成し、`writeJson(paths.workingDb, workingDb)` でアトミックに保存する。並列実行に対しての保護はないが、CLI ツールとして逐次使用される前提のため許容範囲 ✓

### `show-snapshot` 出力の二重見出し（観察）

CLI の出力:
```
# WSNAP-002: Raw Session Note / Normalized Snapshot   ← CLI が console.log で生成（: 区切り）
# WSNAP-002 Raw Session Note / Normalized Snapshot    ← 本文ファイル先頭行（空白区切り）
```

2つの H1 が連続して表示される。バグではなく、CLI ヘッダーとファイル本文の両方を素直に出力する設計。V1-11 の `create-snapshot` でも同様のパターン。

---

## Verification

### status

```text
Working snapshots: 2
Reference documents: 5
Snapshot index entries: 5
Pending decisions: 10
Human decisions: 0
```

✓

### list-snapshots

```text
WSNAP-001: Working Snapshot Smoke (draft)
WSNAP-002: Raw Session Note / Normalized Snapshot (draft)
```

✓

### show-snapshot WSNAP-002（セクション確認）

| セクション | 存在 |
| :--- | :--- |
| `## False Closure Warning` | ✓ |
| `## Source` | ✓ |
| `## Core Meaning` | ✓（日本語段落が正確に抽出）|
| `## Why Preserve` | ✓ |
| `## Branch Items` | ✓（BR-001〜BR-004）|
| `## Search Anchors` | ✓（12件）|
| `## Return Query` | ✓ |
| `## Potential Phase3 Questions` | ✓ |
| `## Origin Risk` | ✓ |
| `## Raw Material` | ✓（原文全文保持）|

### Build

- Command: `npm.cmd run build`
- Result: PASS

---

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| Raw session note can be normalized | PASS | `normalize-snapshot` ✓ |
| Normalized body is saved as Working Snapshot | PASS | `WSNAP-002.md` ✓ |
| Raw material is preserved | PASS | `## Raw Material` に原文全文 ✓ |
| False closure warning is included | PASS | normalized body 先頭付近 ✓ |
| Branch items are extracted | PASS | BR-001〜BR-004 ✓ |
| Return query is generated | PASS | snapshotId + title + anchors[0..4] ✓ |
| Snapshot is retrievable | PASS | `show-snapshot WSNAP-002` ✓ |
| Build passes | PASS | Next.js build 完了 ✓ |

---

## Observations

| # | 観察 | 推奨アクション |
| :--- | :--- | :--- |
| 1 | `show-snapshot` の出力に H1 が2行連続する（CLI 生成ヘッダー + 本文先頭行）。機能上の問題はない。 | 気になれば CLI が本文の先頭行をスキップするか、本文に H1 を含めないよう `buildNormalizedSnapshotBody` を変更する選択肢がある。v1 許容範囲。 |
| 2 | `extractSearchAnchors` は ASCII token のみ抽出。日本語リッチなメモのアンカー密度が低下する。 | 実装報告書 Observation 2 と同じ。v1 許容範囲。後の Unit で日本語キーワード抽出を追加可能。 |
| 3 | `normalizeWorkingSnapshot` の `sha256` は正規化後コンテンツのハッシュ。同じ入力を2回実行すると WSNAP-003 が生成されるが、両者の sha256 は同一になる（タイムスタンプは body に含まれない）。 | 意図的設計か確認のこと。重複検出を後の Unit で追加する場合は sha256 の一致を利用できる。 |

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
| U-RUNTIME-V1-11 | Working Snapshot Create + Read | PASS |
| U-RUNTIME-V1-12 | Snapshot Normalize | PASS（バグなし）|

---

## Read Log

| file_path | reason_for_reading | timestamp |
| :--- | :--- | :--- |
| `Packet/Remake_Project/U-RUNTIME-V1-12_ImplementationReport_SnapshotNormalize_20260514.md` | Worker Report 確認 | 2026-05-14 |
| `runtime/cognitiveDb.ts` (L380-664) | `normalizeWorkingSnapshot` / ヘルパー関数群確認 | 2026-05-14 |
| `runtime/cognitiveDbCli.ts` (L40-64) | `normalize-snapshot` コマンド確認 | 2026-05-14 |

# U-RUNTIME-V1-12 Implementation Report

File: U-RUNTIME-V1-12_ImplementationReport_SnapshotNormalize_20260514.md
Role: Worker
Scope: Snapshot Normalize
Date: 2026-05-14

---

## Decision

PASS

素のセッションメモを deterministic に Working Snapshot 形式へ正規化し、Working DB に保存できるようにした。

---

## Summary

- `normalizeWorkingSnapshot(input.md)` を追加した。
- CLI に `normalize-snapshot <input.md>` を追加した。
- 正規化本文に `False Closure Warning` / `Source` / `Core Meaning` / `Why Preserve` / `Branch Items` / `Search Anchors` / `Return Query` / `Potential Phase3 Questions` / `Origin Risk` / `Raw Material` を出力するようにした。
- 原文は `Raw Material` に丸ごと保持するため、正規化しても原文性を失わない。
- smoke input `input/session-normalize-smoke.md` から `WSNAP-002` を生成し、`show-snapshot` で正規化本文を確認した。

---

## Changed Files

| File | Change |
| :--- | :--- |
| `runtime/cognitiveDb.ts` | `normalizeWorkingSnapshot` と正規化本文生成ヘルパーを追加 |
| `runtime/cognitiveDbCli.ts` | `normalize-snapshot <input.md>` コマンドを追加 |
| `input/session-normalize-smoke.md` | 素のセッションメモ正規化テスト用 input |

---

## Verification

### Normalize Snapshot

- Command: `npm.cmd run cognitive-db -- normalize-snapshot input/session-normalize-smoke.md`
- Result: PASS
- Created: `WSNAP-002: Raw Session Note / Normalized Snapshot`
- Body: `CognitiveOS_Runtime_Workspace/db/snapshots/WSNAP-002.md`

### Show Snapshot

- Command: `npm.cmd run cognitive-db -- show-snapshot WSNAP-002`
- Result: PASS
- Confirmed sections:
  - `## False Closure Warning`
  - `## Core Meaning`
  - `## Branch Items`
  - `## Return Query`
  - `## Raw Material`

### List Snapshot

```text
WSNAP-001: Working Snapshot Smoke (draft)
WSNAP-002: Raw Session Note / Normalized Snapshot (draft)
```

### Export Summary

- Command: `npm.cmd run cognitive-db -- export-summary`
- Result: PASS

### Build

- Command: `npm.cmd run build`
- Result: PASS

---

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| Raw session note can be normalized | PASS | `normalize-snapshot` |
| Normalized body is saved as Working Snapshot | PASS | `WSNAP-002.md` |
| Raw material is preserved | PASS | `## Raw Material` section |
| False closure warning is included | PASS | normalized body includes warning |
| Branch items are extracted | PASS | bullet items converted to `BR-001` etc. |
| Return query is generated | PASS | snapshot id + title + anchors |
| Snapshot is retrievable | PASS | `show-snapshot WSNAP-002` |
| Build passes | PASS | Next.js build completed |

---

## Observations

| # | Observation | Recommendation |
| :--- | :--- | :--- |
| 1 | Normalization is deterministic, not AI-authored. It extracts bullets/headings and preserves raw material. | This is safer for v1. A future AI normalizer can be added as a separate executor-backed command. |
| 2 | Search anchors currently favor ASCII tokens. Japanese-only notes still preserve full raw material and core meaning, but anchors are less rich. | Add Japanese keyword extraction later if needed. |
| 3 | The normalized snapshot remains `draft`. | Promotion to Reference DB or Decision DB should remain a Human-gated future unit. |


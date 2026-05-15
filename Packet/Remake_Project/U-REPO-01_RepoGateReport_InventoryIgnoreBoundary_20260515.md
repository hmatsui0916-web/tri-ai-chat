# U-REPO-01 RepoGate Report

File: U-REPO-01_RepoGateReport_InventoryIgnoreBoundary_20260515.md
Role: RepoGate
Scope: Repository inventory and ignore boundary
Date: 2026-05-15

---

## Decision

NEEDS_HUMAN_DECISION

コミットは未実行。削除も未実行。

このUnitでは、現在のワークスペースを棚卸しし、Git管理対象と除外対象の境界を最小限整備した。

---

## Summary

- `.gitignore` を更新し、実行ログ・DB実体・個人設定・生チャット原文をGit候補から除外した。
- `runtime/` はAI事業OSRuntime / CognitiveOS DB Runtime本体としてGit管理候補。
- `Packet/Remake_Project/` はUnit指示・実装報告・Debugger ReportとしてGit管理候補。
- `input/` は混在領域。smoke / spec / handoff はGit候補、生チャット原文は除外。
- `runs/` と `CognitiveOS_Runtime_Workspace/` は運用データとしてGit管理対象外。
- 秘密情報スキャンでは、実キーらしき値は検出されていない。`.env.example` の空キー名とコード中の環境変数参照のみ。

---

## Changed Files

| File | Change |
| :--- | :--- |
| `.gitignore` | `.env*`、`CognitiveOS_Runtime_Workspace/`、`.claude/`、生チャット系input、`*.tsbuildinfo` を除外 |

---

## Current Git Status After Boundary Update

```text
 M .env.example
 M .gitignore
 M next-env.d.ts
 M package.json
 M tsconfig.json
?? Packet/Remake_Project/
?? input/
?? runtime/
```

`runs/`、`CognitiveOS_Runtime_Workspace/`、`.claude/`、`input/my-session-note.md`、`input/サブスクチャットのセッション内容.md` はGit候補から外れた。

---

## Recommended Git Boundary

### Commit候補

| Area | Recommendation | Reason |
| :--- | :--- | :--- |
| `runtime/` | Commit | Runtime本体。Workflow Runner、CognitiveOS DB、role instruction、flow定義を含む |
| `package.json` | Commit | `workflow` / `cognitive-db` script と ESM 設定 |
| `tsconfig.json` | Commit | generated runtime outputs を型チェック対象から除外 |
| `.env.example` | Commit | 外部executor設定例。実キーなし |
| `.gitignore` | Commit | Repo境界の基礎 |
| `Packet/Remake_Project/` | Commit候補 | Unit履歴・Debugger Report。開発判断の記録 |
| curated `input/*.md` | Human確認後にCommit | smoke / spec / handoff は再現性に有用 |

### 除外対象

| Area | Recommendation | Reason |
| :--- | :--- | :--- |
| `runs/` | Do not commit | 実行ログ。大量・一時的・runごとに増殖 |
| `CognitiveOS_Runtime_Workspace/` | Do not commit | DB実体・Inbox/Outbox・Working Snapshot。運用データ |
| `.claude/` | Do not commit | 個人CLI設定・権限設定 |
| `.env`, `.env.*` | Do not commit | APIキー・ローカル環境変数の混入リスク |
| `input/my-session-note.md` | Do not commit | ローカル試験用の生セッション素材 |
| `input/サブスクチャットのセッション内容.md` | Do not commit | サブスクチャット全文コピー。生データ |
| `*.tsbuildinfo` | Do not commit | TypeScript incremental cache |

---

## Human Decisions Needed

1. `Packet/Remake_Project/` を丸ごとGit管理するか。
2. `input/` のうち、どれを固定テスト・仕様資料としてGit管理するか。
3. `next-env.d.ts` の変更をコミット対象に含めるか。
   - `./.next/dev/types/routes.d.ts` から `./.next/types/routes.d.ts` に変化している。
   - Next.jsの生成物に近いため、U-REPO-02で再確認推奨。
4. 既にtrack済みの `tsconfig.tsbuildinfo` を今後Gitから外すか。
   - `.gitignore` には追加済みだが、track済みファイルは別途 `git rm --cached` が必要。
   - このUnitでは未実行。

---

## Commit Plan Draft

### Commit A: Runtime Source

- `runtime/`
- `package.json`
- `tsconfig.json`
- `.env.example`

### Commit B: Repo Hygiene

- `.gitignore`
- もし承認されれば `tsconfig.tsbuildinfo` のde-track

### Commit C: Runtime Packets

- `Packet/Remake_Project/`

### Commit D: Curated Inputs

- `input/*smoke.md`
- `input/Cognitive_OS_*.md`
- `input/CognitiveOS_DB化検討.md`
- `input/ai事業os_workflow_runner_v_0_引き継ぎ資料_snap_005_009.md`
- `input/CODEX Instruction_CognitiveOS DB Category_Lifecycle Design Refinement.md`

`input/サブスクチャットのセッション内容.md` と `input/my-session-note.md` は除外継続推奨。

---

## Secret / Sensitive Data Scan

実行した軽量スキャン:

```text
rg -n --hidden --glob '!node_modules/**' --glob '!.git/**' --glob '!.next/**' "(API[_-]?KEY|SECRET|TOKEN|sk-|OPENAI|ANTHROPIC|GEMINI|TOGETHER|GROQ)" .
```

結果:

- `.env.example` の空キー名
- `app/api/ask-stream/route.ts` の環境変数参照
- `runtime/roleExecutor.ts` の executor env 参照
- Packet内の環境変数名メモ
- 実キーらしき値は検出なし

注意:

- これは簡易スキャンであり、完全なsecret scanではない。
- 生チャット全文やDB実体は別理由でGit除外済み。

---

## RepoGate Status

| Gate | Status |
| :--- | :--- |
| Ignore boundary | PASS |
| Commit execution | NOT_STARTED |
| Push execution | NOT_STARTED |
| Human decision required | YES |

---

## Recommended Next Unit

U-REPO-02 Commit Plan

目的:

- `git status` をもとに実コミット単位を確定する。
- `input/` と `Packet/Remake_Project/` の扱いをHumanGateで決める。
- `tsconfig.tsbuildinfo` をde-trackするか判断する。
- コミットはまだ実行しないか、Human明示承認後に限定実行する。


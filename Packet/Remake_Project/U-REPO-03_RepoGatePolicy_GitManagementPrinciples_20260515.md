# U-REPO-03 RepoGate Policy

File: U-REPO-03_RepoGatePolicy_GitManagementPrinciples_20260515.md
Role: RepoGate
Scope: Git management principles
Date: 2026-05-15

---

## Decision

ADOPT POLICY

この文書は、AI事業OSRuntime / CognitiveOS DB Runtime ワークスペースにおける Git 管理判断の基本原則として採用する。

コミット実行は未実行。

---

## Core Principle

Git 管理の第一原則:

> 更新されて育つデータは Git 管理候補。
> 秘密情報・個人情報・未整理の生データを含む可能性があるものは Git 管理不可。
> 出力して終わりのデータは原則 Git 管理不要。ただし、公開して問題なく、保険・再現性・引き継ぎ価値があるものは Human 判断で Git 管理可。

---

## Decision Rules

### Rule 1 — Growing Source

更新されながら育つものは Git 管理する。

該当例:

- Runtime source code
- Role instruction
- Flow definition
- Prompt template
- CLI implementation
- Repository operation policy
- Fixed smoke inputs
- Adopted specification files

理由:

- 差分を追う必要がある。
- 変更理由を残す必要がある。
- ロール / AI / Human 間で共有する必要がある。
- 破損時に戻せる必要がある。

---

### Rule 2 — Sensitive / Raw Data

秘密情報・個人情報・未整理データを含む可能性があるものは Git 管理しない。

該当例:

- `.env`
- `.env.local`
- API keys
- CLI auth / local tool settings
- Raw subscription chat copy
- Personal notes
- CognitiveOS DB runtime state
- Inbox / Outbox / Working Snapshot bodies
- Workflow run logs
- Worker generated artifacts before promotion

理由:

- 公開リポジトリ化した場合に事故る。
- 後から履歴削除するのが難しい。
- 生データには本人も把握していない情報が混ざり得る。
- DB 実体は運用状態であり、ソースではない。

---

### Rule 3 — Finished Output

出力して終わりのデータは原則 Git 管理不要。

ただし、次の条件を満たす場合は Human 判断で Git 管理してよい。

- 公開して問題ない。
- 後から読み返す価値がある。
- 再現性に必要。
- 判断履歴として意味がある。
- クラウド上の保険として保存したい。

該当例:

- Adopted handoff documents
- Final reports
- Release notes
- Curated export summaries
- RepoGate reports

---

### Rule 4 — Runtime Workspace Separation

実行環境と実装環境が同一ワークスペースに共存していてもよい。

ただし Git では、以下を分離する。

| Layer | Git policy |
| :--- | :--- |
| Source Layer | Git管理 |
| Operation Data Layer | Git管理不可 |
| Handoff / Decision Layer | Human判断 |
| Product Layer | 採用後にGit管理 |

---

## Current Workspace Application

### Git Required

| Path | Reason |
| :--- | :--- |
| `runtime/` | Runtime source, roles, flows, templates |
| `package.json` | Runtime command scripts |
| `tsconfig.json` | Build / typecheck boundary |
| `.gitignore` | Repository safety boundary |
| `.env.example` | Safe environment variable template |

---

### Git Candidate

| Path | Reason | Human decision |
| :--- | :--- | :--- |
| `Packet/Remake_Project/` | Runtime rebuild decision history | Commit recommended |
| `input/*smoke.md` | Fixed workflow / DB test fixtures | Commit recommended |
| `input/Cognitive_OS_*.md` | CognitiveOS reference/spec materials | Commit recommended if no private data |
| `input/CognitiveOS_DB化検討.md` | DB design input | Commit recommended if no private data |
| `input/ai事業os_workflow_runner_v_0_引き継ぎ資料_snap_005_009.md` | Snapshot import fixture | Commit recommended if no private data |
| `input/CODEX Instruction_CognitiveOS DB Category_Lifecycle Design Refinement.md` | Lifecycle design instruction | Commit recommended |

---

### Git Forbidden / Ignored

| Path | Reason |
| :--- | :--- |
| `.env` / `.env.*` except `.env.example` | Secrets risk |
| `.env.local` | Local secrets |
| `.claude/` | Local Claude settings |
| `runs/` | Runtime execution logs |
| `CognitiveOS_Runtime_Workspace/` | DB runtime state and raw working data |
| `input/my-session-note.md` | Local raw session note |
| `input/サブスクチャットのセッション内容.md` | Raw subscription chat copy |
| `node_modules/` | Dependency install output |
| `.next/` | Next.js build output |
| `*.tsbuildinfo` | Local incremental build cache |

---

## Promotion Policy

Generated artifacts are not source until promoted.

Default lifecycle:

1. Worker creates files under `runs/<run_id>/worker_artifacts/`.
2. Debugger checks them.
3. Integrator / PM evaluate them.
4. Human accepts or rejects.
5. Accepted artifacts are promoted into a source/product area.
6. Only promoted artifacts become Git candidates.

This avoids committing temporary or failed Worker output.

---

## RepoGate HumanGate

Git operations require HumanGate.

### Commit

AI may prepare:

- status summary
- changed file classification
- commit split proposal
- secret/raw-data risk notes
- commit messages

AI must not commit until Human approves the specific commit set.

### Push

Push requires separate explicit Human approval.

Recommended default:

```text
commit: Human approval required
push: separate Human approval required
force push: forbidden unless explicitly approved as exceptional operation
```

---

## Current Recommended Next Action

Proceed to U-REPO-04 Commit Execution only after Human approves:

```text
1. Commit .gitignore as Repo Hygiene.
2. Commit Runtime Source.
3. Commit curated input fixtures except raw session files.
4. Commit Packet/Remake_Project as Runtime decision history.
5. Keep next-env.d.ts on hold unless separately approved.
6. Do not push.
```

Open decision:

- Whether to remove already tracked `tsconfig.tsbuildinfo` from Git tracking with `git rm --cached tsconfig.tsbuildinfo`.

---

## RepoGate Status

| Gate | Status |
| :--- | :--- |
| Git policy | ADOPTED |
| Ignore boundary | PASS |
| Commit plan | READY |
| Commit execution | WAITING_FOR_HUMAN_APPROVAL |
| Push | NOT_STARTED |


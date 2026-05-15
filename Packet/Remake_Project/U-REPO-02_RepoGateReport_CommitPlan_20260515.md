# U-REPO-02 RepoGate Report

File: U-REPO-02_RepoGateReport_CommitPlan_20260515.md
Role: RepoGate
Scope: Commit plan
Date: 2026-05-15

---

## Decision

NEEDS_HUMAN_DECISION

コミットは未実行。`git add` も未実行。

このUnitでは、U-REPO-01で引いたignore境界を前提に、実際のコミット単位案を作成した。

---

## Current Git Candidate Set

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

ignore済み:

```text
.claude/
.env.local
.next/
CognitiveOS_Runtime_Workspace/
input/my-session-note.md
input/サブスクチャットのセッション内容.md
node_modules/
runs/
```

---

## Recommended Commit Split

### Commit A — Runtime Source

Recommended: YES

Purpose:

- AI事業OS Workflow Runner v0/v1
- CognitiveOS DB Runtime
- Role instruction / flow definition / prompt template

Files:

```text
runtime/cognitiveDb.ts
runtime/cognitiveDbCli.ts
runtime/workflow.ts
runtime/promptBuilder.ts
runtime/roleExecutor.ts
runtime/flows/ai-business-os-mini-v1.json
runtime/roles/*.md
runtime/templates/role-run.md
package.json
tsconfig.json
.env.example
```

Suggested message:

```text
Add AI Business OS runtime and CognitiveOS DB tools
```

Notes:

- `package.json` adds `type: module`, `workflow`, and `cognitive-db` scripts.
- `tsconfig.json` excludes runtime-generated output folders from build checking.
- `.env.example` documents executor configuration without real keys.

---

### Commit B — Repo Hygiene

Recommended: YES

Purpose:

- Git境界の明確化。
- 実行ログ・DB実体・個人設定・生チャットの混入防止。

Files:

```text
.gitignore
```

Suggested message:

```text
Define runtime workspace git boundaries
```

Notes:

- `runs/`, `CognitiveOS_Runtime_Workspace/`, `.claude/`, `.env*`, raw session input, `*.tsbuildinfo` を除外。
- `tsconfig.tsbuildinfo` は既にtrack済みなので、このignoreだけではGit管理から外れない。

Human decision:

- `tsconfig.tsbuildinfo` を今後Git管理から外すなら、別途 `git rm --cached tsconfig.tsbuildinfo` が必要。
- このUnitでは未実行。

---

### Commit C — Runtime Packet History

Recommended: YES, but large

Purpose:

- U-RUNTIME-V0〜V1、U-REPOの実装・検証・HumanGate履歴を保存。
- 後から「なぜこの設計になったか」を追える。

Files:

```text
Packet/Remake_Project/
```

Current count:

```text
51 files including this report
```

Suggested message:

```text
Add runtime rebuild packet history
```

Risk:

- ファイル数が多い。
- ただし生DBやrunログではなく、判断済みレポートなのでGit管理には向いている。

Human decision:

- 丸ごと入れるか。
- 重要なreportだけ選別するか。

Recommendation:

- 今回は丸ごとコミットでよい。
- 理由: Remake_Project は従来Packetから分離済みで、このRuntime再設計の監査ログとして意味がある。

---

### Commit D — Curated Input Fixtures

Recommended: PARTIAL

Purpose:

- workflow / CognitiveOS DB の再現テスト・仕様入力を保存。

Git候補:

```text
input/CODEX Instruction_CognitiveOS DB Category_Lifecycle Design Refinement.md
input/CognitiveOS_DB化検討.md
input/Cognitive_OS_Core_Discipline_Addendum_v0.1.1.md
input/Cognitive_OS_Prompt_Set_Draft_v0.3.1.1.md
input/Cognitive_OS_Snapshot_Handoff_Operational_Addendum_v0.1.1.md
input/aisnapshotizer-dry-run-unit.md
input/ai事業os_workflow_runner_v_0_引き継ぎ資料_snap_005_009.md
input/calculator-smoke.md
input/debugger-rework-smoke.md
input/humangate-aisnapshotizer-dry-run-rework.md
input/humangate-debugger-fix.md
input/humangate-reviewer-approval.md
input/nine-othello-smoke.md
input/othello-ai-smoke.md
input/request.md
input/reviewer-rework-smoke.md
input/session-normalize-smoke.md
input/working-snapshot-smoke.md
```

Excluded by `.gitignore`:

```text
input/my-session-note.md
input/サブスクチャットのセッション内容.md
```

Suggested message:

```text
Add runtime smoke and CognitiveOS input fixtures
```

Human decision:

- `input/ai事業os_workflow_runner_v_0_引き継ぎ資料_snap_005_009.md` は大きめのhandoff資料だが、Snapshot import再現に有用。
- `input/CognitiveOS_DB化検討.md` と `input/Cognitive_OS_*.md` は仕様資料として有用。
- smoke系は小さく、テスト再現に有用。

Recommendation:

- 生チャット原文以外はコミット候補でよい。

---

### Commit E — Next Generated Type Change

Recommended: HOLD / REVIEW

Files:

```text
next-env.d.ts
```

Diff:

```diff
-import "./.next/dev/types/routes.d.ts";
+import "./.next/types/routes.d.ts";
```

Risk:

- `next-env.d.ts` はNext.js生成に近いファイル。
- 変更がNext.js version/build mode由来の可能性がある。

Recommendation:

- U-REPO-03前に再確認。
- すぐコミットに含めず、別判断にする。

---

## Suggested Execution Order

Humanが承認する場合の順序:

1. Commit B: Repo Hygiene
2. Commit A: Runtime Source
3. Commit D: Curated Input Fixtures
4. Commit C: Runtime Packet History
5. Commit E: Next generated type change, only if approved

理由:

- 先に`.gitignore`を固めると誤ステージを防げる。
- Runtime本体を先に保存し、テスト素材と履歴文書を別コミットにすることで戻しやすい。

---

## RepoGate Recommendation

Status: COMMIT_PLAN_READY

Recommended Human choice:

```text
Commit B, A, D, C をこの順で進める。
next-env.d.ts は保留。
tsconfig.tsbuildinfo は次のRepo Hygieneで de-track を検討。
push はまだしない。
```

---

## HumanGate Questions

1. `Packet/Remake_Project/` は丸ごとコミットしてよいか。
2. `input/` は生チャット原文を除き、すべて curated fixture としてコミットしてよいか。
3. `next-env.d.ts` は保留でよいか。
4. `tsconfig.tsbuildinfo` をGit管理から外す作業を次Unitで行ってよいか。

---

## Next Unit

U-REPO-03 Commit Execution

条件:

- Humanが上記Commit Planを承認すること。
- 実行前に `git status --short` を再確認すること。
- `git add` はコミット単位ごとに限定すること。
- `git push` は実行しないこと。


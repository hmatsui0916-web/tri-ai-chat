# Common Runtime Operator Guide

File: COMMON_RUNTIME_OPERATOR_GUIDE.md
Scope: Shared operating rules for AI Business OS Runtime and CognitiveOS DB Runtime
Date: 2026-05-16

---

## Purpose

This guide lets any AI operator work inside this VSCode workspace without relying on one chat's memory.

The workspace contains two connected runtimes:

- AI Business OS Runtime: implementation workflow, roles, HumanGate, RepoGate.
- CognitiveOS DB Runtime: snapshots, inbox, outbox, decisions, rehydration, handoff.

Human is the final responsible party. AI operators execute, summarize, inspect, and propose. They do not silently adopt or publish decisions.

---

## Roles

### Human

- Owns final decisions.
- Approves HumanGate, Commit, Push, destructive changes, and adoption.
- May say "save" to request CognitiveOS snapshot preservation.

### AI Operator

- Runs commands.
- Writes files only within the workspace.
- Summarizes important results.
- Stops at gates.
- Keeps raw/private data out of Git.

### Runtime

- Executes repeatable workflows and DB commands.
- Records state in files.
- Does not replace Human judgment.

---

## Hard Rules

1. Do not commit or push without explicit Human approval.
2. Do not edit/delete `CognitiveOS_Runtime_Workspace/` manually unless explicitly operating through approved DB commands or Human-approved maintenance.
3. Do not commit raw session logs, `.env*`, `runs/`, `.claude/`, or `CognitiveOS_Runtime_Workspace/`.
4. Do not treat a Working Snapshot as adopted Human decision.
5. Do not treat AI summary as Human-originated decision unless Human explicitly says so.
6. If a command fails due to environment, path, auth, trust, or CLI availability, report it as environment state and ask/prepare a HumanGate path.
7. Push requires a separate approval after commit approval.
8. Do not simulate command execution. Report command success only from real terminal/tool output, Human-pasted output, or verified output from another operator.
9. Treat `CognitiveOS_Runtime_Workspace/db/*.json` and `CognitiveOS_Runtime_Workspace/db/snapshots/*.md` as DB-owned artifacts. Do not manually create or edit them during normal operation; use `npm.cmd run cognitive-db -- ...` commands.

---

## Git Policy

Git manages growing source and stable operational knowledge.

Git candidates:

- `runtime/`
- `runtime/roles/`
- `runtime/flows/`
- `runtime/profiles/`
- `runtime/templates/`
- `package.json`
- `tsconfig.json`
- `.gitignore`
- `.env.example`
- curated smoke/spec/handoff inputs
- accepted operator guides and RepoGate reports

Git forbidden:

- `.env`, `.env.*` except `.env.example`
- `.env.local`
- `.claude/`
- `runs/`
- `CognitiveOS_Runtime_Workspace/`
- raw subscription chat logs
- private local notes
- generated build/cache files

---

## Main Commands

### Workflow Runner

```powershell
npm.cmd run workflow -- input/request.md
```

With mini flow:

```powershell
npm.cmd run workflow -- input/request.md --flow runtime/flows/ai-business-os-mini-v1.json
```

With executor profile:

```powershell
npm.cmd run workflow -- input/request.md --flow runtime/flows/ai-business-os-mini-v1.json --profile runtime/profiles/ai-business-os-starter-v1.json
```

Mock regression:

```powershell
npm.cmd run workflow -- input/request.md --flow runtime/flows/ai-business-os-mini-v1.json --profile runtime/profiles/mock-v1.json
```

Resume with HumanGate note:

```powershell
npm.cmd run workflow -- --resume runs/<run_id> --from worker --human-note input/humangate-debugger-fix.md --flow runtime/flows/ai-business-os-mini-v1.json --profile runtime/profiles/mock-v1.json
```

### CognitiveOS DB

```powershell
npm.cmd run cognitive-db -- status
npm.cmd run cognitive-db -- list-snapshots
npm.cmd run cognitive-db -- show-snapshot WSNAP-001
npm.cmd run cognitive-db -- list-inbox
npm.cmd run cognitive-db -- show-inbox INBOX-001
```

Create/normalize snapshot:

```powershell
npm.cmd run cognitive-db -- create-snapshot input/some-note.md
npm.cmd run cognitive-db -- normalize-snapshot input/some-note.md
```

Snapshot registration is successful only when the generated ID can be verified:

```powershell
npm.cmd run cognitive-db -- show-snapshot WSNAP-xxx
npm.cmd run cognitive-db -- list-snapshots
```

If a physical file exists under `CognitiveOS_Runtime_Workspace/db/snapshots/` but `show-snapshot` fails, it is an orphan artifact, not a valid Working Snapshot.

AISnapshotizer safe preview:

```powershell
npm.cmd run cognitive-db -- snapshotize-inbox INBOX-004 --executor mock --dry-run
```

Actual snapshotize after Human approval:

```powershell
npm.cmd run cognitive-db -- snapshotize-inbox INBOX-004 --executor mock
```

Mark ready after Human review:

```powershell
npm.cmd run cognitive-db -- mark-snapshot-ready WSNAP-001
```

---

## HumanGate Levels

### Gate A: Continue Automatically

Allowed without extra approval when already in scope:

- Read files.
- Run status/list/show commands.
- Run build/test commands.
- Produce reports.
- Create draft notes or reports.
- Run dry-run commands.

### Gate B: Ask Before Proceeding

Requires Human confirmation:

- Actual DB mutation after dry-run.
- Marking snapshot ready.
- Starting new implementation Unit.
- Changing runtime schema or lifecycle behavior.
- Staging/committing Git changes.
- Resuming after Reviewer/Debugger REWORK.

### Gate C: Stop Until Explicit Approval

Requires explicit Human approval:

- Push.
- Force push.
- Deleting files.
- Removing Git-tracked files.
- Writing outside workspace.
- Any secret/auth operation.
- Any irreversible or externally visible action.

---

## Snapshot Semantics

Working Snapshot is not adoption.

It means:

- Material is preserved.
- It can be reopened.
- It may later become Phase2/Phase3 material.

It does not mean:

- PM approved.
- Human adopted.
- Rule changed.
- Product implementation approved.

Always preserve False Closure Warning semantics.

---

## Standard Save Quality Gate

When saving a CognitiveOS context, the operator must run two Human-facing checks before final save/ready decisions:

1. Phase2/3 Suitability Check
2. Reversibility Check

### Phase2/3 Suitability Check

Purpose:

- Verify whether the snapshot can later support Phase2 compression and Phase3 HumanDecision work.
- Check that the snapshot preserves enough decision material, open questions, risks, and branch candidates.

The operator should not decide adoption. It only reports whether the material appears suitable for later Phase2/3 processing.

### Reversibility Check

Purpose:

- Verify whether a future session that only receives the snapshot can regenerate the intended context and continue divergence.
- This is a Human readability check, not a strict semantic proof.

The operator should show a Human-facing regenerated context instead of asking Human to inspect the full snapshot structure.

Recommended display:

```markdown
## Reversibility Check Context

This is what a new session should be able to reconstruct from the snapshot:

- What the Human was thinking about:
- Why this branch should be preserved:
- Where divergence can continue:
- What is still undecided:
- What must not be treated as adopted:

## Human Check

If this regenerated context feels directionally correct, the snapshot can proceed.
If it feels wrong or too narrow, revise the snapshot before saving or marking ready.
```

Snapshot body is primarily an AI/runtime format.
Reversibility Check Context is the Human-facing confirmation surface.

If Human says "OK", continue with save/import/ready flow.
If Human says "NG" or points out drift, revise the snapshot proposal and regenerate the Reversibility Check Context.

---

## Current Chat Save

When Human says "save this context" or "セーブ":

1. Create a concise source note under `input/current-chat-save-<topic>-<date>.md`.
2. Put core meaning near the top before metadata-heavy sections.
3. Run the Standard Save Quality Gate.
4. Run:

```powershell
npm.cmd run cognitive-db -- normalize-snapshot input/current-chat-save-<topic>-<date>.md
```

5. Show generated WSNAP ID.
6. Keep it draft unless Human asks to mark ready.

---

## RepoGate

Before commit:

1. Run `git status --short`.
2. Classify files:
   - source
   - curated input
   - report/operator guide
   - raw/private/generated
3. Check `.gitignore`.
4. Present commit plan.
5. Wait for Human approval.

Before push:

1. Confirm working tree clean.
2. Confirm ahead commits.
3. Summarize commits.
4. Wait for separate Human approval.

---

## Operator Handoff

If switching AI operators:

1. Read this guide.
2. Read the role-specific guide, if any.
3. Run `npm.cmd run cognitive-db -- status`.
4. Run `git status --short`.
5. Report current state before making changes.

# U-RUNTIME-V1-05 Implementation Report

File: U-RUNTIME-V1-05_ImplementationReport_WorkerArtifactSandbox_20260514.md
Role: Worker
Scope: Worker Artifact Sandbox
Date: 2026-05-14

---

## Decision

PASS

Worker が markdown artifact block で返したファイルを、Runtime が `runs/<run_id>/worker_artifacts/` に安全に物理化できるようにした。

---

## Summary

- Worker に直接リポジトリ編集を許可せず、artifact block 方式を導入した。
- Runtime が Worker 出力から `artifact path="..."` code block を抽出し、run folder 配下の sandbox にのみ書き出す。
- 危険なパス（絶対パス、空パス、null byte、`..` による sandbox 脱出）を拒否する。
- `run.json` の role record に `artifact_paths` を記録する。
- Worker output に `## Runtime Artifact Materialization` を追記し、後続 Debugger / Integrator-C / PM-FinalDecision が物理化結果を読めるようにした。
- 電卓アプリ smoke request を追加し、実際に `index.html` / `style.css` / `app.js` が生成されることを確認した。

---

## Changed Files

| File | Change |
| :--- | :--- |
| `runtime/workflow.ts` | Worker artifact parser / sandbox materializer / runtime context / `artifact_paths` 記録を追加 |
| `runtime/promptBuilder.ts` | `runtimeContext` を prompt template に渡せるように変更 |
| `runtime/templates/role-run.md` | `## Runtime Context` セクションを追加 |
| `runtime/roles/worker.md` | artifact block 形式と sandbox 制約を明記 |
| `runtime/roles/integrator-s.md` | Worker Packet に artifact sandbox を指示する観点を追加 |
| `runtime/roles/debugger.md` | materialized artifact を検査対象に追加 |
| `input/calculator-smoke.md` | 実ファイル生成テスト用の小型電卓アプリ依頼を追加 |

---

## Artifact Contract

Worker may request file creation by returning markdown blocks:

````markdown
```artifact path="index.html"
<!DOCTYPE html>
...
```
````

Runtime behavior:

- Only Worker output is materialized.
- Only non-default flow runs are materialized.
- Files are written under `runs/<run_id>/worker_artifacts/`.
- Paths must be relative to `worker_artifacts/`.
- Paths must not escape the sandbox.
- Materialized paths are recorded in `run.json`.

---

## Verification

### Build Regression

- Command: `npm.cmd run build`
- Result: PASS

### Default Mock Regression

- Command: `npm.cmd run workflow -- input/request.md`
- Result: PASS
- Run folder: `runs/20260514-151237-117`
- Notes: default v0 flow remains available and completes with mock executor.

### Multi-Provider Calculator Artifact Smoke

- Command: `npm.cmd run workflow -- input/calculator-smoke.md --flow runtime/flows/ai-business-os-mini-v1.json`
- Result: PASS
- Run folder: `runs/20260514-151346-084`
- `flow_id`: `ai-business-os-mini-v1`
- `total_steps`: 9
- `completed_steps`: 9
- `failed_step`: `null`
- `final_output_path`: `runs/20260514-151346-084/09-pm-final-decision.output.md`

Materialized files:

| File | Size |
| :--- | :--- |
| `runs/20260514-151346-084/worker_artifacts/index.html` | 1340 bytes |
| `runs/20260514-151346-084/worker_artifacts/style.css` | 1311 bytes |
| `runs/20260514-151346-084/worker_artifacts/app.js` | 3169 bytes |

Worker role record:

```json
"artifact_paths": [
  "runs/20260514-151346-084/worker_artifacts/index.html",
  "runs/20260514-151346-084/worker_artifacts/style.css",
  "runs/20260514-151346-084/worker_artifacts/app.js"
]
```

Debugger result:

- `Result: PASS`
- Confirms all three files were materialized.
- Confirms division by zero error handling and clear reset logic.
- Confirms no repository source files were edited.

PM-FinalDecision:

- Decision: `COMPLETE`
- Reason: required artifacts exist, requirements are met, and no HumanGate rework is required.

---

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| Worker can produce actual files | PASS | artifact blocks materialized |
| Files are constrained to run sandbox | PASS | `worker_artifacts/` only |
| Repository source files are not edited by Worker | PASS | Runtime writes only inside run folder |
| `run.json` records generated artifacts | PASS | `artifact_paths` added |
| Debugger can inspect materialization evidence | PASS | Worker output includes Runtime materialization section |
| PM-FinalDecision can close as COMPLETE | PASS | calculator smoke completed |
| Default v0 flow remains intact | PASS | default mock regression completed |
| Build passes | PASS | Next.js build completed |

---

## Observations

| # | Observation | Recommendation |
| :--- | :--- | :--- |
| 1 | Runtime validates artifact paths but does not limit file count or total bytes. | Add conservative limits before larger tasks. |
| 2 | Runtime does not execute browser tests. Debugger validates by reading artifacts and logic. | Add a browser smoke checker later if UI artifacts become important. |
| 3 | Worker artifact generation depends on AI following the artifact block contract. | Keep Runtime materialization summary explicit; missing blocks should remain visible in output. |

---

## Next Recommended Unit

U-RUNTIME-V1-06 Artifact Review / Openable App Check

Goal:

- Provide a simple Human command to open `runs/<run_id>/worker_artifacts/index.html`.
- Optionally add a lightweight static checker for required files.
- Keep repo editing disabled until the artifact sandbox workflow is trusted.


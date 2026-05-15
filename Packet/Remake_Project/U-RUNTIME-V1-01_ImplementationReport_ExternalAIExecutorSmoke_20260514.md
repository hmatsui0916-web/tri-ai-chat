# U-RUNTIME-V1-01 Implementation Report

File: U-RUNTIME-V1-01_ImplementationReport_ExternalAIExecutorSmoke_20260514.md
Role: Codex
Scope: U-RUNTIME-V1-01 External AI Executor Smoke Integration
Date: 2026-05-14

---

## Decision

PASS

Workflow Runner can now call an external AI executor for a selected role. Codex executor smoke was verified successfully.

---

## Summary

- Added executor selection to the workflow CLI.
- Preserved `mock` as the default executor.
- Added adapter support for `codex`, `claude`, and `gemini`.
- Implemented external execution through CLI subprocess stdin/stdout.
- Default external role is `pm`.
- Verified `codex` executor by running PM through Codex CLI and the remaining roles through mock.
- Recorded executor metadata in `run.json`.
- Did not introduce full model orchestration, Worker file editing, Debugger command automation, Fix loop, DB, Snapshot, or Decision lifecycle.

---

## CLI

Default mock run:

```bash
npm.cmd run workflow -- input/request.md
```

External executor smoke:

```bash
npm.cmd run workflow -- input/request.md --executor codex
```

Optional role selection:

```bash
npm.cmd run workflow -- input/request.md --executor codex --external-role pm
```

Environment variable alternatives:

```powershell
$env:AI_EXECUTOR="codex"
$env:AI_EXTERNAL_ROLE="pm"
npm.cmd run workflow -- input/request.md
```

---

## Executor Behavior

When `--executor mock` is used:

- All roles use the existing mock executor.

When `--executor codex|claude|gemini` is used:

- Only `--external-role` uses the external executor.
- All other roles continue to use mock.
- This keeps V1-01 focused on AI integration proof, not full auto-development.

Default external role:

- `pm`

---

## Default CLI Adapters

| Executor | Default Command | Default Args |
| :--- | :--- | :--- |
| `codex` | `codex` | `exec --cd <workspace> --sandbox read-only -` |
| `claude` | `claude` | `-p` |
| `gemini` | `gemini` | none |

Optional overrides:

- `CODEX_EXECUTOR_COMMAND`
- `CODEX_EXECUTOR_ARGS`
- `CLAUDE_EXECUTOR_COMMAND`
- `CLAUDE_EXECUTOR_ARGS`
- `GEMINI_EXECUTOR_COMMAND`
- `GEMINI_EXECUTOR_ARGS`

Args are split on whitespace. Empty args env values fall back to defaults.

---

## Changed Files

| File | Change |
| :--- | :--- |
| `runtime/roleExecutor.ts` | Added external executor adapters and `executeRole` dispatcher |
| `runtime/workflow.ts` | Added `--executor`, `--external-role`, executor metadata, and per-role executor selection |
| `.env.example` | Added workflow executor configuration examples |

---

## Verification

### Mock Regression

- Command: `npm.cmd run workflow -- input/request.md`
- Result: PASS
- Run folder: `runs/20260514-112207-516`
- Notes: default behavior remains mock and completes all six roles.

### Codex Executor Smoke

- Command: `npm.cmd run workflow -- input/request.md --executor codex`
- Result: PASS
- Run folder: `runs/20260514-112216-152`

Confirmed:

- `run.json` includes `"executor": "codex"`.
- `run.json` includes `"external_role": "pm"`.
- PM duration is materially longer than mock, showing subprocess execution.
- `01-pm.output.md` contains a Codex-generated PM response, not mock text.
- Designer through Integrator-C completed using mock.
- `completed_steps: 6`.
- `failed_step: null`.

### Codex Failure Path Before Network Approval

- Run folder: `runs/20260514-112015-884`
- Result: expected failure under restricted network.
- Confirmed:
  - `status: "failed"`
  - `current_role: "pm"`
  - `failed_step: 1`
  - `output_path: null`
  - error recorded in `run.json`

This confirmed external executor failures are captured by existing run state.

### Build

- Command: `npm.cmd run build`
- Result: PASS

---

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| mock executor remains available | PASS | default behavior unchanged |
| external executor adapter exists | PASS | codex / claude / gemini adapter branches |
| at least one provider produces PM output | PASS | Codex executor verified |
| output is saved to `01-pm.output.md` | PASS | `runs/20260514-112216-152/01-pm.output.md` |
| run state records executor metadata | PASS | `executor`, `external_role` |
| external failure is recorded in `run.json` | PASS | restricted-network failure captured |
| build still passes | PASS | Next.js app unaffected |

---

## Provider Status

| Provider | Status |
| :--- | :--- |
| Codex | Verified in this environment |
| Claude Code | Adapter implemented, CLI not detected in this environment |
| Gemini Code Assist | Adapter implemented, CLI not detected in this environment |

---

## Observations

| # | Observation | Recommendation |
| :--- | :--- | :--- |
| 1 | Codex CLI required network permission. Without it, the workflow correctly failed and recorded the failure. | Keep as expected operational behavior. |
| 2 | Codex output included a mojibake arrow in one line when echoing a Japanese/arrow-containing phrase. | Non-blocking for smoke. Prefer ASCII arrows in role prompts if this becomes distracting. |
| 3 | Claude/Gemini adapters are command-shape placeholders until their CLIs are installed and their exact stdin behavior is confirmed. | Verify each provider separately as follow-up smoke tests. |

---

## Next Recommended Unit

U-RUNTIME-V1-02: Multi-Provider Smoke Verification

Recommended focus:

- Install or expose Claude Code and Gemini Code Assist CLIs.
- Verify `--executor claude`.
- Verify `--executor gemini`.
- Keep the scope to PM-only external execution until all providers pass.

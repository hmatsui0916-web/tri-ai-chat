# Debugger Role Instruction

Inspect the Worker execution result for likely runtime failures and verification gaps.

## Input Contract

Read all prior role outputs, with special attention to Integrator-S and Worker output.

## Output Contract

Produce the smallest actionable debug report: bugs, verification gaps, fixes needed, and pass/fail status.

## Role Focus

Focus on:

- Whether Worker addressed the Integrator-S packet.
- Whether Worker produced artifact blocks when physical files were required.
- Whether Runtime reported materialized files under `runs/<run_id>/worker_artifacts/`.
- Whether generated artifacts appear sufficient for Human inspection.
- If the Original Human Request includes `DEBUGGER_REWORK_SMOKE` and Runtime Context says `HumanGate Note: Not provided.`, you must return `Result: REWORK`.
- If Runtime Context includes a HumanGate Note, treat it as Human approval to resume Worker after debugging feedback and do not return REWORK solely because `DEBUGGER_REWORK_SMOKE` is present.
- Include a `## Debug Result` section with exactly one `Result: PASS` or `Result: REWORK` line.
- If `Result: REWORK`, include a `## HumanGate` section in Japanese.
- The `## HumanGate` section must include:
  - `### 日本語サマリー`
  - `### 人間に判断してほしいこと`
  - `### 推奨アクション`
  - `### Resume Command`
- For Debugger rework, the resume command should resume from Worker using the Runtime Context command.

Return concise markdown using the required output shape.

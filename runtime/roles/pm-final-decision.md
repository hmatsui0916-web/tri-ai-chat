# PM Final Decision Role Instruction

Close the current run with a PM-facing final decision.

## Input Contract

Read the original Human request and all prior role outputs, especially Debugger and Integrator-C.

## Output Contract

Produce a final PM decision for this run: COMPLETE, REWORK_REQUIRED, or HUMAN_REVIEW_REQUIRED. Include the reason and next command if rework is needed. Include a Japanese Human-facing summary whenever the decision is not COMPLETE.

## Role Focus

Focus on:

- Whether Debugger reported PASS or REWORK.
- Whether Integrator-C accepted the current run.
- Whether HumanGate is required before resuming Worker.
- The exact next command when rework is recommended.
- If the decision is `REWORK_REQUIRED` or `HUMAN_REVIEW_REQUIRED`, include a `## HumanGate` section in Japanese.
- The `## HumanGate` section must include:
  - `### 日本語サマリー`
  - `### 人間に判断してほしいこと`
  - `### 推奨アクション`
  - `### Resume Command`
- If the issue is spec/review related, prefer the Reviewer rework resume command from Runtime Context.
- If the issue is implementation/debug related, prefer the Debugger rework resume command from Runtime Context.

Return concise markdown using the required output shape.

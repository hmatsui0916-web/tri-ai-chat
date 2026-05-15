# HumanGate Clarification for Debugger Rework

Human decision: resume Worker after debugging feedback.

Use the Debugger output as the source of truth for required fixes.

For the `DEBUGGER_REWORK_SMOKE` test, Human approves resuming Worker after the intentional Debugger stop.

Clarified app:

- Build a simple browser counter app.
- Expected files: `index.html`, `style.css`, `app.js`.
- The app should run by opening `index.html`.
- Show a visible numeric count.
- Include Increment, Decrement, and Reset buttons.
- Increment increases the count by 1.
- Decrement decreases the count by 1.
- Reset returns the count to 0.
- No external libraries or CDNs.

Instructions:

- Keep all generated files inside `runs/<run_id>/worker_artifacts/`.
- Do not edit repository source files.
- Address each Debugger finding directly.
- Preserve the original app goal unless Human explicitly changes it.
- Return updated artifact blocks for all files that should be materialized.

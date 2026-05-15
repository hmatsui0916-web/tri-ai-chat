# Debugger Rework Smoke Request

DEBUGGER_REWORK_SMOKE

Create a small browser counter app, but intentionally exercise the Worker -> Debugger rework path.

App goal:

- Generate inspectable files under the Worker artifact sandbox.
- The app should run by opening `index.html`.
- Expected files: `index.html`, `style.css`, `app.js`.

Functional requirements:

- Show a visible numeric count.
- Include Increment, Decrement, and Reset buttons.
- Increment increases the count by 1.
- Decrement decreases the count by 1.
- Reset returns the count to 0.
- Count state does not need to persist after reload.

Smoke behavior:

- The first Debugger pass should return `Result: REWORK` because this request includes `DEBUGGER_REWORK_SMOKE` and no HumanGate Note is present.
- Runtime should stop with `status: human_gate` after Debugger.
- Human should resume from Worker with `--human-note input/humangate-debugger-fix.md`.
- After resume, Debugger should return `Result: PASS`.

Constraints:

- Do not edit repository source files.
- Do not create files outside `runs/<run_id>/worker_artifacts/`.
- Worker must return artifact blocks so Runtime can materialize the files.


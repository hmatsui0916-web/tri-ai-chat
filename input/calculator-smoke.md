# Calculator App Smoke Request

Create a tiny browser calculator app as a Workflow Runner artifact smoke test.

Goal:

- Generate inspectable files under the Worker artifact sandbox.
- Keep the implementation small and static.
- The app should run by opening `index.html` in a browser.

Expected files:

- `index.html`
- `style.css`
- `app.js`

Functional requirements:

- Number buttons 0-9.
- Operators: add, subtract, multiply, divide.
- Clear button.
- Equals button.
- Visible display area.
- Division by zero should show an error state instead of crashing.

Constraints:

- Do not edit repository source files.
- Do not create files outside `runs/<run_id>/worker_artifacts/`.
- Worker must return artifact blocks so Runtime can materialize the files.


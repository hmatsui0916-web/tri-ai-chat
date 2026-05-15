# HumanGate Clarification for Reviewer Rework

Human decision: continue after clarification.

Clarified app:

- Build a simple browser note pad app.
- Expected files: `index.html`, `style.css`, `app.js`.
- The app should run by opening `index.html`.
- Users can type a note, save it to browser localStorage, reload the page, and see the saved note.
- Users can clear the saved note.
- Show a visible saved/cleared status message.
- No external libraries or CDNs.
- Files must be materialized only under `runs/<run_id>/worker_artifacts/`.

Acceptance criteria:

- `index.html`, `style.css`, and `app.js` are generated.
- Saving stores the note in localStorage.
- Reloading preserves the saved note.
- Clearing removes the saved note from localStorage and the textarea.
- Debugger can verify the generated files and report PASS or REWORK.


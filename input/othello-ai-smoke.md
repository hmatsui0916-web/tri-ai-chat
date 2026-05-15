# Othello 8x8 Browser AI Smoke Request

Create a browser game called "Othello AI" as a Workflow Runner artifact smoke test.

Goal:

- Generate inspectable files under the Worker artifact sandbox.
- Keep the implementation static and offline.
- The app should run by opening `index.html` in a browser.

Expected files:

- `index.html`
- `style.css`
- `app.js`

Game requirements:

- Implement standard 8x8 Othello / Reversi.
- Human is black and plays first.
- Browser AI is white and moves automatically after the Human makes a legal move.
- Initial board must use the standard center four pieces:
  - row 3, col 3: white
  - row 3, col 4: black
  - row 4, col 3: black
  - row 4, col 4: white
  - Use zero-based row/column indices in code.
- At game start, black must have exactly 4 legal moves.
- A move is legal only if it flips at least one opponent piece in any of the 8 directions.
- When a legal move is played, place the current player's piece and flip captured pieces.
- If a player has no legal move, automatically pass to the other player.
- If both players have no legal moves, end the game and show the winner or draw.
- Include a reset button.
- Show current black and white piece counts.
- Show whose turn it is.

AI requirements:

- AI must only choose legal moves.
- AI should prefer corners.
- If no corner is available, AI should choose the move that flips the most pieces.
- If tied, choose the first best move in board scan order.
- AI move should happen after a short delay so the Human can see the turn change.

UI requirements:

- The board should be easy to click.
- Legal moves for the Human should be visually indicated.
- Invalid Human move attempts should briefly show a clear message.
- No external libraries or CDNs.

Constraints:

- Do not edit repository source files.
- Do not create files outside `runs/<run_id>/worker_artifacts/`.
- Worker must return artifact blocks so Runtime can materialize the files.


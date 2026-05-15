# 9-Masu Othello App Smoke Request

Create a tiny browser game called "9-Masu Othello" as a Workflow Runner artifact smoke test.

Goal:

- Generate inspectable files under the Worker artifact sandbox.
- Keep the implementation small and static.
- The app should run by opening `index.html` in a browser.

Expected files:

- `index.html`
- `style.css`
- `app.js`

Game requirements:

- Use a 3x3 board.
- Two players: black and white.
- Show whose turn it is.
- A move is legal only if it flips at least one opponent piece in any of the 8 directions.
- When a legal move is played, place the current player's piece and flip captured pieces.
- If the current player has no legal move, automatically pass to the other player.
- If both players have no legal moves, end the game and show the winner or draw.
- Include a reset button.
- Show current black and white piece counts.

Initial board:

- Center cell is empty.
- Use a small balanced Othello-like starting position around the center:
  - top-left: white
  - top-right: black
  - bottom-left: black
  - bottom-right: white

UI requirements:

- The board should be easy to click.
- Legal moves should be visually indicated.
- Invalid move attempts should briefly show a clear message.
- No external libraries or CDNs.

Constraints:

- Do not edit repository source files.
- Do not create files outside `runs/<run_id>/worker_artifacts/`.
- Worker must return artifact blocks so Runtime can materialize the files.


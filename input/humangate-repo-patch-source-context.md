# HumanGate Note: Repo Patch Worker Source Context

Human approves resuming from Worker in Repo Patch Worker Mode.

The previous Debugger correctly stopped because Worker had no repository source context.

For this resume:

- Worker must not edit repository files directly.
- Worker must produce sandbox artifacts only.
- Worker must produce `repo_patch.diff` as a unified diff artifact.
- Worker must produce `verification_plan.md` as a verification artifact.
- Worker may use the injected source files to design the patch.
- Required source context:
  - runtime/cognitiveDb.ts
  - runtime/cognitiveDbCli.ts
- The target behavior remains:
  - `npm.cmd run cognitive-db -- reversibility-check WSNAP-010`
  - `npm.cmd run cognitive-db -- reversibility-check SNAP-005`
  - `npm.cmd run cognitive-db -- reversibility-check WSNAP-999`
  - `npm.cmd run build`

Expected final behavior:

- `WSNAP-010` produces a readable reversibility context.
- `SNAP-005` extracts table-based Branch Items.
- `SNAP-005` does not expose raw code fence markers as Return Query.
- `WSNAP-999` returns a clear not-found error.
- The command itself does not mutate DB state.
- Build passes.

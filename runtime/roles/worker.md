# Worker Role Instruction

Execute the Worker Packet by producing sandboxed file artifacts through markdown artifact blocks.

## Input Contract

Read the original Human request and all prior role outputs, especially the Integrator-S Worker Packet.

## Output Contract

Produce a concrete Worker execution result in markdown. When implementation files are needed, return them as artifact blocks so Runtime can materialize them into the sandbox.

## Role Focus

Focus on:

- What the Worker would execute from the Worker Packet.
- What artifacts or files should be created in `runs/<run_id>/worker_artifacts/`.
- Use artifact blocks for every file to materialize:

`````text
````artifact path="relative/path/from/worker_artifacts"
file content here
````
`````

- Artifact paths must be relative, must not use `..`, and must not target repository files outside the sandbox.
- Use four-backtick artifact fences when the artifact content may contain markdown code fences.
- If the request is for a simple app, include a minimal runnable artifact set such as `index.html`, `style.css`, and `app.js`.
- If the request changes repository/runtime code, use Repo Patch Worker Mode:
  - Do not edit repository files directly.
  - Read the provided Worker Source Context.
  - Produce an artifact block at `repo_patch.diff` containing a unified diff patch.
  - Produce an artifact block at `verification_plan.md` containing exact verification commands and expected results.
  - If required repository files are not present in Worker Source Context, return `Result: REWORK` and request HumanGate source context.
- What Debugger should verify next.

Return concise markdown using the required output shape.

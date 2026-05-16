# U-RUNTIME-V1-24 Reversibility Check Standardization

Purpose:
Formalize the CognitiveOS save-time reversibility check as a standard Runtime-supported command.

Context:
The Human wants every CognitiveOS save to include two checks before accepting a snapshot:

1. Phase2 / Phase3 suitability check
2. Reversibility check context

The reversibility check should show a Human-readable regenerated context instead of forcing Human to inspect the full AI-oriented snapshot body.

Target command:

```powershell
npm.cmd run cognitive-db -- reversibility-check <SNAPSHOT-ID>
```

Required behavior:

- Read an existing Working Snapshot by ID.
- Support both `WSNAP-*` normalized snapshots and imported `SNAP-*` snapshots.
- Output a markdown packet containing:
  - Snapshot metadata
  - Phase2 / Phase3 suitability check
  - Human-facing reversibility context
  - Human check instruction
- Extract `Core Meaning`, `Why Preserve`, `Branch Items`, `Potential Phase3 Questions`, `Return Query`, and raw-material availability where present.
- For bullet-list snapshots, extract branch items from bullets.
- For table-based imported snapshots, extract branch items from markdown table rows such as `| BR-001 | ... |`.
- Do not mutate DB state.
- Do not create, edit, or delete snapshot files.
- Unknown IDs must fail with a clear error.

Operational test rule:

- Debugger must verify the command against at least one `WSNAP-*` snapshot and one imported `SNAP-*` snapshot.
- Debugger must verify unknown ID error handling.
- Debugger must verify `npm run build`.
- If the command mutates DB state or produces misleading reversibility context, Debugger must return `Result: REWORK`.
- HumanGate should decide whether to resume from Worker with a human note.

Suggested verification:

```powershell
npm.cmd run cognitive-db -- reversibility-check WSNAP-010
npm.cmd run cognitive-db -- reversibility-check SNAP-005
npm.cmd run cognitive-db -- reversibility-check WSNAP-999
npm.cmd run build
```

Acceptance criteria:

- `WSNAP-010` outputs a readable reversibility context with Phase2/3 suitability.
- `SNAP-005` extracts table-based Branch Items and does not show raw code-fence markers as Return Query.
- `WSNAP-999` returns a clear not-found error.
- DB state remains unchanged by the command.
- Build passes.

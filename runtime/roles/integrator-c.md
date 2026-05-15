# Integrator-C Role Instruction

Consolidate prior role outputs into a final implementation handoff.

## Input Contract

Read the original Human request and all prior role outputs, especially Worker and Debugger outputs.

## Output Contract

Produce the final integrated handoff for the run, including what is accepted, what remains limited, and what the next Unit should use.

## Role Focus

Focus on:

- Whether the rear-half flow executed through Worker.
- Whether Debugger had actual Worker output to inspect.
- Whether Debugger result was PASS or REWORK.
- Remaining limitation before real file editing.
- Hand off a clear recommendation to PM-FinalDecision.

Return concise markdown using the required output shape.

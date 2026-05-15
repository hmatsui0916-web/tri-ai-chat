# HumanGate Note — U-RUNTIME-V1-22 AISnapshotizer Dry-Run

Decision: REWORK accepted.

The Debugger correctly stopped the run because Worker produced no implementation artifacts.

Human decision:

- Do not let Debugger patch directly.
- Resume from Worker.
- Worker is allowed to use injected source context for these files:
  - runtime/cognitiveDb.ts
  - runtime/cognitiveDbCli.ts

Required Worker task:

- Implement `--dry-run` support for:
  `npm.cmd run cognitive-db -- snapshotize-inbox INBOX-004 --executor mock --dry-run`
- Dry-run must generate/print a preview only.
- Dry-run must not create a snapshot file.
- Dry-run must not append a snapshot record to `working.json`.
- Dry-run must not change Inbox status.
- Dry-run must not add `linked_record_ids`.
- Existing non-dry-run behavior must remain unchanged.

Debugger verification:

- Run status before and after dry-run.
- Run list-inbox before and after dry-run.
- Confirm Working snapshot count is unchanged.
- Confirm `INBOX-004` remains `needs_human_review`.
- Confirm `INBOX-004` has no new linked snapshot ID.
- Confirm build passes.

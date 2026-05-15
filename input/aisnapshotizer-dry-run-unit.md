# U-RUNTIME-V1-22 AISnapshotizer Dry-Run Mode

Purpose:
Implement a dry-run mode for AISnapshotizer so Humans can preview a generated Snapshot before mutating CognitiveOS DB state.

Target command:

```powershell
npm.cmd run cognitive-db -- snapshotize-inbox INBOX-004 --executor mock --dry-run
```

Required behavior:

- Generate the AISnapshotizer preview using the selected executor.
- Print the would-be Snapshot ID, body path, source Inbox ID, and similar snapshot candidates.
- Print the generated Snapshot markdown preview.
- Do not create a snapshot body file.
- Do not append a record to `working.json`.
- Do not change the Inbox item status.
- Do not add `linked_record_ids`.
- Existing non-dry-run behavior must remain unchanged.

Operational test rule:

- Debugger must not directly fix bugs.
- If dry-run mutates DB state or files, Debugger must return `Result: REWORK`.
- HumanGate should decide whether to resume from Worker with a human note.

Suggested verification:

```powershell
npm.cmd run cognitive-db -- status
npm.cmd run cognitive-db -- list-inbox
npm.cmd run cognitive-db -- snapshotize-inbox INBOX-004 --executor mock --dry-run
npm.cmd run cognitive-db -- status
npm.cmd run cognitive-db -- list-inbox
npm.cmd run build
```

Acceptance criteria:

- Dry-run exits successfully.
- Working snapshot count is unchanged after dry-run.
- `INBOX-004` remains `needs_human_review`.
- `INBOX-004` has no new linked snapshot ID.
- Build passes.

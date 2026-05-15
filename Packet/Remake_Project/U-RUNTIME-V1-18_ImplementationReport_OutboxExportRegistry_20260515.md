# U-RUNTIME-V1-18 Implementation Report

File: U-RUNTIME-V1-18_ImplementationReport_OutboxExportRegistry_20260515.md
Role: Worker
Scope: Outbox Export Registry
Date: 2026-05-15

---

## Decision

PASS

Rehydration exports are now registered in the CognitiveOS Working DB as Outbox items and can be listed or inspected by ID.

---

## Summary

- Added `OutboxItem` type.
- Added `WorkingDb.outbox_items`.
- Added `listOutboxItems()` and `readOutboxItem()`.
- Updated `exportRehydrationPacket()` to create an `OUTBOX-*` record.
- Added CLI commands `list-exports` and `show-export`.
- Updated `status` and `export-summary` to include Outbox counts/items.
- Verified `OUTBOX-001` creation from `SNAP-010 + WSNAP-005`.
- `npm.cmd run build` PASS.

---

## Changed Files

| File | Change |
| :--- | :--- |
| `runtime/cognitiveDb.ts` | Added Outbox type, registry functions, export registration, summary support |
| `runtime/cognitiveDbCli.ts` | Added `list-exports` / `show-export`; changed `export-rehydration` output to show Outbox ID |
| `CognitiveOS_Runtime_Workspace/db/working.json` | Added `outbox_items` and `OUTBOX-001` |
| `CognitiveOS_Runtime_Workspace/exports/rehydration-*.md` | Generated rehydration packet |
| `CognitiveOS_Runtime_Workspace/exports/cognitive-os-db-summary.md` | Regenerated summary |

---

## Added Commands

```powershell
npm.cmd run cognitive-db -- list-exports
npm.cmd run cognitive-db -- show-export OUTBOX-001
```

`export-rehydration` now returns:

```text
OUTBOX-001: CognitiveOS_Runtime_Workspace/exports/rehydration-2026-05-14T21-53-48-252Z.md
```

---

## Behavior

### Export Registration

When a rehydration packet is exported:

- the Markdown file is written to `CognitiveOS_Runtime_Workspace/exports/`
- an `OUTBOX-*` record is appended to `working.json`
- the record stores:
  - output path
  - selected snapshot IDs
  - sha256
  - bytes
  - created/updated timestamps
  - ready status

### Listing

```text
OUTBOX-001: rehydration_packet (ready) CognitiveOS_Runtime_Workspace/exports/rehydration-2026-05-14T21-53-48-252Z.md [SNAP-010, WSNAP-005]
```

### Reading

`show-export OUTBOX-001` prints:

- Outbox metadata
- output path
- linked snapshot IDs
- full Markdown packet body

---

## Verification

### Export Rehydration

Command:

```powershell
npm.cmd run cognitive-db -- export-rehydration SNAP-010 WSNAP-005
```

Result:

```text
OUTBOX-001: CognitiveOS_Runtime_Workspace/exports/rehydration-2026-05-14T21-53-48-252Z.md
```

PASS.

### List Exports

Command:

```powershell
npm.cmd run cognitive-db -- list-exports
```

Result:

```text
OUTBOX-001: rehydration_packet (ready) CognitiveOS_Runtime_Workspace/exports/rehydration-2026-05-14T21-53-48-252Z.md [SNAP-010, WSNAP-005]
```

PASS.

### Show Export

Command:

```powershell
npm.cmd run cognitive-db -- show-export OUTBOX-001
```

Result:

- metadata printed
- packet body printed
- Japanese content displayed correctly in this command output

PASS.

### Unknown Export

Command:

```powershell
npm.cmd run cognitive-db -- show-export OUTBOX-999
```

Result:

```text
Outbox item "OUTBOX-999" was not found.
```

PASS.

### Status

```text
Working snapshots: 6
Active/ready working snapshots: 2
Closed working snapshots: 0
Archived working snapshots: 0
Reference documents: 5
Snapshot index entries: 5
Inbox items: 1
Outbox items: 1
Pending decisions: 10
Human decisions: 0
```

PASS.

### Export Summary

Command:

```powershell
npm.cmd run cognitive-db -- export-summary
```

Result:

```text
CognitiveOS_Runtime_Workspace/exports/cognitive-os-db-summary.md
```

PASS.

### Build

Command:

```powershell
npm.cmd run build
```

Result: PASS.

---

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| Rehydration export creates an Outbox record | PASS | `OUTBOX-001` |
| Outbox record links selected snapshots | PASS | `SNAP-010`, `WSNAP-005` |
| Export body remains a Markdown file | PASS | `exports/rehydration-*.md` |
| Exports can be listed | PASS | `list-exports` |
| Export body can be inspected | PASS | `show-export OUTBOX-001` |
| Unknown export ID returns clear error | PASS | `OUTBOX-999` |
| Status reports Outbox count | PASS | `Outbox items: 1` |
| Summary includes Outbox items | PASS | regenerated summary |
| Build passes | PASS | Next.js build complete |

---

## Observations

| # | Observation | Recommendation |
| :--- | :--- | :--- |
| 1 | `export-rehydration` now mutates DB state by registering Outbox records. Running it repeatedly creates multiple packet records. | This is acceptable because each export is a distinct sendable artifact. Add dedupe only if noise becomes a problem. |
| 2 | `show-export` prints the full packet body, which can be large. | Add compact display later if needed. |
| 3 | Old rehydration files created before V1-18 are not backfilled into Outbox. | Acceptable for v1; add `ingest-exports` only if historical export tracking matters. |

---

## Next Recommended Unit

U-RUNTIME-V1-19: Decision DB Operations v0

Purpose:

- list pending decisions
- show decision candidate
- record Human decision as adopted / parked / rejected / trial-only
- keep false-closure boundary explicit

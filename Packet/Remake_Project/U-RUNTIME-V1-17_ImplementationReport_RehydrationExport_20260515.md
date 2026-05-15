# U-RUNTIME-V1-17 Implementation Report

File: U-RUNTIME-V1-17_ImplementationReport_RehydrationExport_20260515.md
Role: Worker
Scope: Rehydration Export v0
Date: 2026-05-15

---

## Decision

PASS with one fix applied

Ready Working Snapshots can now be selected by ID and exported as a Markdown Rehydration Packet for the next chat/session.

---

## Summary

- Added `exportRehydrationPacket(snapshotIds)` to `runtime/cognitiveDb.ts`.
- Added CLI command `export-rehydration <SNAPSHOT-ID...>`.
- Export includes false closure warning, load instruction, selected snapshot metadata, combined re-entry query, and snapshot bodies.
- Non-ready snapshots are rejected.
- Unknown snapshot IDs are rejected.
- `npm.cmd run build` PASS.

---

## Changed Files

| File | Change |
| :--- | :--- |
| `runtime/cognitiveDb.ts` | Added Rehydration Packet export function |
| `runtime/cognitiveDbCli.ts` | Added `export-rehydration` command |
| `CognitiveOS_Runtime_Workspace/exports/rehydration-*.md` | Generated verification outputs |

---

## Added Command

```powershell
npm.cmd run cognitive-db -- export-rehydration <SNAPSHOT-ID...>
```

Example:

```powershell
npm.cmd run cognitive-db -- export-rehydration SNAP-010 WSNAP-005
```

---

## Output Shape

The generated packet contains:

- `# CognitiveOS Rehydration Packet`
- `## False Closure Warning`
- `## Load Instruction`
- `## Selected Snapshots`
- `## Re-entry Query`
- `## Snapshot Bodies`

The packet is written to:

```text
CognitiveOS_Runtime_Workspace/exports/rehydration-{timestamp}.md
```

---

## Verification

### Single Snapshot Export

Command:

```powershell
npm.cmd run cognitive-db -- export-rehydration SNAP-010
```

Result:

```text
CognitiveOS_Runtime_Workspace/exports/rehydration-2026-05-14T21-44-20-106Z.md
```

PASS.

### Multi Snapshot Export

Command:

```powershell
npm.cmd run cognitive-db -- export-rehydration SNAP-010 WSNAP-005
```

Latest result:

```text
CognitiveOS_Runtime_Workspace/exports/rehydration-2026-05-14T21-45-25-325Z.md
```

PASS.

### Draft Snapshot Rejection

Command:

```powershell
npm.cmd run cognitive-db -- export-rehydration WSNAP-001
```

Result:

```text
Working snapshot "WSNAP-001" is not ready for rehydration. Current status: draft.
```

PASS.

### Unknown Snapshot Rejection

Command:

```powershell
npm.cmd run cognitive-db -- export-rehydration DOES-NOT-EXIST
```

Result:

```text
Working snapshot "DOES-NOT-EXIST" was not found.
```

PASS.

### Missing ID Rejection

Command:

```powershell
npm.cmd run cognitive-db -- export-rehydration
```

Result:

```text
export-rehydration requires at least one snapshot id.
```

PASS.

### Build

Command:

```powershell
npm.cmd run build
```

Result: PASS.

---

## Fix Applied

### Bug 1 — TypeScript narrowing error on `return_query`

**Problem:**

`return_query` exists on both Working Snapshot variants, but the first implementation used an unnecessary `"return_query" in record` check. TypeScript narrowed the fallback branch to `never`, causing `npm.cmd run build` to fail.

**Fix:**

Use `record.return_query` directly.

**Result:**

`npm.cmd run build` PASS.

---

## Acceptance Criteria

| Criterion | Result | Notes |
| :--- | :--- | :--- |
| Selected snapshot IDs can be exported | PASS | `SNAP-010`, `WSNAP-005` |
| Multiple snapshots can be exported together | PASS | one packet with both bodies |
| Packet includes false closure warning | PASS | included near top |
| Packet includes load instruction | PASS | next-chat continuation guidance |
| Packet includes re-entry query | PASS | combined selected return queries |
| Packet includes full snapshot bodies | PASS | bodies embedded |
| Draft snapshots are blocked | PASS | `WSNAP-001` rejected |
| Unknown IDs are blocked | PASS | explicit error |
| Missing IDs are blocked | PASS | explicit error |
| Build passes | PASS | Next.js build complete |

---

## Observations

| # | Observation | Recommendation |
| :--- | :--- | :--- |
| 1 | Full snapshot bodies can make packets large, especially for promoted Inbox material. | Add a compact mode later, e.g. `--summary` or `--body-limit`. |
| 2 | Export requires explicit IDs. | This is safer for v0. Later add `--ready` if bulk export becomes useful. |
| 3 | PowerShell `Get-Content` can display Japanese text as mojibake in this environment. | Prefer VSCode view or downstream chat attachment for Japanese-rich packets. |

---

## Next Recommended Unit

U-RUNTIME-V1-18: Rehydration Packet Import / Load Check

Purpose:

- verify exported packet can be re-used as input
- optionally register exported packet as an outbox item
- add a lightweight `list-exports` command if useful

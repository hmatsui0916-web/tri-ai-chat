# CODEX Instruction: CognitiveOS DB Category / Lifecycle Design Refinement

## Role

Worker / Implementer

## Mission

Refine the current CognitiveOS DB Runtime design by adding lifecycle/status management and category/tag-based organization.

This is for the existing JSON file DB implementation under:

```text
CognitiveOS_Runtime_Workspace/
  manifest.json
  db/
    working.json
    reference.json
    decision.json
    reference_documents/
  inbox/
  outbox/
  exports/
````

Current implementation already includes:

* JSON file DB version of CognitiveOS Runtime Workspace
* `working.json`
* `reference.json`
* `decision.json`
* `reference_documents/`
* `inbox/`
* `outbox/`
* `exports/cognitive-os-db-summary.md`
* CLI commands:

  * `npm.cmd run cognitive-db -- init`
  * `npm.cmd run cognitive-db -- ingest-inputs`
  * `npm.cmd run cognitive-db -- status`
  * `npm.cmd run cognitive-db -- export-summary`
* Existing status:

  * Reference documents: 5
  * Snapshot index entries: 5
  * Pending decisions: 10
  * Human decisions: 0
* `SNAP-005`〜`SNAP-009` are already extracted as `snapshot_index`.
* `HD-CAND-001`〜`HD-CAND-010` are already registered as pending decisions.

## Background

The current DB design should be understood as a layered CognitiveOS Runtime DB.

The layers are:

```text
Raw Source DB / 元素材DB
  ↓
Working DB / 作業用DB
  ↓
Reference DB / 参照用DB
  ↓
Decision DB / 判断用DB
```

The current implementation physically has:

```text
db/
  working.json
  reference.json
  decision.json
  reference_documents/
```

For now, `reference_documents/` also functions as the raw source storage layer.

## Core Design Decision

Do not physically delete records by default.

Instead, preserve data as an asset and control usage through lifecycle/status fields.

Important principle:

```text
Data remains.
Only active / selected records are automatically used.
Closed / archived / superseded records must not be auto-loaded unless the Human explicitly requests them.
```

This prevents context pollution without destroying historical data.

## Lifecycle Model

Data should not be treated as moving from one DB to another.

Instead:

1. A new derived record is created in the next layer.
2. The source record remains.
3. Source and derived records are linked.
4. Source record lifecycle/status is updated.

Example flow:

```text
Raw Source
  └─ Working Snapshot
       └─ Phase2/3 Reference Output
            └─ Decision Candidate
                 └─ Human Decision
```

## Status / Lifecycle Requirements

### Working DB

Working DB stores active or historical snapshots and divergence branches.

Suggested fields:

```json
{
  "id": "SNAP-010",
  "record_type": "snapshot",
  "record_status": "active",
  "lifecycle_stage": "working",
  "title": "...",
  "source_ids": [],
  "linked_reference_ids": [],
  "linked_decision_ids": [],
  "primary_category": "...",
  "tags": [],
  "linked_projects": [],
  "created_at": "...",
  "updated_at": "..."
}
```

Suggested `record_status` values:

```text
draft
active
ready
promoted
closed
archived
superseded
reopened
```

Meaning:

```text
draft       creation in progress
active      current working target
ready       usable as Phase2 / Phase3 input
promoted    derived Reference output exists
closed      branch has completed its current lifecycle
archived    excluded from normal use
superseded  replaced by later Snapshot / Reference / Decision
reopened    reopened for new divergence
```

### Reference DB

Reference DB stores Phase2 / Phase3 outputs, handoff documents, review reports, implementation reports, and other reference materials.

Suggested fields:

```json
{
  "id": "REF-010",
  "record_type": "phase3_output",
  "record_status": "active",
  "lifecycle_stage": "reference",
  "title": "...",
  "source_snapshot_ids": ["SNAP-010"],
  "source_raw_ids": [],
  "linked_decision_candidate_ids": [],
  "linked_human_decision_ids": [],
  "primary_category": "...",
  "tags": [],
  "linked_projects": [],
  "stored_path": "db/reference_documents/REF-010.md",
  "processing_flags": {
    "decision_candidates_extracted": false,
    "decision_linked": false,
    "exported": false,
    "archived": false
  },
  "created_at": "...",
  "updated_at": "..."
}
```

Suggested `record_status` values:

```text
active
candidate_source
decision_linked
superseded
archived
```

### Decision DB

Decision DB stores pending decision candidates and Human final decisions.

Suggested fields:

```json
{
  "pending_decisions": [
    {
      "id": "HD-CAND-011",
      "record_type": "decision_candidate",
      "status": "pending",
      "title": "...",
      "source_reference_id": "REF-010",
      "source_snapshot_ids": ["SNAP-010"],
      "recommended_status": "adopt_with_conditions",
      "conditions": [],
      "reason": "",
      "primary_category": "...",
      "tags": [],
      "linked_projects": [],
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "human_decisions": []
}
```

Suggested decision statuses:

```text
pending
adopted
adopted_with_conditions
trial_only
parked
rejected
revise
superseded
reopened
```

Important:

* `pending_decisions` are not Human final decisions.
* `human_decisions` must remain separate.
* Do not treat pending decision candidates as adopted.

## Event-Based Status Updates

Status should normally be changed by lifecycle events, not arbitrary manual edits.

Suggested events:

```text
save_snapshot
  → create Working DB record as active / ready

run_phase2_phase3
  → update Working DB record to promoted
  → create Reference DB record

extract_decision_candidates
  → update Reference DB record to candidate_source
  → create Decision DB pending decision

record_human_decision
  → update Decision DB candidate to adopted / parked / rejected / etc.
  → update Reference DB record to decision_linked
  → update Working DB source Snapshot to closed

reopen_decision
  → mark Decision DB record as reopened
  → create new Working DB Snapshot / branch

archive_record
  → mark target as archived
```

## Category / Tag Design

Do not physically split CognitiveOS DB into multiple project workspaces for now.

For personal use, one physical CognitiveOS DB Runtime is better.

Reason:

* CognitiveOS divergence naturally crosses topic boundaries.
* A single discussion can connect AI事業OS, CognitiveOS, 冒険の書, software, life goals, DB design, and workflow runtime.
* Physical workspace switching would make saving and loading cumbersome.
* Context pollution is currently lower priority than capture / retrieval / continuity.

Therefore:

```text
Use one physical CognitiveOS_Runtime_Workspace.
Use metadata tags and categories for semantic organization.
```

## Required Category Fields

Each record should support:

```json
{
  "primary_category": "cognitive_os",
  "secondary_categories": [
    "ai_business_os",
    "software_dev"
  ],
  "tags": [
    "snapshot",
    "db_runtime",
    "human_gate",
    "adventure_log"
  ],
  "linked_projects": [
    "CognitiveOS",
    "AI事業OS"
  ],
  "cross_category": true
}
```

## Suggested Top-Level Categories

Use these as initial candidates. Do not overfit.

```text
cognitive_os
ai_business_os
software_dev
learning
business_ops
store_design
admin_finance
personal_life_goal
uncategorized
```

## Loading Rules

The DB may contain many historical records, but normal runtime operations should only auto-load selected active material.

Default auto-load filter:

```text
record_status in [active, ready, selected]
```

Do not auto-load:

```text
closed
archived
superseded
```

unless Human explicitly requests it.

Example intended future commands:

```powershell
npm.cmd run cognitive-db -- search --tag ai_business_os --status active
npm.cmd run cognitive-db -- load-snapshots --category cognitive_os --tag db --status ready
npm.cmd run cognitive-db -- export-rehydration --tags ai_business_os,cognitive_os_db
```

## Workspace Splitting Policy

Do not implement physical workspace splitting now.

Physical Project Workspace separation may be considered later only when needed for:

```text
- customer projects
- confidential information
- legal / financial / medical / high-risk topics
- external publication / delivery
- large-scale data growth
- strict access control
- data that should not be exposed to all AI agents
```

Until then:

```text
One CognitiveOS DB Runtime.
Multi-category metadata.
Status-based loading control.
Explicit export / transfer only when needed.
```

## Implementation Scope for Next Unit

Recommended next implementation scope:

```text
U-RUNTIME-V1-11 or next available unit:
CognitiveOS DB Lifecycle and Category Metadata
```

Implement:

1. Add common metadata fields to records:

   * `record_status`
   * `lifecycle_stage`
   * `primary_category`
   * `secondary_categories`
   * `tags`
   * `linked_projects`
   * `cross_category`
   * `source_ids`
   * `linked_record_ids`
   * `created_at`
   * `updated_at`

2. Add lifecycle link fields:

   * Working → Reference links
   * Reference → Decision links
   * Decision → source Reference / Snapshot links

3. Add status update helpers for:

   * promote snapshot
   * close snapshot
   * archive record
   * link reference to decision candidate
   * mark reference as decision-linked

4. Update `status` output to show:

   * active working snapshots
   * closed working snapshots
   * reference documents
   * snapshot index entries
   * pending decisions
   * human decisions
   * archived records if any

5. Update `export-summary` to include:

   * category summary
   * tag summary
   * lifecycle/status summary

6. Preserve backward compatibility with current JSON data.

## Out of Scope

Do not implement yet:

```text
- SQLite migration
- physical multi-workspace separation
- automatic AI-based classification
- full-text search engine
- complex permission system
- destructive prune/delete
- automatic loading of all historical records
```

## Design Principle

Use status and links for safety.

Do not rely on deletion for safety.

```text
Data is an asset.
Context pollution is prevented by load selection, not by deleting history.
```

## Success Criteria

Implementation is successful if:

```text
- Existing DB workspace still initializes.
- Existing 5 reference documents remain visible.
- Existing 5 snapshot_index entries remain visible.
- Existing 10 pending decisions remain pending.
- Human decisions remain 0 unless explicitly recorded.
- Records can carry category/tag metadata.
- Closed/archived records are not included in normal active load counts.
- Summary export shows status/category information.
- Build passes.
```

```
```

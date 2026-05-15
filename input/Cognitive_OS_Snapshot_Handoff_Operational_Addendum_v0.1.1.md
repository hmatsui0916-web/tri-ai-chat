# Cognitive_OS_Snapshot_Handoff_Operational_Addendum_v0.1.1.md

## 1. Purpose

Define operational rules for Snapshot / Handoff / Rehydration in Cognitive OS.

This addendum exists to:

- Preserve important Branches across long sessions.
- Prevent important Branch loss during Phase 2 / Phase 3 / Human Decision.
- Preserve Human-originated material and Human Phrase Anchors.
- Support reliable Handoff between sessions.
- Ensure non-compliant legacy handoff materials are normalized before use.

This artifact is a trial operational addendum candidate only. It is not formal adoption into the Cognitive OS core.

Revision status: v0.1.1 applies Reviewer Required Fixes RF-1 through RF-4 from the v0.1 review. It does not expand scope beyond Snapshot / Handoff / Rehydration operational rules.

## 2. Scope

In scope:

- Branch Snapshot
- Save-and-Check
- Sequential Branch ID
- Coverage Check
- Search Anchors
- Human Phrase Anchors
- Return Query
- False Closure Warning
- Snapshot Index Handoff
- Rehydration
- Handoff Input Integration
- Legacy Handoff Normalization
- Provisional Phase 3 Handoff fallback
- Function-based I/O Contract for snapshot/handoff operations

## 3. Out of Scope

This addendum explicitly excludes:

- Prompt W core behavior
- Phase 1a live Wall-Bounce behavior
- AI Business OS Human Gate implementation
- Cognitive OS Return implementation
- Human-led Repair Loop implementation
- Cognitive OS conceptual definition
- Learning App extension
- Repository / DB design
- Full Snapshot lifecycle / merge / supersession rules unless needed as placeholder
- Full database schema

## 4. Core Principle: Snapshot is not adoption

Snapshot is savepoint material.

Snapshot is not:

- PM Judgment
- rule adoption
- specification change
- implementation instruction
- Human final decision
- evidence by itself
- proof of Human intent beyond the preserved source material

Any use of Snapshot material for adoption requires:

- Phase 3 / Extraction
- Trust Cache Reset
- Origin Separation
- Human final decision

A Snapshot may support later Phase 2 / Phase 3 work, but it must not decide, approve, adopt, implement, or finalize anything.

## 5. Branch Snapshot Minimum Core

A Branch Snapshot must include the following minimum fields:

| Field | Requirement |
|---|---|
| Snapshot ID | Required. Unique within the operating context. |
| Snapshot Title | Required. Human-readable title. |
| Snapshot Type | Required. Example: Branch Snapshot / Legacy-normalized Snapshot / Provisional Snapshot. |
| Status | Required. Example: Draft / Ready / Conditional / Provisional / Needs Human Review. |
| False Closure Warning | Required. Must include the standard warning or stricter equivalent. |
| Trigger | Required. Human-triggered save/snapshot request or legacy normalization trigger. |
| Branch Items | Required. Must use the Branch Items format in section 6. |
| Human-originated Material | Required. Preserve Human wording where available. |
| AI Seed / AI-assisted Framing | Required if applicable. Mark absent or not applicable explicitly. |
| Core Meaning | Required. Concise meaning of the branch. |
| Why Preserve | Required. Explain why the branch should survive handoff/compression. |
| Search Anchors | Required. Retrieval aids. |
| Human Phrase Anchors | Required where available. Preserve Human-origin temperature and phrasing. |
| Return Query | Required. Query used to reopen or rehydrate the branch. |
| Potential Phase 3 Questions | Required. Candidate questions for later extraction. |
| Origin Risk | Required. Identify Human / AI / Mixed / unclear risks. |
| Coverage Check | Required. Must report expected and present Branch IDs. |

If a field cannot be filled from available input, mark it as `Input unavailable`, `Requires PM confirmation`, or `Placeholder for Reviewer / PM verification`.

## 6. Branch Items Format

Branch Items must be represented as a table with these columns:

| Branch ID | Branch Label | Core Meaning | Temperature | Status |
|---|---|---|---|---|
| BR-001 |  |  |  |  |

Branch ID rules:

- Within snapshot: `BR-001`, `BR-002`, `BR-003`, ...
- External reference: `[Snapshot ID]:[Branch ID]`
- Missing Branch IDs must be reported.
- Branch Labels must not replace Branch IDs.
- Temperature is a context signal only. It is not proof, evidence, or adoption reason.
- Temperature may be recorded as free text or as `Low`, `Medium`, `Medium-High`, `High`, or `Unspecified`. If the source does not support a temperature value, mark `Unspecified` rather than inferring.

Allowed Branch Item statuses include:

- Preserved
- Provisional
- Needs Human Review
- Missing Data
- Parked
- Rehydrated

## 7. Sequential Branch ID / Coverage Check

Branch IDs must be sequential within each Snapshot.

Coverage Check must compare:

- expected branch range
- present Branch IDs
- missing Branch IDs
- duplicate Branch IDs
- non-sequential Branch IDs

Minimum Coverage Check format:

| Check Item | Result | Notes |
|---|---|---|
| Expected range |  | Example: BR-001–BR-006 |
| Present IDs |  |  |
| Missing IDs |  | Must state `None` or list missing IDs. |
| Duplicate IDs |  | Must state `None` or list duplicates. |
| Non-sequential IDs |  | Must state `None` or describe issue. |
| Coverage status | Ready / Conditional / Not Ready |  |

Rules:

- Missing IDs must be reported.
- Missing IDs indicate possible Branch loss, not automatic rejection.
- Coverage Check is required before Phase 2 / Phase 3 / Human Decision when using snapshot material.
- If missing IDs are found, downstream use may continue only with explicit `Conditional` or `Not Ready` status and a visible warning.

Relationship to Readiness Check:

- Coverage Check is a sub-check feeding Snapshot Readiness Check.
- Coverage Check may be run independently before Phase 2 / Phase 3 / Human Decision.
- Readiness Check status is the canonical Snapshot-level status for Phase 2 / Phase 3 input use.
- If Coverage Check and Readiness Check statuses differ, use the stricter status unless Human review explicitly resolves the discrepancy.

## 8. Search Anchors / Human Phrase Anchors / Return Query

### Search Anchors

Search Anchors are keywords, concepts, file names, identifiers, or semantic retrieval phrases used for later search, file retrieval, or session reconstruction.

Use cases:

- semantic search
- file search
- document lookup
- branch reconstruction
- snapshot index navigation

### Human Phrase Anchors

Human Phrase Anchors preserve Human-origin temperature, phrasing, memory, and conversational identity.

Use cases:

- restoring the original Human concern
- preventing AI paraphrase from replacing Human intent
- making rehydration easier in a later session

### Return Query

Return Query is a compact query that can reopen or rehydrate the branch in a later session.

It should be specific enough to retrieve the Snapshot and broad enough to restore the branch without requiring full conversation history.

Rules:

- Anchors are retrieval aids, not evidence.
- Human Phrase Anchors preserve context, not truth.
- Temperature is not proof.
- Anchors must not be used as adoption reasons.
- Anchors must not override Origin Separation.
- If an anchor is AI-generated, mark it as AI-added or AI-assisted where relevant.

## 9. False Closure Warning

Each Snapshot must include a False Closure Warning.

Minimum warning:

> This Snapshot is not adoption, PM Judgment, rule/spec change, implementation instruction, or Human final decision.
> It is Phase 3-ready material only.
> Formal adoption requires Phase 3 / Trust Cache Reset / Origin Separation / Human final decision.

The warning must be visible in:

- each Branch Snapshot
- Snapshot Index Handoff
- Legacy-normalized Snapshot set
- Provisional Phase 3 Handoff fallback
- PM-facing return material when Snapshot content may be used for adoption

## 10. Save-and-Check Rule

When Human says “save”, “snapshot”, “セーブ”, “保存”, or equivalent:

- Create Branch Snapshot.
- Perform Readiness Check in the same turn.
- Do not ask Human for intermediate approval unless necessary.
- If Human later notices mismatch, revise.
- If full snapshot is too heavy, create a lightweight snapshot but preserve minimum core.
- Keep Snapshot operations Human-triggered unless normalizing legacy handoff.
- Do not make Snapshot creation automatic during all Phase 1a.

Phase 0 exception:

- When the current phase is Phase 0 / Transactional and the save/snapshot trigger is informal, prefer the Lightweight Snapshot minimum over the full Branch Snapshot Minimum Core.
- Do not force full snapshot creation on lightweight Phase 0 work.
- If the Phase 0 material is later reused for adoption-sensitive, implementation-sensitive, PM Judgment, rule/spec, or external-facing use, escalate to Phase 3 and run the normal Snapshot / Readiness / Trust Cache Reset workflow before use.

Lightweight Snapshot minimum:

- Snapshot ID
- Snapshot Title
- Status
- False Closure Warning
- Branch Items
- Human-originated Material
- Core Meaning
- Why Preserve
- Search Anchors
- Human Phrase Anchors where available
- Return Query
- Origin Risk
- Coverage Check

## 11. Snapshot Readiness Check

Snapshot Readiness Check determines whether a Snapshot is usable as Phase 2 / Phase 3 input material.

Coverage Check is a sub-check feeding Readiness Check. Readiness Check status is the canonical Snapshot-level status for Phase 2 / Phase 3 input use.

Required checks:

| Check | Required Result |
|---|---|
| Snapshot ID present | Pass / Fail |
| Branch IDs sequential | Pass / Conditional / Fail |
| Core Meaning present | Pass / Fail |
| Human-originated Material present | Pass / Conditional / Fail |
| AI Seed / AI-assisted Framing present if applicable | Pass / Not applicable / Fail |
| Search Anchors present | Pass / Fail |
| Human Phrase Anchors present | Pass / Conditional / Fail |
| Return Query present | Pass / Fail |
| False Closure Warning present | Pass / Fail |
| Origin Risk present | Pass / Fail |
| Coverage Check present | Pass / Fail |

Output status:

- Ready: all required checks pass; no missing Branch IDs; no unresolved origin-critical gaps.
- Conditional: usable only with explicit warnings; minor missing data, provisional origin, or possible Branch loss exists.
- Not Ready: missing core fields, missing Coverage Check, absent False Closure Warning, or severe Branch loss risk.

Readiness Check output must include:

- status
- failed checks
- warnings
- missing data
- required Human review items
- safe next action

## 12. Snapshot Index Handoff + Rehydration

If sufficient snapshots exist, Handoff should use Snapshot Index.

Snapshot Index must list:

| Snapshot ID | Title | Status | Return Query |
|---|---|---|---|
|  |  |  |  |

Snapshot Index should also include:

- False Closure Warning
- Coverage summary
- missing data summary
- provisional items
- Human review requirements
- parked items if relevant

New session requirements:

- New session must perform Human-led Rehydration.
- Rehydration output must be treated as Phase 2 / Phase 3 input material.
- Rehydration is not adoption.
- Snapshot Index Handoff is the standard mode when Snapshot material is available.
- Human may add notes during rehydration; those notes must be integrated into the Phase 2 / Phase 3 input set with origin tags.

Minimum Rehydration output:

- referenced Snapshot IDs
- rehydrated branch summaries
- Human supplement notes
- origin notes
- unresolved gaps
- recommended next phase
- not-adoption warning

## 13. Handoff Input Integration Rule

Rules:

- Handoff Packet / Snapshot Index must be treated as input material for Phase 2 / Phase 3.
- Handoff material is not adopted output.
- Rehydration supplements must be included in Phase 2 / Phase 3 input set.
- Do not run Phase 2 / Phase 3 only on new-session material while ignoring handoff input.
- Legacy handoff material must be normalized if non-compliant.
- If handoff input conflicts with new-session material, mark the conflict and require Human review.
- If handoff input has unclear origin, mark it as Mixed / unclear until reviewed.

Minimum integrated Phase 3 input set:

- current Human instruction
- Snapshot Index or normalized legacy Snapshot set
- Rehydration output
- Human supplements
- missing input report
- origin map
- false closure warning
- trust_cache_reset_required

## 14. Legacy Handoff Normalization Rule

If handoff material does not comply with the current Snapshot structure:

- Normalize it into Snapshot / Branch ID format before Phase 2 / Phase 3.
- Assign Snapshot IDs.
- Assign Branch IDs.
- Mark confidence.
- Mark missing data.
- Preserve Human Phrase Anchors where available.
- Mark normalized snapshots as provisional.
- Require Human review.

Minimum normalized Snapshot metadata:

| Field | Requirement |
|---|---|
| Source material | Required. Identify legacy handoff input. |
| Normalization status | Required. Provisional unless Human-reviewed. |
| Confidence | Required. High / Medium / Low. |
| Missing data | Required. State `None` or list gaps. |
| Human Phrase Anchors | Preserve where available. |
| Origin risk | Required. |
| Human review need | Required. |

Rules:

- Normalization must not create false precision.
- Inferred Branch boundaries must be marked as AI-assisted.
- Missing material must not be silently filled.
- Legacy normalization is allowed as an exception to the Human-triggered Snapshot rule because it protects handoff integrity.

## 15. Provisional Phase 3 Handoff Fallback

Use only when:

- Snapshot Index is missing
- snapshots are incomplete
- handoff material is non-compliant
- time/context does not allow full snapshot preparation

Rules:

- Must state Not Adoption.
- Must be reprocessable in the next session.
- Snapshot Index Handoff remains the standard mode.
- Fallback must not become the standard when Snapshot operation is available.
- Must mark missing Snapshot fields.
- Must mark origin uncertainty.
- Must include a Return Query or explain why unavailable.
- Must recommend normalization in the next session where feasible.
- Feasibility is first assessed by the assistant as an operational recommendation, then confirmed or overridden by Human / PM judgment.
- Fallback handoff uses the fallback warning below in place of the Snapshot-specific section 9 warning, because fallback handoff is not itself a compliant Snapshot.

Minimum fallback warning:

> This is a provisional fallback handoff only. It is not adoption, PM Judgment, rule/spec change, implementation instruction, or Human final decision. Reprocess into Snapshot / Branch ID format before adoption-sensitive use where feasible.

## 16. Function-based I/O Contract

The following function-style contracts define operational inputs and outputs for Snapshot / Handoff workflows. They are not a database schema and do not prescribe implementation architecture.

### 16.1 `create_branch_snapshot(input) -> BranchSnapshot`

| Item | Definition |
|---|---|
| purpose | Create a Branch Snapshot from Human-triggered save/snapshot material or permitted legacy-normalization context. |
| input object | `CreateBranchSnapshotInput` |
| required input fields | `trigger`, `source_material`, `requested_by`, `snapshot_scope`, `human_origin_material`, `ai_assisted_framing_if_any`, `branch_candidates`, `context_notes` |
| trigger allowed values | `human_save_request`, `human_snapshot_request`, `legacy_handoff_normalization`. Other trigger values must be marked `Provisional` and require Human review before downstream use. |
| output object | `BranchSnapshot` |
| required output fields | `snapshot_id`, `snapshot_title`, `snapshot_type`, `status`, `false_closure_warning`, `trigger`, `branch_items`, `human_originated_material`, `ai_seed_or_ai_assisted_framing`, `core_meaning`, `why_preserve`, `search_anchors`, `human_phrase_anchors`, `return_query`, `potential_phase3_questions`, `origin_risk`, `coverage_check` |
| constraints | Must not adopt, approve, implement, or alter Prompt W. Must preserve Human-originated material. Must mark missing data. Must keep Snapshot Human-triggered unless normalizing legacy handoff. |
| failure / warning cases | Missing Human material; unclear trigger; insufficient source material; non-sequential Branch IDs; missing False Closure Warning; origin unclear; branch candidates cannot be separated reliably. |

### 16.2 `check_snapshot_readiness(snapshot) -> ReadinessReport`

| Item | Definition |
|---|---|
| purpose | Evaluate whether a Snapshot is ready for Phase 2 / Phase 3 input use. |
| input object | `BranchSnapshot` |
| required input fields | All Branch Snapshot Minimum Core fields. |
| output object | `ReadinessReport` |
| required output fields | `snapshot_id`, `status`, `check_results`, `coverage_status`, `missing_fields`, `warnings`, `origin_risk_status`, `human_review_required`, `safe_next_action` |
| constraints | Must not treat Ready as adoption. Must report missing Branch IDs. Must not suppress warnings for clean structure. |
| failure / warning cases | Missing Snapshot ID; missing False Closure Warning; missing Coverage Check; missing core meaning; absent Human-originated material; Branch loss risk; anchor misuse risk. |

### 16.3 `prepare_snapshot_handoff(snapshot_set) -> SnapshotHandoffIndex`

| Item | Definition |
|---|---|
| purpose | Prepare standard handoff using a Snapshot Index. |
| input object | `SnapshotSet` |
| required input fields | `snapshots`, `snapshot_readiness_reports`, `handoff_purpose`, `current_phase`, `known_missing_items` |
| output object | `SnapshotHandoffIndex` |
| required output fields | `handoff_id`, `status`, `false_closure_warning`, `snapshot_index`, `coverage_summary`, `missing_data_summary`, `provisional_items`, `return_queries`, `rehydration_instruction`, `human_review_required`, `next_phase_recommendation` |
| constraints | Must treat Snapshot Index as input material only. Must preserve not-adoption status. Must not omit Conditional / Not Ready snapshots without noting exclusion. |
| failure / warning cases | No usable snapshots; incomplete readiness reports; missing Return Queries; severe coverage gaps; unsupported origin assumptions. |

### 16.4 `normalize_legacy_handoff_to_snapshots(legacy_handoff) -> NormalizedSnapshotSet`

| Item | Definition |
|---|---|
| purpose | Convert non-compliant legacy handoff material into provisional Snapshot / Branch ID format before Phase 2 / Phase 3. |
| input object | `LegacyHandoffInput` |
| required input fields | `legacy_source_material`, `handoff_context`, `known_human_phrases`, `known_decision_scope`, `missing_input_notes` |
| output object | `NormalizedSnapshotSet` |
| required output fields | `normalization_id`, `status`, `source_material_reference`, `normalized_snapshots`, `assigned_snapshot_ids`, `assigned_branch_ids`, `confidence_by_snapshot`, `missing_data`, `human_phrase_anchors`, `origin_risks`, `human_review_required`, `false_closure_warning` |
| constraints | Must mark normalized snapshots as provisional. Must not infer unavailable content as fact. Must preserve Human Phrase Anchors where available. Must require Human review. |
| failure / warning cases | Legacy input too sparse; source boundaries unclear; Human phrases unavailable; branch boundaries inferred; confidence low; possible false precision. |

### 16.5 `merge_phase3_handoff(input_set) -> Phase3InputSet`

| Item | Definition |
|---|---|
| purpose | Merge current instruction, handoff material, Snapshot Index or normalized snapshots, and rehydration notes into Phase 3-ready input material. |
| input object | `Phase3HandoffMergeInput` |
| required input fields | `current_human_instruction`, `snapshot_index_or_normalized_snapshot_set`, `rehydration_output_if_any`, `human_supplements`, `known_missing_inputs`, `origin_notes` |
| output object | `Phase3InputSet` |
| required output fields | `input_set_id`, `included_materials`, `excluded_materials`, `origin_map`, `unsupported_or_missing_claims`, `coverage_warnings`, `false_closure_warning`, `phase3_questions`, `human_review_required`, `trust_cache_reset_required` |
| constraints | Must not ignore handoff input. Must not treat handoff material as adopted output. Must prepare input material only. |
| failure / warning cases | Conflict between handoff and new-session material; missing Snapshot Index; incomplete rehydration; origin unclear; insufficient material for Phase 3. |

### 16.6 `rehydrate_from_handoff(snapshot_index, human_notes) -> RehydrationOutput`

| Item | Definition |
|---|---|
| purpose | Reopen Snapshot Index material in a new session and integrate Human notes for later Phase 2 / Phase 3 use. |
| input object | `RehydrationInput` |
| required input fields | `snapshot_index`, `human_notes`, `selected_snapshot_ids`, `rehydration_goal`, `current_session_context` |
| output object | `RehydrationOutput` |
| required output fields | `rehydration_id`, `referenced_snapshot_ids`, `rehydrated_branch_summaries`, `human_supplement_notes`, `origin_notes`, `unresolved_gaps`, `return_queries_used`, `not_adoption_warning`, `recommended_next_phase` |
| constraints | Must be Human-led. Must not adopt or decide. Must preserve origin uncertainty. Must feed Phase 2 / Phase 3 input set if used for judgment. |
| failure / warning cases | Snapshot Index missing; selected Snapshot not found; Human notes conflict with snapshot; Return Query fails; origin boundary unclear; rehydration creates false closure. |

## 17. Constraints

- Do not insert Snapshot rules into Prompt W body.
- Do not make Snapshot creation automatic during all Phase 1a.
- Do not require constant Human comprehension checks.
- Do not treat Snapshot as evidence.
- Do not treat Snapshot as adoption.
- Do not overburden lightweight Phase 0 tasks.
- Keep Snapshot operations Human-triggered unless normalizing legacy handoff.
- Do not treat Search Anchors, Human Phrase Anchors, Return Query, or Temperature as proof.
- Do not treat handoff material as adopted output.
- Preserve Human final decision for adoption-sensitive use.
- Keep this artifact as an operational addendum, not a new Prompt Set version.
- Use this addendum as trial candidate material until PM formal adoption.

## 18. Parked / Out-of-scope Items

Parked / out-of-scope items:

- AI Business OS Cognitive OS Return
- Human-led Repair Loop
- Understanding Resolution definition
- Human Knowledge Alignment
- Learning App Extension
- Repository / DB Design
- Detailed Snapshot lifecycle / merge / supersession
- Full database schema
- v0.2 candidate only: minimal supersession markers such as `supersedes` / `superseded_by` if trial operation shows repeated update snapshots for the same Branch

These may be considered in a later v0.2 or separate design track, but they are not adopted by this addendum.

## 19. Adoption Status

Status:

- Trial operational addendum candidate
- Reviewer v0.1 verdict: Conditional
- v0.1.1 revision: RF-1 / RF-2 / RF-3 / RF-4 addressed

Formal adoption:

- Pending

Next:

- Reviewer review
- PM trial adoption judgment
- Trial operation with snapshot/handoff workflows


Revision note after required input attachment:
- The source Human Decision document is now available.
- Snapshot-related decision mapping is confirmed as D-06 through D-15.
- This addendum remains limited to Snapshot / Handoff / Rehydration operational rules.
- D-01 through D-05 and D-16 through D-18 are not absorbed into this addendum.
- Reviewer Required Fixes RF-1 through RF-4 were addressed in v0.1.1: Phase 0 exception, trigger allowed values, Coverage Check naming, and Coverage/Readiness relationship.

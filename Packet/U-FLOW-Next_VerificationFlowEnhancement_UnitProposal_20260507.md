# Japanese Summary (PM向け要約)

**Unit候補提案：検証フロー強化（Verification Flow Enhancement）**

U-FLOW-13以降のUnitとして、検証ロールの拡張・検証対象の追加・コンテキスト管理原則の3点をセットで導入する提案です。U-FLOW-13で扱った「Role Execution Routing / Handoff Runtime」の上位レイヤとして機能し、AI事業OSの「下流に影響するOutputは検証する」原則を体系化します。

提案内容の骨子：

* **検証対象の拡張**：現状ReviewerはSpecのみが対象。これをWorkerPacket・TestPlan・Integrator-CのDecisionまで拡張する。
* **検証Roleの独立性確保**：検証ロールは原則セッションを都度切る。Inputは明示宣言したものだけ渡す。
* **規範的Artifactと評価的Artifactの区別**：上流レビュー所見（評価的）は原則引き継がない。Spec・WorkerPacket等の規範的Artifactのみ参照。
* **TestPlanの新規導入**：Spec → TestPlan → WorkerPacket の順で、テスタビリティを構造的に担保する。

本Unitは、U-FLOW-13で設計したHandoff Packet機構を前提とすることで、検証Role別のInput制御を実装可能にします。

---

# U-FLOW-Next_VerificationFlowEnhancement_UnitProposal_20260507.md

## 1. Unit Candidate Overview

- **Tentative Unit ID**: U-FLOW-Next (TBD: U-FLOW-14 or later)
- **Tentative Title**: Verification Flow Enhancement
- **Position**: Upper layer of U-FLOW-13 (depends on Handoff Runtime)
- **Status**: Proposal / Pre-Decision

## 2. Background

Through the U-FLOW-13 design and review process, the following operational gaps were identified in the current Flow Runtime (v1.4):

- Reviewer is currently scoped only to Spec verification (main-03 / main-04). Other downstream-impacting Outputs (WorkerPacket, TestPlan, Integrator-C's Cause Decision and Verified judgment) are not formally verified.
- The principle of "verify what affects downstream" is not consistently enforced across the flow.
- Within-role context contamination risk (anchoring bias from prior reviews in the same session) is not addressed by the current Handoff design.
- TestPlan is not formally defined as a flow artifact, despite having operational verification value.

The user's operational experience (multi-model role assignment: GPT/Claude/Gemini) has empirically validated that **cross-role and cross-artifact verification requires explicit Input control and session boundaries**, not just Role separation.

## 3. Goals

- Extend formal verification (Reviewer) to cover all downstream-impacting Outputs.
- Codify the **Trace Context vs. Judgment Context** distinction at the Flow level.
- Define explicit **session boundary policy** for verification roles.
- Introduce **TestPlan** as a first-class flow artifact with its own verification gate.
- Strengthen Integrator-C's judgment quality by adding an independent verification step before PM approval.

## 4. Non-Goals

- Replacing the existing Reviewer Role with a new Role.
- Automating verification (this Unit defines flow structure; automation is a separate concern).
- Mandating Reviewer for every artifact regardless of impact (selective application based on downstream impact remains).

## 5. Required Design Targets

### 5.1 Verification Coverage Extension

Define which artifacts require Reviewer verification and at which flow position.

| Artifact | Currently Verified? | Proposed | Verification Position |
| :--- | :--- | :--- | :--- |
| Spec | Yes (main-03/04) | Continue | Designer → Reviewer → PM |
| WorkerPacket | No | **Add** | Integrator-S → Reviewer → PM (insert between main-05 and main-06) |
| TestPlan | N/A (not defined) | **Add** | TestPlan author → Reviewer → PM (new step) |
| Integrator-C Cause Decision | No | **Add** | Integrator-C → Reviewer → next branch (insert in feedback_flow) |
| Integrator-C Verified Judgment | No | **Add** | Integrator-C → Reviewer → PM (insert between main-08 and main-09) |
| PM Decision | No | **No change** (PM is the human authority) | — |

### 5.2 Session Boundary Policy for Verification Roles

Define when verification roles must use a fresh session vs. when continuity is acceptable.

| Pattern | Session Policy | Rationale |
| :--- | :--- | :--- |
| Cross-role transition (e.g., Worker → Debugger) | **Mandatory cut** | Cross-role contamination prevention |
| Same-role, different artifact (e.g., Reviewer for Spec then for WorkerPacket) | **Mandatory cut by default** | Anchoring bias prevention |
| Same-role, cross-artifact consistency check (explicit) | **May continue with declared Input** | Consistency check is the explicit purpose |
| feedback loop iteration (same role, same artifact, re-review) | **Mandatory cut** | Iteration anchoring prevention |

### 5.3 Input Declaration Categorization

Extend the Handoff Packet schema (from U-FLOW-13) to distinguish Input types:

```markdown
## Input Artifacts
- [trace] U-FLOW-XX_Spec.md           # Normative: defines what should be
- [trace] U-FLOW-XX_PMDecision.md     # Normative: defines instruction basis
- [judgment] (none)                   # Evaluative: prior review opinions (default: not included)
```

**Rule**: Verification roles receive `[trace]` artifacts by default. `[judgment]` artifacts are only included when the verification purpose is explicitly cross-artifact consistency checking.

### 5.4 TestPlan as a First-Class Artifact

Define TestPlan creation, ownership, and position in the flow.

- **Creator**: Designer (alongside Spec) or dedicated TestPlan role (TBD)
- **Position**: Spec → TestPlan → WorkerPacket (TestPlan informs WorkerPacket design)
- **Content**: Executable test cases derived from Spec's Acceptance Criteria
- **Verification**: Reviewer verifies that TestPlan covers all Acceptance Criteria
- **Effect**: WorkerPacket design is constrained by testability requirements

### 5.5 Integrator-C Decision Verification

Integrator-C produces two judgment artifacts that affect downstream:

| Decision Type | Downstream Effect | Verification Need |
| :--- | :--- | :--- |
| Cause Classification (implementation/specification/environment) | Determines feedback branch | **Verify** (wrong classification → wasted iterations) |
| Verified Judgment (ControlReview → Verified) | Determines PM approval input | **Verify** (premature Verified → quality escape) |

Both should pass through Reviewer before downstream consumption.

## 6. Flow Impact

### 6.1 main_flow Changes

- Insert Reviewer step between `main-05` (PM → Integrator-S) and `main-06` (Integrator-S → Worker) for **WorkerPacket verification**.
- Insert Reviewer step between `main-08` (Verification → Integrator-C) and `main-09` (Integrator-C → PM) for **Verified judgment verification**.
- Add new step block for **TestPlan creation and verification** (position: after Spec approval, before WorkerPacket creation).

### 6.2 feedback_flow Changes

- Insert Reviewer verification of Integrator-C's Cause Classification before each feedback branch executes (`fb-impl-01`, `fb-spec-01`, `fb-env-01`).
- Note: This adds Reviewer load to every feedback iteration, so cost vs. quality tradeoff is a runtime concern (potentially: full review for first iteration, lightweight check for subsequent iterations).

## 7. Dependencies

- **U-FLOW-13 (Handoff Runtime)**: This Unit requires the Handoff Packet schema as the carrier for Input categorization (`[trace]` / `[judgment]`).
- **Existing Reviewer Role definition**: No structural change to the Role itself; only the scope and session policy are extended.

## 8. Risks

- **Reviewer load increase**: Adding 4 new verification points (WorkerPacket, TestPlan, Cause Decision, Verified Judgment) significantly increases Reviewer (Opus) usage. Cost monitoring required.
- **Iteration cost in feedback_flow**: If every feedback iteration re-runs Reviewer on Cause Classification, max_iterations consumption may inflate. Mitigation: tiered review depth.
- **TestPlan ownership ambiguity**: Whether Designer or a separate Role owns TestPlan creation needs explicit decision. Affects role assignment and session policy.
- **Backward compatibility**: Existing Units in flight (using Flow v1.4) need a migration path. Unit-level opt-in vs. flow-version cutover decision.

## 9. Open Questions

- Should TestPlan be created by Designer (extends Designer's scope) or by a new dedicated Role (e.g., TestDesigner)?
- For feedback_flow Cause Classification verification, should Reviewer review every iteration or only the first?
- Should `[judgment]` Input be permitted in special cases (e.g., for explicit cross-artifact consistency review), or strictly forbidden?
- How to handle the increased Opus Reviewer cost? Options: tiered model assignment (Opus for critical verification, Sonnet for routine), partial automation, or sampling.
- Does the session-cut-by-default policy require tooling support (e.g., automatic new chat creation per verification) or remain manual discipline?

## 10. Acceptance Criteria for This Unit

When this Unit is implemented, the following must hold:

- All downstream-impacting Outputs (Spec, WorkerPacket, TestPlan, Integrator-C Decisions) pass through Reviewer before reaching PM.
- Handoff Packet schema includes `[trace]` / `[judgment]` Input categorization.
- Session boundary policy is documented and enforceable for verification roles.
- TestPlan is a first-class artifact with creator, position, and verification gate defined.
- Flow v1.4 → v1.5 (or equivalent) migration path is defined for in-flight Units.

## 11. Related Insights from Operational Experience

This Unit proposal draws from operational observations during U-FLOW-13 review:

- **Multi-model role assignment validates cross-model verification benefit**: GPT/Gemini's "input-faithful" tendency makes them prone to propagating flawed inputs; Claude's "must-speak-up" tendency naturally functions as gatekeeping. This is structurally what verification flows aim to formalize.
- **Within-role anchoring is real**: Even the same Reviewer model, given multiple consecutive reviews in one session, accumulates judgment bias. Session cuts and Input declaration are complementary, not interchangeable.
- **"Verify what affects downstream" as universal principle**: Once adopted, this principle makes verification scope decisions deterministic rather than ad hoc.

## 12. Next Action

Pending PM judgment on:
1. Whether to formalize this as the next Unit (timing relative to other candidates).
2. Whether to scope it as a single Unit or split (e.g., Unit A: verification scope extension, Unit B: TestPlan introduction, Unit C: session/input policy formalization).
3. Whether to bundle with Flow v1.5 release or as an incremental v1.4.x patch.

If approved, next step: PM Decision document (`U-FLOW-Next_PMDecision_Start.md`) → Designer Instruction → Spec.

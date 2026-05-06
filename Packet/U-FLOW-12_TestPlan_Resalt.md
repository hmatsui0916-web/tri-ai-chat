# U-FLOW-12 TestPlan Result Report

Role: Infra
Scope: Artifact Save Runtime Human Execution Follow

## 1. Summary

U-FLOW-12 Artifact Save Runtime の実機テストを Human 実施で確認した。

Initial Judgment: FAIL
Retest Judgment: PASS

理由:

- 初回実施では TC-11 で Rev 付き Packet Artifact が `Packet / units/U-FLOW-12/packets/` ではなく `Unknown / units/U-FLOW-12/outputs/` として保存された。
- 修正後再テストで `U-FLOW-12_Packet_Rev2.md` が `Packet / units/U-FLOW-12/packets/ / rev 2` として保存されることを確認した。
- TC-12 の Packet / Unknown filter でも修正後状態が期待通りであることを確認した。

## 2. Environment

- App: tri-ai-chat-flow-ui
- Unit: U-FLOW-12
- Test Plan: `Packet/U-FLOW-12_TestPlan.md`
- Execution: Human実機確認
- Browser: Human実行環境
- Runtime storage: browser localStorage
- Storage key: `tri-ai-saved-artifacts`

Pre-check:

- `npm.cmd run build` PASS 済み
- PowerShell direct `npm run build` は Execution Policy により `npm.ps1` がブロックされるため、`npm.cmd run build` を使用

## 3. Test Results

| TC | Result | Notes |
| --- | --- | --- |
| TC-01 | PASS | U-FLOW-12 Artifact Save Runtime panel displayed. |
| TC-02 | PASS | Inline `File: U-FLOW-12_Packet.md` extracted and saved as Packet. |
| TC-03 | PASS | Next-line `File:` extraction worked for `U-FLOW-12_Spec.md`. |
| TC-04 | PASS | Missing `File:` blocked save; manual file name enabled save. |
| TC-05 | PASS | `U-FLOW-12_PMDecision_SpecApproval.md` detected as Decision / SpecApproval. |
| TC-05 subcases | PASS | WorkerApproval / Conditional / Hold phases detected and not blocked. |
| TC-06 | PASS | Generic `U-FLOW-12_Decision.md` blocked and did not fall through to Unknown outputs. |
| TC-07 | PASS | PMDecision_Rework detected with Target Role Worker and decisions path. |
| TC-08 | PASS | ReworkInstruction detected with Target Role Worker and rework path. |
| TC-09 | PASS | DebugReport detected as Report; ErrorReport.md did not false-positive as Report. |
| TC-10 | PASS | Path traversal stripped to leaf file name. |
| TC-10A | PASS | `U-FLOW-12_Code.ts` detected as Code and saved to outputs. |
| TC-11 | FAIL | Rev suggested Packet saved as Unknown / outputs. Critical. |
| TC-12 | PASS | Saved Artifacts list and Unit / Type filters worked. TC-11 failure evidence visible under Unknown. |
| TC-13 | PASS | Copy content copied Packet artifact body successfully. |
| TC-14 | PASS | Packet artifact applied to `packet_content`; JSON remained valid. |
| TC-15 | PASS | DebugReport applied to `debug_report` and `infra_result`. |
| TC-16 | PASS | Invalid JSON blocked artifact input application. |
| TC-17 | PASS | U-FLOW-11 Generate / Copy / Stage worked after U-FLOW-12 addition. |
| TC-18 | PASS | main-05 PM-approved Spec guard blocked missing condition and allowed valid condition. |
| TC-19 | PASS | main-06 Worker external handoff remained manual; no Worker API request. |

## 4. Critical Finding

### C-1: Rev付き Packet Artifact の種別判定と保存先が誤る

Severity: Critical

Test Case:

- TC-11 同名衝突・Rev 候補

Input:

```text
File: U-FLOW-12_Packet.md

# U-FLOW-12 Packet
Packet body sample.
```

Operation:

1. `U-FLOW-12_Packet.md` を保存済みにする。
2. 同じ Role Output を再度貼り付ける。
3. `Use Suggested Rev` を押す。
4. `Artifact Save` を押す。

Expected:

```text
U-FLOW-12_Packet_Rev2.md
Packet / units/U-FLOW-12/packets/ / rev 2
```

Actual:

```text
U-FLOW-12_Packet_Rev2.md
Unknown / units/U-FLOW-12/outputs/ / rev 2
```

Observed Saved Artifact:

```text
U-FLOW-12_Packet_Rev2.md
Unknown / units/U-FLOW-12/outputs/ / role PM / step main-01 / Draft/main / rev 2
```

Impact:

- Rev 付き Artifact が本来の種別と logicalPath を失う。
- `Packet` として絞り込んでも `U-FLOW-12_Packet_Rev2.md` が表示されない。
- `Unknown` として `outputs/` に保存されるため、Unit別 Artifact 管理と next_step input 運用に混乱が出る。
- U-FLOW-12 Acceptance Criteria の同名衝突防止 / Rev候補 / logicalPath管理に影響する。

Likely Cause:

```text
detectArtifactType が `_Packet.md` のような末尾形式のみを見ており、
`U-FLOW-12_Packet_Rev2.md` のような `_RevN` 付きファイル名を Packet と判定できていない。
```

Suggested Fix Direction:

- Artifact type detection 前に `_RevN` を除去した normalized file name を使う。
- または `detectArtifactType` の各 filename rule を `_RevN` 付き形式にも対応させる。
- `Spec`, `Packet`, `Decision`, `PMDecision_Rework`, `ReworkInstruction`, `Report`, `Code` の全種別で Rev 付きファイル名を回帰確認する。

Suggested Regression Cases:

```text
U-FLOW-12_Packet_Rev2.md -> Packet / units/U-FLOW-12/packets/
U-FLOW-12_Spec_Rev2.md -> Spec / units/U-FLOW-12/specs/
U-FLOW-12_PMDecision_SpecApproval_Rev2.md -> Decision / units/U-FLOW-12/decisions/
U-FLOW-12_PMDecision_Rework_Worker_Rev2.md -> PMDecision_Rework / units/U-FLOW-12/decisions/
U-FLOW-12_ReworkInstruction_Worker_20260506_120000_Rev2.md -> ReworkInstruction / units/U-FLOW-12/rework/
U-FLOW-12_DebugReport_20260506_120000_Rev2.md -> Report / units/U-FLOW-12/reports/
U-FLOW-12_Code_Rev2.ts -> Code / units/U-FLOW-12/outputs/
```

## 4.1 Retest Result

Retest Judgment: PASS

Retest Scope:

- TC-11 同名衝突・Rev 候補
- TC-12 Saved Artifacts 一覧・フィルタの関連確認

Retest Preconditions:

- 修正後コードで `npm.cmd run build` PASS
- `localStorage.removeItem("tri-ai-saved-artifacts"); location.reload();` により保存済みArtifactを初期化

Retest Steps:

1. `U-FLOW-12_Packet.md` を保存する。
2. 同じ Role Output を再度貼り付ける。
3. `Use Suggested Rev` を押す。
4. `Artifact Save` を押す。
5. Saved Artifacts 一覧と Type filter を確認する。

Retest Expected:

```text
U-FLOW-12_Packet_Rev2.md
Packet / units/U-FLOW-12/packets/ / rev 2
```

Retest Actual:

```text
U-FLOW-12_Packet_Rev2.md
Packet / units/U-FLOW-12/packets/ / role PM / step main-01 / Draft/main / rev 2
```

Filter Confirmation:

```text
Type filter: Packet
Showing: 2
- U-FLOW-12_Packet_Rev2.md
- U-FLOW-12_Packet.md

Type filter: Unknown
Showing: 0
```

Retest Result:

- TC-11: PASS
- TC-12 related filter confirmation: PASS
- Critical C-1: Resolved

## 5. Evidence Highlights

### TC-02 Packet save

```text
Extracted File: U-FLOW-12_Packet.md
Final File: U-FLOW-12_Packet.md
Artifact Type: Packet
Logical Path: units/U-FLOW-12/packets/
```

### TC-06 Generic Decision block

```text
Extracted File: U-FLOW-12_Decision.md
Artifact Type: Decision
Logical Path: units/U-FLOW-12/decisions/
Generic Decision file names are blocked.
Artifact Save disabled.
```

### TC-09 Report false positive prevention

```text
U-FLOW-12_DebugReport_20260506_120000.md
Report / units/U-FLOW-12/reports/

ErrorReport.md
Unknown
Not classified into reports/
```

### TC-14 Packet input application

```json
"packet_content": "File: U-FLOW-12_Packet.md\n\n# U-FLOW-12 Packet\nPacket body sample.\n"
```

### TC-15 Report input application

```json
"debug_report": "File: U-FLOW-12_DebugReport_20260506_120000.md\n\n# Debug Report\nDebug result sample.\n"
```

```json
"infra_result": "File: U-FLOW-12_DebugReport_20260506_120000.md\n\n# Debug Report\nDebug result sample.\n"
```

### TC-18 PM-approved Spec guard

Blocked condition:

```text
Integrator-S requires PM-approved Spec flag.
```

Allowed condition:

```text
Result: ok / step main-05 / roles Integrator-S
```

### TC-19 Worker external handoff

```text
Current Step: main-06
Resolved Role(s): Worker
External Handoff: manual VSCode Copilot handoff
Result: ok / step main-06 / roles Worker
Worker handoff is manual. Copy the generated prompt for VSCode Copilot; no API request will be sent.
```

Prompt prohibition confirmed:

```text
Do not call a Worker API.
```

## 6. Final Judgment

Final Judgment: PASS after retest

Initial Pass count:

- PASS: TC-01, TC-02, TC-03, TC-04, TC-05, TC-05 subcases, TC-06, TC-07, TC-08, TC-09, TC-10, TC-10A, TC-12, TC-13, TC-14, TC-15, TC-16, TC-17, TC-18, TC-19

Initial Fail count:

- FAIL: TC-11

Retest:

- TC-11 PASS
- TC-12 related filter confirmation PASS
- Blocking issue resolved

## 7. Recommended Next Action

1. U-FLOW-12 を実機テスト PASS として扱う。
2. Worker / Integrator-S には TC-11 Critical が修正済みであることを共有する。
3. 今後の回帰確認では最低限以下を再実施する。

```text
TC-02
TC-03
TC-05
TC-07
TC-08
TC-09
TC-10A
TC-11
TC-12
TC-14
```

4. 特に TC-11 は `Packet_Rev2` だけでなく、主要 Artifact 種別の `_RevN` 付きファイル名を追加確認する。

## 8. Rework Target

Recommended TargetRole: none

Reason:

- 再テストで Critical 不具合が解消されたため、現時点の追加Reworkは不要。

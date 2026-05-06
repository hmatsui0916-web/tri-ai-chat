File:
U-FLOW-12_Packet.md

Role: Integrator-S
Scope: Structure

# U-FLOW-12_Packet.md

## 1. Unit

U-FLOW-12
Artifact Save Runtime

## 2. Goal

Role OutputをArtifactとして保存し、Flow Runtime上で一覧表示、メタデータ管理、次step Prompt生成時のInput参照に使えるようにする。

U-FLOW-12完了後、Humanは各Role出力を確認し、`File:` 行またはRuntime候補名に基づいてArtifact保存できる。保存済みArtifactはUnit単位で一覧表示され、`runtime_outputs / allowed inputs JSON` へ安全に反映できる。

## 3. Target

主対象:

- `app/page.tsx`
- 必要に応じて `app/globals.css`

対象外:

- `public/ai-business-os-flow-v1.4.json` の変更
- `app/api/ask-stream/route.ts` の変更
- 外部Worker APIの自動呼び出し
- 完全なファイル管理システム、全文検索、権限管理、クラウド同期
- U-FLOW-11 Chat RuntimeのRole/Template/Prompt生成仕様の破壊的変更

## 4. Current Repository Findings

既存実装は単一Next UIに集約されている。

- `app/page.tsx:200` に `PromptRuntimeInputs` がある。
- `app/page.tsx:304` に `RuntimeActionLog` がある。
- `app/page.tsx:785` に `DEFAULT_PROMPT_RUNTIME_INPUTS` がある。
- `app/page.tsx:1264` 付近に `parsePromptRuntimeInputs` がある。
- `app/page.tsx:1321` 付近にRole別必須Input解決がある。
- `app/page.tsx:1453` 付近にPrompt生成本文がある。
- `app/page.tsx:1658` 付近に `runtimeOutputsText` state がある。
- `app/page.tsx:2192` 付近に `generateCurrentStepPrompts` がある。
- `app/page.tsx:2222` 付近に `copyGeneratedPrompts` がある。
- `app/page.tsx:2239` 付近に `stageGeneratedPromptsInComposer` がある。
- `app/page.tsx:3553` 付近に `U-FLOW-11 Prompt Runtime` UI がある。
- `app/page.tsx:4074` 付近にAction Log UIがある。

既存の永続化方針は主に `localStorage` である。Artifact Save Runtimeもまずはブラウザ内Runtime保存として実装し、保存先フォルダは実ファイル書込ではなくメタデータ上の論理パスとして扱うこと。

## 5. Inputs

Primary Inputs:

- `Packet/U-FLOW-12_Spec.md` Rev.1
- `Packet/U-FLOW-12 ReviewReport (Rev.1 再レビュー).md`
- `Packet/U-FLOW-12_PMDecision_SpecApproval.md`
- `Packet/U-FLOW-12_PMDecision_Start.md`
- `Packet/U-FLOW-11_Spec.md`
- `Packet/U-FLOW-10_Spec.md`
- `Packet/U-FLOW-09_Spec.md`

Runtime Inputs:

- Role Output本文
- `unit_id`
- `role`
- `current_step`
- `state`
- `route_context`
- `timestamp`
- `runtimeOutputsText`
- `PromptRuntimeInputs`

## 6. Outputs

Workerは以下を実装する。

- Artifact保存UI
- `File:` 抽出ロジック
- `File:` 欠落時のHuman手動入力 / 候補名提示
- Artifact種別判定
- Unit ID判定
- 保存先論理フォルダ判定
- Human確認後の保存
- 保存済みArtifact一覧UI
- current_step / state / route_contextとの紐付け
- next_step Prompt生成用Inputへの参照・反映UI
- PMDecision Phase命名
- PMDecision_Rework TargetRole命名
- ReworkInstruction TargetRole + timestamp命名
- 同名衝突時の警告とRev名提案

## 7. Storage Model

### 7.1 Artifact Record

`app/page.tsx` にArtifact用型を追加する。

```ts
type RuntimeInputKey =
  | "unit_id"
  | "human_goal"
  | "pm_decision"
  | "review_report"
  | "spec_content"
  | "packet_content"
  | "worker_code"
  | "debug_report"
  | "infra_result"
  | "human_execution_result"
  | "control_decision"
  | "rework_instruction"
  | "infra_test_plan"
  | "pm_approval_request"
  | "function_name"
  | "target";

type ArtifactType =
  | "Decision"
  | "Spec"
  | "Packet"
  | "Report"
  | "PMDecision_Rework"
  | "ReworkInstruction"
  | "Code"
  | "Unknown";

type SavedArtifact = {
  id: string;
  unitId: string;
  fileName: string;
  artifactType: ArtifactType;
  logicalPath: string;
  role?: RoleName | string;
  currentStepId?: string;
  currentStepName?: string;
  state: string;
  routeContext: string;
  timestamp: string;
  content: string;
  rev?: number;
};

type ArtifactAnalysisResult = {
  content: string;
  extractedFileName: string | null;
  candidateFileName: string;
  finalFileName: string;
  detectedUnitId: string;
  artifactType: ArtifactType;
  logicalPath: string;
  pmDecisionPhase: string | null;
  targetRole: string | null;
  rev: number | null;
  suggestedRevisionFileName: string | null;
  canSave: boolean;
  errors: string[];
  warnings: string[];
};
```

`RuntimeInputKey` は既存 `PromptRuntimeInputs` のkeyと一致させる。Packet内で明示することで、`artifactTypeToDefaultInputKey` や `applyArtifactToRuntimeOutputsText` 実装時の型不一致を避ける。

### 7.2 Persistence

- `localStorage` keyは `tri-ai-saved-artifacts` とする。
- 保存済みArtifactは配列で保持する。
- 壊れたJSONや不正RecordはRuntimeをクラッシュさせず空配列または有効Recordのみへ正規化する。
- `logicalPath` は `units/[Unit]/...` 形式のメタデータとして保持する。
- このUnitではブラウザからリポジトリへ直接ファイルを書き込まない。

## 8. Required Behavior

### 8.1 Role Output Capture UI

U-FLOW-11 Prompt Runtimeパネルの近くにArtifact Save Runtimeパネルを追加する。

UI要素:

- Role Output貼り付け用textarea
- 解析結果プレビュー
- `File:` 抽出結果
- Unit ID
- Artifact種別
- 保存先論理パス
- current_step / state / route_context
- Human修正可能なファイル名入力
- PMDecision Phase手動選択
- Rework TargetRole手動選択
- `Artifact Save` ボタン
- 保存ブロック理由 / 警告表示

Role Output欄は既存の `runtimeOutputsText` を壊さない独立stateにする。

### 8.2 `File:` Extraction

- 本文冒頭または先頭付近の `File:` 行からファイル名を抽出する。
- 許容例:
  - `File: U-FLOW-12_Packet.md`
  - `File:\nU-FLOW-12_Packet.md`
- 抽出値はパスではなくファイル名として扱い、`/` や `\` を除去またはブロックする。
- `File:` が欠落している場合、自動保存を止める。
- 欠落時はRuntime文脈から候補名を提示し、Humanが確認・修正した場合のみ保存できる。

### 8.3 Unit ID Detection

優先順位:

1. `runtimeOutputsText` またはRuntime state上の `unit_id`
2. ファイル名先頭の `U-FLOW-12_` 形式
3. `DEFAULT_PROMPT_RUNTIME_INPUTS.unit_id`
4. Human修正入力

不一致がある場合は警告を表示し、Human確認後のみ保存する。

### 8.4 Artifact Type and Logical Folder

判定順序は具体的なものを先にする。

| Type | Filename Rule | Logical Folder |
| :--- | :--- | :--- |
| PMDecision_Rework | `*_PMDecision_Rework_*` | `units/[Unit]/decisions/` |
| Decision | `*_PMDecision_*` | `units/[Unit]/decisions/` |
| Spec | `*_Spec.md` | `units/[Unit]/specs/` |
| Packet | `*_Packet.md` | `units/[Unit]/packets/` |
| ReworkInstruction | `*_ReworkInstruction_*` | `units/[Unit]/rework/` |
| Report | `*Report_*` / `*Result_*` | `units/[Unit]/reports/` |
| Code | `*_Code.*` | `units/[Unit]/outputs/` |
| Unknown | otherwise | `units/[Unit]/outputs/` |

Report判定はSpec 2.3に合わせてアンダースコア付きの `*Report_*` / `*Result_*` を基準にする。`ErrorReport.md` や `TestResults.json` のような意図しないファイル名へ広くマッチさせない。

PMDecision_ReworkはReworkInstructionとは別Artifactであり、保存先はPMDecision系として `decisions/` を使う。

### 8.5 PMDecision Phase Naming

対応Phase:

- `Start`
- `SpecApproval`
- `PacketApproval`
- `WorkerApproval`
- `ControlApproval`
- `Final`
- `Conditional`
- `Hold`
- `Rework`

U-FLOW-12 Rev.1 Specの実装テーブルでは `Start / SpecApproval / PacketApproval / ControlApproval / Final / Rework` が自動Phase判定対象。PMDecisionの追加観測名である `WorkerApproval / Conditional / Hold` は保存可能な命名候補として扱うが、Flow stepから自動判定できない場合はHuman選択または手動Phase指定にフォールバックする。

禁止:

- `[Unit]_Decision.md`
- `[Unit]_PMDecision.md`
- `[Unit]_PMDecision_.md`
- PhaseなしPMDecision名

禁止名を検出した場合は保存をブロックし、正しい候補名を提示する。

### 8.6 Phase Detection

Flow stepからの候補:

| Phase | Step Context | File Name |
| :--- | :--- | :--- |
| Start | `main-01` 完了後 | `[Unit]_PMDecision_Start.md` |
| SpecApproval | `main-04` 承認後 | `[Unit]_PMDecision_SpecApproval.md` |
| PacketApproval | `main-05` 完了後 | `[Unit]_PMDecision_PacketApproval.md` |
| ControlApproval | `main-09` | `[Unit]_PMDecision_ControlApproval.md` |
| Final | `main-10` 完了後 | `[Unit]_PMDecision_Final.md` |
| Rework | feedback分岐 / TargetRole指定 | `[Unit]_PMDecision_Rework_[TargetRole].md` |

`WorkerApproval / Conditional / Hold` は保存可能Phaseとして許可する。ただし自動判定対象外の場合は手動選択UIを使う。

### 8.7 PMDecision_Rework and ReworkInstruction Naming

PMDecision_Rework:

- 形式: `[Unit]_PMDecision_Rework_[TargetRole].md`
- TargetRole候補:
  - `Designer`
  - `IntegratorS`
  - `Worker`
  - `Infra`
- `Integrator-S` はファイル名上 `IntegratorS` に正規化する。
- TargetRole欠落時は保存をブロックし、Human選択を要求する。

ReworkInstruction:

- 形式: `[Unit]_ReworkInstruction_[TargetRole]_[timestamp].md`
- TargetRole候補:
  - `Worker`
  - `Designer`
  - `Infra`
- `timestamp` は `yyyymmdd_hhmmss` 形式を推奨する。
- `File:` 欠落時にArtifact種別がReworkInstructionと推定される場合、この形式で候補名を生成する。
- TargetRoleまたはtimestampが欠落しているReworkInstruction名は保存前に警告し、候補名へ補正できるようにする。

PMDecision_ReworkはPMの差戻し判断、ReworkInstructionはIntegrator-C等が作成する修正指示であり、両者を混同しない。

### 8.8 Rev Conflict Handling

同一 `logicalPath` 内で同名ファイルが既に保存されている場合:

- 上書きは禁止。
- 警告を表示する。
- `_RevN` 候補を提示する。
- 初回重複時は `_Rev2` から開始する。
- 既存 `_RevN` の最大Nを調べ、`N + 1` を提案する。

検索範囲:

- Decision / PMDecision_Rework: `units/[Unit]/decisions/`
- ReworkInstruction: `units/[Unit]/rework/`
- Report系: `units/[Unit]/reports/`
- Spec: `units/[Unit]/specs/`
- Packet: `units/[Unit]/packets/`
- Code: `units/[Unit]/outputs/`

### 8.9 Saved Artifact List UI

一覧表示項目:

- fileName
- artifactType
- logicalPath
- role
- currentStepId
- state
- routeContext
- timestamp
- rev

機能:

- Unit IDフィルター
- Artifact種別フィルター
- 最新順表示
- content preview
- copy content
- `runtimeOutputsText` への反映

### 8.10 next_step Input Reference

保存済みArtifactから `PromptRuntimeInputs` へ反映できるUIを追加する。

最低限のマッピング:

| Artifact Type | Runtime Input Key |
| :--- | :--- |
| Decision / PMDecision_Rework | `pm_decision` |
| Spec | `spec_content` |
| Packet | `packet_content` |
| Report | `review_report`, `debug_report`, or `infra_result` をHuman選択 |
| ReworkInstruction | `rework_instruction` |
| Code | `worker_code` |

実装方針:

- Artifactごとに `Use as Input` 操作を提供する。
- 複数候補があるReport系はHumanがInput keyを選択する。
- `runtimeOutputsText` は既存JSONをparseし、該当keyだけ更新してpretty printする。
- 不正JSONの場合は更新を止め、エラーを表示する。
- Prompt生成関数の既存入力制限を緩めない。

## 9. Constraints

1. U-FLOW-11 Prompt Runtimeの既存動作を壊さない。
2. `generatePromptForCurrentStep` の必須Input validationを迂回しない。
3. `stageGeneratedPromptsInComposer` の外部Worker handoff制約を変えない。
4. `public/ai-business-os-flow-v1.4.json` は変更しない。
5. `app/api/ask-stream/route.ts` は変更しない。
6. Browser localStorage保存を基本とし、Node `fs` 書込APIは追加しない。
7. 同名Artifactを上書きしない。
8. PhaseなしPMDecision名を保存しない。
9. `WorkerApproval / Conditional / Hold` は保存可能なPhaseとして保持するが、Flow自動判定対象に無理に含めない。
10. File name sanitationを行い、ディレクトリトラバーサルを許可しない。
11. Report判定は `*Report_*` / `*Result_*` に合わせ、曖昧な `*Report*` / `*Result*` 判定へ広げない。
12. ReworkInstructionは `[Unit]_ReworkInstruction_[TargetRole]_[timestamp].md` 形式を候補名生成と検証に使う。

## 10. Implementation Skeleton

### 10.1 Types and Constants

`PromptRuntimeInputs` 周辺に以下を追加する。

- `RuntimeInputKey`
- `ArtifactType`
- `SavedArtifact`
- `ArtifactAnalysisResult`
- `ARTIFACT_STORAGE_KEY`
- `PM_DECISION_PHASES`
- `REWORK_TARGET_ROLES`
- `REWORK_INSTRUCTION_TARGET_ROLES`

`RuntimeInputKey` はSection 7.1のunion typeを使用する。

### 10.2 Pure Functions

追加候補:

```ts
function extractFileNameFromOutput(content: string): string | null
function sanitizeArtifactFileName(fileName: string): string
function detectUnitId(fileName: string | null, inputs: PromptRuntimeInputs): string
function detectArtifactType(fileName: string): ArtifactType
function getLogicalFolder(unitId: string, artifactType: ArtifactType): string
function inferPmDecisionPhase(step: ResolvedFlowStepV14 | null, fileName: string): string | null
function normalizeTargetRoleForFileName(role: string): string
function buildCandidateArtifactFileName(
  artifactType: ArtifactType,
  unitId: string,
  step: ResolvedFlowStepV14 | null,
  phase: string | null,
  targetRole: string | null,
  timestamp: string
): string
function buildReworkInstructionCandidateFileName(
  unitId: string,
  targetRole: "Worker" | "Designer" | "Infra",
  timestamp: string
): string
function parseRevision(fileName: string): number | null
function suggestRevisionFileName(fileName: string, existing: SavedArtifact[], logicalPath: string): string
function analyzeArtifactOutput(
  content: string,
  inputs: PromptRuntimeInputs,
  currentStep: ResolvedFlowStepV14 | null,
  runtimeState: FlowRuntimeState,
  existingArtifacts: SavedArtifact[],
  manualFileName?: string,
  manualPhase?: string,
  manualTargetRole?: string
): ArtifactAnalysisResult
function loadSavedArtifacts(): SavedArtifact[]
function saveSavedArtifacts(artifacts: SavedArtifact[]): void
function artifactTypeToDefaultInputKey(type: ArtifactType): RuntimeInputKey | null
function applyArtifactToRuntimeOutputsText(
  runtimeOutputsText: string,
  artifact: SavedArtifact,
  inputKey: RuntimeInputKey
): { ok: true; text: string } | { ok: false; error: string }
```

### 10.3 State

`Home` componentに追加する。

- `artifactOutputText`
- `artifactManualFileName`
- `artifactManualPhase`
- `artifactManualTargetRole`
- `savedArtifacts`
- `artifactTypeFilter`
- `artifactUnitFilter`
- `artifactInputTargetKey`
- `artifactSaveMessage`

### 10.4 UI Placement

`U-FLOW-11 Prompt Runtime` の直後、Runtime Controlsの前に `U-FLOW-12 Artifact Save Runtime` パネルを置く。

パネル構成:

1. Save panel
2. Analysis preview
3. Save warnings/errors
4. Saved Artifact list
5. Use as next_step Input controls

### 10.5 Action Log

Artifact保存成功時に `runtimeActionLogs` へ追加する。

Action例:

- `Artifact Saved`
- note: `fileName; logicalPath; artifactType`

Input反映時も追加する。

Action例:

- `Artifact Applied to Runtime Input`
- note: `fileName -> packet_content`

## 11. Acceptance Criteria

1. Role Output本文を貼り付けるArtifact保存UIがある。
2. `File:` 行からファイル名を抽出できる。
3. `File:` 欠落時、自動保存せず候補名提示または手動入力に切り替わる。
4. Artifact種別を判定できる。
5. Unit IDをRuntime文脈またはファイル名から判定できる。
6. Artifact種別に応じた論理保存先を提案できる。
7. Human確認後にArtifactを保存できる。
8. 保存済みArtifact一覧を表示できる。
9. 一覧にファイル名、種別、作成日時、関連Flow Step、関連Roleが表示される。
10. current_step / state / route_contextをArtifactに紐付けできる。
11. 保存済みArtifactをnext_step Prompt生成用Inputとして `runtimeOutputsText` に反映できる。
12. PMDecisionにPhase付き命名規則を適用できる。
13. PMDecision_ReworkにTargetRole付き命名規則を適用できる。
14. ReworkInstructionにTargetRole + timestamp付き命名規則を適用できる。
15. `[Unit]_Decision.md` など汎用Decision名を保存ブロックできる。
16. 同一論理フォルダ内の同名衝突時、上書きせず警告できる。
17. 同名衝突時、既存Revを見て `_RevN` 候補を提示できる。
18. `WorkerApproval / Conditional / Hold` を保存可能Phaseとして扱える。
19. Report判定が `*Report_*` / `*Result_*` に限定される。
20. U-FLOW-11 Prompt Runtimeの生成・コピー・Stage動作が維持される。
21. `main-05` Integrator-S PM-approved Spec guardが維持される。
22. `main-06` Worker external handoffがAPI送信されない制約が維持される。

## 12. Verification

Workerは最低限以下を実施する。

- `npm run build`
- 手動確認:
  - `File: U-FLOW-12_Packet.md` を含む本文を保存できる。
  - `File:` 欠落本文では保存がブロックされ、候補名が表示される。
  - `U-FLOW-12_PMDecision_SpecApproval.md` がDecision / `units/U-FLOW-12/decisions/` と判定される。
  - 同名保存2回目で `_Rev2` が提案される。
  - `U-FLOW-12_PMDecision_Rework_Worker.md` がPMDecision_Rework / `decisions/` と判定される。
  - `U-FLOW-12_ReworkInstruction_Worker_20260506_120000.md` がReworkInstruction / `rework/` と判定される。
  - `U-FLOW-12_DebugReport_20260506_120000.md` がReport / `reports/` と判定される。
  - `ErrorReport.md` や `TestResults.json` がReportとして誤判定されない。
  - 保存済みPacketを `packet_content` に反映後、Worker stepのPrompt生成で利用できる。
  - 既存U-FLOW-11 Prompt Runtimeで `Generate Prompt`, `Copy Prompt`, `Stage to Role Columns` が従来通り動く。

## 13. Worker Notes

実装は小さくまとめること。既存 `app/page.tsx` は大きいので、まず純関数を追加し、次にstate、最後にUIを足す。

UI文言は既存の文字化け箇所を直す必要はないが、新規追加文言は英語または日本語として読める文字列でよい。

このPacketは実装指示であり、WorkerはPacket外の仕様変更判断をしない。

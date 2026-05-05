Role: Integrator-S
Scope: Structure

# U-FLOW-11_Packet.md

## 1. Unit

U-FLOW-11
Chat Runtime 組み込み

## 2. Goal

Flow Runtime上の `current_step` に応じて、対象Role、Role Template、必要Inputを解決し、Role Header付きPromptを生成して、対象チャット列または外部Workerへ投入できる状態にする。

U-FLOW-11完了後、Flowに沿ったRole実行の最小運用が可能になることを目標とする。

## 3. Target

対象は既存のFlow Runtime / Chat Runtime連携部分。

主な実装対象:

- `current_step` からのStep定義解決
- Step定義からのRole / Template解決
- Role TemplateへのVariables埋め込み
- 必須Inputチェック
- Decision / Feedback / Verified transition の遷移制御
- Worker external_handoff用Prompt生成
- 対象Role列へのPrompt投入または投入ガイド表示
- Role Output受領後のHuman step完了操作

対象外:

- Flow v1.4 JSON自体の変更
- Worker API自動連携
- 成果物永続化機能の完成
- Role Template本文の再設計

## 4. Purpose

U-FLOW-08までで構築済みのFlow Runtimeを、U-FLOW-09 Role I/O Schema、U-FLOW-10 Role Template、U-FLOW-11 Chat Runtime Integration Designに接続する。

Runtimeは以下を満たす必要がある。

1. Flow定義に基づき、現在Stepの実行対象Roleを決定する。
2. 実行対象Roleに対応するRole Templateを選択する。
3. Role Templateに必要Inputだけを埋め込む。
4. 必須Input不足時はPrompt生成を停止する。
5. Human Gate / Decision / Feedback / Parallel / Join / External Handoffを既存Flow Runtime制御と整合させる。
6. Worker実行はVSCode Copilotへの手動投入を前提とし、自動API連携しない。

## 5. Inputs

### 5.1 Primary Inputs

- U-FLOW-11_PMDecision_Final.md
- U-FLOW-11_Spec.md Rev.2
- U-FLOW-11 ReviewReport Rev.2 再レビュー
- U-FLOW-10_Spec.md Rev.2
- U-FLOW-09_Spec.md Rev.1
- AI Business OS Full Flow v1.4 JSON
- 既存アプリ / リポジトリ一式

### 5.2 Runtime Inputs

- `flowDefinition`
- `current_step`
- `current_state`
- `route_context`
- `loop_counter`
- `max_iterations`
- `role_bindings`
- `role_templates`
- `runtime_outputs`
- `human_decision`
- `cause_classification`
- `verified_result`

### 5.3 Role Input Mapping

U-FLOW-09に従い、各RoleのInputは上流Outputまたは許可された例外Inputに限定する。

- PM: `Human.GoalInput`, `Reviewer.ReviewReport`, `Integrator-C.ControlDecision`, `Human.ExecutionResult`
- Designer: `PM.Decision`, `Reviewer.ReviewReport`, `Integrator-C.ReworkInstruction`
- Reviewer: `Designer.Spec`
- Integrator-S: `Designer.Spec` plus PM承認済み状態
- Worker: `Integrator-S.Packet`, `Integrator-C.ReworkInstruction`
- Debugger: `Worker.Code`, `Integrator-S.Packet`, `Designer.Spec`
- Infra: `Worker.Code`, `Integrator-S.Packet`, `Human.ExecutionResult`, `Integrator-C.ReworkInstruction`
- Integrator-C: `Debugger.DebugReport`, `Infra.TestResult`, `Worker.Code`, `Integrator-S.Packet`, `Designer.Spec`
- Human: `GoalInput`, `ExecutionResult`, `ApprovalResult`

## 6. Outputs

### 6.1 Runtime Outputs

- Role Header付きPrompt
- Template Variables埋め込み済みPrompt
- Worker external_handoff用Prompt
- Input不足エラー / PM警告
- Human Gate用操作ガイド
- Decision branch解決結果
- Feedback branch解決結果
- Verified transition解決結果
- Step完了後の次Step候補

### 6.2 Worker Implementation Outputs

Workerは以下を作成または修正する。

- Chat Runtime接続コード
- Step / Role / Template解決ロジック
- Prompt生成ロジック
- Input validationロジック
- Worker external_handoff制御
- Human step完了操作制御
- 必要に応じた最小UI表示
- WorkReport

## 7. Constraints

1. Flow v1.4 JSONは変更しない。
2. 既存Flow Runtimeロジックを優先的に使用する。
3. Role Template本文をWorker判断で変更しない。
4. 未定義InputをPromptに混入しない。
5. 必須Input不足時はPrompt生成を停止する。
6. Worker API自動連携はしない。
7. Worker実行はVSCode Copilotへの手動投入を前提とする。
8. 成果物永続化機能の完成は本Unit対象外。
9. Decision stepはHuman選択値に基づき分岐する。
10. Feedback stepはIntegrator-Cの `cause_classification` に基づき分岐する。
11. `max_iterations` 超過時はPrompt生成を停止し、PMへ警告する。
12. Verified transition時は `route_context` を `main` へresetし、次Stepを `main-09` に接続する。
13. Integrator-S実行時はPM承認済みSpecであることを担保する。

## 8. Dependencies

### 8.1 Prior Unit Dependencies

- U-FLOW-08: Flow Runtime基盤
- U-FLOW-09: Role I/O Schema
- U-FLOW-10: Role Template設計
- U-FLOW-11: Chat Runtime Integration Design

### 8.2 Runtime Dependencies

- Flow v1.4 JSON読込済みであること
- `template_ref` 解決機構が利用可能であること
- state / route_context による次Step解決が利用可能であること
- parallel / join 処理が利用可能であること
- loop counter処理が利用可能であること
- Human Gate待機・完了操作が利用可能であること
- Role列バインディングが利用可能であること

### 8.3 Role Binding Dependencies

Flow v1.4 JSONの `role_bindings` に従う。

- PM: `col1`
- Designer: `col2`
- Reviewer: `col3`
- Integrator-S: `col4`
- Worker: external / VSCode Copilot / manual handoff
- Debugger: `col5`
- Infra: `col1` shared
- Integrator-C: `col1` shared

## 9. Required Behavior

### 9.1 Step Definition Resolution

`current_step` からFlow定義上のStep定義を取得する。

探索対象:

- `main_flow`
- `feedback_flow.branches.implementation.flow`
- `feedback_flow.branches.specification.flow`
- `feedback_flow.branches.environment.flow`
- `templates` via `template_ref`

`template_ref` を持つStepは、参照先Templateを解決して実行定義として扱う。

### 9.2 Role / Template Resolution

Step定義から実行対象Roleを解決する。

原則:

- `to` が単一Roleの場合、そのRoleを対象Roleとする。
- `to` がRole配列の場合、parallel対象Roleとして扱う。
- `type: join` の場合、join完了後の `to` Roleを対象Roleとする。
- `type: decision` の場合、Human選択値に基づきbranchの `to` Roleを対象Roleとする。
- `type: external_handoff` の場合、`to` Roleを外部投入対象として扱う。

特殊処理:

- `main-05`: 実行対象Roleは `Integrator-S`。
- `main-06`: 実行対象Roleは `Worker`。処理種別は `external_handoff`。Prompt種別は `Worker Handoff Prompt`。
- `main-09`: 実行対象Roleは `PM`。
- `fb-impl-02`: `main-07` と同一のparallel処理として扱う。
- `fb-spec-06`: `main-07` と同一のparallel処理として扱う。
- `fb-spec-03`: `main-04` と同一のReviewer Decision仕様として扱う。

Role TemplateはU-FLOW-10 Section 6に従ってRole別に選択する。

### 9.3 PM Approval Guard for Integrator-S

Integrator-S実行時は、PM承認済みSpecであることを確認する。

対象Step:

- `main-05`
- `fb-spec-04`

許可条件:

- `current_state === "Reviewed"`
- 対象SpecがPM承認済みであることを示す内部フラグがtrue
- ReviewReportがPassまたはPMが実装進行承認済み

不許可時:

- Prompt生成を停止する。
- PM承認不足エラーを表示する。
- 次Stepへ遷移しない。

### 9.4 Prompt Variable Resolution

Role TemplateごとのVariablesに対して、Runtime上の上流Outputを割り当てる。

必須Inputが不足している場合:

- Prompt生成を停止する。
- 不足Input名をUIに表示する。
- Human Gate完了操作を許可しない。

任意Inputまたは条件付きInputの場合:

- 条件を満たす場合のみ埋め込む。
- 条件を満たさない場合はPromptに混入しない。

未定義Input:

- Promptに混入禁止。
- 自動推測禁止。

### 9.5 Prompt Generation

生成Promptは以下の構造にする。

1. Role Header
2. Mission
3. Input Policy
4. Provided Variables
5. Task Instruction
6. Output Schema
7. Prohibitions
8. Output Protocol

Role Header例:

`Role: <TargetRole>`
`Scope: <ScopeName>`

Output Protocol:

- COPY Mode
- 1ブロック出力
- ファイル名明示

### 9.6 Decision Step Handling

対象Step:

- `main-04`
- `fb-spec-03`

処理:

1. Humanへ選択肢を提示する。
2. `pass` / `conditional` / `reject` の選択を受け取る。
3. Flow定義の `review_decision` および `reviewer_decision_step.branches` に基づき次Role / 次Stateを決定する。
4. `reject` の場合、ReviewReportをDesigner Inputへスタックする。
5. 次Step候補をstate / route_contextから解決する。

### 9.7 Feedback Branch Handling

対象:

- `implementation`
- `specification`
- `environment`

処理:

1. Integrator-Cの `cause_classification` を受け取る。
2. `loop_counter` を確認する。
3. `count < max_iterations` の場合のみPrompt生成を継続する。
4. 上限超過時はPrompt生成を停止し、PMへ警告する。
5. branch定義の `route_context` / `state_rollback_to` に従い次Stepを決定する。

Environment branch制約:

- `no_code_change_only` の場合のみInfraへ差戻す。
- コード修正が必要な場合は `implementation` または `specification` へ再分類する。

### 9.8 Parallel / Join Handling

Parallel対象:

- `main-07`
- `fb-impl-02`
- `fb-spec-06`

処理:

1. Worker成果物をDebugger / Infraへ並列投入するPromptを生成する。
2. Debugger PromptとInfra Promptを別々に生成する。
3. 両Roleの完了を待つ。
4. `join: all_complete` を満たした場合のみ次Join Stepへ進む。

Join対象:

- `main-08`
- `fb-impl-03`
- `fb-spec-07`
- `fb-env-04`

処理:

1. Debugger / Infra / Human結果を集約する。
2. Integrator-C Promptを生成する。
3. Integrator-CがControlDecisionまたはReworkInstructionを出力する。

### 9.9 Verified Transition Handling

Integrator-CがVerified条件を満たすControlDecisionを返した場合、Runtimeは以下を実行する。

1. `state` を `Verified` にする。
2. `route_context` を `main` にresetする。
3. `current_step` または次Stepを `main-09` に接続する。
4. PM向けPromptを生成可能にする。

Verified条件:

- Debugger Pass
- Infra/Human Acceptance OK
- Acceptance Criteria met
- Integrator-C cause review completed

### 9.10 Worker External Handoff

対象Step:

- `main-06`
- `fb-impl-01`
- `fb-spec-05`

処理:

1. Worker向けPromptを生成する。
2. VSCode Copilot投入用としてクリップボードコピー可能にする。
3. 外部投入ガイドを表示する。
4. Worker API自動送信はしない。
5. Worker出力はpasteまたはfile attachで戻す前提にする。
6. HumanがWorker出力受領後にstep完了操作を行う。

### 9.11 Human Step Completion

各StepはHuman Gateを前提に、Humanが出力確認後に完了操作できること。

完了操作時に行うこと:

- 当該StepのOutput登録
- State更新
- route_context更新
- loop_counter更新
- 次Step候補更新
- parallel/join状態更新

## 10. Acceptance Criteria

Worker実装は以下を満たすこと。

1. `current_step` から対象Roleを解決できる。
2. `current_step` から使用Role Templateを解決できる。
3. `template_ref` を解決できる。
4. Template VariablesへInputを埋め込める。
5. 必須Input不足時にPrompt生成を停止できる。
6. 条件付きInputを条件に応じて扱える。
7. 未定義InputをPromptへ混入しない。
8. Role Header付きPromptを生成できる。
9. 対象Role列へPromptを投入できる。
10. Worker external_handoff用Promptを生成できる。
11. Worker external_handoffでAPI自動送信しない。
12. `main-05` でIntegrator-Sを正しく解決できる。
13. `main-06` でWorker external_handoffとして扱える。
14. `main-09` でPMを正しく解決できる。
15. `fb-impl-02` をmain-07同等のparallel処理として扱える。
16. `fb-spec-06` をmain-07同等のparallel処理として扱える。
17. `fb-spec-03` をmain-04同等のReviewer Decisionとして扱える。
18. Decision stepでHuman選択に応じて次Stepを解決できる。
19. Feedback stepで `cause_classification` に応じてbranchを解決できる。
20. `max_iterations` 超過時にPrompt生成を停止しPM警告を表示できる。
21. Human manual_execution stepで手順表示、結果入力、次Step遷移ができる。
22. Verified transition時に `route_context` を `main` へresetし、`main-09` へ接続できる。
23. Integrator-S実行時にPM承認済みSpecであることを担保できる。
24. Role Output受領後、Humanがstep完了操作できる。
25. U-FLOW-11完了後、Flowに沿ったRole実行の最小運用が可能になる。

## 11. Notes

### 11.1 U-FLOW-11申し送りH

`fb-impl-02` および `fb-spec-06` は、U-FLOW-11_Spec Section 1.2の代表ステップ表では省略されているが、Flow v1.4 JSON上は存在する。

実装時は以下の通り扱う。

- `fb-impl-02`: Worker → Debugger / Infra 並列再検証
- `fb-spec-06`: Worker → Debugger / Infra 並列再検証
- 処理は `main-07` のparallel / join制御を流用する。

### 11.2 U-FLOW-11申し送りI

`main-06` はRole列に「Integrator-S to Worker」という遷移名が残っているが、実装時は以下として扱う。

- `current_step`: `main-06`
- 実行対象Role: `Worker`
- 処理種別: `external_handoff`
- Prompt種別: `Worker Handoff Prompt`

### 11.3 Existing Runtime Priority

既存Flow Runtimeに同等機能がある場合、重複実装せず既存関数を拡張またはラップする。

特に以下は既存実装流用を優先する。

- Flow JSON読込
- template_ref解決
- state / route_context routing
- human_gate制御
- parallel / join制御
- loop counter制御

## 12. Implementation Skeleton

### 12.1 Core Types

```ts
type RoleName =
  | 'Human'
  | 'PM'
  | 'Designer'
  | 'Reviewer'
  | 'Integrator-S'
  | 'Worker'
  | 'Debugger'
  | 'Infra'
  | 'Integrator-C';

type StepType =
  | 'single'
  | 'decision'
  | 'parallel'
  | 'join'
  | 'external_handoff'
  | 'manual_execution';

type PromptGenerationResult = {
  ok: boolean;
  stepId: string;
  targetRoles: RoleName[];
  promptByRole?: Record<string, string>;
  externalHandoff?: boolean;
  errors?: string[];
  warnings?: string[];
};
```

### 12.2 Step Resolution

```ts
function resolveStepDefinition(flowDefinition: FlowDefinition, currentStepId: string): FlowStep {
  // 1. Search main_flow
  // 2. Search each feedback_flow branch flow
  // 3. If template_ref exists, resolve referenced template
  // 4. Return normalized step definition
}
```

### 12.3 Role Resolution

```ts
function resolveTargetRoles(step: FlowStep, runtime: RuntimeState): RoleName[] {
  if (step.id === 'main-05') return ['Integrator-S'];
  if (step.id === 'main-06') return ['Worker'];
  if (step.id === 'main-09') return ['PM'];

  if (step.type === 'decision') {
    return [resolveDecisionTargetRole(step, runtime.human_decision)];
  }

  if (Array.isArray(step.to)) return step.to as RoleName[];
  return [step.to as RoleName];
}
```

### 12.4 Template Resolution

```ts
function resolveRoleTemplate(role: RoleName, step: FlowStep): RoleTemplate {
  // Use U-FLOW-10 role template mapping.
  // Do not modify template body here.
  // For Worker external_handoff, use Worker Template with handoff wrapper.
}
```

### 12.5 Input Mapping and Validation

```ts
function buildPromptVariables(role: RoleName, step: FlowStep, runtime: RuntimeState): Record<string, unknown> {
  // Map allowed upstream outputs only.
  // Do not include undefined or guessed inputs.
}

function validateRequiredInputs(role: RoleName, variables: Record<string, unknown>): ValidationResult {
  // Stop prompt generation if required inputs are missing.
}
```

### 12.6 PM Approval Guard

```ts
function assertPmApprovedForIntegratorS(step: FlowStep, runtime: RuntimeState): ValidationResult {
  const requiresGuard = step.id === 'main-05' || step.id === 'fb-spec-04';
  if (!requiresGuard) return { ok: true };

  if (runtime.current_state !== 'Reviewed') {
    return { ok: false, errors: ['Integrator-S requires Reviewed state.'] };
  }

  if (!runtime.flags?.pmApprovedSpec) {
    return { ok: false, errors: ['PM-approved Spec flag is missing.'] };
  }

  return { ok: true };
}
```

### 12.7 Prompt Generation

```ts
function generateRolePrompt(role: RoleName, template: RoleTemplate, variables: Record<string, unknown>): string {
  return [
    `Role: ${role}`,
    `Scope: ${template.scope}`,
    '',
    template.mission,
    '',
    template.inputPolicy,
    '',
    renderVariables(variables),
    '',
    template.taskInstruction,
    '',
    template.outputSchema,
    '',
    template.prohibitions,
    '',
    template.outputProtocol,
  ].join('\n');
}
```

### 12.8 External Handoff

```ts
function buildWorkerHandoffPrompt(packetOrInstruction: string, context: RuntimeState): string {
  // Generate Worker prompt for VSCode Copilot manual handoff.
  // No API request.
  // Include explicit output return method: paste_or_file_attach.
}
```

### 12.9 Decision Branch

```ts
function resolveDecisionBranch(step: FlowStep, humanDecision: 'pass' | 'conditional' | 'reject'): BranchResolution {
  // Use reviewer_decision_step.branches.
  // reject stacks review_report for Designer.
}
```

### 12.10 Feedback Branch

```ts
function resolveFeedbackBranch(runtime: RuntimeState): BranchResolution {
  const cause = runtime.cause_classification;
  const count = runtime.loop_counter?.[cause] ?? 0;
  const max = runtime.max_iterations ?? 3;

  if (count >= max) {
    return {
      ok: false,
      stopPromptGeneration: true,
      warning: 'max_iterations exceeded. Escalate to PM.',
    };
  }

  // Resolve branch route_context and next step from flowDefinition.feedback_flow.branches[cause].
}
```

### 12.11 Verified Transition

```ts
function handleVerifiedTransition(controlDecision: ControlDecision, runtime: RuntimeState): RuntimeState {
  if (!controlDecision.verified) return runtime;

  return {
    ...runtime,
    current_state: 'Verified',
    route_context: 'main',
    current_step: 'main-09',
  };
}
```

### 12.12 Orchestrated Prompt Generation

```ts
function generatePromptForCurrentStep(flowDefinition: FlowDefinition, runtime: RuntimeState): PromptGenerationResult {
  const step = resolveStepDefinition(flowDefinition, runtime.current_step);
  const guard = assertPmApprovedForIntegratorS(step, runtime);
  if (!guard.ok) return { ok: false, stepId: step.id, targetRoles: [], errors: guard.errors };

  const roles = resolveTargetRoles(step, runtime);
  const promptByRole: Record<string, string> = {};
  const errors: string[] = [];

  for (const role of roles) {
    const template = resolveRoleTemplate(role, step);
    const variables = buildPromptVariables(role, step, runtime);
    const validation = validateRequiredInputs(role, variables);

    if (!validation.ok) {
      errors.push(...validation.errors);
      continue;
    }

    promptByRole[role] = generateRolePrompt(role, template, variables);
  }

  if (errors.length > 0) {
    return { ok: false, stepId: step.id, targetRoles: roles, errors };
  }

  return {
    ok: true,
    stepId: step.id,
    targetRoles: roles,
    promptByRole,
    externalHandoff: step.type === 'external_handoff',
  };
}
```

## 13. Worker Instructions

1. まず既存Flow Runtime実装を確認し、既存関数を再利用できる箇所を特定する。
2. Flow v1.4 JSONは変更しない。
3. `current_step` 解決からPrompt生成までをRuntime関数として接続する。
4. `main-05`, `main-06`, `main-09`, `fb-impl-02`, `fb-spec-03`, `fb-spec-06`, Verified transition を重点確認する。
5. Worker external_handoffは手動投入ガイドに限定する。
6. 必須Input不足時の停止処理を必ず入れる。
7. 実装後、Acceptance Criteria単位で自己検証する。
8. 変更内容と自己検証結果をWorkReportとして返す。

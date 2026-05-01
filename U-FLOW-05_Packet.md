File:
U-FLOW-05_Packet.md

Unit:
U-FLOW-05

Goal:
Human gate / external handoff UIを実装し、routing resolverの結果を人間が確認して次stepへ進められるようにする。

Target:
app/page.tsx

Purpose:
U-FLOW-01〜04でFlow定義の読込、template_ref解決、state + route_context routing、ControlReview runtime resolverが揃った。
このUnitでは、解決された次step候補をUI上に表示し、human_gate=true のstepについて人間が承認して進めるための最小UIを実装する。
また、Workerのような external_handoff step については、外部投入用の指示文を表示し、手動コピーできる状態にする。

Inputs:
・selectedFlow : FlowDefinition : 選択中Flow
・currentFlowState : string : 現在State
・currentRouteContext : string : 現在route_context
・resolveRouting(flow, state, routeContext) : RoutingResolutionResult
・resolveControlReviewRuntime(flow, routingResult, decision) : ControlRuntimeResolution
・ResolvedFlowStepV14 : template展開済みstep
・step.human_gate : boolean | undefined
・step.type : string | undefined
・step.instruction : string | undefined
・step.from / step.to : string | string[] | undefined
・step.state_from / step.state_to : string | undefined
・step.route_context : string | undefined

Outputs:
・現在State / route_context をUIで確認できる
・resolveRoutingの結果から次step候補をUI表示できる
・human_gate=true のstepは「承認して進む」操作を要求する
・human_gate=false または未指定のstepも、今回は安全のため手動進行扱いにする
・external_handoff step の場合、Worker投入用 instruction をコピーしやすく表示する
・承認操作により currentFlowState / currentRouteContext を次stepの state_to / route_context に更新できる
・ControlReview の場合、U-FLOW-04 runtime resolverのサンプル入力に基づき、Verifiedまたはfeedback branchの遷移先を表示できる
・旧式 steps Flow は壊さない

Constraints:
・このUnitではAI自動送信は実装しない
・このUnitではWorkerへの自動API送信は実装しない
・このUnitではparallel / join の完了管理は実装しない
・このUnitではloop counterは実装しない
・このUnitでは実際のControl Decision自動生成は実装しない
・ControlReview decision は確認用の手動入力または簡易セレクトでよい
・API送信処理 handleSubmit は変更しない
・通常チャット送信挙動は変更しない
・既存のモデル設定・カラム設定・添付・履歴選択機能を壊さない
・Human gateは必ず人間操作を挟む
・external_handoffは必ず手動投入扱いにする
・TypeScript構文エラーを出さない
・既存UIの大幅なレイアウト変更は禁止

Dependencies:
・U-FLOW-01 が完了していること
・U-FLOW-02 が完了していること
・U-FLOW-03 が完了していること
・U-FLOW-04 が完了していること
・FlowDefinitionV14 / ResolvedFlowStepV14 / RoutingResolutionResult / ControlReviewDecision / ControlRuntimeResolution 型が存在すること
・isFlowV14 型ガードが存在すること
・resolveRouting が存在すること
・resolveControlReviewRuntime が存在すること
・formatFlowEndpoint が存在すること

Acceptance Criteria:
・v1.4 Flow選択時、現在State / route_context が表示される
・初期値として state="Draft", route_context="main" を持てる
・Draft/main から routing resolver により main-02 を次stepとして表示できる
・表示されたstepの id / name / from / to / state_from / state_to / type / instruction を確認できる
・「承認して進む」ボタンで currentFlowState が step.state_to に更新される
・route_context は step.route_context があればそれに更新され、なければ現route_contextを維持する
・external_handoff step の場合、外部投入が必要であることがUI表示される
・external_handoff step の instruction をコピーできる、またはコピーしやすいtextarea等に表示される
・ControlReview状態では、確認用Control Decision入力により Verified / implementation / specification / environment の分岐結果を表示できる
・Verified分岐では route_context_reset="main" を反映できる
・未解決routingやunresolved結果の場合、クラッシュせず未解決理由を表示する
・旧式 steps FlowではFlow実行UIを無効または簡易表示に留め、既存表示を壊さない
・v1.4 Flowの保存・リロードが壊れない
・npm run lint または npm run build で、今回変更起因の型エラーが出ない

Notes:
・このUnitは「自動実行」ではなく「人間承認つきステップ進行UI」である
・AI事業OSではhuman_gate_required_for_transitionがあるため、最初は全step手動承認でよい
・external_handoffはWorker / VSCode Copilot投入のための手動橋渡し表示とする
・parallel / join の本格管理はU-FLOW-06で実装する
・loop iteration counterはU-FLOW-07で実装する
・ControlReviewのdecision入力は暫定UIでよい。後続でIntegrator-C出力と接続する

Implementation Skeleton:
type FlowRuntimeState = {
state: string;
routeContext: string;
};

const DEFAULT_FLOW_RUNTIME_STATE: FlowRuntimeState = {
state: "Draft",
routeContext: "main",
};

function getStepDisplayName(step: ResolvedFlowStepV14): string {
return step.name || step.id || "(unnamed step)";
}

function getNextRuntimeState(
current: FlowRuntimeState,
step: ResolvedFlowStepV14
): FlowRuntimeState {
return {
state: step.state_to || current.state,
routeContext: step.route_context || current.routeContext,
};
}

function isExternalHandoffStep(step: ResolvedFlowStepV14): boolean {
return step.type === "external_handoff";
}

function buildExternalHandoffText(step: ResolvedFlowStepV14): string {
// TODO:
// Workerや外部AIへ貼り付けるための最低限の指示文を作る
// step.instruction / state / from / to / id / name を含める
}

function FlowRuntimePanel(props: {
flow: FlowDefinition;
runtimeState: FlowRuntimeState;
onRuntimeStateChange: (next: FlowRuntimeState) => void;
}) {
// TODO:
// 1. flowがv1.4でなければ「このFlowは実行UI未対応」と表示
// 2. resolveRouting(flow, runtimeState.state, runtimeState.routeContext) を取得
// 3. 通常stepがあれば一覧表示
// 4. specialRefsがあればControlReview用UIを表示
// 5. stepごとに「承認して進む」ボタンを表示
// 6. external_handoffの場合は外部投入用テキストを表示
}

function ControlReviewDecisionPanel(props: {
flow: FlowDefinitionV14;
routingResult: RoutingResolutionResult;
onResolved: (resolution: ControlRuntimeResolution) => void;
}) {
// TODO:
// 1. verified true/false を選べる簡易UI
// 2. verified=false の場合 cause を選べる
// 3. resolveControlReviewRuntime を呼ぶ
// 4. 解決結果を表示
// 5. 遷移適用ボタンで runtimeState に反映できるよう親へ返す
}

Suggested Work:

1. FlowRuntimeState 型と state を追加する
2. selectedFlow 変更時に runtime state を Draft/main に初期化する
3. Flow設定/プレビュー周辺に FlowRuntimePanel を追加する
4. resolveRouting 結果をUI表示する
5. 次stepの詳細をカードまたはリストで表示する
6. human_gate の有無を表示する
7. external_handoff step の場合、外部投入用テキストを表示する
8. 「承認して進む」操作で currentFlowState / currentRouteContext を更新する
9. ControlReview specialRefs がある場合、暫定ControlReviewDecisionPanelを表示する
10. Verified時は route_context_reset を反映する
11. unresolved / not_applicable をクラッシュせず表示する
12. npm run lint または npm run build を実行して結果を報告する

Worker Output:
・修正したファイル名
・修正概要
・Human gate UI の仕様
・external_handoff UI の仕様
・ControlReview 暫定decision UI の仕様
・状態更新ルール
・ビルド / lint 結果
・未対応事項があれば明記
・仕様判断が必要な点があれば実装せず質問として返す

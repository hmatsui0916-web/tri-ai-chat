File:
U-FLOW-06_Packet.md

Unit:
U-FLOW-06

Goal:
parallel / join handling を実装し、並列検証stepをUI上で完了管理できるようにする。

Target:
app/page.tsx

Purpose:
U-FLOW-05までで、routing resolverの結果をHuman gate UIで確認し、stepを手動進行できるようになった。
このUnitでは、type="parallel" のstepを検出し、複数の遷移先（例：Debugger / Infra）をUI上で個別タスクとして表示する。
join="all_complete" の場合、全並列タスクが完了した後に次のjoin stepへ進めるようにする。

Inputs:
・selectedFlow : FlowDefinition : 選択中Flow
・currentFlowState : string : 現在State
・currentRouteContext : string : 現在route_context
・resolveRouting(flow, state, routeContext) : RoutingResolutionResult
・ResolvedFlowStepV14 : template展開済みstep
・step.type : string | undefined
・step.join : string | undefined
・step.from : string | string[] | undefined
・step.to : string | string[] | undefined
・step.state_from : string | undefined
・step.state_to : string | undefined
・step.route_context : string | undefined
・step.instruction : string | undefined

Outputs:
・type="parallel" のstepをUI上で並列stepとして表示できる
・to が配列の場合、各宛先を個別タスクとして表示できる
・各並列タスクに完了チェックを付けられる
・join="all_complete" の場合、全タスク完了まで次Stateへ進めない
・全タスク完了後に step.state_to へ進める
・通常step / external_handoff step の既存挙動を壊さない
・旧式 steps Flow は壊さない

Constraints:
・このUnitではAI自動送信は実装しない
・このUnitではDebugger / Infraへの実際のAPI送信は実装しない
・このUnitではjoin後の検証結果本文の統合処理は実装しない
・このUnitではloop counterは実装しない
・このUnitではControlReviewの判定生成は実装しない
・API送信処理 handleSubmit は変更しない
・通常チャット送信挙動は変更しない
・既存のモデル設定・カラム設定・添付・履歴選択機能を壊さない
・parallel step は必ず人間操作で完了扱いにする
・join="all_complete" 以外のjoinモードは未対応として安全に表示する
・TypeScript構文エラーを出さない
・既存UIの大幅なレイアウト変更は禁止

Dependencies:
・U-FLOW-01 が完了していること
・U-FLOW-02 が完了していること
・U-FLOW-03 が完了していること
・U-FLOW-04 が完了していること
・U-FLOW-05 / U-FLOW-05R1 が完了していること
・FlowDefinitionV14 / ResolvedFlowStepV14 / RoutingResolutionResult 型が存在すること
・isFlowV14 型ガードが存在すること
・resolveRouting が存在すること
・getNextRuntimeState または applyResolvedStep 相当の状態更新処理が存在すること
・formatFlowEndpoint が存在すること
・Flow v1.4 JSONに type="parallel" / join="all_complete" のstepが存在すること

Acceptance Criteria:
・main-07 が type="parallel" として認識される
・main-07 の to=["Debugger","Infra"] が2つの並列タスクとして表示される
・Debuggerタスクのみ完了した状態では次へ進めない
・Infraタスクのみ完了した状態では次へ進めない
・Debugger / Infra の両方を完了した後に次へ進める
・両方完了後、「join完了して進む」操作で state が Debug に更新される
・route_context は main を維持する
・fb-impl-02 の parallel step でも feedback_implementation の route_context を維持できる
・fb-spec-06 の parallel step でも feedback_specification の route_context を維持できる
・parallel以外の通常stepはU-FLOW-05までの挙動を維持する
・join未対応値の場合はクラッシュせず未対応表示になる
・旧式 steps FlowではFlow実行UIを無効または簡易表示に留め、既存表示を壊さない
・v1.4 Flowの保存・リロードが壊れない
・npm run lint または npm run build で、今回変更起因の型エラーが出ない

Notes:
・このUnitは「並列タスクの完了確認UI」であり、実際のDebugger / Infra実行はまだ手動で行う
・main-07は Worker成果物を Debugger / Infra へ並列投入するstepである
・fb-impl-02 / fb-spec-06 も同様に並列再検証stepである
・join="all_complete" は全タスク完了を意味する
・join後にどのstepへ進むかは、state_to 更新後に既存の routing resolver が解決する
・検証結果本文の収集・統合は後続Unitで扱う
・loop iteration counterはU-FLOW-07で扱う

Implementation Skeleton:
type ParallelTaskStatus = {
id: string;
target: string;
completed: boolean;
};

type ParallelRuntimeState = {
stepId: string;
joinMode: string;
tasks: ParallelTaskStatus[];
};

function isParallelStep(step: ResolvedFlowStepV14): boolean {
return step.type === "parallel";
}

function getParallelTargets(step: ResolvedFlowStepV14): string[] {
// TODO:
// step.to が配列ならそのまま返す
// step.to が文字列なら単一配列で返す
// それ以外なら []
}

function createParallelRuntimeState(step: ResolvedFlowStepV14): ParallelRuntimeState {
// TODO:
// 1. getParallelTargets(step) でtargets取得
// 2. targetごとに { id, target, completed:false } を作る
// 3. joinMode は step.join || "unsupported"
}

function isParallelComplete(parallelState: ParallelRuntimeState): boolean {
// TODO:
// joinMode が "all_complete" の場合は全tasks.completed === true
// それ以外は false
}

function updateParallelTaskStatus(
parallelState: ParallelRuntimeState,
taskId: string,
completed: boolean
): ParallelRuntimeState {
// TODO:
// 指定taskのcompletedだけ更新した新objectを返す
}

function ParallelStepPanel(props: {
step: ResolvedFlowStepV14;
parallelState: ParallelRuntimeState | null;
onParallelStateChange: (next: ParallelRuntimeState) => void;
onCompleteAndAdvance: () => void;
}) {
// TODO:
// 1. step情報を表示
// 2. targetごとのcheckboxを表示
// 3. joinModeを表示
// 4. all_completeで全完了するまで進行ボタンdisabled
// 5. unsupported joinの場合は未対応表示
}

Suggested Work:

1. ParallelTaskStatus / ParallelRuntimeState 型を追加する
2. isParallelStep / getParallelTargets / createParallelRuntimeState を追加する
3. parallel step 選択時に ParallelStepPanel を表示する
4. targetごとの完了チェックUIを追加する
5. join="all_complete" の全完了判定を追加する
6. 全完了後に既存の状態更新処理で step.state_to へ進める
7. route_context は step.route_context がなければ現route_contextを維持する
8. join未対応値の場合は進行不可・未対応表示にする
9. 通常step / external_handoff / ControlReview の既存挙動を壊さない
10. npm run lint または npm run build を実行して結果を報告する

Worker Output:
・修正したファイル名
・修正概要
・parallel step UI の仕様
・join="all_complete" の扱い
・未対応joinの扱い
・状態更新ルール
・ビルド / lint 結果
・未対応事項があれば明記
・仕様判断が必要な点があれば実装せず質問として返す

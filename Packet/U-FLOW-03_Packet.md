File:
U-FLOW-03_Packet.md

Unit:
U-FLOW-03

Goal:
Flow v1.4 の state + route_context に基づく routing resolver を実装し、現在状態から次step候補を取得できるようにする。

Target:
app/page.tsx

Purpose:
U-FLOW-02で template_ref 解決済みstepを扱えるようになったため、次に orchestration.state_routing を使って state + route_context のペアから next step ID を取得する resolver を実装する。
このUnitではまだFlow実行エンジン本体は実装せず、routing解決関数と確認用プレビュー/補助表示までを対象とする。

Inputs:
・flow : FlowDefinitionV14 : v1.4 Flow定義
・flow.orchestration.state_routing : Array<{ state: string; route_context: string; next: string[] }> : 状態遷移定義
・state : string : 現在State
・route_context : string : 現在route_context
・resolved main_flow : ResolvedFlowStepV14[] : template_ref展開済みmain_flow
・resolved feedback branch flow : ResolvedFlowStepV14[] : template_ref展開済みfeedback flow

Outputs:
・state + route_context から該当する state_routing entry を取得できる
・該当entryの next step ID 配列を取得できる
・next step ID から実step定義を解決できる
・template_unresolved === true のstepはrouting対象から除外できる
・未解決next IDがあってもクラッシュせず警告扱いにできる
・旧式 steps Flow は壊さない

Constraints:
・このUnitではFlow実行エンジンを実装しない
・ControlReview runtime resolverは実装しない
・parallel / join の実行処理は実装しない
・loop counterは実装しない
・Human gate UIは実装しない
・external handoff UIは実装しない
・API送信処理 handleSubmit は変更しない
・チャット送信挙動は変更しない
・既存のモデル設定・カラム設定・添付・履歴選択機能を壊さない
・routing resolver は state + route_context の完全一致で引く
・stateだけ、route_contextだけでの曖昧検索は禁止
・template_unresolved === true のstepは実行可能stepとして扱わない
・TypeScript構文エラーを出さない
・既存UIの大幅なレイアウト変更は禁止

Dependencies:
・U-FLOW-01 が完了していること
・U-FLOW-02 が完了していること
・FlowDefinitionV14 / FlowStepV14 / ResolvedFlowStepV14 型が存在すること
・isFlowV14 型ガードが存在すること
・resolveTemplateSteps / getResolvedMainFlow / getResolvedFeedbackBranchFlow が存在すること
・Flow v1.4 JSONに orchestration.state_routing が存在すること
・Flow v1.4 JSONに main_flow / feedback_flow.branches.*.flow が存在すること

Acceptance Criteria:
・state="Draft", route_context="main" で next=["main-02"] を取得できる
・state="Debug", route_context="main" で next=["main-08"] を取得できる
・state="Debug", route_context="feedback_implementation" で next=["fb-impl-03"] を取得できる
・state="Debug", route_context="feedback_specification" で next=["fb-spec-07"] を取得できる
・state="Debug", route_context="feedback_environment" で next=["fb-env-02"] を取得できる
・state="ControlReview", route_context="main" で next=["feedback_flow.branches", "feedback_flow.verified_transition"] を取得できる
・next step ID が main_flow 内にある場合、該当stepを取得できる
・next step ID が feedback branch flow 内にある場合、該当stepを取得できる
・template_ref展開済みstepは通常stepとして取得できる
・template_unresolved === true のstepは取得対象から除外される
・存在しない state + route_context の場合、空配列または明示的な未解決結果を返しクラッシュしない
・旧式 steps Flow は従来通り表示される
・v1.4 Flowの保存・リロードが壊れない
・npm run lint または npm run build で型エラーが出ない

Notes:
・routing resolver は後続のFlow実行エンジンの基礎部品である
・このUnitでは「次に進めるstepを解決できる」ことだけを目的とする
・ControlReview の next に含まれる "feedback_flow.branches" / "feedback_flow.verified_transition" は実行時評価対象の特殊参照として保持する
・特殊参照の中身を分岐判定する処理は U-FLOW-04 で実装する
・template_ref は展開後も残ってよい
・routing resolver は template_ref の有無ではなく template_unresolved !== true を基準に通常stepとして扱う

Implementation Skeleton:
type StateRoutingEntry = {
state: string;
route_context: string;
next: string[];
};

type RoutingResolutionResult = {
state: string;
route_context: string;
nextIds: string[];
steps: ResolvedFlowStepV14[];
specialRefs: string[];
unresolvedNextIds: string[];
};

function getStateRoutingEntries(flow: FlowDefinitionV14): StateRoutingEntry[] {
// TODO:
// flow.orchestration?.state_routing が配列でなければ []
// state / route_context / next が妥当なentryのみ返す
}

function resolveNextIdsByState(
flow: FlowDefinitionV14,
state: string,
routeContext: string
): string[] {
// TODO:
// 1. getStateRoutingEntries(flow) を取得
// 2. state と route_context が完全一致するentryを探す
// 3. 見つからなければ []
// 4. entry.next を返す
}

function getAllResolvedFlowSteps(flow: FlowDefinitionV14): ResolvedFlowStepV14[] {
// TODO:
// 1. getResolvedMainFlow(flow) を取得
// 2. feedback_flow.branches の全branchについて getResolvedFeedbackBranchFlow(flow, branchKey) を取得
// 3. すべて結合
// 4. template_unresolved === true のstepは除外
}

function isSpecialFlowRef(nextId: string): boolean {
// TODO:
// nextId が "feedback_flow.branches" または "feedback_flow.verified_transition" のような特殊参照なら true
}

function resolveStepsByIds(
flow: FlowDefinitionV14,
nextIds: string[]
): {
steps: ResolvedFlowStepV14[];
specialRefs: string[];
unresolvedNextIds: string[];
} {
// TODO:
// 1. getAllResolvedFlowSteps(flow) を取得
// 2. nextIds を順に処理
// 3. special ref は specialRefs へ
// 4. step.id と一致するものは steps へ
// 5. 見つからないものは unresolvedNextIds へ
}

function resolveRouting(
flow: FlowDefinitionV14,
state: string,
routeContext: string
): RoutingResolutionResult {
// TODO:
// 1. nextIds = resolveNextIdsByState(flow, state, routeContext)
// 2. resolveStepsByIds(flow, nextIds)
// 3. RoutingResolutionResult を返す
}

Suggested Work:

1. StateRoutingEntry / RoutingResolutionResult 型を追加する
2. orchestration.state_routing の最低限の型ガードを追加する
3. state + route_context 完全一致で next を取得する関数を追加する
4. main_flow と feedback branch flow を統合したstep indexを作る
5. template_unresolved === true のstepをrouting対象から除外する
6. next ID からstepを解決する関数を追加する
7. 特殊参照 feedback_flow.branches / feedback_flow.verified_transition は specialRefs として分離する
8. Flowプレビューまたはデバッグ表示に、選択Flowの state_routing 件数・代表的なrouting解決結果を表示する
9. npm run lint または npm run build を実行して結果を報告する

Worker Output:
・修正したファイル名
・修正概要
・routing resolver の仕様
・template_unresolved の扱い
・特殊参照の扱い
・ビルド / lint 結果
・未対応事項があれば明記
・仕様判断が必要な点があれば実装せず質問として返す

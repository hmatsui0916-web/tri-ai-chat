File:
U-FLOW-04_Packet.md

Unit:
U-FLOW-04

Goal:
ControlReview 状態での特殊参照を runtime resolver で解決し、Integrator-C判定結果に応じて Verified 遷移または feedback branch へ分岐できるようにする。

Target:
app/page.tsx

Purpose:
U-FLOW-03で ControlReview の next に含まれる specialRefs を分離できるようになったため、次に "feedback_flow.branches" / "feedback_flow.verified_transition" を実行時評価する resolver を実装する。
このUnitではまだ完全なFlow実行エンジンは実装せず、Integrator-C判定結果を入力として、次に進むべき遷移先を解決する関数群と確認用表示までを対象とする。

Inputs:
・flow : FlowDefinitionV14 : v1.4 Flow定義
・routingResult : RoutingResolutionResult : U-FLOW-03のrouting解決結果
・controlDecision : ControlReviewDecision : Integrator-C判定結果
・controlDecision.verified : boolean : Verified条件を満たすか
・controlDecision.cause : "implementation" | "specification" | "environment" | undefined : 主因分類
・flow.feedback_flow.verified_transition : object | undefined : Verified遷移定義
・flow.feedback_flow.branches : object | undefined : feedback分岐定義

Outputs:
・ControlReviewで verified=true の場合、verified_transition を解決できる
・verified_transition の next_step="main-09" を取得できる
・verified_transition.route_context_reset="main" を取得できる
・verified=false かつ cause="implementation" の場合、implementation branch の先頭step fb-impl-01 を取得できる
・verified=false かつ cause="specification" の場合、specification branch の先頭step fb-spec-01 を取得できる
・verified=false かつ cause="environment" の場合、environment branch の先頭step fb-env-01 を取得できる
・不正なcauseやbranch未定義でもクラッシュせず未解決結果を返す
・旧式 steps Flow は壊さない

Constraints:
・このUnitでは完全なFlow実行エンジンを実装しない
・実際のAI送信処理は実装しない
・parallel / join の実行処理は実装しない
・loop counterは実装しない
・Human gate UIは実装しない
・external handoff UIは実装しない
・API送信処理 handleSubmit は変更しない
・チャット送信挙動は変更しない
・既存のモデル設定・カラム設定・添付・履歴選択機能を壊さない
・ControlReviewの分岐は specialRefs に "feedback_flow.branches" または "feedback_flow.verified_transition" が含まれる場合のみ評価する
・verified=true の場合は cause より verified_transition を優先する
・verified=false の場合のみ cause に基づき branch を選択する
・environment branch の fallback 再分類処理はこのUnitでは実装しない
・TypeScript構文エラーを出さない
・既存UIの大幅なレイアウト変更は禁止

Dependencies:
・U-FLOW-01 が完了していること
・U-FLOW-02 が完了していること
・U-FLOW-03 が完了していること
・FlowDefinitionV14 / ResolvedFlowStepV14 / RoutingResolutionResult 型が存在すること
・isFlowV14 型ガードが存在すること
・resolveRouting が存在すること
・resolveStepsByIds が存在すること
・getResolvedFeedbackBranchFlow が存在すること
・isSpecialFlowRef が存在すること
・Flow v1.4 JSONに feedback_flow.verified_transition が存在すること
・Flow v1.4 JSONに feedback_flow.branches.implementation / specification / environment が存在すること

Acceptance Criteria:
・state="ControlReview", route_context="main" の routingResult.specialRefs に "feedback_flow.branches" / "feedback_flow.verified_transition" が含まれる
・verified=true の controlDecision を渡すと nextStepId="main-09" が返る
・verified=true の場合 route_context_reset="main" が返る
・verified=true の場合 state_to="Verified" が返る
・verified=false, cause="implementation" の場合 branchKey="implementation" と firstStepId="fb-impl-01" が返る
・verified=false, cause="specification" の場合 branchKey="specification" と firstStepId="fb-spec-01" が返る
・verified=false, cause="environment" の場合 branchKey="environment" と firstStepId="fb-env-01" が返る
・存在しないcauseを渡した場合、クラッシュせず unresolvedReason を返す
・branch.flow が空または未定義の場合、クラッシュせず unresolvedReason を返す
・specialRefs がない通常routingでは ControlReview runtime resolver は何もしない
・旧式 steps Flow は従来通り表示される
・v1.4 Flowの保存・リロードが壊れない
・npm run lint または npm run build で、今回変更起因の型エラーが出ない

Notes:
・このUnitは「Integrator-C判定結果を受けた分岐解決」だけを実装する
・Integrator-C判定結果そのものをAIに作らせる処理はまだ実装しない
・controlDecision は当面ダミー入力または確認用UI/固定サンプルでよい
・後続Unitで実際のControl Decision入力UIまたはメッセージ解析と接続する
・verified_transition は feedback branch より優先する
・route_context_reset は Verified遷移時に main へ戻すための明示値として扱う
・environment branch の fallback.code_change_required 再分類は後続Unitで扱う

Implementation Skeleton:
type ControlCause = "implementation" | "specification" | "environment";

type ControlReviewDecision = {
verified: boolean;
cause?: ControlCause;
reason?: string;
};

type ControlRuntimeResolution =
| {
kind: "verified";
state_from?: string;
state_to?: string;
route_context_reset?: string;
nextStepId?: string;
unresolvedReason?: undefined;
}
| {
kind: "feedback_branch";
branchKey: ControlCause;
route_context?: string;
state_rollback_to?: string;
firstStepId?: string;
firstStep?: ResolvedFlowStepV14;
unresolvedReason?: undefined;
}
| {
kind: "unresolved";
unresolvedReason: string;
}
| {
kind: "not_applicable";
unresolvedReason?: undefined;
};

function hasControlReviewSpecialRefs(routingResult: RoutingResolutionResult): boolean {
// TODO:
// routingResult.specialRefs に
// "feedback_flow.branches" または "feedback_flow.verified_transition"
// が含まれていれば true
}

function resolveVerifiedTransition(flow: FlowDefinitionV14): ControlRuntimeResolution {
// TODO:
// 1. flow.feedback_flow?.verified_transition を取得
// 2. plain objectでなければ unresolved
// 3. next_step / state_from / state_to / route_context_reset を取得
// 4. kind: "verified" として返す
}

function resolveFeedbackBranch(
flow: FlowDefinitionV14,
cause: ControlCause
): ControlRuntimeResolution {
// TODO:
// 1. flow.feedback_flow?.branches?.[cause] を取得
// 2. branchがなければ unresolved
// 3. getResolvedFeedbackBranchFlow(flow, cause) で展開済みflowを取得
// 4. template_unresolved !== true の先頭stepを取得
// 5. 先頭stepがなければ unresolved
// 6. kind: "feedback_branch" として branchKey / route_context / state_rollback_to / firstStepId / firstStep を返す
}

function resolveControlReviewRuntime(
flow: FlowDefinitionV14,
routingResult: RoutingResolutionResult,
decision: ControlReviewDecision
): ControlRuntimeResolution {
// TODO:
// 1. hasControlReviewSpecialRefs が false なら not_applicable
// 2. decision.verified === true なら resolveVerifiedTransition(flow)
// 3. decision.verified !== true の場合、decision.cause がなければ unresolved
// 4. cause が implementation/specification/environment なら resolveFeedbackBranch(flow, cause)
// 5. その他は unresolved
}

Suggested Work:

1. ControlCause / ControlReviewDecision / ControlRuntimeResolution 型を追加する
2. ControlReview用 specialRefs 判定関数を追加する
3. verified_transition 解決関数を追加する
4. feedback branch 解決関数を追加する
5. resolveControlReviewRuntime を追加する
6. verified=true の場合は route_context_reset を返すようにする
7. verified=false の場合は cause に基づき branch の先頭stepを返すようにする
8. 未定義・不正入力でもクラッシュしないように unresolved を返す
9. 確認用に、選択Flowの ControlReview runtime resolver サンプル結果を簡易表示する
10. npm run lint または npm run build を実行して結果を報告する

Worker Output:
・修正したファイル名
・修正概要
・ControlReview runtime resolver の仕様
・verified_transition の扱い
・feedback branch の扱い
・route_context_reset の扱い
・ビルド / lint 結果
・未対応事項があれば明記
・仕様判断が必要な点があれば実装せず質問として返す

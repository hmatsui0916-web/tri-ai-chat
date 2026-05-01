File:
U-FLOW-07_Packet.md

Unit:
U-FLOW-07

Goal:
feedback loop iteration counter を実装し、feedback_flow.max_iterations に基づいて再投入回数を管理できるようにする。

Target:
app/page.tsx

Purpose:
U-FLOW-06までで、Flow定義読込、template_ref解決、routing resolver、ControlReview runtime resolver、Human gate / external handoff UI、parallel / join handling が実装済み。
このUnitでは、feedback_flow の loop / max_iterations を参照し、implementation / specification / environment 各feedback branchの再投入回数を管理する。
上限到達時には警告または進行停止を表示し、無制限ループを防止する。

Inputs:
・selectedFlow : FlowDefinition : 選択中Flow
・currentFlowState : string : 現在State
・currentRouteContext : string : 現在route_context
・resolveControlReviewRuntime(flow, routingResult, decision) : ControlRuntimeResolution
・controlRuntimeResolution.kind : "feedback_branch" | "verified" | "unresolved" | "not_applicable"
・controlRuntimeResolution.branchKey : "implementation" | "specification" | "environment" | undefined
・flow.feedback_flow.max_iterations : number | undefined : 全体上限
・flow.feedback_flow.branches.*.max_iterations : number | undefined : branch別上限
・flow.feedback_flow.branches.*.loop : boolean | undefined : loop対象かどうか

Outputs:
・feedback branchごとのiteration countを保持できる
・ControlReviewでfeedback branchへ分岐したタイミングで該当branchのcountを+1できる
・branch別max_iterationsを超える場合、進行停止または警告表示できる
・branch別max_iterationsがなければfeedback_flow.max_iterationsを使用できる
・どちらもなければ安全側で上限なしではなく警告表示できる
・Verified到達時にloop counterをリセットできる
・Flow選択変更時にloop counterをリセットできる
・通常step / external_handoff / parallel / join の既存挙動を壊さない

Constraints:
・このUnitではAI自動送信は実装しない
・このUnitではWorkerへの自動API送信は実装しない
・このUnitでは実際のDebug/Infra結果本文の統合処理は実装しない
・このUnitではControlReview判定の自動生成は実装しない
・API送信処理 handleSubmit は変更しない
・通常チャット送信挙動は変更しない
・既存のモデル設定・カラム設定・添付・履歴選択機能を壊さない
・max_iterations超過時は無条件に進行させない
・loop=false のbranchは原則として再投入ループ対象外として警告する
・TypeScript構文エラーを出さない
・既存UIの大幅なレイアウト変更は禁止

Dependencies:
・U-FLOW-01 が完了していること
・U-FLOW-02 が完了していること
・U-FLOW-03 が完了していること
・U-FLOW-04 が完了していること
・U-FLOW-05 / U-FLOW-05R1 が完了していること
・U-FLOW-06 が完了していること
・FlowDefinitionV14 / ControlCause / ControlRuntimeResolution 型が存在すること
・isFlowV14 型ガードが存在すること
・resolveControlReviewRuntime が存在すること
・ControlReview decision UI が存在すること
・Flow v1.4 JSONに feedback_flow.max_iterations=3 が存在すること
・Flow v1.4 JSONに feedback_flow.branches.implementation/specification/environment.max_iterations=3 が存在すること

Acceptance Criteria:
・初期状態では implementation / specification / environment のcountが0で表示または内部保持される
・ControlReviewで implementation branch に遷移した時、implementation countが1になる
・ControlReviewで specification branch に遷移した時、specification countが1になる
・ControlReviewで environment branch に遷移した時、environment countが1になる
・同じbranchに再度遷移するとcountが加算される
・branch max_iterations=3 の場合、3回目までは進行可能
・4回目の遷移を試みた場合、進行停止または明確な警告を表示する
・branch max_iterations が未定義の場合、feedback_flow.max_iterations をfallbackとして使う
・branch max_iterations と feedback_flow.max_iterations の両方が未定義の場合、安全警告を表示する
・loop=false または loop未定義のbranchでは警告を表示する
・Verified到達時にloop counterがリセットされる
・Flow選択変更時にloop counterがリセットされる
・通常step / external_handoff / parallel / join の既存挙動を維持する
・旧式 steps FlowではFlow実行UIを無効または簡易表示に留め、既存表示を壊さない
・v1.4 Flowの保存・リロードが壊れない
・npm run lint または npm run build で、今回変更起因の型エラーが出ない

Notes:
・AI事業OSでは無制限差戻しは禁止であるため、loop counterは安全上重要
・feedback_flow.max_iterations は全体fallback値として扱う
・branch.max_iterations がある場合はbranch値を優先する
・count加算タイミングは「ControlReviewでfeedback branch遷移を適用する直前または適用時」とする
・Verified遷移時は成功終了扱いとしてcounterをリセットする
・max_iterations到達時のUIは簡素でよいが、進行可否が明確であること
・将来的にはUnit単位・履歴単位にcounterを永続化してもよいが、このUnitではReact state保持でよい

Implementation Skeleton:
type FeedbackLoopCounts = Partial<Record<ControlCause, number>>;

type LoopLimitCheckResult =
| {
allowed: true;
branchKey: ControlCause;
currentCount: number;
nextCount: number;
maxIterations: number;
warning?: string;
}
| {
allowed: false;
branchKey: ControlCause;
currentCount: number;
nextCount: number;
maxIterations?: number;
reason: string;
};

function createEmptyFeedbackLoopCounts(): FeedbackLoopCounts {
return {
implementation: 0,
specification: 0,
environment: 0,
};
}

function getBranchLoopConfig(
flow: FlowDefinitionV14,
branchKey: ControlCause
): {
loop?: boolean;
maxIterations?: number;
fallbackMaxIterations?: number;
} {
// TODO:
// 1. flow.feedback_flow?.branches?.[branchKey] を取得
// 2. branch.loop / branch.max_iterations を返す
// 3. flow.feedback_flow?.max_iterations を fallbackMaxIterations として返す
}

function getEffectiveMaxIterations(
flow: FlowDefinitionV14,
branchKey: ControlCause
): number | undefined {
// TODO:
// branch.max_iterations がnumberならそれを返す
// そうでなければ feedback_flow.max_iterations がnumberならそれを返す
// どちらもなければ undefined
}

function checkLoopLimit(
flow: FlowDefinitionV14,
counts: FeedbackLoopCounts,
branchKey: ControlCause
): LoopLimitCheckResult {
// TODO:
// 1. branch configを取得
// 2. loop !== true なら allowed:false
// 3. maxIterationsを取得
// 4. maxIterationsが未定義なら allowed:false
// 5. currentCount = counts[branchKey] ?? 0
// 6. nextCount = currentCount + 1
// 7. nextCount > maxIterations なら allowed:false
// 8. それ以外 allowed:true
}

function incrementLoopCount(
counts: FeedbackLoopCounts,
branchKey: ControlCause
): FeedbackLoopCounts {
return {
...counts,
[branchKey]: (counts[branchKey] ?? 0) + 1,
};
}

function shouldResetLoopCountsOnResolution(resolution: ControlRuntimeResolution): boolean {
// TODO:
// resolution.kind === "verified" の場合 true
}

Suggested Work:

1. FeedbackLoopCounts / LoopLimitCheckResult 型を追加する
2. feedbackLoopCounts state を追加する
3. Flow選択変更時に feedbackLoopCounts を初期化する
4. branch loop config取得関数を追加する
5. effective max_iterations取得関数を追加する
6. checkLoopLimit を追加する
7. ControlReviewでfeedback_branch解決後、遷移適用前にcheckLoopLimitを実行する
8. allowed=false の場合は進行停止し、理由をUI表示する
9. allowed=true の場合のみcountをincrementして遷移適用する
10. verified遷移時にfeedbackLoopCountsを初期化する
11. loop count / max_iterationsをControlReview UI付近に表示する
12. 通常step / external_handoff / parallel / join の既存挙動を壊さない
13. npm run lint または npm run build を実行して結果を報告する

Worker Output:
・修正したファイル名
・修正概要
・loop counter の仕様
・max_iterations の優先順位
・上限到達時の挙動
・Verified時のreset挙動
・ビルド / lint 結果
・未対応事項があれば明記
・仕様判断が必要な点があれば実装せず質問として返す

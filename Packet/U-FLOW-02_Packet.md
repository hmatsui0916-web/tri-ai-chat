File:
U-FLOW-02_Packet.md

Unit:
U-FLOW-02

Goal:
Flow v1.4 の template_ref を解決し、main_flow / feedback_flow.branches.*.flow 内で展開済みstepとして扱えるようにする。

Target:
app/page.tsx

Purpose:
U-FLOW-01で読込対応したFlow v1.4定義に対して、templates に定義された共通stepを template_ref から参照・展開できるようにする。
このUnitではFlow実行エンジンは実装せず、Flow定義の正規化・プレビュー表示前のテンプレート展開処理までを対象とする。

Inputs:
・flow : FlowDefinition : 選択中または正規化対象のFlow定義
・flow.templates : Record<string, unknown> | undefined : template_ref の参照先
・main_flow : FlowStepV14[] | undefined : メインフローstep配列
・feedback_flow.branches.*.flow : FlowStepV14[] | undefined : feedback branch内step配列
・template_ref : string | undefined : 展開対象テンプレート名

Outputs:
・template_ref を持つstepが、templates内の該当templateとマージされたstepとして扱える
・main_flow の template_ref step がプレビュー表示で実体化される
・feedback_flow.branches.*.flow の template_ref step も展開可能になる
・template_ref が解決できない場合は、アプリを壊さず未解決stepとして扱える
・既存の旧式 steps Flow は壊さない

Constraints:
・このUnitではFlow実行エンジンを実装しない
・state_routing解決処理は実装しない
・ControlReview runtime resolverは実装しない
・parallel / join の実行処理は実装しない
・loop counterは実装しない
・API送信処理 handleSubmit は変更しない
・チャット送信挙動は変更しない
・既存のモデル設定・カラム設定・添付・履歴選択機能を壊さない
・template_ref展開時、step側の id / name / route_context など明示値を優先する
・template側の値でstep側の値を上書きしてはならない
・template_refが存在しない場合でも例外で落とさない
・TypeScript構文エラーを出さない
・既存UIの大幅なレイアウト変更は禁止

Dependencies:
・U-FLOW-01 が完了していること
・FlowDefinition / FlowDefinitionV14 / FlowStepV14 型が存在すること
・isFlowV14 / isLegacyFlow 型ガードが存在すること
・normalizeFlows が v1.4 Flowを保持できること
・getFlowPreviewRows が main_flow / steps を表示できること
・Flow v1.4 JSONに templates.reviewer_decision_step が存在する前提：
　- main-04 が template_ref: "reviewer_decision_step" を参照
　- fb-spec-03 が template_ref: "reviewer_decision_step" を参照

Acceptance Criteria:
・main_flow 内の main-04 が reviewer_decision_step として展開され、type / from / state_from / decision_key / branches を持つstepとして扱える
・main-04 の id / name / route_context は step側の値が維持される
・feedback_flow.branches.specification.flow 内の fb-spec-03 も reviewer_decision_step として展開可能
・fb-spec-03 の id / name / route_context は step側の値が維持される
・template_ref が存在しない場合でもクラッシュしない
・template_ref 未解決の場合、プレビュー上で未解決であることが分かる表示または最低限のstep表示になる
・旧式 steps Flow は従来通り表示される
・v1.4 Flowの保存・リロードが壊れない
・npm run lint または npm run build で型エラーが出ない

Notes:
・展開ルールは「templateをベースに、step側の明示値で上書き」とする
・ただし template_ref 自体は残してもよい。デバッグ上、参照元が分かるため
・templatesの型検証はこのUnitで最低限強化する
・深い検証やschema validator化は後続Unitでよい
・このUnitの主目的は、U-FLOW-03以降の routing resolver が template_ref step を通常stepとして扱える土台を作ること

Implementation Skeleton:
type ResolvedFlowStepV14 = FlowStepV14 & {
template_ref?: string;
template_unresolved?: boolean;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFlowStepLike(value: unknown): value is FlowStepV14 {
if (!isPlainObject(value)) return false;
return typeof value.id === "string" || typeof value.type === "string" || typeof value.from === "string" || Array.isArray(value.from);
}

function resolveTemplateStep(
step: FlowStepV14,
templates?: Record<string, unknown>
): ResolvedFlowStepV14 {
// TODO:
// 1. step.template_ref がなければ step を返す
// 2. templates がなければ template_unresolved: true を付与して返す
// 3. templates[step.template_ref] を取得
// 4. templateがobjectでなければ template_unresolved: true を付与して返す
// 5. templateをベースにstep側の値で上書きする
// 6. id / name / route_context / template_ref はstep側を必ず優先する
}

function resolveTemplateSteps(
steps: FlowStepV14[] | undefined,
templates?: Record<string, unknown>
): ResolvedFlowStepV14[] {
// TODO:
// steps が配列でなければ []
// 各stepに resolveTemplateStep を適用する
}

function getResolvedMainFlow(flow: FlowDefinitionV14): ResolvedFlowStepV14[] {
// TODO:
// flow.main_flow を templates付きで展開して返す
}

function getResolvedFeedbackBranchFlow(
flow: FlowDefinitionV14,
branchKey: string
): ResolvedFlowStepV14[] {
// TODO:
// flow.feedback_flow?.branches?.[branchKey]?.flow を templates付きで展開して返す
}

function getFlowPreviewRows(flow: FlowDefinition): Array<{
id: string;
name: string;
from: string;
to: string;
state: string;
type: string;
}> {
// TODO:
// v1.4の場合は getResolvedMainFlow(flow) を使う
// template_unresolved が true の場合は name または type に未解決が分かる情報を含める
// 旧式の場合は従来通り steps を表示する
}

Suggested Work:

1. template_ref解決用の型と関数を追加する
2. main_flow表示時に resolveTemplateSteps を通す
3. feedback_flow.branches のプレビューまたは内部参照でも resolveTemplateSteps を使えるようにする
4. step側の id / name / route_context がtemplateに上書きされないことを確認する
5. 未解決 template_ref でもクラッシュしないようにする
6. U-FLOW-01で指摘された feedback_flow / orchestration のキャスト渡し部分について、今回必要な範囲で型ガードを追加する
7. npm run lint または npm run build を実行して結果を報告する

Worker Output:
・修正したファイル名
・修正概要
・template_ref 展開ルール
・ビルド / lint 結果
・未対応事項があれば明記
・仕様判断が必要な点があれば実装せず質問として返す

File:
U-FLOW-01_Packet.md

Unit:
U-FLOW-01

Goal:
Flow v1.4 JSONをアプリで読込・保存・選択・プレビューできるようにする。

Target:
app/page.tsx

Purpose:
現状の旧式FlowDefinition（steps配列前提）を、AI Business OS Full Flow v1.4形式に対応させる。
このUnitではFlow実行エンジンは実装せず、Flow定義の型定義・正規化・保存・選択・プレビュー表示までを対象とする。

Inputs:
・flowText : string : Flow設定欄に貼り付けられたJSON文字列
・localStorage["tri-ai-flow-definitions"] : string | null : 保存済みFlow定義
・defaultFlows : FlowDefinition[] : 初期Flow定義
・selectedFlowId : string : 選択中Flow ID

Outputs:
・flows state に v1.4形式FlowDefinition[] を保持できる
・selectedFlowId により v1.4 Flowを選択できる
・Flow設定欄で v1.4 JSONを保存できる
・Flowプレビューで main_flow / role_bindings / feedback_flow.branches の概要を表示できる
・旧式 steps Flowも壊さず最低限表示できる
・addColumn 実行時の PAGE_SIZE 未定義エラーを修正する

Constraints:
・このUnitではFlow実行エンジンを実装しない
・template_ref解決処理は実装しない
・state_routing解決処理は実装しない
・ControlReview runtime resolverは実装しない
・parallel / join の実行処理は実装しない
・loop counterは実装しない
・API送信処理 handleSubmit は変更しない
・チャット送信挙動は変更しない
・既存のモデル設定・カラム設定・添付・履歴選択機能を壊さない
・v1.4 JSONを保存してもJSON構造を破壊しない
・旧式FlowDefinitionも後方互換で読み込めるようにする
・TypeScript構文エラーを出さない
・既存UIの大幅なレイアウト変更は禁止

Dependencies:
・Next.js app/page.tsx が存在すること
・React useState / useMemo が利用可能であること
・localStorage が利用可能であること
・現行Flow設定UIが存在すること
・現行 defaultFlows / normalizeFlows / saveFlowsFromText / resetFlows / selectedFlow が存在すること
・Flow v1.4 JSONは以下の主要キーを持つ前提：
　- role_bindings
　- states
　- route_contexts
　- templates
　- main_flow
　- feedback_flow
　- orchestration

Acceptance Criteria:
・v1.4 Flow JSONをFlow設定欄に貼り付けて保存できる
・保存後、Flowセレクトに v1.4 の name が表示される
・リロード後も localStorage から v1.4 Flowが復元される
・Flowプレビューに main_flow のステップ一覧が表示される
・Flowプレビューに role_bindings のロール→カラム対応が表示される
・Flowプレビューに feedback_flow.branches の implementation / specification / environment が表示される
・旧式 steps Flowも従来通り最低限表示される
・addColumn 実行時に PAGE_SIZE 未定義エラーが出ない
・npm run lint または npm run build で型エラーが出ない

Notes:
・Flow v1.4は今回まだ実行対象ではなく、定義データとして保持・表示する段階である
・template_ref解決、state_routing解決、ControlReview分岐処理は次Unit以降で実装する
・FlowDefinition型は旧式とv1.4式の両対応にする
・プレビューは詳細すぎなくてよいが、エンジン実装前に定義内容を人間が確認できる粒度にする
・PAGE_SIZE 未定義箇所は columnsPerPage に置き換える

Implementation Skeleton:
type LegacyFlowStep = {
id: string;
name: string;
from: string;
to: string;
mode: "manual";
instruction?: string;
};

type LegacyFlowDefinition = {
id: string;
name: string;
description?: string;
steps: LegacyFlowStep[];
};

type FlowRoleBinding = {
type: "column" | "external";
column_id?: string;
allow_shared_column?: boolean;
tool?: string;
handoff?: string;
send_api_request?: boolean;
output_return?: string;
};

type FlowStepV14 = {
id: string;
name?: string;
type?: string;
route_context?: string;
from?: string | string[];
to?: string | string[];
state_from?: string;
state_to?: string;
human_gate?: boolean;
join?: string;
decision_key?: string;
template_ref?: string;
instruction?: string;
condition?: string;
branches?: Record<string, unknown>;
};

type FlowDefinitionV14 = {
id: string;
name: string;
version?: string;
source_spec?: string;
description?: string;
role_bindings?: Record<string, FlowRoleBinding>;
states?: string[];
route_contexts?: string[];
review_decision?: Record<string, string>;
templates?: Record<string, unknown>;
external_role_policy?: Record<string, unknown>;
main_flow?: FlowStepV14[];
feedback_flow?: {
entry?: string;
state_from?: string;
required_inputs?: string[];
cause_classification?: string[];
secondary_causes?: string[];
max_iterations?: number;
loop_exit_condition?: string;
verified_transition?: Record<string, unknown>;
branches?: Record<string, {
description?: string;
route_context?: string;
loop?: boolean;
max_iterations?: number;
condition?: string;
state_rollback_to?: string;
fallback?: Record<string, unknown>;
flow?: FlowStepV14[];
}>;
};
orchestration?: {
rules?: string[];
state_routing?: Array<{
state: string;
route_context: string;
next: string[];
}>;
};
};

type FlowDefinition = LegacyFlowDefinition | FlowDefinitionV14;

function isFlowV14(flow: FlowDefinition): flow is FlowDefinitionV14 {
return "main_flow" in flow || "feedback_flow" in flow || "role_bindings" in flow;
}

function isLegacyFlow(flow: FlowDefinition): flow is LegacyFlowDefinition {
return "steps" in flow && Array.isArray(flow.steps);
}

function normalizeFlows(value: unknown): FlowDefinition[] {
// TODO:
// 1. value が配列でなければ defaultFlows を返す
// 2. 各flowについて id/name を持つものだけ採用する
// 3. main_flow / feedback_flow / role_bindings がある場合は v1.4形式として保持する
// 4. steps がある場合は旧式Flowとして保持する
// 5. 不正要素は除外する
// 6. 結果0件なら defaultFlows を返す
}

function getFlowStepCount(flow: FlowDefinition): number {
if (isFlowV14(flow)) return flow.main_flow?.length ?? 0;
if (isLegacyFlow(flow)) return flow.steps.length;
return 0;
}

function formatFlowEndpoint(value: string | string[] | undefined): string {
if (Array.isArray(value)) return value.join(", ");
return value || "";
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
// v1.4の場合は main_flow を表示用に変換
// 旧式の場合は steps を表示用に変換
}

Suggested Work:

1. FlowDefinition型を旧式/v1.4両対応に更新する
2. normalizeFlowsをv1.4対応に更新する
3. selectedFlow関連処理がv1.4でも壊れないようにする
4. FlowプレビューUIを main_flow / steps 両対応にする
5. role_bindings概要表示を追加する
6. feedback_flow.branches概要表示を追加する
7. addColumn内の PAGE_SIZE を columnsPerPage に修正する
8. npm run lint または npm run build を実行して結果を報告する

Worker Output:
・修正したファイル名
・修正概要
・ビルド/ lint 結果
・未対応事項があれば明記
・仕様判断が必要な点があれば実装せず質問として返す

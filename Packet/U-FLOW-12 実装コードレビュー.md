U-FLOW-12 実装コードレビュー
Role: Reviewer

Scope: Code Review (app/page.tsx)

参照: U-FLOW-12_Packet.md (修正版)

判定: Conditional
全体的に実装は高品質で仕様に準拠しているが、1件の Conditional 指摘がある。

[C-1] [Unit]_Decision.md 汎用名のブロックが未実装 — Conditional
Spec AC 13 / Packet AC 15: "[Unit]_Decision.md など汎用Decision名を保存ブロックできる"

app/page.tsx:1398-1407 の detectArtifactType:


if (/_PMDecision_Rework_/i.test(fileName)) return "PMDecision_Rework";
if (/_PMDecision_/i.test(fileName)) return "Decision";
U-FLOW-12_Decision.md は _PMDecision_ パターンに マッチしない ため "Unknown" と判定される。

app/page.tsx:1567-1572 の禁止名チェックは artifactType === "Decision" 条件下にあるため、Unknown 型に分類された U-FLOW-12_Decision.md にはヒットせず、units/[Unit]/outputs/ に無警告で保存される。

要対応: analyzeArtifactOutput 内に、finalFileName が /_Decision\.md$/i（かつ _PMDecision_ を含まない）パターンに一致する場合に保存をブロックするチェックを追加すること。

適合確認済み項目
確認項目	行	結果
File: 抽出ロジック（12行スキャン、inline / next-line 両対応）	1367	✓
sanitizeArtifactFileName（パストラバーサル防止、制御文字除去）	1384	✓
detectArtifactType 判定順序（PMDecision_Rework 優先）	1398	✓
Report パターン (Report|Result)_（アンダースコア必須）	1404	✓
PMDecision.md / PMDecision_.md フェーズなし名のブロック	1570	✓
PMDecision_Rework TargetRole 必須チェック	1573	✓
ReworkInstruction TargetRole 必須チェック + 形式警告	1578	✓
suggestRevisionFileName 検索範囲（同一 logicalPath 内）	1494	✓
_Rev2 起点の採番ロジック（Math.max(2, nextRev)）	1500	✓
loadSavedArtifacts / saveSavedArtifacts（型ガード・クラッシュ防止）	1626, 1638	✓
applyArtifactToRuntimeOutputsText（既存JSONを部分更新、エラー返却）	1653	✓
analyzeArtifactOutput の runtimeOutputsText 経由 Unit ID 参照	2137, 2142	✓
saveCurrentArtifact のAction Log記録	2753	✓
applySavedArtifactToRuntimeInput のAction Log記録	2779	✓
UI配置（U-FLOW-11 Prompt Runtime → U-FLOW-12 → Runtime Controls）	4049, 4147, 4355	✓
U-FLOW-11 Generate/Copy/Stage 動作（既存 handler 無変更）	2619, 2649, 2666	✓
main-05 Integrator-S PM-approved Spec guard	1796	✓
Worker external handoff / API 送信不可制約	4108	✓
PM_DECISION_PHASES 全9Phase（WorkerApproval/Conditional/Hold 含む）	409	✓
REWORK_INSTRUCTION_TARGET_ROLES 定義	421	✓
保存済みArtifact一覧（fileName/type/path/role/step/state/routeContext/rev）	4315	✓
"Use Suggested Rev" ボタン（setArtifactManualFileName で反映）	4254	✓
まとめ
C-1 の [Unit]_Decision.md ブロックが未実装。1行の条件追加で対応可能。それ以外の実装品質は良好で、Packet の全要件に対して正しく対応している。C-1 解消後、再確認なしでWorker承認へ進んでよい。
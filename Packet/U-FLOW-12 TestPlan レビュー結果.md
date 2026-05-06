U-FLOW-12 TestPlan レビュー結果
判定: CONDITIONAL

AC カバレッジ マッピング
Spec AC	対応 TC	状態
1. Role Output 受領	TC-01	✓
2. File: 抽出 (inline)	TC-02	✓
3. File 欠落対応	TC-04	✓
4. Artifact 種別判定	TC-02/05/07/08/09	△ (後述 C-2)
5. Unit ID 判定	TC-02/05	✓
6. 保存先提案	TC-02/03/05/07/08	✓
7. Human 確認保存	TC-02	✓
8. 一覧表示	TC-12	✓
9. Step 紐付け	TC-12	✓
10. Input 参照	TC-14/15	✓
11. Phase 命名適用	TC-05	✓
12. Rework 命名適用	TC-07	✓
13. 汎用名禁止	TC-06	✓
14. 同名衝突警告	TC-11	✓
15. Rev 名提案	TC-11	✓
16. ReworkInstruction 命名	TC-08	✓
17. 命名規則の拡張性	TC-05/06/07/08 (間接)	✓
18. U-FLOW-11 互換性	TC-17/18/19	✓
指摘事項
C-1: TC-03 / TD-02 — File: 次行抽出の Spec 根拠が不明
該当箇所: TC-03、TD-02

内容:

TD-02 は File: のみ記載した行の次行にファイル名を置くフォーマットを使用している。


File:
U-FLOW-12_Spec.md
Spec Section 2.1 は以下のとおり定義している。

本文冒頭の File: [filename].[ext] からファイル名を取得する

この定義は File:  の後に同一行でファイル名が続く inline フォーマットのみを規定している。次行抽出は Spec に明示されていない。

TC-03 の期待結果は「Extracted File: U-FLOW-12_Spec.md」として保存成功を前提にしているが、実装が inline のみをサポートする場合 TC-03 は FAIL になる。逆に Packet が次行抽出を extension として定義していれば TC-03 は正当だが、TestPlan 本文に Packet 参照節番号が記載されていない。

対応:

以下のいずれかを TestPlan に追記する。

Packet のどの節が次行抽出を定義しているかを参照 (例: 「Packet Section X.X の next-line fallback に基づく」)
または、実装が次行抽出をサポートしない場合、TC-03 の期待結果を「Extracted File: (missing) → エラー表示」に修正する
C-2: Code 種別の TC が欠落
該当箇所: Spec AC 4、Spec Section 2.3 の種別テーブル

内容:

Spec Section 2.3 の種別判定テーブルには Code (*_Code.* → units/[Unit]/outputs/) が定義されており、AC 4「Artifact 種別判定」にも含まれる。

現在の TC-02 〜 TC-10 には Code 種別を対象とした Test Case が存在しない。AC 4 のカバレッジに空白がある。

対応:

以下を追加する。


## TC-XX Code 種別判定

目的: *_Code.* ファイルが Code 種別として `outputs/` に保存されることを確認する。

手順:
1. Role Output に以下を貼り付ける。
   File: U-FLOW-12_Code.ts
   // code body
2. Analysis preview を確認する。
3. Artifact Save を押す。

期待結果:
- Artifact Type: Code
- Logical Path: units/U-FLOW-12/outputs/
- 保存できる。
M-1: WorkerApproval / Conditional / Hold Phase の TC が欠落
該当箇所: U-FLOW-12_PMDecision_SpecApproval.md 申し送りA

内容:

申し送りA では WorkerApproval / Conditional / Hold は命名規則として保存可能にするとされている。しかし TestPlan のいずれの TC もこれらの Phase ファイルを保存対象としていない。

Phase 命名バリデーション (Section 3.2) がこれらを誤ってブロックしないかは未検証のままとなる。

対応:

既存 TC-05 の Notes に補足を追加するか、軽量なサブケースを追加する。


Sub-case: File: U-FLOW-12_PMDecision_WorkerApproval.md
期待結果: Artifact Type Decision, Phase WorkerApproval, 保存ブロックされない。
M-2: TC-15 前提条件の表現が曖昧
該当箇所: TC-15 手順 1

内容:

「TC-09 で保存した DebugReport を探す」とあるが、TC-09 は TD-08 (DebugReport) と TD-09 (ErrorReport) の 2 件を扱う。TC-09 step 2 で保存するのは TD-08 のみだが、参照が曖昧になっている。

対応:

「TC-09 step 2 で保存した U-FLOW-12_DebugReport_20260506_120000.md を探す」に修正する。

正確性確認済みの主要期待値
箇所	確認内容	結果
TC-06 期待 Artifact Type	Decision と判定されブロック (isGenericDecisionFileName 実装済み)	✓
TC-09 TD-08 DebugReport_	/(Report|Result)_/i にマッチ → Report	✓
TC-09 TD-09 ErrorReport.md	_ が Report の後にない → Unknown	✓
TC-11 Rev 候補名	U-FLOW-12_Packet_Rev2.md (Spec Section 4 ロジックと一致)	✓
TC-16 JSON 破壊防止	applyArtifactToRuntimeOutputsText の { ok: false; error } 戻り値と整合	✓
TC-19 Worker API 非送信	main-06 manual handoff 仕様と整合	✓
判定サマリ
区分	件数
Conditional	2 (C-1, C-2)
Minor	2 (M-1, M-2)
C-1 (次行抽出の Spec 根拠) と C-2 (Code 種別 TC 欠落) の解消後、再レビューを依頼してください。M-1/M-2 は今回のサイクルで対応可能であれば同時に修正することを推奨します。
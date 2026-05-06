File:
U-FLOW-12_Spec.md

Role: Designer
Scope: Artifact Save Runtime Design

# U-FLOW-12 Artifact Save Runtime Spec (Rev.1)

## 1. Artifact 保存および管理 UI 仕様
各 Role からの Output を受領・保存し、管理するためのインターフェース仕様[cite: 18]。

### 1.1 保存 UI
*   **受領エリア**: Role Output（COPY Mode ブロック）を貼り付ける広域テキストエリア[cite: 18]。
*   **保存確認パネル**: 
    *   自動解析されたメタデータ（ファイル名、Artifact 種別、Unit ID、保存先）を表示。
    *   Human による修正および確定機能を備える[cite: 18]。
*   **保存アクション**: Human が内容を確認後に「Artifact 保存」ボタンを押下することで物理保存を実行する[cite: 18]。

### 1.2 保存済み Artifact 一覧 UI[cite: 24]
*   **閲覧機能**: Unit 単位で保存された全 Artifact を一覧表示する。
*   **表示項目**: ファイル名、Artifact 種別、作成日時、関連 Flow Step、関連 Role[cite: 18, 24]。
*   **フィルター**: 種別（Decision, Spec, Packet, Report, Code 等）による絞り込み機能[cite: 24]。

## 2. メタデータ抽出および判定ロジック[cite: 18, 24]
AI 出力本文および Runtime 状態から保存に必要な情報を特定する。

### 2.1 `File:` 抽出と欠落対応
*   **抽出**: 本文冒頭の `File: [filename].[ext]` からファイル名を取得する[cite: 4, 18]。
*   **欠落時の挙動**: 警告を表示し自動保存を停止。Human 手動入力または Runtime 生成の候補名提示へ切り替える[cite: 18]。

### 2.2 Unit ID 判定ロジック[cite: 24]
以下の優先順位で Unit ID を特定し、不一致時は警告を表示する。
1.  **システム文脈**: 現在実行中の Flow Runtime から `unit_id` を取得[cite: 18]。
2.  **ファイル名解析**: 抽出されたファイル名先頭の `[Unit]_` パターンから取得。

### 2.3 Artifact 種別および保存先判定[cite: 18, 24]
| Artifact 種別 | 判定基準 (Filename 含む) | 保存先フォルダ[cite: 18] |
| :--- | :--- | :--- |
| **Decision** | `*_PMDecision_*` (Rework 以外) | `units/[Unit]/decisions/` |
| **Spec** | `*_Spec.md` | `units/[Unit]/specs/` |
| **Packet** | `*_Packet.md` | `units/[Unit]/packets/` |
| **Report** | `*Report_*` / `*Result_*` | `units/[Unit]/reports/` |
| **PMDecision_Rework** | `*_PMDecision_Rework_*` | `units/[Unit]/decisions/`[cite: 24] |
| **ReworkInstruction** | `*_ReworkInstruction_*` | `units/[Unit]/rework/` |
| **Code** | `*_Code.*` | `units/[Unit]/outputs/` |

## 3. PMDecision 命名規則および Phase 判定仕様[cite: 18, 24]
U-FLOW-10 の旧定義を拡張し、用途（Phase）を厳密に管理する。

### 3.1 判定ロジックテーブル[cite: 24]
| Phase | 紐付け Flow Step[cite: 23] | 判定条件 / 用途[cite: 18] | 保存ファイル名形式[cite: 18] |
| :--- | :--- | :--- | :--- |
| **Start** | main-01 完了後 | Unit 開始判断 | `[Unit]_PMDecision_Start.md` |
| **SpecApproval** | main-04 承認後 | Spec + Review 結果の承認 | `[Unit]_PMDecision_SpecApproval.md` |
| **PacketApproval** | main-05 完了後 | Worker Packet の承認 | `[Unit]_PMDecision_PacketApproval.md` |
| **ControlApproval** | **main-09**[cite: 17, 24] | Verified 判定に対する PM 承認 | `[Unit]_PMDecision_ControlApproval.md` |
| **Final** | main-10 完了後 | Unit 最終完了判断 | `[Unit]_PMDecision_Final.md` |
| **Rework** | 分岐先による | 指定 Role への差戻し判断 | `[Unit]_PMDecision_Rework_[TargetRole].md` |

### 3.2 汎用名および不正名の禁止[cite: 24]
*   **バリデーション**: `[Unit]_Decision.md` などの汎用名、または Phase が欠落した `PMDecision_.md` 等を検出した場合、保存をブロックし、正しい Phase 指定を Human に強制する[cite: 18, 24]。

## 4. 同名衝突防止と Rev 名提案仕様[cite: 18, 24]
上書きを防止し、履歴を保持するための自動採番ルール。

*   **衝突検知**: 同一フォルダ内に同名ファイルが存在する場合、保存ボタンを無効化し警告を表示する[cite: 18, 24]。
*   **Rev 名決定ロジック**: 
    1.  既存の同一 Phase ファイル（`*_RevN.md` 含む）を検索。
    2.  最大のリビジョン番号 `N` を特定。
    3.  `N + 1` を新たなリビジョンとして提案する（初回重複時は `_Rev2` から開始）[cite: 18, 24]。
*   **適用例**:
    *   Decision: `U-FLOW-12_PMDecision_SpecApproval_Rev2.md`
    *   Rework: `U-FLOW-12_PMDecision_Rework_Worker_Rev2.md`[cite: 24]

## 5. Flow Context 紐付けおよび次 Step 参照仕様[cite: 18]
*   **メタデータ保持**: 保存時、`unit_id`, `role`, `current_step`, `state`, `route_context`, `timestamp` を Artifact に紐付けて記録する。
*   **Input 参照**: 次 Step の Prompt 生成時、Input 定義に基づき、紐付けられた Artifact の中から最新版（または特定の Rev 版）を Variables 埋め込み対象として選択できる UI を提供する[cite: 13, 18]。

---

## 6. Acceptance Criteria (U-FLOW-12)[cite: 18, 24]
本 Spec は PM 判断の Acceptance Criteria 18 項目を以下の通り網羅する。

1.  **Role Output 本文受領**: Role Output 本文を貼り付けられる UI を備えている[cite: 18]。
2.  **`File:` 抽出**: `File:` 行からファイル名を正確に抽出できる[cite: 18]。
3.  **欠落対応**: `File:` 欠落時に保存を停止し、手動入力または候補名提示を行える[cite: 18]。
4.  **Artifact 種別判定**: 命名および文脈から Artifact 種別を自動判定できる[cite: 18]。
5.  **Unit ID 判定**: システム文脈またはファイル名から Unit ID を特定・整合確認できる[cite: 18, 24]。
6.  **保存先提案**: 種別に応じた保存先フォルダを自動提案できる[cite: 18]。
7.  **Human 確認保存**: Human がメタデータを確認した後に保存を実行する方式である[cite: 18]。
8.  **一覧表示**: 保存済み Artifact を種別や Step 情報と共に一覧表示できる[cite: 18, 24]。
9.  **Step 紐付け**: Artifact と current_step (State/Route 含む) を紐付け管理できる[cite: 18]。
10. **Input 参照**: 保存済み Artifact を next_step の Prompt 生成用 Input として参照できる[cite: 18]。
11. **Phase 命名適用**: PMDecision に Phase 付き命名規則（Start, SpecApproval 等）を適用できる[cite: 18]。
12. **Rework 命名適用**: PMDecision_Rework に TargetRole 付き命名規則を適用できる[cite: 18, 24]。
13. **汎用名禁止**: `[Unit]_Decision.md` の使用を検知し、保存をブロック・修正指示できる[cite: 18, 24]。
14. **同名衝突警告**: 既存ファイルと重複する場合、上書きせず警告を表示できる[cite: 18]。
15. **Rev 名提案**: 同一 Phase 重複時に `_RevN` 形式の別名を自動提案できる[cite: 18, 24]。
16. **ReworkInstruction 命名**: TargetRole 付き・タイムスタンプ形式の命名で保存できる[cite: 18, 24]。
17. **命名規則の拡張性**: U-FLOW-10 の命名規則を U-FLOW-12 で拡張・包含した形で定義している[cite: 18]。
18. **互換性**: U-FLOW-11 までの Flow/Prompt/Chat Runtime 機能を損なわない設計である[cite: 18]。
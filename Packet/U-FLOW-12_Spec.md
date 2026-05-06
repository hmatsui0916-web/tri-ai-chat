U-FLOW-12_Spec.md

Role: Designer
Scope: Artifact Save Runtime Design

# U-FLOW-12 Artifact Save Runtime Spec

## 1. Artifact 保存 UI 仕様
各 Role からの Output を受領し、ファイルシステムへ保存するためのインターフェース仕様[cite: 18]。

*   **受領エリア**: 
    *   Role Output（COPY Mode ブロック）を貼り付けるための広域テキストエリアを配置する。
    *   「解析実行」ボタンにより、本文からメタデータを自動抽出する。
*   **保存確認パネル**:
    *   抽出されたファイル名、Artifact 種別、保存先フォルダ、紐付けられる Step 情報を表示する。
    *   Human がこれらを修正または確定できるフィールドを設ける[cite: 18]。
*   **保存実行**: 「Artifact 保存」ボタンにより物理ディレクトリへ書き込みを実行する。

## 2. `File:` 抽出および欠落時の挙動
AI 出力の標準プロトコルに基づき、ファイル名を特定するロジック[cite: 4, 18]。

*   **抽出ロジック**: 本文 1 行目から `File:\n[filename].[ext]` の形式を検索する[cite: 4]。
*   **欠落時の Handling**: 
    *   `File:` 行が見つからない場合、警告メッセージ「File name header not found」を表示し、自動保存を一時停止する[cite: 18]。
    *   **手動入力**: Human がファイル名を直接入力可能にする。
    *   **候補提示**: `current_step` と `Role` に基づき、デフォルトの命名規則から候補（例: `U-FLOW-12_Spec.md`）を自動生成して提示する[cite: 18]。

## 3. Artifact 種別・フォルダ判定仕様
ファイル名および Step 属性から Artifact を分類し、保存先を決定する[cite: 18]。

| Artifact 種別 | 判定基準 (Filename/Step) | 保存先フォルダ案[cite: 18] |
| :--- | :--- | :--- |
| **Decision** | `*_PMDecision_*` | `units/[Unit]/decisions/` |
| **Spec** | `*_Spec.md` | `units/[Unit]/specs/` |
| **Packet** | `*_Packet.md` | `units/[Unit]/packets/` |
| **Report** | `*Report_*` / `*Result_*` | `units/[Unit]/reports/` |
| **ReworkInst** | `*_ReworkInstruction_*` | `units/[Unit]/rework/` |
| **Code** | `*_Code.*` | `units/[Unit]/outputs/` |

## 4. PMDecision 命名規則拡張仕様 (U-FLOW-12 新定義)
U-FLOW-10 の定義を拡張し、Flow 上の用途（Phase）を明示する命名を採用する[cite: 18]。

*   **基本形式**: `[Unit]_PMDecision_[Phase].md`
*   **Phase 一覧と判定ロジック**:
    *   `Start`: `main-01` 完了後の開始判断。
    *   `SpecApproval`: `main-04` 承認後の Spec 確定。
    *   `PacketApproval`: `main-05` 完了後の指示書確定。
    *   `WorkerApproval`: Worker 実装に対する個別判断。
    *   `ControlApproval`: `main-08` 完了後の Verified 承認[cite: 19]。
    *   `Final`: `main-10` 完了後の Unit 最終判定。
    *   `Conditional` / `Hold`: 判定結果に基づく。
*   **Rework 形式**: `[Unit]_PMDecision_Rework_[TargetRole].md`[cite: 18]
    *   `TargetRole`: `Designer`, `IntegratorS`, `Worker`, `Infra`

## 5. 同名衝突防止および Rev 名提案
既存ファイルとの競合を避けるためのバージョニング規則[cite: 18]。

*   **衝突検知**: 同一フォルダ内に同名ファイルが存在する場合、保存ボタンを無効化し警告を表示する。
*   **Rev 名提案ロジック**:
    *   同一 Phase の `PMDecision` が既に存在する場合、`_RevN` 接尾辞を自動付与した候補を提示する。
    *   例: `U-FLOW-12_PMDecision_SpecApproval_Rev2.md`[cite: 18]。
*   **ReworkInstruction**: タイムスタンプ付与形式（`[timestamp]`）を維持し、物理的な衝突を回避する[cite: 4, 18]。

## 6. Flow Context 紐付けおよび次 Step 参照
Artifact と Flow 実行状態を連動させ、情報のトレーサビリティを確保する[cite: 18]。

*   **紐付けメタデータ**: 保存時に `unit_id`, `role`, `current_step`, `state`, `route_context` を DB またはメタファイルに記録する[cite: 18]。
*   **次 Step Input 参照**:
    *   U-FLOW-11 の Prompt Runtime と連携する。
    *   `Variables` 埋め込み時、`current_step` の `Inputs` 定義に基づき、過去に保存された Artifact の一覧から最新版を自動選択、または Human が任意に選択できる UI を提供する[cite: 13, 18]。

## 7. Acceptance Criteria (U-FLOW-12)
本 Unit は以下を満たした場合に PASS とする[cite: 18]。

*  [cite: 18] Role Output 本文から `File:` を抽出し、ファイル名を特定できる。
*  [cite: 18] `File:` 欠落時に手動入力または候補名提示により保存を継続できる。
*  [cite: 18] 指定された PMDecision / ReworkInstruction / Report の拡張命名規則が適用される。
*  [cite: 18] 命名衝突時に `_RevN` を含めた別名提案が行われ、上書きを防止できる。
*  [cite: 18] 保存された Artifact が `current_step` と紐付けられ、一覧表示できる。
*  [cite: 18] 次の Step の Prompt 生成時に、保存済み Artifact を Input 候補として参照できる。
*  [cite: 18, 19] U-FLOW-11 までの Chat 運用機能を損なわない。
U-FLOW-11_IntegratorS_Input.md

Role: PM
Scope: Handoff Instruction

# U-FLOW-11 Integrator-S Input

## 依頼

U-FLOW-11 Chat Runtime 組み込みのWorker Packetを作成してください。

## 背景

Flow Runtime基盤はU-FLOW-08でPASS済みです。
Role I/O SchemaはU-FLOW-09でPASS済みです。
Role Template設計はU-FLOW-10でPASS済みです。
Chat Runtime組み込み設計はU-FLOW-11でPASS済みです。

## 今回の目的

Flow上のcurrent_stepに応じて、対象Roleへ適切なRole TemplateとInputを組み立て、チャット列へ投入できるようにする実装Packetを作成してください。

## 参照資料

* U-FLOW-11_PMDecision_Final.md
* U-FLOW-11_Spec.md Rev.2
* U-FLOW-11 ReviewReport Rev.2 再レビュー
* U-FLOW-10_Spec.md Rev.2
* U-FLOW-09_Spec.md Rev.1
* AI Business OS Full Flow v1.4 JSON
* 対象アプリZIP / リポジトリ一式

## 必須反映事項

### 1. Role / Template解決

* current_stepから実行対象Roleを解決する
* current_stepから使用Role Templateを解決する
* decision stepは選択値に応じて分岐する
* feedback stepはcause_classificationに応じて分岐する
* Verified transition時はroute_contextをmainへresetし、main-09へ接続する

### 2. Prompt生成

* Role Header付きPromptを生成する
* Role TemplateにVariablesを埋め込む
* 必須Input不足時はPrompt生成を停止する
* 任意Input / 条件付きInputを区別する
* Worker external_handoff用Promptを生成する

### 3. U-FLOW-11申し送り反映

#### 申し送りH

fb-impl-02およびfb-spec-06は、main-07と同一のParallel処理として扱う。

* fb-impl-02: Worker → Debugger / Infra 並列再検証
* fb-spec-06: Worker → Debugger / Infra 並列再検証

#### 申し送りI

main-06は以下として扱う。

* current_step: main-06
* 実行対象Role: Worker
* 処理種別: external_handoff
* Prompt種別: Worker Handoff Prompt

## 制約

* Flow v1.4 JSONは変更しない
* 既存Flow Runtimeロジックを優先的に使う
* Role Template本文をWorkerが勝手に変更しない
* 未定義InputをPromptに混入しない
* Worker API自動連携はしない
* 本UnitはChat Runtime接続を目的とし、成果物永続化の完成は対象外

## Packetに含めること

* Unit
* Goal
* Target
* Purpose
* Inputs
* Outputs
* Constraints
* Dependencies
* Acceptance Criteria
* Notes
* Implementation Skeleton

## Acceptance Criteria

* current_stepから対象Roleを解決できる
* current_stepから使用Role Templateを解決できる
* Template VariablesへInputを埋め込める
* 必須Input不足時にPrompt生成を停止できる
* 条件付きInputを条件に応じて扱える
* Role Header付きPromptを生成できる
* 対象Role列へPromptを投入できる
* Worker external_handoff用Promptを生成できる
* Integrator-S実行時にPM承認済みSpecであることを担保できる
* Role Output受領後、Humanがstep完了操作できる
* U-FLOW-11完了後、Flowに沿ったRole実行の最小運用が可能になる

## 出力

File:
U-FLOW-11_Packet.md

Role:
Integrator-S

Scope:
Structure

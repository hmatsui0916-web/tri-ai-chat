判定妥当。
**U-FLOW-08はテスト実施不可なので、U-FLOW-08R1へ切り出し**でOKです。

原因は「Flow Engineロジック不足」ではなく、現時点では主に **Runtime操作・可視化UI不足** です。
なのでR1の目的は **本番UI完成ではなく、統合テストを実行可能にする検証用UI追加** に絞るのがよいです。

次はこのまま **U-FLOW-08R1_Packet.md** を作る流れです。

File:
U-FLOW-08R1_Decision.md

Role: PM
Scope: Decision Only

# U-FLOW-08R1 Decision

## 対象

U-FLOW-08 Flow Engine 統合動作確認

## 判定

FAIL / Precondition未達

## 理由

Flow定義の入力・保存UIは存在するが、U-FLOW-08_TestPlan Rev1 のTC-01〜TC-12を実行するために必要なFlow実行確認UIが不足している。

不足しているUI:

* Flow構造確認
* Runtime状態表示
* current_step / next_step確認
* step完了操作
* decision選択
* cause_classification選択
* Verified条件入力
* external_handoff手動完了
* manual_execution完了
* parallel / join状態確認
* loop count確認
* guard状態表示

このため、Humanが統合動作確認を実施できない。

## 原因分類

* UI表示不備
* Flow実行UI未実装または未接続

## 次Action

U-FLOW-08R1として、Flow実行確認用UIを追加する。

## U-FLOW-08R1 Scope

本Unitでは、本番完成UIではなく、U-FLOW-08_TestPlan Rev1を実行可能にするための検証用Runtime UIを追加する。

## U-FLOW-08R1 必須UI

### 1. Flow読込結果表示

* flow_id
* version
* main_flow step一覧
* feedback_flow branch一覧

### 2. Runtime状態表示

* state
* route_context
* current_step
* next_step
* loop counts

### 3. 操作UI

* current_step完了ボタン
* decision選択

  * pass
  * conditional
  * reject
* cause_classification選択

  * implementation
  * specification
  * environment
* Verified条件入力
* external_handoff手動完了ボタン
* manual_execution完了ボタン
* Debugger完了ボタン
* Infra完了ボタン

### 4. Guard表示

* template_unresolved
* human_gate待ち
* external_handoff待ち
* join未完了
* max_iterations到達

## Acceptance Criteria

* Flow保存後、Flow構造がUIで確認できる
* 現在のstate / route_context / current_step / next_stepが確認できる
* HumanがUI操作でstepを進行できる
* decision branchを選択できる
* cause_classification branchを選択できる
* Verified条件を入力し、Verified transition確認ができる
* external_handoffを手動完了扱いにできる
* manual_executionを完了扱いにできる
* Debugger / Infraのparallel完了状態を個別に操作できる
* join未完了時に進行できないことが確認できる
* loop countとmax_iterations到達が確認できる
* U-FLOW-08_TestPlan Rev1のTC-01〜TC-12をHumanが実行可能になる

## 次工程

Integrator-Sへ回付し、U-FLOW-08R1_Packet.mdを作成する。

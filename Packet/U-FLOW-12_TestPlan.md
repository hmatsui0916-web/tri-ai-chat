# U-FLOW-12 実機テスト計画

Role: Infra
Scope: Artifact Save Runtime 実機確認

## 1. Unit

U-FLOW-12

## 2. Title

Artifact Save Runtime 保存・一覧・next_step Input 反映テスト

## 3. Purpose

Role Output を Artifact としてブラウザ Runtime に保存し、File 名解析、Artifact 種別判定、logicalPath 管理、Rev 衝突制御、保存済み Artifact 一覧、PromptRuntimeInputs への反映が U-FLOW-12 Packet / Spec 通りに動作することを実機で確認する。

U-FLOW-12 は localStorage 保存を対象とし、実ファイル作成や Worker API 自動送信は対象外とする。

## 4. Build Check

実施済み:

```text
npm.cmd run build
```

結果:

```text
Compiled successfully
Finished TypeScript
Route (app)
  / static
  /api/ask-stream dynamic
```

補足: PowerShell で `npm run build` を直接実行すると `npm.ps1` が Execution Policy でブロックされる環境がある。その場合は `npm.cmd run build` を使用する。

## 5. Preconditions

- ブランチまたは作業ツリーが U-FLOW-12 実装済み状態である。
- `npm.cmd run build` が PASS している。
- ブラウザでアプリを開ける。
- U-FLOW-11 Prompt Runtime が表示され、その直後に `U-FLOW-12 Artifact Save Runtime` パネルが表示される。
- テスト前に必要なら DevTools Console で以下を実行し、保存済み Artifact を初期化する。

```js
localStorage.removeItem("tri-ai-saved-artifacts")
location.reload()
```

## 6. Execution Setup

起動:

```text
npm.cmd run dev
```

確認URL:

```text
http://localhost:3000
```

Human は各 TC の実行後、以下を記録する。

- 実施日時
- commit hash
- ブラウザ名
- current_step / state / route_context
- 入力した Role Output
- Analysis preview の主要値
- 保存結果メッセージ
- Saved Artifacts の表示
- Action Log の該当行
- PASS / FAIL / CONDITIONAL
- FAIL の場合、期待値と実値

## 7. Test Data

### TD-01 Packet

```text
File: U-FLOW-12_Packet.md

# U-FLOW-12 Packet
Packet body sample.
```

### TD-02 File Next Line

```text
File:
U-FLOW-12_Spec.md

# U-FLOW-12 Spec
Spec body sample.
```

### TD-03 Missing File

```text
# U-FLOW-12 Artifact
No leading File line.
```

### TD-04 PMDecision SpecApproval

```text
File: U-FLOW-12_PMDecision_SpecApproval.md

# PM Decision
Spec approved.
```

### TD-05 Generic Decision Block

```text
File: U-FLOW-12_Decision.md

# Decision
This generic decision name must be blocked.
```

### TD-06 PMDecision Rework

```text
File: U-FLOW-12_PMDecision_Rework_Worker.md

# PM Rework Decision
Return to Worker.
```

### TD-07 ReworkInstruction

```text
File: U-FLOW-12_ReworkInstruction_Worker_20260506_120000.md

# Rework Instruction
Worker should revise implementation.
```

### TD-08 DebugReport

```text
File: U-FLOW-12_DebugReport_20260506_120000.md

# Debug Report
Debug result sample.
```

### TD-09 Report False Positive

```text
File: ErrorReport.md

# Error Report
This should not be classified as Report by U-FLOW-12 rule.
```

### TD-10 Path Traversal Sanitization

```text
File: ../../evil/U-FLOW-12_Packet.md

# Packet
Path traversal should be stripped to leaf file name.
```

### TD-11 Code Artifact

```text
File: U-FLOW-12_Code.ts

export const artifactSaveRuntimeSmoke = true;
```

## 8. Test Cases

## TC-01 Artifact Save Runtime パネル表示

目的: U-FLOW-11 Prompt Runtime の直後、Runtime Controls の前に U-FLOW-12 パネルが表示されることを確認する。

手順:

1. アプリを開く。
2. Runtime Panel 付近を確認する。
3. `U-FLOW-12 Artifact Save Runtime` パネルを探す。

期待結果:

- `Role Output` textarea が表示される。
- `Manual file name`, `PMDecision phase`, `Rework target role` が表示される。
- Analysis preview が表示される。
- `Artifact Save` ボタンが表示される。
- Saved Artifacts 一覧と `Use default`, `Use as Input` 操作が表示される。

判定: PASS / FAIL

---

## TC-02 Inline File 抽出・Packet 保存

目的: `File: U-FLOW-12_Packet.md` を抽出し、Packet として保存できることを確認する。

手順:

1. `Role Output` に TD-01 を貼り付ける。
2. Analysis preview を確認する。
3. `Artifact Save` を押す。
4. Saved Artifacts 一覧を確認する。

期待結果:

- Extracted File: `U-FLOW-12_Packet.md`
- Final File: `U-FLOW-12_Packet.md`
- Unit ID: `U-FLOW-12`
- Artifact Type: `Packet`
- Logical Path: `units/U-FLOW-12/packets/`
- 保存後、Saved Artifacts に表示される。
- Action Log に `Artifact Saved` が追加される。

判定: PASS / FAIL

---

## TC-03 Next-line File 抽出・Spec 保存

目的: `File:` の次行にあるファイル名を抽出できることを確認する。

根拠: U-FLOW-12_Packet.md Section 8.2 `File:` Extraction の許容例に `File:\nU-FLOW-12_Packet.md` が明記されているため、本TCでは next-line fallback を確認対象にする。

手順:

1. `Role Output` に TD-02 を貼り付ける。
2. Analysis preview を確認する。
3. `Artifact Save` を押す。

期待結果:

- Extracted File: `U-FLOW-12_Spec.md`
- Artifact Type: `Spec`
- Logical Path: `units/U-FLOW-12/specs/`
- 保存できる。

判定: PASS / FAIL

---

## TC-04 File 欠落時の保存ブロックと候補名表示

目的: `File:` がない Role Output は自動保存されず、候補名または手動入力に誘導されることを確認する。

手順:

1. `Role Output` に TD-03 を貼り付ける。
2. Analysis preview とエラーを確認する。
3. `Artifact Save` ボタンの状態を確認する。
4. `Manual file name` に `U-FLOW-12_Artifact_Manual.md` を入力する。
5. Analysis preview を再確認する。

期待結果:

- Extracted File は `(missing)`。
- `File: line is missing. Confirm or enter a file name before saving.` が表示される。
- `Artifact Save` は無効。
- Manual file name 入力後、エラーが消え保存可能になる。

判定: PASS / FAIL

---

## TC-05 PMDecision Phase 判定・保存

目的: Phase 付き PMDecision を Decision / decisions 配下として保存できることを確認する。

手順:

1. `Role Output` に TD-04 を貼り付ける。
2. Analysis preview を確認する。
3. `Artifact Save` を押す。

期待結果:

- Artifact Type: `Decision`
- PMDecision Phase: `SpecApproval`
- Logical Path: `units/U-FLOW-12/decisions/`
- 保存できる。

追加サブケース:

1. `Role Output` に `File: U-FLOW-12_PMDecision_WorkerApproval.md` を含む本文を貼り付ける。
2. Analysis preview を確認し、必要なら保存する。
3. `File: U-FLOW-12_PMDecision_Conditional.md` と `File: U-FLOW-12_PMDecision_Hold.md` も同様に確認する。

追加期待結果:

- Artifact Type: `Decision`
- PMDecision Phase: `WorkerApproval` / `Conditional` / `Hold`
- Phase-less PMDecision としてブロックされない。
- Logical Path: `units/U-FLOW-12/decisions/`

判定: PASS / FAIL

---

## TC-06 Generic Decision 名の保存ブロック

目的: `[Unit]_Decision.md` 形式が保存ブロックされることを確認する。

手順:

1. `Role Output` に TD-05 を貼り付ける。
2. Analysis preview とエラーを確認する。
3. `Artifact Save` ボタンの状態を確認する。

期待結果:

- Artifact Type は `Decision` と判定される。
- Logical Path は `units/U-FLOW-12/decisions/`。
- `Generic Decision file names are blocked...` が表示される。
- `Artifact Save` は無効。
- `outputs/` に Unknown として保存されない。

判定: PASS / FAIL

---

## TC-07 PMDecision_Rework TargetRole 判定

目的: PMDecision_Rework が Decision とは別種別として保存され、TargetRole が反映されることを確認する。

手順:

1. `Role Output` に TD-06 を貼り付ける。
2. Analysis preview を確認する。
3. `Artifact Save` を押す。

期待結果:

- Artifact Type: `PMDecision_Rework`
- PMDecision Phase: `Rework`
- Target Role: `Worker`
- Logical Path: `units/U-FLOW-12/decisions/`
- 保存できる。

判定: PASS / FAIL

---

## TC-08 ReworkInstruction TargetRole + timestamp 判定

目的: ReworkInstruction が `rework/` 配下に保存され、TargetRole と timestamp 形式を確認できることを検証する。

手順:

1. `Role Output` に TD-07 を貼り付ける。
2. Analysis preview を確認する。
3. `Artifact Save` を押す。

期待結果:

- Artifact Type: `ReworkInstruction`
- Target Role: `Worker`
- Logical Path: `units/U-FLOW-12/rework/`
- Final File: `U-FLOW-12_ReworkInstruction_Worker_20260506_120000.md`
- 保存できる。

判定: PASS / FAIL

---

## TC-09 Report 判定と False Positive 防止

目的: `*Report_*` / `*Result_*` のみ Report と判定し、曖昧な `ErrorReport.md` は Report 扱いしないことを確認する。

手順:

1. `Role Output` に TD-08 を貼り付ける。
2. Analysis preview を確認し、保存する。
3. `Role Output` に TD-09 を貼り付ける。
4. Analysis preview を確認する。

期待結果:

- TD-08 は Artifact Type: `Report`、Logical Path: `units/U-FLOW-12/reports/`。
- TD-09 は Artifact Type: `Unknown`。
- TD-09 は `reports/` に分類されない。

判定: PASS / FAIL

---

## TC-10 Path Traversal Sanitization

目的: `File:` にパスが含まれても leaf file name のみに正規化されることを確認する。

手順:

1. `Role Output` に TD-10 を貼り付ける。
2. Analysis preview を確認する。

期待結果:

- Extracted File: `U-FLOW-12_Packet.md`
- Final File: `U-FLOW-12_Packet.md`
- `../` やフォルダ名が保存名に残らない。
- Logical Path: `units/U-FLOW-12/packets/`

判定: PASS / FAIL

---

## TC-10A Code 種別判定

目的: `*_Code.*` ファイルが Code 種別として `outputs/` に保存されることを確認する。

手順:

1. `Role Output` に TD-11 を貼り付ける。
2. Analysis preview を確認する。
3. `Artifact Save` を押す。
4. Saved Artifacts 一覧を確認する。

期待結果:

- Extracted File: `U-FLOW-12_Code.ts`
- Final File: `U-FLOW-12_Code.ts`
- Artifact Type: `Code`
- Logical Path: `units/U-FLOW-12/outputs/`
- 保存できる。
- Saved Artifacts 一覧に Code として表示される。

判定: PASS / FAIL

---

## TC-11 同名衝突・Rev 候補

目的: 同一 logicalPath 内の同名保存をブロックし、`_RevN` 候補を提示できることを確認する。

手順:

1. TC-02 で `U-FLOW-12_Packet.md` を保存済みにする。
2. 再度 TD-01 を貼り付ける。
3. Analysis preview とエラーを確認する。
4. `Use Suggested Rev` を押す。
5. `Artifact Save` を押す。

期待結果:

- 重複時、`Same file already exists...` が表示される。
- Revision Suggestion: `U-FLOW-12_Packet_Rev2.md`
- `Use Suggested Rev` 押下後、Final File が Rev2 になる。
- Rev2 として保存できる。
- Rev 表示が `2` になる。

判定: PASS / FAIL

---

## TC-12 Saved Artifacts 一覧・フィルタ

目的: 保存済み Artifact が必要メタデータ付きで一覧表示され、Unit / Type で絞り込めることを確認する。

手順:

1. TC-02, TC-05, TC-08, TC-09 の保存済み状態を作る。
2. Saved Artifacts 一覧を確認する。
3. `Unit filter` に `U-FLOW-12` を入力する。
4. `Type filter` を `Packet`, `Decision`, `ReworkInstruction`, `Report` に切り替える。

期待結果:

- fileName / artifactType / logicalPath / role / step / state / routeContext / timestamp / rev が表示される。
- Unit filter で U-FLOW-12 のみ表示される。
- Type filter で対象種別のみ表示される。
- content preview が表示される。

判定: PASS / FAIL

---

## TC-13 Copy Content

目的: 保存済み Artifact の content をクリップボードへコピーできることを確認する。

手順:

1. Saved Artifacts の任意の Artifact で `Copy content` を押す。
2. テキストエディタ等に貼り付ける。

期待結果:

- Artifact content が貼り付けられる。
- UI がクラッシュしない。

判定: PASS / FAIL

---

## TC-14 Use default で runtimeOutputsText に反映

目的: Artifact 種別ごとの default input key に content を反映できることを確認する。

手順:

1. TC-02 で保存した Packet を Saved Artifacts から探す。
2. `Use default: packet_content` を押す。
3. Prompt Runtime Inputs または runtime outputs JSON 表示を確認する。
4. Action Log を確認する。

期待結果:

- Packet content が `packet_content` に反映される。
- 既存 JSON が pretty print された状態で維持される。
- Action Log に `Artifact Applied to Runtime Input` が追加される。
- note が `U-FLOW-12_Packet.md -> packet_content` 形式になる。

判定: PASS / FAIL

---

## TC-15 Use as Input 任意 key 反映

目的: Report 系 Artifact を Human が選んだ Runtime input key に反映できることを確認する。

手順:

1. TC-09 step 2 で保存した `U-FLOW-12_DebugReport_20260506_120000.md` を Saved Artifacts から探す。
2. `Runtime input key` を `debug_report` にする。
3. `Use as Input: debug_report` を押す。
4. `Runtime input key` を `infra_result` にする。
5. 同じ Artifact で `Use as Input: infra_result` を押す。

期待結果:

- それぞれ `debug_report`, `infra_result` に content が反映される。
- Action Log に各反映操作が記録される。
- 他 key の値が意図せず消えない。

判定: PASS / FAIL

---

## TC-16 不正 JSON 時の Input 反映ブロック

目的: runtimeOutputsText が不正 JSON の場合、Artifact 反映を止めてエラー表示できることを確認する。

手順:

1. Runtime outputs JSON 入力欄に不正 JSON を入れる。
2. Saved Artifacts の任意の Artifact で `Use default` または `Use as Input` を押す。

期待結果:

- `Runtime input update blocked: ...` が表示される。
- runtimeOutputsText は破壊されない。
- Action Log に成功扱いの反映ログは追加されない。

判定: PASS / FAIL

---

## TC-17 U-FLOW-11 Prompt Runtime 回帰確認

目的: U-FLOW-12 追加後も U-FLOW-11 の Prompt 生成、Copy、Stage が壊れていないことを確認する。

手順:

1. main-05 または main-06 まで進める。
2. 必要 input を入れる。
3. `Generate Prompt` を押す。
4. `Copy Prompt` を押す。
5. `Stage to Role Columns` を押す。

期待結果:

- Prompt が生成される。
- Copy が成功する。
- Stage が対象 Role column または Worker handoff に反映される。
- U-FLOW-12 の保存操作をしても U-FLOW-11 の生成結果が消えない。

判定: PASS / FAIL

---

## TC-18 main-05 PM-approved Spec Guard 回帰確認

目的: main-05 Integrator-S の PM-approved Spec guard が維持されていることを確認する。

手順:

1. main-05 に移動する。
2. PM-approved Spec 条件を満たさない状態にする。
3. `Generate Prompt` を押す。
4. 条件を満たす状態にして再度 `Generate Prompt` を押す。

期待結果:

- 条件不足時は Integrator-S Prompt 生成がブロックされる。
- 条件充足時は Integrator-S Prompt が生成される。
- U-FLOW-12 の Artifact 保存機能は guard を迂回しない。

判定: PASS / FAIL

---

## TC-19 main-06 Worker External Handoff 回帰確認

目的: Worker step で API 自動送信されず、手動 handoff 前提が維持されることを確認する。

手順:

1. main-06 に移動する。
2. `packet_content` を入れる。
3. `Generate Prompt` を押す。
4. Worker handoff 表示を確認する。

期待結果:

- `Worker handoff is manual... no API request will be sent.` が表示される。
- Worker API 自動送信が発生しない。
- `Stage to Role Columns` は external/manual target として扱われる。

判定: PASS / FAIL

## 9. Final Judgment

PASS:

- TC-01 から TC-19 および TC-10A がすべて PASS。
- build が PASS。
- 保存、一覧、Rev、Input 反映、U-FLOW-11 回帰に重大不具合がない。

CONDITIONAL:

- 軽微な表示崩れや文言差分はあるが、保存可否・分類・Input 反映・回帰確認に影響しない。

FAIL:

- Artifact が誤分類される。
- 保存ブロックすべきケースが保存される。
- 同名上書きが可能になる。
- next_step Input 反映で JSON が破壊される。
- U-FLOW-11 Prompt Runtime の Generate / Copy / Stage / Guard / Worker handoff が壊れる。

## 10. Human Execution Follow

Human への依頼:

1. `npm.cmd run dev` で起動してください。
2. `http://localhost:3000` を開いてください。
3. 事前に `localStorage.removeItem("tri-ai-saved-artifacts"); location.reload();` を実行してください。
4. TC-01 から TC-19 および TC-10A を順に実行してください。
5. 各 TC の PASS / FAIL / CONDITIONAL と証跡を記録してください。
6. FAIL が出た場合は、該当 TC、入力データ、Analysis preview、Saved Artifacts 表示、Action Log、スクリーンショットを共有してください。

実行結果記入テンプレート:

```text
Unit: U-FLOW-12
Tester:
Date:
Commit:
Browser:

TC-01:
Result:
Evidence:
Notes:

TC-02:
Result:
Evidence:
Notes:

...

Final Judgment:
Open Issues:
```

Infra 判定:

- Human 実行結果を受領後、FAIL は再現性、Packet AC 影響、回帰影響で分類する。
- `[Unit]_Decision.md` ブロック、Report false positive、Rev 衝突、Input 反映 JSON 破壊は Critical として扱う。
- Critical が 0 件、Major が 0 件なら U-FLOW-12 実機テスト PASS とする。

両ドキュメントとも、これまでの合議内容が過不足なく反映されています。特に以下が良くまとまっています。

- A3 → Role単位の実行環境ルーティングへのフレーミング
- Phase A/B分割
- 違反時フォールバック表（PM override条項を含む）
- Common Language Policyを **Global Policy Injection** として一般化した点（将来の他ポリシーにも拡張可能な設計）
- 「U-FLOW-13以前のArtifactは遡及翻訳しない」のカットオーバー明示

着手前に詰めておきたい小さな点が3つあります。

---

## 1. Designer Instruction の Required Sections に Global Policy が抜けている

「Additional Requirement: Global Policy Injection」で要件は追加されていますが、Section 9 の Required Sections（Spec構成）には対応する章が含まれていません。

```
13. Violation Fallback Design
14. UI Requirements
15. Data Model Impact
...
```

このままだとDesignerが既存章に混ぜ込むか独自章を立てるか判断が分かれ、Outputが揺れます。**「14. Global Policy Mechanism」を追加し以降を繰り下げる**のが最も安全です。

## 2. Section 10 Acceptance Criteria にも Global Policy 項目を追加

Designer Outputの受け入れ基準（Section 10）に、Global Policy関連の項目が反映されていません。Additional Requirementで列挙した6項目（保管場所、Prompt Builder参照方式、Role/Step/Artifact種別ごとの適用、Packetへの出現、PM override、将来拡張性）のうち、最低限以下は Acceptance Criteria 化すべきです。

- Common Policyの保管場所が定義されている
- Handoff Packetへの注入方式が定義されている
- Policy単位でのPM overrideが定義されている

これがないと「章は書いたが内容が薄い」状態でも通ってしまいます。

## 3. PM入力境界の翻訳ゲートを誰が持つかが未定義

Common Language Policyは「AI-to-AIは英語、PM判断は日本語」を定めていますが、**PMが日本語で書いた指示を、いつ・誰が英語Packetに変換するか**が明示されていません。

候補としては：

- **Designer**が日本語PM指示を読んで、後続Role向けに英語のExpected Output / Output Schema を定義する
- **Integrator-S（論理）**が日本語仕様を読んで、英語Worker Packet を物理化する

どちらの設計でもよいですが、どちらかを Designer Instruction の **「7.4 Handoff Packet仕様」または新設の Global Policy 章** で明示しておくと、Designerが境界の責務を見落としません。実態としては Integrator-S（論理）が担うのが自然と思います（Designer は仕様設計者であり翻訳者ではないため）。

---

## 任意確認：第一適用Step / Phase A→Bトリガー

PMDecision Section 11 は「Worker Step または Debugger Step を候補とする」止まりです。Phase A設計中に決める想定なら問題ありませんが、忘れるとPhase A完了基準が曖昧になります。Phase A → B のトリガー（**第一適用Stepで実走1回後**）も合わせて、Phase A中盤までに確定させておくと安全です。

---

3点のうち **1と2は反映すると Designer Output の品質が一段上がります**。3は設計判断なのでDesigner任せでも構いませんが、迷いを減らすために事前に方針を渡しておくと早いです。

それ以外は着手して問題ありません。良い構成にまとまっています。
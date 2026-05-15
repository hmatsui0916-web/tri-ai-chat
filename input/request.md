# Workflow Runner v0 Smoke Request

Create a minimal file-based workflow run from this request.

The run should pass through PM, Designer, Reviewer, Worker, Debugger, and Integrator-C, then save inspectable prompt and output files under a unique run folder.
# Test Request

Workflow Runner v0 の運用テストをしてください。

目的:
- PM から Integrator-C まで通るか確認する
- Reviewer / Debugger / Integrator-C の出力を確認する
- run.json で状態を確認する

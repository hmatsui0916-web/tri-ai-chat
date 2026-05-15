# Workflow Runner v0 Prompt

## Role

{{roleName}}

## Role Contract

### Input Contract

{{roleInputContract}}

### Output Contract

{{roleOutputContract}}

## Role Instruction

{{roleInstruction}}

## Original Human Request

{{humanRequest}}

## Runtime Context

{{runtimeContext}}

## Previous Role Outputs

{{previousOutputs}}

## Required Output Shape

Please return markdown with this shape:
Additional role-specific sections are allowed when the Role Instruction requires them.
When a Role Instruction requires HumanGate, write that section in Japanese.

```markdown
# {{roleName}} Output

## Role Contract

- Input consumed:
- Output promised:

## Summary

## Decisions / Findings

## Next Input For Following Role
```

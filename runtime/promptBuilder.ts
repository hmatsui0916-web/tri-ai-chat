export type PreviousRoleOutput = {
  role: string;
  output: string;
};

export type BuildRolePromptInput = {
  roleName: string;
  roleInstruction: string;
  promptTemplate: string;
  humanRequest: string;
  previousOutputs: PreviousRoleOutput[];
  runtimeContext?: string;
};

function formatPreviousOutputs(previousOutputs: PreviousRoleOutput[]): string {
  if (previousOutputs.length === 0) {
    return "No previous role outputs.";
  }

  return previousOutputs
    .map(
      (entry, index) =>
        `### ${index + 1}. ${entry.role}\n\n${entry.output.trim()}`,
    )
    .join("\n\n---\n\n");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return Object.entries(values).reduce(
    (result, [key, value]) =>
      result.replace(new RegExp(`{{${escapeRegExp(key)}}}`, "g"), value),
    template,
  );
}

function extractSection(markdown: string, heading: string): string {
  const pattern = new RegExp(
    `^## ${escapeRegExp(heading)}\\s*\\n([\\s\\S]*?)(?=^##\\s|(?![\\s\\S]))`,
    "m",
  );
  const match = markdown.match(pattern);

  return match?.[1]?.trim() || "Not specified.";
}

export function buildRolePrompt(input: BuildRolePromptInput): string {
  return renderTemplate(input.promptTemplate, {
    roleName: input.roleName,
    roleInputContract: extractSection(input.roleInstruction, "Input Contract"),
    roleOutputContract: extractSection(input.roleInstruction, "Output Contract"),
    roleInstruction: input.roleInstruction.trim(),
    humanRequest: input.humanRequest.trim(),
    previousOutputs: formatPreviousOutputs(input.previousOutputs),
    runtimeContext: input.runtimeContext?.trim() || "No additional runtime context.",
  });
}

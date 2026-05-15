import { spawn } from "node:child_process";

export type ExecuteMockRoleInput = {
  roleName: string;
  prompt: string;
  previousOutputCount: number;
};

export type ExecutorName = "mock" | "codex" | "claude" | "gemini";

export type ExecuteRoleInput = ExecuteMockRoleInput & {
  executor: ExecutorName;
  workspaceRoot: string;
};

function excerpt(value: string, maxLength: number): string {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) {
    return compact;
  }

  return `${compact.slice(0, maxLength - 3)}...`;
}

function roleSpecificFindings(roleName: string): string {
  switch (roleName) {
    case "PM":
      return [
        "- Mission boundary: keep Workflow Runner v0 minimal and file-based.",
        "- Success condition: one command produces inspectable role outputs.",
        "- Constraint: do not expand into DB, Snapshot, Decision lifecycle, or UI.",
      ].join("\n");
    case "Designer":
      return [
        "- Workflow shape: Human request flows through fixed roles in order.",
        "- Handoff shape: each role receives original request plus prior outputs.",
        "- Inspectability: prompts, outputs, and run state remain ordinary files.",
      ].join("\n");
    case "Reviewer":
      return [
        "- Review status: PASS for v0-minimal scope if outputs remain file-based.",
        "- Scope-drift check: DB, Snapshot, Decision lifecycle, Branch/Fork, and UI must stay excluded.",
        "- Worker gap to watch: failure state and resume behavior must be visible in run.json.",
        "",
        "## Review Result",
        "",
        "Result: PASS",
      ].join("\n");
    case "Worker":
      return [
        "- Implementation target: preserve the CLI runner and run folder contract.",
        "- Files to watch: runtime workflow, prompt builder, role executor, role instructions, and templates.",
        "- Validation: run workflow, inspect run.json, and build the app.",
      ].join("\n");
    case "Debugger":
      return [
        "- Debug status: PASS if normal run, failure path, resume path, and build all pass.",
        "- Verification focus: missing input/template/role files, run.json consistency, and stale path handling.",
        "- Fix policy: apply only small runtime fixes; defer schema, DB, and lifecycle work.",
        "",
        "## Debug Result",
        "",
        "Result: PASS",
      ].join("\n");
    case "Integrator-C":
      return [
        "- Integrated result: Workflow Runner v0 now has execution, role contracts, template loading, local state, resume, and a minimal review loop.",
        "- Human check: inspect the latest run folder and confirm outputs are easier than manual cross-chat handoff.",
        "- Next limitation: executor is still mock; replacing it with a real model call is a later Unit.",
      ].join("\n");
    case "PM-FinalDecision":
      return [
        "- Final decision: COMPLETE for mock flow verification.",
        "- HumanGate: not required.",
        "- Rework: not required.",
      ].join("\n");
    default:
      return [
        `- Role executed: ${roleName}`,
        "- No role-specific findings configured.",
      ].join("\n");
  }
}

function nextInputForRole(roleName: string): string {
  switch (roleName) {
    case "Reviewer":
      return "Pass this review to Worker as constraints and gaps to address before implementation.";
    case "Debugger":
      return "Pass this debug report to Integrator-C as verification evidence and remaining risk context.";
    case "Integrator-C":
      return "Use this final handoff for Human inspection and PM completion judgment.";
    default:
      return `Use this ${roleName} output as prior context for the next role.`;
  }
}

export async function executeMockRole(
  input: ExecuteMockRoleInput,
): Promise<string> {
  const promptExcerpt = excerpt(input.prompt, 500);
  const findings = roleSpecificFindings(input.roleName);
  const nextInput = nextInputForRole(input.roleName);

  return `# ${input.roleName} Output

## Role Contract

- Input consumed: original Human request plus ${input.previousOutputCount} previous role output(s)
- Output promised: concise markdown that the next role can use without rewriting

## Summary

Mock executor completed the ${input.roleName} step in Workflow Runner v0 with role-specific v0 review-loop content.

## Decisions / Findings

- Previous role outputs received: ${input.previousOutputCount}
- Execution mode: mock
${findings}

## Next Input For Following Role

${nextInput}

### Prompt Excerpt Received

${promptExcerpt}
`;
}

function splitArgs(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value.split(/\s+/).filter(Boolean);
}

function envArgsOrDefault(
  value: string | undefined,
  defaultArgs: string[],
): string[] {
  return value?.trim() ? splitArgs(value) : defaultArgs;
}

function getExternalExecutorCommand(
  executor: Exclude<ExecutorName, "mock">,
  workspaceRoot: string,
): {
  command: string;
  args: string[];
} {
  switch (executor) {
    case "codex":
      return {
        command: process.env.CODEX_EXECUTOR_COMMAND || "codex",
        args: envArgsOrDefault(process.env.CODEX_EXECUTOR_ARGS, [
          "exec",
          "--cd",
          workspaceRoot,
          "--sandbox",
          "read-only",
          "-",
        ]),
      };
    case "claude":
      return {
        command: process.env.CLAUDE_EXECUTOR_COMMAND || "claude",
        args: envArgsOrDefault(process.env.CLAUDE_EXECUTOR_ARGS, ["-p"]),
      };
    case "gemini":
      return {
        command: process.env.GEMINI_EXECUTOR_COMMAND || "gemini",
        args: envArgsOrDefault(process.env.GEMINI_EXECUTOR_ARGS, ["-p", ""]),
      };
  }
}

function getSpawnCommand(command: string, args: string[]): {
  command: string;
  args: string[];
} {
  const extension = command.toLowerCase().slice(command.lastIndexOf("."));

  if (process.platform === "win32" && [".cmd", ".bat"].includes(extension)) {
    return {
      command: "cmd.exe",
      args: ["/d", "/s", "/c", command, ...args],
    };
  }

  return { command, args };
}

function runExternalExecutor(
  input: ExecuteRoleInput & { executor: Exclude<ExecutorName, "mock"> },
): Promise<string> {
  const { command, args } = getExternalExecutorCommand(
    input.executor,
    input.workspaceRoot,
  );
  const spawnCommand = getSpawnCommand(command, args);

  return new Promise((resolve, reject) => {
    const child = spawn(spawnCommand.command, spawnCommand.args, {
      cwd: input.workspaceRoot,
      env: process.env,
      shell: false,
      stdio: ["pipe", "pipe", "pipe"],
    });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    child.stdout.on("data", (chunk: Buffer) => {
      stdoutChunks.push(chunk);
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderrChunks.push(chunk);
    });

    child.on("error", (error) => {
      reject(
        new Error(
          `External executor "${input.executor}" failed to start (${command}): ${error.message}`,
        ),
      );
    });

    child.on("close", (code) => {
      const stdout = Buffer.concat(stdoutChunks).toString("utf8").trim();
      const stderr = Buffer.concat(stderrChunks).toString("utf8").trim();

      if (code !== 0) {
        reject(
          new Error(
            `External executor "${input.executor}" exited with code ${code}.${stderr ? ` stderr: ${stderr}` : ""}`,
          ),
        );
        return;
      }

      if (!stdout) {
        reject(
          new Error(
            `External executor "${input.executor}" returned empty stdout.${stderr ? ` stderr: ${stderr}` : ""}`,
          ),
        );
        return;
      }

      resolve(stdout);
    });

    child.stdin.end(buildExternalExecutorPrompt(input));
  });
}

function buildExternalExecutorPrompt(input: ExecuteRoleInput): string {
  return [
    "You are running as a Workflow Runner role executor.",
    "Return only the requested markdown role output to stdout.",
    "Do not edit files.",
    "Do not run shell commands.",
    "Do not request permissions.",
    "Do not create artifacts outside your final markdown response.",
    "",
    input.prompt,
  ].join("\n");
}

export async function executeRole(input: ExecuteRoleInput): Promise<string> {
  if (input.executor === "mock") {
    return executeMockRole(input);
  }

  return runExternalExecutor({
    ...input,
    executor: input.executor,
  });
}

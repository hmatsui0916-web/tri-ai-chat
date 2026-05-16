import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, readFile, writeFile } from "node:fs/promises";

// @ts-ignore Node 24 runs this local CLI directly from TypeScript source.
import { buildRolePrompt, type PreviousRoleOutput } from "./promptBuilder.ts";
// @ts-ignore Node 24 runs this local CLI directly from TypeScript source.
import { executeRole, type ExecutorName } from "./roleExecutor.ts";

type WorkflowStatus = "running" | "completed" | "failed" | "human_gate";
type RoleStatus = "running" | "completed" | "failed";

type RoleDefinition = {
  step: number;
  role: string;
  displayName: string;
  stem: string;
  instructionFile: string;
  executor?: ExecutorName;
};

type RunRoleRecord = {
  step: number;
  role: string;
  executor: ExecutorName;
  status: RoleStatus;
  prompt_path: string | null;
  output_path: string | null;
  artifact_paths?: string[] | null;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
};

type RunLog = {
  run_id: string;
  workflow_version: "v0";
  flow_id: string;
  flow_path: string | null;
  profile_id: string | null;
  profile_path: string | null;
  human_note_path: string | null;
  input_path: string;
  run_folder: string;
  executor: ExecutorName;
  external_role: string;
  status: WorkflowStatus;
  current_role: string | null;
  total_steps: number;
  completed_steps: number;
  failed_step: number | null;
  roles: RunRoleRecord[];
  final_output_path: string | null;
  error: null | {
    role: string | null;
    message: string;
  };
  resume_history: ResumeRecord[];
  started_at: string;
  finished_at: string | null;
  last_updated_at: string;
};

type ResumeRecord = {
  from_role: string;
  resumed_at: string;
};

type CliOptions =
  {
    executor: ExecutorName;
    externalRole: string;
    flowPath: string | null;
    profilePath: string | null;
    humanNotePath: string | null;
  } & (
    | {
        mode: "new";
        inputArg: string;
      }
    | {
        mode: "resume";
        resumeTarget: string;
        fromRole: string;
      }
  );

type FlowDefinition = {
  flow_id: string;
  description?: string;
  steps: RoleDefinition[];
};

type ExecutorProfile = {
  profile_id: string;
  description?: string;
  assignments: Record<string, ExecutorName>;
  role_intent?: Record<string, string>;
  fallbacks?: Partial<Record<ExecutorName, ExecutorName>>;
};

const roleSequence: RoleDefinition[] = [
  {
    step: 1,
    role: "pm",
    displayName: "PM",
    stem: "01-pm",
    instructionFile: "pm.md",
  },
  {
    step: 2,
    role: "designer",
    displayName: "Designer",
    stem: "02-designer",
    instructionFile: "designer.md",
  },
  {
    step: 3,
    role: "reviewer",
    displayName: "Reviewer",
    stem: "03-reviewer",
    instructionFile: "reviewer.md",
  },
  {
    step: 4,
    role: "worker",
    displayName: "Worker",
    stem: "04-worker",
    instructionFile: "worker.md",
  },
  {
    step: 5,
    role: "debugger",
    displayName: "Debugger",
    stem: "05-debugger",
    instructionFile: "debugger.md",
  },
  {
    step: 6,
    role: "integrator-c",
    displayName: "Integrator-C",
    stem: "06-integrator-c",
    instructionFile: "integrator-c.md",
  },
];

const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(runtimeDir, "..");

function toWorkspacePath(absolutePath: string): string {
  return path.relative(workspaceRoot, absolutePath).replace(/\\/g, "/");
}

function createRunId(date = new Date()): string {
  const pad = (value: number, length = 2) => String(value).padStart(length, "0");
  const datePart = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("");
  const timePart = [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
  const millis = pad(date.getMilliseconds(), 3);

  return `${datePart}-${timePart}-${millis}`;
}

async function createUniqueRunFolder(): Promise<{
  runId: string;
  runFolder: string;
}> {
  const runsRoot = path.join(workspaceRoot, "runs");

  await mkdir(runsRoot, { recursive: true });

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const runId =
      attempt === 0 ? createRunId() : `${createRunId()}-${String(attempt)}`;
    const runFolder = path.join(runsRoot, runId);

    try {
      await mkdir(runFolder, { recursive: false });
      return { runId, runFolder };
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code !== "EEXIST") {
        throw error;
      }
    }
  }

  throw new Error("Unable to create a unique run folder after 100 attempts.");
}

async function writeRunLog(runFolder: string, runLog: RunLog): Promise<void> {
  runLog.last_updated_at = new Date().toISOString();
  await writeFile(
    path.join(runFolder, "run.json"),
    `${JSON.stringify(runLog, null, 2)}\n`,
    "utf8",
  );
}

type WorkerArtifact = {
  relativePath: string;
  content: string;
};

function buildRuntimeContext(input: {
  runFolder: string;
  role: RoleDefinition;
  flowPath: string | null;
  profilePath: string | null;
  humanNote: null | {
    path: string;
    content: string;
  };
  sourceContext?: string | null;
}): string {
  const runFolderPath = toWorkspacePath(input.runFolder);
  const workerArtifactFolder = toWorkspacePath(
    path.join(input.runFolder, "worker_artifacts"),
  );
  const flowPart = input.flowPath ? ` --flow ${input.flowPath}` : "";
  const profilePart = input.profilePath ? ` --profile ${input.profilePath}` : "";
  const reviewerResumeCommand = `npm.cmd run workflow -- --resume ${runFolderPath} --from designer${flowPart}${profilePart}`;
  const workerResumeCommand = `npm.cmd run workflow -- --resume ${runFolderPath} --from worker${flowPart}${profilePart}`;
  const sharedContext = [
    `Run folder: ${runFolderPath}`,
    `Flow path: ${input.flowPath ?? "default-v0"}`,
    `Executor profile path: ${input.profilePath ?? "none"}`,
    `Reviewer rework resume command: ${reviewerResumeCommand}`,
    `Debugger rework resume command: ${workerResumeCommand}`,
    `Worker artifact sandbox: ${workerArtifactFolder}`,
    input.humanNote
      ? `HumanGate Note Path: ${input.humanNote.path}`
      : "HumanGate Note: Not provided.",
    input.humanNote
      ? `HumanGate Note:\n${input.humanNote.content.trim()}`
      : "No HumanGate clarification is available for this run.",
  ];

  if (input.role.role !== "worker") {
    return [
      ...sharedContext,
      "Only the Worker role may request artifact materialization.",
    ].join("\n");
  }

  return [
    ...sharedContext,
    "To create physical files, include markdown code blocks using this shape:",
    '```artifact path="relative/path/from/worker_artifacts"',
    "file content",
    "```",
    "If the file content itself contains markdown code fences, use a longer artifact fence such as:",
    '````artifact path="relative/path/from/worker_artifacts"',
    "file content that may contain ``` fenced blocks",
    "````",
    "Artifact paths must be relative and must stay inside the worker artifact sandbox.",
    input.sourceContext?.trim()
      ? `\n## Worker Source Context\n\n${input.sourceContext.trim()}`
      : "\n## Worker Source Context\n\nNo source files were injected. If implementation needs repository files, request HumanGate source context.",
  ].join("\n");
}

async function buildWorkerSourceContext(input: {
  role: RoleDefinition;
  humanNote: null | {
    path: string;
    content: string;
  };
}): Promise<string | null> {
  if (input.role.role !== "worker" || !input.humanNote) {
    return null;
  }

  const requestedPaths = [
    ...new Set(
      [...input.humanNote.content.matchAll(/runtime\/[A-Za-z0-9_.\/-]+\.ts/g)]
        .map((match) => match[0])
        .filter((filePath) => !filePath.includes("..")),
    ),
  ];
  if (requestedPaths.length === 0) {
    return null;
  }

  const sections: string[] = [];
  for (const requestedPath of requestedPaths) {
    const absolutePath = path.resolve(workspaceRoot, requestedPath);
    if (!absolutePath.startsWith(workspaceRoot)) {
      continue;
    }
    const content = await readFile(absolutePath, "utf8");
    sections.push(
      [
        `### ${requestedPath}`,
        "",
        "```typescript",
        content.trimEnd(),
        "```",
      ].join("\n"),
    );
  }

  return sections.length > 0 ? sections.join("\n\n---\n\n") : null;
}

function parseWorkerArtifacts(output: string): WorkerArtifact[] {
  const artifacts: WorkerArtifact[] = [];
  const artifactPattern =
    /^(`{3,})artifact\s+path=(?:"([^"]+)"|'([^']+)'|([^\s]+))\s*\r?\n([\s\S]*?)^\1\s*$/gm;
  let match: RegExpExecArray | null;

  while ((match = artifactPattern.exec(output)) !== null) {
    artifacts.push({
      relativePath: match[2] || match[3] || match[4],
      content: match[5],
    });
  }

  return artifacts;
}

function resolveArtifactPath(
  artifactRoot: string,
  relativePath: string,
): string {
  const normalizedRelativePath = relativePath.replace(/\\/g, "/").trim();

  if (
    !normalizedRelativePath ||
    normalizedRelativePath.startsWith("/") ||
    normalizedRelativePath.includes("\0") ||
    path.isAbsolute(normalizedRelativePath)
  ) {
    throw new Error(`Invalid worker artifact path: ${relativePath}`);
  }

  const resolvedPath = path.resolve(artifactRoot, normalizedRelativePath);
  const relativeToRoot = path.relative(artifactRoot, resolvedPath);

  if (
    relativeToRoot === "" ||
    relativeToRoot.startsWith("..") ||
    path.isAbsolute(relativeToRoot)
  ) {
    throw new Error(`Worker artifact path escapes sandbox: ${relativePath}`);
  }

  return resolvedPath;
}

async function materializeWorkerArtifacts(input: {
  output: string;
  runFolder: string;
}): Promise<{
  output: string;
  artifactPaths: string[];
}> {
  const artifacts = parseWorkerArtifacts(input.output);
  const artifactRoot = path.join(input.runFolder, "worker_artifacts");
  const artifactPaths: string[] = [];

  if (artifacts.length === 0) {
    return {
      output: [
        input.output.trimEnd(),
        "",
        "## Runtime Artifact Materialization",
        "",
        `- Sandbox: ${toWorkspacePath(artifactRoot)}`,
        "- Files written: none",
        "- Reason: no artifact blocks were found in Worker output.",
        "",
      ].join("\n"),
      artifactPaths,
    };
  }

  await mkdir(artifactRoot, { recursive: true });

  for (const artifact of artifacts) {
    const artifactPath = resolveArtifactPath(
      artifactRoot,
      artifact.relativePath,
    );

    await mkdir(path.dirname(artifactPath), { recursive: true });
    await writeFile(artifactPath, artifact.content, "utf8");
    artifactPaths.push(toWorkspacePath(artifactPath));
  }

  return {
    output: [
      input.output.trimEnd(),
      "",
      "## Runtime Artifact Materialization",
      "",
      `- Sandbox: ${toWorkspacePath(artifactRoot)}`,
      "- Files written:",
      ...artifactPaths.map((artifactPath) => `  - ${artifactPath}`),
      "",
    ].join("\n"),
    artifactPaths,
  };
}

function usage(): string {
  return [
    "Usage:",
    "  npm run workflow -- input/request.md [--executor mock|codex|claude|gemini] [--external-role pm] [--flow runtime/flows/ai-business-os-mini-v1.json] [--profile runtime/profiles/ai-business-os-starter-v1.json]",
    "  npm run workflow -- --resume runs/<run_id> --from <role> [--human-note input/human-note.md] [--executor mock|codex|claude|gemini] [--external-role pm] [--flow runtime/flows/ai-business-os-mini-v1.json] [--profile runtime/profiles/ai-business-os-starter-v1.json]",
  ].join("\n");
}

function parseExecutorName(value: string | undefined): ExecutorName {
  const executor = value || "mock";

  if (
    executor === "mock" ||
    executor === "codex" ||
    executor === "claude" ||
    executor === "gemini"
  ) {
    return executor;
  }

  throw new Error(
    `Unknown executor "${executor}". Valid executors: mock, codex, claude, gemini`,
  );
}

function parseCliArgs(args: string[]): CliOptions {
  const executorIndex = args.indexOf("--executor");
  if (executorIndex >= 0 && !args[executorIndex + 1]) {
    throw new Error(`--executor requires a value. ${usage()}`);
  }
  const executor = parseExecutorName(
    executorIndex >= 0 ? args[executorIndex + 1] : process.env.AI_EXECUTOR,
  );
  const externalRoleIndex = args.indexOf("--external-role");
  const rawExternalRole =
    externalRoleIndex >= 0
      ? args[externalRoleIndex + 1]
      : process.env.AI_EXTERNAL_ROLE || "pm";
  if (!rawExternalRole) {
    throw new Error(`--external-role requires a role name. ${usage()}`);
  }
  const externalRole = findRole(rawExternalRole).role;
  const flowIndex = args.indexOf("--flow");
  if (flowIndex >= 0 && !args[flowIndex + 1]) {
    throw new Error(`--flow requires a path. ${usage()}`);
  }
  const flowPath =
    flowIndex >= 0 ? args[flowIndex + 1] : process.env.AI_WORKFLOW_FLOW || null;
  const profileIndex = args.indexOf("--profile");
  if (profileIndex >= 0 && !args[profileIndex + 1]) {
    throw new Error(`--profile requires a path. ${usage()}`);
  }
  const profilePath =
    profileIndex >= 0
      ? args[profileIndex + 1]
      : process.env.AI_WORKFLOW_PROFILE || null;
  const humanNoteIndex = args.indexOf("--human-note");
  if (humanNoteIndex >= 0 && !args[humanNoteIndex + 1]) {
    throw new Error(`--human-note requires a path. ${usage()}`);
  }
  const humanNotePath =
    humanNoteIndex >= 0 ? args[humanNoteIndex + 1] : null;
  const positionalArgs = args.filter((_, index) => {
    const previous = args[index - 1];

    return (
      args[index] !== "--executor" &&
      args[index] !== "--external-role" &&
      args[index] !== "--flow" &&
      args[index] !== "--profile" &&
      args[index] !== "--human-note" &&
      previous !== "--executor" &&
      previous !== "--external-role" &&
      previous !== "--flow" &&
      previous !== "--profile" &&
      previous !== "--human-note"
    );
  });

  if (positionalArgs[0] === "--resume") {
    const resumeTarget = positionalArgs[1];
    const fromIndex = positionalArgs.indexOf("--from");
    const fromRole =
      fromIndex >= 0 ? positionalArgs[fromIndex + 1] : undefined;

    if (!resumeTarget || !fromRole) {
      throw new Error(`Resume target and --from role are required. ${usage()}`);
    }

    return {
      mode: "resume",
      resumeTarget,
      fromRole,
      executor,
      externalRole,
      flowPath,
      profilePath,
      humanNotePath,
    };
  }

  const inputArg = positionalArgs[0];

  if (!inputArg) {
    throw new Error(`Input path is required. ${usage()}`);
  }

  return {
    mode: "new",
    inputArg,
    executor,
    externalRole,
    flowPath,
    profilePath,
    humanNotePath,
  };
}

function resolveRunFolder(resumeTarget: string): string {
  const normalizedTarget = resumeTarget.replace(/\\/g, "/");
  const looksLikePath =
    normalizedTarget.includes("/") || path.isAbsolute(resumeTarget);

  return looksLikePath
    ? path.resolve(workspaceRoot, resumeTarget)
    : path.join(workspaceRoot, "runs", resumeTarget);
}

function findRole(roleName: string): RoleDefinition {
  return findRoleInSequence(roleName, roleSequence);
}

function findRoleInSequence(
  roleName: string,
  roles: RoleDefinition[],
): RoleDefinition {
  const normalizedRoleName = roleName.toLowerCase();
  const role = roles.find(
    (entry) =>
      entry.role === normalizedRoleName ||
      entry.displayName.toLowerCase() === normalizedRoleName,
  );

  if (!role) {
    throw new Error(
      `Unknown role "${roleName}". Valid roles: ${roles
        .map((entry) => entry.role)
        .join(", ")}`,
    );
  }

  return role;
}

async function readPromptTemplate(): Promise<string> {
  try {
    return await readFile(
      path.join(runtimeDir, "templates", "role-run.md"),
      "utf8",
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to read prompt template: ${message}`);
  }
}

function validateFlowSteps(steps: RoleDefinition[]): RoleDefinition[] {
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error("Flow must include at least one step.");
  }

  return steps.map((step, index) => {
    const expectedStep = index + 1;

    if (step.step !== expectedStep) {
      throw new Error(
        `Flow step order must be sequential. Expected step ${expectedStep}, got ${step.step}.`,
      );
    }

    if (!step.role || !step.displayName || !step.stem || !step.instructionFile) {
      throw new Error(`Flow step ${expectedStep} is missing required fields.`);
    }

    if (step.executor !== undefined) {
      parseExecutorName(step.executor);
    }

    return {
      ...step,
      role: step.role.toLowerCase(),
    };
  });
}

async function readFlowDefinition(flowPath: string | null): Promise<{
  flowId: string;
  flowPath: string | null;
  roles: RoleDefinition[];
}> {
  if (!flowPath) {
    return {
      flowId: "default-v0",
      flowPath: null,
      roles: roleSequence,
    };
  }

  const absoluteFlowPath = path.resolve(workspaceRoot, flowPath);
  const rawFlow = await readFile(absoluteFlowPath, "utf8");
  const flow = JSON.parse(rawFlow) as FlowDefinition;

  if (!flow.flow_id) {
    throw new Error(`Flow file "${flowPath}" is missing flow_id.`);
  }

  return {
    flowId: flow.flow_id,
    flowPath: toWorkspacePath(absoluteFlowPath),
    roles: validateFlowSteps(flow.steps),
  };
}

async function readExecutorProfile(
  profilePath: string | null,
): Promise<{
  profileId: string | null;
  profilePath: string | null;
  profile: ExecutorProfile | null;
}> {
  if (!profilePath) {
    return {
      profileId: null,
      profilePath: null,
      profile: null,
    };
  }

  const absoluteProfilePath = path.resolve(workspaceRoot, profilePath);
  const rawProfile = await readFile(absoluteProfilePath, "utf8");
  const profile = JSON.parse(rawProfile) as ExecutorProfile;

  if (!profile.profile_id) {
    throw new Error(`Executor profile "${profilePath}" is missing profile_id.`);
  }
  if (!profile.assignments || typeof profile.assignments !== "object") {
    throw new Error(
      `Executor profile "${profilePath}" is missing assignments.`,
    );
  }

  for (const [roleName, executor] of Object.entries(profile.assignments)) {
    try {
      parseExecutorName(executor);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Executor profile "${profilePath}" has invalid executor for role "${roleName}": ${message}`,
      );
    }
  }

  return {
    profileId: profile.profile_id,
    profilePath: toWorkspacePath(absoluteProfilePath),
    profile,
  };
}

async function readHumanRequest(inputArg: string): Promise<{
  inputPath: string;
  humanRequest: string;
}> {
  const inputPath = path.resolve(workspaceRoot, inputArg);

  try {
    return {
      inputPath,
      humanRequest: await readFile(inputPath, "utf8"),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to read input file "${inputArg}": ${message}`);
  }
}

async function readHumanNote(
  humanNotePath: string | null,
): Promise<null | {
  path: string;
  content: string;
}> {
  if (!humanNotePath) {
    return null;
  }

  const absoluteHumanNotePath = path.resolve(workspaceRoot, humanNotePath);

  try {
    return {
      path: toWorkspacePath(absoluteHumanNotePath),
      content: await readFile(absoluteHumanNotePath, "utf8"),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Unable to read human note file "${humanNotePath}": ${message}`,
    );
  }
}

function hasReworkResult(output: string): boolean {
  return /^Result:\s*REWORK\s*$/im.test(output);
}

function roleTriggersHumanGate(role: RoleDefinition): boolean {
  return role.role === "reviewer" || role.role === "debugger";
}

function buildRuntimeHumanGate(input: {
  role: RoleDefinition;
  runFolder: string;
  flowPath: string | null;
  profilePath: string | null;
}): string {
  const runFolderPath = toWorkspacePath(input.runFolder);
  const flowPart = input.flowPath ? ` --flow ${input.flowPath}` : "";
  const profilePart = input.profilePath ? ` --profile ${input.profilePath}` : "";
  const resumeFrom = input.role.role === "reviewer" ? "designer" : "worker";
  const humanNotePath =
    input.role.role === "reviewer"
      ? "input/humangate-reviewer-approval.md"
      : "input/humangate-debugger-fix.md";
  const resumeCommand =
    `npm.cmd run workflow -- --resume ${runFolderPath} --from ${resumeFrom} --human-note ${humanNotePath}${flowPart}${profilePart}`;
  const reason =
    input.role.role === "reviewer"
      ? "仕様または受け入れ条件に不足があるため、Designerに戻して設計をやり直す必要があります。"
      : "Workerの成果物または検証結果に問題があるため、Workerに戻して修正する必要があります。";

  return [
    "## Runtime HumanGate",
    "",
    "### 日本語サマリー",
    "",
    reason,
    "",
    "### 人間に判断してほしいこと",
    "",
    "- この差し戻し理由を受け入れるか。",
    "- 追記するHumanGateメモの内容が十分か。",
    "- resumeして次のロールから再開してよいか。",
    "",
    "### 推奨アクション",
    "",
    "- HumanGateメモを確認または編集する。",
    "- 問題なければ以下のResume Commandで再開する。",
    "",
    "### Resume Command",
    "",
    "```powershell",
    resumeCommand,
    "```",
    "",
  ].join("\n");
}

async function readRunLog(runFolder: string): Promise<RunLog> {
  const rawRunLog = await readFile(path.join(runFolder, "run.json"), "utf8");
  const runLog = JSON.parse(rawRunLog) as RunLog;

  runLog.resume_history ??= [];
  runLog.executor ??= "mock";
  runLog.external_role ??= "pm";
  runLog.flow_id ??= "default-v0";
  runLog.flow_path ??= null;
  runLog.profile_id ??= null;
  runLog.profile_path ??= null;
  runLog.human_note_path ??= null;

  return runLog;
}

async function collectPreviousOutputs(
  runLog: RunLog,
  roleDefinitions: RoleDefinition[],
  startStep: number,
): Promise<PreviousRoleOutput[]> {
  const previousOutputs: PreviousRoleOutput[] = [];

  for (const role of roleDefinitions.filter((entry) => entry.step < startStep)) {
    const roleRecord = runLog.roles.find((entry) => entry.role === role.role);

    if (!roleRecord || roleRecord.status !== "completed") {
      throw new Error(
        `Cannot resume from step ${startStep}; prior role "${role.role}" is not completed.`,
      );
    }

    if (!roleRecord.output_path) {
      throw new Error(
        `Cannot resume from step ${startStep}; prior role "${role.role}" has no output_path.`,
      );
    }

    previousOutputs.push({
      role: role.displayName,
      output: await readFile(path.resolve(workspaceRoot, roleRecord.output_path), "utf8"),
    });
  }

  return previousOutputs;
}

function prepareRunLogForResume(
  runLog: RunLog,
  fromRole: RoleDefinition,
  totalSteps: number,
): void {
  runLog.status = "running";
  runLog.current_role = null;
  runLog.failed_step = null;
  runLog.final_output_path = null;
  runLog.error = null;
  runLog.finished_at = null;
  runLog.roles = runLog.roles.filter((entry) => entry.step < fromRole.step);
  runLog.completed_steps = runLog.roles.filter(
    (entry) => entry.status === "completed",
  ).length;
  runLog.total_steps = totalSteps;
  runLog.resume_history ??= [];
  runLog.resume_history.push({
    from_role: fromRole.role,
    resumed_at: new Date().toISOString(),
  });
}

function getExecutorForRole(
  role: RoleDefinition,
  options: CliOptions,
  profile: ExecutorProfile | null,
): ExecutorName {
  const profileExecutor = profile?.assignments[role.role];
  if (profileExecutor) {
    return profileExecutor;
  }

  if (role.executor) {
    return role.executor;
  }

  return options.executor !== "mock" && role.role === options.externalRole
    ? options.executor
    : "mock";
}

async function main(): Promise<void> {
  const options = parseCliArgs(process.argv.slice(2));
  const flowDefinition = await readFlowDefinition(options.flowPath);
  const profileDefinition = await readExecutorProfile(options.profilePath);
  const activeRoleSequence = flowDefinition.roles;
  const promptTemplate = await readPromptTemplate();
  let runFolder: string;
  let runLog: RunLog;
  let humanRequest: string;
  let humanNote: Awaited<ReturnType<typeof readHumanNote>>;
  let previousOutputs: PreviousRoleOutput[];
  let rolesToRun: RoleDefinition[];

  if (options.mode === "new") {
    const input = await readHumanRequest(options.inputArg);
    const { runId, runFolder: newRunFolder } = await createUniqueRunFolder();
    const startedAt = new Date().toISOString();

    runFolder = newRunFolder;
    humanRequest = input.humanRequest;
    humanNote = await readHumanNote(options.humanNotePath);
    previousOutputs = [];
    rolesToRun = activeRoleSequence;
    runLog = {
      run_id: runId,
      workflow_version: "v0",
      flow_id: flowDefinition.flowId,
      flow_path: flowDefinition.flowPath,
      profile_id: profileDefinition.profileId,
      profile_path: profileDefinition.profilePath,
      human_note_path: humanNote?.path ?? null,
      input_path: toWorkspacePath(input.inputPath),
      run_folder: toWorkspacePath(runFolder),
      executor: options.executor,
      external_role: options.externalRole,
      status: "running",
      current_role: null,
      total_steps: activeRoleSequence.length,
      completed_steps: 0,
      failed_step: null,
      roles: [],
      final_output_path: null,
      error: null,
      resume_history: [],
      started_at: startedAt,
      finished_at: null,
      last_updated_at: startedAt,
    };
  } else {
    runFolder = resolveRunFolder(options.resumeTarget);
    runLog = await readRunLog(runFolder);
    runLog.flow_id = flowDefinition.flowId;
    runLog.flow_path = flowDefinition.flowPath;
    runLog.profile_id = profileDefinition.profileId;
    runLog.profile_path = profileDefinition.profilePath;
    humanNote = await readHumanNote(options.humanNotePath);
    runLog.human_note_path = humanNote?.path ?? null;
    runLog.executor = options.executor;
    runLog.external_role = options.externalRole;

    const fromRole = findRoleInSequence(options.fromRole, activeRoleSequence);
    const input = await readHumanRequest(runLog.input_path);

    humanRequest = input.humanRequest;
    previousOutputs = await collectPreviousOutputs(
      runLog,
      activeRoleSequence,
      fromRole.step,
    );
    prepareRunLogForResume(runLog, fromRole, activeRoleSequence.length);
    rolesToRun = activeRoleSequence.filter((entry) => entry.step >= fromRole.step);
  }

  await writeRunLog(runFolder, runLog);

  try {
    for (const role of rolesToRun) {
      runLog.current_role = role.role;

      const promptPath = path.join(runFolder, `${role.stem}.prompt.md`);
      const outputPath = path.join(runFolder, `${role.stem}.output.md`);
      const roleStartedAt = Date.now();
      const executorForRole = getExecutorForRole(
        role,
        options,
        profileDefinition.profile,
      );
      const roleRecord: RunRoleRecord = {
        step: role.step,
        role: role.role,
        executor: executorForRole,
        status: "running",
        prompt_path: null,
        output_path: null,
        started_at: new Date(roleStartedAt).toISOString(),
        finished_at: null,
        duration_ms: null,
      };

      runLog.roles.push(roleRecord);
      await writeRunLog(runFolder, runLog);

      const roleInstruction = await readFile(
        path.join(runtimeDir, "roles", role.instructionFile),
        "utf8",
      );
      const sourceContext = await buildWorkerSourceContext({
        role,
        humanNote,
      });
      const prompt = buildRolePrompt({
        roleName: role.displayName,
        roleInstruction,
        promptTemplate,
        humanRequest,
        previousOutputs,
        runtimeContext: buildRuntimeContext({
          runFolder,
          role,
          flowPath: flowDefinition.flowPath,
          profilePath: profileDefinition.profilePath,
          humanNote,
          sourceContext,
        }),
      });

      await writeFile(promptPath, prompt, "utf8");
      roleRecord.prompt_path = toWorkspacePath(promptPath);

      const rawOutput = await executeRole({
        roleName: role.displayName,
        prompt,
        previousOutputCount: previousOutputs.length,
        executor: executorForRole,
        workspaceRoot,
      });
      let { output, artifactPaths } =
        role.role === "worker" && flowDefinition.flowId !== "default-v0"
          ? await materializeWorkerArtifacts({
              output: rawOutput,
              runFolder,
            })
          : { output: rawOutput, artifactPaths: [] };

      if (roleTriggersHumanGate(role) && hasReworkResult(output)) {
        output = [
          output.trimEnd(),
          "",
          buildRuntimeHumanGate({
            role,
            runFolder,
            flowPath: flowDefinition.flowPath,
            profilePath: profileDefinition.profilePath,
          }),
        ].join("\n");
      }

      await writeFile(outputPath, output, "utf8");
      roleRecord.output_path = toWorkspacePath(outputPath);
      roleRecord.artifact_paths = artifactPaths;
      previousOutputs.push({ role: role.displayName, output });
      roleRecord.status = "completed";
      roleRecord.finished_at = new Date().toISOString();
      roleRecord.duration_ms = Date.now() - roleStartedAt;
      runLog.completed_steps = runLog.roles.filter(
        (entry) => entry.status === "completed",
      ).length;
      await writeRunLog(runFolder, runLog);

      if (roleTriggersHumanGate(role) && hasReworkResult(output)) {
        runLog.status = "human_gate";
        runLog.final_output_path = roleRecord.output_path;
        runLog.finished_at = new Date().toISOString();
        await writeRunLog(runFolder, runLog);
        console.log(toWorkspacePath(runFolder));
        return;
      }
    }

    runLog.status = "completed";
    runLog.final_output_path = runLog.roles.at(-1)?.output_path ?? null;
    runLog.finished_at = new Date().toISOString();
    await writeRunLog(runFolder, runLog);
    console.log(toWorkspacePath(runFolder));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const failedRole = runLog.current_role;
    const currentRoleRecord = runLog.roles.find(
      (entry) => entry.role === failedRole,
    );

    if (currentRoleRecord) {
      currentRoleRecord.status = "failed";
      currentRoleRecord.finished_at = new Date().toISOString();
      currentRoleRecord.duration_ms =
        Date.parse(currentRoleRecord.finished_at) -
        Date.parse(currentRoleRecord.started_at);
      runLog.failed_step = currentRoleRecord.step;
    }

    runLog.status = "failed";
    runLog.completed_steps = runLog.roles.filter(
      (entry) => entry.status === "completed",
    ).length;
    runLog.error = {
      role: failedRole,
      message: `Role ${failedRole ?? "unknown"} failed: ${message}`,
    };
    runLog.finished_at = new Date().toISOString();
    await writeRunLog(runFolder, runLog);

    console.error(`Workflow failed in ${failedRole ?? "unknown role"}.`);
    console.error(message);
    console.error(`Run folder: ${toWorkspacePath(runFolder)}`);
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});

"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Provider = "openai" | "anthropic" | "gemini" | "groq" | "together";
type ColumnId = string;

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type Attachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
};

type ColumnTurn = {
  id: string;
  prompt: string;
  answer: string;
  done: boolean;
};

type SelectedReference = {
  key: ColumnId;
  id: string;
};

type StreamEvent =
  | { type: "delta"; provider: ColumnId; text: string }
  | { type: "done"; provider: ColumnId }
  | { type: "error"; provider: ColumnId; message: string };

type ModelCatalog = Record<Provider, string[]>;

type ColumnConfig = {
  id: ColumnId;
  label: string;
  provider: Provider;
  model: string;
  systemPrompt: string;
};

// Legacy Flow types (旧式)
type FlowStep = {
  id: string;
  name: string;
  from: string;
  to: string;
  mode: "manual";
  instruction?: string;
};

type LegacyFlowDefinition = {
  id: string;
  name: string;
  description?: string;
  steps: FlowStep[];
};

// v1.4 Flow types
type FlowRoleBinding = {
  type: "column" | "external";
  column_id?: string;
  allow_shared_column?: boolean;
  tool?: string;
  handoff?: string;
  send_api_request?: boolean;
  output_return?: string;
};

type FlowStepV14 = {
  id: string;
  name?: string;
  type?: string;
  route_context?: string;
  from?: string | string[];
  to?: string | string[];
  state_from?: string;
  state_to?: string;
  human_gate?: boolean;
  join?: string;
  decision_key?: string;
  template_ref?: string;
  instruction?: string;
  condition?: string;
  branches?: Record<string, unknown>;
};

type FlowDefinitionV14 = {
  id: string;
  name: string;
  version?: string;
  source_spec?: string;
  description?: string;
  role_bindings?: Record<string, FlowRoleBinding>;
  states?: string[];
  route_contexts?: string[];
  review_decision?: Record<string, string>;
  templates?: Record<string, unknown>;
  external_role_policy?: Record<string, unknown>;
  main_flow?: FlowStepV14[];
  feedback_flow?: {
    entry?: string;
    state_from?: string;
    required_inputs?: string[];
    cause_classification?: string[];
    secondary_causes?: string[];
    max_iterations?: number;
    loop_exit_condition?: string;
    verified_transition?: Record<string, unknown>;
    branches?: Record<
      string,
      {
        description?: string;
        route_context?: string;
        loop?: boolean;
        max_iterations?: number;
        condition?: string;
        state_rollback_to?: string;
        fallback?: Record<string, unknown>;
        flow?: FlowStepV14[];
      }
    >;
  };
  orchestration?: {
    rules?: string[];
    state_routing?: Array<{
      state: string;
      route_context: string;
      next: string[];
    }>;
  };
};

// Union type for both legacy and v1.4
type FlowDefinition = LegacyFlowDefinition | FlowDefinitionV14;

// Resolved step type with template expansion metadata
type ResolvedFlowStepV14 = FlowStepV14 & {
  template_unresolved?: boolean;
};

type ControlCause = "implementation" | "specification" | "environment";

type ControlReviewDecision = {
  verified: boolean;
  cause?: ControlCause;
  reason?: string;
};

type ControlRuntimeResolution =
  | {
      kind: "verified";
      state_from?: string;
      state_to?: string;
      route_context_reset?: string;
      nextStepId?: string;
      unresolvedReason?: undefined;
    }
  | {
      kind: "feedback_branch";
      branchKey: ControlCause;
      route_context?: string;
      state_rollback_to?: string;
      firstStepId?: string;
      firstStep?: ResolvedFlowStepV14;
      unresolvedReason?: undefined;
    }
  | {
      kind: "unresolved";
      unresolvedReason: string;
    }
  | {
      kind: "not_applicable";
      unresolvedReason?: undefined;
    };

const DEFAULT_PAGE_SIZE = 4;
const MAX_COLUMNS = 10;
const MIN_COLUMNS = 1;
const APP_VERSION = "v0.17.0-flow-ui";

const providerLabels: Record<Provider, string> = {
  openai: "OpenAI",
  anthropic: "Claude",
  gemini: "Gemini",
  groq: "Groq",
  together: "Together AI",
};

const fallbackModelCatalog: ModelCatalog = {
  openai: ["gpt-4o-mini", "gpt-4.1-mini"],
  anthropic: ["claude-haiku-4-5", "claude-sonnet-4-5"],
  gemini: ["gemini-2.5-flash", "gemini-2.5-pro"],
  groq: ["llama-3.1-8b-instant"],
  together: ["meta-llama/Llama-3.3-70B-Instruct-Turbo", "openai/gpt-oss-20b"],
};

const defaultColumns: ColumnConfig[] = [
  { id: "col1", label: "Column 1", provider: "openai", model: "gpt-4o-mini", systemPrompt: "" },
  { id: "col2", label: "Column 2", provider: "anthropic", model: "claude-haiku-4-5", systemPrompt: "" },
  { id: "col3", label: "Column 3", provider: "gemini", model: "gemini-2.5-flash", systemPrompt: "" },
  { id: "col4", label: "Column 4", provider: "groq", model: "llama-3.1-8b-instant", systemPrompt: "" },
  { id: "col5", label: "Column 5", provider: "together", model: "meta-llama/Llama-3.3-70B-Instruct-Turbo", systemPrompt: "" },
];

const defaultFlows: FlowDefinition[] = [
  {
    id: "ai-business-os-basic",
    name: "AI Business OS Basic",
    description: "Human → PM → Designer → Reviewer → Integrator-S → Worker → Debugger/Infra+Human → Integrator-C",
    steps: [
      { id: "step-1", name: "Human to PM", from: "Human", to: "PM", mode: "manual", instruction: "Human inputをPMへ投入する。" },
      { id: "step-2", name: "PM to Designer", from: "PM", to: "Designer", mode: "manual", instruction: "PM出力をDesigner入力として渡す。" },
      { id: "step-3", name: "Designer to Reviewer", from: "Designer", to: "Reviewer", mode: "manual", instruction: "Designer出力をReviewer入力として渡す。" },
      { id: "step-4", name: "Reviewer to Integrator-S", from: "Reviewer", to: "Integrator-S", mode: "manual", instruction: "Reviewer出力を構造化担当へ渡す。" },
      { id: "step-5", name: "Integrator-S to Worker", from: "Integrator-S", to: "Worker", mode: "manual", instruction: "構造化された指示をWorkerへ渡す。" },
      { id: "step-6", name: "Worker to Debugger", from: "Worker", to: "Debugger", mode: "manual", instruction: "Worker成果物をDebuggerへ渡す。" },
      { id: "step-7", name: "Debugger to Integrator-C", from: "Debugger", to: "Integrator-C", mode: "manual", instruction: "検証結果を制御担当へ渡す。" }
    ]
  }
];

function createEmptyHistories(columns: ColumnConfig[]): Record<ColumnId, ColumnTurn[]> {
  return Object.fromEntries(columns.map((column) => [column.id, []]));
}

function normalizeCatalog(value: unknown): ModelCatalog {
  const result: ModelCatalog = { ...fallbackModelCatalog };
  if (!value || typeof value !== "object") return result;

  for (const provider of Object.keys(result) as Provider[]) {
    const maybeList = (value as Partial<ModelCatalog>)[provider];
    if (Array.isArray(maybeList)) {
      const list = maybeList.map((item) => String(item).trim()).filter(Boolean);
      if (list.length) result[provider] = list;
    }
  }
  return result;
}

// Type guards for Flow definitions
function isFlowV14(flow: FlowDefinition): flow is FlowDefinitionV14 {
  return "main_flow" in flow || "feedback_flow" in flow || "role_bindings" in flow;
}

function isLegacyFlow(flow: FlowDefinition): flow is LegacyFlowDefinition {
  return "steps" in flow && Array.isArray((flow as LegacyFlowDefinition).steps);
}

function normalizeFlows(value: unknown): FlowDefinition[] {
  if (!Array.isArray(value)) return defaultFlows;

  const flows = value
    .map((flow, flowIndex) => {
      if (!flow || typeof flow !== "object") return null;
      const raw = flow as Record<string, unknown>;

      // Try to detect v1.4 format
      if ("main_flow" in raw || "feedback_flow" in raw || "role_bindings" in raw) {
        // v1.4 format
        const v14: FlowDefinitionV14 = {
          id: String(raw.id || `flow-${flowIndex + 1}`),
          name: String(raw.name || `Flow ${flowIndex + 1}`),
          version: raw.version ? String(raw.version) : undefined,
          source_spec: raw.source_spec ? String(raw.source_spec) : undefined,
          description: raw.description ? String(raw.description) : undefined,
          role_bindings: raw.role_bindings && typeof raw.role_bindings === "object" ? (raw.role_bindings as Record<string, FlowRoleBinding>) : undefined,
          states: Array.isArray(raw.states) ? raw.states.map((s) => String(s)) : undefined,
          route_contexts: Array.isArray(raw.route_contexts) ? raw.route_contexts.map((c) => String(c)) : undefined,
          review_decision: raw.review_decision && typeof raw.review_decision === "object" ? (raw.review_decision as Record<string, string>) : undefined,
          templates: raw.templates && typeof raw.templates === "object" ? (raw.templates as Record<string, unknown>) : undefined,
          external_role_policy: raw.external_role_policy && typeof raw.external_role_policy === "object" ? (raw.external_role_policy as Record<string, unknown>) : undefined,
          main_flow: Array.isArray(raw.main_flow)
            ? (raw.main_flow as Array<Record<string, unknown>>)
                .map((step) => ({
                  id: String(step.id || ""),
                  name: step.name ? String(step.name) : undefined,
                  type: step.type ? String(step.type) : undefined,
                  route_context: step.route_context ? String(step.route_context) : undefined,
                  from: step.from ? (Array.isArray(step.from) ? step.from.map((f) => String(f)) : String(step.from)) : undefined,
                  to: step.to ? (Array.isArray(step.to) ? step.to.map((t) => String(t)) : String(step.to)) : undefined,
                  state_from: step.state_from ? String(step.state_from) : undefined,
                  state_to: step.state_to ? String(step.state_to) : undefined,
                  human_gate: step.human_gate ? Boolean(step.human_gate) : undefined,
                  join: step.join ? String(step.join) : undefined,
                  decision_key: step.decision_key ? String(step.decision_key) : undefined,
                  template_ref: step.template_ref ? String(step.template_ref) : undefined,
                  instruction: step.instruction ? String(step.instruction) : undefined,
                  condition: step.condition ? String(step.condition) : undefined,
                  branches: step.branches && typeof step.branches === "object" ? (step.branches as Record<string, unknown>) : undefined,
                }))
                .filter((s) => s.id)
            : undefined,
          feedback_flow: raw.feedback_flow && typeof raw.feedback_flow === "object" ? (raw.feedback_flow as FlowDefinitionV14["feedback_flow"]) : undefined,
          orchestration: raw.orchestration && typeof raw.orchestration === "object" ? (raw.orchestration as FlowDefinitionV14["orchestration"]) : undefined,
        };
        return v14;
      }

      // Legacy format (steps)
      const steps = Array.isArray(raw.steps)
        ? (raw.steps as Array<Record<string, unknown>>)
            .map((step, stepIndex) => {
              if (!step || typeof step !== "object") return null;

              return {
                id: String(step.id || `step-${stepIndex + 1}`),
                name: String(step.name || `Step ${stepIndex + 1}`),
                from: String(step.from || ""),
                to: String(step.to || ""),
                mode: "manual" as const,
                instruction: step.instruction ? String(step.instruction) : "",
              } as FlowStep;
            })
            .filter((step): step is FlowStep => step !== null)
        : [];

      const legacy: LegacyFlowDefinition = {
        id: String(raw.id || `flow-${flowIndex + 1}`),
        name: String(raw.name || `Flow ${flowIndex + 1}`),
        description: raw.description ? String(raw.description) : "",
        steps,
      };

      return legacy;
    })
    .filter((flow): flow is FlowDefinition => Boolean(flow));

  return flows.length ? flows : defaultFlows;
}

// Flow utility functions
function getFlowStepCount(flow: FlowDefinition): number {
  if (isFlowV14(flow)) return flow.main_flow?.length ?? 0;
  if (isLegacyFlow(flow)) return flow.steps.length;
  return 0;
}

function formatFlowEndpoint(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value.join(", ");
  return value || "";
}

// Template reference resolution utilities
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFlowStepLike(value: unknown): value is FlowStepV14 {
  if (!isPlainObject(value)) return false;
  return (
    typeof (value as Record<string, unknown>).id === "string" ||
    typeof (value as Record<string, unknown>).type === "string" ||
    typeof (value as Record<string, unknown>).from === "string" ||
    Array.isArray((value as Record<string, unknown>).from)
  );
}

function resolveTemplateStep(
  step: FlowStepV14,
  templates?: Record<string, unknown>
): ResolvedFlowStepV14 {
  // If no template_ref, return as-is
  if (!step.template_ref) {
    return step;
  }

  // If templates not provided, mark as unresolved
  if (!templates) {
    return { ...step, template_unresolved: true };
  }

  // Get the template
  const template = templates[step.template_ref];

  // If template is not found or not a plain object, mark as unresolved
  if (!isPlainObject(template)) {
    return { ...step, template_unresolved: true };
  }

  // Merge template with step, prioritizing step's explicit values
  const resolved: ResolvedFlowStepV14 = {
    // Start with template properties
    ...(isFlowStepLike(template) ? template : {}),
    // Override with step's explicit values
    ...step,
    // Ensure step's id, name, route_context are always prioritized
    id: step.id,
    ...(step.name !== undefined && { name: step.name }),
    ...(step.route_context !== undefined && { route_context: step.route_context }),
  };

  return resolved;
}

function resolveTemplateSteps(
  steps: FlowStepV14[] | undefined,
  templates?: Record<string, unknown>
): ResolvedFlowStepV14[] {
  if (!Array.isArray(steps)) {
    return [];
  }

  return steps.map((step) => resolveTemplateStep(step, templates));
}

function getResolvedMainFlow(flow: FlowDefinitionV14): ResolvedFlowStepV14[] {
  return resolveTemplateSteps(flow.main_flow, flow.templates);
}

function getResolvedFeedbackBranchFlow(
  flow: FlowDefinitionV14,
  branchKey: string
): ResolvedFlowStepV14[] {
  const branch = flow.feedback_flow?.branches?.[branchKey];
  if (!branch || !Array.isArray(branch.flow)) {
    return [];
  }
  return resolveTemplateSteps(branch.flow, flow.templates);
}

type StateRoutingEntry = {
  state: string;
  route_context: string;
  next: string[];
};

type RoutingResolutionResult = {
  state: string;
  route_context: string;
  nextIds: string[];
  steps: ResolvedFlowStepV14[];
  specialRefs: string[];
  unresolvedNextIds: string[];
};

function getStateRoutingEntries(flow: FlowDefinitionV14): StateRoutingEntry[] {
  const raw = flow.orchestration?.state_routing;
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.reduce<StateRoutingEntry[]>((acc, entry) => {
    if (!isPlainObject(entry)) return acc;
    const state = entry.state;
    const route_context = entry.route_context;
    const next = entry.next;
    if (typeof state !== "string" || typeof route_context !== "string" || !Array.isArray(next)) {
      return acc;
    }

    const nextIds = next.filter((item): item is string => typeof item === "string");
    if (!nextIds.length) return acc;

    acc.push({ state, route_context, next: nextIds });
    return acc;
  }, []);
}

function resolveNextIdsByState(
  flow: FlowDefinitionV14,
  state: string,
  routeContext: string
): string[] {
  const entries = getStateRoutingEntries(flow);
  const match = entries.find(
    (entry) => entry.state === state && entry.route_context === routeContext
  );
  return match ? [...match.next] : [];
}

function getAllResolvedFlowSteps(flow: FlowDefinitionV14): ResolvedFlowStepV14[] {
  const main = getResolvedMainFlow(flow);
  const branchSteps = Object.keys(flow.feedback_flow?.branches ?? {}).flatMap((branchKey) =>
    getResolvedFeedbackBranchFlow(flow, branchKey)
  );

  return [...main, ...branchSteps].filter((step) => !step.template_unresolved);
}

function isSpecialFlowRef(nextId: string): boolean {
  return (
    nextId === "feedback_flow.branches" ||
    nextId === "feedback_flow.verified_transition"
  );
}

function hasControlReviewSpecialRefs(routingResult: RoutingResolutionResult): boolean {
  return routingResult.specialRefs.some(
    (ref) => ref === "feedback_flow.branches" || ref === "feedback_flow.verified_transition"
  );
}

function resolveVerifiedTransition(flow: FlowDefinitionV14): ControlRuntimeResolution {
  const transition = flow.feedback_flow?.verified_transition;
  if (!isPlainObject(transition)) {
    return { kind: "unresolved", unresolvedReason: "verified_transition が未定義またはオブジェクトではありません。" };
  }

  const nextStepId = typeof transition.next_step === "string" ? transition.next_step : undefined;
  const state_from = typeof transition.state_from === "string" ? transition.state_from : undefined;
  const state_to = typeof transition.state_to === "string" ? transition.state_to : undefined;
  const route_context_reset = typeof transition.route_context_reset === "string" ? transition.route_context_reset : undefined;

  if (!nextStepId) {
    return { kind: "unresolved", unresolvedReason: "verified_transition に next_step がありません。" };
  }

  return {
    kind: "verified",
    nextStepId,
    state_from,
    state_to,
    route_context_reset,
  };
}

function resolveFeedbackBranch(
  flow: FlowDefinitionV14,
  cause: ControlCause
): ControlRuntimeResolution {
  const branch = flow.feedback_flow?.branches?.[cause];
  if (!isPlainObject(branch)) {
    return { kind: "unresolved", unresolvedReason: `feedback_flow.branches.${cause} が未定義です。` };
  }

  const resolvedFlow = getResolvedFeedbackBranchFlow(flow, cause);
  const firstStep = resolvedFlow.find((step) => !step.template_unresolved);
  if (!firstStep) {
    return {
      kind: "unresolved",
      unresolvedReason: `feedback_flow.branches.${cause} に有効な先頭stepがありません。`,
    };
  }

  return {
    kind: "feedback_branch",
    branchKey: cause,
    route_context: typeof branch.route_context === "string" ? branch.route_context : undefined,
    state_rollback_to: typeof branch.state_rollback_to === "string" ? branch.state_rollback_to : undefined,
    firstStepId: firstStep.id,
    firstStep,
  };
}

function resolveControlReviewRuntime(
  flow: FlowDefinitionV14,
  routingResult: RoutingResolutionResult,
  decision: ControlReviewDecision
): ControlRuntimeResolution {
  if (!hasControlReviewSpecialRefs(routingResult)) {
    return { kind: "not_applicable" };
  }

  if (decision.verified === true) {
    return resolveVerifiedTransition(flow);
  }

  if (!decision.cause) {
    return { kind: "unresolved", unresolvedReason: "cause が指定されていません。" };
  }

  if (decision.cause === "implementation" || decision.cause === "specification" || decision.cause === "environment") {
    return resolveFeedbackBranch(flow, decision.cause);
  }

  return { kind: "unresolved", unresolvedReason: `不正な cause: ${decision.cause}` };
}

function resolveStepsByIds(
  flow: FlowDefinitionV14,
  nextIds: string[]
): {
  steps: ResolvedFlowStepV14[];
  specialRefs: string[];
  unresolvedNextIds: string[];
} {
  const availableSteps = getAllResolvedFlowSteps(flow);
  const steps: ResolvedFlowStepV14[] = [];
  const specialRefs: string[] = [];
  const unresolvedNextIds: string[] = [];

  for (const nextId of nextIds) {
    if (isSpecialFlowRef(nextId)) {
      specialRefs.push(nextId);
      continue;
    }

    const matched = availableSteps.find((step) => step.id === nextId);
    if (matched) {
      steps.push(matched);
      continue;
    }

    unresolvedNextIds.push(nextId);
  }

  return { steps, specialRefs, unresolvedNextIds };
}

function resolveRouting(
  flow: FlowDefinitionV14,
  state: string,
  routeContext: string
): RoutingResolutionResult {
  const nextIds = resolveNextIdsByState(flow, state, routeContext);
  const resolved = resolveStepsByIds(flow, nextIds);
  return {
    state,
    route_context: routeContext,
    nextIds,
    steps: resolved.steps,
    specialRefs: resolved.specialRefs,
    unresolvedNextIds: resolved.unresolvedNextIds,
  };
}

type FlowPreviewRow = {
  id: string;
  name: string;
  from: string;
  to: string;
  state: string;
  type: string;
};

function getFlowPreviewRows(flow: FlowDefinition): FlowPreviewRow[] {
  if (isFlowV14(flow)) {
    const resolvedSteps = getResolvedMainFlow(flow);
    return resolvedSteps.map((step) => ({
      id: step.id,
      name: step.template_unresolved ? `${step.name || ""} [未解決]` : (step.name || ""),
      from: formatFlowEndpoint(step.from),
      to: formatFlowEndpoint(step.to),
      state: `${step.state_from ? step.state_from : ""} → ${step.state_to ? step.state_to : ""}`.trim(),
      type: step.template_unresolved ? `${step.type || step.route_context || ""} [ref未解決]` : (step.type || step.route_context || ""),
    }));
  }

  if (isLegacyFlow(flow)) {
    return flow.steps.map((step) => ({
      id: step.id,
      name: step.name,
      from: step.from,
      to: step.to,
      state: "",
      type: "",
    }));
  }

  return [];
}

function buildProviderHistories(
  columnHistories: Record<ColumnId, ColumnTurn[]>,
  newPrompt: string,
  columns: ColumnConfig[],
  activeKeys: ColumnId[],
  commonSystemPrompt: string
): Partial<Record<ColumnId, ChatMessage[]>> {
  const result: Partial<Record<ColumnId, ChatMessage[]>> = {};
  const columnMap = new Map(columns.map((column) => [column.id, column]));

  for (const key of activeKeys) {
    const config = columnMap.get(key);
    if (!config) continue;

    result[key] = [];

    const systemMessages = [
      commonSystemPrompt.trim(),
      config.systemPrompt.trim(),
    ].filter(Boolean);

    if (systemMessages.length) {
      result[key]!.push({ role: "system", content: systemMessages.join("\n\n") });
    }

    for (const turn of columnHistories[key] ?? []) {
      result[key]!.push({ role: "user", content: turn.prompt });
      if (turn.answer) result[key]!.push({ role: "assistant", content: turn.answer });
    }
    result[key]!.push({ role: "user", content: newPrompt });
  }

  return result;
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [commonSystemPrompt, setCommonSystemPrompt] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);
  const [columnHistories, setColumnHistories] =
    useState<Record<ColumnId, ColumnTurn[]>>(createEmptyHistories(defaultColumns));
  const [modelCatalog, setModelCatalog] = useState<ModelCatalog>(fallbackModelCatalog);
  const [catalogText, setCatalogText] = useState(JSON.stringify(fallbackModelCatalog, null, 2));
  const [showModelSettings, setShowModelSettings] = useState(false);
  const [showFlowSettings, setShowFlowSettings] = useState(false);
  const [flows, setFlows] = useState<FlowDefinition[]>(defaultFlows);
  const [selectedFlowId, setSelectedFlowId] = useState(defaultFlows[0].id);
  const [flowText, setFlowText] = useState(JSON.stringify(defaultFlows, null, 2));
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [referenceMode, setReferenceMode] = useState(false);
  const [selectedReferences, setSelectedReferences] = useState<SelectedReference[]>([]);
  const [page, setPage] = useState(0);
  const [columnsPerPage, setColumnsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [showSystemPrompts, setShowSystemPrompts] = useState(true);
  const [sendToAll, setSendToAll] = useState(true);
  const [sendTargets, setSendTargets] = useState<Record<ColumnId, boolean>>(
    Object.fromEntries(defaultColumns.map((column) => [column.id, true]))
  );
  const [routingState, setRoutingState] = useState("Draft");
  const [routingRouteContext, setRoutingRouteContext] = useState("main");
  const [controlVerified, setControlVerified] = useState(false);
  const [controlCause, setControlCause] = useState<ControlCause>("implementation");
  const abortRef = useRef<AbortController | null>(null);

  const columnIds = useMemo(() => columns.map((column) => column.id), [columns]);
  const columnMap = useMemo(() => new Map(columns.map((column) => [column.id, column])), [columns]);
  useEffect(() => {
    const stored = localStorage.getItem("tri-ai-columns-per-page");
    if (!stored) return;

    const value = Number(stored);
    if (Number.isInteger(value) && value >= 1 && value <= MAX_COLUMNS) {
      setColumnsPerPage(value);
    }
  }, []);

  const maxPage = Math.max(0, Math.ceil(columns.length / columnsPerPage) - 1);
  const visibleColumns = columns.slice(page * columnsPerPage, page * columnsPerPage + columnsPerPage);
  const totalTurns = columns.length
    ? Math.max(...columns.map((column) => (columnHistories[column.id] ?? []).length))
    : 0;

  const statusText = useMemo(() => {
    if (loading) return "回答取得中...";
    return totalTurns ? `履歴 最大 ${totalTurns} 件` : "未送信";
  }, [loading, totalTurns]);

  const selectedFlow = useMemo(() => {
    return flows.find((flow) => flow.id === selectedFlowId) ?? flows[0] ?? defaultFlows[0];
  }, [flows, selectedFlowId]);

  const routingEntries = useMemo(() => {
    if (!isFlowV14(selectedFlow)) return [];
    return getStateRoutingEntries(selectedFlow);
  }, [selectedFlow]);

  const routingStateOptions = useMemo(
    () => Array.from(new Set(routingEntries.map((entry) => entry.state))),
    [routingEntries]
  );

  const routingRouteContextOptions = useMemo(
    () => routingEntries.filter((entry) => entry.state === routingState).map((entry) => entry.route_context),
    [routingEntries, routingState]
  );

  const routingResolution = useMemo(() => {
    if (!isFlowV14(selectedFlow)) return null;
    return resolveRouting(selectedFlow, routingState, routingRouteContext);
  }, [selectedFlow, routingState, routingRouteContext]);

  const controlReviewResolution = useMemo(() => {
    if (!isFlowV14(selectedFlow) || !routingResolution) return null;
    return resolveControlReviewRuntime(selectedFlow, routingResolution, {
      verified: controlVerified,
      cause: controlVerified ? undefined : controlCause,
    });
  }, [selectedFlow, routingResolution, controlVerified, controlCause]);

  useEffect(() => {
    if (!routingEntries.length) return;
    const exists = routingEntries.some(
      (entry) => entry.state === routingState && entry.route_context === routingRouteContext
    );
    if (!exists) {
      setRoutingState(routingEntries[0].state);
      setRoutingRouteContext(routingEntries[0].route_context);
    }
  }, [routingEntries, routingState, routingRouteContext]);

  useEffect(() => {
    if (!routingRouteContextOptions.length) return;
    if (!routingRouteContextOptions.includes(routingRouteContext)) {
      setRoutingRouteContext(routingRouteContextOptions[0]);
    }
  }, [routingRouteContextOptions, routingRouteContext]);

  useEffect(() => {
    const stored = localStorage.getItem("tri-ai-common-system-prompt");
    if (stored) setCommonSystemPrompt(stored);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("tri-ai-flow-definitions");
    if (!stored) return;

    try {
      const parsed = normalizeFlows(JSON.parse(stored));
      setFlows(parsed);
      setFlowText(JSON.stringify(parsed, null, 2));
      setSelectedFlowId(parsed[0]?.id ?? defaultFlows[0].id);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const stored = localStorage.getItem("tri-ai-model-catalog");
        if (stored) {
          const parsed = normalizeCatalog(JSON.parse(stored));
          setModelCatalog(parsed);
          setCatalogText(JSON.stringify(parsed, null, 2));
          return;
        }

        const res = await fetch("/models.json", { cache: "no-store" });
        if (!res.ok) throw new Error("models.json not found");
        const parsed = normalizeCatalog(await res.json());
        setModelCatalog(parsed);
        setCatalogText(JSON.stringify(parsed, null, 2));
      } catch {
        setModelCatalog(fallbackModelCatalog);
        setCatalogText(JSON.stringify(fallbackModelCatalog, null, 2));
      }
    }
    loadCatalog();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("tri-ai-variable-columns-configs");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as ColumnConfig[];
      if (!Array.isArray(parsed) || parsed.length < MIN_COLUMNS) return;
      const normalized = parsed.slice(0, MAX_COLUMNS).map((column, index) => ({
        ...defaultColumns[index % defaultColumns.length],
        ...column,
        id: column.id || crypto.randomUUID(),
      }));
      setColumns(normalized);
      setColumnHistories((prev) => {
        const next: Record<ColumnId, ColumnTurn[]> = {};
        for (const column of normalized) next[column.id] = prev[column.id] ?? [];
        return next;
      });
      setSendTargets(Object.fromEntries(normalized.map((column) => [column.id, true])));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (page > maxPage) setPage(maxPage);
  }, [page, maxPage]);

  function saveColumns(next: ColumnConfig[]) {
    setColumns(next);
    localStorage.setItem("tri-ai-variable-columns-configs", JSON.stringify(next));
  }

  function updateColumn(id: ColumnId, patch: Partial<ColumnConfig>) {
    const next = columns.map((column) => {
      if (column.id !== id) return column;
      let nextConfig = { ...column, ...patch };

      if (patch.provider && patch.provider !== column.provider) {
        nextConfig.model = modelCatalog[patch.provider][0] ?? "";
      }
      return nextConfig;
    });
    saveColumns(next);
  }

  function addColumn() {
    if (loading || columns.length >= MAX_COLUMNS) return;

    const number = columns.length + 1;
    const id = `col${Date.now()}`;
    const provider: Provider = "openai";
    const newColumn: ColumnConfig = {
      id,
      label: `Column ${number}`,
      provider,
      model: modelCatalog[provider][0] ?? "gpt-4o-mini",
      systemPrompt: "",
    };

    const nextColumns = [...columns, newColumn];
    saveColumns(nextColumns);
    setColumnHistories((prev) => ({ ...prev, [id]: [] }));
    setSendTargets((prev) => ({ ...prev, [id]: true }));
    setPage(Math.floor((nextColumns.length - 1) / columnsPerPage));
  }

  function deleteColumn(id: ColumnId) {
    if (loading || columns.length <= MIN_COLUMNS) return;

    const nextColumns = columns.filter((column) => column.id !== id);
    saveColumns(nextColumns);

    setColumnHistories((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    setSendTargets((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    setSelectedReferences((prev) => prev.filter((item) => item.key !== id));
  }

  function updateColumnsPerPage(value: number) {
    const safeValue = Math.max(1, Math.min(MAX_COLUMNS, value));
    setColumnsPerPage(safeValue);
    localStorage.setItem("tri-ai-columns-per-page", String(safeValue));
    setPage(0);
  }

  function moveColumnTo(id: ColumnId, targetPosition: number) {
    if (loading) return;

    const currentIndex = columns.findIndex((column) => column.id === id);
    if (currentIndex < 0) return;

    const safeIndex = Math.max(0, Math.min(columns.length - 1, targetPosition - 1));
    if (currentIndex === safeIndex) return;

    const next = [...columns];
    const [moved] = next.splice(currentIndex, 1);
    next.splice(safeIndex, 0, moved);
    saveColumns(next);
  }

  function saveCatalogFromText() {
    try {
      const parsed = normalizeCatalog(JSON.parse(catalogText));
      setModelCatalog(parsed);
      localStorage.setItem("tri-ai-model-catalog", JSON.stringify(parsed));

      const nextColumns = columns.map((column) => {
        if (!parsed[column.provider].includes(column.model)) {
          return { ...column, model: parsed[column.provider][0] ?? "" };
        }
        return column;
      });
      saveColumns(nextColumns);

      setCopyStatus("モデル一覧を保存しました。");
      window.setTimeout(() => setCopyStatus(""), 1800);
    } catch {
      setGlobalError("models JSONの形式が不正です。");
    }
  }

  function resetCatalog() {
    localStorage.removeItem("tri-ai-model-catalog");
    setModelCatalog(fallbackModelCatalog);
    setCatalogText(JSON.stringify(fallbackModelCatalog, null, 2));
  }

  function saveFlowsFromText() {
    try {
      const parsed = normalizeFlows(JSON.parse(flowText));
      setFlows(parsed);
      setSelectedFlowId(parsed[0]?.id ?? defaultFlows[0].id);
      localStorage.setItem("tri-ai-flow-definitions", JSON.stringify(parsed));

      setCopyStatus("Flow定義を保存しました。");
      window.setTimeout(() => setCopyStatus(""), 1800);
    } catch {
      setGlobalError("Flow JSONの形式が不正です。");
    }
  }

  function resetFlows() {
    localStorage.removeItem("tri-ai-flow-definitions");
    setFlows(defaultFlows);
    setSelectedFlowId(defaultFlows[0].id);
    setFlowText(JSON.stringify(defaultFlows, null, 2));
    setCopyStatus("Flow定義を初期化しました。");
    window.setTimeout(() => setCopyStatus(""), 1800);
  }

  function updateCommonSystemPrompt(value: string) {
    setCommonSystemPrompt(value);
    localStorage.setItem("tri-ai-common-system-prompt", value);
  }

  function clearCommonSystemPrompt() {
    updateCommonSystemPrompt("");
  }


  function buildPromptWithAttachments(rawPrompt: string): string {
    if (!attachments.length) return rawPrompt;

    const attachmentText = attachments
      .map((file, index) => [
        `--- 添付ファイル ${index + 1}: ${file.name} ---`,
        `MIME: ${file.type || "unknown"}`,
        `SIZE: ${file.size} bytes`,
        "",
        file.content,
        `--- /添付ファイル ${index + 1}: ${file.name} ---`,
      ].join("\n"))
      .join("\n\n");

    return [
      rawPrompt,
      "",
      "以下はユーザーが添付したファイル内容です。",
      "必要に応じて参照してください。",
      "",
      attachmentText,
    ].join("\n");
  }

  function buildReferenceContext(): string {
    if (!selectedReferences.length) return "";

    const blocks = selectedReferences
      .map(({ key, id }) => {
        const column = columnMap.get(key);
        const turn = columnHistories[key]?.find((item) => item.id === id);
        if (!column || !turn || !turn.answer) return "";
        const turnNumber = (columnHistories[key] ?? []).findIndex((item) => item.id === id) + 1;

        return [
          `--- 参照履歴: ${column.label} / ${providerLabels[column.provider]} / ${column.model} #${turnNumber} ---`,
          "",
          "## Prompt",
          "",
          turn.prompt,
          "",
          "## Response",
          "",
          turn.answer,
          "",
          `--- /参照履歴: ${column.label} #${turnNumber} ---`,
        ].join("\n");
      })
      .filter(Boolean);

    if (!blocks.length) return "";

    return [
      "以下はユーザーが今回参照対象として選択した過去履歴です。",
      "必要に応じて文脈・材料として利用してください。",
      "",
      blocks.join("\n\n"),
    ].join("\n");
  }

  function buildPromptWithReferencesAndAttachments(rawPrompt: string): string {
    const referenceContext = buildReferenceContext();
    const promptWithAttachments = buildPromptWithAttachments(rawPrompt);
    if (!referenceContext) return promptWithAttachments;

    return [
      referenceContext,
      "",
      "以下が今回の新規ユーザープロンプトです。",
      "",
      promptWithAttachments,
    ].join("\n");
  }

  async function handleFilesSelected(files: FileList | null) {
    if (!files || loading) return;

    const textLikeExtensions = [
      ".txt", ".md", ".markdown", ".json", ".csv", ".ts", ".tsx", ".js", ".jsx",
      ".py", ".html", ".css", ".xml", ".yaml", ".yml", ".sql", ".log", ".ini",
      ".toml", ".env", ".gitignore"
    ];

    const nextAttachments: Attachment[] = [];

    for (const file of Array.from(files)) {
      const lowerName = file.name.toLowerCase();
      const isTextLike =
        file.type.startsWith("text/") ||
        file.type === "application/json" ||
        textLikeExtensions.some((ext) => lowerName.endsWith(ext));

      nextAttachments.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        content: isTextLike
          ? await file.text()
          : "[非対応ファイル形式です。テキスト系ファイルのみ読み込みます。]",
      });
    }
    setAttachments((prev) => [...prev, ...nextAttachments]);
  }

  function removeAttachment(id: string) {
    if (loading) return;
    setAttachments((prev) => prev.filter((file) => file.id !== id));
  }

  function clearAttachments() {
    if (loading) return;
    setAttachments([]);
  }

  async function handleSubmit() {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;

    const activeKeys = sendToAll ? columnIds : columnIds.filter((key) => sendTargets[key]);
    if (!activeKeys.length) {
      setGlobalError("送信対象のカラムを1つ以上選択してください。");
      return;
    }

    const promptForSend = buildPromptWithReferencesAndAttachments(trimmed);
    const displayParts = [trimmed];
    if (selectedReferences.length) displayParts.push(`[参照履歴: ${selectedReferences.length}件]`);
    if (attachments.length) displayParts.push(`[添付: ${attachments.map((file) => file.name).join(", ")}]`);
    const displayPrompt = displayParts.join("\n\n");
    const turnId = crypto.randomUUID();

    const histories = buildProviderHistories(columnHistories, promptForSend, columns, activeKeys, commonSystemPrompt);
    const requestColumns = Object.fromEntries(
      activeKeys
        .map((key) => columnMap.get(key))
        .filter((column): column is ColumnConfig => Boolean(column))
        .map((column) => [
          column.id,
          { provider: column.provider, model: column.model, label: column.label },
        ])
    );

    setColumnHistories((prev) => {
      const next: Record<ColumnId, ColumnTurn[]> = { ...prev };
      for (const key of activeKeys) {
        next[key] = [
          ...(prev[key] ?? []),
          { id: turnId, prompt: displayPrompt, answer: "", done: false },
        ];
      }
      return next;
    });

    setPrompt("");
    setAttachments([]);
    setSelectedReferences([]);
    setReferenceMode(false);
    setLoading(true);
    setGlobalError("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ask-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ histories, columns: requestColumns }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        throw new Error(text || "Stream request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const raw of events) {
          const line = raw.split("\n").find((item) => item.startsWith("data: "));
          if (!line) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") continue;

          const event = JSON.parse(payload) as StreamEvent;

          setColumnHistories((prev) => {
            const current = prev[event.provider] ?? [];
            const nextTurns = current.map((turn) => {
              if (turn.id !== turnId) return turn;
              if (event.type === "delta") return { ...turn, answer: turn.answer + event.text };
              if (event.type === "done") return { ...turn, done: true };
              if (event.type === "error") return { ...turn, answer: `ERROR: ${event.message}`, done: true };
              return turn;
            });
            return { ...prev, [event.provider]: nextTurns };
          });
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") setGlobalError("送信を中断しました。");
      else setGlobalError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function stopStreaming() {
    abortRef.current?.abort();
  }

  function clearAllHistory() {
    if (loading) return;
    setColumnHistories(createEmptyHistories(columns));
    setGlobalError("");
  }

  function resetColumnsToDefault() {
    if (loading) return;

    saveColumns(defaultColumns);
    setColumnHistories(createEmptyHistories(defaultColumns));
    setSendTargets(Object.fromEntries(defaultColumns.map((column) => [column.id, true])));
    setSelectedReferences([]);
    setPage(0);
    setCopyStatus("カラム設定を初期化しました。");
    window.setTimeout(() => setCopyStatus(""), 1800);
  }

  function clearColumnHistory(id: ColumnId) {
    if (loading) return;
    setColumnHistories((prev) => ({ ...prev, [id]: [] }));
  }

  function updateSystemPrompt(id: ColumnId, value: string) {
    updateColumn(id, { systemPrompt: value });
  }

  function clearSystemPrompt(id: ColumnId) {
    updateSystemPrompt(id, "");
  }

  function updateSendTarget(id: ColumnId, checked: boolean) {
    setSendTargets((prev) => ({ ...prev, [id]: checked }));
  }

  async function copyTurnSet(id: ColumnId, turn: ColumnTurn) {
    const column = columnMap.get(id);
    if (!column) return;

    const text = [
      `# ${column.label} / ${providerLabels[column.provider]} / ${column.model}`,
      "",
      "## Prompt",
      "",
      turn.prompt,
      "",
      "## Response",
      "",
      turn.answer || "(no response)",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(`${column.label} をコピーしました。`);
      window.setTimeout(() => setCopyStatus(""), 1800);
    } catch {
      setCopyStatus("コピーに失敗しました。");
      window.setTimeout(() => setCopyStatus(""), 1800);
    }
  }

  function isReferenceSelected(key: ColumnId, id: string): boolean {
    return selectedReferences.some((item) => item.key === key && item.id === id);
  }

  function toggleReferenceSelection(key: ColumnId, id: string) {
    setSelectedReferences((prev) => {
      const exists = prev.some((item) => item.key === key && item.id === id);
      if (exists) return prev.filter((item) => !(item.key === key && item.id === id));
      return [...prev, { key, id }];
    });
  }

  function toggleReferenceMode() {
    setReferenceMode((prev) => {
      const next = !prev;
      if (!next) setSelectedReferences([]);
      return next;
    });
  }

  function clearSelectedReferences() {
    setSelectedReferences([]);
  }

  async function copySelectedReferences() {
    const blocks = selectedReferences
      .map(({ key, id }) => {
        const column = columnMap.get(key);
        const turn = columnHistories[key]?.find((item) => item.id === id);
        if (!column || !turn || !turn.answer) return "";
        const turnNumber = (columnHistories[key] ?? []).findIndex((item) => item.id === id) + 1;

        return [
          `# ${column.label} / ${providerLabels[column.provider]} / ${column.model} #${turnNumber}`,
          "",
          "## Prompt",
          "",
          turn.prompt,
          "",
          "## Response",
          "",
          turn.answer,
        ].join("\n");
      })
      .filter(Boolean);

    if (!blocks.length) {
      setCopyStatus("コピー対象がありません。");
      window.setTimeout(() => setCopyStatus(""), 1800);
      return;
    }

    try {
      await navigator.clipboard.writeText(blocks.join("\n\n---\n\n"));
      setCopyStatus(`${blocks.length}件をコピーしました。`);
      window.setTimeout(() => setCopyStatus(""), 1800);
    } catch {
      setCopyStatus("コピーに失敗しました。");
      window.setTimeout(() => setCopyStatus(""), 1800);
    }
  }

  return (
    <main className="page">
      <div className="shell">
        <header className="header">
          <div className="titleRow">
            <h1>Tri AI Chat</h1>
            <span className="versionBadge">{APP_VERSION}</span>
          </div>
          <p>可変カラム構成。表示数・並び順・共通指示・Flow定義を設定できます。</p>
        </header>

        <section className="composer">
          <textarea
            className="promptInput"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="ここにプロンプトを入力"
            disabled={loading}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") void handleSubmit();
            }}
          />

          <div className="attachmentBox">
            <label className="fileButton">
              ファイル添付
              <input
                type="file"
                multiple
                className="fileInput"
                onChange={(e) => {
                  void handleFilesSelected(e.target.files);
                  e.currentTarget.value = "";
                }}
                disabled={loading}
              />
            </label>
            {attachments.length > 0 && <button className="miniButton" onClick={clearAttachments} disabled={loading}>添付クリア</button>}
            <span className="status">対応: txt / md / json / csv / code系</span>
          </div>

          {attachments.length > 0 && (
            <div className="attachmentList">
              {attachments.map((file) => (
                <div className="attachmentItem" key={file.id}>
                  <span title={file.name}>{file.name} ({Math.ceil(file.size / 1024)} KB)</span>
                  <button className="attachmentRemove" onClick={() => removeAttachment(file.id)} disabled={loading}>×</button>
                </div>
              ))}
            </div>
          )}

          {showSystemPrompts && (
            <div className="commonSystemBox">
              <div className="commonSystemHeader">
                <strong>共通システムプロンプト</strong>
                <button
                  className="miniButton"
                  onClick={clearCommonSystemPrompt}
                  disabled={loading || !commonSystemPrompt}
                >
                  共通指示クリア
                </button>
              </div>
              <textarea
                className="commonSystemInput"
                value={commonSystemPrompt}
                onChange={(e) => updateCommonSystemPrompt(e.target.value)}
                placeholder="全カラム共通の指示。例：回答は200文字以内。結論を先に。"
                disabled={loading}
              />
            </div>
          )}

          <div className="flowBar">
            <label className="flowSelectLabel">
              Flow
              <select
                className="flowSelect"
                value={selectedFlowId}
                onChange={(e) => setSelectedFlowId(e.target.value)}
                disabled={loading}
              >
                {flows.map((flow) => (
                  <option value={flow.id} key={flow.id}>
                    {flow.name}
                  </option>
                ))}
              </select>
            </label>
            <span className="status">
              Steps: {selectedFlow ? getFlowStepCount(selectedFlow) : 0}
            </span>
          </div>

          <div className="targetBox">
            <label className="targetLabel strong">
              <input type="checkbox" checked={sendToAll} onChange={(e) => setSendToAll(e.target.checked)} disabled={loading} />
              ALL
            </label>
            {!sendToAll && (
              <div className="targetList">
                {columns.map((column) => (
                  <label className="targetLabel" key={column.id}>
                    <input type="checkbox" checked={sendTargets[column.id] ?? true} onChange={(e) => updateSendTarget(column.id, e.target.checked)} disabled={loading} />
                    {column.label}
                  </label>
                ))}
              </div>
            )}
            <span className="status">
              送信対象: {sendToAll ? "全カラム" : columns.filter((column) => sendTargets[column.id]).map((column) => column.label).join(", ") || "未選択"}
            </span>
          </div>

          {referenceMode && (
            <div className="referenceNotice">
              参照履歴選択中：チェックした履歴カードは次回送信時に新規プロンプトへ同梱されます。
            </div>
          )}

          <div className="actions">
            <div className="leftActions">
              <span className="status">{statusText}</span>
              <span className="status">表示 {page * columnsPerPage + 1}-{Math.min((page + 1) * columnsPerPage, columns.length)} / {columns.length}</span>
            </div>
            <div className="rightActions">
              <button className="button secondary" onClick={addColumn} disabled={loading || columns.length >= MAX_COLUMNS}>＋カラム</button>
              <button className="button secondary" onClick={resetColumnsToDefault} disabled={loading}>カラム初期化</button>
              <label className="displayCountControl">
                表示数
                <select
                  className="displayCountSelect"
                  value={columnsPerPage}
                  onChange={(e) => updateColumnsPerPage(Number(e.target.value))}
                  disabled={loading}
                >
                  {Array.from({ length: MAX_COLUMNS }).map((_, index) => {
                    const value = index + 1;
                    return (
                      <option value={value} key={value}>
                        {value}
                      </option>
                    );
                  })}
                </select>
              </label>
              <button className="button secondary" onClick={() => setShowModelSettings((v) => !v)}>{showModelSettings ? "モデル設定を隠す" : "モデル設定"}</button>
              <button className="button secondary" onClick={() => setShowFlowSettings((v) => !v)}>{showFlowSettings ? "Flow設定を隠す" : "Flow設定"}</button>
              <button className="button secondary" onClick={() => setPage((v) => Math.max(0, v - 1))} disabled={page === 0}>◀ 前</button>
              <button className="button secondary" onClick={() => setPage((v) => Math.min(maxPage, v + 1))} disabled={page >= maxPage}>次 ▶</button>
              <button className="button secondary" onClick={() => setShowSystemPrompts((v) => !v)}>{showSystemPrompts ? "設定欄を隠す" : "設定欄を表示"}</button>
              <button className={referenceMode ? "button active" : "button secondary"} onClick={toggleReferenceMode} disabled={loading || !totalTurns}>
                {referenceMode ? "履歴選択中" : "履歴選択"}
              </button>
              {referenceMode && (
                <>
                  <button className="button secondary" onClick={() => void copySelectedReferences()} disabled={!selectedReferences.length}>選択コピー（{selectedReferences.length}）</button>
                  <button className="button secondary" onClick={clearSelectedReferences} disabled={!selectedReferences.length}>参照解除</button>
                </>
              )}
              <button className="button secondary" onClick={clearAllHistory} disabled={loading || !totalTurns}>全履歴クリア</button>
              {loading ? <button className="button secondary" onClick={stopStreaming}>中断</button> : <button className="button" onClick={handleSubmit} disabled={!prompt.trim()}>送信</button>}
            </div>
          </div>

          <div className="tabRow">
            {Array.from({ length: maxPage + 1 }).map((_, index) => (
              <button key={index} className={index === page ? "pageTab active" : "pageTab"} onClick={() => setPage(index)}>
                {index * columnsPerPage + 1}-{Math.min((index + 1) * columnsPerPage, columns.length)}
              </button>
            ))}
          </div>

          {showModelSettings && (
            <div className="modelSettings">
              <div className="modelSettingsHeader">
                <strong>モデル一覧（models.json / localStorage）</strong>
                <div className="modelSettingsActions">
                  <button className="miniButton" onClick={saveCatalogFromText}>保存</button>
                  <button className="miniButton" onClick={resetCatalog}>初期化</button>
                </div>
              </div>
              <textarea className="catalogEditor" value={catalogText} onChange={(e) => setCatalogText(e.target.value)} spellCheck={false} />
            </div>
          )}

          {showFlowSettings && (
            <div className="flowSettings">
              <div className="modelSettingsHeader">
                <strong>Flow定義</strong>
                <div className="modelSettingsActions">
                  <button className="miniButton" onClick={saveFlowsFromText}>保存</button>
                  <button className="miniButton" onClick={resetFlows}>初期化</button>
                </div>
              </div>
              <textarea
                className="catalogEditor"
                value={flowText}
                onChange={(e) => setFlowText(e.target.value)}
                spellCheck={false}
              />
              <div className="flowPreview">
                <div>
                  <strong>{selectedFlow?.name}</strong>
                  {selectedFlow && isFlowV14(selectedFlow) && (
                    <span style={{ marginLeft: "10px", fontSize: "0.9em", color: "#666" }}>
                      (v1.4 - Steps: {getFlowStepCount(selectedFlow)})
                    </span>
                  )}
                </div>

                {/* Main flow or legacy steps */}
                <div className="flowPreviewSteps">
                  {selectedFlow && getFlowPreviewRows(selectedFlow).length > 0 ? (
                    getFlowPreviewRows(selectedFlow).map((row, index) => (
                      <div className="flowStepPreview" key={row.id}>
                        {index + 1}. {row.from}
                        {row.state && ` [${row.state}]`} → {row.to}
                        {row.type && ` (${row.type})`}
                        {row.name && ` : ${row.name}`}
                      </div>
                    ))
                  ) : (
                    <div className="flowStepPreview">No steps</div>
                  )}
                </div>

                {/* Role bindings for v1.4 */}
                {selectedFlow && isFlowV14(selectedFlow) && selectedFlow.role_bindings && Object.keys(selectedFlow.role_bindings).length > 0 && (
                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #ddd" }}>
                    <div style={{ fontSize: "0.95em", fontWeight: "500", marginBottom: "6px" }}>Roles:</div>
                    {Object.entries(selectedFlow.role_bindings).map(([roleName, binding]) => (
                      <div key={roleName} style={{ fontSize: "0.9em", marginLeft: "10px", marginBottom: "4px" }}>
                        • {roleName}: {binding.type}
                        {binding.column_id && ` (col: ${binding.column_id})`}
                        {binding.tool && ` [tool: ${binding.tool}]`}
                      </div>
                    ))}
                  </div>
                )}

                {/* Feedback flow branches for v1.4 */}
                {selectedFlow && isFlowV14(selectedFlow) && selectedFlow.feedback_flow?.branches && Object.keys(selectedFlow.feedback_flow.branches).length > 0 && (
                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #ddd" }}>
                    <div style={{ fontSize: "0.95em", fontWeight: "500", marginBottom: "6px" }}>Feedback Branches:</div>
                    {Object.entries(selectedFlow.feedback_flow.branches).map(([branchName, branch]) => {
                      const resolvedBranchSteps = getResolvedFeedbackBranchFlow(selectedFlow, branchName);
                      const unresolvedCount = resolvedBranchSteps.filter((s) => s.template_unresolved).length;
                      return (
                        <div key={branchName} style={{ fontSize: "0.9em", marginLeft: "10px", marginBottom: "4px" }}>
                          • {branchName}
                          {branch.description && ` - ${branch.description}`}
                          {branch.loop && " [loop]"}
                          {resolvedBranchSteps.length > 0 && ` (${resolvedBranchSteps.length} steps)`}
                          {unresolvedCount > 0 && ` [${unresolvedCount} 未解決]`}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Routing resolver preview for v1.4 */}
                {selectedFlow && isFlowV14(selectedFlow) && (
                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #ddd" }}>
                    <div style={{ fontSize: "0.95em", fontWeight: "500", marginBottom: "6px" }}>Routing Resolver</div>
                    <div style={{ fontSize: "0.9em", marginLeft: "10px", marginBottom: "8px" }}>
                      state_routing entries: {routingEntries.length}
                    </div>
                    {routingEntries.length > 0 ? (
                      <div style={{ marginLeft: "10px", display: "grid", gap: "10px" }}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <label style={{ fontSize: "0.9em" }}>
                            state
                            <select
                              value={routingState}
                              onChange={(e) => setRoutingState(e.target.value)}
                              style={{ marginLeft: "6px" }}
                            >
                              {routingStateOptions.map((stateOption) => (
                                <option value={stateOption} key={stateOption}>
                                  {stateOption}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label style={{ fontSize: "0.9em" }}>
                            route_context
                            <select
                              value={routingRouteContext}
                              onChange={(e) => setRoutingRouteContext(e.target.value)}
                              style={{ marginLeft: "6px" }}
                            >
                              {routingRouteContextOptions.map((contextOption) => (
                                <option value={contextOption} key={contextOption}>
                                  {contextOption}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        {routingResolution ? (
                          <div style={{ lineHeight: 1.6 }}>
                            <div>next: {routingResolution.nextIds.length ? routingResolution.nextIds.join(", ") : "(none)"}</div>
                            {routingResolution.specialRefs.length > 0 && (
                              <div>specialRefs: {routingResolution.specialRefs.join(", ")}</div>
                            )}
                            {routingResolution.unresolvedNextIds.length > 0 && (
                              <div style={{ color: "#b33" }}>unresolved: {routingResolution.unresolvedNextIds.join(", ")}</div>
                            )}
                            <div>resolved steps: {routingResolution.steps.length}</div>
                            {routingResolution.steps.map((step) => (
                              <div key={step.id} style={{ marginLeft: "10px" }}>
                                • {step.id}: {step.name || step.type || step.route_context || "(no label)"}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ marginLeft: "10px" }}>routing preview unavailable</div>
                        )}
                      </div>
                    ) : (
                      <div style={{ marginLeft: "10px", fontSize: "0.9em" }}>state_routing が未定義または空です。</div>
                    )}
                  </div>
                )}

                {selectedFlow && isFlowV14(selectedFlow) && routingResolution && (
                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #ddd" }}>
                    <div style={{ fontSize: "0.95em", fontWeight: "500", marginBottom: "6px" }}>ControlReview Runtime</div>
                    <div style={{ display: "grid", gap: "10px", marginLeft: "10px" }}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                        <label style={{ fontSize: "0.9em" }}>
                          <input type="checkbox" checked={controlVerified} onChange={(e) => setControlVerified(e.target.checked)} />
                          verified
                        </label>
                        <label style={{ fontSize: "0.9em" }}>
                          cause
                          <select
                            value={controlCause}
                            onChange={(e) => setControlCause(e.target.value as ControlCause)}
                            disabled={controlVerified}
                            style={{ marginLeft: "6px" }}
                          >
                            <option value="implementation">implementation</option>
                            <option value="specification">specification</option>
                            <option value="environment">environment</option>
                          </select>
                        </label>
                      </div>

                      {controlReviewResolution ? (
                        <div style={{ lineHeight: 1.6 }}>
                          <div>kind: {controlReviewResolution.kind}</div>
                          {controlReviewResolution.kind === "verified" && (
                            <>
                              <div>nextStepId: {controlReviewResolution.nextStepId || "(none)"}</div>
                              <div>state_from: {controlReviewResolution.state_from || "(none)"}</div>
                              <div>state_to: {controlReviewResolution.state_to || "(none)"}</div>
                              <div>route_context_reset: {controlReviewResolution.route_context_reset || "(none)"}</div>
                            </>
                          )}
                          {controlReviewResolution.kind === "feedback_branch" && (
                            <>
                              <div>branchKey: {controlReviewResolution.branchKey}</div>
                              <div>route_context: {controlReviewResolution.route_context || "(none)"}</div>
                              <div>state_rollback_to: {controlReviewResolution.state_rollback_to || "(none)"}</div>
                              <div>firstStepId: {controlReviewResolution.firstStepId || "(none)"}</div>
                              {controlReviewResolution.firstStep && (
                                <div style={{ marginLeft: "10px" }}>
                                  firstStep: {controlReviewResolution.firstStep.id} / {controlReviewResolution.firstStep.name || controlReviewResolution.firstStep.type || controlReviewResolution.firstStep.route_context || "(no label)"}
                                </div>
                              )}
                            </>
                          )}
                          {controlReviewResolution.kind === "unresolved" && (
                            <div style={{ color: "#b33" }}>unresolved: {controlReviewResolution.unresolvedReason}</div>
                          )}
                          {controlReviewResolution.kind === "not_applicable" && (
                            <div>not applicable: ControlReview specialRefs が含まれていません。</div>
                          )}
                        </div>
                      ) : (
                        <div style={{ marginLeft: "10px" }}>ControlReview preview unavailable</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}


          {globalError && <div className="error">Error: {globalError}</div>}
          {copyStatus && <div className="copyStatus">{copyStatus}</div>}
        </section>

        <section
          className="columns"
          style={{
            gridTemplateColumns: `repeat(${Math.min(columnsPerPage, visibleColumns.length || 1)}, minmax(220px, 1fr))`,
          }}
        >
          {visibleColumns.map((column) => {
            const turns = columnHistories[column.id] ?? [];
            const modelOptions = modelCatalog[column.provider] ?? [];

            return (
              <article className="column" key={column.id}>
                <div className="columnHeader">
                  <input className="columnLabelInput" value={column.label} onChange={(e) => updateColumn(column.id, { label: e.target.value })} disabled={loading} />
                  <div className="columnSub">{column.model} / 履歴 {turns.length} 件</div>
                </div>

                {showSystemPrompts && (
                  <div className="columnConfigBox">
                    <select className="selectInput" value={column.provider} onChange={(e) => updateColumn(column.id, { provider: e.target.value as Provider })} disabled={loading}>
                      {(Object.keys(providerLabels) as Provider[]).map((provider) => <option value={provider} key={provider}>{providerLabels[provider]}</option>)}
                    </select>
                    <select className="selectInput" value={column.model} onChange={(e) => updateColumn(column.id, { model: e.target.value })} disabled={loading}>
                      {modelOptions.map((model) => <option value={model} key={model}>{model}</option>)}
                    </select>
                    <div className="columnOrderRow">
                      <label className="columnOrderLabel">
                        表示順
                        <select
                          className="orderSelect"
                          value={columns.findIndex((item) => item.id === column.id) + 1}
                          onChange={(e) => moveColumnTo(column.id, Number(e.target.value))}
                          disabled={loading}
                        >
                          {columns.map((_, index) => (
                            <option value={index + 1} key={index + 1}>
                              {index + 1}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button className="miniButton danger" onClick={() => deleteColumn(column.id)} disabled={loading || columns.length <= MIN_COLUMNS}>カラム削除</button>
                    </div>
                  </div>
                )}

                {showSystemPrompts && (
                  <div className="systemPromptBox">
                    <textarea className="systemPromptInput" value={column.systemPrompt} onChange={(e) => updateSystemPrompt(column.id, e.target.value)} placeholder="このカラム専用のシステムプロンプト" disabled={loading} />
                    <div className="miniButtonRow">
                      <button className="miniButton" onClick={() => clearSystemPrompt(column.id)} disabled={loading || !column.systemPrompt}>指示クリア</button>
                      <button className="miniButton danger" onClick={() => clearColumnHistory(column.id)} disabled={loading || !turns.length}>この履歴クリア</button>
                    </div>
                  </div>
                )}

                <div className="columnBody">
                  {!turns.length ? (
                    <div className="empty">未送信</div>
                  ) : (
                    [...turns].reverse().map((turn, reverseIndex) => (
                      <section className={isReferenceSelected(column.id, turn.id) ? "turnCard selected" : "turnCard"} key={turn.id}>
                        <div className="turnCardHeader">
                          <div className="turnHeaderLeft">
                            {referenceMode && <input type="checkbox" className="turnCheckbox" checked={isReferenceSelected(column.id, turn.id)} onChange={() => toggleReferenceSelection(column.id, turn.id)} disabled={!turn.answer} aria-label="参照履歴選択" />}
                            <div className="turnMeta">#{turns.length - reverseIndex}</div>
                          </div>
                          <button className="copyButton" onClick={() => void copyTurnSet(column.id, turn)} disabled={!turn.answer || referenceMode} title="Prompt + Response をコピー">コピー</button>
                        </div>
                        <div className="promptMini">{turn.prompt}</div>
                        <div className="answerBox">{turn.answer ? turn.answer : <span className="placeholder">待機中...</span>}</div>
                        <div className="turnStatus">{turn.done ? "done" : turn.answer ? "streaming" : "waiting"}</div>
                      </section>
                    ))
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}

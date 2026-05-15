import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, readFile, writeFile } from "node:fs/promises";
// @ts-ignore Node 24 runs this local runtime directly from TypeScript source.
import { executeRole, type ExecutorName } from "./roleExecutor.ts";

export type CognitiveDbLayer = "working" | "reference" | "decision";

export type CognitiveDbStatus =
  | "draft"
  | "ready"
  | "conditional"
  | "needs_human_review"
  | "adopt_candidate"
  | "adopted"
  | "adopted_with_conditions"
  | "trial_only"
  | "parked"
  | "rejected";

export type CognitiveRecordStatus =
  | "draft"
  | "active"
  | "ready"
  | "selected"
  | "promoted"
  | "closed"
  | "archived"
  | "superseded"
  | "reopened"
  | "candidate_source"
  | "decision_linked"
  | "needs_human_review"
  | "pending"
  | "adopted"
  | "adopted_with_conditions"
  | "trial_only"
  | "parked"
  | "rejected"
  | "revise";

export type CognitiveLifecycleStage =
  | "raw"
  | "working"
  | "reference"
  | "decision";

export type CognitiveRecordMetadata = {
  record_type: string;
  record_status: CognitiveRecordStatus;
  lifecycle_stage: CognitiveLifecycleStage;
  primary_category: string;
  secondary_categories: string[];
  tags: string[];
  linked_projects: string[];
  cross_category: boolean;
  source_ids: string[];
  linked_record_ids: string[];
  created_at: string;
  updated_at: string;
};

export type ReferenceDocument = {
  id: string;
  title: string;
  source_path: string;
  stored_path: string;
  kind:
    | "prompt_set"
    | "core_discipline"
    | "snapshot_handoff"
    | "workflow_runner_snapshot_handoff"
    | "db_phase_material";
  status: CognitiveDbStatus;
  sha256: string;
  bytes: number;
  ingested_at: string;
} & Partial<CognitiveRecordMetadata>;

export type SnapshotIndexEntry = {
  snapshot_id: string;
  title: string;
  status: "ready" | "conditional" | "not_ready" | "unknown";
  return_query: string;
  source_document_id: string;
  source_path: string;
  ingested_at: string;
};

export type BranchSnapshot = {
  snapshot_id: string;
  snapshot_title: string;
  snapshot_type: string;
  status: CognitiveDbStatus;
  false_closure_warning: string;
  trigger: string;
  branch_items: Array<{
    branch_id: string;
    branch_label: string;
    core_meaning: string;
    temperature: string;
    status: CognitiveDbStatus;
  }>;
  human_originated_material: string;
  ai_seed_or_ai_assisted_framing: string;
  core_meaning: string;
  why_preserve: string;
  search_anchors: string[];
  human_phrase_anchors: string[];
  return_query: string;
  potential_phase3_questions: string[];
  origin_risk: string;
  coverage_check: {
    expected_range: string;
    present_ids: string[];
    missing_ids: string[];
    duplicate_ids: string[];
    non_sequential_ids: string[];
    coverage_status: "ready" | "conditional" | "not_ready";
  };
} & Partial<CognitiveRecordMetadata>;

export type WorkingSnapshotRecord = {
  snapshot_id: string;
  title: string;
  status: "draft";
  source_path: string;
  body_path: string;
  sha256: string;
  bytes: number;
  created_at: string;
  return_query: string;
  source_start_line?: number;
  source_end_line?: number;
} & Partial<CognitiveRecordMetadata>;

export type InboxItem = {
  id: string;
  kind:
    | "phase2_candidate"
    | "phase3_candidate"
    | "decision_candidate"
    | "human_decision_candidate"
    | "unclassified_tail";
  record_status: Extract<
    CognitiveRecordStatus,
    | "needs_human_review"
    | "active"
    | "closed"
    | "archived"
    | "promoted"
    | "rejected"
    | "parked"
  >;
  lifecycle_stage: "working";
  source_path: string;
  body_path: string;
  source_start_line: number;
  source_end_line: number;
  sha256: string;
  bytes: number;
  created_at: string;
  updated_at: string;
  tags: string[];
} & Partial<CognitiveRecordMetadata>;

export type OutboxItem = {
  id: string;
  kind: "rehydration_packet" | "state_handoff";
  record_status: Extract<CognitiveRecordStatus, "ready" | "archived">;
  lifecycle_stage: "working";
  output_path: string;
  snapshot_ids: string[];
  sha256: string;
  bytes: number;
  created_at: string;
  updated_at: string;
  tags: string[];
} & Partial<CognitiveRecordMetadata>;

export type PendingDecision = {
  id: string;
  decision_item: string;
  recommended_status:
    | "adopt"
    | "adopt_with_conditions"
    | "trial_only"
    | "park"
    | "reject";
  condition: string;
  source: string;
  status: "pending_human_decision";
} & Partial<CognitiveRecordMetadata>;

export type HumanDecisionRecord = {
  id: string;
  source_decision_id: string;
  decision_item: string;
  human_status:
    | "adopted"
    | "adopted_with_conditions"
    | "trial_only"
    | "parked"
    | "rejected";
  note: string;
  source: string;
  decided_at: string;
} & Partial<CognitiveRecordMetadata>;

export type WorkingDb = {
  db_id: "cognitive-os-working-db";
  layer: "working";
  status: "trial";
  snapshots: Array<BranchSnapshot | WorkingSnapshotRecord>;
  inbox_items: InboxItem[];
  outbox_items: OutboxItem[];
  notes: string[];
  updated_at: string;
};

export type ReferenceDb = {
  db_id: "cognitive-os-reference-db";
  layer: "reference";
  status: "trial";
  documents: ReferenceDocument[];
  snapshot_index: SnapshotIndexEntry[];
  updated_at: string;
};

export type DecisionDb = {
  db_id: "cognitive-os-decision-db";
  layer: "decision";
  status: "trial";
  pending_decisions: PendingDecision[];
  human_decisions: HumanDecisionRecord[];
  status_vocab: string[];
  updated_at: string;
};

export type CognitiveDbManifest = {
  workspace_id: "cognitive-os-runtime-workspace";
  status: "trial";
  false_closure_warning: string;
  layers: Record<CognitiveDbLayer, string>;
  directories: Record<string, string>;
  updated_at: string;
};

const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(runtimeDir, "..");
const cognitiveWorkspaceRoot = path.join(
  workspaceRoot,
  "CognitiveOS_Runtime_Workspace",
);
const dbRoot = path.join(cognitiveWorkspaceRoot, "db");
const referenceDocumentRoot = path.join(dbRoot, "reference_documents");
const workingSnapshotRoot = path.join(dbRoot, "snapshots");
const inboxRoot = path.join(cognitiveWorkspaceRoot, "inbox");

const falseClosureWarning =
  "This DB entry is not adoption, PM Judgment, rule/spec change, implementation instruction, or Human final decision. Formal adoption requires Phase 3 / Trust Cache Reset / Origin Separation / Human final decision.";

function toWorkspacePath(absolutePath: string): string {
  return path.relative(workspaceRoot, absolutePath).replace(/\\/g, "/");
}

function now(): string {
  return new Date().toISOString();
}

function stableId(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function writeJsonIfAbsent(filePath: string, value: unknown): Promise<void> {
  try {
    await readFile(filePath, "utf8");
  } catch {
    await writeJson(filePath, value);
  }
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

export function cognitiveDbPaths(): {
  workspaceRoot: string;
  manifest: string;
  workingDb: string;
  referenceDb: string;
  decisionDb: string;
  exports: string;
} {
  return {
    workspaceRoot: cognitiveWorkspaceRoot,
    manifest: path.join(cognitiveWorkspaceRoot, "manifest.json"),
    workingDb: path.join(dbRoot, "working.json"),
    referenceDb: path.join(dbRoot, "reference.json"),
    decisionDb: path.join(dbRoot, "decision.json"),
    exports: path.join(cognitiveWorkspaceRoot, "exports"),
  };
}

export async function initCognitiveDb(): Promise<CognitiveDbManifest> {
  const paths = cognitiveDbPaths();

  await mkdir(path.join(cognitiveWorkspaceRoot, "prompts"), { recursive: true });
  await mkdir(dbRoot, { recursive: true });
  await mkdir(referenceDocumentRoot, { recursive: true });
  await mkdir(workingSnapshotRoot, { recursive: true });
  await mkdir(inboxRoot, { recursive: true });
  await mkdir(path.join(cognitiveWorkspaceRoot, "outbox"), { recursive: true });
  await mkdir(paths.exports, { recursive: true });

  const timestamp = now();
  const manifest: CognitiveDbManifest = {
    workspace_id: "cognitive-os-runtime-workspace",
    status: "trial",
    false_closure_warning: falseClosureWarning,
    layers: {
      working: toWorkspacePath(paths.workingDb),
      reference: toWorkspacePath(paths.referenceDb),
      decision: toWorkspacePath(paths.decisionDb),
    },
    directories: {
      prompts: toWorkspacePath(path.join(cognitiveWorkspaceRoot, "prompts")),
      db: toWorkspacePath(dbRoot),
      snapshots: toWorkspacePath(workingSnapshotRoot),
      inbox: toWorkspacePath(inboxRoot),
      outbox: toWorkspacePath(path.join(cognitiveWorkspaceRoot, "outbox")),
      exports: toWorkspacePath(paths.exports),
    },
    updated_at: timestamp,
  };
  const workingDb: WorkingDb = {
    db_id: "cognitive-os-working-db",
    layer: "working",
    status: "trial",
    snapshots: [],
    inbox_items: [],
    outbox_items: [],
    notes: [
      "Working DB stores snapshots, branches, temporary notes, and non-adopted working material.",
    ],
    updated_at: timestamp,
  };
  const referenceDb: ReferenceDb = {
    db_id: "cognitive-os-reference-db",
    layer: "reference",
    status: "trial",
    documents: [],
    snapshot_index: [],
    updated_at: timestamp,
  };
  const decisionDb: DecisionDb = {
    db_id: "cognitive-os-decision-db",
    layer: "decision",
    status: "trial",
    pending_decisions: defaultPendingDecisions(),
    human_decisions: [],
    status_vocab: [
      "adopt",
      "adopt_with_conditions",
      "trial_only",
      "park",
      "reject",
      "supersede",
      "merge",
      "reopen",
    ],
    updated_at: timestamp,
  };

  await writeJsonIfAbsent(paths.manifest, manifest);
  await writeJsonIfAbsent(paths.workingDb, workingDb);
  await writeJsonIfAbsent(paths.referenceDb, referenceDb);
  await writeJsonIfAbsent(paths.decisionDb, decisionDb);

  return manifest;
}

export async function ingestCognitiveOsInputFiles(
  inputFiles: string[],
): Promise<ReferenceDocument[]> {
  await ensureInitialized();

  const paths = cognitiveDbPaths();
  const referenceDb = await readJson<ReferenceDb>(paths.referenceDb);
  referenceDb.snapshot_index ??= [];
  const documents: ReferenceDocument[] = [];
  const snapshotEntries: SnapshotIndexEntry[] = [];

  for (const relativeInputPath of inputFiles) {
    const absoluteInputPath = path.resolve(workspaceRoot, relativeInputPath);
    const content = await readFile(absoluteInputPath, "utf8");
    const baseName = path.basename(relativeInputPath);
    const storedPath = path.join(referenceDocumentRoot, baseName);
    const hash = sha256(content);
    const document: ReferenceDocument = {
      id: `REF-${stableId(relativeInputPath)}`,
      title: extractTitle(content, baseName),
      source_path: toWorkspacePath(absoluteInputPath),
      stored_path: toWorkspacePath(storedPath),
      kind: classifyReferenceKind(baseName),
      status: "adopt_candidate",
      sha256: hash,
      bytes: Buffer.byteLength(content, "utf8"),
      ingested_at: now(),
      ...buildRecordMetadata({
        recordType: classifyReferenceKind(baseName),
        recordStatus: "active",
        lifecycleStage: "reference",
        title: extractTitle(content, baseName),
        sourceIds: [toWorkspacePath(absoluteInputPath)],
      }),
    };

    await writeFile(storedPath, content, "utf8");
    documents.push(document);
    snapshotEntries.push(...extractSnapshotIndexEntries(content, document));
  }

  const existingById = new Map(referenceDb.documents.map((entry) => [entry.id, entry]));
  for (const document of documents) {
    existingById.set(document.id, document);
  }

  referenceDb.documents = [...existingById.values()].sort((a, b) =>
    a.id.localeCompare(b.id),
  );

  const existingSnapshotsById = new Map(
    referenceDb.snapshot_index.map((entry) => [entry.snapshot_id, entry]),
  );
  for (const snapshotEntry of snapshotEntries) {
    existingSnapshotsById.set(snapshotEntry.snapshot_id, snapshotEntry);
  }

  referenceDb.snapshot_index = [...existingSnapshotsById.values()].sort((a, b) =>
    a.snapshot_id.localeCompare(b.snapshot_id),
  );
  referenceDb.updated_at = now();
  await writeJson(paths.referenceDb, referenceDb);

  return documents;
}

export async function createWorkingSnapshot(
  relativeInputPath: string,
): Promise<WorkingSnapshotRecord> {
  await ensureInitialized();
  await mkdir(workingSnapshotRoot, { recursive: true });

  const paths = cognitiveDbPaths();
  const workingDb = await readJson<WorkingDb>(paths.workingDb);
  const absoluteInputPath = path.resolve(workspaceRoot, relativeInputPath);
  const content = await readFile(absoluteInputPath, "utf8");
  const existingIds = new Set(
    workingDb.snapshots.map((snapshot) => snapshot.snapshot_id),
  );
  const snapshotId = nextWorkingSnapshotId(existingIds);
  const bodyPath = path.join(workingSnapshotRoot, `${snapshotId}.md`);
  const title = extractTitle(content, path.basename(relativeInputPath));
  const timestamp = now();
  const record: WorkingSnapshotRecord = {
    ...buildRecordMetadata({
      recordType: "snapshot",
      recordStatus: "draft",
      lifecycleStage: "working",
      title,
      sourceIds: [toWorkspacePath(absoluteInputPath)],
    }),
    snapshot_id: snapshotId,
    title,
    status: "draft",
    source_path: toWorkspacePath(absoluteInputPath),
    body_path: toWorkspacePath(bodyPath),
    sha256: sha256(content),
    bytes: Buffer.byteLength(content, "utf8"),
    created_at: timestamp,
    return_query: `${snapshotId} ${title}`,
  };

  await writeFile(bodyPath, content, "utf8");
  workingDb.snapshots.push(record);
  workingDb.updated_at = timestamp;
  await writeJson(paths.workingDb, workingDb);

  return record;
}

export async function normalizeWorkingSnapshot(
  relativeInputPath: string,
): Promise<WorkingSnapshotRecord> {
  await ensureInitialized();
  await mkdir(workingSnapshotRoot, { recursive: true });

  const paths = cognitiveDbPaths();
  const workingDb = await readJson<WorkingDb>(paths.workingDb);
  const absoluteInputPath = path.resolve(workspaceRoot, relativeInputPath);
  const rawContent = await readFile(absoluteInputPath, "utf8");
  const existingIds = new Set(
    workingDb.snapshots.map((snapshot) => snapshot.snapshot_id),
  );
  const snapshotId = nextWorkingSnapshotId(existingIds);
  const sourceTitle = extractTitle(rawContent, path.basename(relativeInputPath));
  const normalizedTitle = `${sourceTitle} / Normalized Snapshot`;
  const normalizedContent = buildNormalizedSnapshotBody({
    snapshotId,
    title: normalizedTitle,
    sourcePath: toWorkspacePath(absoluteInputPath),
    rawContent,
  });
  const bodyPath = path.join(workingSnapshotRoot, `${snapshotId}.md`);
  const timestamp = now();
  const record: WorkingSnapshotRecord = {
    ...buildRecordMetadata({
      recordType: "normalized_snapshot",
      recordStatus: "draft",
      lifecycleStage: "working",
      title: normalizedTitle,
      sourceIds: [toWorkspacePath(absoluteInputPath)],
    }),
    snapshot_id: snapshotId,
    title: normalizedTitle,
    status: "draft",
    source_path: toWorkspacePath(absoluteInputPath),
    body_path: toWorkspacePath(bodyPath),
    sha256: sha256(normalizedContent),
    bytes: Buffer.byteLength(normalizedContent, "utf8"),
    created_at: timestamp,
    return_query: `${snapshotId} ${normalizedTitle}`,
  };

  await writeFile(bodyPath, normalizedContent, "utf8");
  workingDb.snapshots.push(record);
  workingDb.updated_at = timestamp;
  await writeJson(paths.workingDb, workingDb);

  return record;
}

export async function listWorkingSnapshots(): Promise<Array<BranchSnapshot | WorkingSnapshotRecord>> {
  const status = await cognitiveDbStatus();
  return status.working.snapshots;
}

export async function readWorkingSnapshot(
  snapshotId: string,
): Promise<{ record: BranchSnapshot | WorkingSnapshotRecord; body: string | null }> {
  const status = await cognitiveDbStatus();
  const normalizedSnapshotId = snapshotId.toUpperCase();
  const record = status.working.snapshots.find(
    (snapshot) => snapshot.snapshot_id.toUpperCase() === normalizedSnapshotId,
  );

  if (!record) {
    throw new Error(`Working snapshot "${snapshotId}" was not found.`);
  }

  if (!("body_path" in record)) {
    return { record, body: null };
  }

  const body = await readFile(path.resolve(workspaceRoot, record.body_path), "utf8");
  return { record, body };
}

export async function updateWorkingSnapshotStatus(
  snapshotId: string,
  recordStatus: Extract<
    CognitiveRecordStatus,
    "draft" | "active" | "ready" | "closed" | "archived" | "superseded" | "reopened"
  >,
): Promise<BranchSnapshot | WorkingSnapshotRecord> {
  const status = await cognitiveDbStatus();
  const paths = cognitiveDbPaths();
  const normalizedSnapshotId = snapshotId.toUpperCase();
  const record = status.working.snapshots.find(
    (snapshot) => snapshot.snapshot_id.toUpperCase() === normalizedSnapshotId,
  );

  if (!record) {
    throw new Error(`Working snapshot "${snapshotId}" was not found.`);
  }

  record.record_status = recordStatus;
  record.updated_at = now();
  status.working.updated_at = record.updated_at;
  await writeJson(paths.workingDb, status.working);

  return record;
}

export async function listInboxItems(): Promise<InboxItem[]> {
  const status = await cognitiveDbStatus();
  return status.working.inbox_items;
}

export async function readInboxItem(
  inboxId: string,
): Promise<{ item: InboxItem; body: string }> {
  const status = await cognitiveDbStatus();
  const normalizedInboxId = inboxId.toUpperCase();
  const item = status.working.inbox_items.find(
    (entry) => entry.id.toUpperCase() === normalizedInboxId,
  );

  if (!item) {
    throw new Error(`Inbox item "${inboxId}" was not found.`);
  }

  const body = await readFile(path.resolve(workspaceRoot, item.body_path), "utf8");
  return { item, body };
}

export async function updateInboxItemStatus(
  inboxId: string,
  recordStatus: InboxItem["record_status"],
): Promise<InboxItem> {
  const status = await cognitiveDbStatus();
  const paths = cognitiveDbPaths();
  const normalizedInboxId = inboxId.toUpperCase();
  const item = status.working.inbox_items.find(
    (entry) => entry.id.toUpperCase() === normalizedInboxId,
  );

  if (!item) {
    throw new Error(`Inbox item "${inboxId}" was not found.`);
  }

  item.record_status = recordStatus;
  item.updated_at = now();
  status.working.updated_at = item.updated_at;
  await writeJson(paths.workingDb, status.working);

  return item;
}

export async function listOutboxItems(): Promise<OutboxItem[]> {
  const status = await cognitiveDbStatus();
  return status.working.outbox_items;
}

export async function readOutboxItem(
  outboxId: string,
): Promise<{ item: OutboxItem; body: string }> {
  const status = await cognitiveDbStatus();
  const normalizedOutboxId = outboxId.toUpperCase();
  const item = status.working.outbox_items.find(
    (entry) => entry.id.toUpperCase() === normalizedOutboxId,
  );

  if (!item) {
    throw new Error(`Outbox item "${outboxId}" was not found.`);
  }

  const absoluteOutputPath = path.resolve(workspaceRoot, item.output_path);
  let body: string;
  try {
    body = await readFile(absoluteOutputPath, "utf8");
  } catch {
    throw new Error(
      `Outbox item "${outboxId}" export file not found at: ${item.output_path}`,
    );
  }
  return { item, body };
}

export async function listPendingDecisions(): Promise<PendingDecision[]> {
  const status = await cognitiveDbStatus();
  return status.decision.pending_decisions;
}

export async function listHumanDecisions(): Promise<HumanDecisionRecord[]> {
  const status = await cognitiveDbStatus();
  return status.decision.human_decisions;
}

export async function readPendingDecision(decisionId: string): Promise<PendingDecision> {
  const status = await cognitiveDbStatus();
  const normalizedDecisionId = decisionId.toUpperCase();
  const decision = status.decision.pending_decisions.find(
    (entry) => entry.id.toUpperCase() === normalizedDecisionId,
  );

  if (!decision) {
    throw new Error(`Pending decision "${decisionId}" was not found.`);
  }

  return decision;
}

export async function recordHumanDecision(input: {
  decisionId: string;
  humanStatus: HumanDecisionRecord["human_status"];
  note?: string;
}): Promise<HumanDecisionRecord> {
  const status = await cognitiveDbStatus();
  const paths = cognitiveDbPaths();
  const normalizedDecisionId = input.decisionId.toUpperCase();
  const decision = status.decision.pending_decisions.find(
    (entry) => entry.id.toUpperCase() === normalizedDecisionId,
  );

  if (!decision) {
    throw new Error(`Pending decision "${input.decisionId}" was not found.`);
  }

  const existing = status.decision.human_decisions.find(
    (entry) => entry.source_decision_id.toUpperCase() === normalizedDecisionId,
  );
  if (existing) {
    throw new Error(
      `Pending decision "${input.decisionId}" already has human decision: ${existing.id}.`,
    );
  }

  const timestamp = now();
  const humanDecisionId = nextHumanDecisionId(
    new Set(status.decision.human_decisions.map((entry) => entry.id)),
  );
  const record: HumanDecisionRecord = {
    ...buildRecordMetadata({
      recordType: "human_decision",
      recordStatus: input.humanStatus,
      lifecycleStage: "decision",
      title: decision.decision_item,
      sourceIds: [decision.id, decision.source],
      linkedRecordIds: [decision.id],
    }),
    id: humanDecisionId,
    source_decision_id: decision.id,
    decision_item: decision.decision_item,
    human_status: input.humanStatus,
    note: input.note?.trim() || "",
    source: decision.source,
    decided_at: timestamp,
    created_at: timestamp,
    updated_at: timestamp,
  };

  decision.record_status = mapHumanStatusToCandidateStatus(input.humanStatus);
  decision.updated_at = timestamp;
  decision.linked_record_ids = [
    ...new Set([...(decision.linked_record_ids ?? []), humanDecisionId]),
  ];
  status.decision.human_decisions.push(record);
  status.decision.updated_at = timestamp;
  await writeJson(paths.decisionDb, status.decision);

  return record;
}

export async function promoteInboxItemToSnapshot(
  inboxId: string,
): Promise<{ item: InboxItem; snapshot: WorkingSnapshotRecord }> {
  await mkdir(workingSnapshotRoot, { recursive: true });
  const status = await cognitiveDbStatus();
  const paths = cognitiveDbPaths();
  const normalizedInboxId = inboxId.toUpperCase();
  const item = status.working.inbox_items.find(
    (entry) => entry.id.toUpperCase() === normalizedInboxId,
  );

  if (!item) {
    throw new Error(`Inbox item "${inboxId}" was not found.`);
  }
  const alreadyLinked = (item.linked_record_ids ?? []).filter((id) =>
    id.startsWith("WSNAP-"),
  );
  if (item.record_status === "promoted" || alreadyLinked.length > 0) {
    throw new Error(
      `Inbox item "${inboxId}" is already promoted to: ${alreadyLinked.join(", ") || "unknown"}.`,
    );
  }

  const body = await readFile(path.resolve(workspaceRoot, item.body_path), "utf8");
  const existingIds = new Set(
    status.working.snapshots.map((snapshot) => snapshot.snapshot_id),
  );
  const snapshotId = nextWorkingSnapshotId(existingIds);
  const title = `${item.id} / ${inboxKindLabel(item.kind)} / Promoted Snapshot`;
  const normalizedContent = buildNormalizedSnapshotBody({
    snapshotId,
    title,
    sourcePath: `${item.source_path}:${item.source_start_line}-${item.source_end_line}`,
    rawContent: body,
  });
  const bodyPath = path.join(workingSnapshotRoot, `${snapshotId}.md`);
  const timestamp = now();
  const snapshot: WorkingSnapshotRecord = {
    ...buildRecordMetadata({
      recordType: "inbox_promoted_snapshot",
      recordStatus: "ready",
      lifecycleStage: "working",
      title,
      sourceIds: [item.id, item.source_path],
      linkedRecordIds: [item.id],
    }),
    snapshot_id: snapshotId,
    title,
    status: "draft",
    source_path: item.source_path,
    body_path: toWorkspacePath(bodyPath),
    sha256: sha256(normalizedContent),
    bytes: Buffer.byteLength(normalizedContent, "utf8"),
    created_at: timestamp,
    return_query: `${snapshotId} ${title}`,
    source_start_line: item.source_start_line,
    source_end_line: item.source_end_line,
  };

  await writeFile(bodyPath, normalizedContent, "utf8");
  status.working.snapshots.push(snapshot);
  item.record_status = "promoted";
  item.updated_at = timestamp;
  item.linked_record_ids = [...new Set([...(item.linked_record_ids ?? []), snapshotId])];
  status.working.updated_at = timestamp;
  await writeJson(paths.workingDb, status.working);

  return { item, snapshot };
}

export async function snapshotizeInboxItem(input: {
  inboxId: string;
  executor: ExecutorName;
  dryRun?: boolean;
}): Promise<{
  item: InboxItem;
  snapshot: WorkingSnapshotRecord;
  duplicateCandidates: Array<{ snapshot_id: string; title: string; score: number }>;
  body?: string;
}> {
  await mkdir(workingSnapshotRoot, { recursive: true });
  const status = await cognitiveDbStatus();
  const paths = cognitiveDbPaths();
  const normalizedInboxId = input.inboxId.toUpperCase();
  const item = status.working.inbox_items.find(
    (entry) => entry.id.toUpperCase() === normalizedInboxId,
  );

  if (!item) {
    throw new Error(`Inbox item "${input.inboxId}" was not found.`);
  }

  const alreadyLinked = (item.linked_record_ids ?? []).filter((id) =>
    id.startsWith("WSNAP-") || id.startsWith("SNAP-"),
  );
  if (item.record_status === "promoted" || alreadyLinked.length > 0) {
    throw new Error(
      `Inbox item "${input.inboxId}" is already linked to snapshot: ${alreadyLinked.join(", ") || "unknown"}.`,
    );
  }

  const body = await readFile(path.resolve(workspaceRoot, item.body_path), "utf8");
  const existingIds = new Set(
    status.working.snapshots.map((snapshot) => snapshot.snapshot_id),
  );
  const snapshotId = nextWorkingSnapshotId(existingIds);
  const duplicateCandidates = findSimilarSnapshotCandidates({
    content: body,
    snapshots: status.working.snapshots,
  });
  const generatedBody = input.executor === "mock"
    ? buildNormalizedSnapshotBody({
        snapshotId,
        title: `${item.id} / AISnapshotized Snapshot`,
        sourcePath: `${item.source_path}:${item.source_start_line}-${item.source_end_line}`,
        rawContent: body,
      })
    : await executeRole({
        executor: input.executor,
        workspaceRoot,
        roleName: "AISnapshotizer",
        previousOutputCount: 0,
        prompt: buildAiSnapshotizerPrompt({
          inboxItem: item,
          inboxBody: body,
          snapshotId,
          duplicateCandidates,
        }),
      });
  const snapshotBody = stripOuterMarkdownFence(generatedBody).trimEnd();
  const title = extractImportedSnapshotTitle(snapshotBody, snapshotId);
  const bodyPath = path.join(workingSnapshotRoot, `${snapshotId}.md`);
  const timestamp = now();
  const snapshot: WorkingSnapshotRecord = {
    ...buildRecordMetadata({
      recordType: "ai_snapshotized_inbox",
      recordStatus: "ready",
      lifecycleStage: "working",
      title,
      sourceIds: [item.id, item.source_path],
      linkedRecordIds: [item.id],
    }),
    snapshot_id: snapshotId,
    title,
    status: "draft",
    source_path: item.source_path,
    body_path: toWorkspacePath(bodyPath),
    sha256: sha256(snapshotBody),
    bytes: Buffer.byteLength(snapshotBody, "utf8"),
    created_at: timestamp,
    return_query: extractReturnQuery(snapshotBody, snapshotId, title),
    source_start_line: item.source_start_line,
    source_end_line: item.source_end_line,
  };

  if (!input.dryRun) {
    await writeFile(bodyPath, `${snapshotBody}\n`, "utf8");
    status.working.snapshots.push(snapshot);
    item.record_status = "promoted";
    item.updated_at = timestamp;
    item.linked_record_ids = [...new Set([...(item.linked_record_ids ?? []), snapshotId])];
    status.working.updated_at = timestamp;
    await writeJson(paths.workingDb, status.working);
  }

  return {
    item,
    snapshot,
    duplicateCandidates,
    body: input.dryRun ? snapshotBody : undefined,
  };
}

export async function importCognitiveHandoff(
  relativeInputPath: string,
): Promise<{
  importedSnapshots: WorkingSnapshotRecord[];
  updatedSnapshots: WorkingSnapshotRecord[];
  skippedSnapshots: string[];
  inboxItems: InboxItem[];
}> {
  await ensureInitialized();
  await mkdir(workingSnapshotRoot, { recursive: true });
  await mkdir(inboxRoot, { recursive: true });

  const paths = cognitiveDbPaths();
  const workingDb = await readJson<WorkingDb>(paths.workingDb);
  const absoluteInputPath = path.resolve(workspaceRoot, relativeInputPath);
  const content = await readFile(absoluteInputPath, "utf8");
  const sourcePath = toWorkspacePath(absoluteInputPath);
  const lines = content.split(/\r?\n/);
  const blocks = findSnapshotBlocks(lines);
  const existingSnapshotIds = new Set(
    workingDb.snapshots.map((snapshot) => snapshot.snapshot_id.toUpperCase()),
  );
  const existingContentHashes = new Set(
    workingDb.snapshots
      .map((snapshot) => ("sha256" in snapshot ? snapshot.sha256 : null))
      .filter((hash): hash is string => Boolean(hash)),
  );
  const importedSnapshots: WorkingSnapshotRecord[] = [];
  const updatedSnapshots: WorkingSnapshotRecord[] = [];
  const skippedSnapshots: string[] = [];
  const timestamp = now();

  for (const block of blocks) {
    const blockContent = lines.slice(block.startLine - 1, block.endLine).join("\n").trimEnd();
    const contentHash = sha256(blockContent);
    const existingSnapshot = workingDb.snapshots.find(
      (snapshot) => snapshot.snapshot_id.toUpperCase() === block.snapshotId.toUpperCase(),
    );

    if (existingSnapshot && "body_path" in existingSnapshot) {
      if (existingSnapshot.sha256 === contentHash) {
        skippedSnapshots.push(block.snapshotId);
        continue;
      }

      const title = extractImportedSnapshotTitle(blockContent, block.snapshotId);
      await writeFile(
        path.resolve(workspaceRoot, existingSnapshot.body_path),
        `${blockContent}\n`,
        "utf8",
      );
      existingSnapshot.title = title;
      existingSnapshot.record_status = existingSnapshot.record_status ?? "ready";
      existingSnapshot.updated_at = now();
      existingSnapshot.sha256 = contentHash;
      existingSnapshot.bytes = Buffer.byteLength(blockContent, "utf8");
      existingSnapshot.return_query = extractReturnQuery(blockContent, block.snapshotId, title);
      existingSnapshot.source_start_line = block.startLine;
      existingSnapshot.source_end_line = block.endLine;
      updatedSnapshots.push(existingSnapshot);
      existingContentHashes.add(contentHash);
      continue;
    }

    if (existingSnapshotIds.has(block.snapshotId.toUpperCase()) || existingContentHashes.has(contentHash)) {
      skippedSnapshots.push(block.snapshotId);
      continue;
    }

    const title = extractImportedSnapshotTitle(blockContent, block.snapshotId);
    const bodyPath = path.join(workingSnapshotRoot, `${block.snapshotId}.md`);
    const record: WorkingSnapshotRecord = {
      ...buildRecordMetadata({
        recordType: "imported_snapshot",
        recordStatus: "ready",
        lifecycleStage: "working",
        title,
        sourceIds: [sourcePath],
      }),
      snapshot_id: block.snapshotId,
      title,
      status: "draft",
      source_path: sourcePath,
      body_path: toWorkspacePath(bodyPath),
      sha256: contentHash,
      bytes: Buffer.byteLength(blockContent, "utf8"),
      created_at: timestamp,
      return_query: extractReturnQuery(blockContent, block.snapshotId, title),
      source_start_line: block.startLine,
      source_end_line: block.endLine,
    };

    await writeFile(bodyPath, `${blockContent}\n`, "utf8");
    workingDb.snapshots.push(record);
    existingSnapshotIds.add(block.snapshotId.toUpperCase());
    existingContentHashes.add(contentHash);
    importedSnapshots.push(record);
  }

  const inboxItems = await createHandoffInboxItems({
    workingDb,
    sourcePath,
    lines,
    blocks,
  });

  if (importedSnapshots.length > 0 || updatedSnapshots.length > 0 || inboxItems.length > 0) {
    workingDb.updated_at = now();
    await writeJson(paths.workingDb, workingDb);
  }

  return { importedSnapshots, updatedSnapshots, skippedSnapshots, inboxItems };
}

export async function cognitiveDbStatus(): Promise<{
  manifest: CognitiveDbManifest;
  working: WorkingDb;
  reference: ReferenceDb;
  decision: DecisionDb;
}> {
  await ensureInitialized();
  const paths = cognitiveDbPaths();
  const manifest = await readJson<CognitiveDbManifest>(paths.manifest);
  const working = await readJson<WorkingDb>(paths.workingDb);
  const reference = await readJson<ReferenceDb>(paths.referenceDb);
  const decision = await readJson<DecisionDb>(paths.decisionDb);
  const changed = backfillLifecycleMetadata({ working, reference, decision });

  if (changed.working) {
    working.updated_at = now();
    await writeJson(paths.workingDb, working);
  }
  if (changed.reference) {
    reference.updated_at = now();
    await writeJson(paths.referenceDb, reference);
  }
  if (changed.decision) {
    decision.updated_at = now();
    await writeJson(paths.decisionDb, decision);
  }

  return {
    manifest,
    working,
    reference,
    decision,
  };
}

export async function exportCognitiveDbSummary(): Promise<string> {
  const status = await cognitiveDbStatus();
  const paths = cognitiveDbPaths();
  const outputPath = path.join(paths.exports, "cognitive-os-db-summary.md");
  const workingStatusCounts = countBy(
    status.working.snapshots,
    (snapshot) => snapshot.record_status ?? "active",
  );
  const referenceStatusCounts = countBy(
    status.reference.documents,
    (document) => document.record_status ?? "active",
  );
  const decisionStatusCounts = countBy(
    status.decision.pending_decisions,
    (decision) => decision.record_status ?? "pending",
  );
  const categoryCounts = countBy(
    [
      ...status.working.snapshots,
      ...status.working.inbox_items,
      ...status.working.outbox_items,
      ...status.reference.documents,
      ...status.decision.pending_decisions,
    ],
    (record) => record.primary_category ?? "uncategorized",
  );
  const tagCounts = countTags([
    ...status.working.snapshots,
    ...status.working.inbox_items,
    ...status.working.outbox_items,
    ...status.reference.documents,
    ...status.decision.pending_decisions,
  ]);
  const lines = [
    "# CognitiveOS DB Summary",
    "",
    `Generated: ${now()}`,
    "",
    "## Status",
    "",
    `- Workspace: ${toWorkspacePath(paths.workspaceRoot)}`,
    `- Working snapshots: ${status.working.snapshots.length}`,
    `- Active/ready working snapshots: ${status.working.snapshots.filter(isAutoLoadableRecord).length}`,
    `- Reference documents: ${status.reference.documents.length}`,
    `- Snapshot index entries: ${status.reference.snapshot_index?.length ?? 0}`,
    `- Inbox items: ${status.working.inbox_items.length}`,
    `- Outbox items: ${status.working.outbox_items.length}`,
    `- Pending decisions: ${status.decision.pending_decisions.length}`,
    `- Human decisions: ${status.decision.human_decisions.length}`,
    "",
    "## False Closure Warning",
    "",
    status.manifest.false_closure_warning,
    "",
    "## Reference Documents",
    "",
    ...status.reference.documents.map(
      (document) =>
        `- ${document.id}: ${document.title} (${document.kind}, ${document.status})`,
    ),
    "",
    "## Lifecycle / Status Summary",
    "",
    "- Working DB",
    ...formatCountLines(workingStatusCounts),
    "- Reference DB",
    ...formatCountLines(referenceStatusCounts),
    "- Decision DB",
    ...formatCountLines(decisionStatusCounts),
    "",
    "## Category Summary",
    "",
    ...formatCountLines(categoryCounts),
    "",
    "## Tag Summary",
    "",
    ...formatCountLines(tagCounts),
    "",
    "## Snapshot Index",
    "",
    ...((status.reference.snapshot_index ?? []).length > 0
      ? status.reference.snapshot_index.map(
          (snapshot) =>
            `- ${snapshot.snapshot_id}: ${snapshot.title} (${snapshot.status})`,
        )
      : ["- No snapshot index entries recorded."]),
    "",
    "## Working Snapshots",
    "",
    ...(status.working.snapshots.length > 0
      ? status.working.snapshots.map((snapshot) => {
          const title =
            "title" in snapshot ? snapshot.title : snapshot.snapshot_title;
          return `- ${snapshot.snapshot_id}: ${title} (${snapshot.record_status ?? snapshot.status})`;
        })
      : ["- No working snapshots recorded."]),
    "",
    "## Inbox Items",
    "",
    ...(status.working.inbox_items.length > 0
      ? status.working.inbox_items.map(
          (item) =>
            `- ${item.id}: ${item.kind} (${item.record_status}) ${item.source_path}:${item.source_start_line}-${item.source_end_line}`,
        )
      : ["- No inbox items recorded."]),
    "",
    "## Outbox Items",
    "",
    ...(status.working.outbox_items.length > 0
      ? status.working.outbox_items.map(
          (item) =>
            `- ${item.id}: ${item.kind} (${item.record_status}) ${item.output_path}`,
        )
      : ["- No outbox items recorded."]),
    "",
    "## Pending Human Decisions",
    "",
    ...status.decision.pending_decisions.map(
      (decision) =>
        `- ${decision.id}: ${decision.decision_item} -> ${decision.recommended_status} (${decision.record_status ?? "pending"})`,
    ),
    "",
    "## Human Decisions",
    "",
    ...(status.decision.human_decisions.length > 0
      ? status.decision.human_decisions.map(
          (decision) =>
            `- ${decision.id}: ${decision.source_decision_id} -> ${decision.human_status}`,
        )
      : ["- No human decisions recorded."]),
    "",
  ];

  await writeFile(outputPath, `${lines.join("\n")}\n`, "utf8");
  return toWorkspacePath(outputPath);
}

export async function exportRehydrationPacket(
  snapshotIds: string[],
): Promise<OutboxItem> {
  if (snapshotIds.length === 0) {
    throw new Error("export-rehydration requires at least one snapshot id.");
  }

  const status = await cognitiveDbStatus();
  const paths = cognitiveDbPaths();
  const normalizedIds = snapshotIds.map((id) => id.toUpperCase());
  const selected = normalizedIds.map((snapshotId) => {
    const record = status.working.snapshots.find(
      (snapshot) => snapshot.snapshot_id.toUpperCase() === snapshotId,
    );

    if (!record) {
      throw new Error(`Working snapshot "${snapshotId}" was not found.`);
    }
    if (!isAutoLoadableRecord(record)) {
      throw new Error(
        `Working snapshot "${snapshotId}" is not ready for rehydration. Current status: ${record.record_status ?? record.status}.`,
      );
    }

    return record;
  });
  const generatedAt = now();
  const timestampSlug = generatedAt.replace(/[:.]/g, "-");
  const outputPath = path.join(
    paths.exports,
    `rehydration-${timestampSlug}.md`,
  );
  const bodies = await Promise.all(
    selected.map(async (record) => {
      if (!("body_path" in record)) {
        return null;
      }
      return readFile(path.resolve(workspaceRoot, record.body_path), "utf8");
    }),
  );
  const lines = [
    "# CognitiveOS Rehydration Packet",
    "",
    `Generated: ${generatedAt}`,
    "",
    "## False Closure Warning",
    "",
    status.manifest.false_closure_warning,
    "",
    "## Load Instruction",
    "",
    "You are receiving a CognitiveOS rehydration packet exported from the local Runtime DB.",
    "Treat all included snapshots as context for continuation, not as final adoption or Human final decision.",
    "Resume from the Return Query and preserve Origin Separation, Trust Cache Reset, and HumanGate discipline.",
    "",
    "## Selected Snapshots",
    "",
    ...selected.map((record, index) => {
      const title = "title" in record ? record.title : record.snapshot_title;
      return [
        `### ${index + 1}. ${record.snapshot_id} - ${title}`,
        "",
        `- Status: ${record.record_status ?? record.status}`,
        `- Record type: ${record.record_type ?? "unknown"}`,
        `- Source: ${"source_path" in record ? record.source_path : "not recorded"}`,
        `- Return query: ${formatInline(record.return_query ?? "")}`,
        `- Tags: ${(record.tags ?? []).join(", ") || "none"}`,
        "",
      ].join("\n");
    }),
    "## Re-entry Query",
    "",
    selected
      .map((record) => record.return_query ?? "")
      .filter(Boolean)
      .join("\n\n"),
    "",
    "## Snapshot Bodies",
    "",
    ...selected.flatMap((record, index) => {
      const title = "title" in record ? record.title : record.snapshot_title;
      const body = bodies[index];
      return [
        `### ${record.snapshot_id} - ${title}`,
        "",
        body?.trimEnd() || "This snapshot has no local body file.",
        "",
      ];
    }),
  ];

  const body = `${lines.join("\n")}\n`;
  await writeFile(outputPath, body, "utf8");
  status.working.outbox_items ??= [];
  const existingOutboxIds = new Set(status.working.outbox_items.map((item) => item.id));
  const outboxId = nextOutboxId(existingOutboxIds);
  const outboxItem: OutboxItem = {
    ...buildRecordMetadata({
      recordType: "rehydration_packet",
      recordStatus: "ready",
      lifecycleStage: "working",
      title: `Rehydration Packet ${outboxId}`,
      sourceIds: selected.map((record) => record.snapshot_id),
      linkedRecordIds: selected.map((record) => record.snapshot_id),
    }),
    id: outboxId,
    kind: "rehydration_packet",
    record_status: "ready",
    lifecycle_stage: "working",
    output_path: toWorkspacePath(outputPath),
    snapshot_ids: selected.map((record) => record.snapshot_id),
    sha256: sha256(body),
    bytes: Buffer.byteLength(body, "utf8"),
    created_at: generatedAt,
    updated_at: generatedAt,
    tags: ["export", "rehydration", "outbox"],
  };

  status.working.outbox_items.push(outboxItem);
  status.working.updated_at = generatedAt;
  await writeJson(paths.workingDb, status.working);

  return outboxItem;
}

export async function exportStateHandoff(): Promise<OutboxItem> {
  const status = await cognitiveDbStatus();
  const paths = cognitiveDbPaths();
  const generatedAt = now();
  const timestampSlug = generatedAt.replace(/[:.]/g, "-");
  const outputPath = path.join(paths.exports, `state-handoff-${timestampSlug}.md`);
  const readySnapshots = status.working.snapshots.filter(isAutoLoadableRecord);
  const pendingDecisions = status.decision.pending_decisions.filter(
    (decision) => (decision.record_status ?? "pending") === "pending",
  );
  const lines = [
    "# CognitiveOS State Handoff",
    "",
    `Generated: ${generatedAt}`,
    "",
    "## False Closure Warning",
    "",
    status.manifest.false_closure_warning,
    "",
    "## Current State",
    "",
    `- Working snapshots: ${status.working.snapshots.length}`,
    `- Active/ready working snapshots: ${readySnapshots.length}`,
    `- Reference documents: ${status.reference.documents.length}`,
    `- Snapshot index entries: ${status.reference.snapshot_index?.length ?? 0}`,
    `- Inbox items: ${status.working.inbox_items.length}`,
    `- Outbox items: ${status.working.outbox_items.length}`,
    `- Decision candidates: ${status.decision.pending_decisions.length}`,
    `- Open pending decisions: ${pendingDecisions.length}`,
    `- Human decisions: ${status.decision.human_decisions.length}`,
    "",
    "## Ready Snapshots",
    "",
    ...(readySnapshots.length > 0
      ? readySnapshots.map((snapshot) => {
          const title = "title" in snapshot ? snapshot.title : snapshot.snapshot_title;
          return `- ${snapshot.snapshot_id}: ${title} (${snapshot.record_status ?? snapshot.status})`;
        })
      : ["- No ready snapshots."]),
    "",
    "## Inbox",
    "",
    ...(status.working.inbox_items.length > 0
      ? status.working.inbox_items.map(
          (item) =>
            `- ${item.id}: ${item.kind} (${item.record_status}) ${item.source_path}:${item.source_start_line}-${item.source_end_line}`,
        )
      : ["- No inbox items."]),
    "",
    "## Recent Outbox",
    "",
    ...(status.working.outbox_items.length > 0
      ? status.working.outbox_items.slice(-5).map(
          (item) =>
            `- ${item.id}: ${item.kind} (${item.record_status}) ${item.output_path}`,
        )
      : ["- No outbox items."]),
    "",
    "## Human Decisions",
    "",
    ...(status.decision.human_decisions.length > 0
      ? status.decision.human_decisions.map(
          (decision) =>
            `- ${decision.id}: ${decision.source_decision_id} -> ${decision.human_status} (${decision.decision_item})`,
        )
      : ["- No human decisions recorded."]),
    "",
    "## Pending Decisions",
    "",
    ...(pendingDecisions.length > 0
      ? pendingDecisions.map(
          (decision) =>
            `- ${decision.id}: ${decision.decision_item} recommended=${decision.recommended_status}`,
        )
      : ["- No pending decisions."]),
    "",
    "## Suggested Commands",
    "",
    "- List snapshots: `npm.cmd run cognitive-db -- list-snapshots`",
    "- Export full rehydration: `npm.cmd run cognitive-db -- export-rehydration <SNAPSHOT-ID...>`",
    "- List decisions: `npm.cmd run cognitive-db -- list-decisions`",
    "- Record decision: `npm.cmd run cognitive-db -- decide <HD-CAND-ID> <status> \"note\"`",
    "",
  ];
  const body = `${lines.join("\n")}\n`;

  await writeFile(outputPath, body, "utf8");
  status.working.outbox_items ??= [];
  const outboxId = nextOutboxId(
    new Set(status.working.outbox_items.map((item) => item.id)),
  );
  const outboxItem: OutboxItem = {
    ...buildRecordMetadata({
      recordType: "state_handoff",
      recordStatus: "ready",
      lifecycleStage: "working",
      title: `State Handoff ${outboxId}`,
      sourceIds: readySnapshots.map((snapshot) => snapshot.snapshot_id),
      linkedRecordIds: [
        ...readySnapshots.map((snapshot) => snapshot.snapshot_id),
        ...status.decision.human_decisions.map((decision) => decision.id),
      ],
    }),
    id: outboxId,
    kind: "state_handoff",
    record_status: "ready",
    lifecycle_stage: "working",
    output_path: toWorkspacePath(outputPath),
    snapshot_ids: readySnapshots.map((snapshot) => snapshot.snapshot_id),
    sha256: sha256(body),
    bytes: Buffer.byteLength(body, "utf8"),
    created_at: generatedAt,
    updated_at: generatedAt,
    tags: ["export", "handoff", "outbox", "state"],
  };

  status.working.outbox_items.push(outboxItem);
  status.working.updated_at = generatedAt;
  await writeJson(paths.workingDb, status.working);

  return outboxItem;
}

function nextWorkingSnapshotId(existingIds: Set<string>): string {
  let nextNumber = 1;

  for (const id of existingIds) {
    const match = id.match(/^WSNAP-(\d+)$/);
    if (!match) {
      continue;
    }
    nextNumber = Math.max(nextNumber, Number(match[1]) + 1);
  }

  return `WSNAP-${String(nextNumber).padStart(3, "0")}`;
}

function nextOutboxId(existingIds: Set<string>): string {
  let nextNumber = 1;

  for (const id of existingIds) {
    const match = id.match(/^OUTBOX-(\d+)$/);
    if (!match) {
      continue;
    }
    nextNumber = Math.max(nextNumber, Number(match[1]) + 1);
  }

  return `OUTBOX-${String(nextNumber).padStart(3, "0")}`;
}

function nextHumanDecisionId(existingIds: Set<string>): string {
  let nextNumber = 1;

  for (const id of existingIds) {
    const match = id.match(/^HD-(\d+)$/);
    if (!match) {
      continue;
    }
    nextNumber = Math.max(nextNumber, Number(match[1]) + 1);
  }

  return `HD-${String(nextNumber).padStart(3, "0")}`;
}

function mapHumanStatusToCandidateStatus(
  humanStatus: HumanDecisionRecord["human_status"],
): CognitiveRecordStatus {
  switch (humanStatus) {
    case "adopted":
    case "adopted_with_conditions":
    case "trial_only":
    case "parked":
    case "rejected":
      return humanStatus;
  }
}

type SnapshotBlock = {
  snapshotId: string;
  startLine: number;
  endLine: number;
};

function findSnapshotBlocks(lines: string[]): SnapshotBlock[] {
  const starts: Array<{ snapshotId: string; startLine: number }> = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const label = stripMarkdownHeading(line);
    const headingMatch = line.match(/^#{1,6}\s+(SNAP-\d{3,})\b/i);
    const inlineMatch = label.match(/^Snapshot ID:\s*(SNAP-\d{3,})\b/i);
    const previous = findPreviousNonEmptyLine(lines, index - 1);
    const previousLabel = previous ? stripMarkdownHeading(previous.text) : null;

    if (headingMatch || inlineMatch) {
      if (inlineMatch && previousLabel?.toLowerCase() === "save status") {
        continue;
      }
      starts.push({
        snapshotId: (headingMatch?.[1] ?? inlineMatch?.[1] ?? "").toUpperCase(),
        startLine: Math.max(1, index + 1),
      });
      continue;
    }

    if (/^Snapshot ID\s*$/i.test(label)) {
      if (previousLabel?.toLowerCase() === "save status") {
        continue;
      }
      const next = findNextNonEmptyLine(lines, index + 1);
      const nextMatch = next?.text.match(/^(SNAP-\d{3,})\b/i);
      if (next && nextMatch) {
        starts.push({
          snapshotId: nextMatch[1].toUpperCase(),
          startLine:
            previous && previousLabel?.toLowerCase() === "branch snapshot"
              ? previous.lineNumber
              : index + 1,
        });
      }
    }
  }

  return starts.map((start, index) => ({
    snapshotId: start.snapshotId,
    startLine: start.startLine,
    endLine: findSnapshotBlockEndLine(
      lines,
      start.startLine,
      starts[index + 1]?.startLine,
    ),
  }));
}

function findSnapshotBlockEndLine(
  lines: string[],
  startLine: number,
  nextStartLine?: number,
): number {
  const hardEnd = nextStartLine ? nextStartLine - 1 : lines.length;
  let sawSaveStatus = false;

  for (let lineNumber = startLine; lineNumber <= hardEnd; lineNumber += 1) {
    const text = stripMarkdownHeading(lines[lineNumber - 1].trim());
    if (/^Save Status\s*$/i.test(text)) {
      sawSaveStatus = true;
    }
    if (sawSaveStatus && /^Recommended Re-entry:/i.test(text)) {
      return lineNumber;
    }
  }

  return hardEnd;
}

function findNextNonEmptyLine(
  lines: string[],
  startIndex: number,
): { text: string; lineNumber: number } | null {
  for (let index = startIndex; index < lines.length; index += 1) {
    const text = lines[index].trim();
    if (text) {
      return { text, lineNumber: index + 1 };
    }
  }
  return null;
}

function findPreviousNonEmptyLine(
  lines: string[],
  startIndex: number,
): { text: string; lineNumber: number } | null {
  for (let index = startIndex; index >= 0; index -= 1) {
    const text = lines[index].trim();
    if (text) {
      return { text, lineNumber: index + 1 };
    }
  }
  return null;
}

function stripMarkdownHeading(text: string): string {
  return text.replace(/^#{1,6}\s+/, "").trim();
}

function extractImportedSnapshotTitle(content: string, snapshotId: string): string {
  const titleIndex = content.split(/\r?\n/).findIndex((line) =>
    /^Snapshot Title\s*$/i.test(stripMarkdownHeading(line.trim())),
  );
  if (titleIndex >= 0) {
    const lines = content.split(/\r?\n/);
    const next = findNextNonEmptyLine(lines, titleIndex + 1);
    if (next) {
      return `${snapshotId} ${next.text}`;
    }
  }

  const heading = content.match(/^#{1,6}\s+(.+)$/m)?.[1]?.trim();
  return heading || snapshotId;
}

function extractReturnQuery(
  content: string,
  snapshotId: string,
  title: string,
): string {
  const lines = content.split(/\r?\n/);
  const returnQueryIndex = lines.findIndex((line) =>
    /^Return Query\s*$/i.test(stripMarkdownHeading(line.trim())),
  );
  if (returnQueryIndex >= 0) {
    let next = findNextNonEmptyLine(lines, returnQueryIndex + 1);
    if (next && /^`{3}/.test(next.text.trim())) {
      next = findNextNonEmptyLine(lines, next.lineNumber);
    }
    if (next && !/^`{3}/.test(next.text.trim())) {
      return next.text;
    }
  }

  return `${snapshotId} ${title}`;
}

function buildAiSnapshotizerPrompt(input: {
  inboxItem: InboxItem;
  inboxBody: string;
  snapshotId: string;
  duplicateCandidates: Array<{ snapshot_id: string; title: string; score: number }>;
}): string {
  const candidateLines = input.duplicateCandidates.length > 0
    ? input.duplicateCandidates
        .map((candidate) => `- ${candidate.snapshot_id}: ${candidate.title} (score ${candidate.score})`)
        .join("\n")
    : "- None";

  return [
    "You are AISnapshotizer for CognitiveOS DB Runtime.",
    "Convert the provided Inbox material into one high-quality CognitiveOS Branch Snapshot.",
    "",
    "Hard requirements:",
    `- Use this exact Snapshot ID: ${input.snapshotId}`,
    "- Preserve Human-originated wording as much as possible.",
    "- Separate Human-originated material from AI-assisted framing.",
    "- Do not claim formal adoption, PM Judgment, or Human final decision.",
    "- If similar existing snapshots are listed, do not merge automatically. Mention them as related context only when useful.",
    "- Return markdown only. Do not wrap the response in a code fence.",
    "",
    "Required Snapshot shape:",
    "# Branch Snapshot",
    "## Snapshot ID",
    input.snapshotId,
    "## Snapshot Title",
    "<concise Japanese title>",
    "## Snapshot Type",
    "Branch Snapshot",
    "## Status",
    "Ready",
    "## False Closure Warning",
    falseClosureWarning,
    "## Trigger",
    `Human requested AISnapshotizer save from ${input.inboxItem.id}.`,
    "## Branch Items",
    "Markdown table with BR-001..BR-n.",
    "## Human-originated Material",
    "Quote or preserve important Human wording from the Inbox material.",
    "## AI Seed / AI-assisted Framing",
    "AI-assisted framing, clearly separated.",
    "## Core Meaning",
    "One concise paragraph.",
    "## Why Preserve",
    "Why this branch should be saved.",
    "## Search Anchors",
    "Markdown code block or bullet list.",
    "## Human Phrase Anchors",
    "Important Human phrases.",
    "## Return Query",
    "One line including the Snapshot ID and search terms.",
    "## Potential Phase 3 Questions",
    "Numbered questions.",
    "## Origin Risk",
    "Markdown table.",
    "## Coverage Check",
    "Markdown table.",
    "# Snapshot Readiness Check",
    "Markdown table and readiness status.",
    "## Safe Next Action",
    "Recommended next action.",
    "",
    "Similar existing snapshots for HumanGate awareness:",
    candidateLines,
    "",
    "Inbox material:",
    "```md",
    input.inboxBody.trim(),
    "```",
  ].join("\n");
}

function stripOuterMarkdownFence(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^```(?:markdown|md)?\s*\r?\n([\s\S]*?)\r?\n```$/i);
  return match?.[1] ?? value;
}

function findSimilarSnapshotCandidates(input: {
  content: string;
  snapshots: Array<BranchSnapshot | WorkingSnapshotRecord>;
}): Array<{ snapshot_id: string; title: string; score: number }> {
  const sourceTokens = new Set(
    extractSearchAnchors(input.content.toLowerCase()).map((token) => token.toLowerCase()),
  );
  if (sourceTokens.size === 0) {
    return [];
  }

  return input.snapshots
    .map((snapshot) => {
      const title = snapshotTitle(snapshot);
      const haystack = [
        title,
        "return_query" in snapshot ? snapshot.return_query : "",
        "search_anchors" in snapshot ? snapshot.search_anchors.join(" ") : "",
      ].join(" ");
      const snapshotTokens = new Set(
        extractSearchAnchors(haystack.toLowerCase()).map((token) => token.toLowerCase()),
      );
      const score = [...sourceTokens].filter((token) => snapshotTokens.has(token)).length;
      return { snapshot_id: snapshot.snapshot_id, title, score };
    })
    .filter((candidate) => candidate.score >= 3)
    .sort((left, right) => right.score - left.score || left.snapshot_id.localeCompare(right.snapshot_id))
    .slice(0, 5);
}

function snapshotTitle(snapshot: BranchSnapshot | WorkingSnapshotRecord): string {
  return "title" in snapshot ? snapshot.title : snapshot.snapshot_title;
}

async function createHandoffInboxItems(input: {
  workingDb: WorkingDb;
  sourcePath: string;
  lines: string[];
  blocks: SnapshotBlock[];
}): Promise<InboxItem[]> {
  const ranges = buildNonSnapshotRanges(input.lines, input.blocks);
  const existingHashes = new Set(input.workingDb.inbox_items.map((item) => item.sha256));
  const existingIds = new Set(input.workingDb.inbox_items.map((item) => item.id));
  const items: InboxItem[] = [];

  for (const range of ranges) {
    const content = input.lines.slice(range.startLine - 1, range.endLine).join("\n").trim();
    if (content.length < 120) {
      continue;
    }

    const kind = classifyInboxCandidate(content);
    if (!kind) {
      continue;
    }

    const contentHash = sha256(content);
    if (existingHashes.has(contentHash)) {
      continue;
    }

    const id = nextInboxId(existingIds);
    const bodyPath = path.join(inboxRoot, `${id}.md`);
    const timestamp = now();
    const item: InboxItem = {
      id,
      kind,
      record_status: "needs_human_review",
      lifecycle_stage: "working",
      source_path: input.sourcePath,
      body_path: toWorkspacePath(bodyPath),
      source_start_line: range.startLine,
      source_end_line: range.endLine,
      sha256: contentHash,
      bytes: Buffer.byteLength(content, "utf8"),
      created_at: timestamp,
      updated_at: timestamp,
      tags: inferInboxTags(kind, content),
    };

    await writeFile(bodyPath, `${content}\n`, "utf8");
    input.workingDb.inbox_items.push(item);
    existingHashes.add(contentHash);
    existingIds.add(id);
    items.push(item);
  }

  return items;
}

function buildNonSnapshotRanges(
  lines: string[],
  blocks: SnapshotBlock[],
): Array<{ startLine: number; endLine: number }> {
  const ranges: Array<{ startLine: number; endLine: number }> = [];
  let cursor = 1;

  for (const block of blocks) {
    if (cursor < block.startLine) {
      ranges.push({ startLine: cursor, endLine: block.startLine - 1 });
    }
    cursor = block.endLine + 1;
  }

  if (cursor <= lines.length) {
    ranges.push({ startLine: cursor, endLine: lines.length });
  }

  return ranges;
}

function classifyInboxCandidate(content: string): InboxItem["kind"] | null {
  const normalized = content.toLowerCase();
  if (normalized.includes("human decision") || content.includes("Human Final Decision")) {
    return "human_decision_candidate";
  }
  if (normalized.includes("decision candidate") || normalized.includes("pending decision")) {
    return "decision_candidate";
  }
  if (normalized.includes("phase3") || normalized.includes("phase 3")) {
    return "phase3_candidate";
  }
  if (normalized.includes("phase2") || normalized.includes("phase 2")) {
    return "phase2_candidate";
  }
  return null;
}

function nextInboxId(existingIds: Set<string>): string {
  let nextNumber = 1;
  for (const id of existingIds) {
    const match = id.match(/^INBOX-(\d+)$/);
    if (!match) {
      continue;
    }
    nextNumber = Math.max(nextNumber, Number(match[1]) + 1);
  }
  return `INBOX-${String(nextNumber).padStart(3, "0")}`;
}

function inferInboxTags(kind: InboxItem["kind"], content: string): string[] {
  const tags = new Set<string>(["handoff_import", kind]);
  const normalized = content.toLowerCase();
  if (normalized.includes("phase2") || normalized.includes("phase 2")) {
    tags.add("phase2");
  }
  if (normalized.includes("phase3") || normalized.includes("phase 3")) {
    tags.add("phase3");
  }
  if (normalized.includes("decision")) {
    tags.add("decision");
  }
  if (normalized.includes("cognitive")) {
    tags.add("cognitive_os");
  }
  return [...tags].sort();
}

function inboxKindLabel(kind: InboxItem["kind"]): string {
  return kind
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

function formatInline(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function buildRecordMetadata(input: {
  recordType: string;
  recordStatus: CognitiveRecordStatus;
  lifecycleStage: CognitiveLifecycleStage;
  title: string;
  sourceIds?: string[];
  linkedRecordIds?: string[];
}): CognitiveRecordMetadata {
  const timestamp = now();
  const category = inferPrimaryCategory(input.title);
  const tags = inferTags(input.title, input.recordType);
  const linkedProjects = inferLinkedProjects(input.title, tags);

  return {
    record_type: input.recordType,
    record_status: input.recordStatus,
    lifecycle_stage: input.lifecycleStage,
    primary_category: category,
    secondary_categories: inferSecondaryCategories(input.title, category),
    tags,
    linked_projects: linkedProjects,
    cross_category: linkedProjects.length > 1,
    source_ids: input.sourceIds ?? [],
    linked_record_ids: input.linkedRecordIds ?? [],
    created_at: timestamp,
    updated_at: timestamp,
  };
}

function backfillLifecycleMetadata(input: {
  working: WorkingDb;
  reference: ReferenceDb;
  decision: DecisionDb;
}): { working: boolean; reference: boolean; decision: boolean } {
  let workingChanged = false;
  let referenceChanged = false;
  let decisionChanged = false;

  if (!input.working.inbox_items) {
    input.working.inbox_items = [];
    workingChanged = true;
  }
  if (!input.working.outbox_items) {
    input.working.outbox_items = [];
    workingChanged = true;
  }
  input.reference.snapshot_index ??= [];

  for (const snapshot of input.working.snapshots) {
    const title = "title" in snapshot ? snapshot.title : snapshot.snapshot_title;
    const sourceIds =
      "source_path" in snapshot && typeof snapshot.source_path === "string"
        ? [snapshot.source_path]
        : [];
    workingChanged =
      applyMetadataDefaults(snapshot, {
        recordType: "title" in snapshot ? "snapshot" : "branch_snapshot",
        recordStatus: inferWorkingRecordStatus(snapshot),
        lifecycleStage: "working",
        title,
        sourceIds,
      }) || workingChanged;
  }

  for (const item of input.working.inbox_items ?? []) {
    workingChanged =
      applyMetadataDefaults(item, {
        recordType: item.kind,
        recordStatus: item.record_status,
        lifecycleStage: "working",
        title: `${item.id} ${inboxKindLabel(item.kind)}`,
        sourceIds: [item.source_path],
      }) || workingChanged;
  }

  for (const item of input.working.outbox_items ?? []) {
    workingChanged =
      applyMetadataDefaults(item, {
        recordType: item.kind,
        recordStatus: item.record_status,
        lifecycleStage: "working",
        title: `${item.id} ${item.kind}`,
        sourceIds: item.snapshot_ids,
        linkedRecordIds: item.snapshot_ids,
      }) || workingChanged;
  }

  for (const document of input.reference.documents) {
    referenceChanged =
      applyMetadataDefaults(document, {
        recordType: document.kind,
        recordStatus: "active",
        lifecycleStage: "reference",
        title: document.title,
        sourceIds: [document.source_path],
      }) || referenceChanged;
  }

  for (const decision of input.decision.pending_decisions) {
    decisionChanged =
      applyMetadataDefaults(decision, {
        recordType: "decision_candidate",
        recordStatus: "pending",
        lifecycleStage: "decision",
        title: decision.decision_item,
        sourceIds: [decision.source],
      }) || decisionChanged;
  }

  input.decision.human_decisions ??= [];
  for (const decision of input.decision.human_decisions) {
    decisionChanged =
      applyMetadataDefaults(decision, {
        recordType: "human_decision",
        recordStatus: decision.human_status,
        lifecycleStage: "decision",
        title: decision.decision_item,
        sourceIds: [decision.source_decision_id, decision.source],
        linkedRecordIds: [decision.source_decision_id],
      }) || decisionChanged;
  }

  return {
    working: workingChanged,
    reference: referenceChanged,
    decision: decisionChanged,
  };
}

function applyMetadataDefaults(
  record: Partial<CognitiveRecordMetadata>,
  defaults: {
    recordType: string;
    recordStatus: CognitiveRecordStatus;
    lifecycleStage: CognitiveLifecycleStage;
    title: string;
    sourceIds?: string[];
    linkedRecordIds?: string[];
  },
): boolean {
  let changed = false;
  const metadata = buildRecordMetadata(defaults);

  for (const key of Object.keys(metadata) as Array<keyof CognitiveRecordMetadata>) {
    if (record[key] === undefined) {
      (record as Record<string, unknown>)[key] = metadata[key];
      changed = true;
    }
  }

  return changed;
}

function inferWorkingRecordStatus(
  snapshot: BranchSnapshot | WorkingSnapshotRecord,
): CognitiveRecordStatus {
  if ("record_status" in snapshot && snapshot.record_status) {
    return snapshot.record_status;
  }
  if (snapshot.status === "draft") {
    return "draft";
  }
  if (snapshot.status === "ready") {
    return "ready";
  }
  return "active";
}

function isAutoLoadableRecord(record: Partial<CognitiveRecordMetadata>): boolean {
  return ["active", "ready", "selected"].includes(record.record_status ?? "active");
}

function countBy<T>(
  records: T[],
  getKey: (record: T) => string,
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const record of records) {
    const key = getKey(record);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return sortCountRecord(counts);
}

function countTags(records: Array<Partial<CognitiveRecordMetadata>>): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const record of records) {
    for (const tag of record.tags ?? []) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }

  return sortCountRecord(counts);
}

function sortCountRecord(counts: Record<string, number>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function formatCountLines(counts: Record<string, number>): string[] {
  const entries = Object.entries(counts);
  if (entries.length === 0) {
    return ["  - none: 0"];
  }
  return entries.map(([key, value]) => `  - ${key}: ${value}`);
}

function inferPrimaryCategory(title: string): string {
  const normalized = title.toLowerCase();
  if (normalized.includes("cognitive")) {
    return "cognitive_os";
  }
  if (normalized.includes("ai事業") || normalized.includes("business_os")) {
    return "ai_business_os";
  }
  if (
    normalized.includes("runtime") ||
    normalized.includes("workflow") ||
    normalized.includes("db") ||
    normalized.includes("software")
  ) {
    return "software_dev";
  }
  if (normalized.includes("life") || normalized.includes("goal")) {
    return "personal_life_goal";
  }
  return "uncategorized";
}

function inferSecondaryCategories(title: string, primaryCategory: string): string[] {
  const categories = new Set<string>();
  const normalized = title.toLowerCase();

  if (primaryCategory !== "cognitive_os" && normalized.includes("cognitive")) {
    categories.add("cognitive_os");
  }
  if (primaryCategory !== "ai_business_os" && normalized.includes("ai事業")) {
    categories.add("ai_business_os");
  }
  if (
    primaryCategory !== "software_dev" &&
    (normalized.includes("runtime") || normalized.includes("workflow") || normalized.includes("db"))
  ) {
    categories.add("software_dev");
  }

  return [...categories];
}

function inferTags(title: string, recordType: string): string[] {
  const tags = new Set<string>([recordType]);
  const normalized = title.toLowerCase();

  for (const [needle, tag] of [
    ["snapshot", "snapshot"],
    ["snap", "snapshot"],
    ["runtime", "runtime"],
    ["workflow", "workflow_runner"],
    ["db", "db_runtime"],
    ["human", "human_gate"],
    ["decision", "decision"],
    ["phase2", "phase2"],
    ["phase3", "phase3"],
    ["prompt", "prompt_set"],
  ] as const) {
    if (normalized.includes(needle)) {
      tags.add(tag);
    }
  }

  return [...tags].sort();
}

function inferLinkedProjects(title: string, tags: string[]): string[] {
  const projects = new Set<string>();
  const normalized = title.toLowerCase();

  if (normalized.includes("cognitive") || tags.includes("db_runtime")) {
    projects.add("CognitiveOS");
  }
  if (normalized.includes("ai事業") || tags.includes("workflow_runner")) {
    projects.add("AI事業OS");
  }

  return [...projects];
}

function buildNormalizedSnapshotBody(input: {
  snapshotId: string;
  title: string;
  sourcePath: string;
  rawContent: string;
}): string {
  const anchors = extractSearchAnchors(input.rawContent);
  const branchItems = extractBranchItems(input.rawContent);
  const coreMeaning = summarizeCoreMeaning(input.rawContent);

  return [
    `# ${input.snapshotId} ${input.title}`,
    "",
    "## False Closure Warning",
    "",
    falseClosureWarning,
    "",
    "## Source",
    "",
    `- Source path: ${input.sourcePath}`,
    "- Transformation: deterministic normalize-snapshot v1",
    "- Status: draft working snapshot, not adopted",
    "",
    "## Core Meaning",
    "",
    coreMeaning,
    "",
    "## Why Preserve",
    "",
    "This branch may be useful for later reopening, comparison, PM review, or Phase2/Phase3 extraction.",
    "",
    "## Branch Items",
    "",
    ...branchItems.map((item, index) => `- BR-${String(index + 1).padStart(3, "0")}: ${item}`),
    "",
    "## Search Anchors",
    "",
    ...anchors.map((anchor) => `- ${anchor}`),
    "",
    "## Return Query",
    "",
    `${input.snapshotId} ${input.title} ${anchors.slice(0, 5).join(" ")}`,
    "",
    "## Potential Phase3 Questions",
    "",
    "- What should be adopted, parked, rejected, or kept as trial material?",
    "- Which parts are Human-originated decisions versus AI-assisted framing?",
    "- Does this branch require a Reference DB promotion or a Decision DB item?",
    "",
    "## Origin Risk",
    "",
    "Raw material is preserved below. Any interpretation above is a deterministic working normalization and must not be treated as Human final decision.",
    "",
    "## Raw Material",
    "",
    input.rawContent.trimEnd(),
    "",
  ].join("\n");
}

function summarizeCoreMeaning(content: string): string {
  const firstParagraph = content
    .split(/\r?\n\r?\n/)
    .map((block) => block.trim())
    .find((block) => block && !block.startsWith("#"));

  if (!firstParagraph) {
    return "Raw material was preserved as a working branch for later review.";
  }

  return truncateForLine(firstParagraph.replace(/\s+/g, " "), 280);
}

function extractBranchItems(content: string): string[] {
  const candidates = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- ") || line.startsWith("* "))
    .map((line) => line.replace(/^[-*]\s+/, "").trim())
    .filter(Boolean);

  if (candidates.length > 0) {
    return candidates.slice(0, 12).map((line) => truncateForLine(line, 180));
  }

  const headings = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^#{2,6}\s+/.test(line))
    .map((line) => line.replace(/^#{2,6}\s+/, "").trim());

  if (headings.length > 0) {
    return headings.slice(0, 12).map((line) => truncateForLine(line, 180));
  }

  return ["Preserve raw session material for later extraction."];
}

function extractSearchAnchors(content: string): string[] {
  const matches = content.match(/[A-Za-z][A-Za-z0-9_-]{2,}|SNAP-\d+|WSNAP-\d+/g) ?? [];
  const anchors = new Set<string>();

  for (const match of matches) {
    anchors.add(match);
    if (anchors.size >= 12) {
      break;
    }
  }

  if (anchors.size === 0) {
    anchors.add("CognitiveOS");
    anchors.add("Working Snapshot");
  }

  return [...anchors];
}

function truncateForLine(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 3)}...`;
}

async function ensureInitialized(): Promise<void> {
  const paths = cognitiveDbPaths();

  try {
    await readFile(paths.manifest, "utf8");
  } catch {
    await initCognitiveDb();
  }
}

function extractTitle(content: string, fallback: string): string {
  const title = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return title || fallback;
}

function classifyReferenceKind(fileName: string): ReferenceDocument["kind"] {
  if (fileName.includes("Prompt_Set")) {
    return "prompt_set";
  }
  if (fileName.includes("Core_Discipline")) {
    return "core_discipline";
  }
  if (fileName.includes("Snapshot_Handoff")) {
    return "snapshot_handoff";
  }
  if (fileName.toLowerCase().includes("workflow_runner")) {
    return "workflow_runner_snapshot_handoff";
  }
  return "db_phase_material";
}

function extractSnapshotIndexEntries(
  content: string,
  document: ReferenceDocument,
): SnapshotIndexEntry[] {
  const entries: SnapshotIndexEntry[] = [];
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("| SNAP-")) {
      continue;
    }

    const cells = trimmed
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());

    if (cells.length < 4) {
      continue;
    }

    const [snapshotId, title, rawStatus, rawReturnQuery] = cells;
    if (!/^SNAP-\d+$/i.test(snapshotId)) {
      continue;
    }

    entries.push({
      snapshot_id: snapshotId.toUpperCase(),
      title,
      status: normalizeSnapshotStatus(rawStatus),
      return_query: rawReturnQuery.replace(/^`|`$/g, ""),
      source_document_id: document.id,
      source_path: document.source_path,
      ingested_at: now(),
    });
  }

  return entries;
}

function normalizeSnapshotStatus(
  status: string,
): SnapshotIndexEntry["status"] {
  const normalized = status.trim().toLowerCase();
  if (normalized === "ready") {
    return "ready";
  }
  if (normalized === "conditional") {
    return "conditional";
  }
  if (normalized === "not_ready" || normalized === "not ready") {
    return "not_ready";
  }
  return "unknown";
}

function defaultPendingDecisions(): PendingDecision[] {
  return [
    {
      id: "HD-CAND-001",
      decision_item: "CognitiveOS Runtime Workspace",
      recommended_status: "adopt_with_conditions",
      condition: "Start with the smallest trial workspace.",
      source: "REF-2deb7c82188b / CognitiveOS DB phase material",
      status: "pending_human_decision",
    },
    {
      id: "HD-CAND-002",
      decision_item: "Working DB / Reference DB / Decision DB layered structure",
      recommended_status: "adopt_with_conditions",
      condition: "Begin as logical three-layer DB; decide physical separation later.",
      source: "REF-2deb7c82188b / CognitiveOS DB phase material",
      status: "pending_human_decision",
    },
    {
      id: "HD-CAND-003",
      decision_item: "Snapshot managed in Working DB",
      recommended_status: "adopt",
      condition: "Clear Working DB contents after Phase2/3 migration when safe.",
      source: "REF-2deb7c82188b / CognitiveOS DB phase material",
      status: "pending_human_decision",
    },
    {
      id: "HD-CAND-004",
      decision_item: "Phase2/3 documents stored in Reference DB",
      recommended_status: "adopt_with_conditions",
      condition: "Trial document-level storage plus section metadata.",
      source: "REF-2deb7c82188b / CognitiveOS DB phase material",
      status: "pending_human_decision",
    },
    {
      id: "HD-CAND-005",
      decision_item: "Decision DB centered on Human Decision List",
      recommended_status: "adopt",
      condition: "Reference document link IDs are required.",
      source: "REF-2deb7c82188b / CognitiveOS DB phase material",
      status: "pending_human_decision",
    },
    {
      id: "HD-CAND-006",
      decision_item: "inbox / outbox as Runtime Workspace boundaries",
      recommended_status: "adopt",
      condition: "Clear inbox at session end; outbox must mark adoption state.",
      source: "REF-2deb7c82188b / CognitiveOS DB phase material",
      status: "pending_human_decision",
    },
    {
      id: "HD-CAND-007",
      decision_item: "TransferPacket as trial cross-runtime package",
      recommended_status: "trial_only",
      condition: "Start with a light format; formal schema remains parked.",
      source: "REF-2deb7c82188b / CognitiveOS DB phase material",
      status: "pending_human_decision",
    },
    {
      id: "HD-CAND-008",
      decision_item: "Reopen / Fork model",
      recommended_status: "adopt_with_conditions",
      condition: "Detailed supersession lifecycle remains parked.",
      source: "REF-2deb7c82188b / CognitiveOS DB phase material",
      status: "pending_human_decision",
    },
    {
      id: "HD-CAND-009",
      decision_item: "Scoped Divergence",
      recommended_status: "adopt",
      condition: "Human explicitly controls the scope of divergence.",
      source: "REF-2deb7c82188b / CognitiveOS DB phase material",
      status: "pending_human_decision",
    },
    {
      id: "HD-CAND-010",
      decision_item: "Pre-Phase2 Snapshot timing rule",
      recommended_status: "adopt",
      condition: "Treat as Snapshot timing rule, not as a new feature.",
      source: "REF-2deb7c82188b / CognitiveOS DB phase material",
      status: "pending_human_decision",
    },
  ];
}

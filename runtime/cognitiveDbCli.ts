// @ts-ignore Node 24 runs this local CLI directly from TypeScript source.
import { buildReversibilityCheckPacket, cognitiveDbPaths, cognitiveDbStatus, createWorkingSnapshot, exportCognitiveDbSummary, exportRehydrationPacket, exportStateHandoff, importCognitiveHandoff, ingestCognitiveOsInputFiles, initCognitiveDb, listHumanDecisions, listInboxItems, listOutboxItems, listPendingDecisions, listWorkingSnapshots, normalizeWorkingSnapshot, promoteInboxItemToSnapshot, readInboxItem, readOutboxItem, readPendingDecision, readWorkingSnapshot, recordHumanDecision, snapshotizeInboxItem, updateInboxItemStatus, updateWorkingSnapshotStatus } from "./cognitiveDb.ts";

type ExecutorName = "mock" | "codex" | "claude" | "gemini";

const cognitiveOsInputFiles = [
  "input/CognitiveOS_DB化検討.md",
  "input/Cognitive_OS_Core_Discipline_Addendum_v0.1.1.md",
  "input/Cognitive_OS_Prompt_Set_Draft_v0.3.1.1.md",
  "input/Cognitive_OS_Snapshot_Handoff_Operational_Addendum_v0.1.1.md",
  "input/ai事業os_workflow_runner_v_0_引き継ぎ資料_snap_005_009.md",
];

const workingSnapshotStatuses = [
  "draft",
  "active",
  "ready",
  "closed",
  "archived",
  "superseded",
  "reopened",
] as const;

const inboxItemStatuses = [
  "needs_human_review",
  "active",
  "closed",
  "archived",
  "promoted",
  "rejected",
  "parked",
] as const;

const humanDecisionStatuses = [
  "adopted",
  "adopted_with_conditions",
  "trial_only",
  "parked",
  "rejected",
] as const;

const executorNames = ["mock", "codex", "claude", "gemini"] as const;

function usage(): string {
  return [
    "Usage:",
    "  npm run cognitive-db -- init",
    "  npm run cognitive-db -- ingest-inputs",
    "  npm run cognitive-db -- create-snapshot <input.md>",
    "  npm run cognitive-db -- normalize-snapshot <input.md>",
    "  npm run cognitive-db -- import-handoff <input.md>",
    "  npm run cognitive-db -- list-inbox",
    "  npm run cognitive-db -- show-inbox <INBOX-ID>",
    "  npm run cognitive-db -- set-inbox-status <INBOX-ID> <needs_human_review|active|closed|archived|promoted|rejected|parked>",
    "  npm run cognitive-db -- promote-inbox-to-snapshot <INBOX-ID>",
    "  npm run cognitive-db -- snapshotize-inbox <INBOX-ID> [--executor mock|codex|claude|gemini] [--dry-run]",
    "  npm run cognitive-db -- list-exports",
    "  npm run cognitive-db -- show-export <OUTBOX-ID>",
    "  npm run cognitive-db -- list-decisions",
    "  npm run cognitive-db -- show-decision <HD-CAND-ID>",
    "  npm run cognitive-db -- decide <HD-CAND-ID> <adopted|adopted_with_conditions|trial_only|parked|rejected> [note...]",
    "  npm run cognitive-db -- list-human-decisions",
    "  npm run cognitive-db -- list-snapshots",
    "  npm run cognitive-db -- show-snapshot <WSNAP-ID>",
    "  npm run cognitive-db -- reversibility-check <WSNAP-ID>",
    "  npm run cognitive-db -- set-snapshot-status <WSNAP-ID> <draft|active|ready|closed|archived|superseded|reopened>",
    "  npm run cognitive-db -- mark-snapshot-ready <WSNAP-ID>",
    "  npm run cognitive-db -- close-snapshot <WSNAP-ID>",
    "  npm run cognitive-db -- archive-snapshot <WSNAP-ID>",
    "  npm run cognitive-db -- status",
    "  npm run cognitive-db -- export-summary",
    "  npm run cognitive-db -- export-rehydration <SNAPSHOT-ID...>",
    "  npm run cognitive-db -- export-state-handoff",
  ].join("\n");
}

async function main(): Promise<void> {
  const command = process.argv[2];

  switch (command) {
    case "init": {
      const manifest = await initCognitiveDb();
      console.log(`Initialized ${manifest.directories.db}`);
      return;
    }
    case "ingest-inputs": {
      const documents = await ingestCognitiveOsInputFiles(cognitiveOsInputFiles);
      console.log(`Ingested ${documents.length} CognitiveOS reference document(s).`);
      for (const document of documents) {
        console.log(`- ${document.id}: ${document.title}`);
      }
      return;
    }
    case "create-snapshot": {
      const inputPath = process.argv[3];
      if (!inputPath) {
        throw new Error("create-snapshot requires an input markdown path.");
      }

      const snapshot = await createWorkingSnapshot(inputPath);
      console.log(`Created ${snapshot.snapshot_id}: ${snapshot.title}`);
      console.log(`Body: ${snapshot.body_path}`);
      return;
    }
    case "normalize-snapshot": {
      const inputPath = process.argv[3];
      if (!inputPath) {
        throw new Error("normalize-snapshot requires an input markdown path.");
      }

      const snapshot = await normalizeWorkingSnapshot(inputPath);
      console.log(`Normalized ${snapshot.snapshot_id}: ${snapshot.title}`);
      console.log(`Body: ${snapshot.body_path}`);
      return;
    }
    case "import-handoff": {
      const inputPath = process.argv[3];
      if (!inputPath) {
        throw new Error("import-handoff requires an input markdown path.");
      }

      const result = await importCognitiveHandoff(inputPath);
      console.log(`Imported snapshots: ${result.importedSnapshots.length}`);
      for (const snapshot of result.importedSnapshots) {
        console.log(`- ${snapshot.snapshot_id}: ${snapshot.title}`);
      }
      console.log(`Updated snapshots: ${result.updatedSnapshots.length}`);
      for (const snapshot of result.updatedSnapshots) {
        console.log(`- ${snapshot.snapshot_id}: ${snapshot.title}`);
      }
      console.log(`Skipped snapshots: ${result.skippedSnapshots.length}`);
      for (const snapshotId of result.skippedSnapshots) {
        console.log(`- ${snapshotId}`);
      }
      console.log(`Inbox items: ${result.inboxItems.length}`);
      for (const item of result.inboxItems) {
        console.log(`- ${item.id}: ${item.kind}`);
      }
      return;
    }
    case "list-inbox": {
      const items = await listInboxItems();
      if (items.length === 0) {
        console.log("No inbox items.");
        return;
      }

      for (const item of items) {
        const linked = (item.linked_record_ids ?? []).length > 0
          ? ` -> ${item.linked_record_ids?.join(", ")}`
          : "";
        console.log(
          `${item.id}: ${item.kind} (${item.record_status}) ${item.source_path}:${item.source_start_line}-${item.source_end_line}${linked}`,
        );
      }
      return;
    }
    case "show-inbox": {
      const inboxId = process.argv[3];
      if (!inboxId) {
        throw new Error("show-inbox requires an inbox id.");
      }

      const { item, body } = await readInboxItem(inboxId);
      console.log(`# ${item.id}: ${item.kind} (${item.record_status})`);
      console.log("");
      console.log(`Source: ${item.source_path}:${item.source_start_line}-${item.source_end_line}`);
      if ((item.linked_record_ids ?? []).length > 0) {
        console.log(`Linked records: ${item.linked_record_ids?.join(", ")}`);
      }
      console.log("");
      console.log(body);
      return;
    }
    case "set-inbox-status": {
      const inboxId = process.argv[3];
      const recordStatus = process.argv[4];
      if (!inboxId || !recordStatus) {
        throw new Error("set-inbox-status requires an inbox id and status.");
      }
      if (!isInboxItemStatus(recordStatus)) {
        throw new Error(
          `Unsupported inbox item status "${recordStatus}". Valid statuses: ${inboxItemStatuses.join(", ")}`,
        );
      }

      const item = await updateInboxItemStatus(inboxId, recordStatus);
      console.log(`Updated ${item.id}: ${item.record_status}`);
      return;
    }
    case "promote-inbox-to-snapshot": {
      const inboxId = process.argv[3];
      if (!inboxId) {
        throw new Error("promote-inbox-to-snapshot requires an inbox id.");
      }

      const result = await promoteInboxItemToSnapshot(inboxId);
      console.log(`Promoted ${result.item.id}: ${result.snapshot.snapshot_id}`);
      console.log(`Body: ${result.snapshot.body_path}`);
      return;
    }
    case "snapshotize-inbox": {
      const inboxId = process.argv[3];
      if (!inboxId) {
        throw new Error("snapshotize-inbox requires an inbox id.");
      }

      const args = process.argv.slice(4);
      const executor = parseExecutor(args);
      const dryRun = parseDryRun(args);
      const result = await snapshotizeInboxItem({ inboxId, executor, dryRun });
      if (dryRun) {
        console.log(`[DRY RUN] Would snapshotize ${result.item.id}: ${result.snapshot.snapshot_id}`);
        console.log(`Executor: ${executor}`);
        console.log(`Would-be body path: ${result.snapshot.body_path}`);
        console.log(`Source Inbox ID: ${result.item.id}`);
        if (result.duplicateCandidates.length > 0) {
          console.log("Similar snapshot candidates:");
          for (const candidate of result.duplicateCandidates) {
            console.log(`- ${candidate.snapshot_id}: ${candidate.title} (score ${candidate.score})`);
          }
        } else {
          console.log("Similar snapshot candidates: none");
        }
        console.log("--- Snapshot Preview ---");
        console.log(result.body ?? "");
        return;
      }

      console.log(`Snapshotized ${result.item.id}: ${result.snapshot.snapshot_id}`);
      console.log(`Executor: ${executor}`);
      console.log(`Body: ${result.snapshot.body_path}`);
      if (result.duplicateCandidates.length > 0) {
        console.log("Similar snapshot candidates:");
        for (const candidate of result.duplicateCandidates) {
          console.log(`- ${candidate.snapshot_id}: ${candidate.title} (score ${candidate.score})`);
        }
      }
      return;
    }
    case "list-exports": {
      const items = await listOutboxItems();
      if (items.length === 0) {
        console.log("No outbox exports.");
        return;
      }

      for (const item of items) {
        console.log(
          `${item.id}: ${item.kind} (${item.record_status}) ${item.output_path} [${item.snapshot_ids.join(", ")}]`,
        );
      }
      return;
    }
    case "show-export": {
      const outboxId = process.argv[3];
      if (!outboxId) {
        throw new Error("show-export requires an outbox id.");
      }

      const { item, body } = await readOutboxItem(outboxId);
      console.log(`# ${item.id}: ${item.kind} (${item.record_status})`);
      console.log("");
      console.log(`Output: ${item.output_path}`);
      console.log(`Snapshots: ${item.snapshot_ids.join(", ")}`);
      console.log("");
      console.log(body);
      return;
    }
    case "list-decisions": {
      const decisions = await listPendingDecisions();
      if (decisions.length === 0) {
        console.log("No pending decisions.");
        return;
      }

      for (const decision of decisions) {
        const linked = (decision.linked_record_ids ?? []).length > 0
          ? ` -> ${decision.linked_record_ids?.join(", ")}`
          : "";
        console.log(
          `${decision.id}: ${decision.decision_item} (${decision.record_status ?? "pending"}) recommended=${decision.recommended_status}${linked}`,
        );
      }
      return;
    }
    case "show-decision": {
      const decisionId = process.argv[3];
      if (!decisionId) {
        throw new Error("show-decision requires a pending decision id.");
      }

      const decision = await readPendingDecision(decisionId);
      console.log(`# ${decision.id}: ${decision.decision_item}`);
      console.log("");
      console.log(`Recommended: ${decision.recommended_status}`);
      console.log(`Status: ${decision.record_status ?? "pending"}`);
      console.log(`Condition: ${decision.condition}`);
      console.log(`Source: ${decision.source}`);
      if ((decision.linked_record_ids ?? []).length > 0) {
        console.log(`Linked records: ${decision.linked_record_ids?.join(", ")}`);
      }
      return;
    }
    case "decide": {
      const decisionId = process.argv[3];
      const humanStatus = process.argv[4];
      if (!decisionId || !humanStatus) {
        throw new Error("decide requires a pending decision id and human status.");
      }
      if (!isHumanDecisionStatus(humanStatus)) {
        throw new Error(
          `Unsupported human decision status "${humanStatus}". Valid statuses: ${humanDecisionStatuses.join(", ")}`,
        );
      }

      const note = process.argv.slice(5).join(" ");
      const decision = await recordHumanDecision({
        decisionId,
        humanStatus,
        note,
      });
      console.log(`Recorded ${decision.id}: ${decision.source_decision_id} -> ${decision.human_status}`);
      return;
    }
    case "list-human-decisions": {
      const decisions = await listHumanDecisions();
      if (decisions.length === 0) {
        console.log("No human decisions.");
        return;
      }

      for (const decision of decisions) {
        console.log(
          `${decision.id}: ${decision.source_decision_id} -> ${decision.human_status} (${decision.decision_item})`,
        );
      }
      return;
    }
    case "list-snapshots": {
      const snapshots = await listWorkingSnapshots();
      if (snapshots.length === 0) {
        console.log("No working snapshots.");
        return;
      }

      for (const snapshot of snapshots) {
        const title = "title" in snapshot ? snapshot.title : snapshot.snapshot_title;
        const status = snapshot.record_status ?? snapshot.status;
        console.log(`${snapshot.snapshot_id}: ${title} (${status})`);
      }
      return;
    }
    case "show-snapshot": {
      const snapshotId = process.argv[3];
      if (!snapshotId) {
        throw new Error("show-snapshot requires a snapshot id.");
      }

      const snapshot = await readWorkingSnapshot(snapshotId);
      const title =
        "title" in snapshot.record
          ? snapshot.record.title
          : snapshot.record.snapshot_title;
      console.log(`# ${snapshot.record.snapshot_id}: ${title}`);
      console.log("");

      if (!snapshot.body) {
        console.log("This snapshot has no local body file.");
        return;
      }

      console.log(snapshot.body);
      return;
    }
    case "reversibility-check": {
      const snapshotId = process.argv[3];
      if (!snapshotId) {
        throw new Error("reversibility-check requires a snapshot id.");
      }

      const packet = await buildReversibilityCheckPacket(snapshotId);
      console.log(packet.trimEnd());
      return;
    }
    case "set-snapshot-status": {
      const snapshotId = process.argv[3];
      const recordStatus = process.argv[4];
      if (!snapshotId || !recordStatus) {
        throw new Error("set-snapshot-status requires a snapshot id and status.");
      }
      if (!isWorkingSnapshotStatus(recordStatus)) {
        throw new Error(
          `Unsupported working snapshot status "${recordStatus}". Valid statuses: ${workingSnapshotStatuses.join(", ")}`,
        );
      }

      const snapshot = await updateWorkingSnapshotStatus(snapshotId, recordStatus);
      console.log(`Updated ${snapshot.snapshot_id}: ${snapshot.record_status}`);
      return;
    }
    case "mark-snapshot-ready": {
      const snapshotId = process.argv[3];
      if (!snapshotId) {
        throw new Error("mark-snapshot-ready requires a snapshot id.");
      }
      const snapshot = await updateWorkingSnapshotStatus(snapshotId, "ready");
      console.log(`Updated ${snapshot.snapshot_id}: ${snapshot.record_status}`);
      return;
    }
    case "close-snapshot": {
      const snapshotId = process.argv[3];
      if (!snapshotId) {
        throw new Error("close-snapshot requires a snapshot id.");
      }
      const snapshot = await updateWorkingSnapshotStatus(snapshotId, "closed");
      console.log(`Updated ${snapshot.snapshot_id}: ${snapshot.record_status}`);
      return;
    }
    case "archive-snapshot": {
      const snapshotId = process.argv[3];
      if (!snapshotId) {
        throw new Error("archive-snapshot requires a snapshot id.");
      }
      const snapshot = await updateWorkingSnapshotStatus(snapshotId, "archived");
      console.log(`Updated ${snapshot.snapshot_id}: ${snapshot.record_status}`);
      return;
    }
    case "status": {
      const status = await cognitiveDbStatus();
      const paths = cognitiveDbPaths();
      const activeWorking = status.working.snapshots.filter((snapshot) =>
        ["active", "ready", "selected"].includes(snapshot.record_status ?? "active"),
      ).length;
      const closedWorking = status.working.snapshots.filter((snapshot) =>
        snapshot.record_status === "closed",
      ).length;
      const archivedWorking = status.working.snapshots.filter((snapshot) =>
        snapshot.record_status === "archived",
      ).length;

      console.log(`Workspace: ${paths.workspaceRoot}`);
      console.log(`Working snapshots: ${status.working.snapshots.length}`);
      console.log(`Active/ready working snapshots: ${activeWorking}`);
      console.log(`Closed working snapshots: ${closedWorking}`);
      console.log(`Archived working snapshots: ${archivedWorking}`);
      console.log(`Reference documents: ${status.reference.documents.length}`);
      console.log(`Snapshot index entries: ${status.reference.snapshot_index?.length ?? 0}`);
      console.log(`Inbox items: ${status.working.inbox_items.length}`);
      console.log(`Outbox items: ${status.working.outbox_items.length}`);
      console.log(`Pending decisions: ${status.decision.pending_decisions.length}`);
      console.log(`Human decisions: ${status.decision.human_decisions.length}`);
      return;
    }
    case "export-summary": {
      const outputPath = await exportCognitiveDbSummary();
      console.log(outputPath);
      return;
    }
    case "export-rehydration": {
      const snapshotIds = process.argv.slice(3);
      const item = await exportRehydrationPacket(snapshotIds);
      console.log(`${item.id}: ${item.output_path}`);
      return;
    }
    case "export-state-handoff": {
      const item = await exportStateHandoff();
      console.log(`${item.id}: ${item.output_path}`);
      return;
    }
    default:
      throw new Error(usage());
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});

function isWorkingSnapshotStatus(
  value: string,
): value is (typeof workingSnapshotStatuses)[number] {
  return workingSnapshotStatuses.includes(
    value as (typeof workingSnapshotStatuses)[number],
  );
}

function isInboxItemStatus(
  value: string,
): value is (typeof inboxItemStatuses)[number] {
  return inboxItemStatuses.includes(value as (typeof inboxItemStatuses)[number]);
}

function isHumanDecisionStatus(
  value: string,
): value is (typeof humanDecisionStatuses)[number] {
  return humanDecisionStatuses.includes(
    value as (typeof humanDecisionStatuses)[number],
  );
}

function parseExecutor(args: string[]): ExecutorName {
  const executorIndex = args.indexOf("--executor");
  if (executorIndex < 0) {
    return "mock";
  }

  const rawExecutor = args[executorIndex + 1];
  if (!rawExecutor) {
    throw new Error("--executor requires one of: mock, codex, claude, gemini");
  }
  if (!isExecutorName(rawExecutor)) {
    throw new Error(
      `Unsupported executor "${rawExecutor}". Valid executors: ${executorNames.join(", ")}`,
    );
  }

  return rawExecutor;
}

function parseDryRun(args: string[]): boolean {
  return args.includes("--dry-run");
}

function isExecutorName(value: string): value is ExecutorName {
  return executorNames.includes(value as ExecutorName);
}

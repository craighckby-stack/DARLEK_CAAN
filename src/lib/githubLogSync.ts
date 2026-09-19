/**
 * DARLEK CAAN ARCHITECTURAL SERVICE
 * File: src/lib/githubLogSync.ts
 * Role: Full-time background synchronization daemon that automatically persists
 *       all Firebase, RAG brain, system telemetry, and learning logs to GitHub in a
 *       dedicated 'logs/' directory within the repository.
 */

import { getLearningLogs, type LearningLog } from './learningLogs';
import { getRagLogs, getRagMutations, getBrainChunks, type RagLogRecord, type RagMutationRecord, type BrainChunk } from './ragBrain';
import { msDosEngine } from './msDosEngine';
import { getGitHubConfig } from './github';

export interface LogSyncResult {
  readonly success: boolean;
  readonly syncedFiles: readonly string[];
  readonly totalLogsCount: number;
  readonly commitSha?: string;
  readonly error?: string;
  readonly timestamp: string;
}

let syncTimeout: ReturnType<typeof setTimeout> | null = null;
let isSyncing = false;
let lastSyncTimestamp: string | null = null;

let activeRuntimeConfig: { token?: string; owner?: string; repo?: string; branch?: string } | undefined = undefined;

/**
 * Updates the active in-memory GitHub sync configuration from live system state.
 */
export function setRuntimeGitHubSyncConfig(config: { token?: string; owner?: string; repo?: string; branch?: string }): void {
  activeRuntimeConfig = { ...activeRuntimeConfig, ...config };
}

export function getRuntimeGitHubSyncConfig(): { token?: string; owner?: string; repo?: string; branch?: string } | undefined {
  return activeRuntimeConfig;
}

/**
 * Formats a comprehensive markdown summary of all Firebase RAG state
 * for human and agent inspection directly inside the GitHub repository.
 */
function generateRagSnapshotMarkdown(
  brainChunks: readonly BrainChunk[],
  ragMutations: readonly RagMutationRecord[],
  learningLogs: readonly LearningLog[],
  timestamp: string
): string {
  const correctMutations = ragMutations.filter((m) => m.verdict !== 'wrong');
  const wrongMutations = ragMutations.filter((m) => m.verdict === 'wrong');

  let md = `# DARLEK CAAN RAG KNOWLEDGE SNAPSHOT\n\n`;
  md += `*Autonomous Live Mirror from Firebase Firestore & Local Vector Store*\n`;
  md += `*Last Synchronized:* \`${timestamp}\`\n\n`;
  md += `## 📊 Knowledge Base Metrics\n\n`;
  md += `- **Active Vector Brain Chunks:** \`${brainChunks.length}\`\n`;
  md += `- **Total Mutation Pairs Logged:** \`${ragMutations.length}\`\n`;
  md += `  - ✅ **Positive Exemplars (Approved/Working Fixes):** \`${correctMutations.length}\`\n`;
  md += `  - ❌ **Negative Exemplars (Operator Rejections & Coherence Gate Vetoes):** \`${wrongMutations.length}\`\n`;
  md += `- **Postmortems & Invariant Constraints:** \`${learningLogs.length}\`\n\n`;

  md += `## 🧠 Recent Knowledge Chunks (dalek_rag_brain)\n\n`;
  if (brainChunks.length === 0) {
    md += `*No vector chunks indexed yet.*\n\n`;
  } else {
    brainChunks.slice(0, 10).forEach((chunk, idx) => {
      md += `### ${idx + 1}. \`${chunk.fileName || chunk.sourceName || 'anonymous'}\` (Gen ${chunk.generation || 1})\n`;
      md += `*Source:* \`${chunk.sourceName}\` | *Indexed:* \`${chunk.timestamp || 'N/A'}\`\n\n`;
      md += `\`\`\`typescript\n${(chunk.codeText || '').slice(0, 350)}${(chunk.codeText || '').length > 350 ? '\n// ... [truncated]' : ''}\n\`\`\`\n\n`;
    });
  }

  md += `## 🧬 Mutation Exemplars (Deterministic Pattern Memory)\n\n`;
  if (ragMutations.length === 0) {
    md += `*No mutations recorded yet.*\n\n`;
  } else {
    ragMutations.slice(0, 10).forEach((m, idx) => {
      const isWrong = m.verdict === 'wrong';
      md += `### ${idx + 1}. ${isWrong ? '❌ [NEGATIVE EXEMPLAR - REJECTED PATTERN]' : '✅ [POSITIVE EXEMPLAR - APPROVED FIX]'}: \`${m.filePath}\`\n`;
      md += `- **Verdict:** \`${m.verdict || 'correct'}\`\n`;
      md += `- **Risk Score:** \`${m.riskScore ?? 'N/A'}\` | **Gen:** \`${m.generation ?? 1}\`\n`;
      if (m.rejectionReason) md += `- **Rejection Reason:** ${m.rejectionReason}\n`;
      if (m.rationale) md += `- **Rationale:** ${m.rationale}\n`;
      md += `\`\`\`typescript\n${(m.mutatedCode || '').slice(0, 350)}${(m.mutatedCode || '').length > 350 ? '\n// ... [truncated]' : ''}\n\`\`\`\n\n`;
    });
  }

  md += `## 🛡️ Architectural Postmortems & Constraints\n\n`;
  if (learningLogs.length === 0) {
    md += `*No postmortems recorded yet.*\n\n`;
  } else {
    learningLogs.slice(0, 10).forEach((log) => {
      md += `### [${log.type.toUpperCase()}] ${log.title}\n`;
      md += `- **Symptom:** ${log.symptom || 'N/A'}\n`;
      md += `- **Constraint:** \`${log.constraint || 'Maintain strict zero-error invariant'}\`\n\n`;
    });
  }

  return md;
}

/**
 * Formats structured postmortem and learning logs into clean markdown
 * to save as logs/POSTMORTEMS.md in GitHub.
 */
function generatePostmortemsMarkdown(logs: readonly LearningLog[]): string {
  const timestamp = new Date().toISOString();
  const header = `# DALEK CAAN REPOSITORY POSTMORTEMS & LESSONS LOG\n*Auto-synchronized from Firebase & RAG Brain on: ${timestamp}*\n\n---\n\n`;

  if (logs.length === 0) {
    return `${header}No postmortems recorded yet.\n`;
  }

  const sections = logs.map((log) => {
    return `### [${log.timestamp.slice(0, 10)}] ${log.title}\n\n` +
      `**Type:** ${log.type.toUpperCase()}\n\n` +
      `**Symptom:** ${log.symptom || 'Not specified'}\n\n` +
      `**EVIDENCE (Machine-Copied Fact):**\n\`\`\`\n${log.evidence || 'No direct evidence snippet recorded.'}\n\`\`\`\n\n` +
      `**CONSTRAINT (Model Generalization):** ${log.constraint || 'Maintain strict zero-error invariant.'}\n\n---\n`;
  }).join('\n');

  return header + sections;
}

/**
 * Formats live MS-DOS telemetry and system logs into logs/active_telemetry.log
 */
function generateTelemetryLogText(dosLines: readonly { time: string; addr: string; tag: string; message: string }[]): string {
  const timestamp = new Date().toISOString();
  let text = '======================================================================\n';
  text += `DARLEK CAAN CONTINUOUS TELEMETRY LOG BUFFER [SYNCED: ${timestamp}]\n`;
  text += '======================================================================\n\n';

  dosLines.forEach((line) => {
    text += `[${line.time}] [${line.addr}] [${line.tag.padEnd(10, ' ')}] ${line.message}\n`;
  });

  return text;
}

/**
 * Gathers all logs across Firebase, RAG brain, and telemetry engines
 * and builds a collection of files specifically targeted for the `logs/` folder in GitHub.
 */
export async function buildLogPayloadFiles(): Promise<Array<{ path: string; content: string }>> {
  const learningLogs = await getLearningLogs();
  const ragLogs = await getRagLogs();
  const ragMutations = await getRagMutations();
  const brainChunks = await getBrainChunks();
  const dosLines = msDosEngine.getState().lines;

  const nowIso = new Date().toISOString();

  // 1. Consolidated system logs json
  const systemLogsPayload = {
    metadata: {
      generatedAt: nowIso,
      engine: 'DARLEK_CAAN_RAG_KERNEL',
      totalLogs: ragLogs.length + learningLogs.length,
      totalMutations: ragMutations.length,
      totalBrainChunks: brainChunks.length,
    },
    systemLogs: ragLogs,
    telemetryBuffer: dosLines.slice(-100),
  };

  // 2. Learning logs & postmortems json
  const learningLogsPayload = {
    metadata: {
      generatedAt: nowIso,
      totalEntries: learningLogs.length,
    },
    learningLogs,
  };

  // 3. Mutations history json
  const mutationsPayload = {
    metadata: {
      generatedAt: nowIso,
      totalMutations: ragMutations.length,
      correctCount: ragMutations.filter((m) => m.verdict !== 'wrong').length,
      wrongCount: ragMutations.filter((m) => m.verdict === 'wrong').length,
    },
    mutations: ragMutations,
  };

  // 4. Complete Firebase RAG Knowledge Base vector chunks
  const ragKnowledgeBasePayload = {
    metadata: {
      generatedAt: nowIso,
      collection: 'dalek_rag_brain',
      totalChunks: brainChunks.length,
      engine: 'DARLEK_CAAN_VECTOR_RAG',
    },
    chunks: brainChunks,
  };

  // 5. Formatted Markdown postmortems
  const postmortemsMd = generatePostmortemsMarkdown(learningLogs);

  // 6. Comprehensive live Firebase RAG snapshot markdown
  const ragSnapshotMd = generateRagSnapshotMarkdown(brainChunks, ragMutations, learningLogs, nowIso);

  // 7. Raw chronological telemetry text
  const telemetryLog = generateTelemetryLogText(dosLines);

  return [
    {
      path: 'rag/rag_knowledge_base.json',
      content: JSON.stringify(ragKnowledgeBasePayload, null, 2),
    },
    {
      path: 'rag/mutations_memory.json',
      content: JSON.stringify(mutationsPayload, null, 2),
    },
    {
      path: 'rag/learning_postmortems.json',
      content: JSON.stringify(learningLogsPayload, null, 2),
    },
    {
      path: 'logs/FIREBASE_RAG_SNAPSHOT.md',
      content: ragSnapshotMd,
    },
    {
      path: 'logs/system_logs.json',
      content: JSON.stringify(systemLogsPayload, null, 2),
    },
    {
      path: 'logs/learning_logs.json',
      content: JSON.stringify(learningLogsPayload, null, 2),
    },
    {
      path: 'logs/mutations.json',
      content: JSON.stringify(mutationsPayload, null, 2),
    },
    {
      path: 'logs/rag_brain_logs.json',
      content: JSON.stringify(ragLogs, null, 2),
    },
    {
      path: 'logs/POSTMORTEMS.md',
      content: postmortemsMd,
    },
    {
      path: 'logs/active_telemetry.log',
      content: telemetryLog,
    },
  ];
}

/**
 * Commits and synchronizes all system, Firebase, and RAG logs into GitHub
 * in the repository's dedicated `logs/` and `rag/` folders.
 */
export async function syncAllLogsToGitHub(configOverride?: {
  token?: string;
  owner?: string;
  repo?: string;
  branch?: string;
}): Promise<LogSyncResult> {
  if (isSyncing) {
    return {
      success: false,
      syncedFiles: [],
      totalLogsCount: 0,
      error: 'Sync already in progress',
      timestamp: new Date().toISOString(),
    };
  }

  isSyncing = true;
  try {
    const config = getGitHubConfig();
    const token = configOverride?.token || activeRuntimeConfig?.token || config.token;
    const owner = configOverride?.owner || activeRuntimeConfig?.owner || config.username || 'craighckby-stack';
    const repo = configOverride?.repo || activeRuntimeConfig?.repo || config.repoName || 'DARLEK_CAAN';
    const branch = configOverride?.branch || activeRuntimeConfig?.branch || 'main';

    const filesToSync = await buildLogPayloadFiles();

    // Call GitHub Bulk Commit or Write API to store all files under logs/ and rag/
    const response = await fetch('/api/github/bulk-commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        owner,
        repo,
        branch,
        files: filesToSync,
        commitMessage: `[DARLEK CAAN] Auto-sync Firebase RAG & logs to ${repo} [${new Date().toISOString()}]`,
      }),
    });

    const data = await response.json();
    lastSyncTimestamp = new Date().toISOString();

    if (!response.ok || !data.success) {
      console.warn('[GitHub Log Sync] Sync responded with non-ok or demo mode:', data);
      return {
        success: false,
        syncedFiles: filesToSync.map((f) => f.path),
        totalLogsCount: filesToSync.length,
        error: data.error || 'GitHub sync returned unsuccessful status',
        timestamp: lastSyncTimestamp,
      };
    }

    msDosEngine.addLog(
      'LOG_SYNC',
      `Firebase RAG & system memory auto-stored in ${owner}/${repo} under 'rag/' & 'logs/' [${filesToSync.length} files committed]`
    );

    return {
      success: true,
      syncedFiles: filesToSync.map((f) => f.path),
      totalLogsCount: filesToSync.length,
      commitSha: data.commitSha,
      timestamp: lastSyncTimestamp,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.warn('[GitHub Log Sync] Log sync error:', err);
    return {
      success: false,
      syncedFiles: [],
      totalLogsCount: 0,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    };
  } finally {
    isSyncing = false;
  }
}

/**
 * Schedules a debounced background sync so rapid log additions batch efficiently
 * and persistently sync to GitHub without spamming the API.
 */
export function scheduleGitHubLogSync(debounceMs = 3000, configOverride?: {
  token?: string;
  owner?: string;
  repo?: string;
  branch?: string;
}): void {
  if (configOverride) {
    setRuntimeGitHubSyncConfig(configOverride);
  }
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  syncTimeout = setTimeout(() => {
    syncAllLogsToGitHub(configOverride).catch(() => {});
  }, debounceMs);
}

export function getLastGitHubLogSyncTime(): string | null {
  return lastSyncTimestamp;
}
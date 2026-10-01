/* DARLEK CAAN RAG SYNTHESIS - Autonomous Generation G-152 [2026-09-20T06:04:20.806Z] */
import { db, isFirebaseConfigured } from './firebase';
import { collection, doc, setDoc, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { saveMutationToRag } from './ragBrain';
import { safeSetLocalStorage, safeGetLocalStorage } from './safeStorage';

/**
 * Live sync from craighckby-stack/Archaeology-Engine into DARLEK's RAG.
 *
 * Replaces the old `ingestArchaeologyDatasetToFirebase()` in
 * archaeology-dataset.ts, which only ever ingested 4 hardcoded example
 * pairs baked into the source — it never actually read the live repo.
 * This module fetches the real, current `correct/<hash>.md` and
 * `wrong/<hash>.md` files pushed by the Commit Archaeology Engine app and
 * ingests any that haven't been seen before.
 *
 * Deliberately slow & bounded per call (maxFilesPerRun, delayMs) so a large
 * backlog can't spike GitHub's rate limit in one run — already-ingested
 * files are tracked and skipped, so calling this repeatedly (e.g. on a
 * timer, or a console command) just picks up whatever's new since last time.
 */

const GITHUB_API_BASE = 'https://api.github.com';
const SOURCE_OWNER = 'craighckby-stack';
const SOURCE_REPO = 'Archaeology-Engine';
const SOURCE_BRANCH = 'main';

const LOCAL_INGESTED_KEY = 'darlek_cann_archaeology_ingested_paths';
const DEFAULT_MAX_FILES_PER_RUN = 20;
const DEFAULT_DELAY_MS = 1200;

type Verdict = 'correct' | 'wrong';

interface TreeEntry {
  readonly path: string;
  readonly sha: string;
  readonly verdict: Verdict;
}

interface ParsedCommitRecord {
  readonly path: string;
  readonly verdict: Verdict;
  readonly hash: string;
  readonly title: string;
  readonly date: string;
  readonly author: string;
  readonly filesTouched: readonly string[];
  readonly commitMessage: string;
  readonly reason: string;
  readonly diff: string;
}

export interface ArchaeologySyncResult {
  readonly scanned: number;
  readonly newFilesFound: number;
  readonly ingested: number;
  readonly alreadyIngestedTotal: number;
  readonly deferredForNextRun: number;
  readonly errors: readonly string[];
}

function createGitHubHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function decodeBase64Utf8(base64Content: string): string {
  const sanitizedContent = (base64Content || '').replace(/\s/g, '');
  if (!sanitizedContent) {
    return '';
  }
  
  try {
    const binaryString = atob(sanitizedContent);
    const byteBuffer = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      byteBuffer[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder().decode(byteBuffer);
  } catch {
    try {
      return decodeURIComponent(escape(atob(sanitizedContent)));
    } catch {
      return '';
    }
  }
}

async function fetchArchaeologyMarkdownPaths(token?: string): Promise<TreeEntry[]> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${SOURCE_OWNER}/${SOURCE_REPO}/git/trees/${SOURCE_BRANCH}?recursive=1`,
    { headers: createGitHubHeaders(token) }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to list ${SOURCE_REPO} tree: HTTP ${response.status}`);
  }
  
  const responseData = await response.json();
  const entries: TreeEntry[] = [];
  
  for (const item of (responseData.tree || [])) {
    if (item?.type !== 'blob' || typeof item.path !== 'string' || !item.path.endsWith('.md')) {
      continue;
    }
    
    if (/(^|\/)correct\//.test(item.path)) {
      entries.push({ path: item.path, sha: item.sha, verdict: 'correct' });
    } else if (/(^|\/)wrong\//.test(item.path)) {
      entries.push({ path: item.path, sha: item.sha, verdict: 'wrong' });
    }
  }
  
  return entries;
}

async function fetchBlobContent(sha: string, token?: string): Promise<string> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${SOURCE_OWNER}/${SOURCE_REPO}/git/blobs/${sha}`, {
    headers: createGitHubHeaders(token),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch blob ${sha}: HTTP ${response.status}`);
  }
  
  const responseData = await response.json();
  return decodeBase64Utf8(responseData.content || '');
}

// Matches the format written by Commit-puller's buildCommitRecordFile().
function parseCommitRecordMarkdown(rawContent: string, path: string, verdict: Verdict): ParsedCommitRecord | null {
  const headerMatch = rawContent.match(/^##\s+(.+?)\s+--\s+(.+?)\s+\(`([^`]+)`\)/m);
  if (!headerMatch) {
    return null;
  }
  
  const [, date, title, hash] = headerMatch;

  const authorMatch = rawContent.match(/\*\*Author:\*\*\s*(.+)/);
  const filesMatch = rawContent.match(/\*\*Files touched:\*\*\s*\n\n([\s\S]*?)\n\n\*\*Commit message/);
  const messageMatch = rawContent.match(/\*\*Commit message:\*\*\s*\n\n```\n([\s\S]*?)\n```/);
  const reasonMatch = rawContent.match(/\*\*Verdict Reason:\*\*\s*(.+)/);
  const diffMatch = rawContent.match(/\*\*Diff:\*\*\s*\n\n```diff\n([\s\S]*?)\n```\s*$/);

  const filesTouched = filesMatch
    ? filesMatch[1].split('\n').map(line => line.replace(/^-\s*`|`$/g, '').trim()).filter(Boolean)
    : [];

  return {
    path,
    verdict,
    hash: hash.trim(),
    title: title.trim(),
    date: date.trim(),
    author: authorMatch ? authorMatch[1].trim() : 'Unknown',
    filesTouched,
    commitMessage: messageMatch ? messageMatch[1].trim() : title.trim(),
    reason: reasonMatch ? reasonMatch[1].trim() : '',
    diff: diffMatch ? diffMatch[1] : '',
  };
}

async function getAlreadyIngestedPaths(): Promise<Set<string>> {
  if (isFirebaseConfigured() && db) {
    try {
      const snapshot = await getDocs(collection(db, 'archaeology_ingested_files'));
      return new Set(snapshot.docs.map(docSnapshot => docSnapshot.id));
    } catch {
      // Fall through to the local fallback below.
    }
  }
  
  if (typeof window !== 'undefined') {
    try {
      const rawStorageValue = safeGetLocalStorage(LOCAL_INGESTED_KEY);
      return new Set(rawStorageValue ? (JSON.parse(rawStorageValue) as string[]) : []);
    } catch {
      return new Set();
    }
  }
  
  return new Set();
}

async function markIngested(paths: readonly string[], alreadyKnown: Set<string>): Promise<void> {
  if (paths.length === 0) {
    return;
  }
  
  if (isFirebaseConfigured() && db) {
    try {
      for (const filePath of paths) {
        await setDoc(doc(db, 'archaeology_ingested_files', encodeURIComponent(filePath)), {
          path: filePath,
          ingestedAt: serverTimestamp(),
        });
      }
      return;
    } catch {
      // Fall through to the local fallback below.
    }
  }
  
  if (typeof window !== 'undefined') {
    try {
      const mergedPaths = new Set(alreadyKnown);
      paths.forEach(filePath => mergedPaths.add(filePath));
      const cappedPaths = Array.from(mergedPaths).slice(-100);
      safeSetLocalStorage(LOCAL_INGESTED_KEY, JSON.stringify(cappedPaths));
    } catch {
      // Best effort only — a missed local mark just means the next run re-scans it.
    }
  }
}

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export async function syncArchaeologyRagFromGitHub(options?: {
  readonly token?: string;
  readonly maxFilesPerRun?: number;
  readonly delayMs?: number;
}): Promise<ArchaeologySyncResult> {
  const token = options?.token;
  const maxFilesPerRun = options?.maxFilesPerRun ?? DEFAULT_MAX_FILES_PER_RUN;
  const delayMs = options?.delayMs ?? DEFAULT_DELAY_MS;
  const errors: string[] = [];

  let allEntries: TreeEntry[] = [];
  try {
    allEntries = await fetchArchaeologyMarkdownPaths(token);
  } catch (error: unknown) {
    return {
      scanned: 0,
      newFilesFound: 0,
      ingested: 0,
      alreadyIngestedTotal: 0,
      deferredForNextRun: 0,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }

  const alreadyIngested = await getAlreadyIngestedPaths();
  const newEntries = allEntries.filter(entry => !alreadyIngested.has(entry.path));
  const batch = newEntries.slice(0, maxFilesPerRun);
  const deferred = Math.max(0, newEntries.length - batch.length);

  let ingestedCount = 0;
  const successfullyProcessedPaths: string[] = [];

  for (const entry of batch) {
    try {
      const rawContent = await fetchBlobContent(entry.sha, token);
      const parsedRecord = parseCommitRecordMarkdown(rawContent, entry.path, entry.verdict);

      if (!parsedRecord) {
        errors.push(`Could not parse ${entry.path} — skipping (won't retry)`);
        successfullyProcessedPaths.push(entry.path);
        await sleep(delayMs);
        continue;
      }

      const isCorrectVerdict = parsedRecord.verdict === 'correct';
      await saveMutationToRag({
        filePath: parsedRecord.filesTouched[0] || 'unknown',
        originalCode: isCorrectVerdict ? '' : parsedRecord.diff,
        mutatedCode: isCorrectVerdict ? parsedRecord.diff : '',
        rationale: `Archaeology Engine ${isCorrectVerdict ? 'success' : 'failure'} pattern (${parsedRecord.hash}): ${parsedRecord.title}. ${parsedRecord.reason || parsedRecord.commitMessage}`.slice(0, 500),
        riskScore: isCorrectVerdict ? 0.1 : 0.85,
        generation: 1,
        commitSha: parsedRecord.hash,
        hotswapped: false,
      });

      if (isFirebaseConfigured() && db) {
        try {
          await addDoc(collection(db, 'mutations'), {
            pairId: parsedRecord.hash,
            filePath: parsedRecord.filesTouched[0] || 'unknown',
            title: parsedRecord.title,
            verdict: parsedRecord.verdict,
            diff: parsedRecord.diff,
            commitMessage: parsedRecord.commitMessage,
            author: parsedRecord.author,
            date: parsedRecord.date,
            source: `https://github.com/${SOURCE_OWNER}/${SOURCE_REPO}/blob/${SOURCE_BRANCH}/${entry.path}`,
            createdAt: serverTimestamp(),
          });
        } catch (firebaseError: unknown) {
          errors.push(`Firestore write failed for ${entry.path}: ${firebaseError instanceof Error ? firebaseError.message : String(firebaseError)}`);
        }
      }

      ingestedCount++;
      successfullyProcessedPaths.push(entry.path);
    } catch (error: unknown) {
      // Left un-marked on failure, so a transient error gets retried next run.
      errors.push(`${entry.path}: ${error instanceof Error ? error.message : String(error)}`);
    }

    // One file at a time with a pause between fetches — deliberately slow so
    // a large backlog never turns into a rate-limit spike.
    await sleep(delayMs);
  }

  await markIngested(successfullyProcessedPaths, alreadyIngested);

  return {
    scanned: allEntries.length,
    newFilesFound: newEntries.length,
    ingested: ingestedCount,
    alreadyIngestedTotal: alreadyIngested.size + successfullyProcessedPaths.length,
    deferredForNextRun: deferred,
    errors,
  };
}

// Autonomous RAG Resilience Guard
export const __rag_resilience_verified__ = Object.freeze({
  generation: 149,
  timestamp: "2026-09-20T04:00:07.248Z",
  ragEngine: "DARLEK_CAAN_HYBRID_RAG"
});

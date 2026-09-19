import { db, isFirebaseConfigured } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * High-priority keys that should be preserved during storage eviction.
 */
const CRITICAL_KEYS = new Set([
  'af_github_token',
  'darlek_cann_github_token',
  'darlek_cann_gemini_key',
  'darlek_cann_selected_model',
  'darlek_cann_blacklisted_files',
  'darlek_cann_system_state',
]);

/**
 * Keys that can be pruned or dropped when localStorage hits its storage quota.
 */
const PURGEABLE_KEYS = [
  'darlek_cann_failed_save',
  'darlek_cann_log_entries',
  'darlek_cann_messages',
  'darlek_cann_rejection_memory',
  'darlek_cann_pending_mutation',
  'darlek_cann_scanned_files',
  'darlek_cann_debate',
];

/**
 * Deduplicates and caps an array of file path strings.
 * Ensures case-consistency, rejects whitespace-only paths, and keeps the most recent N items.
 */
export function capAndDedupeBlacklist(
  list: readonly string[] | null | undefined,
  maxItems = 250
): string[] {
  if (!list || !Array.isArray(list)) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of list) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(trimmed);
    }
  }

  return result.length > maxItems ? result.slice(-maxItems) : result;
}

/**
 * Purges non-essential cache entries when localStorage space is exhausted.
 */
export function evictNonEssentialStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    for (const key of PURGEABLE_KEYS) {
      if (key === 'darlek_cann_scanned_files') {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              // Strip heavy 'content' fields from scanned files cache
              const light = parsed.map((f: { path?: string; size?: number; type?: string; sha?: string }) => ({
                path: f.path || '',
                size: f.size || 0,
                type: f.type || 'file',
                sha: f.sha,
              }));
              localStorage.setItem(key, JSON.stringify(light));
              continue;
            }
          } catch {}
        }
        localStorage.removeItem(key);
      } else if (key === 'darlek_cann_messages' || key === 'darlek_cann_log_entries') {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              localStorage.setItem(key, JSON.stringify(parsed.slice(-15)));
              continue;
            }
          } catch {}
        }
        localStorage.removeItem(key);
      } else {
        localStorage.removeItem(key);
      }
    }
  } catch (err) {
    console.warn('[SafeStorage] Storage eviction encountered warning:', err);
  }
}

/**
 * Checks if a caught exception is a browser QuotaExceededError.
 */
export function isQuotaExceededError(err: unknown): boolean {
  if (!err) return false;
  if (typeof err === 'object') {
    const e = err as { name?: string; code?: number; number?: number; message?: string };
    return (
      e.name === 'QuotaExceededError' ||
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      e.code === 22 ||
      e.code === 1014 ||
      e.number === -2147024882 ||
      (typeof e.message === 'string' && e.message.toLowerCase().includes('quota'))
    );
  }
  return false;
}

/**
 * Sets a value in localStorage safely without throwing QuotaExceededError.
 * Automatically evicts expendable caches if quota is reached, then retries.
 */
export function safeSetLocalStorage(key: string, value: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    if (isQuotaExceededError(err)) {
      console.warn(`[SafeStorage] LocalStorage quota exceeded while writing "${key}". Initiating cache eviction...`);
      evictNonEssentialStorage();

      try {
        localStorage.setItem(key, value);
        console.info(`[SafeStorage] Successfully wrote "${key}" after storage eviction.`);
        return true;
      } catch (retryErr) {
        console.error(`[SafeStorage] Failed write for "${key}" even after cache eviction:`, retryErr);
        // Do not crash the application
        return false;
      }
    }

    console.warn(`[SafeStorage] Non-quota error while writing "${key}":`, err);
    return false;
  }
}

/**
 * Safely removes an item from localStorage.
 */
export function safeRemoveLocalStorage(key: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(key);
  } catch {}
}

/**
 * Safely reads an item from localStorage.
 */
export function safeGetLocalStorage(key: string): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Asynchronously synchronizes the blacklisted files list to Firestore if configured.
 */
export async function syncBlacklistToFirestore(list: readonly string[]): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;

  try {
    const capped = capAndDedupeBlacklist(list, 500);
    const docRef = doc(db, 'system_config', 'blacklist');
    await setDoc(
      docRef,
      {
        blacklistedFiles: capped,
        updatedAt: new Date().toISOString(),
        totalCount: capped.length,
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn('[SafeStorage] Firestore blacklist sync warning:', err);
    return false;
  }
}

/**
 * Asynchronously loads the blacklisted files list from Firestore if available.
 */
export async function loadBlacklistFromFirestore(): Promise<string[] | null> {
  if (!isFirebaseConfigured()) return null;

  try {
    const docRef = doc(db, 'system_config', 'blacklist');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && Array.isArray(data.blacklistedFiles)) {
        return capAndDedupeBlacklist(data.blacklistedFiles, 500);
      }
    }
    return null;
  } catch (err) {
    console.warn('[SafeStorage] Firestore blacklist load warning:', err);
    return null;
  }
}

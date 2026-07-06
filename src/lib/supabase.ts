import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Singleton instance
let supabaseInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null;

/**
 * A cookie-backed Storage implementation used as a fallback when
 * window.localStorage is unavailable (e.g. inside sandboxed preview iframes
 * where third-party storage is partitioned/blocked). Unlike an in-memory shim,
 * cookies survive a full page reload, so the Supabase session persists across
 * navigations and refreshes. Values larger than a single cookie (~4KB) are
 * transparently split into `key.0`, `key.1`, … chunks and reassembled on read.
 */
function createCookieStorage(): Storage {
  const CHUNK_SIZE = 3000; // stay comfortably under the ~4KB per-cookie limit
  const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

  const readRaw = (name: string): string | null => {
    const cookies = document.cookie ? document.cookie.split('; ') : [];
    const prefix = `${name}=`;
    for (const c of cookies) {
      if (c.startsWith(prefix)) return decodeURIComponent(c.slice(prefix.length));
    }
    return null;
  };
  const writeRaw = (name: string, value: string) => {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
  };
  const deleteRaw = (name: string) => {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
  };

  const getItem = (key: string): string | null => {
    const count = readRaw(`${key}.n`);
    if (count === null) return readRaw(key); // stored as a single cookie
    const n = Number.parseInt(count, 10);
    let out = '';
    for (let i = 0; i < n; i += 1) {
      const part = readRaw(`${key}.${i}`);
      if (part === null) return null; // incomplete -> treat as missing
      out += part;
    }
    return out;
  };
  const removeItem = (key: string): void => {
    const count = readRaw(`${key}.n`);
    if (count !== null) {
      const n = Number.parseInt(count, 10);
      for (let i = 0; i < n; i += 1) deleteRaw(`${key}.${i}`);
      deleteRaw(`${key}.n`);
    }
    deleteRaw(key);
  };
  const setItem = (key: string, value: string): void => {
    removeItem(key); // clear any previous single/chunked value first
    if (value.length <= CHUNK_SIZE) {
      writeRaw(key, value);
      return;
    }
    const n = Math.ceil(value.length / CHUNK_SIZE);
    writeRaw(`${key}.n`, String(n));
    for (let i = 0; i < n; i += 1) {
      writeRaw(`${key}.${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
    }
  };

  return {
    get length() {
      return 0;
    },
    clear: () => {},
    key: () => null,
    getItem,
    setItem,
    removeItem,
  } as Storage;
}

/**
 * Returns a storage adapter that is safe to use inside sandboxed preview
 * iframes. Some browsers throw a SecurityError when a cross-site iframe touches
 * window.localStorage. We degrade gracefully:
 *   1. localStorage  — best; persists across reloads
 *   2. cookies       — persists across reloads even when localStorage is blocked
 *   3. in-memory     — last resort; keeps the current tab working
 * This guarantees sign-in works AND the session is not lost on redirect/refresh.
 */
function getSafeStorage(): Storage | undefined {
  if (typeof window === 'undefined') return undefined;

  // 1) Prefer localStorage when it is actually writable.
  try {
    const testKey = '__dlpp_ls_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    // fall through
  }

  // 2) Fall back to cookies (survive full page reloads), if writable.
  try {
    const testKey = '__dlpp_ck_test__';
    document.cookie = `${testKey}=1; path=/; SameSite=Lax`;
    if (document.cookie.includes(`${testKey}=1`)) {
      document.cookie = `${testKey}=; path=/; max-age=0; SameSite=Lax`;
      return createCookieStorage();
    }
  } catch {
    // fall through
  }

  // 3) Last resort: in-memory (lost on reload, but keeps this tab functional).
  const memory = new Map<string, string>();
  const shim: Storage = {
    get length() {
      return memory.size;
    },
    clear: () => memory.clear(),
    getItem: (key: string) => (memory.has(key) ? memory.get(key)! : null),
    key: (index: number) => Array.from(memory.keys())[index] ?? null,
    removeItem: (key: string) => {
      memory.delete(key);
    },
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
  };
  return shim;
}

export const createClient = () => {
  // Return existing instance if it exists
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Create new instance only if it doesn't exist
  supabaseInstance = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storageKey: 'dlpp-cms-auth',
        storage: getSafeStorage(),
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // supabase-js v2 uses the browser Web Locks API (navigator.locks) to
        // serialise auth calls. Inside sandboxed preview iframes that lock can
        // hang indefinitely, so signInWithPassword() never resolves and the
        // login button appears to "do nothing". This pass-through lock runs the
        // operation immediately without touching navigator.locks.
        lock: async <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> => fn(),
      },
    }
  );

  return supabaseInstance;
};

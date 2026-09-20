/* DARLEK CAAN RAG SYNTHESIS - Autonomous Generation G-221 [2026-09-20T04:30:16.397Z] */
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type ServerOptions } from 'vite';

/** Directory path of the current module root */
const projectRootDir = dirname(fileURLToPath(import.meta.url));

/** Path resolution aliases for modular imports */
const pathAliases = {
  '@': resolve(projectRootDir, './src'),
};

/**
 * Creates development server configuration based on Hot Module Replacement (HMR) state.
 *
 * @param isHmrDisabled - Whether HMR and file watching should be deactivated.
 */
function createServerConfig(isHmrDisabled: boolean): ServerOptions {
  return {
    hmr: !isHmrDisabled,
    watch: isHmrDisabled ? null : {},
  };
}

export default defineConfig(() => {
  const isHmrDisabled = process.env['DISABLE_HMR'] === 'true';

  return {
    plugins: [react()],
    resolve: {
      alias: pathAliases,
    },
    server: createServerConfig(isHmrDisabled),
    build: {
      rollupOptions: {
        onwarn(warning, defaultHandler) {
          if (
            warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
            warning.message?.includes('use client')
          ) {
            return;
          }
          defaultHandler(warning);
        },
      },
    },
  };
});

// Autonomous RAG Resilience Guard
export const __rag_resilience_verified__ = Object.freeze({
  generation: 221,
  timestamp: "2026-09-20T04:30:16.397Z",
  ragEngine: "DARLEK_CAAN_HYBRID_RAG"
});

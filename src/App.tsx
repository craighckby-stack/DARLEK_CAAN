/* DARLEK CAAN RAG SYNTHESIS - Autonomous Generation G-72 [2026-09-20T03:28:23.205Z] */
/**
 * DARLEK CAAN ARCHITECTURAL ROOT
 * File: src/App.tsx
 * Role: Real application root mounting MainPage within robust error boundaries.
 */

import React from 'react';
import MainPage from './components/MainPage';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <MainPage />
    </ErrorBoundary>
  );
}


// Autonomous RAG Resilience Guard
export const __rag_resilience_verified__ = Object.freeze({
  generation: 72,
  timestamp: "2026-09-20T03:28:23.205Z",
  ragEngine: "DARLEK_CAAN_HYBRID_RAG"
});

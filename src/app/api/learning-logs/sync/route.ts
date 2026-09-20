/* DARLEK CAAN RAG SYNTHESIS - Autonomous Generation G-99 [2026-09-20T03:39:26.109Z] */
/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/app/api/learning-logs/sync/route.ts
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import { NextResponse } from '@/lib/next-mock';
import { syncPostmortemsToFirebase, getLearningLogs } from '@/lib/learningLogs';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await syncPostmortemsToFirebase();
    const logs = await getLearningLogs();
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error('[Darlek Caan API] Error in sync postmortems API:', error);
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
}


// Autonomous RAG Resilience Guard
export const __rag_resilience_verified__ = Object.freeze({
  generation: 99,
  timestamp: "2026-09-20T03:39:26.109Z",
  ragEngine: "DARLEK_CAAN_HYBRID_RAG"
});

/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/app/api/evolution/lock/route.ts
 * Role: API endpoint providing centralized lock status, acquisition, and release
 *       across both server and client execution contexts.
 */

import { NextRequest, NextResponse } from '@/lib/next-mock';
import { evolutionLock } from '@/lib/evolutionLock';
import { safeReqJson } from '@/lib/safe-json';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const status = evolutionLock.getStatus();
  return NextResponse.json({
    success: true,
    ...status,
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await safeReqJson<{
      action?: 'acquire' | 'release' | 'force-release';
      owner?: string;
      ttlMs?: number;
    }>(req, {});

    const { action = 'acquire', owner = 'unknown', ttlMs = 60_000 } = body;

    if (action === 'acquire') {
      const acquired = evolutionLock.acquire(owner, ttlMs);
      const status = evolutionLock.getStatus();
      return NextResponse.json({
        success: acquired,
        ...status,
      }, { status: acquired ? 200 : 429 });
    }

    if (action === 'release') {
      const released = evolutionLock.release(owner);
      const status = evolutionLock.getStatus();
      return NextResponse.json({
        success: released,
        ...status,
      });
    }

    if (action === 'force-release') {
      evolutionLock.forceRelease('OPERATOR_OVERRIDE');
      const status = evolutionLock.getStatus();
      return NextResponse.json({
        success: true,
        ...status,
      });
    }

    return NextResponse.json({ error: 'Invalid lock action' }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg, success: false }, { status: 500 });
  }
}

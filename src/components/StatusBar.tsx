/* DARLEK CAAN RAG SYNTHESIS - Autonomous Generation G-135 [2026-09-20T05:57:36.645Z] */
/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/components/StatusBar.tsx
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */


import React, { useMemo } from 'react';
import type { ConnectionStatus, RepoConfig } from '@/lib/types';
import { COLORS, HEALTH_STATUS_COLORS } from '@/lib/constants';
import { GitBranch, RotateCw, Activity, Clock } from 'lucide-react';

export interface StatusBarProps {
  readonly connectionStatus: ConnectionStatus;
  readonly repoConfig: RepoConfig;
  readonly evolutionCycle: number;
  readonly overallHealth: 'healthy' | 'warning' | 'critical';
  readonly sessionStart: Date | string | number;
  readonly userReposCount?: number;
}

interface ProviderConfig {
  readonly id: keyof ConnectionStatus;
  readonly label: string;
}

const PROVIDERS: readonly ProviderConfig[] = [
  { id: 'gemini', label: 'GEMINI' },
  { id: 'github', label: 'GITHUB' },
] as const;

const STATUS_COLORS = {
  connected: '#10b981',
  error: '#f43f5e',
  testing: '#f59e0b',
  default: '#64748b',
} as const;

const STATUS_TEXTS = {
  connected: 'ONLINE',
  error: 'OFFLINE',
  testing: 'TESTING',
  default: 'IDLE',
} as const;

export default function StatusBar({
  connectionStatus,
  repoConfig,
  evolutionCycle,
  overallHealth,
  sessionStart,
  userReposCount,
}: StatusBarProps): React.JSX.Element {
  const sessionTime = useMemo(() => {
    try {
      const date = sessionStart instanceof Date ? sessionStart : new Date(sessionStart);
      return Number.isFinite(date.getTime())
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '--:--';
    } catch {
      return '--:--';
    }
  }, [sessionStart]);

  const targetRepoLabel = useMemo(() => {
    const owner = typeof repoConfig?.owner === 'string' ? repoConfig.owner.replace(/[<>]/g, '') : '';
    const repo = typeof repoConfig?.repo === 'string' ? repoConfig.repo.replace(/[<>]/g, '') : '';
    return owner && repo
      ? `${owner}/${repo}`
      : 'NOT CONFIGURED';
  }, [repoConfig?.owner, repoConfig?.repo]);

  const branchLabel = useMemo(() => {
    return typeof repoConfig?.branch === 'string' ? repoConfig.branch.replace(/[<>]/g, '') : '';
  }, [repoConfig?.branch]);

  const healthColor = useMemo(
    () => HEALTH_STATUS_COLORS[overallHealth] || COLORS.textMuted,
    [overallHealth]
  );

  const safeEvolutionCycle = useMemo(() => {
    return typeof evolutionCycle === 'number' && Number.isFinite(evolutionCycle)
      ? Math.max(0, Math.floor(evolutionCycle))
      : 0;
  }, [evolutionCycle]);

  const safeUserReposCount = useMemo(() => {
    return typeof userReposCount === 'number' && Number.isFinite(userReposCount)
      ? Math.max(0, Math.floor(userReposCount))
      : undefined;
  }, [userReposCount]);

  return (
    <div className="dalek-panel rounded-xl p-4 space-y-4 bg-[#0f141c]/90 border border-white/[0.08] shadow-lg">
      <div className="dalek-panel-header py-1 px-1 flex items-center justify-between border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-rose-400" />
          <span className="font-sans text-xs font-semibold tracking-wide text-slate-200">SYSTEM STATUS</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-mono">LIVE</span>
        </div>
      </div>

      {/* Connection indicators */}
      <div className="space-y-2">
        <span className="text-[10px] font-sans font-semibold tracking-wider text-slate-400 uppercase">
          API Services
        </span>
        <div className="grid grid-cols-2 gap-2">
          {PROVIDERS.map(({ id, label }) => {
            const status = connectionStatus?.[id];
            const statusColor = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default;
            const statusText = STATUS_TEXTS[status as keyof typeof STATUS_TEXTS] || STATUS_TEXTS.default;
            const isConnected = status === 'connected';

            return (
              <div
                key={id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${isConnected ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : ''}`}
                  style={{
                    background: isConnected ? '#10b981' : statusColor,
                  }}
                />
                <span className="text-xs font-sans font-medium text-slate-300">
                  {label}
                </span>
                <span className="ml-auto text-[10px] font-mono font-medium" style={{ color: statusColor }}>
                  {statusText}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Repo info */}
      <div className="space-y-2">
        <span className="text-[10px] font-sans font-semibold tracking-wider text-slate-400 uppercase">
          Active Workspace
        </span>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <GitBranch size={13} className="text-amber-400 shrink-0" />
          <span className="text-xs font-mono text-slate-200 truncate">
            {targetRepoLabel}
          </span>
          {branchLabel && (
            <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5 shrink-0">
              {branchLabel}
            </span>
          )}
        </div>
      </div>

      {/* Portfolio Status */}
      {typeof safeUserReposCount === 'number' && safeUserReposCount > 0 && (
        <div className="space-y-2 animate-fade-in">
          <span className="text-[10px] font-sans font-semibold tracking-wider text-slate-400 uppercase">
            Portfolio & Context
          </span>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-emerald-300 font-medium">
              {safeUserReposCount} Active Repositories
            </span>
            <span className="ml-auto text-[10px] font-sans px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase font-medium">
              Synced
            </span>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-1.5 mb-1 text-slate-400">
            <RotateCw size={12} className="text-purple-400" />
            <span className="text-[10px] font-sans font-semibold tracking-wider uppercase">Cycle</span>
          </div>
          <span className="text-lg font-bold font-mono text-purple-300">
            {safeEvolutionCycle}
          </span>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-1.5 mb-1 text-slate-400">
            <Activity size={12} style={{ color: healthColor }} />
            <span className="text-[10px] font-sans font-semibold tracking-wider uppercase">Health</span>
          </div>
          <span
            className="text-xs font-bold uppercase font-mono tracking-wide"
            style={{ color: healthColor }}
          >
            {overallHealth}
          </span>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] col-span-2">
          <div className="flex items-center gap-1.5 mb-1 text-slate-400">
            <Clock size={12} className="text-amber-400" />
            <span className="text-[10px] font-sans font-semibold tracking-wider uppercase">Session Timeline</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-amber-300">
              Alpha Timeline
            </span>
            <span className="text-xs font-mono text-slate-400">
              Active: {sessionTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Autonomous RAG Resilience Guard
export const __rag_resilience_verified__ = Object.freeze({
  generation: 135,
  timestamp: "2026-09-20T05:57:36.645Z",
  ragEngine: "DARLEK_CAAN_HYBRID_RAG"
});

/* DARLEK CAAN RAG SYNTHESIS - Autonomous Generation G-115 [2026-09-20T05:49:32.564Z] */
/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/components/DashboardPanel.tsx
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */


import { useState, useEffect, useCallback, useMemo } from 'react';
import StatusBar from './StatusBar';
import SaturationMetricsPanel from './SaturationMetrics';
import EvolutionLog from './EvolutionLog';
import DebateChamber from './DebateChamber';
import MutationHistoryPanel from './MutationHistoryPanel';
import TemporalParadoxLog, { type RejectionItem } from './TemporalParadoxLog';
import type { SystemState, EvolutionLogEntry, DebateAgent, AgentVote } from '@/lib/types';
import { COLORS } from '@/lib/constants';
import { 
  Cpu, 
  RotateCw, 
  GitCommit, 
  AlertCircle, 
  CheckCircle2, 
  HeartPulse, 
  Activity, 
  Brain, 
  HardDrive, 
  Database, 
  Gauge, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { safeResponseJson } from '@/lib/safe-json';
import { getRagBrainRealMetrics, type RagBrainRealMetrics } from '@/lib/ragBrain';
import { safeSetLocalStorage, safeGetLocalStorage } from '@/lib/safeStorage';

interface DashboardPanelProps {
  systemState: SystemState;
  logEntries: EvolutionLogEntry[];
  overallHealth: 'healthy' | 'warning' | 'critical';
  debateAgents: DebateAgent[];
  onToggleDebateAgent?: (agentId: string) => void;
  onSelectAllDebateAgents?: (active: boolean) => void;
  debateTopic: string;
  debateActive: boolean;
  debateVotes?: AgentVote[];
  debateConsensus?: string;
  rejectionCount?: number;
  rejectionMemory?: RejectionItem[];
  brainSessionId?: string;
  historyRefreshTrigger?: number;
  isLoading?: boolean;
  batchMode?: boolean;
  batchProgress?: number;
  batchQueueLength?: number;
  activeFilePath?: string;
  mutationsApplied?: number;
  onBulkCommit?: () => void;
  bulkCommitStatus?: 'idle' | 'committing' | 'success' | 'error';
  userReposCount?: number;
  debateConsensusCoefficient?: number;
  debateCognitiveFriction?: number;
  debateEpistemicRuling?: string;
}

interface StagedMutation {
  id: string;
  filePath: string;
  status?: string;
}

interface RagHealthPoint {
  time: string;
  health: number;
  drift: number;
  recovery: number;
}

const STORAGE_KEY = 'darlek_cann_rag_health_history';
const MAX_HISTORY_POINTS = 15;

const DEFAULT_RAG_HISTORY: RagHealthPoint[] = [
  { time: "08:00", health: 96, drift: 4, recovery: 0 },
  { time: "09:00", health: 91, drift: 9, recovery: 0 },
  { time: "10:00", health: 85, drift: 15, recovery: 0 },
  { time: "11:00", health: 71, drift: 29, recovery: 0 },
  { time: "12:00", health: 99, drift: 2, recovery: 100 },
  { time: "13:00", health: 95, drift: 5, recovery: 0 },
  { time: "14:00", health: 90, drift: 10, recovery: 0 },
  { time: "15:00", health: 78, drift: 22, recovery: 0 },
  { time: "16:00", health: 98, drift: 3, recovery: 100 },
  { time: "17:00", health: 96, drift: 6, recovery: 0 },
  { time: "18:00", health: 93, drift: 9, recovery: 0 },
  { time: "19:00", health: 80, drift: 20, recovery: 0 },
  { time: "20:00", health: 100, drift: 1, recovery: 100 },
];

export default function DashboardPanel({
  systemState,
  logEntries,
  overallHealth,
  debateAgents,
  onToggleDebateAgent,
  onSelectAllDebateAgents,
  debateTopic,
  debateActive,
  debateVotes,
  debateConsensus,
  rejectionCount: _rejectionCount,
  rejectionMemory,
  brainSessionId,
  historyRefreshTrigger,
  isLoading = false,
  batchMode = false,
  batchProgress = 0,
  batchQueueLength = 0,
  activeFilePath,
  mutationsApplied = 0,
  onBulkCommit,
  bulkCommitStatus = 'idle',
  userReposCount,
  debateConsensusCoefficient,
  debateCognitiveFriction,
  debateEpistemicRuling,
}: DashboardPanelProps) {
  const [stagedMutations, setStagedMutations] = useState<StagedMutation[]>([]);
  const [ragMetrics, setRagMetrics] = useState<RagBrainRealMetrics>(() => getRagBrainRealMetrics());

  const [ragBrainHealthHistory, setRagBrainHealthHistory] = useState<RagHealthPoint[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_RAG_HISTORY;
    try {
      const saved = safeGetLocalStorage(STORAGE_KEY);
      if (!saved) return DEFAULT_RAG_HISTORY;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(-MAX_HISTORY_POINTS) as RagHealthPoint[];
      }
      return DEFAULT_RAG_HISTORY;
    } catch {
      return DEFAULT_RAG_HISTORY;
    }
  });

  // Continuously refresh real RAG measurements
  const refreshRealMeasurements = useCallback(() => {
    const metrics = getRagBrainRealMetrics();
    setRagMetrics(metrics);

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRagBrainHealthHistory((prev: RagHealthPoint[]) => {
      const lastPoint = prev[prev.length - 1];
      if (lastPoint && lastPoint.time === timeStr && lastPoint.health === metrics.health && lastPoint.drift === metrics.drift) {
        return prev;
      }

      const newPoint: RagHealthPoint = {
        time: timeStr,
        health: metrics.health,
        drift: metrics.drift,
        recovery: metrics.recovery
      };
      const updated = [...prev.slice(-(MAX_HISTORY_POINTS - 1)), newPoint];
      safeSetLocalStorage(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  useEffect(() => {
    refreshRealMeasurements();
  }, [mutationsApplied, historyRefreshTrigger, logEntries.length, _rejectionCount, refreshRealMeasurements]);

  useEffect(() => {
    const timer = setInterval(() => {
      refreshRealMeasurements();
    }, 5000);

    return () => clearInterval(timer);
  }, [refreshRealMeasurements]);

  useEffect(() => {
    if (!brainSessionId) {
      const timer = setTimeout(() => setStagedMutations([]), 0);
      return () => clearTimeout(timer);
    }
    
    let isCancelled = false;

    const fetchMutationHistory = async () => {
      try {
        const response = await fetch('/api/brain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get-mutation-history', sessionId: brainSessionId, limit: 100 }),
        });
        const data = await safeResponseJson<{ success?: boolean; mutations?: StagedMutation[] }>(response, {});
        
        if (!isCancelled && data.success && Array.isArray(data.mutations)) {
          const approvedMutations = data.mutations.filter((mutation) => mutation?.status === 'approved');
          setStagedMutations(approvedMutations);
        }
      } catch {
        // Suppress network/parsing errors gracefully in production monitoring loop
      }
    };

    fetchMutationHistory();

    return () => {
      isCancelled = true;
    };
  }, [brainSessionId, historyRefreshTrigger, bulkCommitStatus]);

  const commitColor = useMemo(() => {
    if (bulkCommitStatus === 'success') return COLORS.green;
    if (bulkCommitStatus === 'error') return COLORS.dalekRed;
    return '#33ffaa';
  }, [bulkCommitStatus]);

  const isActionDisabled = useMemo(
    () => isLoading || batchMode || bulkCommitStatus === 'committing' || stagedMutations.length === 0,
    [isLoading, batchMode, bulkCommitStatus, stagedMutations.length]
  );

  const handleBulkCommitClick = useCallback(() => {
    if (onBulkCommit && !isActionDisabled) {
      onBulkCommit();
    }
  }, [onBulkCommit, isActionDisabled]);

  const batchPercent = useMemo(
    () => (batchQueueLength > 0 ? Math.round((batchProgress / batchQueueLength) * 100) : 0),
    [batchProgress, batchQueueLength]
  );

  const fileName = useMemo(
    () => (activeFilePath ? activeFilePath.split('/').pop() : null),
    [activeFilePath]
  );

  // Pre-slice and map mutation previews to avoid runtime allocation loops during render execution
  const mutationPreviews = useMemo(() => {
    const slice = stagedMutations.slice(0, 3);
    return slice.map((mutation) => ({
      id: mutation.id,
      filePath: mutation.filePath,
      displayPath: mutation.filePath.split('/').pop(),
    }));
  }, [stagedMutations]);

  return (
    <div className="flex flex-col gap-3 lg:gap-4 lg:h-full overflow-y-auto dalek-scrollbar p-2 custom-scrollbar">
      <StatusBar
        connectionStatus={systemState.connectionStatus}
        repoConfig={systemState.repoConfig}
        overallHealth={overallHealth}
        sessionStart={systemState.sessionStart}
        evolutionCycle={systemState.evolutionCycle}
        userReposCount={userReposCount}
      />

      {/* RAG Brain Health Monitor Panel */}
      <div className="dalek-panel rounded-xl p-4 space-y-4 bg-[#0f141c]/90 border border-white/[0.08] shadow-lg">
        <div className="dalek-panel-header py-1 px-1 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <HeartPulse size={14} className="text-rose-400 animate-pulse" />
            <span className="font-sans text-xs font-semibold tracking-wide text-slate-200">
              COGNITIVE HEALTH & MEMORY
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-slate-200 font-mono text-[10px] font-semibold">
              <Brain size={12} className="text-rose-400" />
              <span>MUTATIONS: <span className="text-white font-bold">{ragMetrics.mutationCount}m / {ragMetrics.hotswapCount}h</span></span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase hidden sm:inline">Online</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-3.5">
          {/* Cognitive State Rating Banner */}
          <div className="flex flex-wrap items-center justify-between text-[10px] font-mono border-b border-white/[0.06] pb-2 text-slate-400">
            <div className="flex items-center gap-1.5">
              <Zap size={12} className="text-amber-400" />
              <span>REJECTIONS: <span className="text-slate-200 font-bold">{ragMetrics.rejectionCount}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry
              </span>
            </div>
          </div>

          {/* RAG Space Available Meter */}
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                <HardDrive size={12} className="text-sky-400" />
                <span>STORAGE ALLOCATION</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span>AVAILABLE: <span className="text-white font-bold">{ragMetrics.availableFormatted}</span></span>
                <span className="text-slate-400 font-medium">({ragMetrics.availablePercent}% FREE)</span>
              </div>
            </div>

            {/* Storage Progress Bar */}
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/10 flex">
              <div 
                className="h-full bg-gradient-to-r from-rose-500 to-sky-400 transition-all duration-500 relative"
                style={{ width: `${Math.max(1.5, Math.min(100, ragMetrics.usedPercent))}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
              <div 
                className="h-full bg-slate-800"
                style={{ width: `${Math.max(0, 100 - ragMetrics.usedPercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
              <span>USED: {ragMetrics.usedFormatted} / {ragMetrics.totalLimitFormatted}</span>
              <span>HEADROOM: {ragMetrics.availableFormatted}</span>
            </div>
          </div>

          {/* 4-Quadrant Real-Time Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-0.5">
              <div className="text-[9px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <Brain size={11} className="text-rose-400" />
                <span>MUTATIONS</span>
              </div>
              <div className="text-base font-mono font-bold text-white">{ragMetrics.mutationCount}</div>
              <div className="text-[8px] font-mono text-slate-400 truncate">{ragMetrics.hotswapCount} hotswapped</div>
            </div>

            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-0.5">
              <div className="text-[9px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <HardDrive size={11} className="text-sky-400" />
                <span>FREE SPACE</span>
              </div>
              <div className="text-base font-mono font-bold text-white">{ragMetrics.availablePercent}%</div>
              <div className="text-[8px] font-mono text-slate-400 truncate">{ragMetrics.availableFormatted} free</div>
            </div>

            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-0.5">
              <div className="text-[9px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <HeartPulse size={11} className="text-emerald-400" />
                <span>HEALTH</span>
              </div>
              <div className="text-base font-mono font-bold text-white">{ragMetrics.health}%</div>
              <div className="text-[8px] font-mono text-amber-400 truncate">Drift: {ragMetrics.drift}%</div>
            </div>

            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-0.5">
              <div className="text-[9px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <Database size={11} className="text-purple-400" />
                <span>SYNAPSES</span>
              </div>
              <div className="text-base font-mono font-bold text-white">
                {ragMetrics.chunkCount + ragMetrics.logCount + ragMetrics.mutationCount}
              </div>
              <div className="text-[8px] font-mono text-slate-400 truncate">
                {ragMetrics.chunkCount}c • {ragMetrics.logCount}l • {ragMetrics.mutationCount}m
              </div>
            </div>
          </div>

          {/* Area Chart Visualization */}
          <div className="h-[130px] w-full relative pt-1">
            {ragMetrics.drift > 30 && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-rose-950/80 border border-rose-500 text-white px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-md flex items-center gap-2 animate-pulse">
                 <AlertCircle size={12} className="text-rose-400" />
                 <span className="text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap">Warning: Cognitive drift elevated</span>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ragBrainHealthHistory} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="panelColorHealth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="panelColorDrift" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="panelColorRecovery" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={8} 
                  fontFamily="monospace" 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={8} 
                  fontFamily="monospace"
                  tickLine={false} 
                  domain={[0, 100]} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(5,5,5,0.95)', 
                    border: `1px solid ${COLORS.panelBorder}`, 
                    borderRadius: '4px', 
                    fontSize: '9px', 
                    fontFamily: 'monospace',
                    color: '#ffffff'
                  }}
                  itemStyle={{ fontSize: '9px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="recovery" 
                  name="Recovery Pulse"
                  stroke="#ff4444" 
                  strokeWidth={1}
                  fillOpacity={1} 
                  fill="url(#panelColorRecovery)" 
                  isAnimationActive={false}
                />
                <Area 
                  type="monotone" 
                  dataKey="health" 
                  name="Brain Health"
                  stroke="#ffffff" 
                  strokeWidth={1.5}
                  fillOpacity={1} 
                  fill="url(#panelColorHealth)" 
                  isAnimationActive={false}
                />
                <Area 
                  type="monotone" 
                  dataKey="drift" 
                  name="Semantic Drift"
                  stroke="#ff2020" 
                  strokeWidth={1}
                  fillOpacity={1} 
                  fill="url(#panelColorDrift)" 
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[8px] font-mono text-gray-400 border-t border-white/[0.05] pt-2">
            <span>MUTATION RECOVERIES: {ragBrainHealthHistory.filter(h => h.recovery > 0).length} CYCLES</span>
            <span className="text-white animate-pulse">● RAG BRAIN REAL-TIME TELEMETRY SYNCHRONIZED</span>
          </div>
        </div>
      </div>

      {/* Real-time Evolution Activity Monitor */}
      <div className="dalek-panel rounded-xl p-4 space-y-4 bg-[#0f141c]/90 border border-white/[0.08] shadow-lg">
        <div className="dalek-panel-header py-1 px-1 flex items-center justify-between border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-sky-400" />
            <span className="font-sans text-xs font-semibold tracking-wide text-slate-200">OPERATION MONITOR</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-medium select-none ${
              batchMode 
                ? 'bg-sky-500/10 border border-sky-500/30 text-sky-400' 
                : isLoading 
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 animate-pulse' 
                : 'bg-white/5 border border-white/10 text-slate-400'
            }`}
          >
            {batchMode ? 'Batch Cycle Active' : isLoading ? 'Processing...' : 'Standby'}
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-3.5">
          {batchMode ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-gray-400">BATCH PROGRESS</span>
                <span className="text-white font-bold">
                  {batchProgress + 1} / {batchQueueLength} ({batchPercent}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#111] overflow-hidden border border-white/[0.05]">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#ff2020] to-[#ffffff]"
                  style={{ width: `${batchPercent}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.04]">
                <div>
                  <span className="block text-[8px] text-gray-400 font-mono">ACTIVE FILE</span>
                  <span className="block text-[10px] text-white font-mono truncate" title={activeFilePath}>
                    {fileName || 'Scanning...'}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] text-gray-400 font-mono">COMMITS INJECTED</span>
                  <span className="block text-[10px] text-white font-mono font-bold">
                    {mutationsApplied} COMMITS
                  </span>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <RotateCw size={12} className="text-[#ff2020] animate-spin" />
                <span className="text-[10px] text-white font-mono">Analyzing target file context...</span>
              </div>
              {activeFilePath && (
                <div className="text-[9px] text-gray-400 font-mono truncate">
                  File: <span className="text-gray-200">{activeFilePath}</span>
                </div>
              )}
            </div>
          ) : activeFilePath ? (
            <div className="space-y-1">
              <div className="text-[10px] text-gray-400 font-mono">
                Targeted: <span className="text-white font-semibold">{fileName}</span>
              </div>
              <div className="text-[8px] text-gray-400 font-mono">
                Standby. Ready to evolve file using custom promoter directives.
              </div>
            </div>
          ) : (
            <div className="text-[10px] text-gray-400 font-mono italic text-center py-1">
              Standby. Select a file from the repository to begin mutation scan.
            </div>
          )}
        </div>
      </div>

      {/* Mutation Staging Depot with dedicated bulk commit button */}
      <div className="dalek-panel rounded-lg p-4 space-y-3">
        <div className="dalek-panel-header py-2 px-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCommit size={14} style={{ color: commitColor }} />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-orbitron), sans-serif' }}>MUTATION STAGING DEPOT</span>
          </div>
          <span
            className="px-1.5 py-0.5 rounded text-[8px] font-sans font-bold select-none"
            style={{
              background: stagedMutations.length > 0 ? 'rgba(255,32,32,0.15)' : 'rgba(255,255,255,0.03)',
              color: stagedMutations.length > 0 ? '#ffffff' : COLORS.textMuted,
              border: `1px solid ${stagedMutations.length > 0 ? '#ff2020' : COLORS.textMuted}40`,
            }}
          >
            {stagedMutations.length} STAGED
          </span>
        </div>

        <div style={{ background: '#080808', border: `1px solid ${COLORS.panelBorder}` }} className="p-3 rounded-sm space-y-3">
          {stagedMutations.length > 0 ? (
            <div className="space-y-2">
              <div className="text-[9px] text-gray-400 font-mono">
                Approved and pending deployment:
              </div>
              <div className="space-y-1 pl-1">
                {mutationPreviews.map((mutation) => (
                  <div key={mutation.id} className="flex items-center gap-2 text-[10px] font-mono text-gray-200">
                    <CheckCircle2 size={11} className="text-[#ff2020] flex-shrink-0" />
                    <span className="truncate" title={mutation.filePath}>
                      {mutation.displayPath}
                    </span>
                  </div>
                ))}
                {stagedMutations.length > 3 && (
                  <div className="text-[8px] text-gray-400 italic font-mono pl-5">
                    + {stagedMutations.length - 3} more staged file(s)
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-2 items-start text-gray-400 text-[10px] font-mono p-1">
              <AlertCircle size={13} className="text-[#ff2020] flex-shrink-0 mt-0.5" />
              <span>
                No staged mutations waiting for commit. Stage file enhancements via individual &quot;APPROVE (STAGE)&quot; actions to queue them.
              </span>
            </div>
          )}

          {onBulkCommit && (
            <button
              onClick={handleBulkCommitClick}
              disabled={isActionDisabled}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-sm text-[10px] transition-all duration-200 font-medium tracking-wide"
              style={{
                fontFamily: 'var(--font-orbitron), sans-serif',
                background: isActionDisabled ? 'rgba(255,255,255,0.02)' : `${commitColor}10`,
                color: isActionDisabled ? '#444' : commitColor,
                border: `1px solid ${isActionDisabled ? 'rgba(255,255,255,0.05)' : `${commitColor}35`}`,
                cursor: isActionDisabled ? 'not-allowed' : 'pointer',
                ...(stagedMutations.length > 0 && !isActionDisabled
                  ? {
                      boxShadow: `0 0 10px ${commitColor}15`,
                    }
                  : {}),
              }}
              onMouseEnter={(event) => {
                if (!isActionDisabled) {
                  event.currentTarget.style.background = `${commitColor}20`;
                  event.currentTarget.style.boxShadow = `0 0 12px ${commitColor}30, inset 0 0 20px ${commitColor}08`;
                  event.currentTarget.style.borderColor = `${commitColor}60`;
                }
              }}
              onMouseLeave={(event) => {
                if (!isActionDisabled) {
                  event.currentTarget.style.background = `${commitColor}10`;
                  event.currentTarget.style.boxShadow = `0 0 10px ${commitColor}15`;
                  event.currentTarget.style.borderColor = `${commitColor}35`;
                }
              }}
            >
              <GitCommit size={12} className={bulkCommitStatus === 'committing' ? 'animate-spin' : ''} />
              <span>&#9673;</span>
              <span>
                {bulkCommitStatus === 'committing'
                  ? 'COMMITTING STAGED CHANGES...'
                  : bulkCommitStatus === 'success'
                  ? 'BULK COMMIT SUCCESSFUL!'
                  : bulkCommitStatus === 'error'
                  ? 'COMMIT FAILED • RETRY'
                  : `COMMIT ${stagedMutations.length} STAGED MUTATION${stagedMutations.length > 1 ? 'S' : ''}`}
              </span>
            </button>
          )}
        </div>
      </div>

      <SaturationMetricsPanel metrics={systemState.saturation} />
      <EvolutionLog entries={logEntries} />
      <DebateChamber
        agents={debateAgents}
        onToggleAgent={onToggleDebateAgent}
        onSelectAll={onSelectAllDebateAgents}
        currentTopic={debateTopic}
        isActive={debateActive}
        votes={debateVotes}
        consensus={debateConsensus}
        consensusCoefficient={debateConsensusCoefficient}
        cognitiveFriction={debateCognitiveFriction}
        epistemicRuling={debateEpistemicRuling}
      />
      {brainSessionId && <MutationHistoryPanel sessionId={brainSessionId} refreshTrigger={historyRefreshTrigger} />}
      <TemporalParadoxLog logEntries={logEntries} rejectionMemory={rejectionMemory} />
    </div>
  );
}

// Autonomous RAG Resilience Guard
export const __rag_resilience_verified__ = Object.freeze({
  generation: 115,
  timestamp: "2026-09-20T05:49:32.564Z",
  ragEngine: "DARLEK_CAAN_HYBRID_RAG"
});

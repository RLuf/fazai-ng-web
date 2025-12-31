
import React from 'react';
import { AgentState, AgentStatus } from '../types';

interface AgentStatusCardProps {
  state: AgentState;
}

export const AgentStatusCard: React.FC<AgentStatusCardProps> = ({ state }) => {
  const getStatusColor = () => {
    switch (state.status) {
      case AgentStatus.IDLE: return 'bg-slate-500';
      case AgentStatus.THINKING: return 'bg-blue-500';
      case AgentStatus.SEARCHING: return 'bg-purple-500';
      case AgentStatus.REFLECTING: return 'bg-amber-500';
      case AgentStatus.EXECUTING: return 'bg-emerald-500';
      case AgentStatus.SUCCESS: return 'bg-emerald-500';
      case AgentStatus.ERROR: return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="p-4 rounded-xl bg-[#111114] border border-[#1e1e24] shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-400 uppercase">Agent Status</h2>
        <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor()} animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.3)]`}></div>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Current State</div>
          <div className="text-lg font-bold text-white tracking-tight">{state.status}</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Processing Task</div>
          <div className="text-xs text-slate-300 italic truncate" title={state.currentTask || 'None'}>
            {state.currentTask || 'Waiting for input...'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-black/40 rounded border border-[#2d2d35]">
            <div className="text-[9px] text-slate-500 font-bold uppercase">Iteration</div>
            <div className="text-sm font-bold text-white">{state.iterations} / {state.maxIterations}</div>
          </div>
          <div className="p-2 bg-black/40 rounded border border-[#2d2d35]">
            <div className="text-[9px] text-slate-500 font-bold uppercase">Reflections</div>
            <div className="text-sm font-bold text-white">{state.reflections.length}</div>
          </div>
        </div>

        <div className="w-full bg-[#1e1e24] h-1.5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ease-out ${getStatusColor()}`}
            style={{ width: `${(state.iterations / state.maxIterations) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

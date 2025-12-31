
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
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Agent Monitoring</h2>
        <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`}></div>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-500 font-bold uppercase">Status Atual</span>
          <span className="text-lg font-bold text-white leading-none mt-1">{state.status}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-[9px] text-slate-500 font-bold uppercase">Tarefa em Fila</span>
          <span className="text-xs text-slate-400 italic truncate mt-1" title={state.currentTask || 'Nenhuma'}>
            {state.currentTask || 'Aguardando pulso...'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 bg-black/40 rounded border border-[#2d2d35]">
            <div className="text-[8px] text-slate-500 font-bold uppercase">Ciclo</div>
            <div className="text-xs font-bold text-white">{state.iterations} / {state.maxIterations}</div>
          </div>
          <div className="p-2 bg-black/40 rounded border border-[#2d2d35]">
            <div className="text-[8px] text-slate-500 font-bold uppercase">Insights</div>
            <div className="text-xs font-bold text-white">{state.reflections.length}</div>
          </div>
        </div>

        <div className="w-full bg-[#1e1e24] h-1 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-700 ease-in-out ${getStatusColor()}`}
            style={{ width: `${(state.iterations / state.maxIterations) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

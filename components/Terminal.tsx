
import React from 'react';
import { LogEntry } from '../types';

interface TerminalProps {
  logs: LogEntry[];
}

export const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  return (
    <div className="flex-1 flex flex-col bg-black rounded-lg border border-[#1e1e24] shadow-inner overflow-hidden">
      <div className="bg-[#111114] px-4 py-2 border-b border-[#1e1e24] flex items-center justify-between">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/30"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/30"></div>
        </div>
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          fazai-spark-worker@fedora:~/restricted
        </div>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs scroll-smooth flex flex-col-reverse">
        {logs.length === 0 && (
          <div className="text-slate-600 animate-pulse">System idle. Awaiting command...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="group hover:bg-white/5 transition-colors p-0.5 rounded">
            <span className="text-slate-600 mr-2">[{log.timestamp}]</span>
            <span className={`font-bold mr-2 ${
              log.level === 'spark' ? 'text-emerald-500' : 
              log.level === 'maestro' ? 'text-blue-500' :
              log.level === 'error' ? 'text-red-500' :
              log.level === 'warn' ? 'text-yellow-500' : 'text-slate-400'
            }`}>
              {log.level.toUpperCase()}
            </span>
            <span className="text-slate-200">{log.message}</span>
            {log.details && <div className="ml-24 mt-1 text-slate-500 italic text-[11px] border-l-2 border-slate-800 pl-2">{log.details}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

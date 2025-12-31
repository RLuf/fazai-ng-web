
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgentStatus, AgentState, LogEntry, VectorPoint } from './types';
import { gemini } from './services/geminiService';
import { Terminal } from './components/Terminal';
import { AgentStatusCard } from './components/AgentStatusCard';
import { QdrantViz } from './components/QdrantViz';
import { CLIInstaller } from './components/CLIInstaller';

const MAX_LOGS = 60;

const App: React.FC = () => {
  const [taskInput, setTaskInput] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [agentState, setAgentState] = useState<AgentState>({
    status: AgentStatus.IDLE,
    currentTask: null,
    iterations: 0,
    maxIterations: 5,
    reflections: [],
    qdrantHits: [],
  });

  const addLog = (message: string, level: LogEntry['level'] = 'info', details?: string) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      details,
    };
    setLogs(prev => [newLog, ...prev].slice(0, MAX_LOGS));
  };

  const executeLoop = async (task: string) => {
    if (!task.trim()) return;
    
    setAgentState(prev => ({
      ...prev,
      status: AgentStatus.THINKING,
      currentTask: task,
      iterations: 0,
      reflections: [],
      qdrantHits: [],
    }));

    addLog(`Spark Trigger: "${task}"`, 'spark');

    try {
      const dispatchResult = await gemini.dispatchTask(task);
      
      if (dispatchResult.type === 'trigger') {
        addLog(`Repassando ao Maestro (Xeon Node 01): ${dispatchResult.content}`, 'maestro');
        setAgentState(prev => ({ ...prev, status: AgentStatus.SEARCHING }));
        
        // Simulação de busca no Qdrant Local
        await new Promise(r => setTimeout(r, 1200));
        const mockHits: VectorPoint[] = [
          { id: '1', collection: 'fazai_kb', score: 0.98, content: 'Tuning Xeon: set affinity to core 0-7...', metadata: {} },
          { id: '2', collection: 'fazai_memory', score: 0.89, content: 'Last socket command: optimize kernel', metadata: {} }
        ];
        
        setAgentState(prev => ({ ...prev, qdrantHits: mockHits, status: AgentStatus.REFLECTING }));
        
        for (let i = 1; i <= 2; i++) {
          const reflection = await gemini.reflectOnContext(task, mockHits);
          setAgentState(prev => ({ 
            ...prev, 
            iterations: i,
            reflections: [...prev.reflections, { iteration: i, ...reflection }]
          }));
          addLog(`Loop Agentico: Reflexao ${i} completa`, 'info');
          await new Promise(r => setTimeout(r, 800));
        }

        setAgentState(prev => ({ ...prev, status: AgentStatus.SUCCESS }));
        addLog(`Operacao concluida via CLI Spark.`, 'spark');
      } else {
        addLog(`Resposta Direta: ${dispatchResult.content}`, 'spark');
        setAgentState(prev => ({ ...prev, status: AgentStatus.SUCCESS }));
      }
    } catch (err: any) {
      addLog(`Erro no fluxo: ${err.message}`, 'error');
      setAgentState(prev => ({ ...prev, status: AgentStatus.ERROR }));
    } finally {
      setTimeout(() => {
        setAgentState(prev => ({ ...prev, status: AgentStatus.IDLE }));
      }, 5000);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0c] text-slate-400 overflow-hidden">
      {/* Sidebar: Control & Vitals */}
      <aside className="w-80 flex-shrink-0 border-r border-[#1e1e24] p-5 flex flex-col gap-5 bg-[#0b0b0e]">
        <header className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
             <i className="fas fa-bolt text-emerald-500"></i>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white leading-none">FAZAI <span className="text-emerald-500">SPARK</span></h1>
            <span className="text-[8px] text-slate-600 font-bold uppercase tracking-[0.2em]">Full Administrator v3</span>
          </div>
        </header>

        <AgentStatusCard state={agentState} />
        
        <CLIInstaller />

        <div className="p-4 rounded-xl bg-[#111114] border border-[#1e1e24]">
          <h3 className="text-[9px] font-bold text-slate-500 uppercase mb-3 flex justify-between">
            <span>Clusters Xeon</span>
            <span className="text-emerald-500">OK</span>
          </h3>
          <div className="space-y-2">
            {[
              { n: 'Ollama LLM', u: ':11434' },
              { n: 'Maestro Orchestrator', u: ':11430' },
              { n: 'Qdrant Core', u: ':6333' }
            ].map(c => (
              <div key={c.n} className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">{c.n}</span>
                <span className="text-slate-600 font-mono">{c.u}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto p-3 bg-red-950/20 border border-red-900/40 rounded-lg">
           <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase mb-1">
             <i className="fas fa-shield-halved"></i>
             Restricted Node
           </div>
           <p className="text-[9px] text-red-400/70 leading-tight">Access restricted to Xeon-Biprocessor Node-01. All actions logged to Qdrant/Memory.</p>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a0c]">
        <section className="h-[55%] p-4 flex flex-col min-h-0 border-b border-[#1e1e24]">
          <Terminal logs={logs} />
        </section>

        <section className="h-[45%] flex min-h-0">
          <div className="w-1/2 p-4 border-r border-[#1e1e24] overflow-hidden">
             <QdrantViz hits={agentState.qdrantHits} />
          </div>
          <div className="w-1/2 p-4 flex flex-col min-w-0">
             <header className="flex items-center justify-between mb-4">
                <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                    <i className="fas fa-brain mr-2 text-blue-500"></i> Reflexoes de Inteligencia
                </h2>
                <span className="text-[9px] text-slate-600 font-mono italic">Iteration {agentState.iterations}/5</span>
             </header>
             <div className="flex-1 overflow-y-auto space-y-4 pr-3 custom-scrollbar">
                {agentState.reflections.length === 0 ? (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-[#1e1e24] rounded-xl text-[10px] text-slate-700 uppercase tracking-widest italic">
                    Aguardando sinal agentico...
                  </div>
                ) : (
                  agentState.reflections.map((r, i) => (
                    <div key={i} className="group p-4 bg-[#111114] border-l-2 border-blue-600 rounded-r-xl shadow-lg hover:bg-[#16161a] transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">Spark Logic Iter {r.iteration}</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          <span className="text-[9px] text-slate-500 font-mono">{(r.confidence * 100).toFixed(0)}% CONF</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">{r.key_insight}</p>
                      <div className="mt-3 flex items-center gap-2 pt-3 border-t border-[#1e1e24]">
                        <span className="text-[8px] text-slate-600 font-bold uppercase">Proximo Passo:</span>
                        <span className="text-[9px] text-emerald-500 font-mono italic">{r.next_action}</span>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </section>

        {/* Console Input */}
        <footer className="p-6 bg-[#0c0c0f] border-t border-[#1e1e24]">
          <div className="max-w-5xl mx-auto flex gap-3">
            <div className="relative flex-1">
              <input 
                type="text" 
                className="w-full bg-[#111114] border border-[#2d2d35] rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-white placeholder-slate-700 transition-all font-mono"
                placeholder="Insira comando master (ex: otimizar cluster, analisar logs Xeon)..."
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeLoop(taskInput)}
                disabled={agentState.status !== AgentStatus.IDLE}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-30">
                <span className="text-[8px] font-bold border border-slate-700 rounded px-1">ENTER</span>
              </div>
            </div>
            <button 
              onClick={() => executeLoop(taskInput)}
              disabled={agentState.status !== AgentStatus.IDLE || !taskInput.trim()}
              className={`px-8 rounded-xl flex items-center gap-3 font-black text-xs tracking-widest transition-all ${
                agentState.status === AgentStatus.IDLE && taskInput.trim()
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
                : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-[#2d2d35]'
              }`}
            >
              {agentState.status === AgentStatus.IDLE ? (
                <>
                  <i className="fas fa-terminal"></i>
                  DISPARAR
                </>
              ) : (
                <>
                  <i className="fas fa-sync-alt fa-spin"></i>
                  MAESTRO BUSY
                </>
              )}
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;

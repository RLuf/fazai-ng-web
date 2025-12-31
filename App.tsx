
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgentStatus, AgentState, LogEntry, VectorPoint } from './types';
import { gemini } from './services/geminiService';
import { Terminal } from './components/Terminal';
import { AgentStatusCard } from './components/AgentStatusCard';
import { QdrantViz } from './components/QdrantViz';

const MAX_LOGS = 50;

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
    setAgentState(prev => ({
      ...prev,
      status: AgentStatus.THINKING,
      currentTask: task,
      iterations: 0,
      reflections: [],
      qdrantHits: [],
    }));

    addLog(`Iniciando processamento Spark: "${task}"`, 'spark');

    try {
      // Step 1: Dispatch
      const dispatchResult = await gemini.dispatchTask(task);
      
      if (dispatchResult.type === 'trigger') {
        addLog(`Gatilho Maestro detectado: ${dispatchResult.content}`, 'maestro');
        setAgentState(prev => ({ ...prev, status: AgentStatus.SEARCHING }));
        
        // Mocking Qdrant Search
        addLog(`Consultando collections (memory, learning, kb)...`, 'info');
        await new Promise(r => setTimeout(r, 1500));
        
        const mockHits: VectorPoint[] = [
          { id: '1', collection: 'kb', score: 0.92, content: 'Kernel tuning for Fedora Xeon systems involves sysctl -w...', metadata: {} },
          { id: '2', collection: 'memory', score: 0.85, content: 'Last optimization session: memory thresholds set to 90%', metadata: {} }
        ];
        
        setAgentState(prev => ({ ...prev, qdrantHits: mockHits, status: AgentStatus.REFLECTING }));
        
        // Agentic Loop (Simulation for UI)
        for (let i = 1; i <= 2; i++) {
          addLog(`Reflexão Iteração ${i}...`, 'info');
          const reflection = await gemini.reflectOnContext(task, mockHits);
          setAgentState(prev => ({ 
            ...prev, 
            iterations: i,
            reflections: [...prev.reflections, { iteration: i, ...reflection }]
          }));
          await new Promise(r => setTimeout(r, 1000));
        }

        setAgentState(prev => ({ ...prev, status: AgentStatus.SUCCESS }));
        addLog(`Operação concluída com sucesso. Plano de voo gerado.`, 'spark');
      } else {
        addLog(`Resposta Direta: ${dispatchResult.content}`, 'spark');
        setAgentState(prev => ({ ...prev, status: AgentStatus.SUCCESS }));
      }
    } catch (err: any) {
      addLog(`Erro crítico: ${err.message}`, 'error');
      setAgentState(prev => ({ ...prev, status: AgentStatus.ERROR }));
    }
  };

  const handleSend = () => {
    if (!taskInput.trim() || agentState.status !== AgentStatus.IDLE) return;
    executeLoop(taskInput);
    setTaskInput('');
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0c] text-slate-300">
      {/* Left Sidebar: Status and Vitals */}
      <div className="w-80 flex-shrink-0 border-r border-[#1e1e24] p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black">
             <i className="fas fa-bolt text-xs"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tighter text-white">FAZAI <span className="text-emerald-500">SPARK</span></h1>
        </div>

        <AgentStatusCard state={agentState} />
        
        <div className="mt-4 p-4 rounded-lg bg-[#111114] border border-[#1e1e24]">
          <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Qdrant Clusters</h3>
          <div className="space-y-2">
            {['memory', 'learning', 'kb', 'personality'].map(c => (
              <div key={c} className="flex items-center justify-between text-xs">
                <span className="text-slate-400 capitalize">{c}</span>
                <span className="text-emerald-400">ONLINE</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto">
          <div className="p-3 bg-red-900/10 border border-red-500/20 rounded text-[10px] text-red-400">
            <i className="fas fa-triangle-exclamation mr-2"></i>
            RESTRICTED ACCESS: XEON-BIPROCESSOR NODE-01
          </div>
        </div>
      </div>

      {/* Main Content: Terminal and Visualizer */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-1/2 p-4 flex flex-col min-h-0 border-b border-[#1e1e24]">
          <Terminal logs={logs} />
        </div>

        <div className="h-1/2 flex min-h-0">
          <div className="w-1/2 p-4 border-r border-[#1e1e24]">
             <QdrantViz hits={agentState.qdrantHits} />
          </div>
          <div className="w-1/2 p-4 flex flex-col">
             <h2 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center">
                <i className="fas fa-brain mr-2 text-blue-400"></i> Reflexões Ativas
             </h2>
             <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {agentState.reflections.length === 0 ? (
                  <div className="text-slate-600 text-xs italic">Aguardando iteração agentica...</div>
                ) : (
                  agentState.reflections.map((r, i) => (
                    <div key={i} className="p-3 bg-[#111114] border-l-2 border-blue-500 rounded-r shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-blue-400 uppercase">Iteração {r.iteration}</span>
                        <span className="text-[10px] text-slate-500">Confidence: {(r.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-1">{r.key_insight}</p>
                      <div className="text-[10px] text-emerald-400 italic">NEXT: {r.next_action}</div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>

        {/* Persistent Call-to-Action */}
        <div className="p-4 bg-[#0d0d10] border-t border-[#1e1e24]">
          <div className="max-w-4xl mx-auto flex gap-2">
            <input 
              type="text" 
              className="flex-1 bg-[#111114] border border-[#2d2d35] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600 transition-colors"
              placeholder="Digite sua ordem em linguagem natural (ex: analisar kernel)..."
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={agentState.status !== AgentStatus.IDLE}
            />
            <button 
              onClick={handleSend}
              disabled={agentState.status !== AgentStatus.IDLE}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 font-bold text-sm transition-all ${
                agentState.status === AgentStatus.IDLE 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <i className={`fas ${agentState.status === AgentStatus.IDLE ? 'fa-paper-plane' : 'fa-spinner fa-spin'}`}></i>
              {agentState.status === AgentStatus.IDLE ? 'DISPARAR' : 'PROCESSANDO'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

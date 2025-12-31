
import React, { useState } from 'react';

export const CLIInstaller: React.FC = () => {
  const [copied, setCopied] = useState(false);
  
  const installCmd = `curl -sSL https://home.rogerluft.com.br/install-fazai.sh | sudo bash`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 rounded-xl bg-[#0d0d10] border border-[#1e1e24]">
      <div className="flex items-center gap-2 mb-3">
        <i className="fas fa-terminal text-emerald-500 text-xs"></i>
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Install FazAI CLI</h3>
      </div>
      
      <div className="relative group">
        <code className="block bg-black p-3 rounded text-[10px] text-emerald-400 font-mono break-all border border-[#1e1e24] group-hover:border-emerald-500/50 transition-colors">
          {installCmd}
        </code>
        <button 
          onClick={handleCopy}
          className="absolute right-2 top-2 p-1.5 bg-[#1e1e24] hover:bg-emerald-600 rounded text-white transition-all opacity-0 group-hover:opacity-100"
        >
          <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} text-[10px]`}></i>
        </button>
      </div>
      
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="text-[8px] text-slate-600">
          <i className="fas fa-microchip mr-1"></i> Xeon Optimized
        </div>
        <div className="text-[8px] text-slate-600">
          <i className="fas fa-database mr-1"></i> Qdrant Sync
        </div>
      </div>
    </div>
  );
};

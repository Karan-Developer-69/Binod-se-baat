import React from 'react';
import { Layers, Plus,  Hash, Settings, LogOut } from 'lucide-react';

const ChatList: React.FC = () => {
  return (
    <div className="h-full flex flex-col p-6">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center text-[var(--bg-app)]">
          <Layers size={24} strokeWidth={3}/>
        </div>
        <h1 className="font-anton text-2xl uppercase italic tracking-tighter">Lysis</h1>
      </div>

      <button className="w-full flex items-center justify-center gap-3 border border-[var(--border-color)] py-4 rounded-2xl font-anton tracking-widest hover:bg-[var(--accent)] hover:text-[var(--bg-app)] transition-all mb-8 shadow-sm">
        <Plus size={18} /> NEW SESSION
      </button>

      {/* History */}
      <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
        <p className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40 mb-4 px-2">Recent Threads</p>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--accent)] hover:text-[var(--bg-app)] cursor-pointer group transition-all border border-transparent hover:shadow-lg">
            <Hash size={16} className="opacity-40 group-hover:opacity-100" />
            <span className="text-sm font-medium truncate italic tracking-tight">Quantum_Logic_Stream_{i}</span>
          </div>
        ))}
      </div>

      {/* Settings Panel */}
      <div className="mt-6 pt-6 border-t border-[var(--border-color)] space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-[var(--bg-app)] transition-colors">
          <Settings size={18} className="opacity-50" />
          <span className="text-xs font-bold uppercase tracking-widest">Settings</span>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer text-red-400 hover:bg-red-400/10 transition-colors">
          <LogOut size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">Disconnect</span>
        </div>
      </div>
    </div>
  );
};

export default ChatList;
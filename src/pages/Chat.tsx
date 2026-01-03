import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, Menu, X, Sun, Moon, 
  Layers, Mic,  Plus, Hash 
} from 'lucide-react';

const Chat: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: 'lysis', content: "Neural synchronization complete. I am Lysis. How can I assist your objective today?" }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isThinking]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), role: 'user', content: input }]);
    setInput('');
    setIsThinking(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now()+1, role: 'lysis', content: "Analysis processed through Lysis-v4. The requested logic has been optimized for your specific environment." }]);
      setIsThinking(false);
    }, 1500);
  };

  return (
    <div style={{ backgroundColor: 'var(--color1)', fontFamily: 'var(--font-light)' }} className="relative h-screen w-full flex overflow-hidden text-[var(--color4)]">
      
      {/* Background Aesthetic Orbs (For Glass Effect) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color3)]/20 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-[var(--color2)]/30 blur-[100px] rounded-full"></div>

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed md:relative z-50 h-[96vh] my-[2vh] ml-[2vh] w-72 lysis-glass rounded-[2.5rem] flex flex-col p-6 transition-all duration-500
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[120%] md:translate-x-0'}
      `}>
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-[var(--color3)] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(95,149,152,0.4)]">
            <Layers size={22} className="text-[var(--color1)]" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-bold)' }} className="text-2xl uppercase italic tracking-tighter">Lysis</h1>
        </div>

        <button className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/10 py-4 rounded-2xl font-bold text-[10px] tracking-[0.2em] hover:bg-[var(--color3)] hover:text-[var(--color1)] transition-all mb-8">
          <Plus size={16} /> NEW SESSION
        </button>

        <div className="flex-1 space-y-2 overflow-y-auto pr-2">
          <p className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40 mb-4 px-2">Recent Consciousness</p>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl hover:bg-white/5 cursor-pointer group transition-all">
              <Hash size={14} className="text-[var(--color3)] opacity-50" />
              <span className="text-sm truncate opacity-70 group-hover:opacity-100">Neural_Stream_0{i}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-[var(--color2)] border border-[var(--color3)]/30"></div>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider">Lysis User</span>
            <span className="text-[10px] text-[var(--color3)]">V4.0 Authorized</span>
          </div>
        </div>
      </aside>

      {/* --- MAIN CHAT AREA --- */}
      <main className="flex-1 flex flex-col p-4 md:p-6 relative">
        
        {/* Header */}
        <header className="flex items-center justify-between p-4 px-8 lysis-glass rounded-[2rem] mb-4">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-[var(--color3)]" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <X /> : <Menu />}
            </button>
            <div className="flex flex-col">
              <h2 style={{ fontFamily: 'var(--font-bold)' }} className="text-xl uppercase tracking-[0.1em] leading-none">Intelligence Core</h2>
              <span className="text-[10px] text-[var(--color3)] font-bold tracking-[0.2em] mt-1 uppercase flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color3)] animate-pulse"></div> Encrypted
              </span>
            </div>
          </div>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3 rounded-full hover:bg-white/10 transition-colors">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 px-4 py-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[70%] p-6 rounded-[2.5rem] lysis-glass-light border border-white/10 ${
                msg.role === 'user' 
                ? 'bg-[var(--color3)]/20 rounded-tr-none' 
                : 'rounded-tl-none'
              }`}>
                {msg.role === 'lysis' && (
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-[var(--color3)]" />
                    <span style={{ fontFamily: 'var(--font-bold)' }} className="text-[10px] tracking-[0.2em] uppercase text-[var(--color3)] italic">Lysis Response</span>
                  </div>
                )}
                <p className="text-sm md:text-base leading-relaxed opacity-90">{msg.content}</p>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-4 px-4 animate-pulse">
               <div className="w-10 h-10 rounded-xl lysis-glass flex items-center justify-center">
                  <div className="w-2 h-2 bg-[var(--color3)] rounded-full animate-bounce"></div>
               </div>
               <span style={{ fontFamily: 'var(--font-bold)' }} className="text-[10px] tracking-widest opacity-40 uppercase italic">Lysis is thinking...</span>
            </div>
          )}
        </div>

        {/* Floating Input Area */}
        <div className="mt-auto max-w-4xl mx-auto w-full p-4">
          <form onSubmit={handleSend} className="relative group">
            <div className="absolute -inset-1 bg-[var(--color3)] rounded-[3rem] blur opacity-10 group-focus-within:opacity-30 transition-all"></div>
            <div className="relative flex items-center lysis-glass rounded-[2.5rem] p-2 pr-4 border-white/20">
              <button type="button" className="p-4 text-gray-500 hover:text-[var(--color3)]"><Mic size={20}/></button>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Synchronize your thought stream..." 
                className="flex-1 bg-transparent border-none outline-none px-2 text-sm md:text-base placeholder:text-gray-500 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
              />
              <button 
                type="submit" 
                disabled={!input.trim()}
                className="bg-[var(--color3)] text-[var(--color1)] p-4 rounded-full hover:scale-105 active:scale-90 transition-all shadow-[0_0_20px_var(--color3)] disabled:opacity-30 disabled:shadow-none"
              >
                <Send size={20} strokeWidth={3} />
              </button>
            </div>
          </form>
          <div className="flex justify-center gap-8 mt-4 text-[9px] font-black tracking-[0.3em] uppercase opacity-30">
            <span>Neural V4.0.0</span>
            <span>Quantum-safe encryption</span>
          </div>
        </div>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}
      </main>
    </div>
  );
};

export default Chat;
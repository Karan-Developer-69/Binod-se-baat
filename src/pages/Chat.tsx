import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Sparkles, Menu, Plus,
  Brain, Globe, Settings,
  Loader2, X, MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Internal Imports
import { getResponse } from '../redux/features/apiSlice';
import { addChat, clearChat, setChatData } from '../redux/features/chatSlice';
import CodeBlock from '../components/CodeBlock';
import { addToHistory, loadOldData } from '../redux/features/historySlice';

// --- Sub-Components ---

const ModeToggle = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200
      ${active
        ? 'bg-[var(--color3)]/10 border-[var(--color3)]/50 text-[var(--color3)] shadow-[0_0_10px_rgba(56,189,248,0.1)]'
        : 'bg-[var(--color1)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--color4)] hover:bg-[var(--surface-hover)]'
      }`}
  >
    <Icon size={14} className={active ? "text-[var(--color3)]" : ""} />
    {label}
  </button>
);

const Chat: React.FC = () => {
  const dispatch = useDispatch();

  const [name, profileImage] = useSelector((state: any) => [state.user.name || 'New User', state.user.image]);
  // Redux
  const chatHistory = useSelector((state: any) => state?.chatHistory || []);
  const loading = useSelector((state: any) => state?.api?.loading);
  const theme = useSelector((state: any) => state?.user?.theme || 'dark');

  const history = useSelector((state: any) => state?.history || []);
  // Local State
  const [input, setInput] = useState('');
  const [modes, setModes] = useState({ web: false, deep: false });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  const [selectedModel, setSelectedModel] = useState<'qwen' | 'gptoss'>('qwen');

  const MODEL_URLS = {
    qwen: "https://karan6933-freeai.hf.space",
    gptoss: "https://karan6933-gptossfree.hf.space"
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);


  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatHistory, loading]);

  // Current conversation title: use title from the latest assistant message if available
  const currentAssistant = [...chatHistory].reverse().find((m: any) => m.role === 'assistant' && (m.title || m.content));
  const currentTitle = currentAssistant ? (currentAssistant.title || (currentAssistant.content || '').split('\n').find(Boolean) || 'New Conversation') : null;


  // Auto-resize Textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  useEffect(() => {
    try {
      const storedHistoryText = localStorage.getItem("history");
      const storedHistory = storedHistoryText ? JSON.parse(storedHistoryText) : [];
      if (Array.isArray(storedHistory) && storedHistory.length > 0) {
        // Redux might need a specific structure or just strings. 
        // Based on historySlice, it expects string[].
        dispatch(loadOldData(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, [dispatch]);

  useEffect(() => {
    if (chatId) {
      try {
        const storedChatText = localStorage.getItem(chatId);
        if (storedChatText) {
          const parsedChat = JSON.parse(storedChatText);
          if (Array.isArray(parsedChat)) {
            dispatch(clearChat());
            parsedChat.forEach((msg) => {
              dispatch(addChat(msg));
            });
          }
        }
      } catch (e) {
        console.error("Failed to load chat", e);
      }
    }
  }, [chatId, dispatch]);

  useEffect(() => {
    // Only generate title if we have some content and don't have a chatId yet (or it's a new chat flow)
    // Here we check if we have a second message (usually assistant response) to generate a meaningful title
    if (!chatId && chatHistory.length >= 2) {
      const potentialTitle = chatHistory[1]?.content?.substring(0, 30)?.split('\n')[0]?.replace(/[#*`]/g, '').trim();

      if (potentialTitle) {
        // Verify uniqueness
        let title = potentialTitle;
        let counter = 1;
        // Check against current redux history to distinguish
        while (history.includes(title)) {
          title = `${potentialTitle} (${counter})`;
          counter++;
        }

        // 1. Dispatch to Redux immediately so UI updates
        dispatch(addToHistory(title));

        // 2. Set local state
        setChatId(title);

        // 3. Persist to localStorage
        const currentHistory = JSON.parse(localStorage.getItem("history") || "[]");
        // Double check we don't save duplicates if useEffect fires twice
        if (!currentHistory.includes(title)) {
          const newHistory = [...currentHistory, title];
          localStorage.setItem("history", JSON.stringify(newHistory));
        }
      }
    }
  }, [chatHistory, chatId, history, dispatch]);

  // Save current chat content to localStorage whenever it updates
  useEffect(() => {
    if (chatId && chatHistory.length > 0) {
      localStorage.setItem(chatId, JSON.stringify(chatHistory));
    }
  }, [chatHistory, chatId]);

  const handleSend = () => {
    if (!input.trim()) return;
    let finalPrompt = input;
    if (modes.web) finalPrompt += " (Use Web Search)";
    if (modes.deep) finalPrompt += " (Think Deeply)";

    dispatch(addChat({ id: Date.now(), role: 'user', content: input }));
    dispatch(getResponse(finalPrompt, MODEL_URLS[selectedModel]));

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChangeChat = (id: string) => {
    const data = localStorage.getItem(id)
    console.log("data", data)
    if (data) {
      dispatch(clearChat())
      dispatch(setChatData(JSON.parse(data)))
    }
  }

  return (
    <div className="flex h-screen w-full bg-[var(--color1)] text-[var(--color4)] font-body overflow-hidden">

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed md:relative z-50 h-full w-[280px] bg-[var(--glass-bg)] backdrop-blur-xl border-r border-[var(--border)] 
        flex flex-col transition-transform duration-300 shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color3)] flex items-center justify-center text-white shadow-lg shadow-[var(--color3)]/20">
              <Brain size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-wide text-[var(--color4)]">Lysis AI</h1>
              <p className="text-[10px] text-[var(--muted)] font-mono">MODEL: QWEN 2.5</p>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden ml-auto text-[var(--muted)]">
              <X size={20} />
            </button>
          </div>

          <button
            onClick={() => { dispatch(clearChat()); setIsSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] 
                     hover:border-[var(--color3)]/30 hover:shadow-md transition-all text-sm text-[var(--color4)] font-medium group"
          >
            <Plus size={16} className="text-[var(--muted)] group-hover:text-[var(--color3)] transition" />
            New Conversation
          </button>
        </div>

        {/* Sidebar History List (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
          <p className="text-xs font-semibold text-[var(--muted)] mb-3 px-2 uppercase tracking-wider">Recent</p>
          {/* Placeholder History Items */}
          {history.map((title: string, i: number) => (
            <button key={i} onClick={() => handleChangeChat(title)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--surface-hover)] text-left transition group">
              <MessageSquare size={14} className="text-[var(--muted)] group-hover:text-[var(--color3)]" />
              <span className="text-sm text-[var(--muted)] group-hover:text-[var(--color4)] truncate">{title}</span>
            </button>
          ))}
        </div>

        {/* Capabilities Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--color1)]/30">
          {/* Profile Pill (Aligned Center-Top of Input) */}
          <div className="flex justify-center">
            <Link to="/profile" className="flex w-full h-full justify-between items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--color3)]/40 hover:bg-[var(--surface-hover)] transition group shadow-sm backdrop-blur-md">
              {
                profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-8 h-8 rounded-full object-center
                   object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-violet-500 to-[var(--color3)] flex items-center justify-center text-white text-[10px] font-bold">{name.charAt(0)}</div>
                )
              }
              <span className="text-xs font-medium text-[var(--muted)] group-hover:text-[var(--color4)]">{name}</span>
              <Settings size={12} className="text-[var(--muted)] ml-1" />
            </Link>
          </div>
        </div>
      </aside>

      {/* --- MAIN CHAT AREA --- */}
      <main className="flex-1 flex flex-col h-full relative min-w-0 bg-[var(--color1)]">

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--glass-bg)] backdrop-blur-md z-10">
          <div className="flex items-center gap-2 font-bold text-[var(--color4)]">
            <Brain className="text-[var(--color3)]" size={20} /> Lysis
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-[var(--muted)] hover:text-[var(--color4)] bg-[var(--surface-hover)] rounded-lg">
            <Menu size={20} />
          </button>
        </header>

        {/* Chat Scroll Container */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 md:pb-[15rem] space-y-8 scroll-smooth pb-48">
          {currentTitle && (
            <div className="max-w-3xl mx-auto w-full mb-4">
              <h2 className="text-lg font-semibold text-[var(--color4)] truncate">{currentTitle}</h2>
            </div>
          )}
          {chatHistory.length === 0 ? (
            /* Empty State / Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center text-center px-4 animate-fade-in pb-20">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--color3)]/10 to-transparent flex items-center justify-center mb-6 border border-[var(--color3)]/20 shadow-2xl shadow-[var(--color3)]/10">
                <Sparkles size={40} className="text-[var(--color3)]" />
              </div>
              <h2 className="text-3xl font-bold text-[var(--color4)] mb-3 font-heading">How can I help?</h2>
              <p className="text-[var(--muted)] text-sm max-w-sm mb-10 leading-relaxed">
                I'm an advanced AI capable of researching the web, analyzing code, and solving complex problems with live reasoning.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
                <button onClick={() => setInput('Search for the latest Next.js 14 features.')} className="p-4 rounded-xl glass-card hover:border-[var(--color3)]/50 group text-left transition-all">
                  <span className="block text-sm font-semibold text-[var(--color4)] mb-1">🌐 Web Research</span>
                  <span className="block text-xs text-[var(--muted)] group-hover:text-[var(--color4)]">Find latest Next.js features</span>
                </button>
                <button onClick={() => setInput('Write a Python script to scrape a website.')} className="p-4 rounded-xl glass-card hover:border-[var(--color3)]/50 group text-left transition-all">
                  <span className="block text-sm font-semibold text-[var(--color4)] mb-1">🐍 Python Coding</span>
                  <span className="block text-xs text-[var(--muted)] group-hover:text-[var(--color4)]">Async web scraper script</span>
                </button>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="max-w-3xl mx-auto w-full space-y-8">
              {chatHistory.map((msg: object, idx: number) => (
                <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in group`}>

                  {msg.role === 'user' ? (
                    <div className="bg-[var(--color2)] text-[var(--color4)] px-5 py-3.5 rounded-2xl rounded-tr-sm max-w-[85%] text-[15px] border border-[var(--border)] leading-relaxed shadow-sm">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="flex gap-4 w-full min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color3)] flex-shrink-0 flex items-center justify-center text-white mt-1 shadow-lg shadow-[var(--color3)]/20">
                        <Brain size={18} />
                      </div>

                      {/* --- MARKDOWN CONTENT --- */}
                      <div className="flex-1 min-w-0 prose prose-invert max-w-none text-[var(--color4)]">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Override Code Blocks
                            code({ node, inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <CodeBlock
                                  language={match[1]}
                                  value={String(children).replace(/\n$/, '')}
                                />
                              ) : (
                                <code className="bg-[var(--surface-hover)] text-[var(--color3)] px-1.5 py-0.5 rounded font-mono text-sm" {...props}>
                                  {children}
                                </code>
                              );
                            },
                            // Style Links
                            a: ({ node, ...props }) => <a className="text-[var(--color3)] underline underline-offset-4 hover:text-white" {...props} />,
                            // Style Lists
                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 my-2 text-[var(--muted)]" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 space-y-1 my-2 text-[var(--muted)]" {...props} />
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-4 w-full animate-fade-in">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color3)] flex-shrink-0 flex items-center justify-center text-white mt-1">
                    <Brain size={18} />
                  </div>
                  <div className="flex items-center gap-2 text-[var(--muted)] text-sm pt-2">
                    <Loader2 size={16} className="animate-spin text-[var(--color3)]" />
                    <span className="font-medium">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* --- BOTTOM SECTION (Fixed) --- */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--color1)] via-[var(--color1)] to-transparent pt-20 pb-6 px-4 z-20">
          <div className="max-w-3xl mx-auto space-y-4">



            {/* Input Wrapper */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color3)] to-violet-600 rounded-2xl opacity-20 group-focus-within:opacity-50 blur transition duration-500"></div>
              <div className="relative bg-[var(--color1)] rounded-2xl border border-[var(--border)] focus-within:border-[var(--color3)]/50 transition-all shadow-xl overflow-hidden">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  className="w-full bg-transparent text-[var(--color4)] placeholder-[var(--muted)] text-[15px] px-5 py-4 pr-14 max-h-48 resize-none focus:outline-none custom-scroll leading-relaxed font-body"
                  placeholder="Ask anything..."
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="absolute right-2 bottom-2 p-2.5 rounded-xl bg-[var(--color3)] text-white hover:brightness-110 disabled:opacity-50 disabled:grayscale transition shadow-lg shadow-[var(--color3)]/20"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex justify-between items-center px-2">
              <div className="flex gap-2 items-center">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as 'qwen' | 'gptoss')}
                  className="bg-[var(--color1)] relative border border-[var(--border)] text-[var(--color4)] text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[var(--color3)]"
                >
                  <option value="qwen"><span className="font-medium rounded-lg ">Qwen 2.5</span></option>
                  <option value="gptoss"><span className="font-medium rounded-lg ">GPTOSS</span></option>
                </select>
                <div className="w-[1px] h-4 bg-[var(--border)] mx-1"></div>
                <ModeToggle
                  active={modes.web}
                  onClick={() => setModes(p => ({ ...p, web: !p.web }))}
                  icon={Globe}
                  label="Web"
                />
                <ModeToggle
                  active={modes.deep}
                  onClick={() => setModes(p => ({ ...p, deep: !p.deep }))}
                  icon={Brain}
                  label="Deep Think"
                />
              </div>
              <span className="text-[10px] text-[var(--muted)] font-mono hidden sm:block opacity-60">
                AI can make mistakes.
              </span>
            </div>

          </div>
        </div>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in" onClick={() => setIsSidebarOpen(false)} />
        )}

      </main>
    </div>
  );
};

export default Chat;
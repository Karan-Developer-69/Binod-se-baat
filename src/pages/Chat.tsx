import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Sparkles, Menu, Plus,
  Brain, Globe, Settings,
  Loader2, X, MessageSquare, Trash2, Square
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { getResponse } from '../redux/features/apiSlice';
import { addChat, type ChatMessage, clearChat } from '../redux/features/chatSlice';
import CodeBlock from '../components/CodeBlock';
import { loadOldData, addToHistory, deleteFromHistory, type HistoryItem } from '../redux/features/historySlice';
import type { RootState } from '../redux/store';

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

  const name = useSelector((state: RootState) => state.user.name || 'New User');
  const profileImage = useSelector((state: RootState) => state.user.image);

  const chatHistory = useSelector((state: RootState) => state.chatHistory || []);
  const loading = useSelector((state: RootState) => state.api.loading);


  // typed as HistoryItem[]
  const history = useSelector((state: RootState) => state.history as HistoryItem[] || []);

  const [input, setInput] = useState('');
  const [modes, setModes] = useState({ web: false, deep: false });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Use a unique ID for the current session. 
  // If null, we are in a "New Chat" state but haven't saved it yet.
  const [chatId, setChatId] = useState<string | null>(null);

  const [selectedModel, setSelectedModel] = useState<'qwen' | 'gptoss'>('qwen');

  const MODEL_URLS = {
    qwen: "https://karan6933-freeai.hf.space",
    gptoss: "https://karan6933-gptossfree.hf.space"
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatHistory, loading]);

  // Determine current title from chat content if not explicit
  const currentAssistant = [...chatHistory].reverse().find((m: ChatMessage) => m.role === 'assistant' && (m.title || m.content));
  const derivedTitle = currentAssistant ? (currentAssistant.title || (currentAssistant.content || '').split('\n').find(Boolean) || 'New Conversation') : 'New Conversation';


  // Load global history list on mount
  useEffect(() => {
    try {
      const storedHistoryText = localStorage.getItem("app_history_index");
      const storedHistory = storedHistoryText ? JSON.parse(storedHistoryText) : [];
      if (Array.isArray(storedHistory)) {
        dispatch(loadOldData(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load history index", e);
    }
  }, [dispatch]);

  // Load chat content when chatId changes
  useEffect(() => {
    if (chatId) {
      const storedChat = localStorage.getItem(`chat_${chatId}`);
      if (storedChat) {
        try {
          const parsed = JSON.parse(storedChat);
          if (Array.isArray(parsed)) {
            // Avoid dispatching if content is same to prevent loops, but simple clear+add is safe enough here
            // We only want to load IF the redux state is empty or different. 
            // For simplicity, we trust the user click action or ID change to trigger this load.
            // To prevent overwrite loop: We are NOT saving in this effect.
            dispatch(clearChat());
            parsed.forEach(msg => dispatch(addChat(msg)));
          }
        } catch (e) { console.error("Failed to parse chat", e); }
      }
    } else {
      // No ID means new chat
      dispatch(clearChat());
    }
  }, [chatId, dispatch]);


  // SAVE LOGIC: Update current chat content in localStorage and update history index
  useEffect(() => {
    if (chatHistory.length > 0) {
      // If we have content but no ID, generate one now.
      let currentId = chatId;
      if (!currentId) {
        currentId = Date.now().toString();
        setChatId(currentId);
      }

      // 1. Save Content
      localStorage.setItem(`chat_${currentId}`, JSON.stringify(chatHistory));

      // 2. Update History Index if title changed or it's new
      // We derive title from the chat content dynamically
      const historyItem: HistoryItem = {
        id: currentId,
        title: derivedTitle.substring(0, 40) + (derivedTitle.length > 40 ? '...' : ''),
        date: new Date().toISOString()
      };

      // Dispatch to Redux (will handle duplicate check/update)
      dispatch(addToHistory(historyItem));
    }
  }, [chatHistory, chatId, dispatch, derivedTitle]);

  // Sync History Index Redux -> LocalStorage
  // We do this in a separate effect to ensure the "index" persistence matches Redux state
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("app_history_index", JSON.stringify(history));
    }
  }, [history]);


  const startNewChat = () => {
    setChatId(null);
    dispatch(clearChat());
    setIsSidebarOpen(false);
  };

  const loadChat = (id: string) => {
    setChatId(id);
    setIsSidebarOpen(false);
    // The useEffect [chatId] will handle loading the content
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    localStorage.removeItem(`chat_${id}`);
    dispatch(deleteFromHistory(id));
    if (chatId === id) {
      startNewChat();
    }
  };


  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const handleSend = () => {
    if (loading) {
      stopGeneration();
      return;
    }

    if (!input.trim()) return;

    // Abort previous if any (safeguard)
    stopGeneration();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let finalPrompt = input;
    if (modes.web) finalPrompt += " (Use Web Search)";
    if (modes.deep) finalPrompt += " (Think Deeply)";

    dispatch(addChat({ id: Date.now(), role: 'user', content: input }));
    dispatch(getResponse(finalPrompt, MODEL_URLS[selectedModel], "session-1", controller.signal) as unknown as any);

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // TextArea auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);


  return (
    <div className="flex h-screen w-full bg-[var(--color1)] text-[var(--color4)] font-body overflow-hidden">

      <aside className={`
        fixed md:relative z-50 h-full w-[280px] bg-[var(--glass-bg)] backdrop-blur-xl border-r border-[var(--border)] 
        flex flex-col transition-transform duration-300 shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color3)] flex items-center justify-center text-white shadow-lg shadow-[var(--color3)]/20">
              <Brain size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-wide text-[var(--color4)]">Lysis AI</h1>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setSelectedModel('qwen')}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${selectedModel === 'qwen' ? 'bg-[var(--color3)] text-white border-[var(--color3)]' : 'text-[var(--muted)] border-[var(--border)] hover:border-[var(--color3)]'}`}
                >
                  Qwen
                </button>
                <button
                  onClick={() => setSelectedModel('gptoss')}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${selectedModel === 'gptoss' ? 'bg-[var(--color3)] text-white border-[var(--color3)]' : 'text-[var(--muted)] border-[var(--border)] hover:border-[var(--color3)]'}`}
                >
                  GPTOSS
                </button>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden ml-auto text-[var(--muted)]">
              <X size={20} />
            </button>
          </div>

          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] 
                     hover:border-[var(--color3)]/30 hover:shadow-md transition-all text-sm text-[var(--color4)] font-medium group"
          >
            <Plus size={16} className="text-[var(--muted)] group-hover:text-[var(--color3)] transition" />
            New Conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
          <p className="text-xs font-semibold text-[var(--muted)] mb-3 px-2 uppercase tracking-wider">Recent</p>
          {history.length === 0 && <div className="text-[var(--muted)] text-xs px-2 italic">No history yet</div>}
          {history.map((item) => (
            <div key={item.id} className="group relative">
              <button
                onClick={() => loadChat(item.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition ${chatId === item.id ? 'bg-[var(--surface-hover)] border border-[var(--border)]' : 'hover:bg-[var(--surface-hover)]'}`}
              >
                <MessageSquare size={14} className={`${chatId === item.id ? 'text-[var(--color3)]' : 'text-[var(--muted)]'}`} />
                <span className={`text-sm truncate pr-6 ${chatId === item.id ? 'text-[var(--color4)] font-medium' : 'text-[var(--muted)]'}`}>{item.title || "Untitled Chat"}</span>
              </button>
              <button
                onClick={(e) => handleDeleteChat(e, item.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[var(--muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Chat"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[var(--border)] bg-[var(--color1)]/30">
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

      <main className="flex-1 flex flex-col h-full relative min-w-0 bg-[var(--color1)]">

        <header className="md:hidden flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--glass-bg)] backdrop-blur-md z-10">
          <div className="flex items-center gap-2 font-bold text-[var(--color4)]">
            <Brain className="text-[var(--color3)]" size={20} /> Lysis
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-[var(--muted)] hover:text-[var(--color4)] bg-[var(--surface-hover)] rounded-lg">
            <Menu size={20} />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 md:pb-[15rem] space-y-8 scroll-smooth pb-48">
          {chatId && derivedTitle && (
            <div className="max-w-3xl mx-auto w-full mb-4">
              <h2 className="text-lg font-semibold text-[var(--color4)] truncate opacity-50 text-center">{derivedTitle}</h2>
            </div>
          )}
          {chatHistory.length === 0 ? (
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
            <div className="max-w-3xl mx-auto w-full space-y-8">
              {chatHistory.map((msg: ChatMessage, idx: number) => (
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

                      <div className="flex-1 min-w-0 prose prose-invert max-w-none text-[var(--color4)]">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ inline, className, children, ...props }: any) {
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
                            a: ({ ...props }) => <a className="text-[var(--color3)] underline underline-offset-4 hover:text-white" {...props} />,
                            ul: ({ ...props }) => <ul className="list-disc pl-4 space-y-1 my-2 text-[var(--muted)]" {...props} />,
                            ol: ({ ...props }) => <ol className="list-decimal pl-4 space-y-1 my-2 text-[var(--muted)]" {...props} />
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

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--color1)] via-[var(--color1)] to-transparent pt-20 pb-6 px-4 z-20">
          <div className="max-w-3xl mx-auto space-y-4">

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
                  disabled={(!input.trim() && !loading)}
                  className={`absolute right-2 bottom-2 p-2.5 rounded-xl text-white transition shadow-lg shadow-[var(--color3)]/20 
                    ${loading ? 'bg-red-500 hover:bg-red-600' : 'bg-[var(--color3)] hover:brightness-110 disabled:opacity-50 disabled:grayscale'}`}
                >
                  {loading ? <Square size={18} fill="currentColor" /> : <Send size={18} />}
                </button>
              </div>
            </div>

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

        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in" onClick={() => setIsSidebarOpen(false)} />
        )}

      </main>
    </div>
  );
};

export default Chat;
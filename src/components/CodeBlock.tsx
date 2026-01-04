import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, Terminal } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-[var(--border)] bg-[#0d1117] shadow-lg group">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--color2)] border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-[var(--color3)]" />
          <span className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider">
            {language || 'code'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-white transition-colors px-2 py-1 rounded hover:bg-[var(--surface-hover)]"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Area */}
      <div className="relative overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            background: 'transparent', // Let parent bg handle it
            fontSize: '0.9rem',
            fontFamily: 'var(--font-mono)',
            lineHeight: '1.6',
          }}
          wrapLines={true}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;
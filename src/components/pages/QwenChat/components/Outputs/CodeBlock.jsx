import React, { useState } from 'react';

function highlightCodeTokens(code, language) {
  if (!code) return null;

  // Single-pass tokenizer regex for Code Blocks
  // "#"/"--" only count as line comments when followed by whitespace/end-of-line
  // (or "!" for shebangs) so CSS custom properties like `--primary-color` and
  // hex colors like `#131925` aren't swallowed as comments.
  const codeRegex = /(\/\/.*$|\/\*[\s\S]*?\*\/|#(?=[ \t!]|$).*$|--(?=[ \t]|$).*$|"(?:\\.|[^\\"])*"|'(?:\\.|[^\\'])*'|`(?:\\.|[^\\`])*`|\b(?:import|export|from|return|function|const|let|var|default|if|else|async|await|class|public|private|static|void|CREATE|INDEX|ON|SELECT|WHERE|INSERT|DELETE|UPDATE|FROM)\b|\b(?:true|false|null|undefined)\b|-?\d+(?:\.\d+)?|\b[a-zA-Z_]\w*(?=\s*\())/gm;

  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = codeRegex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      elements.push(code.substring(lastIndex, match.index));
    }

    const token = match[0];
    let tokenClass = "text-[#E2E8F0]";

    if (token.startsWith('//') || token.startsWith('/*') || token.startsWith('#') || token.startsWith('--')) {
      tokenClass = "text-[#64748B] italic"; // Comments: Neutral Slate italic
    } else if (token.startsWith('"') || token.startsWith("'") || token.startsWith('`')) {
      tokenClass = "text-[#86EFAC]"; // Strings: Muted Emerald
    } else if (/^(import|export|from|return|function|const|let|var|default|if|else|async|await|class|public|private|static|void|CREATE|INDEX|ON|SELECT|WHERE|INSERT|DELETE|UPDATE|FROM)$/.test(token)) {
      tokenClass = "text-[#93C5FD] font-medium"; // Keywords: Muted Sky Blue
    } else if (/^(true|false|null|undefined)$/.test(token)) {
      tokenClass = "text-[#C084FC]"; // Booleans & Constants: Muted Soft Purple
    } else if (!isNaN(Number(token))) {
      tokenClass = "text-[#FDE68A]"; // Numbers: Muted Amber
    } else if (/^[a-zA-Z_]\w*$/.test(token)) {
      tokenClass = "text-[#7DD3FC]"; // Function calls: Muted Soft Cyan
    }

    elements.push(<span key={match.index} className={tokenClass}>{token}</span>);
    lastIndex = codeRegex.lastIndex;
  }

  if (lastIndex < code.length) {
    elements.push(code.substring(lastIndex));
  }

  return elements;
}

export function CodeBlock({ language = 'code', value = '', ...props }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-2xl bg-[#131925] overflow-hidden text-[13px]">
      <div className="flex items-center justify-between px-4 py-2.5 text-[#8592A6]">
        <span className="font-mono text-[11px] font-medium tracking-wide">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] hover:text-[#F7F8FA] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none rounded transition-colors cursor-pointer"
          title="Copy code"
          aria-label="Copy code"
        >
          <span className="material-symbols-outlined text-[15px]">
            {copied ? 'check' : 'content_copy'}
          </span>
        </button>
      </div>
      <div className="px-5 pb-5 pt-1 overflow-x-auto font-mono text-[#E2E8F0] leading-[1.7]">
        <pre className="whitespace-pre">{highlightCodeTokens(value, language)}</pre>
      </div>
    </div>
  );
}

export default CodeBlock;

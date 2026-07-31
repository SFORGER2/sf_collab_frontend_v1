import React, { useState } from 'react';

function highlightJsonTokens(jsonStr) {
  if (!jsonStr) return null;

  const jsonRegex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}[\],])/g;
  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = jsonRegex.exec(jsonStr)) !== null) {
    if (match.index > lastIndex) {
      elements.push(jsonStr.substring(lastIndex, match.index));
    }

    const token = match[0];
    let tokenClass = "text-[#CBD5E1]";

    if (token.startsWith('"')) {
      if (token.endsWith(':')) {
        const keyText = token.slice(0, -1);
        elements.push(
          <span key={match.index} className="text-[#93C5FD] font-medium">{keyText}</span>,
          <span key={match.index + '-colon'} className="text-[#64748B]">:</span>
        );
        lastIndex = jsonRegex.lastIndex;
        continue;
      } else {
        tokenClass = "text-[#86EFAC]";
      }
    } else if (token === 'true' || token === 'false') {
      tokenClass = "text-[#C084FC]";
    } else if (token === 'null') {
      tokenClass = "text-[#94A3B8]";
    } else if (!isNaN(Number(token))) {
      tokenClass = "text-[#FDE68A]";
    } else if (/[{}[\],]/.test(token)) {
      tokenClass = "text-[#64748B]";
    }

    elements.push(<span key={match.index} className={tokenClass}>{token}</span>);
    lastIndex = jsonRegex.lastIndex;
  }

  if (lastIndex < jsonStr.length) {
    elements.push(jsonStr.substring(lastIndex));
  }

  return elements;
}

export function JsonViewer({ data }) {
  const [copied, setCopied] = useState(false);
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-2xl bg-[#131925] overflow-hidden text-[13px]">
      <div className="flex items-center justify-between px-4 py-2.5 text-[#8592A6]">
        <span className="font-mono text-[11px] font-medium tracking-wide">JSON</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] hover:text-[#F7F8FA] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none rounded transition-colors cursor-pointer"
          title="Copy JSON"
          aria-label="Copy JSON"
        >
          <span className="material-symbols-outlined text-[15px]">
            {copied ? 'check' : 'content_copy'}
          </span>
        </button>
      </div>
      <div className="px-5 pb-5 pt-1 overflow-x-auto font-mono text-[#CBD5E1] leading-[1.7]">
        <pre className="whitespace-pre">{highlightJsonTokens(jsonString)}</pre>
      </div>
    </div>
  );
}

export default JsonViewer;

import React, { useState } from 'react';

function renderSemanticTerminalLines(content) {
  if (!content) return null;

  const lines = content.split('\n');

  return lines.map((line, idx) => {
    const trimmed = line.trim();

    // 1. Command Prompt line starting with $ or >
    if (trimmed.startsWith('$ ') || trimmed.startsWith('> ')) {
      const promptChar = line.substring(0, line.indexOf(trimmed.charAt(0)) + 1);
      const rest = line.substring(line.indexOf(trimmed.charAt(0)) + 1);

      return (
        <div key={idx} className="leading-[1.7]">
          <span className="text-[#60A5FA] font-medium select-none">{promptChar}</span>
          <span className="text-[#F1F5F9]">{rest}</span>
        </div>
      );
    }

    // 2. Success outcomes
    const isSuccess = /FINISHED|SUCCESS|BUILD SUCCESS|200 OK|sha256:|naming to/i.test(trimmed);
    if (isSuccess) {
      return (
        <div key={idx} className="text-[#4ADE80] leading-[1.7]">
          {line}
        </div>
      );
    }

    // 3. Error outcomes
    const isError = /ERROR|FAILED|FATAL|EXCEPTION|Command failed|err!/i.test(trimmed);
    if (isError) {
      return (
        <div key={idx} className="text-[#F87171] leading-[1.7]">
          {line}
        </div>
      );
    }

    // 4. Warning outcomes
    const isWarning = /WARN|WARNING|Deprecated/i.test(trimmed);
    if (isWarning) {
      return (
        <div key={idx} className="text-[#FBBF24] leading-[1.7]">
          {line}
        </div>
      );
    }

    // 5. File / Layer step line (e.g. => [1/6] FROM docker.io...)
    if (trimmed.startsWith('=>')) {
      return (
        <div key={idx} className="text-[#94A3B8] leading-[1.7]">
          <span className="text-[#60A5FA] font-medium">=&gt;</span>
          <span>{line.substring(line.indexOf('=>') + 2)}</span>
        </div>
      );
    }

    // 6. Neutral output line
    return (
      <div key={idx} className="text-[#CBD5E1] leading-[1.7]">
        {line}
      </div>
    );
  });
}

export function TerminalView({ content = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-2xl bg-[#0D1118] overflow-hidden text-[13px] font-mono">
      <div className="flex items-center justify-between px-4 py-2.5 text-[#8592A6]">
        <span className="text-[11px] font-medium tracking-wide">Terminal</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] hover:text-[#F7F8FA] focus-visible:ring-1 focus-visible:ring-[#7CA6FF] outline-none rounded transition-colors cursor-pointer"
          title="Copy output"
          aria-label="Copy output"
        >
          <span className="material-symbols-outlined text-[15px]">
            {copied ? 'check' : 'content_copy'}
          </span>
        </button>
      </div>
      <div className="px-5 pb-5 pt-1 overflow-x-auto text-[#CBD5E1]">
        <pre className="whitespace-pre">{renderSemanticTerminalLines(content)}</pre>
      </div>
    </div>
  );
}

export default TerminalView;

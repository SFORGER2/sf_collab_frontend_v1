import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CodeBlock, TerminalView, MermaidRenderer, FileCard, JsonViewer, CsvViewer } from "../Outputs";
import MessageActions from "./MessageActions";
import QwenLogo from "../ui/QwenLogo";
import OutputAnimations from "../OutputAnimations";
const GenerationRenderer = OutputAnimations;

function renderInlineFormatting(str) {
  if (!str) return null;
  const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={idx} className="font-semibold text-[#F7F8FA]">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={idx} className="bg-[#1A2232] text-[#93C5FD] px-1.5 py-0.5 rounded text-[13px] font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function renderFormattedText(textChunk) {
  if (!textChunk) return null;

  const lines = textChunk.split('\n');
  const elements = [];
  let tableBuffer = [];

  const flushTable = (key) => {
    if (!tableBuffer.length) return;
    const cleanLines = tableBuffer.filter(l => l.trim() && !l.trim().match(/^\|?[\s:-|]+\|?$/));
    tableBuffer = [];

    if (!cleanLines.length) return;
    const parseRow = line => line.split('|').map(c => c.trim()).filter((c, idx, arr) => (idx > 0 && idx < arr.length - 1) || c !== '');
    const headerCells = parseRow(cleanLines[0]);
    const bodyRows = cleanLines.slice(1).map(parseRow);

    elements.push(
      <div key={key} className="my-4 w-full overflow-x-auto custom-workspace-scrollbar rounded-2xl bg-[#131925] p-3 text-[13.5px]">
        <table className="w-full text-left border-collapse font-sans">
          <thead>
            <tr className="border-b border-[#1F2736]">
              {headerCells.map((cell, idx) => (
                <th key={idx} className="py-2.5 px-3.5 font-semibold text-[#F7F8FA]">
                  {renderInlineFormatting(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2736]/60 text-[#D1D5DB]">
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-[#1A2232]/40 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="py-2.5 px-3.5">
                    {renderInlineFormatting(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Markdown Table Line
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      tableBuffer.push(trimmed);
      return;
    } else {
      flushTable(`table-${idx}`);
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(<h3 key={idx} className="text-[16px] font-semibold text-[#F7F8FA] mt-4 mb-2">{renderInlineFormatting(trimmed.slice(4))}</h3>);
    } else if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={idx} className="text-[18px] font-bold text-[#F7F8FA] mt-5 mb-2.5">{renderInlineFormatting(trimmed.slice(3))}</h2>);
    } else if (trimmed.startsWith('# ')) {
      elements.push(<h1 key={idx} className="text-[20px] font-bold text-[#F7F8FA] mt-6 mb-3">{renderInlineFormatting(trimmed.slice(2))}</h1>);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(<li key={idx} className="ml-4 list-disc text-[#F7F8FA] leading-[1.7]">{renderInlineFormatting(trimmed.slice(2))}</li>);
    } else if (trimmed.match(/^\[(File|Document|Attachment):/i)) {
      elements.push(<FileCard key={idx} text={trimmed} />);
    } else if (trimmed) {
      elements.push(<p key={idx} className="leading-[1.7] text-[#F7F8FA]">{renderInlineFormatting(line)}</p>);
    }
  });

  flushTable(`table-end`);
  return elements;
}

function renderResponseBlocks(content) {
  if (!content) return null;

  const codeBlockRegex = /```(\w*)\n([\s\S]*?)(?:```|$)/g;
  const blocks = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index === codeBlockRegex.lastIndex) {
      codeBlockRegex.lastIndex++;
    }

    if (match.index > lastIndex) {
      const textBefore = content.substring(lastIndex, match.index);
      if (textBefore.trim()) {
        blocks.push(
          <div key={`text-${lastIndex}`} className="text-[#F7F8FA] leading-[1.7] space-y-2">
            {renderFormattedText(textBefore)}
          </div>
        );
      }
    }

    const lang = (match[1] || '').toLowerCase();
    const codeString = match[2] || '';

    if (codeString || lang) {
      if (lang === 'json') {
        blocks.push(<JsonViewer key={`code-${match.index}`} data={codeString} />);
      } else if (lang === 'csv') {
        blocks.push(<CsvViewer key={`code-${match.index}`} content={codeString} />);
      } else if (['bash', 'sh', 'terminal', 'zsh', 'cli', 'console', 'cmd', 'powershell'].includes(lang)) {
        blocks.push(<TerminalView key={`code-${match.index}`} content={codeString} />);
      } else if (lang === 'mermaid' || /^(graph|flowchart|sequenceDiagram)/i.test(codeString.trim())) {
        blocks.push(<MermaidRenderer key={`code-${match.index}`} content={codeString} />);
      } else {
        blocks.push(<CodeBlock key={`code-${match.index}`} language={lang || 'code'} value={codeString} />);
      }
    }

    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    const textRemaining = content.substring(lastIndex);
    if (textRemaining.trim()) {
      blocks.push(
        <div key={`text-${lastIndex}`} className="text-[#F7F8FA] leading-[1.7] space-y-2">
          {renderFormattedText(textRemaining)}
        </div>
      );
    }
  }

  return blocks;
}

function AIMessage({ message, prompt = "", onRetry }) {
  const content = message.content || "";
  const isLoading = message.isLoading || false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.16,
        ease: "easeOut",
      }}
      className="flex gap-4 w-full text-left py-1 group/ai-msg"
    >
      {/* Logo shown only during loading/generation */}
      {isLoading && (
        <div className="flex-shrink-0 pt-0.5 select-none">
          <QwenLogo size={32} animated={isLoading} />
        </div>
      )}

      <div className="flex-1 min-w-0 font-sans space-y-3">
        {/* Model header shown only during loading/generation */}
        {isLoading && (
          <div className="flex items-center gap-2 select-none">
            <span className="text-[13px] font-semibold text-[#F7F8FA]">
              {message.model || "Qwen 2.5 32B"}
            </span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isLoading && !content ? (
            <motion.div
              key="typing-indicator"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="py-1"
            >
              <span className="inline-flex items-center gap-1.5 text-xs text-[#94A0B4] font-medium tracking-wide">
                <span>Qwen is thinking</span>
                <span className="inline-flex">
                  <motion.span
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                  >.</motion.span>
                  <motion.span
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut", delay: 0.33 }}
                  >.</motion.span>
                  <motion.span
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut", delay: 0.66 }}
                  >.</motion.span>
                </span>
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="response-canvas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full flex flex-col gap-3"
            >
              {content && (
                <GenerationRenderer content={content} isLoading={isLoading}>
                  <div className="font-sans text-ai-body-lg text-[#F7F8FA] space-y-4">
                    {renderResponseBlocks(content)}
                  </div>
                </GenerationRenderer>
              )}

              {!isLoading && content && (
                <div className="pt-1">
                  <MessageActions content={content} onRetry={onRetry} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default React.memo(AIMessage);

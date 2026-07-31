import React from 'react';

function highlightMermaidSyntax(diagramStr) {
  if (!diagramStr) return null;

  const lines = diagramStr.split('\n');

  return lines.map((line, idx) => {
    const trimmed = line.trim();

    // Diagram header line (e.g. graph TD, sequenceDiagram, flowchart LR)
    if (/^(graph|flowchart|sequenceDiagram|classDiagram|erDiagram|gantt|stateDiagram)/i.test(trimmed)) {
      return (
        <div key={idx} className="text-[#93C5FD] font-semibold leading-[1.7]">
          {line}
        </div>
      );
    }

    // Connectors and arrows (--> , ==> , -.-)
    if (/(-->|==>|-\.->|--|==)/.test(line)) {
      const parts = line.split(/(-->|==>|-\.->|--|==)/);
      return (
        <div key={idx} className="leading-[1.7]">
          {parts.map((part, pIdx) => {
            if (/^(-->|==>|-\.->|--|==)$/.test(part)) {
              return <span key={pIdx} className="text-[#60A5FA] font-bold px-1">{part}</span>;
            }
            return <span key={pIdx} className="text-[#CBD5E1]">{part}</span>;
          })}
        </div>
      );
    }

    return (
      <div key={idx} className="text-[#CBD5E1] leading-[1.7]">
        {line}
      </div>
    );
  });
}

export function MermaidRenderer({ content = '' }) {
  return (
    <div className="my-4 rounded-2xl bg-[#131925] overflow-hidden text-[13px]">
      <div className="px-4 py-2.5 text-[#8592A6]">
        <span className="font-mono text-[11px] font-medium tracking-wide">Diagram</span>
      </div>
      <div className="px-5 pb-5 pt-1 overflow-x-auto font-mono text-[#CBD5E1]">
        <pre className="whitespace-pre">{highlightMermaidSyntax(content)}</pre>
      </div>
    </div>
  );
}

export default MermaidRenderer;

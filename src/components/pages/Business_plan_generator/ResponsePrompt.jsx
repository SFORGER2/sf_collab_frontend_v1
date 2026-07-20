import ReactMarkdown from "react-markdown";
import { toast } from "react-toastify";
import remarkGfm from "remark-gfm";

export default function ResponsePrompt({ results }) {
  

  return (
    <>
      
    <div className="w-full mx-auto rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="text-3xl font-bold text-white mt-6 mb-4"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-2xl font-semibold text-white mt-6 mb-3"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-xl font-semibold text-white mt-5 mb-2"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p
              className="text-white/80 leading-relaxed mb-4"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc list-inside text-white/80 mb-4 space-y-2"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal list-inside text-white/80 mb-4 space-y-2"
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-2" {...props} />
          ),
          code: ({ inline, className, children, ...props }) =>
            inline ? (
              <code className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-sm">
                {children}
              </code>
            ) : (
              <pre className="bg-black/40 border border-white/10 rounded-xl p-4 overflow-x-auto mb-4">
                <code className="text-sm text-white font-mono">
                  {children}
                </code>
              </pre>
            ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-indigo-400 pl-4 italic text-white/70 my-4"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table
                className="w-full border border-white/10 rounded-xl overflow-hidden"
                {...props}
              />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              className="bg-white/10 text-white px-4 py-2 text-left"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="border-t border-white/10 px-4 py-2 text-white/80"
              {...props}
            />
          ),
        }}
      >
        {results.response}
      </ReactMarkdown>
      </div>
      </>
  );
}

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownFileRender({ content, filePath }) {
  const [md, setMd] = useState(content || "");

  useEffect(() => {
    if (!filePath) return;

    fetch(filePath)
      .then((r) => r.text())
      .then(setMd)
      .catch(console.error);
  }, [filePath]);

  return (
    <div className="w-full min-h-screen p-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, children, ...props }) {
            if (inline) {
              return (
                <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono text-red-600 dark:text-red-400">
                  {children}
                </code>
              );
            }

            return (
              <pre className="w-full overflow-x-auto my-4">
                <code
                  className="block w-full bg-gray-950 text-gray-100 p-4 rounded-lg border border-gray-800"
                  {...props}
                >
                  {children}
                </code>
              </pre>
            );
          },

          a({ href, children }) {
            return (
              <a
                href={href}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {children}
              </a>
            );
          },

          blockquote({ children }) {
            return (
              <blockquote className="w-full border-l-4 border-blue-500 dark:border-blue-600 pl-4 italic text-gray-700 dark:text-gray-300 my-4 bg-gray-50 dark:bg-gray-800 py-2 pr-4 rounded">
                {children}
              </blockquote>
            );
          },

          h1({ children }) {
            return <h1 className="text-4xl font-bold mt-8 mb-4">{children}</h1>;
          },

          h2({ children }) {
            return <h2 className="text-3xl font-bold mt-6 mb-3">{children}</h2>;
          },

          h3({ children }) {
            return <h3 className="text-2xl font-bold mt-4 mb-2">{children}</h3>;
          },
        }}
      >
        {md}
      </ReactMarkdown>
    </div>
  );
}

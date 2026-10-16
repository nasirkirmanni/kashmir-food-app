import ReactMarkdown from "react-markdown";

const linkClass =
  "text-[var(--saffron)] hover:text-amber-400 underline decoration-white/20 underline-offset-4";

/**
 * One line of markdown (emphasis and links only) rendered without a wrapping paragraph, for
 * table cells and short labels.
 */
export default function InlineMarkdown({ text }) {
  return (
    <ReactMarkdown
      allowedElements={["p", "em", "strong", "a"]}
      unwrapDisallowed
      components={{
        p: ({ children }) => <>{children}</>,
        a: ({ node, href, children }) => {
          const external = /^https?:\/\//.test(href || "");
          return (
            <a
              href={href}
              className={linkClass}
              {...(external ? { rel: "noopener" } : {})}
            >
              {children}
            </a>
          );
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./manifesto.module.css";

type ChapterBodyProps = {
  /** Raw Markdown to render server-side. */
  markdown: string;
  /** "intro" treats the heading ladder as a book-spread opener (BGET · tagline · vision). */
  variant?: "default" | "intro";
};

/**
 * Server-side prose renderer for manifesto bodies. Covers h2–h4, strong,
 * *em* (straight, gold-tinted), blockquotes, lists, code and the closing
 * `---` hairline. `node` is dropped from props so nothing unknown reaches the DOM.
 */
export default function ChapterBody({ markdown, variant = "default" }: ChapterBodyProps) {
  const intro = variant === "intro";

  const h2 = intro ? `${styles.proseH2} ${styles.introH2}` : styles.proseH2;
  const h3 = intro ? `${styles.proseH3} ${styles.introH3}` : styles.proseH3;
  const h4 = intro ? `${styles.proseH4} ${styles.introH4}` : styles.proseH4;

  const components: Components = {
    p: ({ node, children, ...props }) => (
      <p {...props} className={styles.proseP}>
        {children}
      </p>
    ),
    h2: ({ node, children, ...props }) => (
      <h2 {...props} className={h2}>
        {children}
      </h2>
    ),
    h3: ({ node, children, ...props }) => (
      <h3 {...props} className={h3}>
        {children}
      </h3>
    ),
    h4: ({ node, children, ...props }) => (
      <h4 {...props} className={h4}>
        {children}
      </h4>
    ),
    strong: ({ node, children, ...props }) => (
      <strong {...props} className={styles.proseStrong}>
        {children}
      </strong>
    ),
    em: ({ node, children, ...props }) => (
      <em {...props} className={styles.proseEm}>
        {children}
      </em>
    ),
    blockquote: ({ node, children, ...props }) => (
      <blockquote {...props} className={styles.proseBlockquote}>
        {children}
      </blockquote>
    ),
    ul: ({ node, children, ...props }) => (
      <ul {...props} className={styles.proseUl}>
        {children}
      </ul>
    ),
    ol: ({ node, children, ...props }) => (
      <ol {...props} className={styles.proseOl}>
        {children}
      </ol>
    ),
    li: ({ node, children, ...props }) => (
      <li {...props} className={styles.proseLi}>
        {children}
      </li>
    ),
    code: ({ node, children, ...props }) => (
      <code {...props} className={styles.proseCode}>
        {children}
      </code>
    ),
    pre: ({ node, children, ...props }) => (
      <pre {...props} className={styles.prosePre}>
        {children}
      </pre>
    ),
    a: ({ node, children, ...props }) => (
      <a {...props} className={styles.proseA}>
        {children}
      </a>
    ),
    hr: ({ node, ...props }) => <hr {...props} className={styles.proseHr} />,
  };

  return (
    <div className={`${styles.prose}${intro ? ` ${styles.introBody}` : ""}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownRendererProps {
  content: string;
}

// Flatten a hast node's text content so we can detect special paragraphs.
function nodeText(node: any): string {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  if (Array.isArray(node.children)) return node.children.map(nodeText).join('');
  return '';
}

// Renders untrusted markdown safely: rehype-sanitize strips any embedded HTML
// / script so blog content can never inject markup into the page.
export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [zoomed, setZoomed] = useState<{ src: string; alt: string } | null>(null);

  // Let readers dismiss the zoomed image with Escape, and lock background
  // scroll while the lightbox is open.
  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomed(null);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [zoomed]);

  if (!content) return null;

  return (
    <div className="post-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
          p: ({ node, children, ...props }) => {
            // Render a "Stack: a · b · c" paragraph as colored tag chips.
            const text = nodeText(node).trim();
            if (/^stack\s*:/i.test(text)) {
              const items = text
                .replace(/^stack\s*:/i, '')
                .replace(/\.\s*$/, '')
                .split('·')
                .map((s) => s.trim())
                .filter(Boolean);
              if (items.length) {
                return (
                  <div className="stack-tags">
                    <span className="stack-label">Stack</span>
                    {items.map((item) => (
                      <span key={item} className="stack-tag">{item}</span>
                    ))}
                  </div>
                );
              }
            }
            return <p {...props}>{children}</p>;
          },
          img: ({ node, ...props }) => (
            <img
              {...props}
              className="post-image"
              loading="lazy"
              tabIndex={0}
              role="button"
              aria-label={props.alt ? `View larger: ${props.alt}` : 'View larger image'}
              onClick={() => setZoomed({ src: props.src || '', alt: props.alt || '' })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setZoomed({ src: props.src || '', alt: props.alt || '' });
                }
              }}
            />
          )
        }}
      >
        {content}
      </ReactMarkdown>

      {zoomed && (
        <div
          className="lightbox-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={zoomed.alt || 'Enlarged image'}
          onClick={() => setZoomed(null)}
        >
          <button
            type="button"
            className="lightbox-close"
            aria-label="Close"
            onClick={() => setZoomed(null)}
          >
            &times;
          </button>
          <img
            className="lightbox-image"
            src={zoomed.src}
            alt={zoomed.alt}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Clock } from 'lucide-react';
import { seedPosts, type BlogPost } from 'shared';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { API_BASE } from '../config';

// Offline fallback posts come from the shared seed data (single source of truth).
const fallbackPosts: BlogPost[] = seedPosts;

export default function Blog() {
  const { slug } = useParams<{ slug: string }>();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch all posts
  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch(`${API_BASE}/posts`);
        if (!res.ok) throw new Error('API server returned error');
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.warn('API error, falling back to local dataset:', err);
        setPosts(fallbackPosts);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  // Fetch single post if slug is present
  useEffect(() => {
    if (!slug) {
      setCurrentPost(null);
      return;
    }
    
    async function loadPost() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/posts/${slug}`);
        if (!res.ok) throw new Error('Post not found');
        const data = await res.json();
        setCurrentPost(data);
      } catch (err) {
        console.warn('API error fetching post, falling back to local search:', err);
        const match = fallbackPosts.find(p => p.slug === slug);
        if (match) {
          setCurrentPost(match);
        } else {
          setErrorMsg('Blog post not found.');
        }
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <p>Loading blog content...</p>
      </div>
    );
  }

  // Reading view
  if (slug) {
    if (errorMsg || !currentPost) {
      return (
        <div className="container blog-layout" style={{ padding: '40px 24px' }}>
          <Link to="/blog" className="btn btn-secondary btn-sm" style={{ marginBottom: '24px' }}>
            <ArrowLeft size={16} /> Back to Blog
          </Link>
          <div className="admin-card">
            <h2>Error</h2>
            <p>{errorMsg || 'Post could not be loaded.'}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="container blog-layout" id="post-view-page">
        <Link to="/blog" className="btn btn-secondary btn-sm" style={{ marginBottom: '24px' }} id="back-to-blog-link">
          <ArrowLeft size={16} /> Back to Blog
        </Link>
        <article>
          <header className="post-header">
            <h1 className="post-title">{currentPost.title}</h1>
            <div className="post-meta">
              <span className="blog-date">
                <Calendar size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                {formatDate(currentPost.created_at)}
              </span>
              <span>
                <Clock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                {Math.ceil(currentPost.content.split(/\s+/).length / 200)} min read
              </span>
            </div>
          </header>
          <MarkdownRenderer content={currentPost.content} />
        </article>
      </div>
    );
  }

  // Grid/List view
  return (
    <div className="container blog-layout" id="blog-list-page">
      <div className="section-title-wrapper">
        <span className="section-tagline">Insights</span>
        <h2>Data Engineering Blog</h2>
        <p>Writing about BigQuery optimizations, data pipelines resilience, machine learning workflows, and cloud engineering best practices.</p>
      </div>

      <div className="blog-list" id="blog-posts-list">
        {posts.map(post => (
          <article className="blog-item" key={post.id}>
            <div className="blog-meta">
              <span className="blog-date">
                <Calendar size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                {formatDate(post.created_at)}
              </span>
            </div>
            <h3 className="blog-item-title">
              <Link to={`/blog/${post.slug}`}>{post.title}</Link>
            </h3>
            <p className="blog-item-excerpt">{post.excerpt}</p>
            <Link to={`/blog/${post.slug}`} className="blog-item-link">
              Read Article &rarr;
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

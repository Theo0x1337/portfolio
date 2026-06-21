import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, LogOut, Lock, CheckCircle2 } from 'lucide-react';
import type { BlogPost, BlogPostInput } from 'shared';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { API_BASE } from '../config';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Check login on load
  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
    }
  }, []);

  // Fetch posts when logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    loadAdminPosts();
  }, [isLoggedIn, token]);

  // Auto-generate slug from title
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    // If not editing an existing post, or if slug is empty, auto-generate it
    if (!editingPost) {
      const generatedSlug = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .replace(/\s+/g, '-')        // replace spaces with hyphens
        .replace(/-+/g, '-');        // collapse double hyphens
      setSlug(generatedSlug);
    }
  };

  async function loadAdminPosts() {
    try {
      const res = await fetch(`${API_BASE}/posts`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin posts:', err);
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (!res.ok) {
        throw new Error('Invalid master password');
      }
      
      const data = await res.json();
      localStorage.setItem('admin_token', data.token);
      setToken(data.token);
      setIsLoggedIn(true);
      setPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    }
  };

  const handleLogout = async () => {
    // Best-effort server-side session revocation.
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.warn('Logout request failed (clearing local session anyway):', err);
    }
    localStorage.removeItem('admin_token');
    setToken('');
    setIsLoggedIn(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingPost(null);
    setIsCreating(false);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setErrorMsg('');
  };

  const handleCreateNewClick = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleEditClick = (post: BlogPost) => {
    setEditingPost(post);
    setIsCreating(false);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setErrorMsg('');
  };

  const handleDeleteClick = async (id: string, postTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${postTitle}"?`)) {
      return;
    }
    
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE}/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to delete post');
      }

      setSuccessMsg('Post deleted successfully');
      loadAdminPosts();
    } catch (err: any) {
      setErrorMsg(err.message || 'Delete operation failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!title || !slug || !excerpt || !content) {
      setErrorMsg('All fields are required.');
      return;
    }

    const postInput: BlogPostInput = { title, slug, excerpt, content };

    try {
      const url = editingPost ? `${API_BASE}/posts/${editingPost.id}` : `${API_BASE}/posts`;
      const method = editingPost ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postInput)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save post');
      }

      setSuccessMsg(editingPost ? 'Post updated successfully' : 'Post created successfully');
      resetForm();
      loadAdminPosts();
    } catch (err: any) {
      setErrorMsg(err.message || 'Save operation failed');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="container" id="admin-login-page">
        <div className="admin-login-container admin-card">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Lock size={36} style={{ color: 'var(--accent)' }} />
            <h2 style={{ marginTop: '12px' }}>Admin Login Portal</h2>
            <p>Access the blog writing and management panel.</p>
          </div>

          <form onSubmit={handleLogin} id="admin-login-form">
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="admin-pass">Master Password / Access Token</label>
              <input
                id="admin-pass"
                type="password"
                className="admin-input"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {errorMsg && <p style={{ color: '#E07A5F', fontSize: '0.9rem', marginBottom: '16px' }}>{errorMsg}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} id="login-submit-btn">
              Login to Console
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container" id="admin-dashboard-page">
      <div className="admin-header">
        <div>
          <h2>Admin Management Panel</h2>
          <p>Create, update, or remove articles from theo0x1337 blog.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {!isCreating && !editingPost && (
            <button className="btn btn-primary btn-sm" onClick={handleCreateNewClick} id="create-new-post-btn">
              <Plus size={16} /> New Article
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={handleLogout} id="logout-btn">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: 'var(--accent-light)', border: '1px solid var(--accent-border)', borderRadius: '6px', marginBottom: '24px', color: 'var(--text)' }}>
          <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '12px 16px', border: '1px solid #E07A5F', borderRadius: '6px', marginBottom: '24px', color: '#E07A5F', backgroundColor: 'rgba(224, 122, 95, 0.05)' }}>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Write/Edit Form */}
      {(isCreating || editingPost) && (
        <div className="admin-editor-grid" style={{ marginBottom: '40px' }}>
          {/* Editor Form Card */}
          <div className="admin-card" id="post-editor-form">
            <h3>{editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}</h3>
            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
              <div className="admin-form-group">
                <label className="admin-label" htmlFor="post-title">Article Title</label>
                <input
                  id="post-title"
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Scaling ETL workflows on GCP"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label" htmlFor="post-slug">Slug Identifier (auto-generated)</label>
                <input
                  id="post-slug"
                  type="text"
                  className="admin-input"
                  placeholder="e.g. scaling-etl-workflows-on-gcp"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label" htmlFor="post-excerpt">Short Excerpt (Summary for home page listing)</label>
                <input
                  id="post-excerpt"
                  type="text"
                  className="admin-input"
                  placeholder="Write a brief, catchy summary..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label" htmlFor="post-content">Markdown Content</label>
                <textarea
                  id="post-content"
                  className="admin-textarea"
                  style={{ minHeight: '350px' }}
                  placeholder="Write article in markdown..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="submit" className="btn btn-primary" id="save-post-btn">
                  Publish Post
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm} id="cancel-edit-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Card */}
          <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '820px', overflowY: 'auto' }} id="post-editor-preview">
            <h3>Live Preview</h3>
            <div style={{ marginTop: '20px', flex: 1 }} className="blog-layout">
              <article>
                <header className="post-header" style={{ marginBottom: '24px', paddingBottom: '24px' }}>
                  <h1 className="post-title" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{title || 'Untitled Post'}</h1>
                  <div className="post-meta" style={{ fontSize: '0.85rem' }}>
                    <span className="blog-date">
                      Previewing Draft
                    </span>
                  </div>
                </header>
                <div style={{ padding: '0 8px' }}>
                  {content ? (
                    <MarkdownRenderer content={content} />
                  ) : (
                    <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Markdown preview will render here as you type...</p>
                  )}
                </div>
              </article>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      {!isCreating && !editingPost && (
        <div className="admin-card" id="posts-manager-table-card">
          <h3>Current Articles</h3>
          <div style={{ overflowX: 'auto', marginTop: '16px' }}>
            <table className="admin-posts-table" id="posts-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Published Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-light)', padding: '24px' }}>
                      No articles found in the database.
                    </td>
                  </tr>
                ) : (
                  posts.map(post => (
                    <tr key={post.id}>
                      <td style={{ fontWeight: 600 }}>{post.title}</td>
                      <td style={{ fontFamily: 'var(--mono-font)', fontSize: '0.85rem' }}>{post.slug}</td>
                      <td style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{new Date(post.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="admin-actions-cell">
                          <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(post)} title="Edit Article">
                            <Edit2 size={14} />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteClick(post.id, post.title)} title="Delete Article">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

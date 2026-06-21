import { useEffect, useRef, useState } from 'react';
import {
  Plus, Edit2, Trash2, LogOut, Lock, CheckCircle2,
  Bold, Italic, Heading2, Link2, Code, Code2, List, Quote
} from 'lucide-react';
import type { BlogPost, BlogPostInput } from 'shared';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { API_BASE } from '../config';

const DRAFT_KEY = 'admin_post_draft';
const EXCERPT_TARGET = 160;

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

  // Editor UX states
  const [slugTouched, setSlugTouched] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mobileView, setMobileView] = useState<'write' | 'preview'>('write');
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ---- Derived values -------------------------------------------------------
  const trimmedContent = content.trim();
  const wordCount = trimmedContent ? trimmedContent.split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const slugConflict =
    slug.trim() !== '' &&
    posts.some(p => p.slug.trim().toLowerCase() === slug.trim().toLowerCase() && p.id !== editingPost?.id);
  const invalid = {
    title: !title.trim(),
    slug: !slug.trim(),
    excerpt: !excerpt.trim(),
    content: !content.trim()
  };
  const isDirty = editingPost
    ? title !== editingPost.title || slug !== editingPost.slug ||
      excerpt !== editingPost.excerpt || content !== editingPost.content
    : isCreating && Boolean(title || slug || excerpt || content);

  // ---- Effects --------------------------------------------------------------
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

  // Autosave the new-post draft so work is never lost on refresh / navigation.
  useEffect(() => {
    if (isCreating && !editingPost) {
      if (title || slug || excerpt || content) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, slug, excerpt, content }));
      } else {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, [title, slug, excerpt, content, isCreating, editingPost]);

  // Warn before closing/refreshing the tab with unsaved changes.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // ---- Data -----------------------------------------------------------------
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
      if (!res.ok) throw new Error('Invalid master password');
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
    if (isDirty && !window.confirm('You have unsaved changes. Log out and discard them?')) return;
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

  // ---- Form lifecycle -------------------------------------------------------
  const resetForm = () => {
    setEditingPost(null);
    setIsCreating(false);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setSlugTouched(false);
    setTriedSubmit(false);
    setIsSaving(false);
    setMobileView('write');
    setErrorMsg('');
  };

  const clearDraft = () => localStorage.removeItem(DRAFT_KEY);

  const handleCreateNewClick = () => {
    resetForm();
    setSuccessMsg('');
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d && (d.title || d.slug || d.excerpt || d.content)) {
          setTitle(d.title || '');
          setSlug(d.slug || '');
          setExcerpt(d.excerpt || '');
          setContent(d.content || '');
          if (d.slug) setSlugTouched(true);
          setSuccessMsg('Restored your unsaved draft.');
        }
      } catch { /* ignore malformed draft */ }
    }
    setIsCreating(true);
  };

  const handleEditClick = (post: BlogPost) => {
    setEditingPost(post);
    setIsCreating(false);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setSlugTouched(true);
    setTriedSubmit(false);
    setMobileView('write');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm('Discard your unsaved changes?')) return;
    if (isCreating) clearDraft();
    resetForm();
  };

  // Auto-generate slug from title until the user edits the slug by hand.
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!editingPost && !slugTouched) {
      setSlug(
        newTitle
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
      );
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setSlugTouched(true);
  };

  // ---- Markdown editor helpers ---------------------------------------------
  const focusSelection = (from: number, to: number, scrollTop?: number) => {
    requestAnimationFrame(() => {
      const ta = contentRef.current;
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(from, to);
      // Restore the scroll position so inserting near the bottom doesn't jump
      // the editor back to the top.
      if (scrollTop !== undefined) ta.scrollTop = scrollTop;
    });
  };

  const insertAround = (before: string, after: string, placeholder: string) => {
    const ta = contentRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, scrollTop } = ta;
    const selected = content.slice(s, e) || placeholder;
    setContent(content.slice(0, s) + before + selected + after + content.slice(e));
    focusSelection(s + before.length, s + before.length + selected.length, scrollTop);
  };

  const toggleLinePrefix = (prefix: string) => {
    const ta = contentRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, scrollTop } = ta;
    const lineStart = content.lastIndexOf('\n', s - 1) + 1;
    const nl = content.indexOf('\n', e);
    const lineEnd = nl === -1 ? content.length : nl;
    const lines = content.slice(lineStart, lineEnd).split('\n');
    const allOn = lines.every(l => l.startsWith(prefix));
    const block = lines.map(l => (allOn ? l.slice(prefix.length) : prefix + l)).join('\n');
    setContent(content.slice(0, lineStart) + block + content.slice(lineEnd));
    focusSelection(lineStart, lineStart + block.length, scrollTop);
  };

  const insertCodeBlock = () => {
    const ta = contentRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, scrollTop } = ta;
    const selected = content.slice(s, e) || 'code';
    const before = content.slice(0, s);
    const lead = before && !before.endsWith('\n') ? '\n' : '';
    setContent(before + lead + '```\n' + selected + '\n```' + content.slice(e));
    const from = s + lead.length + 4; // past the ```\n
    focusSelection(from, from + selected.length, scrollTop);
  };

  const tools = [
    { icon: <Bold size={15} />, title: 'Bold (Ctrl/Cmd+B)', run: () => insertAround('**', '**', 'bold text') },
    { icon: <Italic size={15} />, title: 'Italic (Ctrl/Cmd+I)', run: () => insertAround('*', '*', 'italic text') },
    { icon: <Heading2 size={15} />, title: 'Heading', run: () => toggleLinePrefix('## ') },
    { icon: <Link2 size={15} />, title: 'Link (Ctrl/Cmd+K)', run: () => insertAround('[', '](https://)', 'link text') },
    { icon: <Code size={15} />, title: 'Inline code', run: () => insertAround('`', '`', 'code') },
    { icon: <Code2 size={15} />, title: 'Code block', run: insertCodeBlock },
    { icon: <List size={15} />, title: 'Bullet list', run: () => toggleLinePrefix('- ') },
    { icon: <Quote size={15} />, title: 'Quote', run: () => toggleLinePrefix('> ') }
  ];

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const mod = e.metaKey || e.ctrlKey;
    const key = e.key.toLowerCase();
    if (mod && key === 'b') { e.preventDefault(); insertAround('**', '**', 'bold text'); return; }
    if (mod && key === 'i') { e.preventDefault(); insertAround('*', '*', 'italic text'); return; }
    if (mod && key === 'k') { e.preventDefault(); insertAround('[', '](https://)', 'link text'); return; }
    if (mod && key === 's') { e.preventDefault(); handleSubmit(); return; }
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = contentRef.current;
      if (!ta) return;
      const { selectionStart: s, selectionEnd: en, scrollTop } = ta;
      if (content.slice(s, en).includes('\n')) {
        const lineStart = content.lastIndexOf('\n', s - 1) + 1;
        const indented = content.slice(lineStart, en).split('\n').map(l => '  ' + l).join('\n');
        setContent(content.slice(0, lineStart) + indented + content.slice(en));
        focusSelection(lineStart, lineStart + indented.length, scrollTop);
      } else {
        setContent(content.slice(0, s) + '  ' + content.slice(en));
        focusSelection(s + 2, s + 2, scrollTop);
      }
    }
  };

  // ---- Save / delete --------------------------------------------------------
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSaving) return;
    setErrorMsg('');
    setSuccessMsg('');
    setTriedSubmit(true);

    if (invalid.title || invalid.slug || invalid.excerpt || invalid.content) {
      setErrorMsg('Please fill in all fields before publishing.');
      return;
    }
    if (slugConflict) {
      setErrorMsg('That slug is already used by another post — choose a unique one.');
      return;
    }

    setIsSaving(true);
    const postInput: BlogPostInput = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content
    };

    try {
      const url = editingPost ? `${API_BASE}/posts/${editingPost.id}` : `${API_BASE}/posts`;
      const method = editingPost ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(postInput)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save post');
      }
      setSuccessMsg(editingPost ? 'Post updated successfully' : 'Post published successfully');
      clearDraft();
      resetForm();
      loadAdminPosts();
    } catch (err: any) {
      setErrorMsg(err.message || 'Save operation failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = async (id: string, postTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${postTitle}"?`)) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE}/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete post');
      setSuccessMsg('Post deleted successfully');
      loadAdminPosts();
    } catch (err: any) {
      setErrorMsg(err.message || 'Delete operation failed');
    }
  };

  // ---- Render ---------------------------------------------------------------
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
        <>
          <div className="editor-view-toggle" role="tablist">
            <button type="button" className={mobileView === 'write' ? 'active' : ''} onClick={() => setMobileView('write')}>Write</button>
            <button type="button" className={mobileView === 'preview' ? 'active' : ''} onClick={() => setMobileView('preview')}>Preview</button>
          </div>

          <div className={`admin-editor-grid view-${mobileView}`} style={{ marginBottom: '40px' }}>
            {/* Editor Form Card */}
            <div className="admin-card" id="post-editor-form">
              <h3>{editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}</h3>
              <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                <div className="admin-form-group">
                  <label className="admin-label" htmlFor="post-title">Article Title</label>
                  <input
                    id="post-title"
                    type="text"
                    className={`admin-input${triedSubmit && invalid.title ? ' invalid' : ''}`}
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
                    className={`admin-input${(triedSubmit && invalid.slug) || slugConflict ? ' invalid' : ''}`}
                    placeholder="e.g. scaling-etl-workflows-on-gcp"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                  />
                  {slugConflict && <div className="editor-warning">This slug is already used by another post.</div>}
                </div>

                <div className="admin-form-group">
                  <label className="admin-label" htmlFor="post-excerpt">Short Excerpt (Summary for home page listing)</label>
                  <textarea
                    id="post-excerpt"
                    className={`admin-input${triedSubmit && invalid.excerpt ? ' invalid' : ''}`}
                    style={{ minHeight: '60px', resize: 'vertical' }}
                    placeholder="Write a brief, catchy summary..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                  />
                  <div className="editor-meta">
                    <span>Used as the listing/SEO summary.</span>
                    <span className={excerpt.length > EXCERPT_TARGET ? 'over' : ''}>{excerpt.length} / {EXCERPT_TARGET}</span>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-label" htmlFor="post-content">Markdown Content</label>
                  <div className="editor-toolbar">
                    {tools.map((t, i) => (
                      <button
                        type="button"
                        key={i}
                        title={t.title}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={t.run}
                        tabIndex={-1}
                      >
                        {t.icon}
                      </button>
                    ))}
                  </div>
                  <textarea
                    id="post-content"
                    ref={contentRef}
                    className={`admin-textarea editor-mono${triedSubmit && invalid.content ? ' invalid' : ''}`}
                    style={{ minHeight: '350px' }}
                    placeholder="Write your article in Markdown… (Ctrl/Cmd+B bold, +I italic, +K link, Tab to indent, Ctrl/Cmd+S to save)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleEditorKeyDown}
                  />
                  <div className="editor-meta">
                    <span>{wordCount} words · ~{readingTime} min read</span>
                    <span>Markdown supported</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                  <button type="submit" className="btn btn-primary" id="save-post-btn" disabled={isSaving}>
                    {isSaving ? 'Saving…' : editingPost ? 'Update Post' : 'Publish Post'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleCancel} id="cancel-edit-btn" disabled={isSaving}>
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
                      <span className="blog-date">Previewing Draft · ~{readingTime} min read</span>
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
        </>
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

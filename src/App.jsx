import React, { useState, useEffect } from 'react';
import { api } from './api';
import AuthModal from './AuthModal';
import {
  Bookmark,
  ExternalLink,
  Plus,
  Trash2,
  LogOut,
  LogIn,
  Search,
  Lock,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Check existing login session
    api.getMe().then((user) => {
      if (user) {
        setCurrentUser(user);
        loadLinks();
      }
    });
  }, []);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const userLinks = await api.getLinks();
      setLinks(userLinks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    loadLinks();
  };

  const handleSignOut = async () => {
    await api.signOut();
    setCurrentUser(null);
    setLinks([]);
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthOpen(true);
      return;
    }

    if (!url) return;
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const newLinkTitle = title.trim() || new URL(formattedUrl).hostname;

    setSubmitting(true);
    setErrorMsg('');
    try {
      const saved = await api.createLink({
        title: newLinkTitle,
        url: formattedUrl,
        category: category || 'General',
        description: description.trim()
      });
      setLinks([saved, ...links]);
      setTitle('');
      setUrl('');
      setDescription('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save link');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this link?')) return;
    try {
      await api.deleteLink(id);
      setLinks(links.filter((l) => l.id !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = ['All', ...new Set(links.map((item) => item.category || 'General'))];

  const filteredLinks = links.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Bookmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                LinkVault
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 font-medium">
                Live & Isolated
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 hidden sm:inline-block font-mono">
                  {currentUser.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition shadow-md shadow-indigo-600/30"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In / Sign Up</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Intro Banner */}
        <div className="mb-8 text-center sm:text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              Save Links <span className="text-indigo-400">Permanently</span>.
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl">
              Store links with full lifetime persistence. Protected by user authentication so <strong className="text-slate-200">nobody else can ever delete or view your links</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 bg-indigo-950/40 border border-indigo-900/60 rounded-xl text-xs text-indigo-300 self-start">
            <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <span>Strict User Isolation Enabled</span>
          </div>
        </div>

        {/* Add Link Form */}
        <div className="mb-10 bg-slate-900 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-400" />
            Save a New Link
          </h2>

          {errorMsg && (
            <div className="mb-4 p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAddLink} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">URL (Required)</label>
                <input
                  type="text"
                  required
                  placeholder="https://github.com/my-project"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. My Important Repository"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Category / Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Work, Tools, Research, Personal"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Notes / Description</label>
                <input
                  type="text"
                  placeholder="Important reference notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition duration-150"
              >
                {submitting ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Save To Vault
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Filter & Search Bar */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search in your links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Link List Grid */}
        {!currentUser ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <Lock className="w-12 h-12 mx-auto text-indigo-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Authentication Required</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-5">
              Please sign up or log in to view and save your private links securely. Nobody else can view or delete your links.
            </p>
            <button
              onClick={() => setAuthOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition"
            >
              <LogIn className="w-4 h-4" />
              Log In or Create Account
            </button>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
            <Bookmark className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="text-slate-400 font-medium">No saved links yet</p>
            <p className="text-slate-500 text-xs mt-1">
              Add your first link using the form above to keep it saved permanently!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLinks.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col justify-between bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 p-5 rounded-2xl shadow-sm hover:shadow-md hover:shadow-indigo-950/30 transition duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-400 border border-indigo-900/50">
                      {item.category || 'General'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-semibold text-white text-base leading-snug line-clamp-1 mb-1">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/60 mt-3 flex items-center justify-between gap-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium truncate"
                  >
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{item.url}</span>
                  </a>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      title="Copy URL"
                      onClick={() => copyToClipboard(item.url, item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      title="Delete link (Only you can delete this)"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        LinkVault &copy; 2026. Permanent Link Saver with strictly protected user accounts.
      </footer>

      {/* Auth Modal */}
      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}

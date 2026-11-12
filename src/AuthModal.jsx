import React, { useState } from 'react';
import { api } from './api';
import { LogIn, UserPlus, Bookmark, AlertCircle } from 'lucide-react';

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      let user;
      if (isSignUp) {
        user = await api.signUp(email, password);
      } else {
        user = await api.signIn(email, password);
      }
      onAuthSuccess?.(user);
      onClose?.();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-6 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-indigo-600/20 text-indigo-400 rounded-xl">
          <Bookmark className="w-6 h-6" />
        </div>

        <h2 className="text-2xl font-bold text-center text-white mb-2">
          {isSignUp ? 'Create Your Account' : 'Welcome to LinkVault'}
        </h2>
        <p className="text-sm text-center text-slate-400 mb-6">
          {isSignUp
            ? 'Sign up for a lifetime account. Only you can access or delete your links.'
            : 'Sign in to access and manage your private link collection.'}
        </p>

        {errorMsg && (
          <div className="flex items-start gap-2 p-3 mb-4 text-sm text-rose-300 bg-rose-950/40 border border-rose-800 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors shadow-lg shadow-indigo-600/30 text-sm"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" />
                Sign Up & Log In
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-700/60 text-center flex items-center justify-between">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>

          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await authClient.signIn.email({ email, password });
    if (result.error) {
      setError(result.error.message ?? 'Login failed');
      setLoading(false);
    } else {
      window.location.href = '/dashboard';
    }
  };

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({ provider: 'google' });
  };

  const handleGithubLogin = async () => {
    await authClient.signIn.social({ provider: 'github' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">OpenMoney</h1>
          <p className="mt-2 text-[var(--text-secondary)]">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-[var(--bg-secondary)] border border-gray-300 dark:border-gray-600 rounded-lg text-[var(--text-primary)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)]">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-[var(--bg-secondary)] border border-gray-300 dark:border-gray-600 rounded-lg text-[var(--text-primary)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[var(--bg-primary)] text-[var(--text-secondary)]">or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleGoogleLogin}
            className="py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Google
          </button>
          <button
            onClick={handleGithubLogin}
            className="py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            GitHub
          </button>
        </div>

        <p className="text-center text-sm text-[var(--text-secondary)]">
          Don&apos;t have an account?{' '}
          <a href="/auth/register" className="text-primary-600 hover:text-primary-500 font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';

interface AuthFormProps {
  isLogin?: boolean;
}

export default function AuthForm({ isLogin }: AuthFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const body = isLogin ? { email, password } : { username, email, password };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(isLogin ? 'Logged in successfully!' : 'Signed up successfully!');
      router.push('/');
    } else {
      const error = await res.json();
      toast.error(error.error || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070A12] text-white overflow-hidden">
      {/* Background / Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(900px circle at 20% 20%, rgba(99,102,241,0.20), transparent 40%), radial-gradient(700px circle at 80% 30%, rgba(16,185,255,0.16), transparent 45%), radial-gradient(900px circle at 50% 90%, rgba(236,72,153,0.10), transparent 55%)',
        }}
      />
      <div className="absolute inset-0 -z-10 opacity-[0.08] bg-[url('/grid.svg')] bg-center bg-repeat" />
      <Toaster />

      <div className="px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="min-h-screen flex items-center justify-center py-8 sm:py-10 md:py-14">
          <div className="w-full max-w-md px-2 sm:px-0">
            {/* Glass card */}
            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.55)] overflow-hidden">
              {/* top gradient bar */}
              <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-fuchsia-500" />

              <div className="p-5 sm:p-6 md:p-8">
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* --- UPDATED ICON CONTAINER --- */}
                  <div className="mt-0.5 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/25 to-cyan-400/20 border border-white/10 p-2">
                    {/* Standard User Profile SVG */}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="w-full h-full text-white/90"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 4C13.6569 4 15 5.34315 15 7C15 8.65685 13.6569 10 12 10C10.3431 10 9 8.65685 9 7C9 5.34315 10.3431 4 12 4ZM7 7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7C17 9.76142 14.7614 12 12 12C9.23858 12 7 9.76142 7 7Z"
                        fill="currentColor"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 14C15.866 14 19 17.134 19 21H21C21 16.0294 16.9706 12 12 12C7.02944 12 3 16.0294 3 21H5C5 17.134 8.13401 14 12 14Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  {/* --- END UPDATED ICON CONTAINER --- */}

                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                      {isLogin ? 'Welcome back' : 'Create your account'}
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-white/70">
                      {isLogin
                        ? ''
                        : ''}
                    </p>
                  </div>
                </div>

                <div className="mt-7">
                  <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                    {!isLogin && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white/85">
                          Username
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-3 sm:px-4 py-2.5 sm:py-3 outline-none transition
                                     placeholder:text-white/40
                                     focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400/40"
                          placeholder="Your name"
                          autoComplete="username"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/85">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-3 sm:px-4 py-2.5 sm:py-3 outline-none transition
                                   placeholder:text-white/40
                                   focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400/40"
                        placeholder="you@example.com"
                        autoComplete={isLogin ? 'email' : 'email'}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/85">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 outline-none transition
                                     placeholder:text-white/40
                                     focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400/40"
                          placeholder="••••••••"
                          autoComplete={isLogin ? 'current-password' : 'new-password'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {!isLogin && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white/85">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 outline-none transition
                                       placeholder:text-white/40
                                       focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400/40"
                            placeholder="••••••••"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                          >
                            {showConfirmPassword ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="group w-full rounded-xl py-3.5 font-semibold text-white
                                 bg-gradient-to-r from-indigo-600 to-cyan-500
                                 hover:from-indigo-500 hover:to-cyan-400
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:ring-offset-2 focus:ring-offset-[#070A12]
                                 transition-all duration-200
                                 shadow-[0_10px_30px_rgba(79,70,229,0.25)]"
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        {isLogin ? 'Login' : 'Sign Up'}
                        <span
                          aria-hidden="true"
                          className="h-5 w-5 rounded-full bg-white/15 border border-white/15
                                     group-hover:bg-white/20 transition"
                        >
                          →
                        </span>
                      </span>
                    </button>
                  </form>

                  <div className="mt-5 text-sm text-center">
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <a
                      href={isLogin ? '/signup' : '/login'}
                      className="font-semibold text-indigo-300 hover:text-indigo-200 transition"
                    >
                      {isLogin ? 'Sign up' : 'Login'}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Tiny responsive helper space */}
            <p className="mt-4 text-center text-xs text-white/50">

            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
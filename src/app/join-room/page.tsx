'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';

export default function JoinRoom() {
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [roomType, setRoomType] = useState<'quiz' | 'guess-it' | 'the-100' | 'type-it'>('quiz');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomId || !password) {
      toast.error('Room ID and password are required');
      return;
    }

    const apiPath = roomType === 'quiz' ? '/api/quiz-room/join' : roomType === 'guess-it' ? '/api/guess-it-room/join' : roomType === 'the-100' ? '/api/the-100/join' : '/api/type-it-room/join';
    const redirectBase = roomType === 'quiz' ? '/quiz-room' : roomType === 'guess-it' ? '/guess-it-room' : roomType === 'the-100' ? '/the-100' : '/type-it-room';

    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, password, role }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('userRole', data.role);
        toast.success('Joined successfully!');
        router.push(`${redirectBase}/${roomId}/leaderboard`);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to join room.');
      }
    } catch (error) {
      console.error('An error occurred while joining the room:', error);
      toast.error('An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] text-gray-100 flex items-center justify-center p-4 sm:p-8 font-sans overflow-hidden relative">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <Toaster position="bottom-center" />

      <div className="w-full max-w-md z-10">
        <div className="bg-[#12121b] border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30">
          
          {/* Header */}
          <div className="px-8 pt-8 pb-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/30">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Join Room
                </h1>
                <p className="text-gray-500 text-sm mt-1">Enter room credentials to enter</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
            {/* Room Type Toggle */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Room Type</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 p-1 bg-[#0a0a0f] rounded-xl border border-gray-700/50">
                <button
                  type="button"
                  onClick={() => setRoomType('quiz')}
                  className={`py-2 px-1 sm:px-4 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    roomType === 'quiz' 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Quiz
                </button>
                <button
                  type="button"
                  onClick={() => setRoomType('guess-it')}
                  className={`py-2 px-1 sm:px-4 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    roomType === 'guess-it' 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Guess-It
                </button>
                <button
                  type="button"
                  onClick={() => setRoomType('the-100')}
                  className={`py-2 px-1 sm:px-4 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    roomType === 'the-100' 
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  The-100
                </button>
                <button
                  type="button"
                  onClick={() => setRoomType('type-it')}
                  className={`py-2 px-1 sm:px-4 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    roomType === 'type-it' 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  TypeIt
                </button>
              </div>
            </div>

            {/* Room ID */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-400">Room ID</label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
                className="w-full bg-[#0a0a0f] text-gray-200 border border-gray-700/50 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-gray-600"
                placeholder="Enter Room ID"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-400">Room Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#0a0a0f] text-gray-200 border border-gray-700/50 rounded-xl py-2.5 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-gray-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
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

            {/* Role */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-400">Join As</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#0a0a0f] text-gray-200 border border-gray-700/50 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none transition-all cursor-pointer"
                >
                  <option value="user">User / Player</option>
                  <option value="moderator">Moderator</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full group relative inline-flex items-center justify-center px-6 py-3.5 font-bold text-white transition-all duration-200 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 mt-4"
            >
              <span className="flex items-center gap-2">
                Enter Room
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-gray-600 uppercase tracking-widest">
          Powered by Guess-It Engine
        </p>
      </div>
    </div>
  );
}
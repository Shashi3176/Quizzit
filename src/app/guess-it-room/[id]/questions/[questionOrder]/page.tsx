'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';

interface LeaderboardEntry {
  username: string;
  score: number;
  isCurrentUser?: boolean;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const { id: roomId } = params;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`/api/quiz-room/${roomId}/leaderboard`);
        if (!res.ok) throw new Error('Failed to fetch rankings');
        const data = await res.json();
        setLeaderboard(data);
      } catch (err) {
        toast.error("Couldn't load rankings");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [roomId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500/30 relative overflow-hidden py-12 px-4">
      <Toaster toastOptions={{ style: { background: '#12121b', color: '#fff', border: '1px solid rgba(139, 92, 246, 0.2)' } }} />

      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            <span className="text-xs text-purple-300 font-bold uppercase tracking-widest">Live Rankings</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-purple-200 to-gray-500 bg-clip-text text-transparent">
            Leaderboard
          </h1>
        </div>

        <div className="bg-[#12121b]/80 border border-gray-800/50 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
          {leaderboard.length > 0 ? (
            <div className="divide-y divide-gray-800/50">
              {leaderboard.map((player, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-6 transition-all duration-300 ${
                    player.isCurrentUser ? 'bg-purple-500/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                      index === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' :
                      index === 1 ? 'bg-gray-300 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className={`text-xl font-bold ${player.isCurrentUser ? 'text-purple-400' : 'text-gray-200'}`}>
                        {player.username}
                        {player.isCurrentUser && <span className="ml-2 text-xs bg-purple-500/20 px-2 py-0.5 rounded text-purple-300">YOU</span>}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-mono font-black text-white">{player.score.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Total Points</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-20 text-center text-gray-500">
              No scores recorded yet.
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push(`/quiz-room/${roomId}`)}
            className="group relative px-8 py-4 font-bold text-white bg-[#12121b] border border-gray-800 rounded-xl hover:border-purple-500/50 transition-all duration-300"
          >
            Back to Room
          </button>
          <button
            onClick={() => window.location.reload()}
            className="group relative px-8 py-4 font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-purple-500/25"
          >
            Refresh Scores
          </button>
        </div>
      </div>
    </div>
  );
}
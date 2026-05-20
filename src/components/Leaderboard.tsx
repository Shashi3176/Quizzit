'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Participant {
  id: number;
  name: string;
  score: number;
  rank: number | null;
}

export default function Leaderboard() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (id) {
      const fetchLeaderboard = () => {
        fetch(`/api/quiz-room/${id}/leaderboard`)
          .then((res) => res.json())
          .then((data) => {
            setParticipants(data);
          });
      };

      fetchLeaderboard(); // Initial fetch
      const interval = setInterval(fetchLeaderboard, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [id]);

  return (
    <div className="relative">
      {/* Background / glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
        <div className="absolute -top-24 left-1/2 h-64 w-[38rem] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="absolute -right-20 top-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              Leaderboard
            </h2>
            <p className="text-xs sm:text-sm text-white/70 mt-1">
              Live updates every 5 seconds
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              Updating
            </span>
          </div>
        </header>

        {/* List */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-black/10">
          <ul className="divide-y divide-white/10">
            {/* Empty state */}
            {participants.length === 0 ? (
              <li className="p-6 text-center text-white/70">
                <div className="mx-auto max-w-md">
                  <div className="text-sm sm:text-base font-semibold text-white/80">
                    No participants yet
                  </div>
                  <div className="mt-2 text-xs sm:text-sm">
                    Waiting for scores to load...
                  </div>
                </div>
              </li>
            ) : (
              participants.map((participant, idx) => {
                const rank = participant.rank ?? idx + 1;

                return (
                  <li
                    key={participant.id}
                    className="group relative"
                  >
                    {/* Row background highlight on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/0 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative flex items-center justify-between gap-4 px-4 sm:px-6 py-4">
                      {/* Left: Rank + Name */}
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Rank badge */}
                        <div
                          className={[
                            'shrink-0 grid place-items-center rounded-xl border px-3 py-2',
                            rank === 1
                              ? 'border-amber-400/30 bg-amber-500/10 text-amber-200 shadow-[0_0_0_1px_rgba(251,191,36,0.25)]'
                              : rank === 2
                              ? 'border-sky-400/30 bg-sky-500/10 text-sky-200'
                              : rank === 3
                              ? 'border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200'
                              : 'border-white/10 bg-white/5 text-white/80',
                          ].join(' ')}
                        >
                          <div className="text-[10px] sm:text-xs font-bold opacity-80">RANK</div>
                          <div className="text-base sm:text-lg font-extrabold leading-none">
                            #{rank}
                          </div>
                        </div>

                        {/* Name */}
                        <div className="min-w-0">
                          <div className="text-sm sm:text-base font-semibold text-white truncate">
                            {participant.name}
                          </div>
                          <div className="text-[11px] sm:text-xs text-white/60">
                            Participant ID: {participant.id}
                          </div>
                        </div>
                      </div>

                      {/* Right: Score */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-[10px] sm:text-xs text-white/60 font-semibold">
                            SCORE
                          </div>
                          <div className="text-xl sm:text-2xl font-extrabold tabular-nums text-yellow-300 drop-shadow-sm">
                            {participant.score}
                          </div>
                        </div>

                        {/* Score ring */}
                        <div className="hidden sm:block">
                          <div className="h-10 w-10 rounded-full border border-yellow-300/20 bg-yellow-300/10 grid place-items-center">
                            <span className="text-yellow-200 font-bold text-sm">★</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* Footer note */}
        <div className="mt-4 text-[11px] sm:text-xs text-white/50">
          Tip: Top ranks are highlighted automatically.
        </div>
      </section>
    </div>
  );
}

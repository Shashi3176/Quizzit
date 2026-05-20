'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface QuizAnalyticsData {
  answerDistribution: { [key: string]: number };
  averageResponseTime: number;
  participantCount: number;
  answeredCount: number;
  pendingCount: number;
}

export default function QuizAnalytics() {
  const [analytics, setAnalytics] = useState<QuizAnalyticsData | null>(null);
  const params = useParams();
  const { id, questionId } = params;

  useEffect(() => {
    if (id && questionId) {
      const fetchAnalytics = () => {
        fetch(`/api/quiz-room/${id}/questions/${questionId}/analytics`)
          .then((res) => res.json())
          .then((data) => {
            setAnalytics(data);
          });
      };

      fetchAnalytics(); // Initial fetch
      const interval = setInterval(fetchAnalytics, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [id, questionId]);

  if (!analytics) {
    return (
      <div className="min-h-[240px] w-full flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_10px_30px_rgba(0,0,0,0.35)] overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="h-6 w-44 rounded-lg bg-white/10 animate-pulse" />
                  <div className="mt-3 h-4 w-64 rounded-lg bg-white/10 animate-pulse" />
                </div>
                <div className="h-10 w-10 rounded-xl bg-white/10 animate-pulse" />
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
                  <div className="mt-3 h-6 w-24 bg-white/10 rounded animate-pulse" />
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
                  <div className="mt-3 h-6 w-24 bg-white/10 rounded animate-pulse" />
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
                  <div className="mt-3 h-6 w-24 bg-white/10 rounded animate-pulse" />
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="h-4 w-44 bg-white/10 rounded animate-pulse" />
                <div className="mt-4 space-y-2">
                  <div className="h-9 rounded-lg bg-white/5 border border-white/10 animate-pulse" />
                  <div className="h-9 rounded-lg bg-white/5 border border-white/10 animate-pulse" />
                  <div className="h-9 rounded-lg bg-white/5 border border-white/10 animate-pulse" />
                  <div className="h-9 rounded-lg bg-white/5 border border-white/10 animate-pulse" />
                </div>
              </div>

              <div className="mt-4 h-2 w-56 rounded-full bg-white/10 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[240px] w-full px-4 py-6 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Modern card container */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] via-white/[0.03] to-transparent shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          {/* subtle glow */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -right-28 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl" />

          <div className="relative p-5 sm:p-7 lg:p-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Quiz Analytics
                </h2>
                <p className="mt-2 text-sm sm:text-[15px] text-white/70">
                  Live updates every 5 seconds • Real-time participation and response insights
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
                  <div className="text-[12px] text-white/60">Participants</div>
                  <div className="text-lg font-bold">
                    {analytics.participantCount}
                  </div>
                </div>
                <div className="hidden sm:block rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
                  <div className="text-[12px] text-white/60">Avg Response</div>
                  <div className="text-lg font-bold">
                    {analytics.averageResponseTime.toFixed(2)}s
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Row */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white/80">Answered</h3>
                    <div className="mt-2 text-3xl font-extrabold">
                      {analytics.answeredCount}
                    </div>
                    <p className="mt-1 text-xs text-white/60">
                      Responses received
                    </p>
                  </div>
                  <div className="h-11 w-11 rounded-2xl border border-white/10 bg-emerald-400/10 flex items-center justify-center">
                    <span className="text-emerald-200 font-bold">✓</span>
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                  {analytics.participantCount > 0 ? (
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                      style={{
                        width: `${
                          (analytics.answeredCount / analytics.participantCount) * 100
                        }%`,
                      }}
                    />
                  ) : null}
                </div>
              </div>

              <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white/80">Pending</h3>
                    <div className="mt-2 text-3xl font-extrabold">
                      {analytics.pendingCount}
                    </div>
                    <p className="mt-1 text-xs text-white/60">
                      Waiting to answer
                    </p>
                  </div>
                  <div className="h-11 w-11 rounded-2xl border border-white/10 bg-amber-400/10 flex items-center justify-center">
                    <span className="text-amber-200 font-bold">…</span>
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                  {analytics.participantCount > 0 ? (
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-400"
                      style={{
                        width: `${
                          (analytics.pendingCount / analytics.participantCount) * 100
                        }%`,
                      }}
                    />
                  ) : null}
                </div>
              </div>

              <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white/80">Response Time</h3>
                    <div className="mt-2 text-3xl font-extrabold">
                      {analytics.averageResponseTime.toFixed(2)}s
                    </div>
                    <p className="mt-1 text-xs text-white/60">
                      Average across answers
                    </p>
                  </div>
                  <div className="h-11 w-11 rounded-2xl border border-white/10 bg-indigo-400/10 flex items-center justify-center">
                    <span className="text-indigo-200 font-bold">⏱</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-300 w-[65%]" />
                  </div>
                  <div className="text-xs text-white/60">Live</div>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Answer Distribution */}
              <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">Answer Distribution</h3>
                    <p className="mt-1 text-sm text-white/60">
                      Counts per option (updates in real time)
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                    <div className="text-[12px] text-white/60">Total Answered</div>
                    <div className="text-sm font-bold">
                      {analytics.answeredCount}
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {Object.entries(analytics.answerDistribution).map(([option, count], idx) => {
                    const total = analytics.answeredCount || 0;
                    const pct = total > 0 ? (count / total) * 100 : 0;

                    const palette = [
                      'from-cyan-400 to-sky-400',
                      'from-emerald-400 to-teal-400',
                      'from-fuchsia-400 to-pink-400',
                      'from-amber-400 to-yellow-300',
                      'from-indigo-400 to-violet-400',
                    ];
                    const grad = palette[idx % palette.length];

                    return (
                      <div
                        key={option}
                        className="rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.05]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold text-white/90 truncate">
                              {option}
                            </div>
                            <div className="mt-1 text-xs text-white/60">
                              {count} answer{count === 1 ? '' : 's'}
                              {total > 0 ? ` • ${pct.toFixed(0)}%` : ''}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold">{count}</div>
                            <div className="text-[12px] text-white/60">votes</div>
                          </div>
                        </div>

                        <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${grad}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Side Panel */}
              <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
                <h3 className="text-lg font-bold">Quick Summary</h3>
                <p className="mt-1 text-sm text-white/60">
                  Everything at a glance
                </p>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <div className="text-sm text-white/70">Total Participants</div>
                    <div className="text-lg font-bold">{analytics.participantCount}</div>
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <div className="text-sm text-white/70">Answered</div>
                    <div className="text-lg font-bold text-emerald-200">
                      {analytics.answeredCount}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <div className="text-sm text-white/70">Pending</div>
                    <div className="text-lg font-bold text-amber-200">
                      {analytics.pendingCount}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm text-white/70">Average Response Time</div>
                        <div className="mt-1 text-xl font-extrabold">
                          {analytics.averageResponseTime.toFixed(2)}s
                        </div>
                      </div>
                      <div className="h-11 w-11 rounded-2xl border border-white/10 bg-indigo-400/10 flex items-center justify-center">
                        <span className="text-indigo-200 font-bold">⏱</span>
                      </div>
                    </div>

                    <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-300 w-[72%]" />
                    </div>
                    <div className="mt-2 text-xs text-white/60">
                      Faster responses often indicate clearer questions
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-xs text-white/55">
                  Tip: Keep this page open to observe distribution changes live.
                </div>
              </div>
            </div>

            {/* Footer line */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-white/55">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.6)]" />
                Live polling enabled
              </div>
              <div>
                Poll interval: <span className="text-white/70">5000ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

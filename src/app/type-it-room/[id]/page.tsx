'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';

interface Question {
  id: number;
  text: string;
  order: number;
  correctAnswers: string[];
  points: number;
  timeLimit: number;
}

interface Participant {
  id: number;
  name: string;
}

interface TypeItRoom {
  id: number;
  ownerId: number;
  isLocked: boolean;
  currentQuestion: number;
  questions: Question[];
  participants: Participant[];
}

export default function TypeItRoomPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const { data: typeItRoom, isLoading } = useSWR(roomId ? `/api/type-it-room/${roomId}` : null, async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch type-it room');
    return res.json();
  });

  useEffect(() => {
    const verifyUser = async () => {
      if (!typeItRoom) return;
      try {
        const res = await fetch('/api/auth/verifyToken');
        if (res.ok) {
          const { data: user } = await res.json();
          if (user.userId === typeItRoom.ownerId) {
            setUserRole('host');
            localStorage.setItem('userRole', 'host');
          } else {
            const role = localStorage.getItem('userRole');
            setUserRole(role);
          }
        } else {
            const role = localStorage.getItem('userRole');
            setUserRole(role);
        }
      } catch (error) {
        console.error("Failed to verify token", error);
        const role = localStorage.getItem('userRole');
        setUserRole(role);
      }
    };

    verifyUser();
  }, [typeItRoom]);

  const handleStartQuiz = async () => {
    try {
        const res = await fetch(`/api/type-it-room/${roomId}/lock`, { method: 'PUT' });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to start type-it room');
        }
        router.push(`/type-it-room/${roomId}/start-quiz`);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not start type-it room');
    }
  };

  const handleNextQuestion = async () => {
    try {
        const res = await fetch(`/api/type-it-room/${roomId}/next-question`, { method: 'POST' });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to advance to next question');
        }
        mutate(`/api/type-it-room/${roomId}`);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not proceed to next question');
    }
  };

  const handlePlayClick = () => {
    router.push(`/type-it-room/${roomId}/play`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin"></div>
          </div>
          <p className="text-gray-400 text-sm font-medium animate-pulse">Loading type-it room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="bg-[#12121b] border border-red-500/30 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl shadow-red-500/10">
          <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Room</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  if (!typeItRoom) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="bg-[#12121b] border border-gray-700/50 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">TypeIt Room Not Found</h3>
          <p className="text-gray-400 text-sm">The requested type-it room doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const isHost = userRole === 'host';
  const isParticipant = userRole === 'user';
  const isQuizActive = typeItRoom.currentQuestion > 0;
  const isQuizFinished = typeItRoom.currentQuestion >= (typeItRoom.questions?.length || 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="pb-4 border-b border-gray-800/50">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            TypeIt Room
          </h1>
          <div className="mt-4 inline-flex items-center gap-2 bg-[#12121b] px-4 py-2 rounded-xl border border-gray-700/50 shadow-sm">
            <span className={`w-2 h-2 rounded-full ${typeItRoom.isLocked ? 'bg-red-500' : 'bg-green-500'}`}></span>
            <span className="text-gray-300 text-sm font-medium">
              {typeItRoom.isLocked ? 'Locked' : 'Open For Editing'}
            </span>
          </div>
        </header>

        {/* Host controls */}
        {isHost && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => router.push(`/type-it-room/${roomId}/manage-questions`)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
                disabled={typeItRoom.isLocked}
              >
                Manage Questions
              </button>
              <button
                onClick={() => router.push(`/type-it-room/${roomId}/leaderboard`)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-700 text-white font-bold hover:shadow-lg hover:shadow-yellow-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Leaderboard
              </button>
            </div>
            {typeItRoom.isLocked ? (
              <button
                onClick={() => router.push(`/type-it-room/${roomId}/start-quiz`)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
                disabled={isQuizFinished}
              >
                Start Quiz
              </button>
            ) : !isQuizActive ? (
              <button
                onClick={handleStartQuiz}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
                disabled={isQuizFinished}
              >
                Start Quiz
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
                disabled={isQuizFinished}
              >
                Next Question
              </button>
            )}
          </div>
        )}

        {/* Participant controls */}
        {isParticipant && isQuizActive && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push(`/type-it-room/${roomId}/leaderboard`)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Play!
            </button>
          </div>
        )}

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Questions */}
          <main className="lg:col-span-2">
            <div className="bg-[#12121b] border border-[#1e1e29] rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-200">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Questions
              </h2>

              {typeItRoom.questions?.length > 0 ? (
                <ul className="space-y-4">
                  {typeItRoom.questions.map((question: Question) => (
                    <li
                      key={question.id}
                      className={`relative p-5 rounded-xl bg-[#1a1a24] border transition-all duration-200 hover:border-emerald-500/40 hover:shadow-md ${
                        typeItRoom.currentQuestion === question.order ? 'ring-2 ring-emerald-500' : 'border-gray-800/50'
                      }`}
                    >
                      {typeItRoom.currentQuestion === question.order && (
                        <span className="absolute -top-2 right-4 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1 rounded-full shadow-lg">
                          Current
                        </span>
                      )}
                      <p className="font-semibold text-lg text-gray-100 mb-2">
                        {question.order}. {question.text}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-400">
                        <div className="space-y-1">
                          <p><span className="text-gray-300 font-medium">Points:</span> {question.points}</p>
                        </div>
                        <div className="space-y-1">
                          <p><span className="text-gray-300 font-medium">Time Limit:</span> {question.timeLimit}s</p>
                        </div>
                        <div className="space-y-1">
                          <p><span className="text-gray-300 font-medium">Correct Answers:</span> {question.correctAnswers?.length || 0}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="bg-[#1a1a24] border border-dashed border-gray-700 rounded-xl p-8 text-center">
                  <p className="text-gray-400 text-sm">No questions in this type-it room yet.</p>
                </div>
              )}
            </div>
          </main>

          {/* Participants */}
          <aside>
            <div className="bg-[#12121b] border border-[#1e1e29] rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-200">
                <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Participants
              </h2>
              {typeItRoom.participants?.length > 0 ? (
                <ul className="space-y-3">
                  {typeItRoom.participants.map((participant: Participant) => (
                    <li key={participant.id} className="p-3 bg-[#1a1a24] rounded-xl border border-gray-800/50 hover:border-gray-600/50 transition-all duration-200 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-200">{participant.name}</span>
                        <span className="text-gray-500 text-xs bg-gray-800 px-2 py-1 rounded-full">Joined</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-6 text-sm italic">No participants yet</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface The100Question {
  id: number;
  text: string;
  order: number;
  imageUrl?: string;
}

interface Participant {
  id: number;
  name: string;
  score: number;
  rank: number | null;
}

interface The100Room {
  id: number;
  title: string;
  desc: string;
  isLocked: boolean;
  currentQuestion: number;
  questions: The100Question[];
  participants: Participant[];
}

export default function The100RoomDetailPage() {
  const [room, setRoom] = useState<The100Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  const fetchRoom = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/the-100/${roomId}`);
      if (!res.ok) throw new Error('Failed to fetch The-100 room');
      const data = await res.json();
      setRoom(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) {
      fetchRoom();
    }
  }, [roomId, fetchRoom]);

  const handleStartGame = async () => {
    try {
      const res = await fetch(`/api/the-100/${roomId}/lock`, { method: 'PUT' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to start game');
      }
      router.push(`/the-100/${roomId}/start-quiz`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start game');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 animate-spin"></div>
          </div>
          <p className="text-gray-400 text-sm font-medium animate-pulse">Loading room details...</p>
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

  if (!room) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="bg-[#12121b] border border-gray-700/50 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
          <h3 className="text-xl font-semibold text-gray-200 mb-2">The-100 Room Not Found</h3>
          <p className="text-gray-400 text-sm">The requested room doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const isHost = userRole === 'host';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="pb-4 border-b border-gray-800/50">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
            The-100: {room.title}
          </h1>
          <p className="text-gray-400 mt-2 leading-relaxed max-w-2xl">{room.desc}</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-[#12121b] px-4 py-2 rounded-xl border border-gray-700/50 shadow-sm">
            <span className={`w-2 h-2 rounded-full ${room.isLocked ? 'bg-red-500' : 'bg-green-500'}`}></span>
            <span className="text-gray-300 text-sm font-medium">
              {room.isLocked ? 'Locked' : 'Open For Editing'}
            </span>
          </div>
        </header>

        {isHost && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => router.push(`/the-100`)}
                className="px-5 py-2.5 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-300 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Back to Rooms
              </button>
              <button
                onClick={() => router.push(`/the-100/${roomId}/questions/create`)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
                disabled={room.isLocked}
              >
                Add Question
              </button>
              <button
                onClick={() => router.push(`/the-100/${roomId}/manage-questions`)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Manage Questions
              </button>
              <button
                onClick={() => router.push(`/the-100/${roomId}/leaderboard`)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-700 text-white font-bold hover:shadow-lg hover:shadow-yellow-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Leaderboard
              </button>
            </div>
            {room.isLocked ? (
              <button
                onClick={() => router.push(`/the-100/${roomId}/start-quiz`)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Start Quiz
              </button>
            ) : (
              <button
                onClick={handleStartGame}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-700 text-white font-bold hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Lock & Start Game
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <main className="lg:col-span-2">
            <div className="bg-[#12121b] border border-[#1e1e29] rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-200">
                <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Questions
              </h2>

              {room.questions?.length > 0 ? (
                <ul className="space-y-4">
                  {room.questions.map((question) => (
                    <li
                      key={question.id}
                      className={`relative p-5 rounded-xl bg-[#1a1a24] border transition-all duration-200 hover:border-orange-500/40 hover:shadow-md ${
                        room.currentQuestion === question.order ? 'ring-2 ring-orange-500' : 'border-gray-800/50'
                      }`}
                    >
                      {room.currentQuestion === question.order && (
                        <span className="absolute -top-2 right-4 text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-red-600 px-3 py-1 rounded-full shadow-lg">
                          Current
                        </span>
                      )}
                      <p className="font-semibold text-lg text-gray-100 mb-2">
                        {question.order}. {question.text}
                      </p>
                      {question.imageUrl && (
                        <img src={question.imageUrl} alt="Question" className="mt-2 max-h-32 rounded-lg border border-gray-700/50" />
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="bg-[#1a1a24] border border-dashed border-gray-700 rounded-xl p-8 text-center">
                  <p className="text-gray-400 text-sm">No questions in this room yet.</p>
                </div>
              )}
            </div>
          </main>

          <aside>
            <div className="bg-[#12121b] border border-[#1e1e29] rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-200">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Participants
              </h2>
              {room.participants?.length > 0 ? (
                <ul className="space-y-3">
                  {room.participants.map((participant) => (
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

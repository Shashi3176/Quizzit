'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Question {
  id: number;
  text: string;
  order: number;
  correctAnswers: string[];
  points: number;
  timeLimit: number;
}

interface TypeItRoom {
  id: number;
  ownerId: number;
  isLocked: boolean;
  currentQuestion: number;
  questions: Question[];
  participants: { id: number; name: string }[];
}

export default function StartQuizPage() {
  const [quizRoom, setQuizRoom] = useState<TypeItRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const fetchQuizRoom = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/type-it-room/${roomId}`);
      if (!res.ok) throw new Error('Failed to fetch type it room');
      const data = await res.json();
      setQuizRoom(data);
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
      fetchQuizRoom();
    }
  }, [roomId, fetchQuizRoom]);

  useEffect(() => {
    if (!roomId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // In prod: use same host (port 80/443). In dev: use port 3001
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const wsHost = isLocalhost ? 'localhost:3001' : window.location.host;
    const wsUrl = `${protocol}//${wsHost}/api/type-it-room/${roomId}/ws`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
      } catch (e) {
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = (event) => {
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [roomId]);

  const handleReleaseQuestion = (questionOrder: number) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'releaseTypeItQuestion',
        questionId: questionOrder
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-400 text-lg font-medium animate-pulse">Loading TypeIt Room...</p>
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
          <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">Try Again</button>
        </div>
      </div>
    );
  }

  if (!quizRoom) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="bg-[#12121b] border border-gray-700/50 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Room Not Found</h3>
          <p className="text-gray-500 text-sm">TypeIt room not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 p-4 sm:p-6 lg:p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="mb-10 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl max-h-24 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-emerald-600/20 blur-3xl rounded-full -z-10"></div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
            Start TypeIt
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-medium tracking-wider uppercase">Moderator Control Panel</p>
        </header>

        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/type-it-room/${roomId}`)}
            className="group flex items-center gap-2 px-4 py-2.5 bg-[#12121b] hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white font-medium rounded-xl transition-all duration-200"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to TypeIt Room
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* Questions Section - Takes more space */}
          <div className="flex-1 min-w-0">
            <div className="bg-[#12121b] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-800 bg-gray-900/30">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Questions
                  <span className="ml-auto text-sm font-normal text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                    {quizRoom?.questions?.length || 0} Total
                  </span>
                </h2>
              </div>

              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {quizRoom?.questions?.length > 0 ? (
                  quizRoom.questions?.map((question) => (
                    <div 
                      key={question.id} 
                      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-emerald-500/30 transition-all duration-300"
                    >
                      {/* Question Header */}
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                            {question.order}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-200 text-lg leading-relaxed">{question.text}</p>
                          </div>
                        </div>

                        {/* Question Meta */}
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-sm font-medium">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            {question.points} Points
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm font-medium">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {question.timeLimit}s Time Limit
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm font-medium">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {question.correctAnswers?.length || 0} Correct Answers
                          </span>
                        </div>

                        {/* Release Question Button */}
                        <div className="mt-5">
                          <button
                            onClick={() => handleReleaseQuestion(question.order)}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-emerald-500/20"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Release Question
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                      <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 font-medium">No questions in this type it room yet.</p>
                    <p className="text-gray-600 text-sm mt-1">Add some questions to get started!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Participants Section - Fixed width sidebar */}
          <div className="xl:w-72 shrink-0">
            <div className="bg-[#12121b] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden sticky top-6">
              <div className="p-6 border-b border-gray-800 bg-gray-900/30">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Participants
                  <span className="ml-auto flex items-center gap-2 text-xs font-bold text-emerald-400 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    {quizRoom.participants.length}
                  </span>
                </h2>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto">
                {quizRoom.participants.length > 0 ? (
                  <ul className="space-y-2">
                    {quizRoom.participants.map((participant, index) => (
                      <li 
                        key={participant.id} 
                        className="flex items-center gap-3 p-3 bg-gray-800/40 hover:bg-gray-800/60 rounded-xl border border-gray-700/30 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-200 truncate">{participant.name}</p>
                          <p className="text-xs text-gray-500">Player #{index + 1}</p>
                        </div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                      <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 font-medium">No participants yet</p>
                    <p className="text-gray-600 text-sm mt-1">Waiting for players to join...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

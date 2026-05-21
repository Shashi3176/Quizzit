'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Question {
  id: number;
  text: string;
  order: number;
  hints: string[];
  imageUrl?: string;
}

interface GuessItRoom {
  id: number;
  ownerId: number;
  isLocked: boolean;
  currentQuestion: number;
  questions: Question[];
  participants: { id: number; name: string }[];
}

export default function GuessItStartQuizPage() {
  const [GuessItRoom, setGuessItRoom] = useState<GuessItRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const fetchGuessItRoom = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/guess-it-room/${roomId}`);
      if (!res.ok) throw new Error('Failed to fetch quiz room');
      const data = await res.json();
      setGuessItRoom(data);
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
      fetchGuessItRoom();
    }
  }, [roomId, fetchGuessItRoom]);

  useEffect(() => {
    if (!roomId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // In prod: use same host (port 80/443). In dev: use port 3001
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const wsHost = isLocalhost ? 'localhost:3001' : window.location.host;
    const wsUrl = `${protocol}//${wsHost}/api/guess-it-room/${roomId}/ws`;

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
        type: 'releaseGuessItQuestion',
        questionId: questionOrder
      }));
    }
  };

  const handleReleaseHint = (questionOrder: number, hintIndex: number) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'releaseGuessItHint',
        questionId: questionOrder,
        hintIndex
      }));
    }
  };

  const handleEndQuestion = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'endGuessItQuestion'
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-400 text-lg font-medium animate-pulse">Loading Quiz Room...</p>
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

  if (!GuessItRoom) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="bg-[#12121b] border border-gray-700/50 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Room Not Found</h3>
          <p className="text-gray-500 text-sm">Quiz room not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 p-4 sm:p-6 lg:p-8 font-sans selection:bg-purple-500/30">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="mb-10 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl max-h-24 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 blur-3xl rounded-full -z-10"></div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
            Start Quiz
          </h1>
        </header>

        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/guess-it-room/${roomId}`)}
            className="group flex items-center gap-2 px-4 py-2.5 bg-[#12121b] hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white font-medium rounded-xl transition-all duration-200"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Quiz Room
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* Questions Section - Takes more space */}
          <div className="flex-1 min-w-0">
            <div className="bg-[#12121b] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-800 bg-gray-900/30">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Questions
                  <span className="ml-auto text-sm font-normal text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                    {GuessItRoom?.questions?.length || 0} Total
                  </span>
                </h2>
              </div>

              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {GuessItRoom?.questions?.length > 0 ? (
                  GuessItRoom.questions?.map((question) => (
                    <div 
                      key={question.id} 
                      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-purple-500/30 transition-all duration-300"
                    >
                      {/* Question Header */}
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                            {question.order}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-200 text-lg leading-relaxed">{question.text}</p>
                          </div>
                        </div>

                        {question.imageUrl && (
                          <div className="mt-4 relative group">
                            <div className="absolute inset-0 bg-purple-500/10 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                            <img 
                              src={question.imageUrl} 
                              alt="Question" 
                              className="relative max-h-48 w-auto rounded-xl border border-white/5 shadow-lg"
                            />
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            onClick={() => handleReleaseQuestion(question.order)}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-green-500/20"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Release Question
                          </button>
                          <button
                            onClick={handleEndQuestion}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3 px-6 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-red-500/20"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                            </svg>
                            End Question
                          </button>
                        </div>
                      </div>

                      {/* Hints Section */}
                      {question.hints && question.hints.length > 0 && (
                        <div className="px-5 pb-5">
                          <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-700/30">
                            <p className="text-xs font-bold text-yellow-500/80 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              Hints ({question.hints.length})
                            </p>
                            <div className="space-y-2">
                              {question.hints.map((hint, index) => (
                                <div 
                                  key={index} 
                                  className="flex items-center justify-between gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-yellow-500/30 transition-colors"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className="flex-shrink-0 w-6 h-6 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center text-xs font-bold">
                                      {index + 1}
                                    </span>
                                    <span className="text-sm text-gray-400 truncate">{hint}</span>
                                  </div>
                                  <button
                                    onClick={() => handleReleaseHint(question.order, index)}
                                    className="flex-shrink-0 inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all transform active:scale-95 shadow-md"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Release
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                      <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 font-medium">No questions in this quiz room yet.</p>
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
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Participants
                  <span className="ml-auto flex items-center gap-2 text-xs font-bold text-green-400 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    {GuessItRoom.participants.length}
                  </span>
                </h2>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto">
                {GuessItRoom.participants.length > 0 ? (
                  <ul className="space-y-2">
                    {GuessItRoom.participants.map((participant, index) => (
                      <li 
                        key={participant.id} 
                        className="flex items-center gap-3 p-3 bg-gray-800/40 hover:bg-gray-800/60 rounded-xl border border-gray-700/30 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-200 truncate">{participant.name}</p>
                          <p className="text-xs text-gray-500">Player #{index + 1}</p>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
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
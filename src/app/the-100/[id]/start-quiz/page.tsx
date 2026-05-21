'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Question {
  id: number;
  text: string;
  order: number;
  imageUrl?: string;
}

interface PendingAnswer {
  id: number;
  participantId: number;
  answer: string;
  status: string;
  score: number;
  participant: {
    id: number;
    name: string;
    score: number;
  };
  createdAt: string;
}

interface The100Room {
  id: number;
  isLocked: boolean;
  currentQuestion: number;
  questions: Question[];
  participants: { id: number; name: string }[];
}

export default function The100StartQuizPage() {
  const [room, setRoom] = useState<The100Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [pendingAnswers, setPendingAnswers] = useState<PendingAnswer[]>([]);
  const [reviewScore, setReviewScore] = useState<Record<number, number>>({});
  const currentQuestionOrderRef = useRef(0);
  useEffect(() => {
    currentQuestionOrderRef.current = currentQuestion?.order ?? 0;
  }, [currentQuestion]);

  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/the-100/${roomId}`);
      if (!res.ok) throw new Error('Failed to fetch room');
      const data = await res.json();
      setRoom(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const fetchPendingAnswers = useCallback(async (questionOrder: number) => {
    try {
      const res = await fetch(`/api/the-100/${roomId}/questions/${questionOrder}/answers`);
      if (!res.ok) return;
      const data = await res.json();
      setPendingAnswers(data);
    } catch (err) {
      console.error('Error fetching pending answers:', err);
    }
  }, [roomId]);

  const reviewAnswer = useCallback(async (answerId: number, status: 'accepted' | 'rejected') => {
    const score = status === 'accepted' ? (reviewScore[answerId] || 0) : 0;
    try {
      const response = await fetch(
        `/api/the-100/${roomId}/answers/${answerId}/review`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, score }),
        }
      );
      if (response.ok) {
        fetchRoom();
        if (currentQuestionOrderRef.current > 0) {
          fetchPendingAnswers(currentQuestionOrderRef.current);
        }
      }
    } catch (err) {
      console.error('Error reviewing answer:', err);
    }
  }, [roomId, reviewScore, fetchRoom, fetchPendingAnswers]);

  // Store fetch functions in refs to avoid WebSocket recreation on every refetch
  const fetchRoomRef = useRef(fetchRoom);
  const fetchPendingAnswersRef = useRef(fetchPendingAnswers);
  useEffect(() => { fetchRoomRef.current = fetchRoom; }, [fetchRoom]);
  useEffect(() => { fetchPendingAnswersRef.current = fetchPendingAnswers; }, [fetchPendingAnswers]);

  useEffect(() => {
    if (roomId) fetchRoom();
  }, [roomId, fetchRoom]);

  useEffect(() => {
    if (!roomId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // In prod: use same host (port 80/443). In dev: use port 3001
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const wsHost = isLocalhost ? 'localhost:3001' : window.location.host;
    const wsUrl = `${protocol}//${wsHost}/api/the-100/${roomId}/ws`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => console.log('WebSocket connected for the-100');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);
        switch (data.type) {
          case 'the100QuestionReleased':
            setCurrentQuestion({
              id: data.data.id,
              text: data.data.text,
              order: data.data.order,
              imageUrl: data.data.imageUrl,
            });
            setPendingAnswers([]);
            setReviewScore({});
            fetchPendingAnswersRef.current(data.data.order);
            break;
          case 'the100AnswerSubmitted':
            if (currentQuestionOrderRef.current > 0) {
              fetchPendingAnswersRef.current(currentQuestionOrderRef.current);
            }
            break;
          case 'the100AnswerReviewed':
            fetchRoomRef.current();
            if (currentQuestionOrderRef.current > 0) {
              fetchPendingAnswersRef.current(currentQuestionOrderRef.current);
            }
            break;
          case 'the100QuestionEnded':
            setCurrentQuestion(null);
            setPendingAnswers([]);
            setReviewScore({});
            break;
        }
      } catch (e) {
        console.log('Raw message:', event.data);
      }
    };
    ws.onerror = (error) => console.error('WebSocket error:', error);
    ws.onclose = (event) => console.log('WebSocket disconnected:', event.code);

    setSocket(ws);

    return () => { ws.close(); };
  }, [roomId]);

  const handleReleaseQuestion = (questionOrder: number) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'releaseThe100Question', questionId: questionOrder }));
    }
  };

  const handleEndQuestion = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'endThe100Question' }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-400 text-lg font-medium animate-pulse">Loading Quiz Room...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="bg-[#12121b] border border-red-500/30 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl shadow-red-500/10">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Room</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">Try Again</button>
        </div>
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 p-4 sm:p-6 lg:p-8 font-sans selection:bg-orange-500/30">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-10 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl max-h-24 bg-gradient-to-r from-orange-600/20 via-red-600/20 to-orange-600/20 blur-3xl rounded-full -z-10"></div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
            Start The-100 Quiz
          </h1>
        </header>

        <div className="mb-8">
          <button
            onClick={() => router.push(`/the-100/${roomId}`)}
            className="group flex items-center gap-2 px-4 py-2.5 bg-[#12121b] hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white font-medium rounded-xl transition-all duration-200"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Room
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <div className="bg-[#12121b] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-800 bg-gray-900/30">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Questions
                  <span className="ml-auto text-sm font-normal text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                    {room?.questions?.length || 0} Total
                  </span>
                </h2>
              </div>

              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {room?.questions?.length > 0 ? (
                  room.questions.map((question) => (
                    <div 
                      key={question.id} 
                      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-orange-500/30 transition-all duration-300"
                    >
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                            {question.order}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-200 text-lg leading-relaxed">{question.text}</p>
                          </div>
                        </div>

                        {question.imageUrl && (
                          <div className="mt-4">
                            <img src={question.imageUrl} alt="Question" className="max-h-48 w-auto rounded-xl border border-white/5 shadow-lg" />
                          </div>
                        )}

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

                        {currentQuestion && currentQuestion.order === question.order && (
                          <div className="mt-6 border-t border-gray-700 pt-6 space-y-4">
                            {/* Accepted Answers */}
                            {pendingAnswers.filter(a => a.status === 'accepted').length > 0 && (
                              <div>
                                <h4 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Accepted Answers ({pendingAnswers.filter(a => a.status === 'accepted').length})
                                </h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {[...pendingAnswers.filter(a => a.status === 'accepted')].reverse().map((answer) => (
                                    <div key={answer.id} className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                                      <div className="flex-1 min-w-0">
                                        <span className="font-medium text-gray-200 text-sm">{answer.participant.name}</span>
                                        <p className="text-gray-400 text-sm truncate">{answer.answer}</p>
                                      </div>
                                      <span className="text-green-400 font-bold text-sm ml-2">+{answer.score}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Pending Answer Queue */}
                            <div>
                              <h4 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                Answer Queue ({pendingAnswers.filter(a => a.status === 'pending').length} pending)
                              </h4>

                              {pendingAnswers.filter(a => a.status === 'pending').length > 0 ? (
                                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                                  {[...pendingAnswers.filter(a => a.status === 'pending')].reverse().map((answer) => (
                                    <div
                                      key={answer.id}
                                      className="p-4 rounded-xl border bg-gray-800/50 border-gray-700/50 hover:border-orange-500/30 transition-all"
                                    >
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-gray-200">{answer.participant.name}</span>
                                          </div>
                                          <p className="text-gray-300 text-lg">{answer.answer}</p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="number"
                                              min="0"
                                              placeholder="Points"
                                              value={reviewScore[answer.id] ?? ''}
                                              onChange={(e) => setReviewScore(prev => ({ ...prev, [answer.id]: parseInt(e.target.value) || 0 }))}
                                              className="w-20 bg-[#0a0a0f] text-white border border-gray-700 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 text-center"
                                            />
                                          </div>
                                          <div className="flex gap-2">
                                            <button
                                              onClick={() => reviewAnswer(answer.id, 'accepted')}
                                              disabled={reviewScore[answer.id] === undefined || reviewScore[answer.id] < 0}
                                              className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-semibold py-1.5 px-3 rounded-lg transition-all"
                                            >
                                              Accept
                                            </button>
                                            <button
                                              onClick={() => reviewAnswer(answer.id, 'rejected')}
                                              className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold py-1.5 px-3 rounded-lg transition-all"
                                            >
                                              Reject
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="py-8 text-center">
                                  <p className="text-gray-500">No pending answers.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center">
                    <p className="text-gray-400 font-medium">No questions in this quiz room yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

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
                    {room.participants.length}
                  </span>
                </h2>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto">
                {room.participants.length > 0 ? (
                  <ul className="space-y-2">
                    {room.participants.map((participant, index) => (
                      <li 
                        key={participant.id} 
                        className="flex items-center gap-3 p-3 bg-gray-800/40 hover:bg-gray-800/60 rounded-xl border border-gray-700/30 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
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

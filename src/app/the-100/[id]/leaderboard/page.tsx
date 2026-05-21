'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Participant {
  id: number;
  name: string;
  score: number;
  previousScore?: number;
  previousRank?: number;
}

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

const useWebSocket = (roomId: string) => {
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const cookies = document.cookie.split(';').reduce((res, c) => {
      const [key, val] = c.trim().split('=');
      return key === 'auth_token' ? val : res;
    }, '');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // In prod: use same host (port 80/443). In dev: use port 3001
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const wsHost = isLocalhost ? 'localhost:3001' : window.location.host;
    const wsUrl = `${protocol}//${wsHost}/api/the-100/${roomId}/ws${cookies ? `?token=${cookies}` : ''}`;
    
    try {
      const socket = new WebSocket(wsUrl);
      socket.onopen = () => console.log('WebSocket connection established for the-100');
      socket.onclose = () => console.log('WebSocket connection closed');
      socket.onerror = (error) => console.error('WebSocket error:', error);
      setWs(socket);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }

    return () => setWs(null);
  }, [roomId]);

  return ws;
};

export default function The100LeaderboardPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [pendingAnswers, setPendingAnswers] = useState<PendingAnswer[]>([]);
  const [previousParticipants, setPreviousParticipants] = useState<Map<number, { score: number; rank: number }>>(new Map());
  const isFirstLoad = useRef(true);
  
  const params = useParams();
  const router = useRouter();
  const { id: roomId } = params;
  
  const ws = useWebSocket(roomId as string);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/the-100/${roomId}/leaderboard`);
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      const data = await res.json();
      
      data.sort((a: Participant, b: Participant) => b.score - a.score);
      
      const updatedData = data.map((participant: Participant, index: number) => {
        const previousData = isFirstLoad.current ? null : previousParticipants.get(participant.id);
        return {
          ...participant,
          previousScore: previousData?.score,
          previousRank: previousData?.rank,
          currentRank: index + 1
        };
      });
      
      if (!isFirstLoad.current) {
        const newPreviousMap = new Map<number, { score: number; rank: number }>();
        updatedData.forEach((p: Participant & { currentRank: number }) => {
          newPreviousMap.set(p.id, { score: p.score, rank: p.currentRank });
        });
        setPreviousParticipants(newPreviousMap);
      } else {
        isFirstLoad.current = false;
      }
      
      setParticipants(updatedData);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred');
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

  useEffect(() => {
    if (roomId) {
      fetchLeaderboard();
    }
    
    const interval = setInterval(() => {
      fetchLeaderboard();
      if (currentQuestion && userRole === 'moderator') {
        fetchPendingAnswers(currentQuestion.order);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [roomId, fetchLeaderboard, currentQuestion, userRole, fetchPendingAnswers]);

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'the100QuestionReleased':
            setCurrentQuestion({
              id: data.data.id,
              text: data.data.text,
              order: data.data.order,
              imageUrl: data.data.imageUrl,
            });
            setAnswerText('');
            setPendingAnswers([]);
            if (userRole === 'moderator') {
              fetchPendingAnswers(data.data.order);
            }
            break;
          case 'the100LeaderboardUpdate':
            fetchLeaderboard();
            break;
          case 'the100AnswerSubmitted':
            break;
          case 'the100AnswerReviewed':
            fetchLeaderboard();
            if (currentQuestion && userRole === 'moderator') {
              fetchPendingAnswers(currentQuestion.order);
            }
            break;
          case 'the100QuestionEnded':
            setCurrentQuestion(null);
            setPendingAnswers([]);
            break;
          case 'the100QuizEnd':
            router.push(`/the-100/${roomId}/leaderboard`);
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => ws.removeEventListener('message', handleMessage);
  }, [ws, router, roomId, fetchLeaderboard, userRole, currentQuestion, fetchPendingAnswers]);

  const submitAnswer = useCallback(async () => {
    if (!currentQuestion || !answerText.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `/api/the-100/${roomId}/questions/${currentQuestion.order}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answer: answerText.trim() }),
        }
      );

      if (response.ok) {
        setAnswerText('');
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setSubmitting(false);
    }
  }, [currentQuestion, answerText, roomId, submitting]);

  const isModerator = userRole === 'moderator';

  const acceptedAnswers = pendingAnswers.filter(a => a.status === 'accepted');

  const renderLeaderboard = () => (
    <div className="bg-[#12121b] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-gray-800 flex justify-between items-end bg-gray-900/30">
        <h2 className="text-2xl font-bold text-white">Live Leaderboard</h2>
        <span className="flex items-center gap-2 text-xs font-bold text-green-400 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20 animate-pulse">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span> LIVE
        </span>
      </div>
      
      {participants.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-800/30 text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-semibold w-16 text-center">#</th>
                <th className="px-6 py-3 font-semibold">Player</th>
                <th className="px-6 py-3 font-semibold hidden sm:table-cell">Change</th>
                <th className="px-6 py-3 font-semibold text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {participants.map((participant, index) => {
                const currentRank = index + 1;
                const previousRank = participant.previousRank;
                const rankChange = previousRank !== undefined ? previousRank - currentRank : 0;
                
                let rankStyle = "bg-gray-800 text-gray-400";
                if (currentRank === 1) rankStyle = "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
                if (currentRank === 2) rankStyle = "bg-gray-400/20 text-gray-300 border border-gray-400/30";
                if (currentRank === 3) rankStyle = "bg-orange-500/20 text-orange-400 border border-orange-500/30";

                return (
                  <tr key={participant.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className={`w-8 h-8 mx-auto flex items-center justify-center rounded-lg font-bold ${rankStyle}`}>
                        {currentRank}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-200">{participant.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {rankChange !== 0 && (
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                          rankChange > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {rankChange > 0 ? '↑' : '↓'} {Math.abs(rankChange)}
                        </span>
                      )}
                      {rankChange === 0 && <span className="text-gray-600">-</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xl font-bold text-white font-mono tracking-tight">{participant.score}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
          </div>
          <p className="text-gray-400 font-medium">Waiting for participants...</p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    return (
      <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto">
        
        {/* Leaderboard - always visible */}
        {renderLeaderboard()}

        {/* Active Question Section */}
        {currentQuestion && (
          <div className="bg-[#12121b] rounded-2xl border border-orange-500/30 shadow-[0_0_50px_-12px_rgba(249,115,22,0.2)] overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 p-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="font-bold text-orange-300 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                Current Question • Q{currentQuestion.order}
                {isModerator && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full ml-2">Moderator View</span>}
              </h2>
            </div>

            <div className="p-6">
              {currentQuestion.imageUrl && (
                <div className="mb-8 relative group">
                  <div className="absolute inset-0 bg-orange-500/10 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Question Image"
                    className="relative max-h-[400px] w-auto object-cover rounded-xl shadow-2xl border border-white/5"
                  />
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">{currentQuestion.text}</h3>
              </div>

              {!isModerator && (
                <form onSubmit={(e) => { e.preventDefault(); submitAnswer(); }} className="space-y-4 max-w-lg mx-auto">
                  <label htmlFor="answer" className="block text-center text-gray-400 text-sm mb-2">Submit your answer</label>
                  <div className="relative">
                    <input
                      id="answer"
                      type="text"
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      className="w-full bg-[#0a0a0f] text-white border-2 border-gray-700 rounded-xl py-4 px-6 text-lg focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all placeholder-gray-600 font-medium"
                      placeholder="Type your answer here..."
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!answerText.trim() || submitting}
                      className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:from-gray-700 disabled:to-gray-800 text-white font-bold px-6 rounded-lg transition-all transform active:scale-95 shadow-lg"
                    >
                      {submitting ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </form>
              )}

              {isModerator && acceptedAnswers.length > 0 && (
                <div className="space-y-6 mt-8 border-t border-gray-800 pt-8">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Accepted Answers
                      <span className="ml-2 text-sm font-normal text-gray-500">({acceptedAnswers.length})</span>
                    </h3>
                    <div className="bg-[#12121b] rounded-xl border border-gray-800 overflow-hidden">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gray-900/50 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                            <th className="px-5 py-3 font-semibold">Player</th>
                            <th className="px-5 py-3 font-semibold">Answer</th>
                            <th className="px-5 py-3 font-semibold text-right">Points</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                          {[...acceptedAnswers].reverse().map((answer) => (
                            <tr key={answer.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-5 py-3">
                                <span className="font-medium text-gray-200">{answer.participant.name}</span>
                              </td>
                              <td className="px-5 py-3">
                                <span className="text-gray-300">{answer.answer}</span>
                              </td>
                              <td className="px-5 py-3 text-right">
                                <span className="inline-flex items-center gap-1 text-sm font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full">
                                  +{answer.score}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading && participants.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-400 text-lg font-medium animate-pulse">Connecting to Game Server...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="bg-[#12121b] border border-red-500/30 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl shadow-red-500/10">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Connection Error</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 p-4 sm:p-6 lg:p-8 font-sans selection:bg-orange-500/30">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-10 text-center relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl max-h-24 bg-gradient-to-r from-orange-600/20 via-red-600/20 to-orange-600/20 blur-3xl rounded-full -z-10"></div>
           
           <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
             The-100 Leaderboard
           </h1>
           <p className="text-gray-400 mt-2 text-sm font-medium tracking-wider uppercase">Real-Time Rankings</p>
        </header>
        
        {renderContent()}
      </div>
    </div>
  );
}

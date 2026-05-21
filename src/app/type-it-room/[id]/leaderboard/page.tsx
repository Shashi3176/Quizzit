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
  correctAnswers: string[];
  order: number;
  timeLimit: number;
  points: number;
  imageUrl?: string;
}

interface TypeItRoom {
  id: number;
  currentQuestion: number;
  questions: Question[];
}

interface QuestionAnalyticsSummary {
  questionId: number;
  questionOrder: number;
  questionText: string;
  points: number;
  answeredCount: number;
  pendingCount: number;
  averageResponseTime: number;
}

interface PreviousQuestionAnalytics {
  id: number;
  questionId: number;
  questionOrder: number;
  questionText: string;
  points: number;
  averageResponseTime: number;
  participantCount: number;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  pendingCount: number;
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
    const wsUrl = `${protocol}//${wsHost}/api/type-it-room/${roomId}/ws${cookies ? `?token=${cookies}` : ''}`;
    
    try {
      const socket = new WebSocket(wsUrl);
      socket.onopen = () => {};
      socket.onclose = () => {};
      socket.onerror = (error) => console.error('WebSocket error:', error);
      setWs(socket);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }

    return () => setWs(null);
  }, [roomId]);

  return ws;
};

export default function LeaderboardPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [allQuestionsAnalytics, setAllQuestionsAnalytics] = useState<QuestionAnalyticsSummary[]>([]);
  const [previousQuestionAnalytics, setPreviousQuestionAnalytics] = useState<PreviousQuestionAnalytics | null>(null);
  const previousParticipantsRef = useRef<Map<number, { score: number; rank: number }>>(new Map());
  const lastChangesRef = useRef<Map<number, { scoreChange: number; rankChange: number }>>(new Map());
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
      const res = await fetch(`/api/type-it-room/${roomId}/leaderboard`);
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      const data = await res.json();
      
      data.sort((a: Participant, b: Participant) => b.score - a.score);
      
      const updatedData = data.map((participant: Participant, index: number) => {
        const previousData = isFirstLoad.current ? null : previousParticipantsRef.current.get(participant.id);
        const currentRank = index + 1;
        const scoreChange = previousData ? participant.score - previousData.score : 0;
        const rankChange = previousData ? previousData.rank - currentRank : 0;
        const hasChange = scoreChange !== 0 || rankChange !== 0;

        if (!isFirstLoad.current && hasChange) {
          previousParticipantsRef.current.set(participant.id, { score: participant.score, rank: currentRank });
          lastChangesRef.current.set(participant.id, { scoreChange, rankChange });
        }

        const lastChange = lastChangesRef.current.get(participant.id);
        const displayScoreChange = hasChange ? scoreChange : (lastChange?.scoreChange ?? 0);
        const displayRankChange = hasChange ? rankChange : (lastChange?.rankChange ?? 0);

        return {
          ...participant,
          previousScore: previousData ? participant.score - displayScoreChange : undefined,
          previousRank: previousData ? currentRank + displayRankChange : undefined,
          currentRank,
        };
      });
      
      if (isFirstLoad.current) {
        const newMap = new Map<number, { score: number; rank: number }>();
        updatedData.forEach((p: Participant & { currentRank: number }) => {
          newMap.set(p.id, { score: p.score, rank: p.currentRank });
        });
        previousParticipantsRef.current = newMap;
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

  const fetchQuizRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/type-it-room/${roomId}`);
      if (!res.ok) throw new Error('Failed to fetch type it room data.');
      await res.json();
    } catch (err) {
      console.error(err);
    }
  }, [roomId]);

  const fetchAllQuestionsAnalytics = useCallback(async () => {
    const role = localStorage.getItem('userRole');
    if (role !== 'moderator') return;
    
    try {
      const res = await fetch(`/api/type-it-room/${roomId}/questions-analytics`);
      if (!res.ok) return;
      const data = await res.json();
      setAllQuestionsAnalytics(data.questions || []);
    } catch (err) {
      console.error('Error fetching all questions analytics:', err);
    }
  }, [roomId]);

  const fetchPreviousQuestionAnalytics = useCallback(async () => {
    const role = localStorage.getItem('userRole');
    if (role !== 'moderator') return;
    
    try {
      const res = await fetch(`/api/type-it-room/${roomId}/previous-question-analytics`);
      if (!res.ok) return;
      const data = await res.json();
      setPreviousQuestionAnalytics(data);
    } catch (err) {
      console.error('Error fetching previous question analytics:', err);
    }
  }, [roomId]);

  const savePreviousQuestionAnalytics = useCallback(async (questionId: number, questionOrder: number, questionText: string, points: number) => {
    try {
      const res = await fetch(`/api/type-it-room/${roomId}/questions/${questionId}/analytics`);
      if (!res.ok) return;
      const data = await res.json();
      
      await fetch(`/api/type-it-room/${roomId}/previous-question-analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          questionOrder,
          questionText,
          points,
          answerDistribution: data.answerDistribution || {},
          averageResponseTime: data.averageResponseTime,
          participantCount: data.participantCount,
          answeredCount: data.answeredCount,
          correctCount: data.correctCount,
          wrongCount: data.wrongCount,
          pendingCount: data.pendingCount
        })
      });
      
      fetchPreviousQuestionAnalytics();
    } catch (err) {
      console.error('Error saving previous question analytics:', err);
    }
  }, [roomId, fetchPreviousQuestionAnalytics]);

  useEffect(() => {
    if (roomId) {
      fetchLeaderboard();
      fetchQuizRoom();
      fetchAllQuestionsAnalytics();
      fetchPreviousQuestionAnalytics();
    }
    
    const interval = setInterval(() => {
      fetchLeaderboard();
      fetchQuizRoom();
      fetchAllQuestionsAnalytics();
      fetchPreviousQuestionAnalytics();
    }, 10000);

    return () => clearInterval(interval);
  }, [roomId, fetchLeaderboard, fetchQuizRoom, fetchAllQuestionsAnalytics, fetchPreviousQuestionAnalytics]);

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'typeItQuestionReleased':
            setCurrentQuestion(data.data);
            setTimeLeft(data.data.timeLimit);
            setIsSubmitted(false);
            setSelectedAnswer('');
            setIsCorrect(null);
            setIsSubmitting(false);
            break;
          case 'leaderboardUpdate':
            fetchLeaderboard();
            break;
          case 'typeItQuizEnd':
            router.push(`/type-it-room/${roomId}/leaderboard`);
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => ws.removeEventListener('message', handleMessage);
  }, [ws, router, roomId, fetchLeaderboard]);

  const submitAnswer = useCallback(async () => {
    if (!currentQuestion || isSubmitted || !selectedAnswer.trim()) return;
    setIsSubmitted(true);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/type-it-room/${roomId}/questions/${currentQuestion.id}/answer`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            answer: selectedAnswer,
            responseTime: currentQuestion.timeLimit - timeLeft 
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setIsCorrect(result.isCorrect);
        setScore(result.score);
        setIsSubmitting(false);
        setTimeout(() => {
          setCurrentQuestion(null);
          setIsCorrect(null);
          setSelectedAnswer('');
          setIsSubmitted(false);
          setIsSubmitting(false);
          fetchLeaderboard();
        }, 3000);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setIsSubmitting(false);
    }
  }, [currentQuestion, selectedAnswer, roomId, timeLeft, fetchLeaderboard, isSubmitted]);

  useEffect(() => {
    const currentRole = localStorage.getItem('userRole');
    if (timeLeft > 0 && !isSubmitted && currentRole !== 'moderator') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted && currentQuestion && currentRole !== 'moderator') {
      setIsSubmitted(true);
      if (selectedAnswer.trim()) {
        submitAnswer();
      } else {
        setIsCorrect(false);
        setIsSubmitting(false);
        setTimeout(() => {
          setCurrentQuestion(null);
          setIsCorrect(null);
          setSelectedAnswer('');
          setIsSubmitted(false);
          setIsSubmitting(false);
          fetchLeaderboard();
        }, 3000);
      }
    } else if (currentRole === 'moderator' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentQuestion && currentRole === 'moderator') {
      fetchAllQuestionsAnalytics();
      savePreviousQuestionAnalytics(currentQuestion.id, currentQuestion.order, currentQuestion.text, currentQuestion.points);
      setCurrentQuestion(null);
    }
  }, [timeLeft, isSubmitted, currentQuestion, submitAnswer, fetchAllQuestionsAnalytics, savePreviousQuestionAnalytics, selectedAnswer, fetchLeaderboard]);

  const isModerator = userRole === 'moderator';

  const renderAllQuestionsAnalytics = () => {
    if (!allQuestionsAnalytics || allQuestionsAnalytics.length === 0) {
      return null;
    }
    
    return (
      <div className="mt-8 w-full animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-200">
          <svg className="w-6 h-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          Session Analytics
        </h2>
        <div className="bg-[#12121b] rounded-xl border border-gray-700/50 overflow-hidden shadow-xl backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-900/50 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-700/50">
                  <th className="px-6 py-4 font-semibold">Q#</th>
                  <th className="px-6 py-4 font-semibold">Question</th>
                  <th className="px-6 py-4 font-semibold text-center">Points</th>
                  <th className="px-6 py-4 font-semibold text-center">Submitted</th>
                  <th className="px-6 py-4 font-semibold text-center">Pending</th>
                  <th className="px-6 py-4 font-semibold text-right">Avg Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {allQuestionsAnalytics.map((q) => (
                  <tr key={q.questionId} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-emerald-400 font-mono font-bold">#{q.questionOrder}</td>
                    <td className="px-6 py-4 text-gray-200 text-sm truncate max-w-xs">{q.questionText}</td>
                    <td className="px-6 py-4 text-center font-medium text-gray-300">{q.points}</td>
                    <td className="px-6 py-4 text-center text-green-400 font-bold">{q.answeredCount}</td>
                    <td className="px-6 py-4 text-center text-red-400">{q.pendingCount}</td>
                    <td className="px-6 py-4 text-right text-teal-300 font-mono">{q.averageResponseTime.toFixed(1)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderPreviousQuestionAnalytics = () => {
    if (!previousQuestionAnalytics) {
      return null;
    }
    
    return (
      <div className="mt-8 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 rounded-2xl p-6 border border-emerald-500/20 shadow-xl relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
        
        <h3 className="text-xl font-bold mb-6 text-center text-white relative z-10 flex items-center justify-center gap-2">
          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Previous Question Results
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center relative z-10">
          <div className="space-y-1">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Question ID</div>
            <div className="text-lg font-bold text-white font-mono">#{previousQuestionAnalytics.questionOrder}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Max Points</div>
            <div className="text-lg font-bold text-yellow-400">{previousQuestionAnalytics.points}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Total Submitted</div>
            <div className="text-lg font-bold text-green-400">{previousQuestionAnalytics.answeredCount}<span className="text-gray-500 text-base">/{previousQuestionAnalytics.participantCount}</span></div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Correct Answers</div>
            <div className="text-lg font-bold text-emerald-400">{previousQuestionAnalytics.correctCount}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Incorrect</div>
            <div className="text-lg font-bold text-red-400">{previousQuestionAnalytics.wrongCount}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Avg Response Time</div>
            <div className="text-lg font-bold text-teal-400">{previousQuestionAnalytics.averageResponseTime.toFixed(1)}s</div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    return (
      <div className="flex flex-col xl:flex-row gap-8 w-full max-w-[1600px] mx-auto">
        
        {/* LEFT COLUMN: Game Interaction / Leaderboard */}
        <div className="flex-1 space-y-6 min-w-0">
          
          {/* Active Question Card */}
          {currentQuestion && (
            <div className="bg-[#12121b] rounded-2xl border border-emerald-500/30 shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)] overflow-hidden animate-slide-up">
              <div className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 p-4 border-b border-gray-800 flex justify-between items-center">
                <h2 className="font-bold text-emerald-300 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  Question {currentQuestion.order}
                  {isModerator && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full ml-2">Moderator View</span>}
                </h2>
                <div className={`px-4 py-2 rounded-lg font-bold text-lg transition-all ${
                  timeLeft <= 10 
                    ? 'bg-red-500/20 text-red-400 border-2 border-red-500/50 animate-pulse' 
                    : 'bg-teal-500/20 text-teal-400 border-2 border-teal-500/50'
                }`}>
                  {timeLeft}s
                </div>
              </div>

              <div className="p-6">
                {/* Question Image */}
                {currentQuestion.imageUrl && (
                  <div className="mb-8 relative group">
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <img
                      src={currentQuestion.imageUrl}
                      alt="Question Image"
                      className="relative max-h-[400px] w-auto object-cover rounded-xl mx-auto shadow-2xl border border-white/5"
                    />
                  </div>
                )}

                {/* Question Text */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">{currentQuestion.text}</h3>
                </div>

                {isModerator ? (
                  /* Moderator: Show read-only text input preview */
                  <div className="mb-8">
                    <div className="max-w-lg mx-auto">
                      <label className="block text-sm font-medium text-gray-400 mb-2 text-center">Participant Answer Field</label>
                      <div className="w-full p-4 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-gray-500 text-center text-lg">
                        Type your answer...
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Participant: Text Input for Answer */}
                    <div className="mb-8">
                      <div className="max-w-lg mx-auto">
                        <label className="block text-sm font-medium text-gray-400 mb-2 text-center">Type Your Answer</label>
                        <input
                          type="text"
                          value={selectedAnswer}
                          onChange={(e) => !isSubmitted && setSelectedAnswer(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isSubmitted && selectedAnswer.trim()) {
                              submitAnswer();
                            }
                          }}
                          disabled={isSubmitted}
                          placeholder="Type your answer here..."
                          autoFocus
                          className={`w-full p-4 bg-gray-900/50 border-2 rounded-xl text-white text-lg text-center focus:outline-none transition-all ${
                            isSubmitted 
                              ? 'border-gray-700 cursor-not-allowed opacity-60' 
                              : 'border-gray-700 focus:border-emerald-500 focus:shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    {!isSubmitted ? (
                      <button
                        onClick={submitAnswer}
                        disabled={!selectedAnswer.trim()}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-gray-700 disabled:to-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-all transform active:scale-95 shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Submit Answer
                      </button>
                    ) : isSubmitting ? (
                      <div className="text-center py-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
                          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-emerald-300 text-xl font-bold">Checking answer...</p>
                      </div>
                    ) : (
                      <div className="text-center py-6 animate-scale-in">
                        {isCorrect ? (
                          <>
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-full mb-4 shadow-[0_0_30px_-5px_rgba(16,185,129,0.6)]">
                              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <p className="text-emerald-400 text-3xl font-extrabold mb-2">Correct!</p>
                            <div className="flex items-center justify-center gap-2 text-xl text-gray-200 font-medium">
                              <span>+{score}</span>
                              <span className="text-sm text-gray-500">points added</span>
                            </div>
                            <p className="text-gray-400 mt-4 animate-pulse">Updating leaderboard...</p>
                          </>
                        ) : (
                          <>
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500 rounded-full mb-4 shadow-[0_0_30px_-5px_rgba(239,68,68,0.6)]">
                              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </div>
                            <p className="text-red-400 text-3xl font-extrabold mb-2">Incorrect</p>
                            <p className="text-gray-400 mt-4">Better luck next time!</p>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Leaderboard Table & Moderator Views - Hidden during active question */}
          {!currentQuestion && (
            <>
              <div className="bg-[#12121b] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-end bg-gray-900/30">
                  <h2 className="text-2xl font-bold text-white">Live Leaderboard</h2>
                  <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-pulse">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> LIVE
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
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                                    {participant.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-medium text-gray-200">{participant.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 hidden sm:table-cell">
                                {(() => {
                                  const scoreChange = participant.previousScore !== undefined ? participant.score - participant.previousScore : 0;
                                  const hasScoreChange = scoreChange !== 0;
                                  const hasRankChange = rankChange !== 0;
                                  
                                  if (!hasScoreChange && !hasRankChange) {
                                    return <span className="text-gray-600">-</span>;
                                  }
                                  
                                  const scoreSign = scoreChange > 0 ? '+' : '';
                                  const rankSign = rankChange > 0 ? '↑' : '↓';
                                  
                                  let colorClass = 'text-gray-400';
                                  if (rankChange > 0) colorClass = 'text-green-400';
                                  else if (rankChange < 0) colorClass = 'text-red-400';
                                  else if (scoreChange > 0) colorClass = 'text-green-400';
                                  else if (scoreChange < 0) colorClass = 'text-red-400';
                                  
                                  return (
                                    <span className={`text-xs font-bold font-mono ${colorClass}`}>
                                      {scoreSign}{scoreChange}
                                      {hasRankChange && (
                                        <span>({rankSign}{Math.abs(rankChange)})</span>
                                      )}
                                    </span>
                                  );
                                })()}
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

              {/* Moderator Views */}
              {isModerator && renderPreviousQuestionAnalytics()}
              {isModerator && renderAllQuestionsAnalytics()}
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading && participants.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-400 text-lg font-medium animate-pulse">Connecting to TypeIt Server...</p>
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
          <h3 className="text-lg font-semibold text-red-400 mb-2">Connection Error</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 p-4 sm:p-6 lg:p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-10 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl max-h-24 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-emerald-600/20 blur-3xl rounded-full -z-10"></div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
            TypeIt Leaderboard
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-medium tracking-wider uppercase">Real-Time Rankings</p>
        </header>
        
        {renderContent()}
      </div>
    </div>
  );
}

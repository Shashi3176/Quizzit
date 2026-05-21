'use client';

import { useEffect, useState } from 'react';

interface Answer {
  question: string;
  yourAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  score: number;
}

interface GuessItAnswer extends Answer {
  guessNumber: number;
  hintsRevealed: number;
}

interface QuizPerformance {
  type: 'quiz';
  quizRoomId: number;
  quizRoomName: string;
  finalScore: number;
  finalRank: number | null;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageResponseTime: number;
  answers: Answer[];
}

interface GuessItPerformance {
  type: 'guessIt';
  guessItRoomId: number;
  guessItRoomName: string;
  finalScore: number;
  finalRank: number | null;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  answers: GuessItAnswer[];
}

interface PerformanceData {
  user: { username: string; email: string };
  quizzes: QuizPerformance[];
  guessItRooms: GuessItPerformance[];
}

type ExpandedKey = { type: 'quiz'; id: number } | { type: 'guessIt'; id: number } | null;

export default function PerformanceCard() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [expanded, setExpanded] = useState<ExpandedKey>(null);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
      });
  }, []);

  if (!data) {
    return (
      <div className="min-h-[40vh] w-full flex items-center justify-center bg-gray-950 text-white">
        <div className="w-full max-w-2xl p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-white/10 rounded w-48 mb-4" />
            <div className="h-10 bg-white/10 rounded w-72 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-28 bg-white/10 rounded" />
              <div className="h-28 bg-white/10 rounded" />
              <div className="h-28 bg-white/10 rounded" />
            </div>
          </div>
          <p className="mt-6 text-sm text-white/70">Loading performance...</p>
        </div>
      </div>
    );
  }

  const hasQuizzes = (data.quizzes?.length ?? 0) > 0;
  const hasGuessIt = (data.guessItRooms?.length ?? 0) > 0;
  const totalAttempted = (data.quizzes?.length ?? 0) + (data.guessItRooms?.length ?? 0);

  if (totalAttempted === 0) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-gray-950 to-gray-950 text-white">
        <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-2xl font-bold text-indigo-300">
              {data.user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {data.user.username}
              </h1>
              <p className="text-sm text-white/60">{data.user.email}</p>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Performance <span className="text-indigo-300">Card</span>
          </h2>
          <p className="mt-6 text-white/70">You have not attempted any quizzes yet.</p>
        </div>
      </div>
    );
  }

  // Find selected item
  let selectedQuiz: QuizPerformance | null = null;
  let selectedGuessIt: GuessItPerformance | null = null;
  if (expanded?.type === 'quiz') {
    selectedQuiz = data.quizzes.find((q) => q.quizRoomId === expanded.id) ?? null;
  } else if (expanded?.type === 'guessIt') {
    selectedGuessIt = data.guessItRooms.find((g) => g.guessItRoomId === expanded.id) ?? null;
  }

  const toggleExpand = (key: ExpandedKey) => {
    if (key && expanded?.type === key.type && expanded.id === key.id) {
      setExpanded(null);
    } else {
      setExpanded(key);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-gray-950 to-gray-950 text-white">
      {/* Decorative glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute top-1/3 -left-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute bottom-0 -right-24 h-72 w-72 rounded-full bg-yellow-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-2xl font-bold text-indigo-300">
              {data.user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {data.user.username}
              </h1>
              <p className="text-sm text-white/60">{data.user.email}</p>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Performance <span className="text-indigo-300">Card</span>
          </h2>
          <p className="mt-2 text-sm sm:text-base text-white/70">
            {totalAttempted} quiz{totalAttempted !== 1 ? 'es' : ''} attempted
          </p>
        </div>

        {/* Quiz Rooms */}
        {hasQuizzes && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-white/90">Quiz Rooms</h2>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-3 py-3 text-xs sm:text-sm font-semibold text-white/70">#</th>
                      <th className="px-3 py-3 text-xs sm:text-sm font-semibold text-white/70">Quiz</th>
                      <th className="px-3 py-3 text-xs sm:text-sm font-semibold text-white/70">Score</th>
                      <th className="px-3 py-3 text-xs sm:text-sm font-semibold text-white/70">Rank</th>
                      <th className="px-3 py-3 text-xs sm:text-sm font-semibold text-white/70">Correct</th>
                      <th className="px-3 py-3 text-xs sm:text-sm font-semibold text-white/70 hidden sm:table-cell">Accuracy</th>
                      <th className="px-3 py-3 text-xs sm:text-sm font-semibold text-white/70 hidden md:table-cell">Avg Time</th>
                      <th className="px-3 py-3 text-xs sm:text-sm font-semibold text-white/70"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.quizzes.map((quiz, idx) => (
                      <tr
                        key={`quiz-${quiz.quizRoomId}`}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-3 py-3 text-xs sm:text-sm text-white/60">{idx + 1}</td>
                        <td className="px-3 py-3 text-xs sm:text-sm font-semibold text-white/95">{quiz.quizRoomName}</td>
                        <td className="px-3 py-3 text-xs sm:text-sm font-bold text-yellow-300">{quiz.finalScore}</td>
                        <td className="px-3 py-3 text-xs sm:text-sm font-bold">
                          {quiz.finalRank === null ? '—' : `#${quiz.finalRank}`}
                        </td>
                        <td className="px-3 py-3 text-xs sm:text-sm text-emerald-300">
                          {quiz.correctAnswers}/{quiz.totalQuestions}
                        </td>
                        <td className="px-3 py-3 text-xs sm:text-sm text-white/80 hidden sm:table-cell">
                          {quiz.totalQuestions > 0
                            ? `${Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100)}%`
                            : '—'}
                        </td>
                        <td className="px-3 py-3 text-xs sm:text-sm text-emerald-300 hidden md:table-cell">
                          {quiz.averageResponseTime.toFixed(2)}s
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => toggleExpand({ type: 'quiz', id: quiz.quizRoomId })}
                            className="text-xs text-indigo-300 hover:text-indigo-200 transition-colors"
                          >
                            {expanded?.type === 'quiz' && expanded.id === quiz.quizRoomId ? 'Hide' : 'Details'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Guess It Rooms */}
        {hasGuessIt && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-white/90">Guess It Rooms</h2>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-3 py-3 text-xs sm:text-sm font-semibold text-white/70">#</th>
                      <th className="px-3 py-3 text-xs sm:text-sm font-semibold text-white/70">Room</th>
                      <th className="px-3 py-3 text-xs sm:text-sm font-semibold text-white/70">Score</th>
                      <th className="px-3 py-3 text-xs sm:text-sm font-semibold text-white/70">Rank</th>
                      <th className="px-3 py-3 text-xs sm:text-sm font-semibold text-white/70">Correct</th>
                      <th className="px-3 py-3 text-xs sm:text-sm font-semibold text-white/70 hidden sm:table-cell">Accuracy</th>
                      <th className="px-3 py-3 text-xs sm:text-sm font-semibold text-white/70"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.guessItRooms.map((room, idx) => (
                      <tr
                        key={`guessit-${room.guessItRoomId}`}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-3 py-3 text-xs sm:text-sm text-white/60">{idx + 1}</td>
                        <td className="px-3 py-3 text-xs sm:text-sm font-semibold text-white/95">{room.guessItRoomName}</td>
                        <td className="px-3 py-3 text-xs sm:text-sm font-bold text-yellow-300">{room.finalScore}</td>
                        <td className="px-3 py-3 text-xs sm:text-sm font-bold">
                          {room.finalRank === null ? '—' : `#${room.finalRank}`}
                        </td>
                        <td className="px-3 py-3 text-xs sm:text-sm text-emerald-300">
                          {room.correctAnswers}/{room.totalQuestions}
                        </td>
                        <td className="px-3 py-3 text-xs sm:text-sm text-white/80 hidden sm:table-cell">
                          {room.totalQuestions > 0
                            ? `${Math.round((room.correctAnswers / room.totalQuestions) * 100)}%`
                            : '—'}
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => toggleExpand({ type: 'guessIt', id: room.guessItRoomId })}
                            className="text-xs text-indigo-300 hover:text-indigo-200 transition-colors"
                          >
                            {expanded?.type === 'guessIt' && expanded.id === room.guessItRoomId ? 'Hide' : 'Details'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Expanded Quiz Detail */}
        {selectedQuiz && (
          <QuizDetail quiz={selectedQuiz} />
        )}

        {/* Expanded Guess It Detail */}
        {selectedGuessIt && (
          <GuessItDetail room={selectedGuessIt} />
        )}
      </div>
    </div>
  );
}

function QuizDetail({ quiz }: { quiz: QuizPerformance }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-white/90">{quiz.quizRoomName}</h2>
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 mb-6 sm:mb-8">
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <p className="text-sm font-semibold text-white/70">Final Score</p>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-yellow-300">
              {quiz.finalScore}
            </p>
            <div className="mt-3 h-[1px] w-full bg-white/10" />
            <p className="mt-3 text-xs text-white/60">Total points earned</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <p className="text-sm font-semibold text-white/70">Final Rank</p>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold">
              {quiz.finalRank === null ? '—' : `#${quiz.finalRank}`}
            </p>
            <div className="mt-3 h-[1px] w-full bg-white/10" />
            <p className="mt-3 text-xs text-white/60">Based on performance</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <p className="text-sm font-semibold text-white/70">Avg. Response Time</p>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-emerald-300">
              {quiz.averageResponseTime?.toFixed(2)}s
            </p>
            <div className="mt-3 h-[1px] w-full bg-white/10" />
            <p className="mt-3 text-xs text-white/60">Lower is better</p>
          </div>
        </div>
      </div>

      {/* Summary + Answers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <h3 className="text-lg sm:text-xl font-bold mb-3">Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            <p className="text-sm text-white/70">Total Questions</p>
            <p className="text-sm font-bold text-white">{quiz.totalQuestions}</p>

            <p className="text-sm text-white/70">Answered</p>
            <p className="text-sm font-bold text-white">{quiz.answeredQuestions}</p>

            <p className="text-sm text-white/70">Correct</p>
            <p className="text-sm font-bold text-emerald-300">{quiz.correctAnswers}</p>

            <p className="text-sm text-white/70">Incorrect</p>
            <p className="text-sm font-bold text-rose-300">{quiz.incorrectAnswers}</p>
          </div>

          <div className="mt-5 h-[1px] w-full bg-white/10" />

          <div className="mt-5">
            <p className="text-xs text-white/60">Accuracy</p>
            <p className="mt-1 text-sm font-semibold text-white/90">
              {quiz.totalQuestions > 0
                ? `${Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100)}%`
                : '—'}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold">Your Answers</h3>
              <p className="mt-1 text-sm text-white/70">
                Review question-by-question correctness and scoring.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-white/80">Correct: {quiz.correctAnswers}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="text-xs text-white/80">Incorrect: {quiz.incorrectAnswers}</span>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <ul className="space-y-4">
              {quiz.answers?.map((answer, index) => (
                <AnswerCard key={index} answer={answer} index={index} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function GuessItDetail({ room }: { room: GuessItPerformance }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-white/90">{room.guessItRoomName}</h2>
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 mb-6 sm:mb-8">
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <p className="text-sm font-semibold text-white/70">Final Score</p>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-yellow-300">
              {room.finalScore}
            </p>
            <div className="mt-3 h-[1px] w-full bg-white/10" />
            <p className="mt-3 text-xs text-white/60">Total points earned</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <p className="text-sm font-semibold text-white/70">Final Rank</p>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold">
              {room.finalRank === null ? '—' : `#${room.finalRank}`}
            </p>
            <div className="mt-3 h-[1px] w-full bg-white/10" />
            <p className="mt-3 text-xs text-white/60">Based on performance</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <p className="text-sm font-semibold text-white/70">Accuracy</p>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-emerald-300">
              {room.totalQuestions > 0
                ? `${Math.round((room.correctAnswers / room.totalQuestions) * 100)}%`
                : '—'}
            </p>
            <div className="mt-3 h-[1px] w-full bg-white/10" />
            <p className="mt-3 text-xs text-white/60">{room.correctAnswers}/{room.totalQuestions} correct</p>
          </div>
        </div>
      </div>

      {/* Summary + Answers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <h3 className="text-lg sm:text-xl font-bold mb-3">Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            <p className="text-sm text-white/70">Total Questions</p>
            <p className="text-sm font-bold text-white">{room.totalQuestions}</p>

            <p className="text-sm text-white/70">Answered</p>
            <p className="text-sm font-bold text-white">{room.answeredQuestions}</p>

            <p className="text-sm text-white/70">Correct</p>
            <p className="text-sm font-bold text-emerald-300">{room.correctAnswers}</p>

            <p className="text-sm text-white/70">Incorrect</p>
            <p className="text-sm font-bold text-rose-300">{room.incorrectAnswers}</p>
          </div>

          <div className="mt-5 h-[1px] w-full bg-white/10" />

          <div className="mt-5">
            <p className="text-xs text-white/60">Accuracy</p>
            <p className="mt-1 text-sm font-semibold text-white/90">
              {room.totalQuestions > 0
                ? `${Math.round((room.correctAnswers / room.totalQuestions) * 100)}%`
                : '—'}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold">Your Guesses</h3>
              <p className="mt-1 text-sm text-white/70">
                Review each guess with hints used and attempt number.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-white/80">Correct: {room.correctAnswers}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="text-xs text-white/80">Incorrect: {room.incorrectAnswers}</span>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <ul className="space-y-4">
              {room.answers?.map((answer, index) => (
                <li
                  key={index}
                  className={[
                    'relative overflow-hidden rounded-2xl border p-4 sm:p-5',
                    answer.isCorrect
                      ? 'border-emerald-500/25 bg-emerald-500/10'
                      : 'border-rose-500/25 bg-rose-500/10',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'absolute inset-0 opacity-0',
                      answer.isCorrect
                        ? 'bg-gradient-to-r from-emerald-400/20 to-transparent'
                        : 'bg-gradient-to-r from-rose-400/20 to-transparent',
                      'transition-opacity duration-300 hover:opacity-100',
                    ].join(' ')}
                    aria-hidden="true"
                  />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span
                          className={[
                            'inline-flex items-center justify-center rounded-full h-8 w-8',
                            answer.isCorrect ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-200 border border-rose-500/30',
                          ].join(' ')}
                          aria-hidden="true"
                        >
                          {answer.isCorrect ? '✓' : '✕'}
                        </span>
                        <p className="font-bold break-words text-white/95">{answer.question}</p>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <p className="text-xs font-semibold text-white/60">Your Guess</p>
                          <p className="mt-1 font-medium break-words text-white/90">
                            {answer.yourAnswer}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <p className="text-xs font-semibold text-white/60">Acceptable Answer(s)</p>
                          <p className="mt-1 font-medium break-words text-white/90">
                            {answer.correctAnswer}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="text-xs text-white/60">Score</span>
                        <span
                          className={[
                            'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                            answer.isCorrect
                              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-200 border border-rose-500/30',
                          ].join(' ')}
                        >
                          {answer.score}
                        </span>
                        <span className="text-xs text-white/50">Guess #{answer.guessNumber}</span>
                        <span className="text-xs text-white/50">Hints used: {answer.hintsRevealed}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                        Q{index + 1}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnswerCard({ answer, index }: { answer: Answer; index: number }) {
  return (
    <li
      className={[
        'relative overflow-hidden rounded-2xl border p-4 sm:p-5',
        answer.isCorrect
          ? 'border-emerald-500/25 bg-emerald-500/10'
          : 'border-rose-500/25 bg-rose-500/10',
      ].join(' ')}
    >
      <div
        className={[
          'absolute inset-0 opacity-0',
          answer.isCorrect
            ? 'bg-gradient-to-r from-emerald-400/20 to-transparent'
            : 'bg-gradient-to-r from-rose-400/20 to-transparent',
          'transition-opacity duration-300 hover:opacity-100',
        ].join(' ')}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span
              className={[
                'inline-flex items-center justify-center rounded-full h-8 w-8',
                answer.isCorrect ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-200 border border-rose-500/30',
              ].join(' ')}
              aria-hidden="true"
            >
              {answer.isCorrect ? '✓' : '✕'}
            </span>
            <p className="font-bold break-words text-white/95">{answer.question}</p>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs font-semibold text-white/60">Your Answer</p>
              <p className="mt-1 font-medium break-words text-white/90">
                {JSON.stringify(answer.yourAnswer)}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs font-semibold text-white/60">Correct Answer</p>
              <p className="mt-1 font-medium break-words text-white/90">
                {JSON.stringify(answer.correctAnswer)}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-white/60">Score</span>
            <span
              className={[
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                answer.isCorrect
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-200 border border-rose-500/30',
              ].join(' ')}
            >
              {answer.score}
            </span>
            <span className="text-xs text-white/60">
              ({answer.isCorrect ? 'Correct' : 'Incorrect'})
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            Q{index + 1}
          </div>
        </div>
      </div>
    </li>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';

interface Question {
  id: number;
  text: string;
  options: string[];
  timeLimit: number;
}

export default function QuestionPage() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const params = useParams();
  const router = useRouter();
  const { id: roomId, questionId } = params;

  useEffect(() => {
    if (roomId && questionId) {
      fetch(`/api/quiz-room/${roomId}/questions/${questionId}`)
        .then((res) => res.json())
        .then((data) => {
          setQuestion(data);
          setTimeLeft(data.timeLimit);
        })
        .catch(() => {
          setError('Failed to load question.');
          toast.error('Failed to load question');
        });
    }
  }, [roomId, questionId]);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted && question) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted, question]);

  const handleSubmit = async () => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    try {
      const response = await fetch(
        `/api/quiz-room/${roomId}/questions/${questionId}/answer`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            answer: selectedAnswer || '', 
            responseTime: question?.timeLimit! - timeLeft 
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setIsCorrect(result.isCorrect);
        setScore(result.score);
        
        if (result.isCorrect) {
          toast.success(`Correct! +${result.score} pts`);
        } else {
          toast.error('Incorrect answer');
        }

        setTimeout(() => {
          router.push(`/quiz-room/${roomId}/leaderboard`);
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit answer.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
          <p className="text-red-400 font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-sm underline opacity-70">Try Again</button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500/30 overflow-hidden relative">
      <Toaster 
        toastOptions={{
          style: { background: '#12121b', color: '#fff', border: '1px solid rgba(139, 92, 246, 0.2)' },
        }}
      />

      {/* Aesthetic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-purple-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 max-w-4xl mx-auto">
        
        {/* Timer & Progress Header */}
        <div className="w-full mb-12 flex items-center justify-between bg-[#12121b] p-6 rounded-2xl border border-gray-800/50 shadow-xl">
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Time Remaining</span>
            <span className={`text-3xl font-mono font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
              {timeLeft}s
            </span>
          </div>
          <div className="h-12 w-12 rounded-full border-2 border-gray-800 flex items-center justify-center relative">
             <div 
              className="absolute inset-0 rounded-full border-2 border-purple-500 transition-all duration-1000"
              style={{ clipPath: `inset(${100 - (timeLeft / question.timeLimit) * 100}% 0 0 0)` }}
             ></div>
             <span className="text-xs font-bold text-purple-400">Q</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent leading-tight">
              {question.text}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options?.map((option, index) => (
              <button
                key={index}
                disabled={isSubmitted}
                onClick={() => setSelectedAnswer(option)}
                className={`group relative p-6 text-left rounded-xl border-2 transition-all duration-300 ${
                  selectedAnswer === option 
                    ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20' 
                    : 'border-gray-800 bg-[#12121b] hover:border-gray-600'
                } ${isSubmitted ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}`}
              >
                <div className="flex items-center gap-4">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                    selectedAnswer === option ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className={`text-lg font-medium ${selectedAnswer === option ? 'text-white' : 'text-gray-300'}`}>
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-8">
            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className="w-full group relative px-8 py-5 font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 text-lg shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 hover:scale-[1.01] active:scale-95"
              >
                Submit Answer
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity -z-10"></div>
              </button>
            ) : (
              <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className={`inline-block px-8 py-4 rounded-2xl border ${
                  isCorrect 
                    ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                    : 'bg-red-500/10 border-red-500/50 text-red-400'
                }`}>
                  <p className="text-2xl font-bold mb-1">
                    {isCorrect ? '✨ Brilliant!' : 'Better luck next time!'}
                  </p>
                  <p className="text-sm opacity-80">
                    {isCorrect ? `You earned ${score} points` : 'Redirecting to leaderboard...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Question {
  id: number;
  text: string;
  order: number;
  imageUrl?: string;
}

export default function ManageThe100QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { id: roomId } = params;

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/the-100/${roomId}/questions`);
      if (!res.ok) throw new Error(`Failed to fetch questions: ${res.status}`);
      const data = await res.json();
      setQuestions(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) {
      fetchQuestions();
      fetch(`/api/the-100/${roomId}`)
        .then(res => res.json())
        .then(data => {
          if (data.isLocked !== undefined) setIsRoomLocked(data.isLocked);
        })
        .catch(err => console.error(err));
    }
  }, [roomId, fetchQuestions]);

  const handleCreateQuestion = () => {
    if (isRoomLocked) {
      alert('Cannot create questions in a locked room.');
      return;
    }
    router.push(`/the-100/${roomId}/questions/create`);
  };

  const handleDeleteQuestion = async (questionOrder: number) => {
    if (isRoomLocked) {
      alert('Cannot delete questions in a locked room.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const res = await fetch(`/api/the-100/${roomId}/questions/${questionOrder}`, { method: 'DELETE' });
        if (res.ok) fetchQuestions();
        else {
          const data = await res.json();
          setError(data.error || 'Failed to delete question');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-400 text-lg font-medium animate-pulse">Loading Questions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 p-4 sm:p-6 lg:p-8 font-sans selection:bg-orange-500/30">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-10 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl max-h-24 bg-gradient-to-r from-orange-600/20 via-red-600/20 to-orange-600/20 blur-3xl rounded-full -z-10"></div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
            Manage Questions
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-medium tracking-wider uppercase">
            {isRoomLocked ? (
              <span className="inline-flex items-center gap-2 text-yellow-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Room is Locked
              </span>
            ) : 'Create, Edit & Delete Questions'}
          </p>
        </header>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <button
            onClick={() => router.push(`/the-100/${roomId}`)}
            className="group flex items-center gap-2 px-4 py-2.5 bg-[#12121b] hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white font-medium rounded-xl transition-all duration-200"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to The-100 Room
          </button>
          
          <button
            onClick={handleCreateQuestion}
            disabled={isRoomLocked}
            className={`inline-flex items-center gap-2 font-bold py-3 px-6 rounded-xl transition-all transform active:scale-95 shadow-lg ${
              isRoomLocked 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-green-500/20'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Question
          </button>
        </div>

        <div className="bg-[#12121b] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-800 bg-gray-900/30">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Questions
              <span className="ml-auto text-sm font-normal text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                {questions.length} Total
              </span>
            </h2>
          </div>

          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {questions.length > 0 ? (
              questions.map((question) => (
                <div 
                  key={question.id} 
                  className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-orange-500/30 transition-all duration-300"
                >
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                          {question.order}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-200 text-lg leading-relaxed group-hover:text-white transition-colors">
                            {question.text}
                          </p>
                          {question.imageUrl && (
                            <img src={question.imageUrl} alt="Question" className="mt-2 max-h-24 rounded-lg border border-gray-700/50" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button 
                          onClick={() => handleDeleteQuestion(question.order)} 
                          disabled={isRoomLocked}
                          className={`inline-flex items-center gap-1.5 text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-200 ${
                            isRoomLocked
                              ? 'bg-gray-700/50 border border-gray-600/30 text-gray-500 cursor-not-allowed'
                              : 'bg-red-600/20 hover:bg-red-600 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
                  <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 font-medium text-lg mb-2">No questions in this The-100 room yet.</p>
                <p className="text-gray-600 text-sm">Click &quot;Create Question&quot; to add your first question!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

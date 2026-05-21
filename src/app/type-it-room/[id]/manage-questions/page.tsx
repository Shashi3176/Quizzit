'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Question {
  id: number;
  text: string;
  order: number;
}

interface User {
    id: string;
    name: string;
}

interface TypeItRoom {
    isLocked: boolean;
}

export default function ManageQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const params = useParams();
  const router = useRouter();
  const { id: roomId } = params;

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/type-it-room/${roomId}/questions`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch questions: ${res.status} ${errorText}`);
      }
      const data = await res.json();
      setQuestions(data);
      setError(null);
    } catch (err) {
        console.error('[ManageQuestions] fetchQuestions error:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
      setAuthStatus('unauthenticated');
    }, 10000);
    
    if (roomId) {
      fetchQuestions();
      
      fetch(`/api/type-it-room/${roomId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Room details fetch failed with status ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          if (data.isLocked !== undefined) {
            setIsRoomLocked(data.isLocked);
          }
        })
        .catch(err => console.error('[ManageQuestions] Room details fetch error:', err));
    }
    
    fetch('/api/auth/verifyToken')
      .then(res => {
        if (!res.ok) {
          setAuthStatus('unauthenticated');
          return null;
        }
        setAuthStatus('authenticated');
        return res.json();
      })
      .then(data => {
        if (!data) {
          return;
        }
        if (data.data && data.data.decoded) {
            setUser(data.data.decoded);
        }
      })
      .catch(err => {
        console.error('[ManageQuestions] Auth verify fetch error:', err);
        setAuthStatus('unauthenticated');
      })
      .finally(() => {
        clearTimeout(loadingTimeout);
      });
  }, [roomId, fetchQuestions]);

  const handleCreateQuestion = () => {
    if (isRoomLocked) {
      alert('Cannot create questions in a locked room.');
      return;
    }
    router.push(`/type-it-room/${roomId}/questions/create`);
  };

  const handleViewQuestion = (questionOrder: number) => {
    router.push(`/type-it-room/${roomId}/questions/${questionOrder}`);
  };

  const handleUpdateQuestion = (questionOrder: number) => {
    if (isRoomLocked) {
      alert('Cannot update questions in a locked room.');
      return;
    }
    router.push(`/type-it-room/${roomId}/questions/update/${questionOrder}`);
  };

  const handleDeleteQuestion = async (questionOrder: number) => {
    if (isRoomLocked) {
      alert('Cannot delete questions in a locked room.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this question?')) {
        try {
            const res = await fetch(`/api/type-it-room/${roomId}/questions/${questionOrder}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchQuestions();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to delete question');
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        }
    }
  };

  if (authStatus === 'checking' || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-400 text-lg font-medium animate-pulse">Loading Questions...</p>
      </div>
    );
  }
  
  if (error) {
    if (questions.length > 0) {
    } else {
      return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
          <div className="bg-[#12121b] border border-red-500/30 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl shadow-red-500/10">
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Questions</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">Try Again</button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 p-4 sm:p-6 lg:p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="mb-10 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl max-h-24 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-emerald-600/20 blur-3xl rounded-full -z-10"></div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
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
            ) : (
              'Create, Edit & Delete Questions'
            )}
          </p>
        </header>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <button
            onClick={() => router.push(`/type-it-room/${roomId}`)}
            className="group flex items-center gap-2 px-4 py-2.5 bg-[#12121b] hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white font-medium rounded-xl transition-all duration-200"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to TypeIt Room
          </button>
          
          {user && (
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
          )}
        </div>

        {/* Questions List */}
        <div className="bg-[#12121b] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-800 bg-gray-900/30">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                  className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-emerald-500/30 transition-all duration-300"
                >
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Question Content */}
                      <div 
                        onClick={() => handleViewQuestion(question.order)} 
                        className="flex items-start gap-4 flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                          {question.order}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-200 text-lg leading-relaxed group-hover:text-white transition-colors">
                            {question.text}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">Click to view details</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {user && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button 
                            onClick={() => handleViewQuestion(question.order)} 
                            className="inline-flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 hover:text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          <button 
                            onClick={() => handleUpdateQuestion(question.order)} 
                            disabled={isRoomLocked}
                            className={`inline-flex items-center gap-1.5 text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-200 ${
                              isRoomLocked
                                ? 'bg-gray-700/50 border border-gray-600/30 text-gray-500 cursor-not-allowed'
                                : 'bg-yellow-600/20 hover:bg-yellow-600 border border-yellow-500/30 hover:border-yellow-500 text-yellow-400 hover:text-white'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Update
                          </button>
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
                      )}
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
                <p className="text-gray-400 font-medium text-lg mb-2">No questions in this type-it room yet.</p>
                <p className="text-gray-600 text-sm">Click "Create Question" to add your first question!</p>
                {user && !isRoomLocked && (
                  <button
                    onClick={handleCreateQuestion}
                    className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-emerald-500/20"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Your First Question
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Toast */}
        {error && questions.length > 0 && (
          <div className="fixed bottom-6 right-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 shadow-2xl backdrop-blur-sm max-w-sm animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-400">Warning</p>
                <p className="text-xs text-gray-400 mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

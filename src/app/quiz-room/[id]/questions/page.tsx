'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';

// Define the types for our data
interface Question {
  id: number;
  text: string;
  order: number;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const { id: roomId } = params;

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/quiz-room/${roomId}/questions`);
      if (!res.ok) throw new Error('Failed to fetch questions');
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) {
      fetchQuestions();
    }
  }, [roomId, fetchQuestions]);

  const handleCreateQuestion = () => {
    router.push(`/quiz-room/${roomId}/questions/create`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500/30 relative overflow-hidden">
      <Toaster 
        toastOptions={{
          style: { background: '#12121b', color: '#fff', border: '1px solid rgba(139, 92, 246, 0.2)' },
        }}
      />

      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-3">
              <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Admin Dashboard</span>
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
              Manage Questions
            </h1>
            <p className="text-gray-500 mt-2">Create and organize questions for Room ID: <span className="text-purple-400 font-mono">{roomId}</span></p>
          </div>

          <button
            onClick={handleCreateQuestion}
            className="group relative px-6 py-3 font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-500 hover:to-emerald-500 transition-all duration-300 shadow-lg shadow-green-500/20 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Question
            <div className="absolute inset-0 bg-green-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>

        {/* Content Section */}
        {error ? (
          <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
            <p className="text-red-400 font-medium">{error}</p>
            <button onClick={fetchQuestions} className="mt-4 text-sm underline opacity-70 hover:opacity-100 transition-opacity">Retry Connection</button>
          </div>
        ) : (
          <div className="grid gap-4">
            {questions.length > 0 ? (
              questions.map((question, index) => (
                <div 
                  key={question.id} 
                  className="group relative bg-[#12121b] p-6 rounded-2xl border border-gray-800/50 hover:border-purple-500/30 transition-all duration-300 shadow-sm hover:shadow-purple-500/10"
                >
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center font-mono text-purple-400 font-bold group-hover:border-purple-500/50 group-hover:bg-purple-500/10 transition-colors">
                      {question.order || index + 1}
                    </div>
                    <div className="flex-grow">
                      <p className="text-lg text-gray-200 group-hover:text-white transition-colors leading-relaxed">
                        {question.text}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {/* Subtle decorative glow line on hover */}
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-purple-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 rounded-full"></div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-[#12121b]/50 rounded-3xl border-2 border-dashed border-gray-800">
                <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-600">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-400">No questions yet</h3>
                <p className="text-gray-600 mt-1 max-w-xs mx-auto">Get started by creating your first question for this room.</p>
                <button 
                  onClick={handleCreateQuestion}
                  className="mt-6 text-purple-400 font-bold hover:text-purple-300 transition-colors inline-flex items-center gap-2"
                >
                  Add one now <span className="text-lg">→</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';

export default function CreateThe100QuestionPage() {
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('text', text);
      if (image) {
        formData.append('image', image);
      }

      const res = await fetch(`/api/the-100/${roomId}/questions`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        toast.success('Question created successfully!');
        router.push(`/the-100/${roomId}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create question');
        toast.error(data.error || 'Creation failed');
      }
    } catch (err) {
      setError('An error occurred while creating the question');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-orange-500/30 py-12 px-4 relative overflow-x-hidden">
      <Toaster 
        toastOptions={{
          style: { background: '#12121b', color: '#fff', border: '1px solid rgba(249, 115, 22, 0.2)' },
        }} 
      />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-orange-500/15 via-red-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto">
        <button
          onClick={() => router.push(`/the-100/${roomId}`)}
          className="group flex items-center gap-2 text-gray-500 hover:text-white transition-all mb-8"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-widest">Back to Room</span>
        </button>

        <div className="bg-[#12121b]/80 border border-gray-800/50 rounded-[2rem] shadow-2xl backdrop-blur-md overflow-hidden">
          <div className="p-8 border-b border-gray-800/50 text-center">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
              Create The-100 Question
            </h1>
            <p className="text-gray-500 text-sm mt-2 uppercase tracking-widest font-medium">Add a question for participants to answer</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            <div className="space-y-3">
              <label htmlFor="text" className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Question Text
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-[#0a0a0f] text-gray-200 border border-gray-800 rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all placeholder-gray-700 resize-none"
                rows={4}
                required
                placeholder="Enter your question here..."
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Visual Aid (Optional)</label>
              <div className="relative group border-2 border-dashed border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-orange-500/50 transition-all bg-[#0a0a0f]/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <svg className="w-10 h-10 text-gray-700 mb-3 group-hover:text-orange-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-500 font-medium">
                  {image ? <span className="text-orange-400">{image.name}</span> : "Drop image or click to browse"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push(`/the-100/${roomId}`)}
                className="flex-1 bg-gray-800/50 hover:bg-gray-800 text-gray-300 font-bold py-4 px-6 rounded-2xl border border-gray-700/30 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] group relative flex items-center justify-center px-6 py-4 font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl hover:from-orange-500 hover:to-red-500 transition-all shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-95"
              >
                {loading ? (
                   <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : 'Create Question'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

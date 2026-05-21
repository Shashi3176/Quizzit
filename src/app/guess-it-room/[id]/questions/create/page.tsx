'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';

export default function CreateGuessItQuestionPage() {
  const [text, setText] = useState('');
  const [hints, setHints] = useState<string[]>(['']);
  const [basePoints, setBasePoints] = useState(50);
  const [hintDeduction, setHintDeduction] = useState(10);
  const [guessBonus, setGuessBonus] = useState<number[]>([30, 20, 10]);
  const [acceptableAnswers, setAcceptableAnswers] = useState<string[]>(['']);
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const addHint = () => {
    if (hints.length < 5) {
      setHints([...hints, '']);
    }
  };

  const removeHint = (index: number) => {
    if (hints.length > 1) {
      setHints(hints.filter((_, i) => i !== index));
    }
  };

  const updateHint = (index: number, value: string) => {
    const newHints = [...hints];
    newHints[index] = value;
    setHints(newHints);
  };

  const addAnswer = () => {
    setAcceptableAnswers([...acceptableAnswers, '']);
  };

  const removeAnswer = (index: number) => {
    if (acceptableAnswers.length > 1) {
      setAcceptableAnswers(acceptableAnswers.filter((_, i) => i !== index));
    }
  };

  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...acceptableAnswers];
    newAnswers[index] = value;
    setAcceptableAnswers(newAnswers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('hints', JSON.stringify(hints.filter(h => h.trim())));
      formData.append('acceptableAnswers', JSON.stringify(acceptableAnswers.filter(a => a.trim())));
      if (image) {
        formData.append('image', image);
      }

      const res = await fetch(`/api/guess-it-room/${roomId}/questions`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        toast.success('Question created successfully!');
        router.push(`/guess-it-room/${roomId}`);
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
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500/30 py-12 px-4 relative overflow-x-hidden">
      <Toaster 
        toastOptions={{
          style: { background: '#12121b', color: '#fff', border: '1px solid rgba(139, 92, 246, 0.2)' },
        }} 
      />

      {/* Background Decorative Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-purple-500/15 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Navigation */}
        <button
          onClick={() => router.push(`/guess-it-room/${roomId}`)}
          className="group flex items-center gap-2 text-gray-500 hover:text-white transition-all mb-8"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-widest">Back to Room</span>
        </button>

        <div className="bg-[#12121b]/80 border border-gray-800/50 rounded-[2rem] shadow-2xl backdrop-blur-md overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-gray-800/50 text-center">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Create Guess-It Challenge
            </h1>
            <p className="text-gray-500 text-sm mt-2 uppercase tracking-widest font-medium">Configure hints and acceptable answers</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            {/* Question Text */}
            <div className="space-y-3">
              <label htmlFor="text" className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                The Riddle / Question
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-[#0a0a0f] text-gray-200 border border-gray-800 rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all placeholder-gray-700 resize-none"
                rows={3}
                required
                placeholder="I have keys but no locks..."
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Visual Aid (Optional)</label>
              <div className="relative group border-2 border-dashed border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-blue-500/50 transition-all bg-[#0a0a0f]/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <svg className="w-10 h-10 text-gray-700 mb-3 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-500 font-medium">
                  {image ? <span className="text-blue-400">{image.name}</span> : "Drop challenge image or click to browse"}
                </span>
              </div>
            </div>

            {/* Hints Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Hints Sequence <span className="text-purple-500 font-mono ml-2">(Max 5)</span>
                </label>
                {hints.length < 5 && (
                  <button
                    type="button"
                    onClick={addHint}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    ADD HINT
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {hints.map((hint, index) => (
                  <div key={index} className="flex gap-3 items-center animate-in slide-in-from-left-2 duration-300">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xs font-mono font-bold text-purple-400">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={hint}
                      onChange={(e) => updateHint(index, e.target.value)}
                      placeholder={`Enter clue #${index + 1}`}
                      className="flex-1 bg-[#0a0a0f] text-gray-200 border border-gray-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => removeHint(index)}
                      className="p-3 text-gray-600 hover:text-red-500 transition-colors disabled:opacity-0"
                      disabled={hints.length <= 1}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Acceptable Answers */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Target Answers</label>
                <button
                  type="button"
                  onClick={addAnswer}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  ADD VARIATION
                </button>
              </div>
              <div className="space-y-3">
                {acceptableAnswers.map((answer, index) => (
                  <div key={index} className="flex gap-3 items-center animate-in slide-in-from-right-2 duration-300">
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => updateAnswer(index, e.target.value)}
                      placeholder="Enter a correct variation (case insensitive)..."
                      className="flex-1 bg-[#0a0a0f] text-gray-200 border border-gray-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => removeAnswer(index)}
                      className="p-3 text-gray-600 hover:text-red-500 transition-colors disabled:opacity-0"
                      disabled={acceptableAnswers.length <= 1}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Scoring Config */}
            <div className="bg-[#0a0a0f]/50 border border-gray-800 p-6 rounded-[1.5rem] grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Base Pts</label>
                <input
                  type="number"
                  value={basePoints}
                  onChange={(e) => setBasePoints(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#12121b] text-white border border-gray-800 rounded-xl py-3 px-4 focus:border-purple-500/50 outline-none transition-all font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Hint Penalty</label>
                <input
                  type="number"
                  value={hintDeduction}
                  onChange={(e) => setHintDeduction(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#12121b] text-white border border-gray-800 rounded-xl py-3 px-4 focus:border-purple-500/50 outline-none transition-all font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Speed Bonus (1/2/3)</label>
                <div className="grid grid-cols-3 gap-2">
                  {guessBonus.map((bonus, index) => (
                    <input
                      key={index}
                      type="number"
                      value={bonus}
                      onChange={(e) => {
                        const newBonus = [...guessBonus];
                        newBonus[index] = parseInt(e.target.value) || 0;
                        setGuessBonus(newBonus);
                      }}
                      className="w-full bg-[#12121b] text-center text-xs text-indigo-400 border border-gray-800 rounded-xl py-3 px-1 focus:border-indigo-500/50 outline-none font-mono"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push(`/guess-it-room/${roomId}`)}
                className="flex-1 bg-gray-800/50 hover:bg-gray-800 text-gray-300 font-bold py-4 px-6 rounded-2xl border border-gray-700/30 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] group relative flex items-center justify-center px-6 py-4 font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl hover:from-blue-500 hover:to-purple-500 transition-all shadow-xl shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-95"
              >
                {loading ? (
                   <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                    Deploying...
                  </div>
                ) : 'Create Question'}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity -z-10" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
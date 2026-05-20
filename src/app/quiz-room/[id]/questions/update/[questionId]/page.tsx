'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';

export default function UpdateQuestionPage() {
  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [correctAnswer, setCorrectAnswer] = useState(''); // Initialize with first option value

  // Update correctAnswer when options change to ensure it's always a valid option
  useEffect(() => {
    if (options.length > 0 && !options.includes(correctAnswer)) {
      setCorrectAnswer(options[0]);
    }
  }, [options]);
  const [points, setPoints] = useState(10);
  const [timeLimit, setTimeLimit] = useState(30);
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const { id: roomId, questionId } = params;
  const order = parseInt(questionId as string);

  useEffect(() => {
    if (roomId && order) {
        fetch(`/api/quiz-room/${roomId}/questions/${order}`)
            .then(res => res.json())
            .then(data => {
                setText(data.text);
                setOptions(data.options);
                setCorrectAnswer(data.correctAnswer);
                setPoints(data.points);
                setTimeLimit(data.timeLimit);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }
  }, [roomId, order]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      toast.error("A quiz needs at least two options!");
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('text', text);
    formData.append('options', JSON.stringify(options));
    formData.append('correctAnswer', correctAnswer.toString());
    formData.append('points', points.toString());
    formData.append('timeLimit', timeLimit.toString());
    formData.append('order', order.toString()); // Add order to the form data
    if (image) {
      formData.append('image', image);
    }

    try {
      const res = await fetch(`/api/quiz-room/${roomId}/questions/${order}`, {
        method: 'PUT',
        body: formData,
      });

      if (res.ok) {
        toast.success("Question updated successfully!");
        router.push(`/quiz-room/${roomId}/questions`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update question.');
      }
    } catch (error) {
      console.error('An error occurred while updating the question:', error);
      setError('An unexpected error occurred. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-400 text-lg font-medium animate-pulse">Loading Question...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500/30 relative overflow-hidden py-12 px-4">
      <Toaster toastOptions={{ style: { background: '#12121b', color: '#fff', border: '1px solid rgba(139, 92, 246, 0.2)' } }} />
      
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-yellow-500/10 via-orange-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Questions
        </button>

        <div className="bg-[#12121b] border border-gray-800/50 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-10 text-center">
            {/* Update Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full mb-4">
              <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-sm text-yellow-300 font-medium">Editing Question #{order}</span>
            </div>
            
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
              Update Question
            </h1>
            <p className="text-gray-500 mt-2 text-sm">Room ID: {roomId}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question Text */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Question Prompt</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What is the capital of..."
                className="w-full p-4 bg-[#0a0a0f] border border-gray-800 rounded-xl focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 outline-none transition-all min-h-[100px] text-white"
                required
              />
            </div>

            {/* Image Field */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Visual Aid (Optional)</label>
              <div className="relative border-2 border-dashed border-gray-800 rounded-xl p-4 transition-colors hover:border-yellow-500/50 bg-[#0a0a0f]">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center text-yellow-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{image ? image.name : "Click to upload a new image"}</p>
                    <p className="text-xs text-gray-600">JPG, PNG, GIF up to 5MB (leave empty to keep existing)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Options */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Answer Choices</label>
                <button type="button" onClick={addOption} className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  ADD OPTION
                </button>
              </div>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2 group">
                    <div className="flex-grow relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-mono text-sm">{String.fromCharCode(65 + index)}</span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#0a0a0f] border border-gray-800 rounded-xl focus:border-yellow-500/50 outline-none transition-all text-white"
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeOption(index)}
                      className="p-3 text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Correct Answer</label>
                <select
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="w-full p-3 bg-[#0a0a0f] border border-gray-800 rounded-xl focus:ring-2 focus:ring-yellow-500/50 outline-none appearance-none cursor-pointer text-white"
                >
                  {options.map((option, index) => (
                    <option key={index} value={option} className="bg-[#12121b]">
                      {option || `Option ${String.fromCharCode(65 + index)}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Points</label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(parseInt(e.target.value))}
                  className="w-full p-3 bg-[#0a0a0f] border border-gray-800 rounded-xl focus:ring-2 focus:ring-yellow-500/50 outline-none text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Time Limit (Seconds)</label>
              <input
                type="range"
                min="5"
                max="240"
                step="5"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500 mb-2"
              />
              <div className="flex justify-between text-xs font-mono text-gray-500">
                <span>5s</span>
                <span className="text-yellow-400 font-bold">{timeLimit} Seconds</span>
                <span>240s</span>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full group relative px-8 py-4 font-bold text-white bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 text-lg shadow-lg shadow-yellow-500/25 hover:scale-[1.02] active:scale-95"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Update Question
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity -z-10"></div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
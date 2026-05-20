
'use client';

import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Toaster />

      <section className="flex flex-col items-center justify-center text-center py-24 px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Quiz App
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-8">
          Challenge your friends, test your knowledge, and climb the leaderboards.
          Create or join quiz rooms and guess-it rooms in real time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/join-room')}
            className="px-8 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-lg"
          >
            Join a Room
          </button>
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-3 font-bold text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-lg"
          >
            Get Started
          </button>
        </div>
      </section>

      <section className="py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-2">Guess-It Rooms</h3>
            <p className="text-gray-400">
              Create rooms where players guess answers. Fun, fast-paced, and competitive.
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Quiz Rooms</h3>
            <p className="text-gray-400">
              Build traditional multiple-choice quizzes and host them for your audience.
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Performance Tracking</h3>
            <p className="text-gray-400">
              Track your scores, view analytics, and see how you rank on leaderboards.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-800/50">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
            <h3 className="text-xl font-semibold mb-2">Create or Join</h3>
            <p className="text-gray-400">
              Sign up and create your own quiz room or join an existing one with a room code.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
            <h3 className="text-xl font-semibold mb-2">Play</h3>
            <p className="text-gray-400">
              Answer questions in real time. Compete against friends or test yourself.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
            <h3 className="text-xl font-semibold mb-2">Track & Improve</h3>
            <p className="text-gray-400">
              Review your performance, check leaderboards, and keep improving.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
          Jump into a room now or create your own quiz to share with friends.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/quiz-room')}
            className="px-8 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Quiz Rooms
          </button>
          <button
            onClick={() => router.push('/guess-it-room')}
            className="px-8 py-3 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Browse Guess-It Rooms
          </button>
        </div>
      </section>
    </div>
  );
}

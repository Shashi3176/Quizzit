'use client';

import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500/30">
      <Toaster 
        toastOptions={{
          style: {
            background: '#12121b',
            color: '#fff',
            border: '1px solid rgba(139, 92, 246, 0.2)',
          },
        }}
      />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center py-16 sm:py-20 md:py-28 px-3 sm:px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-purple-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>
        
        <div className="relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-purple-300 font-medium">Real-time multiplayer quizzes</span>
          </div>
          <h1 className="flex items-center justify-center gap-4"> 
            <div className='flex items-center justify-center'>               
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Quizzit
            </span>
            </div>            
          </h1>

          
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-xl md:max-w-2xl mb-8 sm:mb-10 leading-relaxed">
            Challenge your friends, test your knowledge, and climb the leaderboards.
            Create or join quiz rooms and guess-it rooms in real time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/join-room')}
              className="group relative px-8 py-4 font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Join a Room
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity -z-10"></div>
            </button>
            <button
              onClick={() => router.push('/login')}
              className="group px-8 py-4 font-bold text-white bg-[#12121b] border border-gray-700/50 rounded-xl hover:bg-gray-800 hover:border-gray-600 transition-all duration-300 text-lg hover:scale-105 active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Get Started
              </span>
            </button>
          </div>

          {/* Stats */}          
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-400 font-medium mb-4">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Everything You Need
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Powerful features to create, host, and participate in engaging quizzes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Feature Card 1 */}
            <div className="group relative bg-[#12121b] rounded-2xl p-8 border border-gray-800/50 hover:border-purple-500/30 transition-all duration-500 overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 group-hover:shadow-purple-500/40 transition-all duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors">Guess-It Rooms</h3>
                <p className="text-gray-500 leading-relaxed">
                  Create rooms where players guess answers. Fun, fast-paced, and competitive gameplay for everyone.
                </p>
              </div>
            </div>
            
            {/* Feature Card 2 */}
            <div className="group relative bg-[#12121b] rounded-2xl p-8 border border-gray-800/50 hover:border-blue-500/30 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 group-hover:shadow-blue-500/40 transition-all duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-300 transition-colors">Quiz Rooms</h3>
                <p className="text-gray-500 leading-relaxed">
                  Build traditional multiple-choice quizzes and host them for your audience in real-time.
                </p>                
              </div>
            </div>
            
            {/* Feature Card 3 - TypeIt */}
            <div className="group relative bg-[#12121b] rounded-2xl p-8 border border-gray-800/50 hover:border-emerald-500/30 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-110 group-hover:shadow-emerald-500/40 transition-all duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-300 transition-colors">TypeIt Rooms</h3>
                <p className="text-gray-500 leading-relaxed">
                  Type your answers manually. Hosts set multiple acceptable answers for flexible scoring.
                </p>                
              </div>
            </div>
            
            {/* Feature Card 4 */}
            <div className="group relative bg-[#12121b] rounded-2xl p-8 border border-gray-800/50 hover:border-green-500/30 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/20 group-hover:scale-110 group-hover:shadow-green-500/40 transition-all duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-green-300 transition-colors">Performance Tracking</h3>
                <p className="text-gray-500 leading-relaxed">
                  Track your scores, view detailed analytics, and see how you rank on leaderboards.
                </p>                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#12121b] to-[#0a0a0f]"></div>
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm text-purple-400 font-medium mb-4">
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Get Started in 3 Steps
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Simple, fast, and fun. Here's how you can start playing.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 opacity-30"></div>
            
            {/* Step 1 */}
            <div className="relative text-center group">
              <div className="relative inline-block mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:shadow-blue-500/50 transition-all duration-300 rotate-3 group-hover:rotate-0">
                  1
                </div>
                <div className="absolute -inset-2 bg-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Create or Join</h3>
              <p className="text-gray-500 leading-relaxed">
                Sign up and create your own quiz room or join an existing one with a room code.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="relative text-center group">
              <div className="relative inline-block mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto shadow-lg shadow-purple-500/30 group-hover:scale-110 group-hover:shadow-purple-500/50 transition-all duration-300 -rotate-3 group-hover:rotate-0">
                  2
                </div>
                <div className="absolute -inset-2 bg-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Play</h3>
              <p className="text-gray-500 leading-relaxed">
                Answer questions in real time. Compete against friends or test yourself solo.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="relative text-center group">
              <div className="relative inline-block mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto shadow-lg shadow-green-500/30 group-hover:scale-110 group-hover:shadow-green-500/50 transition-all duration-300 rotate-3 group-hover:rotate-0">
                  3
                </div>
                <div className="absolute -inset-2 bg-green-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Track & Improve</h3>
              <p className="text-gray-500 leading-relaxed">
                Review your performance, check leaderboards, and keep improving your skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative">
          {/* Background Card */}
          <div className="relative bg-gradient-to-br from-[#12121b] to-[#1a1a2e] rounded-3xl p-12 md:p-16 border border-gray-800/50 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                Ready to Get Started?
              </h2>
              <p className="text-gray-400 mb-10 max-w-xl mx-auto text-lg">
                Jump into a room now or create your own quiz to share with friends. The competition awaits!
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 justify-center">
                <button
                  onClick={() => router.push('/quiz-room')}
                  className="group relative px-6 py-3 sm:px-8 sm:py-4 font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm sm:text-base">Quiz Rooms</span>
                  </span>
                </button>
                <button
                  onClick={() => router.push('/guess-it-room')}
                  className="group relative px-6 py-3 sm:px-8 sm:py-4 font-bold text-white bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl hover:from-purple-500 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-sm sm:text-base">Guess-It Rooms</span>
                  </span>
                </button>
                <button
                  onClick={() => router.push('/the-100')}
                  className="group relative px-6 py-3 sm:px-8 sm:py-4 font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-xl hover:from-orange-500 hover:to-red-500 transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm sm:text-base">The-100 Rooms</span>
                  </span>
                </button>
                <button
                  onClick={() => router.push('/type-it-room')}
                  className="group relative px-6 py-3 sm:px-8 sm:py-4 font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="text-sm sm:text-base">TypeIt Rooms</span>
                  </span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Free to play
                </div>                
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Real-time multiplayer
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
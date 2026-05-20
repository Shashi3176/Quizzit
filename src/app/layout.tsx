import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import AuthNav from "@/components/AuthNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quiz App",
  description: "Challenge your friends, test your knowledge, and climb the leaderboards.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-[#0a0a0f] selection:bg-purple-500/30`}
      >
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-[#0a0a0f]/70 backdrop-blur-2xl border-b border-gray-800/50 text-white">
          {/* Gradient line at top */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/[0.03] to-transparent pointer-events-none"></div>
          
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href="/" className="group relative flex items-center gap-3 py-2 px-3 -ml-3 rounded-xl transition-all duration-300 hover:bg-white/[0.03]">
                {/* Logo Icon */}
                <div className="relative">
                  {/* Glow effect behind icon */}
                  <div className="absolute inset-0 bg-purple-500/40 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/50 group-hover:scale-110 transition-all duration-300 border border-purple-400/20">
                    <svg className="w-5 h-5 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
                
                {/* Logo Text */}
                <div className="flex flex-col">
                  <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent group-hover:from-purple-200 group-hover:via-white group-hover:to-blue-200 transition-all duration-300">
                    Quiz App
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase group-hover:text-purple-400/70 transition-colors duration-300">
                    Learn & Play
                  </span>
                </div>
                
                {/* Animated underline */}
                <div className="absolute bottom-1 left-3 right-3 h-[2px] bg-gradient-to-r from-purple-500 to-blue-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </Link>

              {/* Auth Navigation */}
              <AuthNav />
            </div>
          </div>
          
          {/* Bottom border gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"></div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-[#12121b] border-t border-gray-800/50 text-gray-400 mt-auto relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
          
          {/* Main Footer Content */}
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Brand Section */}
              <div>
                <Link href="/" className="group inline-flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/30 transition-shadow duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <span className="font-bold text-xl text-white">Quiz App</span>
                </Link>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Create, join, and compete in real-time quizzes with friends. Challenge your knowledge and climb the leaderboards.
                </p>
                
                {/* Social Links */}
                <div className="flex items-center gap-3 mt-6">
                  <a href="https://github.com/Shashi3176/real-time-quiz-idx" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800/50 hover:bg-gray-700 border border-gray-700/50 hover:border-gray-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 hover:scale-110">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Quick Links
                </h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link href="/quiz-room" className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                      <span className="w-1.5 h-1.5 bg-gray-600 group-hover:bg-purple-500 rounded-full transition-colors"></span>
                      Quiz Rooms
                    </Link>
                  </li>
                  <li>
                    <Link href="/guess-it-room" className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                      <span className="w-1.5 h-1.5 bg-gray-600 group-hover:bg-purple-500 rounded-full transition-colors"></span>
                      Guess-It Rooms
                    </Link>
                  </li>
                  <li>
                    <Link href="/type-it-room" className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                      <span className="w-1.5 h-1.5 bg-gray-600 group-hover:bg-purple-500 rounded-full transition-colors"></span>
                      Type-It Rooms
                    </Link>
                  </li>
                  <li>
                    <Link href="/The-100" className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                      <span className="w-1.5 h-1.5 bg-gray-600 group-hover:bg-purple-500 rounded-full transition-colors"></span>
                      The-100
                    </Link>
                  </li>
                  <li>
                    <Link href="/join-room" className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                      <span className="w-1.5 h-1.5 bg-gray-600 group-hover:bg-purple-500 rounded-full transition-colors"></span>
                      Join a Room
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile" className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                      <span className="w-1.5 h-1.5 bg-gray-600 group-hover:bg-purple-500 rounded-full transition-colors"></span>
                      Profile
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Account */}
              <div>
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Account
                </h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link href="/login" className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                      <span className="w-1.5 h-1.5 bg-gray-600 group-hover:bg-blue-500 rounded-full transition-colors"></span>
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                      <span className="w-1.5 h-1.5 bg-gray-600 group-hover:bg-blue-500 rounded-full transition-colors"></span>
                      Register
                    </Link>
                  </li>
                </ul>
              </div>

            </div>
          </div>

        </footer>
      </body>
    </html>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import LogoutButton from "./LogoutButton";

const ROOM_TYPES = [
  { label: "Quiz", href: "/quiz-room" },
  { label: "Guess-It", href: "/guess-it-room" },
  { label: "The-100", href: "/the-100" },
  { label: "Type-It", href: "/type-it-room" },
];

export default function AuthNav() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/verifyToken");
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      <div ref={dropdownRef} className="relative inline-block mr-4">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center"
        >
          Create Room
          <svg
            className={`w-4 h-4 ml-1 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-1 bg-[#0a0a0f] border border-gray-700 rounded-lg shadow-lg z-50 min-w-[140px]">
            {ROOM_TYPES.map((room) => (
              <Link
                key={room.href}
                href={room.href}
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-2 hover:bg-gray-800 text-sm whitespace-nowrap"
              >
                {room.label}
              </Link>
            ))}
          </div>
        )}
      </div>
      <Link href="/join-room" className="mr-4">Join Room</Link>
      {isAuthenticated ? (
        <>
          <Link href="/profile" className="mr-4">Profile</Link>
          <LogoutButton />
        </>
      ) : (
        <Link href="/login" className="mr-4">Login</Link>
      )}
    </div>
  );
}

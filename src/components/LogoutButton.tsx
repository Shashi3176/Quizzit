"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="mr-4 cursor-pointer hover:text-gray-300 transition-colors">
      Logout
    </button>
  );
}

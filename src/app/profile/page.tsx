
import PerformanceCard from '@/components/PerformanceCard';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "View your Quiz App profile and performance stats",
};

export default function PerformancePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <PerformanceCard />
    </div>
  );
}

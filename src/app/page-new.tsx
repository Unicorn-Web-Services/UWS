"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";

export default function HomePage() {
  const { user, userProfile, companies, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (userProfile && (!companies || companies.length === 0)) {
        router.push("/setup");
      }
    }
  }, [user, userProfile, companies, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !userProfile || !companies || companies.length === 0) {
    return null; // Will redirect
  }

  return <DashboardLayout />;
}

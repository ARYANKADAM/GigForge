"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Briefcase, Code2, Shield } from "lucide-react";

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    const role = user?.unsafeMetadata?.role;
    if (role === "admin") {
      syncAndRedirect("admin");
    }
  }, [isLoaded, user]);

  const syncAndRedirect = async (role) => {
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    router.push(role === "admin" ? "/admin" : "/dashboard");
  };

  const selectRole = async (role) => {
    setLoading(true);
    try {
      await user.update({ unsafeMetadata: { role } });
      await syncAndRedirect(role);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Show loading while Clerk loads or while redirecting admin
  if (!isLoaded || user?.unsafeMetadata?.role === "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-10 max-w-lg w-full text-center shadow-2xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to FreelanceHub!</h1>
        <p className="text-slate-500 mb-10">How do you want to use the platform?</p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => selectRole("client")}
            disabled={loading}
            className="flex flex-col items-center gap-4 p-8 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group"
          >
            <Briefcase className="h-12 w-12 text-slate-400 group-hover:text-blue-500 transition" />
            <div>
              <p className="font-semibold text-slate-900 text-lg">I'm a Client</p>
              <p className="text-sm text-slate-500 mt-1">I want to post projects and hire developers</p>
            </div>
          </button>
          <button
            onClick={() => selectRole("developer")}
            disabled={loading}
            className="flex flex-col items-center gap-4 p-8 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group"
          >
            <Code2 className="h-12 w-12 text-slate-400 group-hover:text-blue-500 transition" />
            <div>
              <p className="font-semibold text-slate-900 text-lg">I'm a Developer</p>
              <p className="text-sm text-slate-500 mt-1">I want to find projects and earn money</p>
            </div>
          </button>
        </div>
        {loading && <p className="text-sm text-slate-400 mt-6">Setting up your account...</p>}
      </div>
    </div>
  );
}
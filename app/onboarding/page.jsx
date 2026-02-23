"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Briefcase, Code2, ArrowRight, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(null); // "client" | "developer"

  if (!isLoaded) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (isLoaded && user?.unsafeMetadata?.role === "admin") {
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "admin" }),
    }).then(() => router.push("/admin"));
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const selectRole = async (role) => {
    setLoading(role);
    try {
      await user.update({ unsafeMetadata: { role } });
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden px-4">

      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 60px,
            rgba(255,255,255,0.02) 60px,
            rgba(255,255,255,0.02) 61px
          ), repeating-linear-gradient(
            0deg,
            transparent,
            transparent 60px,
            rgba(255,255,255,0.02) 60px,
            rgba(255,255,255,0.02) 61px
          )`,
        }}
      />

      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(99,102,241,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-10">
          <a href="/" className="text-white font-bold text-xl tracking-tight">
            &lt;/&gt; GigForge
          </a>
        </div>

        {/* Card */}
        <div className="bg-[#111111] border border-white/8 rounded-2xl p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👋</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome, {user?.firstName || "there"}!
            </h1>
            <p className="text-white/40 text-sm">
              How do you want to use GigForge?
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Client */}
            <button
              onClick={() => selectRole("client")}
              disabled={!!loading}
              className="group relative flex flex-col items-center gap-4 p-6 bg-white/5 border border-white/10 rounded-xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-200 disabled:opacity-50"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                {loading === "client" ? (
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                ) : (
                  <Briefcase className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <div className="text-center">
                <p className="font-semibold text-white text-sm mb-1">I'm a Client</p>
                <p className="text-white/30 text-xs leading-relaxed">
                  Post projects & hire developers
                </p>
              </div>
              {/* Hover arrow */}
              <ArrowRight className="absolute bottom-4 right-4 w-3.5 h-3.5 text-white/0 group-hover:text-white/30 transition-colors" />
            </button>

            {/* Developer */}
            <button
              onClick={() => selectRole("developer")}
              disabled={!!loading}
              className="group relative flex flex-col items-center gap-4 p-6 bg-white/5 border border-white/10 rounded-xl hover:border-green-500/50 hover:bg-green-500/5 transition-all duration-200 disabled:opacity-50"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-green-500/20 transition-all">
                {loading === "developer" ? (
                  <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
                ) : (
                  <Code2 className="w-5 h-5 text-green-400" />
                )}
              </div>
              <div className="text-center">
                <p className="font-semibold text-white text-sm mb-1">I'm a Developer</p>
                <p className="text-white/30 text-xs leading-relaxed">
                  Find projects & earn money
                </p>
              </div>
              <ArrowRight className="absolute bottom-4 right-4 w-3.5 h-3.5 text-white/0 group-hover:text-white/30 transition-colors" />
            </button>
          </div>

          <p className="text-center text-white/20 text-xs">
            You won't be able to change this later
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-white/20 text-xs mt-6">
          © 2026 GigForge
        </p>
      </div>
    </div>
  );
}
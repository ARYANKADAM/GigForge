"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Briefcase, Code2, Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(null);
  const [selected, setSelected] = useState(null);

  if (!isLoaded) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
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
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(selected);
    try {
      await user.update({ unsafeMetadata: { role: selected } });
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selected }),
      });
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setLoading(null);
    }
  };

  return (
    <>
      {/* ══════════════════════════════════════
          MOBILE LAYOUT (hidden on lg+)
          Full-screen image as bg, content on top
      ══════════════════════════════════════ */}
      <div className="lg:hidden relative min-h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">

        {/* Full-screen background image */}
        <div className="absolute inset-0">
          <Image
            src="/onboarding-hero.jpeg"
            alt="GigForge"
            fill
            className="object-cover object-center"
            priority
          />

          {/* Dark overlay layers for readability */}
          {/* Top fade — keeps logo readable */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.0) 50%)",
            }}
          />
          {/* Bottom fade — strong dark so text/cards pop */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, #0a0a0a 0%, rgba(10,10,10,0.92) 35%, rgba(10,10,10,0.3) 60%, transparent 80%)",
            }}
          />
          {/* Subtle vignette around edges */}
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
            }}
          />
          {/* Subtle purple tint glow in middle */}
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 80% 50% at 50% 60%, rgba(99,102,241,0.08) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Content on top of image */}
        <div className="relative z-10 flex flex-col min-h-screen px-5 pt-12 pb-8">

          {/* Logo at top */}
          <div className="mb-auto -mt-6 md:mt-0">
            <a href="/" className="flex items-center gap-2">
              <Image src="/icon0.svg" alt="GigForge" width={28} height={28} className="w-7 h-7" />
              <span className="text-white font-bold text-base tracking-tight">GigForge</span>
            </a>
          </div>

          {/* Main content — pushed to bottom half */}
          <div className="mt-auto">
            <div className="mb-6">
              <p className="text-white/50 text-xs font-medium tracking-widest uppercase mb-2">Step 1 of 1</p>
              <h1 className="text-2xl font-bold text-white leading-tight mb-1.5">
                What brings you<br />to GigForge?
              </h1>
              <p className="text-white/50 text-sm">
                Select the role that best describes you.
              </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-2 gap-3 mb-5">

              {/* Client */}
              <button
                onClick={() => setSelected("client")}
                className={`group flex flex-col items-center gap-3 p-4 rounded-2xl border backdrop-blur-md transition-all duration-200 text-center ${
                  selected === "client"
                    ? "bg-blue-500/15 border-blue-500/50 shadow-[0_0_0_1px_rgba(99,102,241,0.3),0_0_25px_rgba(99,102,241,0.12)]"
                    : "bg-black/30 border-white/10 hover:bg-black/40 hover:border-white/20"
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  selected === "client"
                    ? "bg-blue-500/25 border border-blue-500/40"
                    : "bg-white/8 border border-white/10"
                }`}>
                  <Briefcase className={`w-5 h-5 transition-colors ${
                    selected === "client" ? "text-blue-400" : "text-white/50"
                  }`} />
                </div>
                <div>
                  <p className={`font-semibold text-xs mb-0.5 ${selected === "client" ? "text-white" : "text-white/70"}`}>
                    I'm a Client
                  </p>
                  <p className="text-white/30 text-xs">Post & hire</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-auto transition-all ${
                  selected === "client" ? "border-blue-400 bg-blue-400" : "border-white/20"
                }`}>
                  {selected === "client" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>

              {/* Developer */}
              <button
                onClick={() => setSelected("developer")}
                className={`group flex flex-col items-center gap-3 p-4 rounded-2xl border backdrop-blur-md transition-all duration-200 text-center ${
                  selected === "developer"
                    ? "bg-emerald-500/15 border-emerald-500/50 shadow-[0_0_0_1px_rgba(52,211,153,0.3),0_0_25px_rgba(52,211,153,0.12)]"
                    : "bg-black/30 border-white/10 hover:bg-black/40 hover:border-white/20"
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  selected === "developer"
                    ? "bg-emerald-500/25 border border-emerald-500/40"
                    : "bg-white/8 border border-white/10"
                }`}>
                  <Code2 className={`w-5 h-5 transition-colors ${
                    selected === "developer" ? "text-emerald-400" : "text-white/50"
                  }`} />
                </div>
                <div>
                  <p className={`font-semibold text-xs mb-0.5 ${selected === "developer" ? "text-white" : "text-white/70"}`}>
                    I'm a Developer
                  </p>
                  <p className="text-white/30 text-xs">Find & earn</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-auto transition-all ${
                  selected === "developer" ? "border-emerald-400 bg-emerald-400" : "border-white/20"
                }`}>
                  {selected === "developer" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            </div>

            {/* Continue */}
            <button
              onClick={handleContinue}
              disabled={!selected || !!loading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                selected && !loading
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-white/8 text-white/20 cursor-not-allowed"
              }`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Continue</span><ArrowRight className="w-4 h-4" /></>}
            </button>

            <p className="text-center text-white/20 text-xs mt-3">
              You won't be able to change this later
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-white/20 text-xs mt-6">© 2026 GigForge</p>
        </div>
      </div>

      {/* ══════════════════════════════════════
          DESKTOP LAYOUT (hidden below lg)
          Split screen — content left, image right
      ══════════════════════════════════════ */}
      <div className="hidden lg:flex min-h-screen bg-[#0a0a0a]">

        {/* Left panel */}
        <div className="flex-1 flex flex-col pl-10 pr-0 py-10 relative overflow-hidden">

          {/* Grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.015) 60px, rgba(255,255,255,0.015) 61px),
                repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,255,255,0.015) 60px, rgba(255,255,255,0.015) 61px)`,
            }}
          />
          <div
            className="absolute top-0 left-0 w-[500px] h-[500px] pointer-events-none"
            style={{ background: "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.08) 0%, transparent 60%)" }}
          />

          {/* Logo */}
          <div className="relative z-10 ml-10 mb-auto">
            <a href="/" className="flex items-center gap-2">
              <Image src="/icon0.svg" alt="GigForge" width={24} height={24} className="w-6 h-6" />
              <span className="text-white font-bold text-xl tracking-tight">GigForge</span>
            </a>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center flex-1 w-full max-w-[720px] ml-10 pr-12 py-16">
            <div className="mb-8">
              <p className="text-white/30 text-xs font-medium tracking-widest uppercase mb-3">Step 1 of 1</p>
              <h1 className="text-3xl font-bold text-white leading-tight mb-2">
                What brings you<br />to GigForge?
              </h1>
              <p className="text-white/40 text-sm">Select the role that best describes you.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* Client */}
              <button
                onClick={() => setSelected("client")}
                className={`group flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all duration-200 text-center ${
                  selected === "client"
                    ? "bg-blue-500/10 border-blue-500/40 shadow-[0_0_0_1px_rgba(99,102,241,0.2),0_0_30px_rgba(99,102,241,0.08)]"
                    : "bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/20"
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  selected === "client" ? "bg-blue-500/20 border border-blue-500/30" : "bg-white/5 border border-white/10 group-hover:bg-white/8"
                }`}>
                  <Briefcase className={`w-6 h-6 ${selected === "client" ? "text-blue-400" : "text-white/30 group-hover:text-white/60"}`} />
                </div>
                <div>
                  <p className={`font-semibold text-sm mb-1 ${selected === "client" ? "text-white" : "text-white/60 group-hover:text-white/90"}`}>I'm a Client</p>
                  <p className="text-white/25 text-xs leading-relaxed">Post projects &<br />hire developers</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-auto ${selected === "client" ? "border-blue-400 bg-blue-400" : "border-white/15"}`}>
                  {selected === "client" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>

              {/* Developer */}
              <button
                onClick={() => setSelected("developer")}
                className={`group flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all duration-200 text-center ${
                  selected === "developer"
                    ? "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_0_1px_rgba(52,211,153,0.2),0_0_30px_rgba(52,211,153,0.08)]"
                    : "bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/20"
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  selected === "developer" ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-white/5 border border-white/10 group-hover:bg-white/8"
                }`}>
                  <Code2 className={`w-6 h-6 ${selected === "developer" ? "text-emerald-400" : "text-white/30 group-hover:text-white/60"}`} />
                </div>
                <div>
                  <p className={`font-semibold text-sm mb-1 ${selected === "developer" ? "text-white" : "text-white/60 group-hover:text-white/90"}`}>I'm a Developer</p>
                  <p className="text-white/25 text-xs leading-relaxed">Find projects &<br />earn money</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-auto ${selected === "developer" ? "border-emerald-400 bg-emerald-400" : "border-white/15"}`}>
                  {selected === "developer" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            </div>

            <button
              onClick={handleContinue}
              disabled={!selected || !!loading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                selected && !loading ? "bg-white text-black hover:bg-white/90 cursor-pointer" : "bg-white/8 text-white/20 cursor-not-allowed"
              }`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Continue</span><ArrowRight className="w-4 h-4" /></>}
            </button>
            <p className="text-center text-white/15 text-xs mt-4">You won't be able to change this later</p>
          </div>

          <div className="relative z-10 mt-auto ml-10">
            <p className="text-white/15 text-xs">© 2026 GigForge</p>
          </div>
        </div>

        {/* Right image panel */}
        <div className="w-[45%] relative overflow-hidden">
          <Image src="/onboarding-hero.jpeg" alt="GigForge" fill className="object-cover" priority />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, #0a0a0a 0%, transparent 20%)" }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, #0a0a0a 0%, transparent 30%)" }} />
          <div className="absolute bottom-8 left-8 right-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/50 text-xs">Where great work happens</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
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
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col lg:flex-row">

      {/* ── MOBILE TOP IMAGE STRIP (only on small screens) ── */}
      <div className="relative w-full h-48 sm:h-56 lg:hidden overflow-hidden shrink-0">
        <Image
          src="/onboarding-hero.jpeg"
          alt="GigForge"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Bottom fade into page bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent 30%, #0a0a0a 100%)" }}
        />
        {/* Logo overlay on mobile image */}
        <div className="absolute top-4 left-4 z-10">
          <a href="/" className="flex items-center gap-2">
            <img
              src="/icon0.svg"
              alt="GigForge"
              className="w-5 h-5"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <span className="text-white font-bold text-base tracking-tight">GigForge</span>
          </a>
        </div>
      </div>

      {/* ── LEFT / MAIN PANEL ── */}
      <div className="flex-1 flex flex-col px-5 sm:px-8 lg:pl-10 lg:pr-0 py-6 lg:py-10 relative overflow-hidden">

        {/* Subtle grid — desktop only for perf */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 hidden lg:block"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.015) 60px, rgba(255,255,255,0.015) 61px),
              repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,255,255,0.015) 60px, rgba(255,255,255,0.015) 61px)`,
          }}
        />
        {/* Soft glow */}
        <div
          className="absolute top-0 left-0 w-[500px] h-[500px] pointer-events-none"
          style={{
            background: "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.08) 0%, transparent 60%)",
          }}
        />

        {/* Logo — desktop only (mobile logo is over the image strip) */}
        <div className="relative z-10 ml-2 lg:ml-10 mb-auto hidden lg:block">
          <a href="/" className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
            <img
              src="/icon0.svg"
              alt="GigForge"
              className="w-6 h-6"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <span className="text-white font-bold text-xl tracking-tight">GigForge</span>
          </a>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col justify-center flex-1 w-full max-w-[720px] lg:ml-10 lg:pr-12 py-4 lg:py-16 mx-auto lg:mx-0">

          <div className="mb-6 lg:mb-8">
            <p className="text-white/30 text-xs font-medium tracking-widest uppercase mb-2 lg:mb-3">Step 1 of 1</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
              What brings you<br />to GigForge?
            </h1>
            <p className="text-white/40 text-sm">
              Select the role that best describes you.
            </p>
          </div>

          {/* ── Side-by-side role CARDS ── */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 lg:mb-8">

            {/* Client card */}
            <button
              onClick={() => setSelected("client")}
              className={`group flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl border transition-all duration-200 text-center ${
                selected === "client"
                  ? "bg-blue-500/10 border-blue-500/40 shadow-[0_0_0_1px_rgba(99,102,241,0.2),0_0_30px_rgba(99,102,241,0.08)]"
                  : "bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/20"
              }`}
            >
              <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${
                selected === "client"
                  ? "bg-blue-500/20 border border-blue-500/30"
                  : "bg-white/5 border border-white/10 group-hover:bg-white/8 group-hover:border-white/20"
              }`}>
                <Briefcase className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                  selected === "client" ? "text-blue-400" : "text-white/30 group-hover:text-white/60"
                }`} />
              </div>

              <div>
                <p className={`font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 transition-colors ${
                  selected === "client" ? "text-white" : "text-white/60 group-hover:text-white/90"
                }`}>
                  I'm a Client
                </p>
                <p className="text-white/25 text-xs leading-relaxed hidden sm:block">
                  Post projects &<br />hire developers
                </p>
                {/* Shorter text on very small screens */}
                <p className="text-white/25 text-xs leading-relaxed sm:hidden">
                  Post & hire
                </p>
              </div>

              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all mt-auto ${
                selected === "client" ? "border-blue-400 bg-blue-400" : "border-white/15"
              }`}>
                {selected === "client" && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white" />}
              </div>
            </button>

            {/* Developer card */}
            <button
              onClick={() => setSelected("developer")}
              className={`group flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl border transition-all duration-200 text-center ${
                selected === "developer"
                  ? "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_0_1px_rgba(52,211,153,0.2),0_0_30px_rgba(52,211,153,0.08)]"
                  : "bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/20"
              }`}
            >
              <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${
                selected === "developer"
                  ? "bg-emerald-500/20 border border-emerald-500/30"
                  : "bg-white/5 border border-white/10 group-hover:bg-white/8 group-hover:border-white/20"
              }`}>
                <Code2 className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                  selected === "developer" ? "text-emerald-400" : "text-white/30 group-hover:text-white/60"
                }`} />
              </div>

              <div>
                <p className={`font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 transition-colors ${
                  selected === "developer" ? "text-white" : "text-white/60 group-hover:text-white/90"
                }`}>
                  I'm a Developer
                </p>
                <p className="text-white/25 text-xs leading-relaxed hidden sm:block">
                  Find projects &<br />earn money
                </p>
                <p className="text-white/25 text-xs leading-relaxed sm:hidden">
                  Find & earn
                </p>
              </div>

              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all mt-auto ${
                selected === "developer" ? "border-emerald-400 bg-emerald-400" : "border-white/15"
              }`}>
                {selected === "developer" && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white" />}
              </div>
            </button>
          </div>

          {/* Continue button */}
          <button
            onClick={handleContinue}
            disabled={!selected || !!loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              selected && !loading
                ? "bg-white text-black hover:bg-white/90 cursor-pointer"
                : "bg-white/8 text-white/20 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-white/15 text-xs mt-4">
            You won't be able to change this later
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-6 lg:mt-auto text-center lg:text-left">
          <p className="text-white/15 text-xs">© 2026 GigForge</p>
        </div>
      </div>

      {/* ── RIGHT PANEL — image (desktop only) ── */}
      <div className="hidden lg:block w-[45%] relative overflow-hidden">
        <Image
          src="/onboarding-hero.jpeg"
          alt="GigForge"
          fill
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to right, #0a0a0a 0%, transparent 20%)" }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to top, #0a0a0a 0%, transparent 30%)" }}
        />
        <div className="absolute bottom-8 left-8 right-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/50 text-xs">Where great work happens</span>
          </div>
        </div>
      </div>

    </div>
  );
}
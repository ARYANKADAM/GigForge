"use client";
import Link from "next/link";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#0a0a0a]">

      {/* Aceternity ripple grid */}
      <BackgroundRippleEffect rows={25} cols={45} cellSize={56} />

      {/* Radial fade — grid fades into dark at bottom */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "radial-gradient(ellipse 100% 55% at 50% 0%, transparent 30%, #0a0a0a 100%)",
        }}
      />

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-8xl mx-auto w-full">
        <span className="text-white font-bold text-xl tracking-tight">
          &lt;/&gt; GigForge
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-white/60 hover:text-white text-sm font-medium transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-20 flex flex-col items-center justify-center flex-1 text-center px-6 mt-10">

        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/60 text-xs font-medium">
            Now live — Start earning today
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-6xl md:text-8xl font-bold text-white leading-[1.05] tracking-tight max-w-4xl mb-6">
          Hire top{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            developers.
          </span>
          <br />
          Get work{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            done.
          </span>
        </h1>

        <p className="text-white/40 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
          The escrow-powered freelance platform where clients and developers
          connect, collaborate, and get paid securely.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-20">
          <Link
            href="/sign-up"
            className="group bg-white text-black font-semibold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-all text-sm flex items-center gap-2"
          >
            Start for free
            <span className="group-hover:translate-x-0.5 transition-transform inline-block">
              →
            </span>
          </Link>
          <Link
            href="/sign-in"
            className="text-white/50 hover:text-white text-sm font-medium px-8 py-3.5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
          >
            Sign in to your account
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-12 flex-wrap justify-center">
          {[
            { value: "100%", label: "Secure Escrow" },
            { value: "Real-time", label: "Chat & Notifications" },
            { value: "3 Roles", label: "Client · Dev · Admin" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-white font-bold text-2xl">{value}</p>
              <p className="text-white/30 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 py-24 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: "💼",
              title: "Post Projects",
              desc: "Clients post projects with budgets. Developers submit competitive bids.",
              color: "from-blue-500/10 to-blue-500/5",
              border: "border-blue-500/20",
            },
            {
              icon: "🔒",
              title: "Escrow Payments",
              desc: "Funds are held securely in escrow and released only when work is complete.",
              color: "from-green-500/10 to-green-500/5",
              border: "border-green-500/20",
            },
            {
              icon: "⚡",
              title: "Real-time Chat",
              desc: "Communicate instantly with built-in chat, file sharing, and notifications.",
              color: "from-purple-500/10 to-purple-500/5",
              border: "border-purple-500/20",
            },
          ].map(({ icon, title, desc, color, border }) => (
            <div
              key={title}
              className={`bg-gradient-to-b ${color} border ${border} rounded-2xl p-6 hover:scale-[1.02] transition-transform`}
            >
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-20 border-t border-white/5 py-6 text-center">
        <p className="text-white/20 text-xs">
          © 2026 GigForge — Built by Aryan Kadam
        </p>
      </div>
    </div>
  );
}
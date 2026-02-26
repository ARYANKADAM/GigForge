import Link from 'next/link'

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
      
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

      {/* Purple glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full flex flex-col items-center gap-6 px-4 py-10">
        {/* Centered logo for clean header */}
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
            <img src="/icon0.svg" alt="GigForge" className="w-6 h-6" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">GigForge</span>
        </a>

        {children}
      </div>
    </div>
  );
}
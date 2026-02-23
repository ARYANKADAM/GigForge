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
        <a href="/" className="text-white font-bold text-xl tracking-tight">
          &lt;/&gt; GigForge
        </a>
        {children}
      </div>
    </div>
  );
}
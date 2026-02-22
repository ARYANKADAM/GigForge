import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Users, ShieldCheck, Star, Zap, Globe } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Code2 className="h-7 w-7 text-blue-400" />
          <span className="text-xl font-bold tracking-tight">FreelanceHub</span>
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" className="text-white hover:bg-white/10">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="bg-blue-500 hover:bg-blue-600">Get Started</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button className="bg-blue-500 hover:bg-blue-600">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </SignedIn>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-4 py-28 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-8">
          <Zap className="h-4 w-4" /> Open-source Freelance Marketplace
        </div>
        <h1 className="text-6xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
          Connect. Build. Get Paid.
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mb-10">
          Post projects, receive competitive bids from skilled developers, collaborate with real-time chat, and release payments securely with escrow.
        </p>
        <div className="flex gap-4">
          <SignUpButton mode="modal">
            <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white px-8">
              Post a Project <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </SignUpButton>
          <SignUpButton mode="modal">
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8">
              Find Work
            </Button>
          </SignUpButton>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-8 pb-24">
        {[
          { icon: Users, title: "Role-Based Access", desc: "Separate dashboards for Clients and Developers with tailored workflows." },
          { icon: ShieldCheck, title: "Escrow Payments", desc: "Funds held securely via Stripe. Released only when work is approved." },
          { icon: Globe, title: "Real-Time Chat", desc: "Socket.io powered messaging between clients and hired developers." },
          { icon: Star, title: "Ratings & Reviews", desc: "Build reputation through verified reviews after project completion." },
          { icon: Zap, title: "Instant Bidding", desc: "Developers submit proposals with custom timelines and pricing." },
          { icon: Code2, title: "Admin Panel", desc: "Moderation tools to manage users, projects, and disputes." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
            <Icon className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-slate-400 text-sm">{desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="text-center text-slate-500 text-sm pb-8">
        Built with Next.js · Clerk · MongoDB · Stripe · Socket.io
      </footer>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Send,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Share2,
  BarChart3,
  Globe,
  Clock,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SocialSync Quantum · Next-Gen Social Publishing Studio" },
      {
        name: "description",
        content:
          "Publish to LinkedIn, X and Instagram from one unified, high-performance studio with real-time platform previews and automated scheduling.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
  }, []);

  return (
    <div className="min-h-screen bg-background bg-hero-mesh text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* Header Bar */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-neon-gradient shadow-glow-emerald">
            <Zap className="size-5 text-slate-950 fill-slate-950" />
          </span>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
              Social<span className="text-gradient">Sync</span>
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-3">
          {signedIn ? (
            <Button
              asChild
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-glow-emerald px-6"
            >
              <Link to="/dashboard">
                Open Studio <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl"
              >
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button
                asChild
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-glow-emerald px-5"
              >
                <Link to="/auth" search={{ mode: "signup" }}>
                  Get Started Free
                </Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6">
        <section className="mx-auto max-w-4xl pt-16 pb-20 text-center sm:pt-24 sm:pb-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-300 backdrop-blur-md shadow-lg shadow-emerald-500/10 mb-8">
            <Sparkles className="size-4 text-emerald-400 animate-pulse" />
            SocialSync 2.0 Quantum Studio is Live
          </div>

          <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-7xl">
            Publish Everywhere. <br />
            <span className="text-gradient">Zero Friction.</span>
          </h1>

          <p className="mt-6 text-lg text-slate-400 sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Compose once and broadcast seamless multi-network content to LinkedIn, X (Twitter), and
            Instagram with live platform previews, character optimization, and bulletproof scheduled delivery.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl shadow-glow-emerald px-8 py-6 text-base"
            >
              <Link to="/auth" search={{ mode: "signup" }}>
                Start Publishing Free <ArrowRight className="size-5 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-white/10 bg-slate-900/60 hover:bg-slate-800 text-slate-200 rounded-2xl px-8 py-6 text-base backdrop-blur-xl"
            >
              <Link to="/auth">Sign In to Dashboard</Link>
            </Button>
          </div>

          {/* Interactive Feature Mockup Banner */}
          <div className="mt-16 relative rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-2xl shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-indigo-500 to-purple-500" />
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-rose-500" />
                <span className="size-3 rounded-full bg-amber-500" />
                <span className="size-3 rounded-full bg-emerald-500" />
                <span className="ml-2 text-xs font-mono text-slate-400">composer_studio_v2.tsx</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-semibold">
                  ● 3 NETWORKS READY
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 text-left">
              <div className="rounded-xl border border-white/5 bg-slate-950/80 p-4">
                <div className="flex items-center justify-between text-xs text-blue-400 font-semibold mb-2">
                  <span>LinkedIn Post</span>
                  <span className="text-[10px] text-slate-500">3,000 max</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  🚀 Elevate your engineering productivity with SocialSync Quantum. Publish cross-platform in one click! #buildinpublic
                </p>
                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-white/5">
                  <span>Preview Ready</span>
                  <CheckCircle2 className="size-3 text-emerald-400" />
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-slate-950/80 p-4">
                <div className="flex items-center justify-between text-xs text-sky-400 font-semibold mb-2">
                  <span>X (Twitter) Thread</span>
                  <span className="text-[10px] text-slate-500">280 max</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Shipping updates fast! Check out the brand new UI redesign for SocialSync. Multi-platform syncing made effortless. ⚡
                </p>
                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-white/5">
                  <span>241 / 280 chars</span>
                  <CheckCircle2 className="size-3 text-emerald-400" />
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-slate-950/80 p-4">
                <div className="flex items-center justify-between text-xs text-pink-400 font-semibold mb-2">
                  <span>Instagram Caption</span>
                  <span className="text-[10px] text-slate-500">2,200 max</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Visual perfection meets scheduling power. Clean aesthetics and dynamic analytics. ✨ #ui #design #tech
                </p>
                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-white/5">
                  <span>Media Attached</span>
                  <CheckCircle2 className="size-3 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Showcase */}
        <section className="grid gap-6 pb-24 sm:grid-cols-3">
          {[
            {
              icon: Send,
              title: "Unified Studio Composer",
              body: "Real-time live platform previews, character constraint warnings, image optimization, and smart AI prompt helpers.",
              color: "text-emerald-400",
              bg: "bg-emerald-500/10 border-emerald-500/20",
            },
            {
              icon: Calendar,
              title: "Automated Queue Scheduler",
              body: "Schedule posts weeks ahead. Background execution guarantees reliable delivery even when you're offline.",
              color: "text-indigo-400",
              bg: "bg-indigo-500/10 border-indigo-500/20",
            },
            {
              icon: BarChart3,
              title: "Network Results & Pulse",
              body: "Monitor status logs for every network in real time — track published posts, failures, and account credentials.",
              color: "text-purple-400",
              bg: "bg-purple-500/10 border-purple-500/20",
            },
          ].map(({ icon: Icon, title, body, color, bg }) => (
            <div
              key={title}
              className="surface-glass p-8 surface-glass-hover flex flex-col justify-between"
            >
              <div>
                <div className={`size-12 rounded-2xl border ${bg} grid place-items-center mb-6`}>
                  <Icon className={`size-6 ${color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">SocialSync Quantum Studio</span>
            <span>· Built for teams that ship consistently.</span>
          </div>
          <div>© {new Date().getFullYear()} SocialSync Inc. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

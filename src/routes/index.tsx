import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Radio,
  Send,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Linkedin,
  Twitter,
  Instagram,
  CheckCircle2,
  Zap,
  BarChart2,
  Lock,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Broadcast — Publish to LinkedIn, X & Instagram from one studio" },
      {
        name: "description",
        content:
          "Compose once, schedule everywhere. A studio-grade social publishing platform for creators and teams.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [signedIn, setSignedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "linkedin" | "twitter" | "instagram">("all");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
  }, []);

  return (
    <div className="relative min-h-screen bg-background bg-hero text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      {/* Dynamic Background Mesh Orbs */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/20 via-accent/15 to-transparent blur-3xl" />

      {/* Glass Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 font-display text-xl font-bold tracking-tight">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-gradient shadow-glow-cyan transition-transform hover:scale-105">
              <Radio className="size-5 text-primary-foreground" />
            </span>
            <span className="flex items-center gap-1.5">
              Broadcast
              <span className="rounded-md bg-primary/10 px-2 py-0.5 font-sans text-xs font-semibold text-primary">
                PRO
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            {signedIn ? (
              <Button asChild size="sm" className="bg-brand-gradient shadow-glow font-medium transition-all hover:opacity-95">
                <Link to="/dashboard">
                  Open Studio <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild size="sm" className="bg-brand-gradient font-semibold shadow-glow transition-all hover:scale-[1.02]">
                  <Link to="/auth" search={{ mode: "signup" }}>
                    Get started free
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6">
        {/* Hero Section */}
        <section className="relative mx-auto max-w-4xl pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary shadow-glow-cyan backdrop-blur-md">
            <Sparkles className="size-3.5 animate-pulse text-primary" />
            <span>Next-Gen Multi-Platform Social Orchestration</span>
          </div>

          <h1 className="mt-8 font-display text-5xl font-extrabold tracking-tight sm:text-7xl">
            Compose once. <br />
            <span className="text-brand-gradient">Broadcast</span> everywhere.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Plan, schedule, and publish seamlessly to LinkedIn, X, and Instagram from one unified, sleek studio. Live character counts, visual previews, and guaranteed delivery.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-brand-gradient text-base font-semibold shadow-glow hover:opacity-95">
              <Link to="/auth" search={{ mode: "signup" }}>
                Start Publishing Free <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border/60 bg-card/40 backdrop-blur-md hover:bg-card/80">
              <Link to="/auth">Explore Demo</Link>
            </Button>
          </div>

          {/* Social Platform Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 rounded-full border border-border/50 bg-card/30 px-3.5 py-1.5 backdrop-blur">
              <Linkedin className="size-4 text-[#0A66C2]" /> LinkedIn Posts & Articles
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/50 bg-card/30 px-3.5 py-1.5 backdrop-blur">
              <Twitter className="size-4 text-[#1DA1F2]" /> X (Twitter) Threads
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/50 bg-card/30 px-3.5 py-1.5 backdrop-blur">
              <Instagram className="size-4 text-[#E4405F]" /> Instagram Captions
            </div>
          </div>
        </section>

        {/* Live Studio Interactive Mockup Showcase */}
        <section className="relative mx-auto max-w-5xl pb-24">
          <div className="glass-panel overflow-hidden rounded-2xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between border-b border-border/40 pb-5 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-destructive/60" />
                  <div className="size-3 rounded-full bg-warning/60" />
                  <div className="size-3 rounded-full bg-success/60" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">broadcast.studio/composer</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-card/60 p-1 border border-border/40">
                {(["all", "linkedin", "twitter", "instagram"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all ${
                      activeTab === tab
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-12">
              <div className="md:col-span-7 space-y-4">
                <div className="rounded-xl border border-border/50 bg-card/40 p-4">
                  <p className="font-mono text-xs text-muted-foreground mb-2">Compose Master Post:</p>
                  <p className="text-sm leading-relaxed text-foreground font-sans">
                    🚀 Excited to announce our upcoming feature suite for multi-channel social publishing! Broadcast lets you schedule posts directly to LinkedIn, X & Instagram simultaneously. #SocialMedia #Productivity
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-success" /> Auto-sync enabled</span>
                  <span>214 / 280 characters</span>
                </div>
              </div>
              <div className="md:col-span-5 flex flex-col justify-between rounded-xl border border-primary/20 bg-primary/5 p-4 backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Live Preview</span>
                  <span className="flex size-2 rounded-full bg-success animate-ping" />
                </div>
                <div className="my-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <Linkedin className="size-4 text-[#0A66C2]" /> LinkedIn Post Ready
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <Twitter className="size-4 text-[#1DA1F2]" /> X Tweet Ready
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <Instagram className="size-4 text-[#E4405F]" /> Instagram Post Ready
                  </div>
                </div>
                <Button size="sm" className="w-full bg-brand-gradient font-medium text-xs shadow-glow">
                  Schedule Post <Send className="ml-1.5 size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features Grid */}
        <section className="grid gap-6 pb-28 sm:grid-cols-3">
          {[
            {
              icon: Send,
              title: "Unified Studio Composer",
              body: "Simultaneous composition with dynamic character meters per platform, custom image drops, and instant tag recommendations.",
            },
            {
              icon: Calendar,
              title: "Durable Background Scheduler",
              body: "Set up queue slots weeks in advance. Reliable automated publishing powered by Supabase edge infrastructure.",
            },
            {
              icon: Layers,
              title: "Platform-Specific Insights",
              body: "Detailed real-time logs for every channel — trace publishing confirmations, errors, and reach from one dashboard.",
            },
            {
              icon: Zap,
              title: "Instant Account Syncing",
              body: "Connect your social profiles safely in seconds with tokenized authentication and automatic key refreshing.",
            },
            {
              icon: BarChart2,
              title: "Performance Analytics",
              body: "Track post frequency, timing success rates, and active content queues with clean visual metrics.",
            },
            {
              icon: Lock,
              title: "Enterprise Grade Security",
              body: "Row-Level Security (RLS) ensures your drafts and API keys remain encrypted and restricted to your account.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="glass-card glass-card-hover p-7">
              <div className="grid size-11 place-items-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-5 text-xl font-bold font-display">{title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Studio Footer */}
      <footer className="border-t border-border/40 bg-background/40 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-md bg-brand-gradient text-primary-foreground font-bold">
              B
            </span>
            <span>Broadcast Studio · Multi-Platform Social Orchestration</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-success" /> All Systems Operational
            </span>
            <Link to="/auth" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link to="/auth" search={{ mode: "signup" }} className="hover:text-foreground transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


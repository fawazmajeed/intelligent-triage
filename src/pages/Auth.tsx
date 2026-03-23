import { useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Sparkles,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Activity,
  Layers,
  Brain,
  Clock,
  TrendingUp,
  RefreshCw,
  MessageSquareWarning,
  Calculator,
  Users,
  Target,
  GitBranch,
} from "lucide-react";

const PLATFORMS = [
  "ServiceNow",
  "Jira",
  "Zendesk",
  "Freshservice",
  "ManageEngine",
  "Zoho Desk",
  "BMC Helix",
  "SolarWinds",
  "HaloITSM",
];

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Triage",
    desc: "Automatically categorize, prioritize, and route tickets using contextual AI trained on your organization's data — no manual rules needed.",
  },
  {
    icon: RefreshCw,
    title: "Self-Learning Feedback Loop",
    desc: "Every human correction becomes training data. The AI learns YOUR reality over time — correction rates drop as accuracy climbs.",
  },
  {
    icon: Calculator,
    title: "Real-Time ROI Calculator",
    desc: "See actual hours saved, FTE equivalents, and dollar values — not just 'efficiency.' Pre-filled from your live ticket data.",
  },
  {
    icon: Layers,
    title: "Multi-Platform Unification",
    desc: "Jira for dev, ServiceNow for support, Zendesk for customers? One triage layer across all 9+ ITSM tools.",
  },
  {
    icon: MessageSquareWarning,
    title: "Human-in-the-Loop Review",
    desc: "Low-confidence tickets (< 75%) are flagged for human review. No black-box guessing — operators stay in control.",
  },
  {
    icon: BarChart3,
    title: "Feedback Analytics Dashboard",
    desc: "Track correction rates, misclassification patterns, and AI accuracy trends. See exactly where the model needs more training.",
  },
];

const STATS = [
  { value: "94%", label: "Triage Accuracy" },
  { value: "< 2s", label: "Avg Response Time" },
  { value: "73%", label: "Cost Reduction" },
  { value: "9+", label: "ITSM Integrations" },
];

const QUEUE_PREVIEW = [
  { id: "INC-4821", desc: "VPN tunnel drops during peak hours", severity: "Critical", team: "Network Ops", confidence: 96 },
  { id: "INC-4822", desc: "SSO authentication failing for Azure AD", severity: "High", team: "Identity & Access", confidence: 91 },
  { id: "INC-4823", desc: "Printer queue stalled on 3rd floor", severity: "Low", team: "Desktop Support", confidence: 88 },
  { id: "INC-4824", desc: "SAP module timeout during payroll run", severity: "Critical", team: "ERP Support", confidence: 94 },
  { id: "INC-4825", desc: "New hire laptop provisioning request", severity: "Medium", team: "Asset Mgmt", confidence: 85 },
];

const FEEDBACK_LOOP_STEPS = [
  {
    step: "01",
    icon: Zap,
    title: "AI Predicts",
    desc: "Incoming ticket is auto-categorized with severity, team routing, and confidence score in under 2 seconds.",
  },
  {
    step: "02",
    icon: MessageSquareWarning,
    title: "Human Reviews",
    desc: "Low-confidence tickets get flagged. Operators correct category, severity, or routing with one click.",
  },
  {
    step: "03",
    icon: GitBranch,
    title: "Correction Stored",
    desc: "Every correction is captured as a training example — what the AI predicted vs. what the expert chose.",
  },
  {
    step: "04",
    icon: Target,
    title: "Model Improves",
    desc: "Next prediction uses your corrections. Correction rates decline weekly. Your AI gets smarter with every ticket.",
  },
];

export default function Auth() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { organization_name: orgName || undefined },
          },
        });
        if (error) throw error;
        toast({
          title: "Check your email",
          description: "We sent a verification link. Please confirm your email to sign in.",
        });
        return;
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const severityColor = (s: string) => {
    if (s === "Critical") return "severity-critical";
    if (s === "High") return "severity-high";
    if (s === "Medium") return "severity-medium";
    return "severity-low";
  };

  return (
    <div className="min-h-screen bg-background grid-pattern overflow-auto">
      {/* ─── Hero Section ─── */}
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-12 pb-8">
          {/* Nav */}
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold text-foreground font-mono">TriageFlow AI</span>
            </div>
            <Badge variant="outline" className="text-primary border-primary/30 font-mono text-[10px]">
              <Activity className="w-3 h-3 mr-1" /> PLATFORM ACTIVE
            </Badge>
          </div>

          {/* Hero content */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="space-y-3">
                <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-[10px] uppercase tracking-wider">
                  AI-Powered ITSM Automation
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-[1.1] tracking-tight">
                  One AI Brain for
                  <span className="text-primary block">All Your ITSM Tools</span>
                </h1>
                <p className="text-muted-foreground text-base leading-relaxed max-w-lg">
                  Stop switching between ServiceNow, Jira, and Zendesk. TriageFlow AI unifies your ticket queues,
                  auto-categorizes incidents, and routes them to the right team — in under 2 seconds. With a self-learning
                  feedback loop that gets smarter from every correction.
                </p>
              </div>

              {/* Stats ribbon */}
              <div className="grid grid-cols-4 gap-3">
                {STATS.map((s) => (
                  <div key={s.label} className="text-center p-3 rounded-lg bg-card/60 border border-border/50 backdrop-blur-sm">
                    <div className="text-xl font-bold text-primary font-mono">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Platform logos */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                  Connects with your existing stack
                </p>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <span
                      key={p}
                      className="px-2.5 py-1 text-[11px] font-mono rounded-md bg-muted/60 text-muted-foreground border border-border/50 hover:border-primary/40 hover:text-primary transition-colors"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Auth card */}
            <div className="lg:pl-8">
              <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-xl glow-primary">
                <CardContent className="p-6">
                  <div className="text-center mb-5">
                    <h2 className="text-lg font-bold text-foreground">
                      {isLogin ? "Welcome Back" : "Start Free Trial"}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isLogin ? "Sign in to your dashboard" : "7 days free · No credit card required"}
                    </p>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    {!isLogin && (
                      <div>
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-mono">
                          Organization Name
                        </Label>
                        <Input
                          placeholder="Acme Corp IT"
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          className="bg-muted/50 border-border h-9 text-sm"
                        />
                      </div>
                    )}
                    <div>
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-mono">
                        Email
                      </Label>
                      <Input
                        type="email"
                        required
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-muted/50 border-border h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block font-mono">
                        Password
                      </Label>
                      <Input
                        type="password"
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-muted/50 border-border h-9 text-sm"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 font-semibold"
                    >
                      {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {isLogin ? "Sign In" : "Start Free Trial"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                  </div>
                  {!isLogin && (
                    <div className="mt-4 space-y-1.5">
                      {[
                        "7-day free trial",
                        "Connect unlimited ITSM tools",
                        "Self-learning feedback loop included",
                        "Real-time ROI visibility from day one",
                      ].map((t) => (
                        <div key={t} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                          {t}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Live Queue Preview ─── */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-[10px] uppercase tracking-wider mb-3">
            <Activity className="w-3 h-3 mr-1" /> Live Preview
          </Badge>
          <h2 className="text-2xl font-bold text-foreground">See AI Triage in Action</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Every ticket is instantly categorized, severity-assessed, and routed — with confidence scoring and human review flags.
          </p>
        </div>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-3 text-[10px] uppercase tracking-wider text-muted-foreground font-mono font-medium">Ticket</th>
                  <th className="text-left p-3 text-[10px] uppercase tracking-wider text-muted-foreground font-mono font-medium">Description</th>
                  <th className="text-left p-3 text-[10px] uppercase tracking-wider text-muted-foreground font-mono font-medium">Severity</th>
                  <th className="text-left p-3 text-[10px] uppercase tracking-wider text-muted-foreground font-mono font-medium">Routed To</th>
                  <th className="text-right p-3 text-[10px] uppercase tracking-wider text-muted-foreground font-mono font-medium">AI Confidence</th>
                </tr>
              </thead>
              <tbody>
                {QUEUE_PREVIEW.map((t, i) => (
                  <tr key={t.id} className={`border-b border-border/30 ${i % 2 === 0 ? "bg-muted/20" : ""}`}>
                    <td className="p-3 font-mono text-xs text-primary">{t.id}</td>
                    <td className="p-3 text-foreground text-xs">{t.desc}</td>
                    <td className="p-3">
                      <span className={`${severityColor(t.severity)} text-[11px] font-mono px-2 py-0.5 rounded border`}>
                        {t.severity}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground font-mono">{t.team}</td>
                    <td className="p-3 text-right">
                      <span className="text-xs font-mono text-primary font-semibold">{t.confidence}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-border/30 flex items-center justify-between bg-muted/30">
            <span className="text-[10px] text-muted-foreground font-mono">
              <Clock className="w-3 h-3 inline mr-1" /> Avg triage time: 1.8s
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              Showing sample queue · <span className="text-primary">Sign up to see your live data</span>
            </span>
          </div>
        </Card>
      </div>

      {/* ─── Feedback Loop Section ─── */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-[10px] uppercase tracking-wider mb-3">
            <RefreshCw className="w-3 h-3 mr-1" /> Continuous Learning
          </Badge>
          <h2 className="text-2xl font-bold text-foreground">The Feedback Loop That Actually Works</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            Most AI tools learn from generic data. TriageFlow learns from YOUR team's corrections — 
            every fix makes the next prediction better.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {FEEDBACK_LOOP_STEPS.map((s, i) => (
            <div key={s.step} className="relative p-5 rounded-lg border border-border/50 bg-card/40 backdrop-blur-sm">
              <div className="text-[40px] font-bold text-primary/10 font-mono absolute top-3 right-4">{s.step}</div>
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">{s.title}</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{s.desc}</p>
              {i < FEEDBACK_LOOP_STEPS.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 text-primary/40">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Feedback loop value props */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-card/40 border border-border/50">
            <p className="text-2xl font-bold text-primary font-mono">↓ Week-over-Week</p>
            <p className="text-xs text-muted-foreground mt-1">Correction rates decline as AI learns your patterns</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-card/40 border border-border/50">
            <p className="text-2xl font-bold text-primary font-mono">0 Black Boxes</p>
            <p className="text-xs text-muted-foreground mt-1">See exactly what was corrected, when, and by whom</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-card/40 border border-border/50">
            <p className="text-2xl font-bold text-primary font-mono">Full Audit Trail</p>
            <p className="text-xs text-muted-foreground mt-1">Misclassification patterns and training data — all visible</p>
          </div>
        </div>
      </div>

      {/* ─── ROI Section ─── */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-[10px] uppercase tracking-wider mb-3">
            <Calculator className="w-3 h-3 mr-1" /> ROI Visibility
          </Badge>
          <h2 className="text-2xl font-bold text-foreground">Show the CFO Real Numbers</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            No more staring at a blank screen when asked "What's the ROI?" Built-in calculator 
            pre-filled from your live ticket data — hours saved, FTE equivalents, and dollar values.
          </p>
        </div>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xl font-bold text-primary font-mono">$46,667</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Monthly Savings</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-xl font-bold text-foreground font-mono">667h</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Hours Recovered</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-xl font-bold text-foreground font-mono">4.2</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">FTE Equivalent</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground font-mono">
                  Based on 5,000 tickets/month · 8 min/ticket · $70/hr avg rate · Fully configurable in Settings
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Features Grid ─── */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">Everything You Need for Smarter Triage</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Not a replacement for your ITSM tools — an intelligent layer that makes them work better together.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <Card key={f.title} className="border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-colors group">
              <CardContent className="p-5 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ─── How It Works ─── */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">Up and Running in 3 Steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              icon: Layers,
              title: "Connect Your ITSM Tools",
              desc: "Toggle on your platforms — ServiceNow, Jira, Zendesk, and more. Webhook endpoints are pre-configured for each.",
            },
            {
              step: "02",
              icon: Users,
              title: "Test & Train",
              desc: "Submit test tickets manually or simulate traffic. Upload historical data. The AI learns your categories and routing patterns.",
            },
            {
              step: "03",
              icon: Shield,
              title: "Triage & Improve",
              desc: "New tickets are auto-classified in real-time. Review low-confidence flags, correct edge cases — the feedback loop does the rest.",
            },
          ].map((s) => (
            <div key={s.step} className="relative p-5 rounded-lg border border-border/50 bg-card/40 backdrop-blur-sm">
              <div className="text-[40px] font-bold text-primary/10 font-mono absolute top-3 right-4">{s.step}</div>
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">{s.title}</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── What This Is NOT ─── */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-foreground">What This is NOT</h2>
            <p className="text-xs text-muted-foreground mt-1">Full transparency — we believe in honest R&D</p>
          </div>
          <div className="space-y-3">
            {[
              { text: "A pitch to throw away your current ITSM tools", detail: "It's an augmentation layer, not a replacement" },
              { text: "Hype noise claiming AI will solve everything", detail: "Human-in-the-loop is baked in by design" },
              { text: "A black box with no visibility", detail: "Every prediction, correction, and metric is fully transparent" },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3 p-3 rounded-lg bg-card/40 border border-border/50">
                <span className="text-destructive text-sm mt-0.5">✕</span>
                <div>
                  <p className="text-sm text-foreground font-medium">{item.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Footer CTA ─── */}
      <div className="max-w-6xl mx-auto px-6 py-12 text-center">
        <div className="p-8 rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-foreground mb-2">Ready to make your Monday mornings a little more chill?</h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
            Join IT teams who reduced manual triage by 73%, with a feedback loop that gets smarter every week.
          </p>
          <Button
            onClick={() => {
              setIsLogin(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 font-semibold"
          >
            Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-6 font-mono">
          © 2026 TriageFlow AI · R&D-driven ITSM automation · Built with 16 years of service desk experience
        </p>
      </div>
    </div>
  );
}
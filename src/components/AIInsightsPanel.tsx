import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { type Ticket, sourceIcons } from "@/lib/mock-data";
import { Brain, ArrowRight, AlertTriangle, Users, Zap } from "lucide-react";

interface AIInsightsPanelProps {
  ticket: Ticket | null;
  onClose: () => void;
}

export function AIInsightsPanel({ ticket, onClose }: AIInsightsPanelProps) {
  if (!ticket) return null;

  const confidencePct = Math.round(ticket.confidence_score * 100);

  return (
    <Sheet open={!!ticket} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg bg-card border-border overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-5 h-5 text-primary" />
            <SheetTitle className="text-foreground">AI Triage Analysis</SheetTitle>
          </div>
          <SheetDescription className="font-mono text-xs">
            {ticket.id} · {sourceIcons[ticket.source_system]} {ticket.source_system}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Raw Input */}
          <section>
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Raw User Complaint</h3>
            <div className="bg-muted/50 border border-border rounded-md p-3">
              <p className="text-sm text-foreground/80 leading-relaxed">{ticket.raw_description}</p>
            </div>
          </section>

          {/* Arrow */}
          <div className="flex items-center justify-center gap-2 text-primary">
            <div className="h-px flex-1 bg-border" />
            <Zap className="w-4 h-4" />
            <span className="text-[10px] font-mono uppercase tracking-wider">AI Processing</span>
            <Zap className="w-4 h-4" />
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Structured Output */}
          <section>
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Structured AI Output</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Category</span>
                <Badge variant="secondary" className="font-mono text-xs">{ticket.predicted_category}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Severity</span>
                <Badge variant={ticket.predicted_severity === "Critical" ? "destructive" : "secondary"} className="font-mono text-xs">
                  {ticket.predicted_severity}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Routing Group</span>
                <span className="text-xs font-medium flex items-center gap-1 text-foreground">
                  <Users className="w-3 h-3 text-primary" />
                  {ticket.predicted_team}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Business Impact</span>
                <span className="text-xs font-medium text-foreground">{ticket.business_impact.split(" - ")[0]}</span>
              </div>
            </div>
          </section>

          {/* Confidence Score */}
          <section>
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">AI Confidence Score</h3>
            <div className="bg-muted/50 border border-border rounded-md p-4">
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-bold font-mono text-primary">{confidencePct}%</span>
                <span className="text-[10px] text-muted-foreground">
                  {confidencePct >= 90 ? "High Confidence" : confidencePct >= 75 ? "Moderate" : "Low Confidence"}
                </span>
              </div>
              <Progress value={confidencePct} className="h-2" />
            </div>
          </section>

          {/* AI Reasoning */}
          <section>
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Brain className="w-3 h-3 text-primary" />
              AI Reasoning
            </h3>
            <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
              <p className="text-xs text-foreground/80 leading-relaxed">{ticket.ai_reasoning}</p>
            </div>
          </section>

          {/* Business Impact Detail */}
          <section>
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-warning" />
              Business Impact Assessment
            </h3>
            <div className="bg-muted/50 border border-border rounded-md p-3">
              <p className="text-xs text-foreground/80">{ticket.business_impact}</p>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

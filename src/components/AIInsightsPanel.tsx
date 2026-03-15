import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { type Ticket, sourceIcons } from "@/lib/mock-data";
import { Brain, AlertTriangle, Users, Zap, FileInput, FileOutput, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface AIInsightsPanelProps {
  ticket: Ticket | null;
  onClose: () => void;
}

function buildWebhookPayload(ticket: Ticket) {
  return {
    webhook_event: "ticket.created",
    source: ticket.source_system,
    timestamp: ticket.created_at,
    payload: {
      ticket_id: ticket.id,
      description: ticket.raw_description,
      source_system: ticket.source_system,
    },
  };
}

function buildResponsePayload(ticket: Ticket) {
  return {
    method: "PATCH",
    endpoint: `https://${ticket.source_system.toLowerCase().replace(/\s+/g, "")}.example.com/api/tickets/${ticket.id.slice(0, 8)}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer ••••••••",
    },
    body: {
      predicted_category: ticket.predicted_category,
      predicted_severity: ticket.predicted_severity,
      predicted_team: ticket.predicted_team,
      confidence_score: ticket.confidence_score,
      business_impact: ticket.business_impact,
      triaged_by: "TriageFlow AI",
      triaged_at: new Date().toISOString(),
    },
    status: ticket.synced_back_to_source ? 200 : null,
    synced: ticket.synced_back_to_source,
  };
}

export function AIInsightsPanel({ ticket, onClose }: AIInsightsPanelProps) {
  const [showRawInput, setShowRawInput] = useState(false);
  const [showRawOutput, setShowRawOutput] = useState(false);

  if (!ticket) return null;

  const confidencePct = Math.round((ticket.confidence_score ?? 0) * 100);
  const webhookPayload = buildWebhookPayload(ticket);
  const responsePayload = buildResponsePayload(ticket);

  return (
    <Sheet open={!!ticket} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg bg-card border-border overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-5 h-5 text-primary" />
            <SheetTitle className="text-foreground">AI Triage Analysis</SheetTitle>
          </div>
          <SheetDescription className="font-mono text-xs">
            {ticket.id.slice(0, 8)} · {sourceIcons[ticket.source_system] ?? "⚪"} {ticket.source_system}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <section>
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Raw User Complaint</h3>
            <div className="bg-muted/50 border border-border rounded-md p-3">
              <p className="text-sm text-foreground/80 leading-relaxed">{ticket.raw_description}</p>
            </div>
          </section>

          <div className="flex items-center justify-center gap-2 text-primary">
            <div className="h-px flex-1 bg-border" />
            <Zap className="w-4 h-4" />
            <span className="text-[10px] font-mono uppercase tracking-wider">AI Processing</span>
            <Zap className="w-4 h-4" />
            <div className="h-px flex-1 bg-border" />
          </div>

          <section>
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Structured AI Output</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Category</span>
                <Badge variant="secondary" className="font-mono text-xs">{ticket.predicted_category ?? "—"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Severity</span>
                <Badge variant={ticket.predicted_severity === "Critical" ? "destructive" : "secondary"} className="font-mono text-xs">
                  {ticket.predicted_severity ?? "—"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Routing Group</span>
                <span className="text-xs font-medium flex items-center gap-1 text-foreground">
                  <Users className="w-3 h-3 text-primary" />
                  {ticket.predicted_team ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Business Impact</span>
                <span className="text-xs font-medium text-foreground">{ticket.business_impact?.split(" - ")[0] ?? "—"}</span>
              </div>
            </div>
          </section>

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

          <section>
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-warning" />
              Business Impact Assessment
            </h3>
            <div className="bg-muted/50 border border-border rounded-md p-3">
              <p className="text-xs text-foreground/80">{ticket.business_impact ?? "No impact assessment available"}</p>
            </div>
          </section>

          {/* Raw Webhook Input */}
          <section>
            <button
              onClick={() => setShowRawInput(!showRawInput)}
              className="w-full flex items-center justify-between text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <FileInput className="w-3 h-3 text-primary" />
                Raw Webhook Input (Inbound)
              </span>
              {showRawInput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showRawInput && (
              <div className="bg-muted/50 border border-border rounded-md p-3 overflow-x-auto">
                <pre className="text-[11px] font-mono text-foreground/70 whitespace-pre-wrap break-all leading-relaxed">
                  {JSON.stringify(webhookPayload, null, 2)}
                </pre>
              </div>
            )}
          </section>

          {/* Raw Response Output */}
          <section>
            <button
              onClick={() => setShowRawOutput(!showRawOutput)}
              className="w-full flex items-center justify-between text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <FileOutput className="w-3 h-3 text-primary" />
                Raw API Response (Outbound to {ticket.source_system})
              </span>
              {showRawOutput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showRawOutput && (
              <div className="bg-muted/50 border border-border rounded-md p-3 overflow-x-auto">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={ticket.synced_back_to_source ? "default" : "outline"}
                    className={`text-[9px] font-mono ${ticket.synced_back_to_source ? "bg-success/15 text-success border-success/30" : "text-warning border-warning/30"}`}
                  >
                    {ticket.synced_back_to_source ? "200 OK — Synced" : "Pending — Not yet sent"}
                  </Badge>
                </div>
                <pre className="text-[11px] font-mono text-foreground/70 whitespace-pre-wrap break-all leading-relaxed">
                  {JSON.stringify(responsePayload, null, 2)}
                </pre>
              </div>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

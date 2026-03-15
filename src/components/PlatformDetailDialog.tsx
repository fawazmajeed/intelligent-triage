import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, XCircle, ArrowRight, Unplug, RefreshCw, ShieldCheck, Power, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlatformDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: {
    name: string;
    source: string;
    icon: string;
    tier?: string;
  };
  ticketCount: number;
  isActive: boolean;
  connectedAt?: string;
  webhookUrl: string;
  organizationId?: string;
  onConnectionChange: () => void;
}

const connectionGuides: Record<string, { steps: string[]; disconnectSteps: string[] }> = {
  Jira: {
    steps: [
      "Log in to your Jira Cloud instance as an admin.",
      "Navigate to Settings → System → Webhooks.",
      "Click 'Create a webhook' and paste the TriageFlow Webhook URL shown above.",
      "Select events: Issue Created, Issue Updated.",
      "Set the JQL filter to the project(s) you want to triage (e.g. project = ITSM).",
      "Under 'Headers', add: Authorization: Bearer <your_triageflow_api_key> (found in TriageFlow Settings).",
      "Save the webhook and send a test event to verify connectivity.",
    ],
    disconnectSteps: [
      "Navigate to Settings → System → Webhooks in your Jira Cloud admin.",
      "Find the TriageFlow webhook and click Delete or Disable.",
    ],
  },
  ServiceNow: {
    steps: [
      "Log in to your ServiceNow instance as an admin.",
      "Navigate to System Web Services → Outbound → REST Message.",
      "Create a new REST message named 'TriageFlow AI'.",
      "Set the Endpoint to the TriageFlow Webhook URL shown above.",
      "Add an HTTP Header: Authorization = Bearer <your_triageflow_api_key>.",
      "Create a default POST HTTP Method with Content-Type: application/json.",
      "Create a Business Rule on the Incident table (on insert) that calls this REST message with the ticket payload.",
    ],
    disconnectSteps: [
      "Deactivate the Business Rule on the Incident table that triggers the REST message.",
      "Optionally delete the 'TriageFlow AI' REST Message under System Web Services → Outbound.",
    ],
  },
  Zendesk: {
    steps: [
      "Log in to Zendesk Admin Center.",
      "Go to Apps and Integrations → Webhooks → Create webhook.",
      "Name it 'TriageFlow AI' and set the Endpoint URL to the webhook URL above.",
      "Set Request method: POST, Request format: JSON.",
      "Add header: Authorization = Bearer <your_triageflow_api_key>.",
      "Go to Business Rules → Triggers → Add trigger.",
      "Set conditions (e.g. 'Ticket is Created') and action 'Notify webhook → TriageFlow AI' with ticket JSON body.",
    ],
    disconnectSteps: [
      "Go to Admin Center → Webhooks, find 'TriageFlow AI', and delete it.",
      "Remove the associated trigger under Business Rules → Triggers.",
    ],
  },
  Freshservice: {
    steps: [
      "Log in to Freshservice as an admin.",
      "Go to Admin → Workflow Automator → Create new automator.",
      "Set the event trigger to 'Ticket is created'.",
      "Add action: 'Trigger Webhook'.",
      "Set the Request Type to POST and paste the TriageFlow Webhook URL.",
      "Add header: Authorization = Bearer <your_triageflow_api_key>.",
      "Map ticket fields (description, priority, requester) to the JSON body and activate the automator.",
    ],
    disconnectSteps: [
      "Go to Admin → Workflow Automator and find the TriageFlow rule.",
      "Deactivate or delete the workflow automator.",
    ],
  },
  ManageEngine: {
    steps: [
      "Log in to ManageEngine ServiceDesk Plus as an admin.",
      "Navigate to Admin → Developer Space → Webhooks.",
      "Click 'Add Webhook' and name it 'TriageFlow AI'.",
      "Set the Callback URL to the TriageFlow Webhook URL shown above.",
      "Set Method to POST and Content-Type to application/json.",
      "Add header: Authorization = Bearer <your_triageflow_api_key>.",
      "Select the events to trigger on: Request Created, Request Updated.",
      "Map the payload fields (subject, description, priority, site) and save the webhook.",
    ],
    disconnectSteps: [
      "Navigate to Admin → Developer Space → Webhooks.",
      "Find the 'TriageFlow AI' webhook and delete or disable it.",
    ],
  },
  ZohoDesk: {
    steps: [
      "Log in to Zoho Desk as an admin.",
      "Go to Setup → Developer Space → Webhooks.",
      "Click 'Create Webhook' and name it 'TriageFlow AI'.",
      "Set the URL to the TriageFlow Webhook URL shown above.",
      "Set Method to POST and Authentication to 'Custom Header': Authorization = Bearer <your_triageflow_api_key>.",
      "Under 'Entity', select 'Tickets' and event 'Create'.",
      "Configure the payload with ticket fields (subject, description, priority, department) and enable the webhook.",
    ],
    disconnectSteps: [
      "Go to Setup → Developer Space → Webhooks.",
      "Find 'TriageFlow AI' and delete or disable the webhook.",
    ],
  },
  BMCHelix: {
    steps: [
      "Log in to BMC Helix ITSM as an admin.",
      "Navigate to Administration → Integration → Webhook Definitions.",
      "Click 'Register Webhook' and set the name to 'TriageFlow AI'.",
      "Set the Callback URL to the TriageFlow Webhook URL shown above.",
      "Select events: Create Record (Incident form).",
      "Configure payload fields (Description, Impact, Urgency, Assigned Group) using payloadFieldIds.",
      "Add OAuth 2.0 or custom header authentication: Authorization = Bearer <your_triageflow_api_key>.",
      "Save and test the webhook registration with a sample incident.",
    ],
    disconnectSteps: [
      "Navigate to Administration → Integration → Webhook Definitions.",
      "Find the 'TriageFlow AI' webhook and delete it via the DELETE API or admin UI.",
    ],
  },
  SolarWinds: {
    steps: [
      "Log in to SolarWinds Service Desk as an admin.",
      "Navigate to Setup → Integration → Webhooks.",
      "Click 'New Webhook' and name it 'TriageFlow AI'.",
      "Set the Target URL to the TriageFlow Webhook URL shown above.",
      "Set HTTP Method to POST and Content-Type to application/json.",
      "Add header: Authorization = Bearer <your_triageflow_api_key>.",
      "Select trigger events: Incident Created.",
      "Map the relevant fields (title, description, priority, category) and activate the webhook.",
    ],
    disconnectSteps: [
      "Navigate to Setup → Integration → Webhooks.",
      "Find the 'TriageFlow AI' webhook and delete or deactivate it.",
    ],
  },
  HaloITSM: {
    steps: [
      "Log in to your HaloITSM portal as an admin.",
      "Navigate to Configuration (gear icon) → Integrations → Webhooks.",
      "Click 'New' to create a new webhook.",
      "Set the Payload URL to the TriageFlow Webhook URL shown above.",
      "Set Method to POST and Content-Type to application/json.",
      "Add header: Authorization = Bearer <your_triageflow_api_key>.",
      "Configure the trigger event for 'Ticket Created' and map ticket fields to the JSON payload.",
      "Save and test the webhook with a sample ticket.",
    ],
    disconnectSteps: [
      "Navigate to Configuration → Integrations → Webhooks.",
      "Find the TriageFlow webhook and delete or disable it.",
    ],
  },
};

export default function PlatformDetailDialog({
  open,
  onOpenChange,
  platform,
  ticketCount,
  isActive,
  connectedAt,
  webhookUrl,
  organizationId,
  onConnectionChange,
}: PlatformDetailDialogProps) {
  const [toggling, setToggling] = useState(false);
  const { toast } = useToast();
  const guide = connectionGuides[platform.source];

  const handleToggleConnection = async (enable: boolean) => {
    if (!organizationId) return;
    setToggling(true);
    try {
      if (enable) {
        // Upsert: create or update to active
        const { error } = await supabase
          .from("integration_connections")
          .upsert(
            {
              organization_id: organizationId,
              platform_source: platform.source,
              is_active: true,
              connected_at: new Date().toISOString(),
              disconnected_at: null,
            },
            { onConflict: "organization_id,platform_source" }
          );
        if (error) throw error;
        toast({ title: `${platform.name} connected`, description: "Auto-sync is now active. Incoming tickets will be processed." });
      } else {
        const { error } = await supabase
          .from("integration_connections")
          .update({
            is_active: false,
            disconnected_at: new Date().toISOString(),
          })
          .eq("organization_id", organizationId)
          .eq("platform_source", platform.source);
        if (error) throw error;
        toast({ title: `${platform.name} disconnected`, description: "Auto-sync disabled. No new tickets will be processed from this platform." });
      }
      onConnectionChange();
    } catch (e) {
      toast({ title: "Error", description: String(e), variant: "destructive" });
    } finally {
      setToggling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{platform.icon}</span>
            <div>
              <DialogTitle className="text-base">{platform.name}</DialogTitle>
              <DialogDescription className="text-xs font-mono">
                Integration with TriageFlow AI
                {platform.tier && (
                  <Badge variant="outline" className="ml-2 text-[9px] py-0 px-1.5">
                    {platform.tier}
                  </Badge>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Connection Status & Toggle */}
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Auto-Sync Status</span>
              <div className="flex items-center gap-2">
                <Badge
                  variant={isActive ? "default" : "outline"}
                  className={`text-[10px] ${
                    isActive
                      ? "bg-success/15 text-success border-success/30"
                      : "bg-destructive/10 text-destructive border-destructive/30"
                  }`}
                >
                  {isActive ? (
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Active</span>
                  ) : (
                    <span className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Inactive</span>
                  )}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {toggling && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
              <Switch
                checked={isActive}
                onCheckedChange={handleToggleConnection}
                disabled={toggling}
              />
            </div>
          </div>

          {isActive && connectedAt && (
            <p className="text-[10px] text-muted-foreground">
              Connected since {new Date(connectedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          )}

          {ticketCount > 0 && (
            <div className="text-xs text-foreground/80 space-y-1 pt-1 border-t border-border/50">
              <p><span className="text-muted-foreground">Total tickets ingested:</span> <span className="font-semibold">{ticketCount}</span></p>
              <p><span className="text-muted-foreground">Source tag:</span> <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{platform.source}</code></p>
            </div>
          )}
        </div>

        <Separator />

        {/* How to Connect */}
        {!isActive && guide && (
          <>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-primary" /> How to Connect
              </h3>
              <p className="text-xs text-muted-foreground">
                Follow these steps in your <strong>{platform.name}</strong> admin, then toggle the switch above to enable auto-sync.
              </p>
              <div className="text-xs text-muted-foreground mb-2">
                Your TriageFlow webhook endpoint:
              </div>
              <code className="block bg-muted/50 border border-border rounded-md px-3 py-2 text-[10px] font-mono text-foreground/80 break-all">
                {webhookUrl}
              </code>
              <ol className="space-y-2 mt-3">
                {guide.steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-xs text-foreground/80">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <Separator />
          </>
        )}

        {/* How Data Flows Back */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary" /> How Categorized Data Is Sent Back
          </h3>
          <div className="text-xs text-foreground/80 space-y-2">
            <p>
              When a ticket is received, TriageFlow AI processes it instantly and returns the enriched data in the <strong>webhook response body</strong> (HTTP 200):
            </p>
            <code className="block bg-muted/50 border border-border rounded-md px-3 py-2 text-[10px] font-mono text-foreground/70 whitespace-pre">{`{
  "predicted_category": "Network",
  "predicted_severity": "High",
  "predicted_team": "Infrastructure",
  "confidence_score": 0.94,
  "business_impact": "Revenue-affecting"
}`}</code>
            <p>
              Your {platform.name} workflow can read this response and update the ticket fields automatically (category, priority, assignment group).
            </p>
          </div>
        </div>

        <Separator />

        {/* How to Disconnect */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Unplug className="w-4 h-4 text-destructive" /> How to Disconnect
          </h3>
          <div className="text-xs text-foreground/80 space-y-2">
            <p>To fully stop sending ticket data:</p>
            <ol className="space-y-1.5 ml-1">
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-[10px] font-bold mt-0.5">1</span>
                <span>Toggle the <strong>Auto-Sync</strong> switch above to <strong>off</strong> to disable processing in TriageFlow.</span>
              </li>
              {guide?.disconnectSteps.map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-[10px] font-bold mt-0.5">
                    {i + 2}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-[10px] font-bold mt-0.5">
                  {(guide?.disconnectSteps.length ?? 0) + 2}
                </span>
                <span>Existing data in TriageFlow remains available for audit and reporting.</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Security note */}
        <div className="rounded-lg border border-border bg-muted/20 p-3 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground">
            All data is transmitted over TLS. API keys can be rotated from the Settings page. TriageFlow does not store your platform credentials.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

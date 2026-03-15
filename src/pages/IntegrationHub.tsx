import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Webhook, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const platformDefs = [
  { name: "Jira Service Management", source: "Jira", icon: "🔵" },
  { name: "ServiceNow", source: "ServiceNow", icon: "🟢" },
  { name: "Zendesk", source: "Zendesk", icon: "🟡" },
  { name: "Freshservice", source: "Freshservice", icon: "🟣" },
];

const sampleDescriptions = [
  "VPN tunnel dropping every 15 minutes for remote sales team on Windows laptops",
  "SAP GUI login failing with SSO token expired error for 12 users in accounting",
  "Exchange mailbox quota exceeded for VP of Marketing, cannot send critical campaign emails",
  "AWS Lambda function timing out on payment processing microservice in prod",
  "Ransomware alert triggered on endpoint in HR department workstation",
  "Printer spooler service crashing on print server affecting entire 3rd floor",
  "Cisco switch port flapping on core switch causing intermittent network outages",
  "New hire needs Active Directory account, O365 license, and VPN access by Monday",
  "SQL Server replication lag of 45 minutes between primary and DR site",
  "Zoom Rooms firmware update bricked conference room displays in Building A",
  "Multi-factor authentication app not syncing codes after phone replacement",
  "SharePoint Online document library permissions broken after tenant migration",
  "Jenkins build pipeline failing with Docker registry authentication errors",
  "Citrix session disconnects during peak hours affecting 200+ call center agents",
  "SSL certificate on customer-facing portal expired, showing browser warnings",
];

export default function IntegrationHub() {
  const [copied, setCopied] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { organization } = useAuth();
  const webhookUrl = `https://api.triageflow.ai/webhooks/ingest/org_k7x9m2p4q1`;

  // Live platform stats from database
  const { data: platformStats } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("source_system");
      if (error) throw error;

      const counts: Record<string, number> = {};
      data.forEach((t) => {
        counts[t.source_system] = (counts[t.source_system] || 0) + 1;
      });
      return counts;
    },
    refetchInterval: 5000,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast({ title: "Webhook URL copied", description: "Paste this into your ITSM webhook configuration." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulate = async () => {
    if (!organization) {
      toast({ title: "No organization found", description: "Please log in again.", variant: "destructive" });
      return;
    }
    setSimulating(true);
    const sources = ["Jira", "ServiceNow", "Zendesk", "Freshservice"];
    const count = 3 + Math.floor(Math.random() * 3); // 3-5 tickets

    try {
      const promises = Array.from({ length: count }).map(() => {
        const desc = sampleDescriptions[Math.floor(Math.random() * sampleDescriptions.length)];
        const source = sources[Math.floor(Math.random() * sources.length)];

        return supabase.functions.invoke("categorize-ticket", {
          body: {
            raw_description: desc,
            source_system: source,
            organization_id: organization.id,
          },
        });
      });

      const results = await Promise.allSettled(promises);
      const succeeded = results.filter((r) => r.status === "fulfilled" && !(r.value as any).error).length;

      // Invalidate queries so the dashboard refreshes
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["ticket-count-roi"] });
      queryClient.invalidateQueries({ queryKey: ["platform-stats"] });

      toast({
        title: `Simulated ${succeeded} ticket${succeeded !== 1 ? "s" : ""}`,
        description: "AI categorized and routed the incoming incidents. Check the Live Queue.",
      });
    } catch (e) {
      toast({ title: "Simulation failed", description: String(e), variant: "destructive" });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Integration Hub</h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">Connect your ITSM platforms to the AI triage pipeline</p>
        </div>
        <Button
          onClick={handleSimulate}
          disabled={simulating}
          className="gap-2"
        >
          {simulating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {simulating ? "Simulating…" : "Simulate Incoming Traffic"}
        </Button>
      </div>

      {/* Webhook URL */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Webhook className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">Your Webhook Endpoint</CardTitle>
            </div>
            <CardDescription className="text-xs">Configure your ITSM tool to send ticket webhooks to this URL</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted/50 border border-border rounded-md px-3 py-2 text-xs font-mono text-foreground/80 truncate">
                {webhookUrl}
              </code>
              <Button size="sm" variant="outline" onClick={handleCopy} className="shrink-0">
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-4 text-[10px] text-muted-foreground font-mono">
              <span>Method: POST</span>
              <span>Format: JSON</span>
              <span>Auth: Bearer Token (see Settings)</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Connected Platforms — live from DB */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Connected Platforms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platformDefs.map((platform, i) => {
            const ticketCount = platformStats?.[platform.source] ?? 0;
            const status = ticketCount > 0 ? "connected" : "disconnected";

            return (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{platform.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{platform.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {ticketCount > 0
                              ? `${ticketCount} tickets ingested`
                              : "No tickets received yet"
                            }
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={status === "connected" ? "default" : "outline"}
                        className={`text-[10px] ${
                          status === "connected"
                            ? "bg-success/15 text-success border-success/30"
                            : ""
                        }`}
                      >
                        {status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

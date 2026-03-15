import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Webhook, Play, Loader2, PlusCircle, Send, X } from "lucide-react";
import PlatformDetailDialog from "@/components/PlatformDetailDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const platformDefs = [
  { name: "Jira Service Management", source: "Jira", icon: "🔵", tier: "Enterprise" },
  { name: "ServiceNow", source: "ServiceNow", icon: "🟢", tier: "Enterprise" },
  { name: "Zendesk", source: "Zendesk", icon: "🟡", tier: "SMB / Enterprise" },
  { name: "Freshservice", source: "Freshservice", icon: "🟣", tier: "SMB" },
  { name: "ManageEngine ServiceDesk Plus", source: "ManageEngine", icon: "🔴", tier: "SMB / Enterprise" },
  { name: "Zoho Desk", source: "ZohoDesk", icon: "🟠", tier: "SMB" },
  { name: "BMC Helix ITSM", source: "BMCHelix", icon: "⚫", tier: "Enterprise" },
  { name: "SolarWinds Service Desk", source: "SolarWinds", icon: "🟤", tier: "SMB / Enterprise" },
  { name: "HaloITSM", source: "HaloITSM", icon: "🔷", tier: "SMB" },
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
  const [selectedPlatform, setSelectedPlatform] = useState<typeof platformDefs[number] | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualDesc, setManualDesc] = useState("");
  const [manualSource, setManualSource] = useState("ServiceNow");
  const [submittingManual, setSubmittingManual] = useState(false);
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

  // Active connections from integration_connections table
  const { data: activeConnections } = useQuery({
    queryKey: ["integration-connections", organization?.id],
    queryFn: async () => {
      if (!organization) return {};
      const { data, error } = await supabase
        .from("integration_connections")
        .select("platform_source, is_active, connected_at")
        .eq("organization_id", organization.id);
      if (error) throw error;

      const map: Record<string, { is_active: boolean; connected_at: string }> = {};
      data.forEach((c) => {
        map[c.platform_source] = { is_active: c.is_active, connected_at: c.connected_at };
      });
      return map;
    },
    enabled: !!organization,
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
    const sources = ["Jira", "ServiceNow", "Zendesk", "Freshservice", "ManageEngine", "ZohoDesk", "BMCHelix", "SolarWinds", "HaloITSM"];
    const count = 3 + Math.floor(Math.random() * 3);

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

      {/* Connected Platforms */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">ITSM Platforms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platformDefs.map((platform, i) => {
            const ticketCount = platformStats?.[platform.source] ?? 0;
            const connection = activeConnections?.[platform.source];
            const isActive = connection?.is_active ?? false;

            return (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card
                  className="hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedPlatform(platform)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{platform.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{platform.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {ticketCount > 0
                                ? `${ticketCount} tickets ingested`
                                : "Click to setup"
                              }
                            </p>
                            <Badge variant="outline" className="text-[8px] py-0 px-1 h-3.5 border-muted-foreground/30 text-muted-foreground">
                              {platform.tier}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={isActive ? "default" : "outline"}
                        className={`text-[10px] ${
                          isActive
                            ? "bg-success/15 text-success border-success/30"
                            : ""
                        }`}
                      >
                        {isActive ? "syncing" : "inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Platform Detail Dialog */}
      {selectedPlatform && (
        <PlatformDetailDialog
          open={!!selectedPlatform}
          onOpenChange={(open) => !open && setSelectedPlatform(null)}
          platform={selectedPlatform}
          ticketCount={platformStats?.[selectedPlatform.source] ?? 0}
          isActive={activeConnections?.[selectedPlatform.source]?.is_active ?? false}
          connectedAt={activeConnections?.[selectedPlatform.source]?.connected_at}
          webhookUrl={webhookUrl}
          organizationId={organization?.id}
          onConnectionChange={() => {
            queryClient.invalidateQueries({ queryKey: ["integration-connections"] });
          }}
        />
      )}
    </div>
  );
}

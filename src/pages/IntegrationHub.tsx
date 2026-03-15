import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Webhook, Zap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const integrations = [
  { name: "Jira Service Management", icon: "🔵", status: "connected", tickets: 142 },
  { name: "ServiceNow", icon: "🟢", status: "connected", tickets: 89 },
  { name: "Zendesk", icon: "🟡", status: "pending", tickets: 0 },
  { name: "Freshservice", icon: "🟣", status: "disconnected", tickets: 0 },
];

export default function IntegrationHub() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const webhookUrl = `https://api.triageflow.ai/webhooks/ingest/org_k7x9m2p4q1`;

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast({ title: "Webhook URL copied", description: "Paste this into your ITSM webhook configuration." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-xl font-bold text-foreground">Integration Hub</h1>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">Connect your ITSM platforms to the AI triage pipeline</p>
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
        <h2 className="text-sm font-semibold text-foreground mb-3">Connected Platforms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((integration, i) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{integration.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {integration.status === "connected" 
                            ? `${integration.tickets} tickets ingested today`
                            : integration.status === "pending" ? "Awaiting first webhook" : "Not configured"
                          }
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={integration.status === "connected" ? "default" : "outline"}
                      className={`text-[10px] ${
                        integration.status === "connected" 
                          ? "bg-success/15 text-success border-success/30" 
                          : integration.status === "pending"
                          ? "bg-warning/15 text-warning border-warning/30"
                          : ""
                      }`}
                    >
                      {integration.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

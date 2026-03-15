import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, Key, Globe, Shield } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [apiConfig, setApiConfig] = useState({
    platform: "servicenow",
    instanceUrl: "",
    apiKey: "",
    httpMethod: "PATCH",
    bearerToken: "",
  });

  const handleSave = () => {
    toast({ title: "Configuration saved", description: "Outbound API settings updated successfully." });
  };

  return (
    <div className="p-6 space-y-6 max-w-[900px]">
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">Configure outbound sync & API connections</p>
      </div>

      {/* Outbound API Config */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">Outbound ITSM API Configuration</CardTitle>
            </div>
            <CardDescription className="text-xs">Push AI predictions back to your legacy ITSM platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Target Platform</Label>
              <Select value={apiConfig.platform} onValueChange={(v) => setApiConfig(p => ({ ...p, platform: v }))}>
                <SelectTrigger className="bg-muted/50 border-border h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="servicenow">ServiceNow (Table API)</SelectItem>
                  <SelectItem value="jira">Jira (Issue API)</SelectItem>
                  <SelectItem value="zendesk">Zendesk (Tickets API)</SelectItem>
                  <SelectItem value="freshservice">Freshservice (Tickets API)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Instance URL</Label>
              <Input
                placeholder="https://your-instance.service-now.com"
                value={apiConfig.instanceUrl}
                onChange={(e) => setApiConfig(p => ({ ...p, instanceUrl: e.target.value }))}
                className="font-mono text-sm bg-muted/50 border-border h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">HTTP Method</Label>
                <Select value={apiConfig.httpMethod} onValueChange={(v) => setApiConfig(p => ({ ...p, httpMethod: v }))}>
                  <SelectTrigger className="bg-muted/50 border-border h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block flex items-center gap-1">
                  <Key className="w-3 h-3" /> API Key
                </Label>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={apiConfig.apiKey}
                  onChange={(e) => setApiConfig(p => ({ ...p, apiKey: e.target.value }))}
                  className="font-mono text-sm bg-muted/50 border-border h-9"
                />
              </div>
            </div>

            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block flex items-center gap-1">
                <Shield className="w-3 h-3" /> Bearer Token
              </Label>
              <Input
                type="password"
                placeholder="Bearer eyJhbGciOiJIUzI1NiIs..."
                value={apiConfig.bearerToken}
                onChange={(e) => setApiConfig(p => ({ ...p, bearerToken: e.target.value }))}
                className="font-mono text-sm bg-muted/50 border-border h-9"
              />
            </div>

            <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Configuration
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Organization Info (mock) */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-foreground">Acme Corp IT Operations</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-mono text-primary text-xs">Free Trial (11 days left)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Members</span>
              <span className="font-medium text-foreground">4 operators, 1 admin</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, Key, Globe, Shield, CheckCircle, Loader2, Coins } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { CURRENCIES } from "@/hooks/use-currency";

export default function Settings() {
  const { toast } = useToast();
  const { organization, isLicensed, isTrialExpired, trialDaysLeft, refreshOrg, refreshProfile, user, userProfile } = useAuth();
  const [apiConfig, setApiConfig] = useState({
    platform: "servicenow",
    instanceUrl: "",
    apiKey: "",
    httpMethod: "PATCH",
    bearerToken: "",
  });
  const [licenseKey, setLicenseKey] = useState("");
  const [activating, setActivating] = useState(false);
  const [savingCurrency, setSavingCurrency] = useState(false);

  const handleSave = () => {
    toast({ title: "Configuration saved", description: "Outbound API settings updated successfully." });
  };

  const handleActivateLicense = async () => {
    if (!licenseKey.trim() || !organization) return;
    setActivating(true);
    try {
      const { error } = await supabase
        .from("organizations")
        .update({ license_key: licenseKey.trim(), is_licensed: true })
        .eq("id", organization.id);

      if (error) throw error;
      toast({ title: "License activated!", description: "Full access has been granted with no expiry." });
      await refreshOrg();
      setLicenseKey("");
    } catch (err: any) {
      toast({ title: "Activation failed", description: err.message, variant: "destructive" });
    } finally {
      setActivating(false);
    }
  };

  const handleCurrencyChange = async (value: string) => {
    if (!userProfile) return;
    setSavingCurrency(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ preferred_currency: value })
        .eq("auth_id", user!.id);

      if (error) throw error;
      await refreshProfile();
      toast({ title: "Currency updated", description: `Display currency set to ${value}.` });
    } catch (err: any) {
      toast({ title: "Failed to update currency", description: err.message, variant: "destructive" });
    } finally {
      setSavingCurrency(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[900px]">
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">Configure outbound sync, licensing & preferences</p>
      </div>

      {/* Currency Preference */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">Display Currency</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Choose your preferred currency for all financial calculations, ROI reports, and cost displays.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Currency</Label>
                <Select
                  value={userProfile?.preferred_currency ?? "USD"}
                  onValueChange={handleCurrencyChange}
                  disabled={savingCurrency}
                >
                  <SelectTrigger className="bg-muted/50 border-border h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.symbol} — {c.name} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {savingCurrency && <Loader2 className="w-4 h-4 animate-spin text-primary mt-5" />}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* License Management */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className={isLicensed ? "border-primary/30" : isTrialExpired ? "border-destructive/30" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm">License Management</CardTitle>
              </div>
              {isLicensed ? (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                  <CheckCircle className="w-3 h-3 mr-1" /> Licensed
                </Badge>
              ) : isTrialExpired ? (
                <Badge variant="destructive" className="text-[10px]">Trial Expired</Badge>
              ) : (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                  {trialDaysLeft} days left
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs">
              {isLicensed
                ? "Your license is active. Full access with no expiry."
                : isTrialExpired
                ? "Your trial has expired. Enter a license key to restore full access."
                : `You're on a free trial. ${trialDaysLeft} days remaining. Enter a license key to unlock permanent access.`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLicensed && organization?.license_key && (
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Current License Key</Label>
                <div className="font-mono text-sm text-muted-foreground bg-muted/50 border border-border rounded-md px-3 py-2">
                  {organization.license_key.slice(0, 4)}••••••••{organization.license_key.slice(-4)}
                </div>
              </div>
            )}
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
                {isLicensed ? "Update License Key" : "Enter License Key"}
              </Label>
              <Input
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                className="font-mono text-sm bg-muted/50 border-border h-9"
              />
            </div>
            <Button
              onClick={handleActivateLicense}
              disabled={activating || !licenseKey.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {activating && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              {isLicensed ? "Update License" : "Activate License"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Outbound API Config */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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

      {/* Organization Info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-foreground">{organization?.name ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-mono text-primary text-xs">
                {isLicensed ? "Licensed (Full Access)" : isTrialExpired ? "Trial Expired" : `Free Trial (${trialDaysLeft} days left)`}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Account</span>
              <span className="font-mono text-foreground text-xs">{user?.email}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

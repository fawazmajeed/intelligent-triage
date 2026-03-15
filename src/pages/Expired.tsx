import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Key, Loader2, LogOut } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function Expired() {
  const { user, organization, isTrialExpired, isLicensed, signOut, refreshOrg, loading } = useAuth();
  const { toast } = useToast();
  const [licenseKey, setLicenseKey] = useState("");
  const [activating, setActivating] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isTrialExpired || isLicensed) return <Navigate to="/" replace />;

  const handleActivate = async () => {
    if (!licenseKey.trim() || !organization) return;
    setActivating(true);
    try {
      const { error } = await supabase
        .from("organizations")
        .update({ license_key: licenseKey.trim(), is_licensed: true })
        .eq("id", organization.id);

      if (error) throw error;
      toast({ title: "License activated!", description: "Full access has been granted." });
      await refreshOrg();
    } catch (err: any) {
      toast({ title: "Activation failed", description: err.message, variant: "destructive" });
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background grid-pattern">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <CardTitle className="text-lg">Trial Expired</CardTitle>
          <CardDescription className="text-xs">
            Your 7-day free trial has ended. Enter a license key to continue using TriageFlow AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block flex items-center gap-1">
              <Key className="w-3 h-3" /> License Key
            </Label>
            <Input
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              className="font-mono bg-muted/50 border-border h-9 text-sm"
            />
          </div>
          <Button
            onClick={handleActivate}
            disabled={activating || !licenseKey.trim()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {activating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Activate License
          </Button>
          <Button variant="ghost" onClick={signOut} className="w-full text-muted-foreground">
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

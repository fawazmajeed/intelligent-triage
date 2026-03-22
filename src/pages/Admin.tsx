import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Key, Copy, CheckCircle, XCircle, Loader2, Users, Building2, RefreshCw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface OrgRow {
  id: string;
  name: string;
  is_licensed: boolean;
  license_key: string | null;
  trial_expires_at: string;
  created_at: string;
}

interface UserRow {
  id: string;
  email: string;
  organization_id: string;
  created_at: string;
}

function generateLicenseKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segments = 4;
  const segLen = 5;
  const parts: string[] = [];
  for (let s = 0; s < segments; s++) {
    let seg = "";
    for (let i = 0; i < segLen; i++) {
      seg += chars[Math.floor(Math.random() * chars.length)];
    }
    parts.push(seg);
  }
  return `TF-${parts.join("-")}`;
}

export default function Admin() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [licenseDialog, setLicenseDialog] = useState<{ open: boolean; org: OrgRow | null }>({ open: false, org: null });
  const [generatedKey, setGeneratedKey] = useState("");
  const [activating, setActivating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndLoad();
  }, [user]);

  const checkAdminAndLoad = async () => {
    if (!user) return;
    setLoading(true);

    // Check admin role
    const { data: roleCheck } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin" as any,
    });

    setIsAdmin(!!roleCheck);

    if (roleCheck) {
      await loadData();
    }
    setLoading(false);
  };

  const loadData = async () => {
    const [orgRes, userRes] = await Promise.all([
      supabase.rpc("admin_list_organizations"),
      supabase.rpc("admin_list_users"),
    ]);

    if (orgRes.data) setOrgs(orgRes.data as OrgRow[]);
    if (userRes.data) setUsers(userRes.data as UserRow[]);
  };

  const openLicenseDialog = (org: OrgRow) => {
    const key = generateLicenseKey();
    setGeneratedKey(key);
    setLicenseDialog({ open: true, org });
  };

  const activateLicense = async () => {
    if (!licenseDialog.org) return;
    setActivating(true);
    const { error } = await supabase.rpc("admin_set_license_key", {
      _org_id: licenseDialog.org.id,
      _license_key: generatedKey,
    });
    setActivating(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "License activated", description: `License key assigned to ${licenseDialog.org.name}` });
      setLicenseDialog({ open: false, org: null });
      await loadData();
    }
  };

  const revokeLicense = async (orgId: string) => {
    setRevoking(orgId);
    const { error } = await supabase.rpc("admin_revoke_license", { _org_id: orgId });
    setRevoking(null);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "License revoked" });
      await loadData();
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Copied to clipboard" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Shield className="w-5 h-5" /> Access Denied
            </CardTitle>
            <CardDescription>You do not have admin privileges to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getUsersForOrg = (orgId: string) => users.filter((u) => u.organization_id === orgId);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Admin Panel
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage organizations and license keys</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { setLoading(true); loadData().then(() => setLoading(false)); }}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{orgs.length}</p>
                <p className="text-xs text-muted-foreground">Organizations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Key className="w-8 h-8 text-success" />
              <div>
                <p className="text-2xl font-bold text-foreground">{orgs.filter((o) => o.is_licensed).length}</p>
                <p className="text-xs text-muted-foreground">Licensed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orgs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Organizations</CardTitle>
          <CardDescription>View all registered organizations and manage their licenses</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Trial Expires</TableHead>
                <TableHead>License</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgs.map((org) => {
                const orgUsers = getUsersForOrg(org.id);
                const trialEnd = new Date(org.trial_expires_at);
                const expired = trialEnd < new Date();
                return (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{org.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{org.id.slice(0, 8)}…</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        {orgUsers.map((u) => (
                          <p key={u.id} className="text-xs text-muted-foreground">{u.email}</p>
                        ))}
                        {orgUsers.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={expired ? "destructive" : "secondary"} className="text-xs">
                        {expired ? "Expired" : trialEnd.toLocaleDateString()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {org.is_licensed ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-success" />
                          <span className="text-xs font-mono text-muted-foreground">{org.license_key?.slice(0, 12)}…</span>
                          <button onClick={() => copyKey(org.license_key!)} className="text-muted-foreground hover:text-foreground">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Unlicensed</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {!org.is_licensed ? (
                          <Button size="sm" onClick={() => openLicenseDialog(org)}>
                            <Key className="w-3.5 h-3.5 mr-1.5" /> Generate Key
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => revokeLicense(org.id)}
                            disabled={revoking === org.id}
                          >
                            {revoking === org.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Revoke"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {orgs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No organizations registered yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* License Key Dialog */}
      <Dialog open={licenseDialog.open} onOpenChange={(open) => setLicenseDialog({ open, org: licenseDialog.org })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate License Key</DialogTitle>
            <DialogDescription>
              Assign a license to <strong>{licenseDialog.org?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <Input value={generatedKey} readOnly className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={() => copyKey(generatedKey)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setGeneratedKey(generateLicenseKey())}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Regenerate
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLicenseDialog({ open: false, org: null })}>Cancel</Button>
            <Button onClick={activateLicense} disabled={activating}>
              {activating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
              Activate License
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

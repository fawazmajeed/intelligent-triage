import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Brain, Plus, X, Upload, FileSpreadsheet, Loader2, Tag, Users, Trash2 } from "lucide-react";

export default function AIConfigSection() {
  const { organization } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newCategory, setNewCategory] = useState("");
  const [newTeam, setNewTeam] = useState("");
  const [uploading, setUploading] = useState(false);

  const orgId = organization?.id;

  const { data: categories = [] } = useQuery({
    queryKey: ["org-categories", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("org_categories")
        .select("*")
        .eq("organization_id", orgId!)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ["org-teams", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("org_teams")
        .select("*")
        .eq("organization_id", orgId!)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const { data: exampleCount = 0 } = useQuery({
    queryKey: ["org-training-count", orgId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("org_training_examples")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId!);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!orgId,
  });

  const addCategory = async () => {
    if (!newCategory.trim() || !orgId) return;
    const { error } = await supabase.from("org_categories").insert({ organization_id: orgId, name: newCategory.trim() });
    if (error) {
      toast({ title: "Error", description: error.message.includes("duplicate") ? "Category already exists" : error.message, variant: "destructive" });
      return;
    }
    setNewCategory("");
    queryClient.invalidateQueries({ queryKey: ["org-categories"] });
    toast({ title: "Category added" });
  };

  const removeCategory = async (id: string) => {
    await supabase.from("org_categories").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["org-categories"] });
  };

  const addTeam = async () => {
    if (!newTeam.trim() || !orgId) return;
    const { error } = await supabase.from("org_teams").insert({ organization_id: orgId, name: newTeam.trim() });
    if (error) {
      toast({ title: "Error", description: error.message.includes("duplicate") ? "Team already exists" : error.message, variant: "destructive" });
      return;
    }
    setNewTeam("");
    queryClient.invalidateQueries({ queryKey: ["org-teams"] });
    toast({ title: "Team added" });
  };

  const removeTeam = async (id: string) => {
    await supabase.from("org_teams").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["org-teams"] });
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !orgId) return;
    setUploading(true);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");

      const header = lines[0].toLowerCase();
      // Find column indices - flexible header matching
      const cols = header.split(",").map((h) => h.trim().replace(/"/g, ""));
      const descIdx = cols.findIndex((c) => c.includes("description") || c.includes("summary") || c.includes("subject") || c.includes("short_description"));
      const catIdx = cols.findIndex((c) => c.includes("category") || c.includes("type"));
      const teamIdx = cols.findIndex((c) => c.includes("team") || c.includes("group") || c.includes("assignment") || c.includes("assigned"));
      const sevIdx = cols.findIndex((c) => c.includes("severity") || c.includes("priority") || c.includes("impact"));

      if (descIdx === -1 || catIdx === -1) {
        throw new Error("CSV must have at least 'description' and 'category' columns. Optional: 'team', 'severity'.");
      }

      const rows = lines.slice(1).map((line) => {
        // Simple CSV parse (handles basic quoting)
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map((v) => v.replace(/^"|"$/g, "").trim()) ?? line.split(",").map((v) => v.trim());
        return {
          organization_id: orgId,
          description: values[descIdx] || "",
          category: values[catIdx] || "",
          team: teamIdx !== -1 ? values[teamIdx] || null : null,
          severity: sevIdx !== -1 ? values[sevIdx] || null : null,
          source: "csv_upload",
        };
      }).filter((r) => r.description && r.category);

      if (rows.length === 0) throw new Error("No valid rows found in CSV.");

      // Insert in batches of 100
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const { error } = await supabase.from("org_training_examples").insert(batch);
        if (error) throw error;
      }

      // Auto-extract unique categories and teams from CSV
      const uniqueCats = [...new Set(rows.map((r) => r.category).filter(Boolean))];
      const uniqueTeams = [...new Set(rows.map((r) => r.team).filter((t): t is string => !!t))];

      if (uniqueCats.length > 0) {
        await supabase.from("org_categories").upsert(
          uniqueCats.map((name) => ({ organization_id: orgId, name })),
          { onConflict: "organization_id,name" }
        );
        queryClient.invalidateQueries({ queryKey: ["org-categories"] });
      }
      if (uniqueTeams.length > 0) {
        await supabase.from("org_teams").upsert(
          uniqueTeams.map((name) => ({ organization_id: orgId, name })),
          { onConflict: "organization_id,name" }
        );
        queryClient.invalidateQueries({ queryKey: ["org-teams"] });
      }

      queryClient.invalidateQueries({ queryKey: ["org-training-count"] });
      toast({
        title: `${rows.length} examples imported`,
        description: `Also extracted ${uniqueCats.length} categories and ${uniqueTeams.length} teams from your data.`,
      });
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearExamples = async () => {
    if (!orgId) return;
    await supabase.from("org_training_examples").delete().eq("organization_id", orgId);
    queryClient.invalidateQueries({ queryKey: ["org-training-count"] });
    toast({ title: "Training examples cleared" });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm">AI Triage Configuration</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Customize categories, teams, and upload historical data so the AI matches your organization's structure.
          {categories.length === 0 && teams.length === 0 && (
            <span className="block mt-1 text-primary/80">
              ℹ️ Without custom config, the AI uses standard ITIL defaults. Add your own for better accuracy.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Categories */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Ticket Categories</span>
            <Badge variant="outline" className="text-[9px] ml-auto">{categories.length} defined</Badge>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <Badge key={c.id} variant="secondary" className="text-[10px] gap-1 pr-1">
                {c.name}
                <button onClick={() => removeCategory(c.id)} className="hover:text-destructive transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Network, SAP, End User Computing"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              className="text-xs h-8 bg-muted/50 border-border"
            />
            <Button size="sm" variant="outline" onClick={addCategory} disabled={!newCategory.trim()} className="h-8 px-2">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Teams */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Assignment Groups / Teams</span>
            <Badge variant="outline" className="text-[9px] ml-auto">{teams.length} defined</Badge>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {teams.map((t) => (
              <Badge key={t.id} variant="secondary" className="text-[10px] gap-1 pr-1">
                {t.name}
                <button onClick={() => removeTeam(t.id)} className="hover:text-destructive transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Tier 1 - Service Desk, Network Ops, Security SOC"
              value={newTeam}
              onChange={(e) => setNewTeam(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTeam()}
              className="text-xs h-8 bg-muted/50 border-border"
            />
            <Button size="sm" variant="outline" onClick={addTeam} disabled={!newTeam.trim()} className="h-8 px-2">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Historical Data Upload */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Historical Training Data</span>
            <Badge variant="outline" className="text-[9px] ml-auto">{exampleCount} examples</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Upload a CSV export from your ITSM tool. Required columns: <code className="bg-muted px-1 rounded">description</code>, <code className="bg-muted px-1 rounded">category</code>. 
            Optional: <code className="bg-muted px-1 rounded">team</code>, <code className="bg-muted px-1 rounded">severity</code>. 
            The AI uses these as reference examples to match your organization's classification patterns.
          </p>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-8 gap-1.5 text-xs"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? "Importing…" : "Upload CSV"}
            </Button>
            {exampleCount > 0 && (
              <Button size="sm" variant="ghost" onClick={clearExamples} className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </Button>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

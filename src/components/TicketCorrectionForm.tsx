import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import type { Ticket } from "@/lib/mock-data";

interface TicketCorrectionFormProps {
  ticket: Ticket;
  field: "predicted_category" | "predicted_severity" | "predicted_team";
  currentValue: string | null;
  label: string;
  onCorrected: (field: string, newValue: string) => void;
}

const SEVERITY_OPTIONS = ["Critical", "High", "Medium", "Low", "Info"];

export function TicketCorrectionForm({ ticket, field, currentValue, label, onCorrected }: TicketCorrectionFormProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newValue, setNewValue] = useState(currentValue ?? "");
  const { user, organization } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch org categories/teams for dropdown options
  const { data: categories } = useQuery({
    queryKey: ["org-categories", organization?.id],
    queryFn: async () => {
      if (!organization) return [];
      const { data } = await supabase
        .from("org_categories")
        .select("name")
        .eq("organization_id", organization.id);
      return data?.map((c) => c.name) ?? [];
    },
    enabled: !!organization && field === "predicted_category",
  });

  const { data: teams } = useQuery({
    queryKey: ["org-teams", organization?.id],
    queryFn: async () => {
      if (!organization) return [];
      const { data } = await supabase
        .from("org_teams")
        .select("name")
        .eq("organization_id", organization.id);
      return data?.map((t) => t.name) ?? [];
    },
    enabled: !!organization && field === "predicted_team",
  });

  const options =
    field === "predicted_severity"
      ? SEVERITY_OPTIONS
      : field === "predicted_category"
        ? categories ?? []
        : teams ?? [];

  const handleSave = async () => {
    if (!user || !organization || !newValue || newValue === currentValue) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      // 1. Save correction record
      const { error: corrError } = await supabase.from("ticket_corrections").insert({
        ticket_id: ticket.id,
        organization_id: organization.id,
        corrected_by: user.id,
        field_name: field,
        original_value: currentValue,
        corrected_value: newValue,
      });
      if (corrError) throw corrError;

      // 2. Update the ticket itself
      const { error: ticketError } = await supabase
        .from("tickets")
        .update({ [field]: newValue })
        .eq("id", ticket.id);
      if (ticketError) throw ticketError;

      // 3. Auto-save as training example for future AI learning
      const { error: trainError } = await supabase.from("org_training_examples").insert({
        organization_id: organization.id,
        description: ticket.raw_description,
        category: field === "predicted_category" ? newValue : (ticket.predicted_category ?? ""),
        team: field === "predicted_team" ? newValue : ticket.predicted_team,
        severity: field === "predicted_severity" ? newValue : ticket.predicted_severity,
        source: "user_correction",
      });
      if (trainError) console.warn("Training example save failed:", trainError);

      onCorrected(field, newValue);
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-tickets"] });

      toast({
        title: "Correction saved",
        description: `${label} updated to "${newValue}". This feedback will improve future AI predictions.`,
      });
    } catch (e) {
      toast({ title: "Error saving correction", description: String(e), variant: "destructive" });
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  if (!editing) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-5 w-5 p-0 text-muted-foreground hover:text-primary"
        onClick={() => {
          setNewValue(currentValue ?? "");
          setEditing(true);
        }}
        title={`Correct ${label}`}
      >
        <Pencil className="w-3 h-3" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Select value={newValue} onValueChange={setNewValue}>
        <SelectTrigger className="h-6 text-[10px] w-[140px] bg-muted/50">
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt} className="text-xs">
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="sm"
        className="h-5 w-5 p-0 text-success hover:text-success"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-5 w-5 p-0 text-destructive hover:text-destructive"
        onClick={() => setEditing(false)}
        disabled={saving}
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
}

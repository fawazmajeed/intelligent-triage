import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { MessageSquareWarning, TrendingUp, Target, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export function FeedbackAnalytics() {
  const { organization } = useAuth();

  const { data: corrections } = useQuery({
    queryKey: ["ticket-corrections", organization?.id],
    queryFn: async () => {
      if (!organization) return [];
      const { data, error } = await supabase
        .from("ticket_corrections")
        .select("*")
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!organization,
  });

  const { data: tickets } = useQuery({
    queryKey: ["analytics-tickets", organization?.id],
    queryFn: async () => {
      if (!organization) return [];
      const { data, error } = await supabase
        .from("tickets")
        .select("id, predicted_category, predicted_severity, predicted_team, confidence_score, created_at")
        .eq("organization_id", organization.id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!organization,
  });

  const { data: trainingExamples } = useQuery({
    queryKey: ["training-examples-count", organization?.id],
    queryFn: async () => {
      if (!organization) return { total: 0, fromCorrections: 0 };
      const { count: total } = await supabase
        .from("org_training_examples")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organization.id);
      const { count: fromCorrections } = await supabase
        .from("org_training_examples")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organization.id)
        .eq("source", "user_correction");
      return { total: total ?? 0, fromCorrections: fromCorrections ?? 0 };
    },
    enabled: !!organization,
  });

  // Correction rate by field
  const fieldStats = useMemo(() => {
    if (!corrections?.length) return [];
    const counts: Record<string, number> = {};
    corrections.forEach((c) => {
      const label = c.field_name.replace("predicted_", "").replace(/^\w/, (ch: string) => ch.toUpperCase());
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [corrections]);

  // Weekly correction trend
  const weeklyTrend = useMemo(() => {
    if (!corrections?.length || !tickets?.length) return [];
    const weekMap: Record<string, { corrections: number; tickets: number }> = {};

    tickets.forEach((t) => {
      const week = getWeekLabel(new Date(t.created_at));
      if (!weekMap[week]) weekMap[week] = { corrections: 0, tickets: 0 };
      weekMap[week].tickets += 1;
    });

    corrections.forEach((c) => {
      const week = getWeekLabel(new Date(c.created_at));
      if (!weekMap[week]) weekMap[week] = { corrections: 0, tickets: 0 };
      weekMap[week].corrections += 1;
    });

    return Object.entries(weekMap)
      .map(([week, d]) => ({
        week,
        correctionRate: d.tickets > 0 ? Math.round((d.corrections / d.tickets) * 100) : 0,
        corrections: d.corrections,
      }))
      .slice(-8);
  }, [corrections, tickets]);

  // Most corrected original values
  const topMiscategorized = useMemo(() => {
    if (!corrections?.length) return [];
    const map: Record<string, { from: string; to: string; count: number }> = {};
    corrections.forEach((c) => {
      const key = `${c.original_value} → ${c.corrected_value}`;
      if (!map[key]) map[key] = { from: c.original_value ?? "—", to: c.corrected_value, count: 0 };
      map[key].count += 1;
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [corrections]);

  const totalCorrections = corrections?.length ?? 0;
  const totalTickets = tickets?.length ?? 0;
  const overallCorrectionRate = totalTickets > 0 ? Math.round((totalCorrections / totalTickets) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquareWarning className="w-4 h-4 text-warning" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Corrections</span>
              </div>
              <p className="text-2xl font-bold font-mono text-foreground">{totalCorrections}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Correction Rate</span>
              </div>
              <p className="text-2xl font-bold font-mono text-foreground">{overallCorrectionRate}%</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Lower is better</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">AI Accuracy</span>
              </div>
              <p className="text-2xl font-bold font-mono text-foreground">{100 - overallCorrectionRate}%</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Based on user feedback</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-accent-foreground" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Training Examples</span>
              </div>
              <p className="text-2xl font-bold font-mono text-foreground">{trainingExamples?.total ?? 0}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{trainingExamples?.fromCorrections ?? 0} from corrections</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Correction Rate Trend */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Correction Rate Over Time</CardTitle>
              <p className="text-[10px] text-muted-foreground">A declining trend means the AI is learning from your feedback</p>
            </CardHeader>
            <CardContent>
              {weeklyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 16%)" />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} unit="%" />
                    <Tooltip contentStyle={{ background: "hsl(222, 22%, 9%)", border: "1px solid hsl(220, 18%, 16%)", borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="correctionRate" stroke="hsl(25, 95%, 58%)" strokeWidth={2} dot={{ r: 3 }} name="Correction Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-12">No correction data yet. Correct a ticket to start tracking.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Corrections by Field */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Corrections by Field</CardTitle>
              <p className="text-[10px] text-muted-foreground">Which AI predictions get corrected the most</p>
            </CardHeader>
            <CardContent>
              {fieldStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={fieldStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 16%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "hsl(222, 22%, 9%)", border: "1px solid hsl(220, 18%, 16%)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill="hsl(173, 80%, 40%)" radius={[4, 4, 0, 0]} name="Corrections" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-12">No corrections yet.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Most Common Misclassifications */}
      {topMiscategorized.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Top Misclassification Patterns</CardTitle>
              <p className="text-[10px] text-muted-foreground">Most frequently corrected AI predictions — consider adding more training examples for these</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topMiscategorized.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted/30 border border-border rounded-md px-3 py-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="text-[10px] font-mono text-destructive/80 border-destructive/30">{item.from}</Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge variant="outline" className="text-[10px] font-mono text-success border-success/30">{item.to}</Badge>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{item.count}×</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function getWeekLabel(date: Date): string {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

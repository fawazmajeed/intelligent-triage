import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, BarChart3, MessageSquareWarning } from "lucide-react";
import { useMemo } from "react";
import { FeedbackAnalytics } from "@/components/FeedbackAnalytics";

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "hsl(0, 72%, 55%)",
  High: "hsl(25, 95%, 58%)",
  Medium: "hsl(45, 93%, 55%)",
  Low: "hsl(142, 71%, 50%)",
};

export default function Analytics() {
  const { organization } = useAuth();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["analytics-tickets", organization?.id],
    queryFn: async () => {
      if (!organization) return [];
      const { data, error } = await supabase
        .from("tickets")
        .select("predicted_category, predicted_severity, confidence_score, created_at, source_system")
        .eq("organization_id", organization.id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!organization,
    refetchInterval: 10000,
  });

  const categoryData = useMemo(() => {
    if (!tickets?.length) return [];
    const counts: Record<string, number> = {};
    tickets.forEach((t) => {
      const cat = t.predicted_category || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [tickets]);

  const severityData = useMemo(() => {
    if (!tickets?.length) return [];
    const counts: Record<string, number> = {};
    tickets.forEach((t) => {
      const sev = t.predicted_severity || "Unknown";
      counts[sev] = (counts[sev] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: SEVERITY_COLORS[name] || "hsl(220, 10%, 50%)",
    }));
  }, [tickets]);

  const trendData = useMemo(() => {
    if (!tickets?.length) return [];
    const dayMap: Record<string, { tickets: number; totalConf: number; confCount: number }> = {};
    tickets.forEach((t) => {
      const date = new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!dayMap[date]) dayMap[date] = { tickets: 0, totalConf: 0, confCount: 0 };
      dayMap[date].tickets += 1;
      if (t.confidence_score != null) {
        dayMap[date].totalConf += Number(t.confidence_score) * 100;
        dayMap[date].confCount += 1;
      }
    });
    return Object.entries(dayMap)
      .map(([day, d]) => ({
        day,
        tickets: d.tickets,
        confidence: d.confCount > 0 ? Math.round(d.totalConf / d.confCount) : null,
      }))
      .slice(-14); // last 14 days
  }, [tickets]);

  const sourceData = useMemo(() => {
    if (!tickets?.length) return [];
    const counts: Record<string, number> = {};
    tickets.forEach((t) => {
      counts[t.source_system] = (counts[t.source_system] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [tickets]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const isEmpty = !tickets?.length;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold text-foreground">Analytics</h1>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          Triage performance metrics — {tickets?.length ?? 0} tickets from your organization
        </p>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="performance" className="text-xs">
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="feedback" className="text-xs">
            <MessageSquareWarning className="w-3.5 h-3.5 mr-1.5" />
            AI Feedback Loop
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="mt-4">

      {isEmpty ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground">No ticket data yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Simulate traffic from the Integration Hub or connect your ITSM platform to see analytics.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tickets by Category */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tickets by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 16%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "hsl(222, 22%, 9%)", border: "1px solid hsl(220, 18%, 16%)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill="hsl(173, 80%, 40%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Severity Distribution */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Severity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={severityData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" paddingAngle={3}>
                      {severityData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(222, 22%, 9%)", border: "1px solid hsl(220, 18%, 16%)", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {severityData.map((s) => (
                    <div key={s.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                      {s.name} ({s.value})
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Volume & Confidence Trend */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Daily Trend — Volume & Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 16%)" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "hsl(222, 22%, 9%)", border: "1px solid hsl(220, 18%, 16%)", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="tickets" stroke="hsl(173, 80%, 40%)" strokeWidth={2} dot={{ r: 3 }} name="Tickets" />
                    <Line type="monotone" dataKey="confidence" stroke="hsl(199, 89%, 55%)" strokeWidth={2} dot={{ r: 3 }} name="Avg Confidence %" connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tickets by Source */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tickets by Source Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={sourceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 16%)" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} width={90} />
                    <Tooltip contentStyle={{ background: "hsl(222, 22%, 9%)", border: "1px solid hsl(220, 18%, 16%)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill="hsl(199, 89%, 55%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}

import { motion } from "framer-motion";
import { Ticket, Brain, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/use-currency";

export function MetricsRibbon() {
  const { formatCurrency } = useCurrency();

  const { data, isLoading } = useQuery({
    queryKey: ["ticket-metrics"],
    queryFn: async () => {
      const { count } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true });

      const { data: scores } = await supabase
        .from("tickets")
        .select("confidence_score")
        .not("confidence_score", "is", null);

      const totalTickets = count ?? 0;
      const avgConfidence = scores && scores.length > 0
        ? scores.reduce((sum, t) => sum + (t.confidence_score ?? 0), 0) / scores.length
        : 0;
      const hoursSaved = totalTickets * 0.065;

      return { totalTickets, avgConfidence, hoursSaved };
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const metrics = [
    {
      label: "Tickets Processed",
      value: data?.totalTickets.toLocaleString() ?? "0",
      change: "All time",
      icon: Ticket,
    },
    {
      label: "Avg. AI Confidence Score",
      value: `${((data?.avgConfidence ?? 0) * 100).toFixed(1)}%`,
      change: "Across all tickets",
      icon: Brain,
    },
    {
      label: "Estimated Hours Saved",
      value: `${(data?.hoursSaved ?? 0).toFixed(1)}h`,
      change: `≈ ${formatCurrency(Math.round((data?.hoursSaved ?? 0) * 70))}`,
      icon: Clock,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric, i) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="bg-card border border-border rounded-lg p-4 glow-primary"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{metric.label}</p>
              <p className="text-2xl font-bold font-mono text-foreground mt-1">{metric.value}</p>
            </div>
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
              <metric.icon className="w-4.5 h-4.5 text-primary" />
            </div>
          </div>
          <p className="text-xs font-mono text-success mt-2">{metric.change}</p>
        </motion.div>
      ))}
    </div>
  );
}

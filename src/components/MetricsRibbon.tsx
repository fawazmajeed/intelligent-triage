import { motion } from "framer-motion";
import { Ticket, Brain, Clock } from "lucide-react";

const metrics = [
  {
    label: "Tickets Processed Today",
    value: "284",
    change: "+12%",
    icon: Ticket,
    positive: true,
  },
  {
    label: "Avg. AI Confidence Score",
    value: "93.2%",
    change: "+1.4%",
    icon: Brain,
    positive: true,
  },
  {
    label: "Estimated Hours Saved",
    value: "18.5h",
    change: "≈ $1,295",
    icon: Clock,
    positive: true,
  },
];

export function MetricsRibbon() {
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
          <p className="text-xs font-mono text-success mt-2">{metric.change} vs yesterday</p>
        </motion.div>
      ))}
    </div>
  );
}

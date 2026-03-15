import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, TrendingUp, Loader2, HelpCircle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/hooks/use-currency";

export function ROICalculator() {
  const { formatCurrency, currency } = useCurrency();
  const [showHelp, setShowHelp] = useState(false);

  const { data: ticketCount, isLoading } = useQuery({
    queryKey: ["ticket-count-roi"],
    queryFn: async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count, error } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const [volume, setVolume] = useState(0);
  const [rate, setRate] = useState(70);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (ticketCount !== undefined && !initialized) {
      setVolume(ticketCount);
      setInitialized(true);
    }
  }, [ticketCount, initialized]);

  const minutesSaved = volume * 8;
  const hoursSaved = minutesSaved / 60;
  const moneySaved = hoursSaved * rate;
  const fteSaved = (hoursSaved / 160).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card border border-border rounded-lg p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">ROI Calculator</h3>
        <span className="text-[10px] text-muted-foreground font-mono ml-auto">What-If Analysis · Based on live data</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Monthly Ticket Volume {isLoading && <Loader2 className="w-3 h-3 inline animate-spin ml-1" />}
          </Label>
          <Input
            type="number"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value) || 0)}
            className="font-mono text-sm bg-muted/50 border-border h-9"
          />
        </div>
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Avg. Tech Hourly Rate ({currency.symbol})
          </Label>
          <Input
            type="number"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value) || 0)}
            className="font-mono text-sm bg-muted/50 border-border h-9"
          />
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-md p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Projected Monthly Savings</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xl font-bold font-mono text-primary">{formatCurrency(Math.round(moneySaved))}</p>
            <p className="text-[10px] text-muted-foreground">Cost Savings</p>
          </div>
          <div>
            <p className="text-xl font-bold font-mono text-foreground">{Math.round(hoursSaved)}h</p>
            <p className="text-[10px] text-muted-foreground">Hours Recovered</p>
          </div>
          <div>
            <p className="text-xl font-bold font-mono text-foreground">{fteSaved}</p>
            <p className="text-[10px] text-muted-foreground">FTE Equivalent</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

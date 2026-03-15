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
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="text-muted-foreground hover:text-primary transition-colors ml-1"
          title="How are these calculated?"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>

      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-muted/50 border border-border rounded-md p-3 text-[11px] text-muted-foreground space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">How is this calculated?</span>
                <button onClick={() => setShowHelp(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1.5 font-mono">
                <p><span className="text-foreground font-medium">Cost Savings</span> = Hours Recovered × Hourly Rate</p>
                <p><span className="text-foreground font-medium">Hours Recovered</span> = (Tickets × 8 min) ÷ 60</p>
                <p><span className="text-foreground font-medium">FTE Equivalent</span> = Hours Recovered ÷ 160 hrs/month</p>
              </div>
              <div className="border-t border-border pt-1.5 mt-1.5 space-y-1 text-[10px]">
                <p>• <span className="text-foreground">8 min/ticket</span> — ITSM industry average for L1 manual triage (read, categorize, set priority, assign team).</p>
                <p>• <span className="text-foreground">160 hrs/month</span> — Standard full-time equivalent (40 hrs/week × 4 weeks).</p>
                <p>• Ticket volume is pre-filled from your actual last 30 days of data.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
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

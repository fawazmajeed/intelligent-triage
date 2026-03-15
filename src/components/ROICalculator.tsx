import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ROICalculator() {
  const [volume, setVolume] = useState(500);
  const [rate, setRate] = useState(70);

  // Assumptions: AI saves ~8 min per ticket on average
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
        <span className="text-[10px] text-muted-foreground font-mono ml-auto">What-If Analysis</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Monthly Ticket Volume</Label>
          <Input
            type="number"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value) || 0)}
            className="font-mono text-sm bg-muted/50 border-border h-9"
          />
        </div>
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Avg. Tech Hourly Rate ($)</Label>
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
            <p className="text-xl font-bold font-mono text-primary">${moneySaved.toLocaleString()}</p>
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

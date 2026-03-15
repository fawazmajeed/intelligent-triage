import { MetricsRibbon } from "@/components/MetricsRibbon";
import { TriageTable } from "@/components/TriageTable";
import { ROICalculator } from "@/components/ROICalculator";

const Index = () => {
  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Live Queue</h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">Real-time AI-powered incident triage</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
          Pipeline Active
        </div>
      </div>

      <MetricsRibbon />
      <TriageTable />
      <ROICalculator />
    </div>
  );
};

export default Index;

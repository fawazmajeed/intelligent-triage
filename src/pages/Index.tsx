import { MetricsRibbon } from "@/components/MetricsRibbon";
import { TriageTable } from "@/components/TriageTable";
import { ROICalculator } from "@/components/ROICalculator";

const Index = () => {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-foreground">Live Queue</h1>
          <p className="text-[10px] md:text-xs text-muted-foreground font-mono mt-0.5">Real-time AI-powered incident triage</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground font-mono">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
          <span className="hidden sm:inline">Pipeline Active</span>
        </div>
      </div>

      <MetricsRibbon />
      <TriageTable />
      <ROICalculator />
    </div>
  );
};

export default Index;

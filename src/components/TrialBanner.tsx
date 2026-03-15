import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TrialBanner() {
  const [dismissed, setDismissed] = useState(false);
  
  // Mock: trial expired
  const trialExpired = false;
  const daysLeft = 11;

  if (dismissed || !daysLeft) return null;

  return (
    <div className={`flex items-center justify-between px-4 py-2 text-xs font-medium border-b border-border ${
      trialExpired 
        ? "bg-destructive/10 text-destructive" 
        : "bg-primary/5 text-primary"
    }`}>
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5" />
        {trialExpired 
          ? "Your 14-day trial has expired. Upgrade now to keep your AI triage pipeline running."
          : `${daysLeft} days remaining in your free trial. Enjoying TriageFlow AI?`
        }
      </div>
      <div className="flex items-center gap-2">
        {trialExpired && (
          <Button size="sm" className="h-6 text-[11px] px-3 bg-primary text-primary-foreground hover:bg-primary/90">
            Upgrade Now
          </Button>
        )}
        <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

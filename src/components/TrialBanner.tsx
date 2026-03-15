import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function TrialBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { user, isLicensed, isTrialExpired, trialDaysLeft } = useAuth();
  const navigate = useNavigate();

  // Only show when logged in, on trial (not licensed), and not dismissed
  if (!user || isLicensed || dismissed) return null;

  return (
    <div className={`flex items-center justify-between px-3 md:px-4 py-2 text-[10px] md:text-xs font-medium border-b border-border ${
      isTrialExpired 
        ? "bg-destructive/10 text-destructive" 
        : "bg-primary/5 text-primary"
    }`}>
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">
          {isTrialExpired 
            ? "Trial expired. Activate license in Settings."
            : `${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} left in trial`
          }
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isTrialExpired && (
          <Button 
            size="sm" 
            onClick={() => navigate("/settings")}
            className="h-6 text-[10px] px-2 md:px-3 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Activate
          </Button>
        )}
        <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

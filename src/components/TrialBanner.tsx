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
    <div className={`flex items-center justify-between px-4 py-2 text-xs font-medium border-b border-border ${
      isTrialExpired 
        ? "bg-destructive/10 text-destructive" 
        : "bg-primary/5 text-primary"
    }`}>
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5" />
        {isTrialExpired 
          ? "Your 7-day trial has expired. Enter a license key in Settings to continue."
          : `${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} remaining in your free trial. Enjoying TriageFlow AI?`
        }
      </div>
      <div className="flex items-center gap-2">
        {isTrialExpired && (
          <Button 
            size="sm" 
            onClick={() => navigate("/settings")}
            className="h-6 text-[11px] px-3 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Activate License
          </Button>
        )}
        <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

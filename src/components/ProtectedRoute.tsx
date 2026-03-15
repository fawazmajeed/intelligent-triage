import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isReadOnly, isTrialExpired, isLicensed } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // If trial expired and not licensed, block login by signing out
  if (isTrialExpired && !isLicensed) {
    return <Navigate to="/expired" replace />;
  }

  return <>{children}</>;
}

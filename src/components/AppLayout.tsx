import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { TrialBanner } from "./TrialBanner";
import { ProtectedRoute } from "./ProtectedRoute";

export function AppLayout() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TrialBanner />
          <main className="flex-1 overflow-auto pt-[52px] md:pt-0">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

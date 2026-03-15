import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { TrialBanner } from "./TrialBanner";

export function AppLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TrialBanner />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

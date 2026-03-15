import { useState } from "react";
import { Activity, Zap, BarChart3, Settings, Shield, Radio, LogOut, Menu, X } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { title: "Live Queue", url: "/", icon: Radio },
  { title: "Integration Hub", url: "/integrations", icon: Zap },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { user, signOut, isLicensed } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
            <Shield className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-sidebar-primary tracking-tight">TriageFlow AI</h1>
            <p className="text-[10px] text-sidebar-foreground/50 font-mono uppercase tracking-widest">Incident Intelligence</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <p className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 mb-2">Operations</p>
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-150"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            onClick={() => setMobileOpen(false)}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.title}</span>
            {item.url === "/" && (
              <span className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-3">
        {user && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-sidebar-foreground/60 font-mono truncate max-w-[160px]">
              {user.email}
            </span>
            <button onClick={signOut} className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 text-[11px] text-sidebar-foreground/40">
          <Activity className="w-3 h-3 text-success" />
          <span className="font-mono">
            {isLicensed ? "Licensed" : "Trial"}
          </span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-sidebar border-b border-sidebar-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-sm font-bold text-sidebar-primary font-mono">TriageFlow AI</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-sidebar-foreground p-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-background/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile slide-out drawer */}
      <aside
        className={`md:hidden fixed top-[52px] left-0 bottom-0 z-30 w-64 bg-sidebar flex flex-col transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex-col shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}

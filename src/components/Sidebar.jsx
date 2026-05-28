import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Mic, BarChart3, BookOpen, Guitar } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/session", label: "Live Session", icon: Mic },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/practice", label: "Practice Plans", icon: BookOpen },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center glow-primary">
            <Guitar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">GuitarIQ</h1>
            <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest">AI Coach</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary/10 text-primary glow-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 m-3 rounded-lg bg-secondary/50 border border-border">
        <p className="text-xs text-muted-foreground mb-1">Current Streak</p>
        <p className="text-2xl font-bold text-primary font-mono">12 days</p>
        <p className="text-[11px] text-muted-foreground mt-1">Keep it going!</p>
      </div>
    </aside>
  );
}
import { cn } from "@/lib/utils";

export default function StatsCard({ label, value, unit, icon: Icon, trend, className }) {
  return (
    <div className={cn("p-5 rounded-xl bg-card border border-border", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold font-mono">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {trend && (
        <p className={cn("text-xs mt-2 font-medium", trend > 0 ? "text-primary" : "text-destructive")}>
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last week
        </p>
      )}
    </div>
  );
}
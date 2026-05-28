import { cn } from "@/lib/utils";

const MetricRing = ({ value, label, color }) => {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(220,16%,14%)" strokeWidth="4" />
          <circle
            cx="40" cy="40" r="36" fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold font-mono">
          {value}
        </span>
      </div>
      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
    </div>
  );
};

export default function LiveMetrics({ metrics }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricRing value={metrics.timing} label="Timing" color="hsl(160,84%,50%)" />
      <MetricRing value={metrics.rhythm} label="Rhythm" color="hsl(262,80%,60%)" />
      <MetricRing value={metrics.tempo} label="Tempo" color="hsl(200,80%,55%)" />
      <MetricRing value={metrics.accuracy} label="Accuracy" color="hsl(35,92%,60%)" />
    </div>
  );
}
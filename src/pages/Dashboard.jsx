import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Mic, TrendingUp, Clock, Target, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "../components/StatsCard";
import SessionCard from "../components/SessionCard";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-mono font-bold text-primary">{payload[0].value}%</p>
    </div>
  );
};

export default function Dashboard() {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => base44.entities.PracticeSession.list("-created_date", 20),
  });

  const recentSessions = sessions.slice(0, 5);
  const avgScore = sessions.length
    ? Math.round(sessions.reduce((a, s) => a + (s.overall_score || 0), 0) / sessions.length)
    : 0;
  const totalMinutes = Math.round(sessions.reduce((a, s) => a + (s.duration_seconds || 0), 0) / 60);
  const totalNotes = sessions.reduce((a, s) => a + (s.notes_played || 0), 0);

  const chartData = [...sessions].reverse().slice(-10).map((s, i) => ({
    name: `S${i + 1}`,
    score: s.overall_score || 0,
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Your practice overview and performance insights</p>
        </div>
        <Link to="/session">
          <Button className="gap-2 glow-primary">
            <Mic className="w-4 h-4" /> Start Session
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard label="Avg Score" value={avgScore} unit="/100" icon={Target} trend={5.2} />
        <StatsCard label="Total Practice" value={totalMinutes} unit="min" icon={Clock} trend={12} />
        <StatsCard label="Notes Played" value={totalNotes.toLocaleString()} icon={Zap} />
        <StatsCard label="Sessions" value={sessions.length} icon={TrendingUp} trend={8} />
      </div>

      {/* Chart + Recent */}
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 p-5 rounded-xl bg-card border border-border">
          <h2 className="text-sm font-semibold mb-4">Performance Trend</h2>
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(160,84%,50%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(160,84%,50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: "hsl(215,14%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "hsl(215,14%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="hsl(160,84%,50%)" strokeWidth={2} fill="url(#scoreGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
              Complete more sessions to see trends
            </div>
          )}
        </div>

        <div className="col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent Sessions</h2>
            <Link to="/analytics" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-xl bg-secondary animate-pulse" />
              ))}
            </div>
          ) : recentSessions.length > 0 ? (
            recentSessions.map(s => <SessionCard key={s.id} session={s} />)
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground rounded-xl border border-dashed border-border">
              No sessions yet. Start your first practice!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
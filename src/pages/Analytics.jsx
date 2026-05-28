import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PolarRadiusAxis,
} from "recharts";
import SessionCard from "../components/SessionCard";

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-mono font-bold" style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => base44.entities.PracticeSession.list("-created_date", 50),
  });

  const reversed = [...sessions].reverse();
  const trendData = reversed.slice(-15).map((s, i) => ({
    name: `#${i + 1}`,
    score: s.overall_score || 0,
    timing: s.timing_accuracy || 0,
    rhythm: s.rhythm_consistency || 0,
  }));

  const mistakeData = reversed.slice(-10).map((s, i) => ({
    name: `#${i + 1}`,
    mistakes: s.mistakes_count || 0,
    notes: s.notes_played || 0,
  }));

  const avgMetrics = sessions.length ? {
    timing: Math.round(sessions.reduce((a, s) => a + (s.timing_accuracy || 0), 0) / sessions.length),
    rhythm: Math.round(sessions.reduce((a, s) => a + (s.rhythm_consistency || 0), 0) / sessions.length),
    tempo: Math.round(sessions.reduce((a, s) => a + (s.tempo_stability || 0), 0) / sessions.length),
    score: Math.round(sessions.reduce((a, s) => a + (s.overall_score || 0), 0) / sessions.length),
  } : { timing: 0, rhythm: 0, tempo: 0, score: 0 };

  const radarData = [
    { skill: "Timing", value: avgMetrics.timing },
    { skill: "Rhythm", value: avgMetrics.rhythm },
    { skill: "Tempo", value: avgMetrics.tempo },
    { skill: "Score", value: avgMetrics.score },
  ];

  const exerciseCounts = sessions.reduce((acc, s) => {
    if (s.exercise_type) acc[s.exercise_type] = (acc[s.exercise_type] || 0) + 1;
    return acc;
  }, {});
  const exerciseData = Object.entries(exerciseCounts).map(([name, count]) => ({ name, count }));

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Deep dive into your performance data</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 p-5 rounded-xl bg-card border border-border">
          <h3 className="text-sm font-semibold mb-4">Score and Timing Trend</h3>
          {trendData.length > 1 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="gScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(160,84%,50%)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="hsl(160,84%,50%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gTiming" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(262,80%,60%)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(262,80%,60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,16%,14%)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(215,14%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "hsl(215,14%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="score" stroke="hsl(160,84%,50%)" strokeWidth={2} fill="url(#gScore)" name="Score" />
                <Area type="monotone" dataKey="timing" stroke="hsl(262,80%,60%)" strokeWidth={2} fill="url(#gTiming)" name="Timing" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
              Need more sessions to show trends
            </div>
          )}
        </div>

        <div className="p-5 rounded-xl bg-card border border-border">
          <h3 className="text-sm font-semibold mb-4">Skill Radar</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(220,16%,18%)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(215,14%,50%)", fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="value" stroke="hsl(160,84%,50%)" fill="hsl(160,84%,50%)" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-card border border-border">
          <h3 className="text-sm font-semibold mb-4">Mistake Frequency</h3>
          {mistakeData.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={mistakeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,16%,14%)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(215,14%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(215,14%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="mistakes" fill="hsl(0,72%,55%)" radius={[4, 4, 0, 0]} name="Mistakes" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
          )}
        </div>

        <div className="p-5 rounded-xl bg-card border border-border">
          <h3 className="text-sm font-semibold mb-4">Practice Distribution</h3>
          {exerciseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={exerciseData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,16%,14%)" />
                <XAxis type="number" tick={{ fill: "hsl(215,14%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "hsl(215,14%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" fill="hsl(262,80%,60%)" radius={[0, 4, 4, 0]} name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3">All Sessions</h2>
        {sessions.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {sessions.map(s => <SessionCard key={s.id} session={s} />)}
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-muted-foreground rounded-xl border border-dashed border-border">
            No sessions recorded yet
          </div>
        )}
      </div>
    </div>
  );
}
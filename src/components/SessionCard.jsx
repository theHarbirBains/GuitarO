import { Clock, Music, Target } from "lucide-react";
import moment from "moment";

const difficultyColors = {
  beginner: "text-primary",
  intermediate: "text-chart-3",
  advanced: "text-accent",
  expert: "text-chart-5",
};

export default function SessionCard({ session }) {
  const mins = Math.floor((session.duration_seconds || 0) / 60);

  return (
    <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-200 group cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">{session.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {moment(session.created_date).fromNow()}
          </p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold font-mono text-primary">{session.overall_score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {mins}m
        </span>
        <span className="flex items-center gap-1">
          <Music className="w-3 h-3" /> {session.notes_played || 0} notes
        </span>
        <span className="flex items-center gap-1">
          <Target className="w-3 h-3" /> {session.mistakes_count || 0} mistakes
        </span>
      </div>

      <div className="mt-3 flex gap-1.5">
        {session.exercise_type && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
            {session.exercise_type}
          </span>
        )}
        {session.difficulty_level && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full bg-secondary font-medium ${difficultyColors[session.difficulty_level] || ""}`}>
            {session.difficulty_level}
          </span>
        )}
      </div>
    </div>
  );
}
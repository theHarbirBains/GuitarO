import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, BookOpen, Target, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import ReactMarkdown from "react-markdown";

export default function PracticePlans() {
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState("general");
  const [level, setLevel] = useState("intermediate");

  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => base44.entities.PracticeSession.list("-created_date", 20),
  });

  const generatePlan = async () => {
    setLoading(true);
    const recent = sessions.slice(0, 10);
    const avgScore = recent.length
      ? Math.round(recent.reduce((a, s) => a + (s.overall_score || 0), 0) / recent.length)
      : 0;
    const avgTiming = recent.length
      ? Math.round(recent.reduce((a, s) => a + (s.timing_accuracy || 0), 0) / recent.length)
      : 0;
    const avgRhythm = recent.length
      ? Math.round(recent.reduce((a, s) => a + (s.rhythm_consistency || 0), 0) / recent.length)
      : 0;
    const totalMistakes = recent.reduce((a, s) => a + (s.mistakes_count || 0), 0);
    const exerciseTypes = recent.map(s => s.exercise_type).filter(Boolean);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert guitar instructor creating a personalized weekly practice plan.

Student Level: ${level}
Focus Area: ${focus}
Recent Performance (last ${recent.length} sessions):
- Average Score: ${avgScore}/100
- Average Timing Accuracy: ${avgTiming}%
- Average Rhythm Consistency: ${avgRhythm}%
- Total Mistakes: ${totalMistakes}
- Practice Types: ${exerciseTypes.join(", ") || "none yet"}

Create a detailed 7-day practice plan with:
1. Daily exercises (15-30 min each day)
2. Specific techniques to work on
3. Warmup and cooldown routines
4. Progressive difficulty throughout the week
5. Tips for the weakest areas based on performance data

Use markdown formatting with headers, bullet points, and bold text. Be specific about exercises, scales, chord progressions, and BPM targets.`,
    });
    setPlan(res);
    setLoading(false);
  };

  const presets = [
    { icon: Target, title: "Technique Builder", desc: "Focus on speed and accuracy", focus: "technique" },
    { icon: Music, title: "Chord Mastery", desc: "Master chord transitions", focus: "chords" },
    { icon: BookOpen, title: "Theory Deep Dive", desc: "Scales, modes, and theory", focus: "scales" },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Practice Plans</h1>
        <p className="text-sm text-muted-foreground mt-1">Personalized recommendations powered by your performance data</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {presets.map(({ icon: Icon, title, desc, focus: f }) => (
          <button
            key={f}
            onClick={() => setFocus(f)}
            className={`p-5 rounded-xl border text-left transition-all duration-200 ${
              focus === f
                ? "bg-primary/10 border-primary/30 glow-primary"
                : "bg-card border-border hover:border-primary/20"
            }`}
          >
            <Icon className={`w-5 h-5 mb-3 ${focus === f ? "text-primary" : "text-muted-foreground"}`} />
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{desc}</p>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["beginner", "intermediate", "advanced", "expert"].map(l => (
              <SelectItem key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={focus} onValueChange={setFocus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["general", "technique", "chords", "scales", "fingerpicking", "strumming", "improvisation"].map(f => (
              <SelectItem key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={generatePlan} disabled={loading} className="gap-2 glow-primary">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "Generating..." : "Generate Plan"}
        </Button>
      </div>

      {plan ? (
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="prose prose-sm prose-invert max-w-none
            [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mb-3
            [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-5 [&_h2]:mb-2
            [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-4 [&_h3]:mb-1
            [&_p]:text-sm [&_p]:text-muted-foreground [&_p]:leading-relaxed
            [&_li]:text-sm [&_li]:text-muted-foreground
            [&_strong]:text-foreground
            [&_ul]:space-y-1 [&_ol]:space-y-1
          ">
            <ReactMarkdown>{plan}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="p-16 text-center rounded-xl border border-dashed border-border">
          <Sparkles className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Select your preferences and generate a personalized practice plan</p>
          <p className="text-xs text-muted-foreground mt-1">Plans are based on your recent session data and skill level</p>
        </div>
      )}
    </div>
  );
}
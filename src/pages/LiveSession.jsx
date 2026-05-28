import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Mic, MicOff, Square, Play, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import WaveformVisualizer from "../components/WaveformVisualizer";
import LiveMetrics from "../components/LiveMetrics";
import { toast } from "sonner";

export default function LiveSession() {
  const queryClient = useQueryClient();
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [exerciseType, setExerciseType] = useState("scales");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [bpm, setBpm] = useState(120);
  const [analyserNode, setAnalyserNode] = useState(null);
  const [metrics, setMetrics] = useState({ timing: 0, rhythm: 0, tempo: 0, accuracy: 0 });
  const [detectedNote, setDetectedNote] = useState("—");
  const [notesPlayed, setNotesPlayed] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [aiFeedback, setAiFeedback] = useState("");
  const [generating, setGenerating] = useState(false);

  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const simRef = useRef(null);

  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  const startSession = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    audioCtxRef.current = audioCtx;
    streamRef.current = stream;
    setAnalyserNode(analyser);
    setIsRecording(true);
    setElapsed(0);
    setNotesPlayed(0);
    setMistakes(0);
    setAiFeedback("");

    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);

    // Simulate live metrics updates
    simRef.current = setInterval(() => {
      setMetrics({
        timing: Math.min(100, Math.max(40, 75 + Math.floor(Math.random() * 20 - 10))),
        rhythm: Math.min(100, Math.max(40, 70 + Math.floor(Math.random() * 25 - 12))),
        tempo: Math.min(100, Math.max(40, 80 + Math.floor(Math.random() * 15 - 7))),
        accuracy: Math.min(100, Math.max(40, 72 + Math.floor(Math.random() * 22 - 11))),
      });
      setDetectedNote(notes[Math.floor(Math.random() * notes.length)] + (Math.random() > 0.5 ? "4" : "3"));
      setNotesPlayed(n => n + Math.floor(Math.random() * 3 + 1));
      if (Math.random() > 0.7) setMistakes(m => m + 1);
    }, 800);
  }, []);

  const stopSession = useCallback(() => {
    setIsRecording(false);
    clearInterval(timerRef.current);
    clearInterval(simRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    setAnalyserNode(null);
  }, []);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(simRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioCtxRef.current?.state !== "closed") audioCtxRef.current?.close();
    };
  }, []);

  const saveSession = useMutation({
    mutationFn: async () => {
      const overall = Math.round((metrics.timing + metrics.rhythm + metrics.tempo + metrics.accuracy) / 4);
      const session = await base44.entities.PracticeSession.create({
        title: `${exerciseType.charAt(0).toUpperCase() + exerciseType.slice(1)} Practice`,
        duration_seconds: elapsed,
        timing_accuracy: metrics.timing,
        rhythm_consistency: metrics.rhythm,
        tempo_stability: metrics.tempo,
        overall_score: overall,
        bpm,
        mistakes_count: mistakes,
        notes_played: notesPlayed,
        difficulty_level: difficulty,
        exercise_type: exerciseType,
        ai_feedback: aiFeedback,
      });
      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session saved successfully!");
    },
  });

  const generateFeedback = async () => {
    setGenerating(true);
    const overall = Math.round((metrics.timing + metrics.rhythm + metrics.tempo + metrics.accuracy) / 4);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert guitar coach. Analyze this practice session and provide specific, actionable feedback:
      
Exercise: ${exerciseType} (${difficulty} level)
BPM: ${bpm}
Duration: ${Math.floor(elapsed / 60)}m ${elapsed % 60}s
Notes played: ${notesPlayed}
Mistakes: ${mistakes}
Timing accuracy: ${metrics.timing}%
Rhythm consistency: ${metrics.rhythm}%
Tempo stability: ${metrics.tempo}%
Note accuracy: ${metrics.accuracy}%
Overall score: ${overall}/100

Provide 3-4 specific improvement tips and a brief overall assessment. Be encouraging but honest. Keep it under 200 words.`,
    });
    setAiFeedback(res);
    setGenerating(false);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live Session</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time performance analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={exerciseType} onValueChange={setExerciseType}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["scales", "chords", "fingerpicking", "strumming", "song", "improvisation", "technique"].map(t => (
                <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["beginner", "intermediate", "advanced", "expert"].map(d => (
                <SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Waveform */}
      <div className="rounded-xl bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {isRecording && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-xs font-mono text-destructive font-medium">RECORDING</span>
              </div>
            )}
            <span className="text-3xl font-mono font-bold tabular-nums">{formatTime(elapsed)}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-mono font-bold text-primary">{detectedNote}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Detected</p>
            </div>
            <div className="text-center px-4 border-l border-border">
              <p className="text-lg font-mono font-bold">{bpm}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">BPM</p>
            </div>
          </div>
        </div>
        <WaveformVisualizer analyserNode={analyserNode} isActive={isRecording} />
        <div className="flex items-center justify-center gap-3 mt-4">
          {!isRecording ? (
            <Button onClick={startSession} size="lg" className="gap-2 glow-primary">
              <Play className="w-4 h-4" /> Start Recording
            </Button>
          ) : (
            <Button onClick={stopSession} variant="destructive" size="lg" className="gap-2">
              <Square className="w-4 h-4" /> Stop
            </Button>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 p-5 rounded-xl bg-card border border-border">
          <h3 className="text-sm font-semibold mb-4">Live Metrics</h3>
          <LiveMetrics metrics={metrics} />
        </div>

        <div className="col-span-1 p-5 rounded-xl bg-card border border-border space-y-4">
          <h3 className="text-sm font-semibold">Session Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Notes Played</span>
              <span className="font-mono font-semibold">{notesPlayed}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mistakes</span>
              <span className="font-mono font-semibold text-destructive">{mistakes}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Accuracy Rate</span>
              <span className="font-mono font-semibold text-primary">
                {notesPlayed ? Math.round(((notesPlayed - mistakes) / notesPlayed) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Score</span>
              <span className="font-mono font-semibold">
                {Math.round((metrics.timing + metrics.rhythm + metrics.tempo + metrics.accuracy) / 4)}
              </span>
            </div>
          </div>
        </div>

        <div className="col-span-1 p-5 rounded-xl bg-card border border-border flex flex-col">
          <h3 className="text-sm font-semibold mb-3">AI Coach</h3>
          {aiFeedback ? (
            <p className="text-xs text-muted-foreground leading-relaxed flex-1 overflow-y-auto">{aiFeedback}</p>
          ) : (
            <p className="text-xs text-muted-foreground flex-1 flex items-center justify-center">
              {elapsed > 0 ? "Click below to get AI feedback" : "Start a session first"}
            </p>
          )}
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={elapsed === 0 || generating}
              onClick={generateFeedback}
            >
              {generating ? "Analyzing..." : "Get Feedback"}
            </Button>
            <Button
              size="sm"
              className="flex-1 gap-1"
              disabled={elapsed === 0 || saveSession.isPending}
              onClick={() => { if (isRecording) stopSession(); saveSession.mutate(); }}
            >
              <Save className="w-3 h-3" /> Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
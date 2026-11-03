import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, StopCircle, SkipForward, SkipBack, Volume2, VolumeX, Shuffle, Repeat, Heart, Trash2, Download, Zap, Mic, Guitar, Piano, Drum, Waves, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectOption } from "@/components/ui/select";
import { PLUGIN_URL } from "@/lib/plugin";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { globalStyles } from "@/lib/music-styles";

// Instruments for GarageBand-style selector
const INSTRUMENTS = [
  { id: "synth", label: "Synth", icon: Zap, color: "#a855f7" },
  { id: "piano", label: "Piano", icon: Piano, color: "#f59e0b" },
  { id: "guitar", label: "Guitar", icon: Guitar, color: "#10b981" },
  { id: "drums", label: "Drums", icon: Drum, color: "#ef4444" },
  { id: "vocals", label: "Vocals", icon: Mic, color: "#38bdf8" },
  { id: "ambient", label: "Ambient", icon: Waves, color: "#8b5cf6" },
];

const STYLES = ["Cinematic", "Synthwave", "Lo-Fi", "Ambient", "Rock", "Pop", "Jazz", "Electronic", "Orchestral", "Acoustic"];

export default function MusicStudioPage() {
  const [activeView, setActiveView] = useState<"browser" | "studio" | "suno">("browser");
  const [selectedInstrument, setSelectedInstrument] = useState("synth");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Synthwave");
  const [genre, setGenre] = useState("synthwave");
  const [loading, setLoading] = useState(false);
  const [styleInput, setStyleInput] = useState("");

  const {
    isPlaying, currentTrack, volume, isMuted,
    tracks, loading: playerLoading, error,
    togglePlay, next, prev, setVolume,
    generateTrack, playing,
  } = useMusicPlayer();

  // Inject global styles
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = globalStyles;
    document.head.appendChild(s);
    return () => { s.remove(); };
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    await generateTrack(prompt, styleInput || style);
    setLoading(false);
  };

  return (
    <div className="musicStudioPage">
      {/* Header bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border/30 bg-background/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-midground flex items-center justify-center">
            <Music size={18} className="text-midground-foreground" />
          </div>
          <h1 className="text-lg font-bold tracking-wider uppercase">Music Studio</h1>
        </div>
        <nav className="flex gap-1">
          {(["browser", "studio", "suno"] as const).map(v => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                activeView === v ? "bg-midground text-midground-foreground" : "text-muted-foreground hover:text-foreground hover:bg-background/40"
              }`}
            >
              {v}
            </button>
          ))}
        </nav>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* ===== BROWSER VIEW ===== */}
        {activeView === "browser" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Library</h2>
              <Badge variant="secondary">{tracks.length} tracks</Badge>
            </div>

            {/* Now Playing */}
            {currentTrack && (
              <Card className="glassPanel">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-midground/30 to-midground/10 flex items-center justify-center flex-shrink-0">
                    {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{currentTrack.title}</div>
                    <div className="text-sm text-muted-foreground">{currentTrack.status}</div>
                  </div>
<div className="flex items-center gap-2">
                    <button onClick={togglePlay} className="px-2 py-1 text-xs border rounded">{isPlaying ? "Pause" : "Play"}</button>
                    <button onClick={next} className="px-2 py-1 text-xs border rounded">Next</button>
                    <button onClick={prev} className="px-2 py-1 text-xs border rounded">Prev</button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Track list */}
            <div className="grid gap-3">
              {tracks.map((track, i) => (
                <Card key={track.task_id || i} className="glassPanel hover:border-border/20 transition-all cursor-pointer" onClick={() => play(track.task_id)}>
                  <CardContent className="flex items-center gap-4 p-3">
                    <div className="w-10 h-10 rounded-lg bg-background/60 flex items-center justify-center flex-shrink-0">
                      {track.status === "complete" ? <Download size={16} /> : <Radio size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{track.title}</div>
                      <Badge variant="outline" className="mt-1">{track.status}</Badge>
                    </div>
                    {track.audio_url && (
                      <audio src={track.audio_url} controls className="h-8" />
                    )}
                  </CardContent>
                </Card>
              ))}
              {tracks.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Radio size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No tracks yet</p>
                  <p className="text-sm mt-1">Generate your first track on the Suno tab</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== STUDIO VIEW (DAW-style) ===== */}
        {activeView === "studio" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Studio</h2>
            <div className="grid grid-cols-12 gap-4">
              {/* Instrument strip */}
              <div className="col-span-3">
                <Card className="glassPanel">
                  <CardHeader><CardTitle>Instruments</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {INSTRUMENTS.map(inst => (
                      <button
                        key={inst.id}
                        onClick={() => setSelectedInstrument(inst.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                          selectedInstrument === inst.id ? "bg-midground/20 border border-midground/30" : "hover:bg-background/40"
                        }`}
                        style={selectedInstrument === inst.id ? { borderLeft: `3px solid ${inst.color}` } : {}}
                      >
                        <inst.icon size={18} style={{ color: inst.color }} />
                        {inst.label}
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Controls & mixer */}
              <div className="col-span-6 space-y-4">
                {/* Transport controls */}
                <Card className="glassPanel">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center gap-6">
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-background/40">
                        <SkipBack size={20} />
                      </Button>
                      <Button
                        variant="default"
                        size="icon"
                        onClick={togglePlay}
                        className="h-16 w-16 rounded-full bg-midground text-midground-foreground hover:bg-midground/90 shadow-xl"
                      >
                        {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-background/40">
                        <SkipForward size={20} />
                      </Button>
                    </div>

                    {/* Volume & transport row */}
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-3">
                        {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        <input type="range" min="0" max="100" value={volume} onChange={e => setVolume(Number(e.target.value))} className="w-32 h-1 accent-midground" />
                        <span className="text-xs text-muted-foreground w-8">{volume}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Shuffle size={14} /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Repeat size={14} /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Waveform visualization placeholder */}
                <Card className="glassPanel">
                  <CardContent className="p-4">
                    <div className="flex items-end justify-center gap-0.5 h-20">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div
                          key={i}
                          className="waveformBar"
                          style={{ height: isPlaying ? `${8 + Math.random() * 32}px` : "4px", animationDelay: `${i * 0.05}s`, opacity: isPlaying ? 0.6 + Math.random() * 0.4 : 0.2 }}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Mix controls */}
                <Card className="glassPanel">
                  <CardHeader><CardTitle>Mixer</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4">
                    {INSTRUMENTS.filter(i => i.id === selectedInstrument).map(inst => (
                      <div key={inst.id} className="space-y-2">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider">{inst.label}</label>
                        <input type="range" min="0" max="100" defaultValue="80" className="w-full h-1 accent-midground" />
                        <div className="flex items-center gap-2">
                          <input type="range" min="-60" max="6" step="1" defaultValue="0" className="flex-1 h-1 accent-midground" />
                          <span className="text-xs text-muted-foreground w-10 text-right">0 dB</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Right panel */}
              <div className="col-span-3 space-y-4">
                <Card className="glassPanel">
                  <CardHeader><CardTitle>Effects</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {["Reverb", "Delay", "Chorus", "Distortion", "Filter"].map(eff => (
                      <label key={eff} className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm group-hover:text-midground transition-colors">{eff}</span>
                        <div className="w-10 h-5 rounded-full bg-border relative">
                          <div className="w-4 h-4 rounded-full bg-muted-foreground absolute top-0.5 left-0.5 group-hover:bg-midground transition-colors" />
                        </div>
                      </label>
                    ))}
                  </CardContent>
                </Card>

                <Card className="glassPanel">
                  <CardHeader><CardTitle>Song Info</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <Input placeholder="Track title" />
                    <Input placeholder="Artist" />
                    <Select value={genre} onValueChange={setGenre}>
                      {STYLES.map(s => <SelectOption key={s} value={s.toLowerCase()}>{s}</SelectOption>)}
                    </Select>
                    <textarea placeholder="Notes / lyrics..." className="w-full h-24 bg-background/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-foreground/25" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ===== SUNO TAB ===== */}
        {activeView === "suno" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Suno AI</h2>
            <div className="grid grid-cols-2 gap-6">
              {/* Generation panel */}
              <Card className="glassPanel">
                <CardHeader><CardTitle>Generate Track</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Describe the music you want to create..."
                    className="w-full h-28 bg-background/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-foreground/25"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Select value={style} onValueChange={setStyle}>
                      {STYLES.map(s => <SelectOption key={s} value={s}>{s}</SelectOption>)}
                    </Select>
                    <Input placeholder="Style override..." value={styleInput} onChange={e => setStyleInput(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-midground" /> Instrumental
                    </label>
                  </div>
                  <Button
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim()}
                    className="w-full bg-midground text-midground-foreground hover:bg-midground/90"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-midground-foreground border-t-transparent rounded-full animate-spin" /> Generating...</span>
                    ) : (
                      <span className="flex items-center gap-2"><Zap size={16} /> Generate</span>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Suno Embed */}
              <Card className="glassPanel">
                <CardHeader><CardTitle>Suno Player</CardTitle></CardHeader>
                <CardContent>
                  <div className="sunoEmbedContainer">
                    {tracks.filter(t => t.status === "complete").length > 0 ? (
                      <div className="space-y-4">
                        <iframe
                          src={tracks.filter(t => t.status === "complete")[0].audio_url?.replace("/api/", "/embed/") || `https://suno.com/embed/${tracks[0].task_id}`}
                          width="100%"
                          height="380"
                          frameBorder="0"
                          allow="autoplay; encrypted-media"
                          className="w-full"
                          style={{ minHeight: "380px", background: "#0a0a0f" }}
                        />
                        <div className="p-3 border-t border-border/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold">{tracks.filter(t => t.status === "complete")[0].title}</div>
                              <Badge variant="secondary">Generated</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">Open in Suno</Button>
                              <Button size="sm">Download</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <Radio size={48} className="mb-4 opacity-30" />
                        <p className="text-sm">Generate a track to see the Suno player</p>
                        <p className="text-xs mt-1 opacity-50">Embeds via suno.com/embed/{`{songId}`}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent tracks from Suno */}
            <Card className="glassPanel">
              <CardHeader><CardTitle>Recent Generations</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {tracks.filter(t => t.status === "complete").map(track => (
                    <div key={track.task_id} className="flex items-center gap-4 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-lg bg-midground/20 flex items-center justify-center"><Music size={18} className="text-midground" /></div>
                      <div className="flex-1"><div className="text-sm font-medium">{track.title}</div><Badge variant="outline" className="mt-1">{track.status}</Badge></div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm"><Heart size={14} /></Button>
                        <Button variant="ghost" size="sm"><Download size={14} /></Button>
                        <Button variant="ghost" size="sm"><Trash2 size={14} /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

// Icons inline (lucide-react won't be available in IIFE without bundling)
function Music(props: any) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>; }
function Pause(props: any) { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>; }
function Play(props: any) { return <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><polygon points="6 3 20 12 6 21 6 3"/></svg>; }
function Radio(props: any) { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>; }
function Download(props: any) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>; }
function Heart(props: any) { return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>; }
function Trash2(props: any) { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>; }
function Zap(props: any) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>; }
function Waves(props: any) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M2 12h4l3-9 4 18 3-9h4"/></svg>; }
function Mic(props: any) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><rect x="9" y="1" width="6" height="12" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>; }
function Guitar(props: any) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>; }
function Piano(props: any) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="6" y1="8" x2="6" y2="20"/><line x1="10" y1="8" x2="10" y2="20"/><line x1="14" y1="8" x2="14" y2="20"/><line x1="18" y1="8" x2="18" y2="20"/></svg>; }
function Drum(props: any) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>; }
function Shuffle(props: any) { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>; }
function Repeat(props: any) { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>; }
function Volume2(props: any) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>; }
function VolumeX(props: any) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>; }
function SkipBack(props: any) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" {...props}><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>; }
function SkipForward(props: any) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" {...props}><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>; }


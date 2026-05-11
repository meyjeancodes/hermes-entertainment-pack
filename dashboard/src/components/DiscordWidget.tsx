"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Send, AlertCircle, Wifi, WifiOff, RefreshCw, ChevronDown } from "lucide-react";
import { Select, SelectOption } from "@/components/ui/select";

interface Guild { id: string; name: string; icon: string | null; }
interface Channel { id: string; name: string; type: number; position: number; parent_id: string | null; }
interface Attachment { id: string; url: string; filename: string; content_type: string; width?: number; height?: number; size?: number; }
interface Embed {
  type: string; title?: string; description?: string; url?: string; color?: number;
  image?: string; thumbnail?: string; author_name?: string; footer_text?: string;
}
interface Reaction { emoji: string; count: number; }
interface Message {
  id: string; content: string;
  author: { id: string; username: string; discriminator: string; avatar: string | null; bot?: boolean; };
  timestamp: string; edited_timestamp?: string | null;
  channel_id: string; attachments: Attachment[]; embeds: Embed[];
  mention_everyone: boolean; reactions: Reaction[];
}

const POLL_INTERVAL = 8000;

function avatarUrl(author: Message["author"]): string | null {
  if (!author.avatar || !author.id) return null;
  return `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.${author.avatar.startsWith("a_") ? "gif" : "webp"}?size=64`;
}

function guildIconUrl(guild: Guild): string | null {
  if (!guild.icon) return null;
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=64`;
}

// Discord markdown → React nodes
function parseMarkdown(text: string): React.ReactNode {
  if (!text) return null;
  const parts: React.ReactNode[] = [];
  // Patterns ordered by priority
  const re = /```([\s\S]*?)```|`([^`]+)`|\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|__(.+?)__|~~(.+?)~~|> (.+)|https?:\/\/\S+/g;
  let last = 0, match: RegExpExecArray | null, key = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const [full, codeBlock, inlineCode, boldItalic, bold, italic, underline, strike, quote, ] = match;
    if (codeBlock !== undefined) {
      parts.push(<code key={key++} style={{ display:'block', background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:4, padding:'6px 10px', fontSize:'0.75rem', fontFamily:'monospace', whiteSpace:'pre-wrap', margin:'4px 0', color:'#e8e8e8' }}>{codeBlock}</code>);
    } else if (inlineCode !== undefined) {
      parts.push(<code key={key++} style={{ background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:3, padding:'1px 4px', fontSize:'0.8em', fontFamily:'monospace', color:'#e8d5b0' }}>{inlineCode}</code>);
    } else if (boldItalic !== undefined) {
      parts.push(<strong key={key++}><em>{boldItalic}</em></strong>);
    } else if (bold !== undefined) {
      parts.push(<strong key={key++}>{bold}</strong>);
    } else if (italic !== undefined) {
      parts.push(<em key={key++}>{italic}</em>);
    } else if (underline !== undefined) {
      parts.push(<span key={key++} style={{ textDecoration:'underline' }}>{underline}</span>);
    } else if (strike !== undefined) {
      parts.push(<span key={key++} style={{ textDecoration:'line-through' }}>{strike}</span>);
    } else if (quote !== undefined) {
      parts.push(<span key={key++} style={{ display:'block', borderLeft:'3px solid rgba(255,255,255,0.2)', paddingLeft:8, color:'rgba(255,255,255,0.6)', margin:'2px 0' }}>{quote}</span>);
    } else {
      // Plain URL
      parts.push(<a key={key++} href={full} target="_blank" rel="noreferrer" style={{ color:'#7289da', textDecoration:'underline', wordBreak:'break-all' }}>{full}</a>);
    }
    last = match.index + full.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function DiscordTimestamp({ ts }: { ts: string }) {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return <span>{time}</span>;
  if (isYesterday) return <span>Yesterday at {time}</span>;
  return <span>{d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at {time}</span>;
}

function Avatar({ author }: { author: Message["author"] }) {
  const [failed, setFailed] = useState(false);
  const url = avatarUrl(author);
  if (url && !failed) {
    return <img src={url} alt={author.username} onError={() => setFailed(true)} style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover', flexShrink:0 }} />;
  }
  const initials = (author.username || "?").charAt(0).toUpperCase();
  const hue = [...(author.id || "")].reduce((h, c) => (h * 31 + c.charCodeAt(0)) & 0xffff, 0) % 360;
  return (
    <div style={{ width:36, height:36, borderRadius:'50%', background:`hsl(${hue},55%,40%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', fontWeight:700, color:'white', flexShrink:0 }}>
      {initials}
    </div>
  );
}

function AttachmentRenderer({ att }: { att: Attachment }) {
  const isImage = att.content_type?.startsWith("image/") || /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(att.filename);
  const isVideo = att.content_type?.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(att.filename);
  if (isImage) {
    return (
      <a href={att.url} target="_blank" rel="noreferrer" style={{ display:'inline-block', marginTop:4 }}>
        <img src={att.url} alt={att.filename} style={{ maxWidth:360, maxHeight:300, borderRadius:6, objectFit:'contain', display:'block', border:'1px solid rgba(255,255,255,0.08)' }} />
      </a>
    );
  }
  if (isVideo) {
    return <video src={att.url} controls style={{ maxWidth:360, maxHeight:240, borderRadius:6, marginTop:4, display:'block' }} />;
  }
  return (
    <a href={att.url} target="_blank" rel="noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:4, padding:'6px 10px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, fontSize:'0.75rem', color:'#7289da', textDecoration:'none' }}>
      📎 {att.filename}
    </a>
  );
}

function EmbedRenderer({ embed }: { embed: Embed }) {
  const borderColor = embed.color ? `#${embed.color.toString(16).padStart(6, "0")}` : "#4f545c";
  return (
    <div style={{ marginTop:4, borderLeft:`4px solid ${borderColor}`, background:'rgba(0,0,0,0.25)', borderRadius:'0 4px 4px 0', padding:'8px 12px', maxWidth:440, fontSize:'0.8rem' }}>
      {embed.author_name && <div style={{ fontSize:'0.72rem', fontWeight:600, color:'rgba(255,255,255,0.7)', marginBottom:2 }}>{embed.author_name}</div>}
      {embed.title && <div style={{ fontWeight:700, color: embed.url ? '#7289da' : 'white', marginBottom:4 }}>{embed.url ? <a href={embed.url} target="_blank" rel="noreferrer" style={{ color:'#7289da' }}>{embed.title}</a> : embed.title}</div>}
      {embed.description && <div style={{ color:'rgba(255,255,255,0.8)', lineHeight:1.5, marginBottom:4, fontSize:'0.78rem' }}>{embed.description.slice(0, 300)}{embed.description.length > 300 ? "…" : ""}</div>}
      {embed.image && <img src={embed.image} alt="" style={{ maxWidth:'100%', maxHeight:200, borderRadius:4, marginTop:4, display:'block' }} />}
      {!embed.image && embed.thumbnail && <img src={embed.thumbnail} alt="" style={{ maxWidth:80, maxHeight:80, borderRadius:4, float:'right', marginLeft:8 }} />}
      {embed.footer_text && <div style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.4)', marginTop:6 }}>{embed.footer_text}</div>}
    </div>
  );
}

export default function DiscordWidget() {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [compose, setCompose] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNew, setHasNew] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const latestMsgIdRef = useRef<string | null>(null);
  const isAtBottomRef = useRef(true);
  const selectedChannelIdRef = useRef<string | null>(null);
  selectedChannelIdRef.current = selectedChannelId;

  const afetch = useCallback(async (url: string, opts: RequestInit = {}): Promise<Response> => {
    const token = (window as any).__HERMES_SESSION_TOKEN__;
    const headers = new Headers(opts.headers);
    if (token) headers.set("X-Hermes-Session-Token", token);
    if (opts.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    return fetch(url, { ...opts, headers });
  }, []);

  const channel = channels.find(c => c.id === selectedChannelId) || null;

  // Track scroll position to know if user is at bottom
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    isAtBottomRef.current = atBottom;
    if (atBottom) setHasNew(false);
  }, []);

  const scrollToBottom = useCallback((smooth = false) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "instant" });
    setHasNew(false);
  }, []);

  // Initial message load — wipe and reload
  const loadMessages = useCallback(async (channelId: string) => {
    setLoadingMessages(true);
    setMessages([]);
    latestMsgIdRef.current = null;
    try {
      const res = await afetch(`/api/plugins/hermes-entertainment-pack/discord/messages?channel_id=${encodeURIComponent(channelId)}&limit=50`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list: Message[] = Array.isArray(data) ? data : (data.data ?? []);
      const sorted = [...list].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      setMessages(sorted);
      if (sorted.length) latestMsgIdRef.current = sorted[sorted.length - 1].id;
    } catch (e: any) {
      setError(`Failed to load messages: ${e.message}`);
    } finally {
      setLoadingMessages(false);
      setInitializing(false);
      // Scroll to bottom after first load
      setTimeout(() => scrollToBottom(false), 50);
    }
  }, [afetch, scrollToBottom]);

  // Poll for new messages since last known ID
  const pollMessages = useCallback(async () => {
    const channelId = selectedChannelIdRef.current;
    if (!channelId || !latestMsgIdRef.current) return;
    try {
      const url = `/api/plugins/hermes-entertainment-pack/discord/messages?channel_id=${encodeURIComponent(channelId)}&limit=20&after=${latestMsgIdRef.current}`;
      const res = await afetch(url);
      if (!res.ok) return;
      const data = await res.json();
      const incoming: Message[] = Array.isArray(data) ? data : (data.data ?? []);
      if (!incoming.length) return;
      const sorted = [...incoming].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      latestMsgIdRef.current = sorted[sorted.length - 1].id;
      setMessages(prev => {
        const ids = new Set(prev.map(m => m.id));
        return [...prev, ...sorted.filter(m => !ids.has(m.id))];
      });
      if (!isAtBottomRef.current) {
        setHasNew(true);
      }
    } catch {}
  }, [afetch]);

  // Auto-poll
  useEffect(() => {
    if (!selectedChannelId) return;
    const iv = setInterval(pollMessages, POLL_INTERVAL);
    return () => clearInterval(iv);
  }, [selectedChannelId, pollMessages]);

  // Auto-scroll on new messages when already at bottom
  useEffect(() => {
    if (isAtBottomRef.current) scrollToBottom(false);
  }, [messages, scrollToBottom]);

  const fetchGuilds = useCallback(async () => {
    setInitializing(true);
    setError(null);
    try {
      const res = await afetch("/api/plugins/hermes-entertainment-pack/discord/guilds");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      let list: Guild[] = Array.isArray(data) ? data : (data.data ?? []);
      if (data.error) throw new Error(data.error);
      setGuilds(list);
      setConnected(true);
      if (list.length > 0) {
        setSelectedGuildId(g => g ?? list[0].id);
      } else {
        setInitializing(false);
      }
    } catch (e: any) {
      const msg = (e.message || "").toLowerCase();
      setConnected(msg.includes("token") || msg.includes("401") || msg.includes("unauthorized") ? false : null);
      setError(`Failed to load servers: ${e.message}`);
      setInitializing(false);
    }
  }, [afetch]);

  const fetchChannels = useCallback(async (guildId: string) => {
    setInitializing(true);
    setError(null);
    try {
      const res = await afetch(`/api/plugins/hermes-entertainment-pack/discord/channels?guild_id=${encodeURIComponent(guildId)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list: Channel[] = Array.isArray(data) ? data : (data.data ?? []);
      setChannels(list);
      const textChs = list.filter(c => c.type === 0);
      if (textChs.length > 0) setSelectedChannelId(id => (!id || !textChs.find(c => c.id === id)) ? textChs[0].id : id);
      else { setSelectedChannelId(null); setMessages([]); }
    } catch (e: any) {
      setError(`Failed to load channels: ${e.message}`);
      setChannels([]); setSelectedChannelId(null);
    } finally { setInitializing(false); }
  }, [afetch]);

  useEffect(() => { fetchGuilds(); }, [fetchGuilds]);
  useEffect(() => {
    if (selectedGuildId) fetchChannels(selectedGuildId);
    else { setChannels([]); setSelectedChannelId(null); setMessages([]); }
  }, [selectedGuildId, fetchChannels]);
  useEffect(() => {
    if (selectedChannelId) loadMessages(selectedChannelId);
    else setMessages([]);
  }, [selectedChannelId, loadMessages]);

  const handleSend = async () => {
    if (!compose.trim() || !channel) return;
    setSending(true); setError(null);
    try {
      const res = await afetch("/api/plugins/hermes-entertainment-pack/discord/send", {
        method: "POST",
        body: JSON.stringify({ channel_id: channel.id, content: compose.trim() }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || `HTTP ${res.status}`); }
      setCompose("");
      // Immediately poll for new messages (will pick up our own sent message)
      setTimeout(pollMessages, 400);
    } catch (e: any) { setError(`Failed to send: ${e.message}`); }
    finally { setSending(false); }
  };

  // Build categorized channel list
  const categories = channels.filter(c => c.type === 4).sort((a, b) => a.position - b.position);
  const uncategorized = channels.filter(c => c.type === 0 && !c.parent_id);
  const categoryMap = categories.map(cat => ({
    cat,
    children: channels.filter(c => c.type === 0 && c.parent_id === cat.id).sort((a, b) => a.position - b.position),
  }));

  if (connected === false) {
    return (
      <Card className="bg-background-base/50 border-current/10 max-w-md mx-auto mt-12">
        <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <WifiOff className="w-7 h-7 text-indigo-400/60" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground mb-1">Discord Not Connected</p>
            <p className="text-sm text-muted-foreground">Add your bot token to Hermes config:</p>
          </div>
          <code className="text-xs bg-muted/60 px-4 py-2 rounded font-mono text-foreground border border-border/30 w-full text-left">
            hermes auth discord
          </code>
          <p className="text-xs text-muted-foreground/60">Run the command above, then click Retry</p>
          <Button size="sm" variant="outline" onClick={fetchGuilds} className="gap-2">
            <RefreshCw className="w-3 h-3" /> Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] min-h-[500px] bg-background-base/30 border border-border/30 rounded-lg overflow-hidden">

      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-border/30 flex flex-col bg-background-elevated/40">
        {/* Server selector */}
        <div className="p-3 border-b border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[0.6rem] font-mono text-muted-foreground/60 uppercase tracking-widest">Server</span>
            <Button size="icon" variant="ghost" className="h-5 w-5" disabled={refreshing} onClick={async () => { setRefreshing(true); await fetchGuilds(); setRefreshing(false); }} title="Refresh">
              <RefreshCw className={`w-2.5 h-2.5 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <Select value={selectedGuildId ?? ""} onValueChange={(v: string) => { setSelectedGuildId(v || null); setSelectedChannelId(null); }} disabled={guilds.length === 0}>
            <SelectOption value="">— Select server —</SelectOption>
            {guilds.map(g => (
              <SelectOption key={g.id} value={g.id}>{g.name}</SelectOption>
            ))}
          </Select>
        </div>

        {/* Channel list with categories */}
        <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'none' }}>
          {initializing && channels.length === 0 ? (
            <div className="flex items-center gap-1.5 text-muted-foreground p-3">
              <Loader2 className="animate-spin w-3 h-3" /><span className="text-[0.65rem]">Loading…</span>
            </div>
          ) : (
            <>
              {/* Uncategorized channels */}
              {uncategorized.map(c => <ChannelButton key={c.id} c={c} selected={selectedChannelId === c.id} onClick={() => setSelectedChannelId(c.id)} />)}
              {/* Categorized */}
              {categoryMap.map(({ cat, children }) => children.length === 0 ? null : (
                <div key={cat.id} className="mt-3">
                  <div className="px-2 pb-1 flex items-center gap-1">
                    <span className="text-[0.55rem] font-bold text-muted-foreground/40 uppercase tracking-widest truncate">{cat.name}</span>
                  </div>
                  {children.map(c => <ChannelButton key={c.id} c={c} selected={selectedChannelId === c.id} onClick={() => setSelectedChannelId(c.id)} />)}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Status */}
        <div className="p-3 border-t border-border/30 flex items-center gap-1.5">
          {guilds.length > 0
            ? <><Wifi className="w-3 h-3 text-emerald-400" /><span className="text-[0.55rem] text-emerald-400/80 font-mono uppercase tracking-widest">Connected</span></>
            : <><WifiOff className="w-3 h-3 text-muted-foreground/40" /><span className="text-[0.55rem] text-muted-foreground/40 font-mono uppercase tracking-widest">Disconnected</span></>
          }
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Channel header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-background-elevated/20 flex-shrink-0">
          <MessageSquare className="w-4 h-4 text-indigo-400/60 flex-shrink-0" />
          <span className="font-semibold text-sm text-foreground truncate">
            {channel ? `#${channel.name}` : selectedGuildId ? "Select a channel" : "Select a server"}
          </span>
          {guilds.length > 0 && (
            <Badge variant="secondary" className="text-[10px] ml-auto flex items-center gap-1 flex-shrink-0">
              <Wifi className="w-2.5 h-2.5 text-indigo-400" />Discord
            </Badge>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-2" style={{ scrollbarWidth: 'thin' }}>
          {!channel ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <MessageSquare className="w-10 h-10 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground/50">{selectedGuildId ? "Pick a channel from the sidebar" : "Pick a server to get started"}</p>
            </div>
          ) : loadingMessages ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
              <Loader2 className="animate-spin w-4 h-4" /><span className="text-sm">Loading messages…</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <p className="text-sm text-muted-foreground/50">No messages yet in #{channel.name}</p>
            </div>
          ) : (
            <div className="space-y-0.5 pt-2 pb-2">
              {messages.map((msg, idx) => {
                const prev = messages[idx - 1];
                const grouped = prev && prev.author.id === msg.author.id &&
                  new Date(msg.timestamp).getTime() - new Date(prev.timestamp).getTime() < 5 * 60 * 1000;
                return (
                  <div key={msg.id} className={`flex gap-3 group hover:bg-white/[0.02] px-2 py-0.5 rounded ${!grouped ? 'mt-4' : ''}`}>
                    <div className="flex-shrink-0 w-9 mt-0.5">
                      {!grouped ? <Avatar author={msg.author} /> : (
                        <span className="text-[0.55rem] text-muted-foreground/30 text-right block w-full pr-0.5 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {!grouped && (
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-foreground hover:underline cursor-pointer">{msg.author.username}</span>
                          {msg.author.bot && <span className="text-[0.5rem] bg-indigo-500/20 text-indigo-300 px-1 py-px rounded uppercase tracking-wide">APP</span>}
                          <span className="text-[0.6rem] text-muted-foreground/40"><DiscordTimestamp ts={msg.timestamp} /></span>
                          {msg.edited_timestamp && <span className="text-[0.55rem] text-muted-foreground/30">(edited)</span>}
                        </div>
                      )}
                      {msg.content && (
                        <p className="text-sm leading-relaxed break-words text-foreground/85">
                          {parseMarkdown(msg.content)}
                        </p>
                      )}
                      {msg.attachments?.map(att => <AttachmentRenderer key={att.id} att={att} />)}
                      {msg.embeds?.map((e, i) => <EmbedRenderer key={i} embed={e} />)}
                      {msg.reactions?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {msg.reactions.map((r, i) => (
                            <span key={i} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, padding:'1px 7px', fontSize:'0.72rem', display:'inline-flex', alignItems:'center', gap:4 }}>
                              {r.emoji} <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.65rem' }}>{r.count}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* New messages button */}
        {hasNew && (
          <button onClick={() => scrollToBottom(true)} className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-500 text-white shadow-lg hover:bg-indigo-400 transition-all animate-bounce z-10">
            <ChevronDown className="w-3 h-3" /> New messages
          </button>
        )}

        {/* Compose */}
        {channel && (
          <div className="p-3 border-t border-border/30 flex-shrink-0">
            {error && <p className="text-xs text-destructive mb-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
            <div className="flex gap-2">
              <textarea
                value={compose}
                onChange={e => setCompose(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={`Message #${channel.name}`}
                rows={1}
                disabled={sending}
                className="flex-1 min-h-[36px] max-h-[120px] border border-input bg-background-elevated/40 rounded px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/50 resize-none"
              />
              <Button size="sm" disabled={!compose.trim() || sending} onClick={handleSend} className="h-9 px-3 shrink-0 bg-indigo-500/80 hover:bg-indigo-500 text-white border-0">
                {sending ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChannelButton({ c, selected, onClick }: { c: Channel; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-1.5 px-2 py-1 mx-1 rounded text-left transition-all ${selected ? 'bg-indigo-500/15 text-indigo-300' : 'text-muted-foreground/60 hover:bg-muted/20 hover:text-muted-foreground'}`} style={{ width: 'calc(100% - 8px)' }}>
      <span className="text-[0.7rem] text-muted-foreground/40 flex-shrink-0">#</span>
      <span className="text-[0.7rem] font-medium truncate">{c.name}</span>
    </button>
  );
}

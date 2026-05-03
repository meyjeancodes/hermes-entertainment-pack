"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Send, AlertCircle, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Select, SelectOption } from "@/components/ui/select";

interface Guild {
  id: string;
  name: string;
  icon: string | null;
}

interface Channel {
  id: string;
  name: string;
  type: number;
}

interface Message {
  id: string;
  content: string;
  author: {
    username: string;
    discriminator: string;
    avatar: string | null;
    bot?: boolean;
  };
  timestamp: string;
  channel_id: string;
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

  // Helper: make authenticated API call with session token
  const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = window.__HERMES_SESSION_TOKEN__;
    const headers = new Headers(options.headers);
    if (token) {
      headers.set("X-Hermes-Session-Token", token);
    }
    // Ensure Content-Type for JSON bodies
    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return fetch(url, { ...options, headers });
  };


  // Derived: full channel object for the selected channel
  const channel = channels.find((c) => c.id === selectedChannelId) || null;

  useEffect(() => {
    fetchGuilds();
  }, []);

  // When guild changes, fetch its channels
  useEffect(() => {
    if (selectedGuildId) {
      fetchChannels(selectedGuildId);
    } else {
      setChannels([]);
      setSelectedChannelId(null);
      setMessages([]);
    }
  }, [selectedGuildId]);

  // When channel changes, fetch messages
  useEffect(() => {
    if (selectedChannelId) {
      fetchMessages(selectedChannelId);
    } else {
      setMessages([]);
    }
  }, [selectedChannelId]);

  const fetchGuilds = async () => {
    setInitializing(true);
    setError(null);
    try {

      const res = await authenticatedFetch("/api/plugins/hermes-entertainment-pack/discord/guilds");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      let guildList: Guild[] = [];
      if (Array.isArray(data)) {
        guildList = data as Guild[];
      } else if (Array.isArray((data as any).data)) {
        guildList = (data as any).data;
      } else if (data.error) {
        throw new Error(data.error);
      }
      setGuilds(guildList);
      setConnected(true);
      if (guildList.length > 0) {
        // Auto-select first guild if none selected yet
        if (!selectedGuildId) {
          setSelectedGuildId(guildList[0].id);
        }
        // Channels will be fetched by the useEffect watching selectedGuildId
      } else {
        setInitializing(false);
      }
    } catch (e: any) {
      const msg = (e.message || "").toLowerCase();
      const isConfigIssue =
        msg.includes("discord_bot_token") ||
        msg.includes("bot token") ||
        msg.includes("not configured") ||
        msg.includes("unauthorized") ||
        msg.includes("pattern") ||
        msg.includes("invalid token") ||
        msg.includes("401");
      if (isConfigIssue) {
        setConnected(false);
        setError("Discord bot not configured");
      } else {
        setError(`Failed to load guilds: ${e.message}`);
      }
      setGuilds([]);
      setInitializing(false);
    }
  };

  const fetchChannels = async (guildId: string) => {
    setInitializing(true);
    setError(null);
    try {
      const res = await authenticatedFetch(`/api/plugins/hermes-entertainment-pack/discord/channels?guild_id=${encodeURIComponent(guildId)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      let chanList: Channel[] = [];
      if (Array.isArray(data)) {
        chanList = data as Channel[];
      } else if (Array.isArray((data as any).data)) {
        chanList = (data as any).data;
      }
      setChannels(chanList);
      const textChannels = chanList.filter((c) => c.type === 0); // 0 = text
      if (textChannels.length > 0) {
        // Auto-select first text channel if none selected yet for this guild
        if (!selectedChannelId || !textChannels.find((c) => c.id === selectedChannelId)) {
          setSelectedChannelId(textChannels[0].id);
        }
        return;
      }
      setSelectedChannelId(null);
      setMessages([]);
    } catch (e: any) {
      setError(`Failed to load channels: ${e.message}`);
      setChannels([]);
      setSelectedChannelId(null);
    } finally {
      setInitializing(false);
    }
  };

  const fetchMessages = useCallback(async (channelId: string) => {
    setLoadingMessages(true);
    setMessages([]);
    try {
      const res = await authenticatedFetch(`/api/plugins/hermes-entertainment-pack/discord/messages?channel_id=${encodeURIComponent(channelId)}&limit=50`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      let msgList: Message[] = [];
      if (Array.isArray(data)) {
        msgList = data.sort((a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      } else if (Array.isArray((data as any).data)) {
        msgList = (data as any).data.sort((a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      } else if (data.error) {
        throw new Error(data.error);
      }
      setMessages(msgList);
    } catch (e: any) {
      setError(`Failed to load messages: ${e.message}`);
    } finally {
      setLoadingMessages(false);
      setInitializing(false);
    }
  }, []);

  const handleSend = async () => {
    if (!compose.trim() || !channel) return;
    setSending(true);
    setError(null);
    try {
      const res = await authenticatedFetch("/api/plugins/hermes-entertainment-pack/discord/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel_id: channel.id, content: compose.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      setCompose("");
      await fetchMessages(channel.id);
    } catch (e: any) {
      setError(`Failed to send: ${e.message}`);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatAuthor = (author: Message["author"]) => {
    const name = author.username || "unknown";
    return author.bot ? `${name}#${author.discriminator} (BOT)` : name;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    await fetchGuilds();
    setRefreshing(false);
  };

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
          <Button size="sm" variant="outline" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="w-3 h-3" /> Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error && guilds.length === 0) {
    return (
      <Card className="bg-background-base/50 border-current/10">
        <CardContent className="p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <span className="text-sm text-destructive">{error}</span>
        </CardContent>
      </Card>
    );
  }

  const textChannels = channels.filter(c => c.type === 0);

  return (
    <div className="flex h-[calc(100vh-120px)] min-h-[500px] bg-background-base/30 border border-border/30 rounded-lg overflow-hidden">
      {/* Left sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-border/30 flex flex-col bg-background-elevated/40">
        {/* Server selector */}
        <div className="p-3 border-b border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[0.6rem] font-mono text-muted-foreground/60 uppercase tracking-widest">Server</span>
            <Button size="icon" variant="ghost" className="h-5 w-5" disabled={refreshing} onClick={handleRefresh} title="Refresh">
              <RefreshCw className={`w-2.5 h-2.5 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <Select
            value={selectedGuildId ?? ""}
            onValueChange={(v: string) => setSelectedGuildId(v || null)}
            disabled={guilds.length === 0}
          >
            <SelectOption value="">— Select server —</SelectOption>
            {guilds.map((g) => (
              <SelectOption key={g.id} value={g.id}>{g.name}</SelectOption>
            ))}
          </Select>
        </div>

        {/* Channel list */}
        <div className="flex-1 overflow-y-auto p-2">
          {initializing && textChannels.length === 0 ? (
            <div className="flex items-center gap-1.5 text-muted-foreground p-2">
              <Loader2 className="animate-spin w-3 h-3" />
              <span className="text-[0.65rem]">Loading…</span>
            </div>
          ) : textChannels.length === 0 ? (
            <p className="text-[0.6rem] text-muted-foreground/50 px-2 py-3">No text channels</p>
          ) : (
            <div className="space-y-0.5">
              {textChannels.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedChannelId(c.id)}
                  className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-left transition-all
                    ${selectedChannelId === c.id
                      ? 'bg-indigo-500/15 text-indigo-300'
                      : 'text-muted-foreground/60 hover:bg-muted/20 hover:text-muted-foreground'}`}
                >
                  <span className="text-[0.7rem] text-muted-foreground/40">#</span>
                  <span className="text-[0.7rem] font-medium truncate">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status indicator */}
        <div className="p-3 border-t border-border/30">
          <div className="flex items-center gap-1.5">
            {guilds.length > 0 ? (
              <><Wifi className="w-3 h-3 text-emerald-400" /><span className="text-[0.55rem] text-emerald-400/80 font-mono uppercase tracking-widest">Connected</span></>
            ) : (
              <><WifiOff className="w-3 h-3 text-muted-foreground/40" /><span className="text-[0.55rem] text-muted-foreground/40 font-mono uppercase tracking-widest">Disconnected</span></>
            )}
          </div>
        </div>
      </div>

      {/* Main channel area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Channel header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-background-elevated/20 flex-shrink-0">
          <MessageSquare className="w-4 h-4 text-indigo-400/60 flex-shrink-0" />
          <span className="font-semibold text-sm text-foreground truncate">
            {channel ? `#${channel.name}` : selectedGuildId ? "Select a channel" : "Select a server"}
          </span>
          {guilds.length > 0 && (
            <Badge variant="secondary" className="text-[10px] ml-auto flex items-center gap-1 flex-shrink-0">
              <Wifi className="w-2.5 h-2.5 text-indigo-400" />
              Discord
            </Badge>
          )}
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {!channel ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <MessageSquare className="w-10 h-10 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground/50">
                {selectedGuildId ? "Pick a channel from the sidebar" : "Pick a server to get started"}
              </p>
            </div>
          ) : loadingMessages ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
              <Loader2 className="animate-spin w-4 h-4" />
              <span className="text-sm">Loading messages…</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <p className="text-sm text-muted-foreground/50">No messages yet in #{channel.name}</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const prevMsg = messages[idx - 1];
              const sameAuthor = prevMsg && prevMsg.author.username === msg.author.username;
              return (
                <div key={msg.id} className={`flex gap-3 group hover:bg-muted/10 px-2 py-0.5 rounded transition-colors ${!sameAuthor ? 'mt-3' : ''}`}>
                  {!sameAuthor ? (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300 mt-0.5">
                      {formatAuthor(msg.author).charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-8 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    {!sameAuthor && (
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-foreground">
                          {formatAuthor(msg.author)}
                        </span>
                        {msg.author.bot && (
                          <span className="text-[0.5rem] bg-indigo-500/20 text-indigo-300 px-1 rounded uppercase tracking-wide">BOT</span>
                        )}
                        <span className="text-[0.6rem] text-muted-foreground/40">{formatTime(msg.timestamp)}</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-midground/85">
                      {msg.content || <span className="italic text-muted-foreground/40">[no text content]</span>}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Compose area */}
        {channel && (
          <div className="p-3 border-t border-border/30 flex-shrink-0">
            {error && (
              <p className="text-xs text-destructive mb-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {error}
              </p>
            )}
            <div className="flex gap-2">
              <textarea
                value={compose}
                onChange={(e) => setCompose(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={`Message #${channel.name}  (Enter to send)`}
                rows={1}
                disabled={sending}
                className="flex-1 min-h-[36px] max-h-[120px] border border-input bg-background-elevated/40 rounded px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/50 resize-none"
              />
              <Button
                size="sm"
                disabled={!compose.trim() || sending}
                onClick={handleSend}
                className="h-9 px-3 shrink-0 bg-indigo-500/80 hover:bg-indigo-500 text-white border-0"
              >
                {sending ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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

      const res = await authenticatedFetch("/api/discord/guilds");
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
      if (e.message.includes("DISCORD_BOT_TOKEN")) {
        setConnected(false);
        setError("Discord bot token not configured");
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
      const res = await authenticatedFetch(`/api/discord/channels?guild_id=${encodeURIComponent(guildId)}`);
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
      const res = await authenticatedFetch(`/api/discord/messages?channel_id=${encodeURIComponent(channelId)}&limit=5`);
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
      const res = await authenticatedFetch("/api/discord/send", {
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
      <Card className="bg-background-base/50 border-current/10">
        <CardContent className="p-4 flex flex-col items-center gap-3">
          <WifiOff className="w-8 h-8 text-muted-foreground/50" />
          <p className="text-sm text-midground/70">Discord bot not connected</p>
          <p className="text-xs text-muted-foreground text-center">Set DISCORD_BOT_TOKEN in ~/.hermes/.env and restart gateway</p>
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

  return (
    <Card className="bg-background-base/50 border-current/10 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="w-4 h-4 text-indigo-500" />
          <span className="truncate">
            {channel ? `#${channel.name}` : "Discord"}
          </span>
          {guilds.length > 0 && (
            <Badge variant="secondary" className="text-[10px] ml-auto flex items-center gap-1">
              <Wifi className="w-2.5 h-2.5" />
              Connected
            </Badge>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 ml-1"
            disabled={refreshing}
            onClick={handleRefresh}
            title="Refresh"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Guild & channel selectors */}
        <div className="flex flex-col gap-2">
          <Select
            value={selectedGuildId ?? ""}
            onValueChange={(v: string) => setSelectedGuildId(v || null)}
            disabled={guilds.length === 0}
          >
            <SelectOption value="">Select a server</SelectOption>
            {guilds.map((g) => (
              <SelectOption key={g.id} value={g.id}>
                {g.name}
              </SelectOption>
            ))}
          </Select>

          <Select
            value={selectedChannelId ?? ""}
            onValueChange={(v: string) => setSelectedChannelId(v || null)}
            disabled={channels.length === 0}
          >
            <SelectOption value="">Select a channel</SelectOption>
            {channels
              .filter((c) => c.type === 0)
              .map((c) => (
                <SelectOption key={c.id} value={c.id}>
                  # {c.name}
                </SelectOption>
              ))}
          </Select>
        </div>
        {initializing && !channel ? (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Loader2 className="animate-spin w-4 h-4" /> Loading…
          </div>
        ) : loadingMessages ? (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Loader2 className="animate-spin w-4 h-4" /> Loading messages…
          </div>
        ) : messages.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No messages in this channel yet.</p>
        ) : (
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-2 p-2 rounded bg-muted/20 border border-border/30">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                  {formatAuthor(msg.author).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                      {formatAuthor(msg.author)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{formatTime(msg.timestamp)}</span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed whitespace-pre-wrap break-words text-midground/80 line-clamp-2">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {channel && (
          <div className="flex gap-2 pt-2 border-t border-border/30">
            <textarea
              value={compose}
              onChange={(e) => setCompose(e.target.value)}
              placeholder={`Message #${channel.name}`}
              rows={2}
              disabled={sending}
              className="flex min-h-[48px] w-full border border-input bg-transparent px-2 py-1.5 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
            <Button
              size="sm"
              disabled={!compose.trim() || sending}
              onClick={handleSend}
              className="h-10 px-3 shrink-0"
            >
              {sending ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

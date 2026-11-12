import React, { useEffect, useState } from "react";

type Mode = "timeline" | "feeds" | "inbox";

const MODES: { id: Mode; label: string }[] = [
  { id: "timeline", label: "Timeline" },
  { id: "feeds", label: "Feeds" },
  { id: "inbox", label: "Inbox" },
];

interface SocialItem {
  id?: string;
  source?: string;
  platform?: string;
  author?: string;
  title?: string;
  text?: string;
  content?: string;
  body?: string;
  url?: string;
  created_at?: string;
  [k: string]: unknown;
}

function extractItems(data: any): SocialItem[] {
  if (!data) return [];
  const list = data.items || data.posts || data.feeds || data.messages || data.timeline || data;
  return Array.isArray(list) ? list : [];
}

function ItemBody({ item }: { item: SocialItem }) {
  const text = item.text || item.content || item.title || item.body;
  if (!text) return null;
  return (
    <a
      href={item.url || '#'}
      target="_blank"
      rel="noreferrer noopener"
      className="block text-xs leading-relaxed text-foreground/90 hover:text-foreground"
    >
      {text}
    </a>
  );
}

const API_ROOT = "/api/plugins/hermes-entertainment-pack";

function authHeaders(): Record<string, string> {
  const t = (window as any).__HERMES_SESSION_TOKEN__;
  return t ? { "X-Hermes-Session-Token": t } : {};
}

export default function SocialPage() {
  const [mode, setMode] = useState<Mode>("timeline");
  const [items, setItems] = useState<SocialItem[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async (m: Mode) => {
    setLoading(true);
    setErr(null);
    try {
      const path =
        m === "feeds" ? "/social/feeds?platform=all&limit=20" :
        m === "inbox" ? "/social/inbox?limit=30" :
        "/social/timeline?limit=30";
      const res = await fetch(`${API_ROOT}${path}`, { headers: authHeaders() });
      if (res.status === 401) throw new Error("unauthorized");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: any = await res.json();
      setItems(extractItems(data));
      if (m === "timeline") {
        const sr = await fetch(`${API_ROOT}/social/status`, { headers: authHeaders() });
        if (sr.ok) setStatus(await sr.json());
      }
    } catch (e: any) {
      setErr(String((e && e.message) || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(mode);
  }, [mode]);

  const configured = status?.configured || {};

  return (
    <div className="p-4 md:p-6 font-mono text-sm max-w-3xl mx-auto">
      <div className="mb-4 flex items-center justify-end gap-2 flex-wrap">
        <div className="flex gap-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={[
                "rounded px-2.5 py-1 text-[11px] tracking-widest uppercase transition-colors",
                mode === m.id
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {Object.keys(configured).length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {Object.entries(configured).map(([k, v]) => (
            <span
              key={k}
              className={[
                "text-[10px] tracking-widest uppercase px-2 py-0.5 rounded border",
                v
                  ? "border-foreground/25 text-foreground/80"
                  : "border-border/30 text-muted-foreground/50 line-through",
              ].join(" ")}
            >
              {k}
            </span>
          ))}
        </div>
      )}

      {loading && <div className="opacity-50 text-xs">loading…</div>}
      {err && (
        <div className="text-xs border border-border/30 rounded px-3 py-2.5 text-muted-foreground">
          {err === "unauthorized" ? (
            <>Session expired — sign back in to load social feeds.</>
          ) : (
            <>Feeds are unavailable right now ({err}).</>
          )}
        </div>
      )}
      {!loading && !err && items.length === 0 && (
        <div className="opacity-50 text-xs">
          Nothing here yet — connect a platform in the social backend to populate this feed.
        </div>
      )}

      <div className="space-y-2">
        {items.slice(0, 40).map((it, i) => {
          const source = it.source || it.platform;
          return (
            <div key={it.id || i} className="border-b border-border/20 pb-2.5">
              <div className="flex items-center gap-2 mb-1">
                {source && (
                  <span className="text-[9px] tracking-widest uppercase px-1.5 py-0.5 rounded bg-foreground/5 text-muted-foreground">
                    {source}
                  </span>
                )}
                {it.author && (
                  <span className="text-[10px] text-muted-foreground truncate">{it.author}</span>
                )}
                {it.created_at && (
                  <span className="text-[9px] text-muted-foreground/50 ml-auto shrink-0">
                    {String(it.created_at).slice(0, 16)}
                  </span>
                )}
              </div>
              <ItemBody item={it} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

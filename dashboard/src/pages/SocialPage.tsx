import React, { useEffect, useState } from 'react';

export default function SocialPage() {
  const [mode, setMode] = useState('timeline');
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async (m: string) => {
    setLoading(true); setErr(null);
    try {
      const path = m === 'feeds' ? '/social/feeds?platform=all&limit=20'
        : m === 'inbox' ? '/social/inbox?limit=30'
        : '/social/timeline?limit=30';
      const res = await fetch(`/api/plugins/hermes-entertainment-pack${path}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: any = await res.json();
      setItems((data && (data.items || data.posts || data.feeds || data.messages || data.timeline)) || []);
      if (m === 'timeline') {
        const sr = await fetch('/api/plugins/hermes-entertainment-pack/social/status');
        if (sr.ok) setStatus(await sr.json());
      }
    } catch (e: any) {
      setErr(String((e && e.message) || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(mode); }, [mode]);

  return (
    <div className="p-6 font-mono text-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="uppercase tracking-widest text-muted-foreground">Social</span>
        <div className="flex gap-1">
          {['timeline', 'feeds', 'inbox'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`rounded px-2 py-1 text-xs ${mode === m ? 'text-sky-400' : 'text-muted-foreground'}`}>
              {m}
            </button>
          ))}
        </div>
      </div>
      {status && (
        <div className="mb-2 text-xs opacity-50">status: {JSON.stringify(status.configured || {})}</div>
      )}
      {loading && <div className="opacity-50">loading…</div>}
      {err && <div className="text-red-400">{err}</div>}
      {!loading && !err && items.length === 0 && <div className="opacity-50">no items</div>}
      <div className="space-y-2">
        {items.slice(0, 40).map((it: any, i: number) => (
          <div key={i} className="border-b border-border/20 pb-2">
            {typeof it === 'string' ? it : (it.text || it.content || it.title || it.body || JSON.stringify(it).slice(0, 140))}
          </div>
        ))}
      </div>
    </div>
  );
}

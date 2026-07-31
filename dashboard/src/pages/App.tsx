import React, { useState } from "react";

const TABS = [
  { id: "tv", label: "TV" },
  { id: "games", label: "Games" },
  { id: "music", label: "Music" },
  { id: "gallery", label: "Gallery" },
  { id: "notifications", label: "Hermes Notifications" },
];

function Page() {
  const [tab, setTab] = useState(TABS[0].id);
  return (
    <div style={{ padding: "1.25rem", color: "#f2efe8" }}>
      <h2 style={{ margin: "0 0 0.75rem" }}>Entertainment Pack</h2>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "0.45rem 0.8rem",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: tab === t.id ? "rgba(56,189,248,0.22)" : "rgba(255,255,255,0.04)",
              color: tab === t.id ? "#e9d5ff" : "rgba(255,255,255,0.55)",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "1rem" }}>
        <strong>{tab.toUpperCase()}</strong> — this confirms the plugin page renders.
      </div>
    </div>
  );
}

export default Page;

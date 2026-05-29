import { useState } from "react";
import { Play } from "lucide-react";

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1] ?? null;
}

export function VideoPlayer({ url, title }: { url: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const ytId = getYouTubeId(url);

  if (ytId) {
    return (
      <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 12, background: "#000" }}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
        />
      </div>
    );
  }

  if (url.startsWith("http")) {
    return (
      <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 12, background: "#000" }}>
        {playing ? (
          <video
            src={url}
            controls
            autoPlay
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.6)", border: "none", cursor: "pointer", color: "#fff", gap: 12
            }}
          >
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(201,168,76,0.2)", border: "2px solid rgba(201,168,76,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play size={28} color="#C9A84C" style={{ marginLeft: 3 }} />
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#888" }}>{title}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 2rem", textAlign: "center", background: "#0f0f0f", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", minHeight: 300 }}>
      <Play size={32} color="#444" style={{ marginBottom: 12 }} />
      <p style={{ color: "#666", fontSize: "0.9rem" }}>Video coming soon</p>
      <p style={{ color: "#444", fontSize: "0.8rem", marginTop: 4 }}>{title}</p>
    </div>
  );
}

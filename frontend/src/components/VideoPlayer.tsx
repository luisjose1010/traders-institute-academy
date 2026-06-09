import { Play } from "lucide-react";

export function VideoPlayer({ url, title }: { url: string; title: string }) {
  if (!url) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 2rem", textAlign: "center", background: "#0f0f0f", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", minHeight: 300 }}>
        <Play size={32} color="#444" style={{ marginBottom: 12 }} />
        <p style={{ color: "#666", fontSize: "0.9rem" }}>Video no disponible</p>
        <p style={{ color: "#444", fontSize: "0.8rem", marginTop: 4 }}>Este video no ha sido cargado aún.</p>
      </div>
    );
  }

  // Parse YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    const ytId = ytMatch[1];
    return (
      <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 12, background: "#000" }}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
        />
      </div>
    );
  }

  // Parse Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch) {
    const vimeoId = vimeoMatch[1];
    return (
      <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 12, background: "#000" }}>
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=0`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
        />
      </div>
    );
  }

  // Fallback Native Video
  return (
    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 12, background: "#000" }}>
      <video
        src={url}
        controls
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}

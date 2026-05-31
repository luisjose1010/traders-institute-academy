import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Bell, Check, CheckCheck } from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = () => {
    api.notifications.getAll().then(d => setNotifications(d as Notification[])).catch(() => {});
    api.notifications.getUnreadCount().then(d => setUnreadCount(d.count)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id: number) => {
    const oldNotifications = notifications;
    const oldUnread = unreadCount;
    setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
    try {
      await api.notifications.markAsRead(id);
    } catch {
      setNotifications(oldNotifications);
      setUnreadCount(oldUnread);
    }
  };

  const handleMarkAllRead = async () => {
    const oldNotifications = notifications;
    const oldUnread = unreadCount;
    setNotifications(p => p.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await api.notifications.markAllAsRead();
    } catch {
      setNotifications(oldNotifications);
      setUnreadCount(oldUnread);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: "#666",
          position: "relative",
        }}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            background: "#e74c3c", color: "#fff", fontSize: "0.6rem", fontWeight: 700,
            borderRadius: "50%", width: 16, height: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", top: "100%", right: 0, marginTop: 8,
            width: 340, maxHeight: 400, overflow: "auto",
            background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            zIndex: 50,
          }}>
            <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Notifications</span>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} style={{ background: "none", border: "none", color: "#C9A84C", cursor: "pointer", fontSize: "0.72rem", fontWeight: 600 }}>
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: "2rem 1rem", textAlign: "center", color: "#555", fontSize: "0.82rem" }}>No notifications yet</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={{
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background: n.read ? "transparent" : "rgba(201,168,76,0.03)",
                  display: "flex", alignItems: "flex-start", gap: 10,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: n.read ? 400 : 600, color: n.read ? "#888" : "#fff", marginBottom: 2 }}>{n.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "#555", lineHeight: 1.4 }}>{n.message}</div>
                  </div>
                  {!n.read && (
                    <button onClick={() => handleMarkRead(n.id)} title="Mark as read" style={{ background: "none", border: "none", color: "#C9A84C", cursor: "pointer", flexShrink: 0, marginTop: 2 }}>
                      <Check size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

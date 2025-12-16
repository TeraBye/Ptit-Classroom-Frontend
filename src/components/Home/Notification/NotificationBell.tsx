"use client";
import { getMyInfo } from "@/app/api/libApi/api";
import axiosInstance from "@/utils/axiosInstance";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface Notification {
  id?: string;
  senderUsername?: string;
  content: string;
  avatar?: string | null;
  timestamp?: any;
  isRead?: boolean;
}

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const clientRef = useRef<Client | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasMarkedAllRead = useRef(false);

  // Lấy username
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    getMyInfo(token)
      .then(res => setUsername(res.username))
      .catch(() => { });
  }, []);

  // Load thông báo cũ
  useEffect(() => {
    if (!username) return;

    const load = async () => {
      try {
        const res = await axiosInstance.get(`/notifications/${username}`);
        const data = (res.data.result || []).map((n: any) => ({
          id: n.id || n._id,
          senderUsername: n.senderUsername,
          content: n.content,
          timestamp: n.timestamp || n.timeStamp,
          avatar: n.avatar || n.avatarUrl || null,
          isRead: !!(n.read || n.isRead),
        }));
        setNotifications(data);
        setCount(data.filter((n: any) => !n.isRead).length);
      } catch (err) {
        console.error("Load notifications failed", err);
      }
    };
    load();
  }, [username]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // REALTIME – ĐÃ FIX ĐÚNG URL
  useEffect(() => {
    if (!username) return;

    // Build absolute WS endpoint (ensure protocol present)
    const wsUrl = `${window.location.protocol}//${window.location.hostname}:8090/api/notifications/ws`;

    const client = new Client({
      // Use SockJS factory since backend registers SockJS endpoint
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      debug: (str) => console.log("[STOMP]", str),
    });

    // (click-outside logic moved to top-level effect)

    client.onConnect = () => {
      console.log("Realtime connected! → /topic/notifications/" + username);
      client.subscribe(`/topic/notifications/${username}`, (msg) => {
        const data = JSON.parse(msg.body);
        const noti: Notification = {
          senderUsername: data.senderUsername || "Unknown",
          content: data.content || "New notification",
          timestamp: data.timestamp || data.timeStamp || new Date(),
          avatar: data.avatar || "https://ui-avatars.com/api/?name=New+Notification&background=0D8ABC&color=fff",
          isRead: false,
        };
        setNotifications(prev => [noti, ...prev]);
        setCount(c => c + 1);
      });
    };

    client.onStompError = (frame) => console.error("STOMP Error:", frame);

    client.activate();
    clientRef.current = client;

    return () => { client.deactivate(); };
  }, [username]);

  // BEST PRACTICE: Mở chuông = đã đọc hết (không cần click từng cái)
  const handleToggle = async () => {
    if (!open && count > 0 && !hasMarkedAllRead.current) {
      hasMarkedAllRead.current = true;
      try {
        await axiosInstance.post(`/notifications/read-all?username=${username}`);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setCount(0);
      } catch (err) {
        hasMarkedAllRead.current = false;
        console.error("Mark all readfailed", err);
      }
    }
    setOpen(!open);
  };

  const formatTime = (ts: any) => {
    if (!ts) return "h";
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString("vi-VN");
    return new Date(ts).toLocaleString("vi-VN");
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 hover:bg-gray-200 rounded-full transition"
      >
        <Bell size={24} className="text-gray-700" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border z-50 max-h-96 overflow-y-auto">
          <div className="p-4 font-bold border-b text-lg">Notification</div>
          {notifications.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No notifications</p>
          ) : (
            <ul>
              {notifications.map((n, i) => (
                <li
                  key={i}
                  className={`p-4 border-b flex gap-3 hover:bg-gray-50 transition ${!n.isRead ? "bg-blue-50" : "bg-white"
                    }`}
                >
                  <img
                    src={n.avatar || '/images/logo/avatar-fallback.png'}
                    alt={n.senderUsername || 'avatar'}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    onError={(e: any) => {
                      e.currentTarget.onerror = null; // tránh loop
                      e.currentTarget.src = '/images/logo/avatar-fallback.png';
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm">
                      <strong>{n.senderUsername}</strong> {n.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{formatTime(n.timestamp)}</p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
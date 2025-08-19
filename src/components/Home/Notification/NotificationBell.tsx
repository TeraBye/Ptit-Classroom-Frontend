"use client";
import { API_BASE_URL, getMyInfo } from "@/app/api/libApi/api";
import axiosInstance from "@/utils/axiosInstance";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Notification {
  receiverUsername: string;
  content: string;
  timeStamp: string;
  senderUsername: string;
  isRead: boolean
}

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [username, setUsername] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      setToken(token);
      try {
        const res = await getMyInfo(token);
        setUsername(res.username);
      } catch (err) {
        console.error("Failed to fetch user info", err);
      }
    };
    fetchUserInfo();
  }, []);

  // Fetch thông báo cũ
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await axiosInstance.get(`${API_BASE_URL}/notification/${username}`);

        const data: Notification[] = res.data.result;

        setNotifications(data);
        const unread = data.filter((n) => !n.isRead).length;
        setCount(unread);
      } catch (error) {
        console.error("Error loading notifications", error);
      }
    }

    if (username && token) {
      fetchNotifications();
    }
  }, [username, token]);


  useEffect(() => {
    const ws = new WebSocket(`${API_BASE_URL}/notifications/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as Notification;
      setNotifications((prev) => [data, ...prev]);
      setCount((prev) => prev + 1);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

//   const handleMarkAsRead = async (id: string) => {
//   try {
//     await axiosInstance.put(`${API_BASE_URL}/notification/read/${id}`, {}, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     setNotifications((prev) =>
//       prev.map((n) =>
//         n.id === id ? { ...n, isRead: true } : n
//       )
//     );
//     setCount((prev) => Math.max(prev - 1, 0));
//   } catch (error) {
//     console.error("Error marking as read", error);
//   }
// };

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-gray-200"
        onClick={handleToggle}
      >
        <Bell className="text-black" size={20} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-gray-500 text-sm">No notifications</p>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li
                  // key={n.id}
                  className={`p-3 border-b cursor-pointer ${
                    n.isRead ? "bg-white text-gray-700" : "bg-gray-100 font-semibold"
                  } hover:bg-gray-200`}
                  // onClick={() => handleMarkAsRead(n.id)}
                >
                  <p>{n.content}</p>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(n.timeStamp).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

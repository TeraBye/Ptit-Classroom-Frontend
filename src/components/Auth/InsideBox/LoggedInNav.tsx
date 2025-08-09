"use client";
import {
  Bell,
  Grid,
  MessageSquare,
  ClipboardCheck,
  BadgeCheck,
  Settings,
  LogOut,
  BookOpen,
  HelpCircle,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import SmallSpinner from "@/components/Common/SmallSpinner";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { getMyInfo } from "@/app/api/libApi/api";
import { useRouter } from "next/navigation";

export default function LoggedInNav() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setIsAuthenticated } = useAuth();
  const [token, setToken] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<{ username: string; role: string } | null>(
    null
  );

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token") || undefined);
    }
  }, []);

  useEffect(() => {
    if (token) {
      getMyInfo(token).then((user) => {
        setUser(user); // user.role sẽ có giá trị "TEACHER" hoặc "STUDENT"
      });
    }
  }, [token]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:8888/api/identity/auth/logout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }
      );

      const data = await res.json();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!res.ok || data.code !== 0) return toast.error("Logout failed");

      localStorage.removeItem("token");
      setIsAuthenticated(false);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button className="p-2 rounded-full hover:bg-gray-200">
        <Grid className="text-black" size={20} />
      </button>

      <button className="p-2 rounded-full hover:bg-gray-200" 
      onClick={() => router.push("/chat")}>
        <MessageSquare className="text-black" size={20} />
      </button>

      <button className="p-2 rounded-full hover:bg-gray-200">
        <Bell className="text-black" size={20} />
      </button>

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="rounded-full overflow-hidden w-9 h-9 border border-gray-400"
        >
          <Image
            src="https://i.pinimg.com/736x/54/a0/02/54a0026d53823a3556d7b333da079389.jpg"
            alt="Avatar"
            width={36}
            height={36}
            className="object-cover"
          />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg text-sm z-50">
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <Image
                  src="https://i.pinimg.com/736x/54/a0/02/54a0026d53823a3556d7b333da079389.jpg"
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{user?.fullName}</p>
                  <p className="text-gray-500 text-xs">{user?.username}</p>
                </div>
              </div>
              <button className="mt-3 w-full py-2 bg-gray-100 rounded text-center hover:bg-gray-200">
                View profile
              </button>
            </div>

            <div className="py-2">
              <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2">
                <Settings size={20} /> Edit My Account
              </button>
              {user?.role === "STUDENT" && (
                <>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2">
                    <ClipboardCheck size={20} /> Review Exam
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2">
                    <BadgeCheck size={20} /> My Scores
                  </button>
                </>
              )}

              {user?.role === "TEACHER" && (
                <>
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => router.push("/classroom")}
                  >
                    <BookOpen size={20} /> My Classes
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => router.push("/questions")}
                  >
                    <HelpCircle size={20} /> Questions
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2">
                    <Users size={20} /> Students
                  </button>
                </>
              )}
            </div>

            <div className="border-t">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <SmallSpinner /> Logging out...
                  </>
                ) : (
                  <>
                    <LogOut size={20} /> Log Out
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

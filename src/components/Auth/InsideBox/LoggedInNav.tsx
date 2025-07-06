"use client";
import { Bell, Grid, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import SmallSpinner from "@/components/Common/SmallSpinner";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const LoggedInNav = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setIsAuthenticated } = useAuth();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8888/api/identity/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Hiệu ứng loading 1s

      if (!res.ok || data.code !== 0) {
        toast.error("Logout failed");
        return;
      }

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

      <button className="p-2 rounded-full hover:bg-gray-200">
        <MessageSquare className="text-black" size={20} />
      </button>

      <button className="p-2 rounded-full hover:bg-gray-200">
        <Bell className="text-black" size={20} />
      </button>

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="rounded-full overflow-hidden w-8 h-8 border border-gray-400"
        >
          <Image
            src="https://i.pinimg.com/736x/ce/fe/85/cefe85a625907a8004a96c72027d91c9.jpg"
            alt="Avatar"
            width={32}
            height={32}
          />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
            <button className="w-full px-4 py-2 text-left text-black hover:bg-gray-100">
              Profile
            </button>
            <button className="w-full px-4 py-2 text-left text-black hover:bg-gray-100">
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-black hover:bg-gray-100 flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <SmallSpinner /> Logging out...
                </>
              ) : (
                "Logout"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoggedInNav;

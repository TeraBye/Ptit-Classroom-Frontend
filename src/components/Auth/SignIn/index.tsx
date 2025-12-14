"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import SocialSignIn from "../SocialSignIn";
import Logo from "@/components/Layout/Header/Logo";
import SmallSpinner from "@/components/Common/SmallSpinner";
import { useAuth } from "@/context/AuthContext";

const Signin = ({ onClose }: { onClose?: () => void }) => {
  const router = useRouter();
  const { setIsAuthenticated } = useAuth();

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
    checkboxToggle: false,
  });
  const [loading, setLoading] = useState(false);

  const loginUser = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8888/api/identity/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password,
        }),
      });

      const data = await res.json();

      // Hiệu ứng chờ 1s để mượt mà
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!res.ok || data.code !== 0 || !data.result?.authenticated) {
        toast.error(data.message || "Login failed");
        console.error("Error:", data);
        setLoading(false);
        return;
      }

      const token = data.result.token;
      toast.success("Login successful");

      localStorage.setItem("token", token);

  setIsAuthenticated(true); // ✅ Đánh dấu đã đăng nhập
  // Call onClose if provided (pages rendering this component as a server component
  // shouldn't need to pass event handlers). Optional chaining avoids passing
  // event handlers from server-side rendered pages.
  onClose?.(); // ✅ Đóng modal => reset body overflow (no-op if not provided)
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-10 text-center mx-auto inline-block max-w-[160px]">
        <Logo />
      </div>

      <SocialSignIn />

      <span className="z-1 relative my-8 block text-center before:content-[''] before:absolute before:h-px before:w-40% before:bg-black/15 before:left-0 before:top-3 after:content-[''] after:absolute after:h-px after:w-40% after:bg-black/15 after:top-3 after:right-0">
        <span className="text-body-secondary relative z-10 inline-block px-3 text-base text-black">
          OR
        </span>
      </span>

      <form onSubmit={loginUser}>
        <div className="mb-[22px]">
          <input
            type="text"
            placeholder="Username"
            value={loginData.username}
            onChange={(e) =>
              setLoginData({ ...loginData, username: e.target.value })
            }
            className="w-full rounded-md border border-black/20 bg-transparent px-5 py-3 text-base text-black outline-none placeholder:text-grey focus:border-primary"
          />
        </div>
        <div className="mb-[22px]">
          <input
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
            className="w-full rounded-md border border-black/20 bg-transparent px-5 py-3 text-base text-black outline-none placeholder:text-grey focus:border-primary"
          />
        </div>
        <div className="mb-9">
          <button
            type="submit"
            className="bg-primary w-full py-3 rounded-lg text-18 font-medium border border-primary hover:text-primary hover:bg-transparent flex justify-center items-center"
            disabled={loading}
          >
            {loading ? <SmallSpinner /> : "Sign In"}
          </button>
        </div>
      </form>

      <Link
        href="/forgot-password"
        className="mb-2 inline-block text-base text-dark hover:text-primary text-black"
      >
        Forgot Password?
      </Link>
      <p className="text-body-secondary text-white text-base">
        Not a member yet?{" "}
        <Link href="/" className="text-primary hover:underline">
          Sign Up
        </Link>
      </p>
    </>
  );
};

export default Signin;

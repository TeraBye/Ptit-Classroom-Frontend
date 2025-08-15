"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SocialSignUp from "../SocialSignUp";
import Logo from "@/components/Layout/Header/Logo";
import { useState } from "react";
import Loader from "@/components/Common/Loader";

const SignUp = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setLoading(true);
    const data = new FormData(e.currentTarget);
    const value = Object.fromEntries(data.entries());

    const body = {
      username: value.username as string,
      email: value.email as string,
      password: value.password as string,
      fullName: value.fullName as string,
      dob: value.dob as string,
    };

    try {
      const res = await fetch(
        "http://localhost:8888/api/identity/users/registration",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const result = await res.json();

      if (res.ok) {
        toast.success("Đăng ký thành công!");
        setSuccessModal(true); // Mở modal thành công
      } else {
        toast.error(result.message || "Đăng ký thất bại!");
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi kết nối!");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSuccessModal(false);
    router.push("/");
  };

  return (
    <>
      <div className="mb-10 text-center mx-auto inline-block max-w-[160px]">
        <Logo />
      </div>

      <SocialSignUp />

      <span className="relative my-8 block text-center before:content-[''] before:absolute before:h-px before:w-[40%] before:bg-black/60 before:left-0 before:top-3 after:content-[''] after:absolute after:h-px after:w-[40%] after:bg-black/60 after:top-3 after:right-0">
        <span className="relative z-10 inline-block px-3 text-base text-black">
          HOẶC
        </span>
      </span>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {/* Username */}
        <div>
          <label className="block mb-1 text-sm font-medium text-white">
            Tên đăng nhập
          </label>
          <input
            type="text"
            name="username"
            placeholder="Tên đăng nhập"
            required
            className="w-full rounded-md border border-black/20 bg-transparent px-5 py-3 text-black outline-none placeholder:text-gray-400 focus:border-primary"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 text-sm font-medium text-white">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="w-full rounded-md border border-black/20 bg-transparent px-5 py-3 text-black outline-none placeholder:text-gray-400 focus:border-primary"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1 text-sm font-medium text-white">
            Mật khẩu
          </label>
          <input
            type="password"
            name="password"
            placeholder="Nhập mật khẩu"
            required
            className="w-full rounded-md border border-black/20 bg-transparent px-5 py-3 text-black outline-none placeholder:text-gray-400 focus:border-primary"
          />
        </div>

        {/* Full name */}
        <div>
          <label className="block mb-1 text-sm font-medium text-white">
            Họ và tên
          </label>
          <input
            type="text"
            name="fullName"
            placeholder="Họ tên"
            required
            className="w-full rounded-md border border-black/20 bg-transparent px-5 py-3 text-black outline-none placeholder:text-gray-400 focus:border-primary"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block mb-1 text-sm font-medium text-white">
            Ngày sinh
          </label>
          <input
            type="date"
            name="dob"
            required
            className="w-full rounded-md border border-black/20 bg-transparent px-5 py-3 text-black outline-none placeholder:text-gray-400 focus:border-primary"
          />
        </div>

        {/* Submit */}
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-medium text-dark transition hover:bg-transparent hover:text-primary border border-primary disabled:opacity-50"
          >
            {loading ? <Loader /> : "Đăng ký"}
          </button>
        </div>
      </form>

      {/* Modal thông báo thành công */}
      {successModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80">
            <h2 className="text-lg font-semibold text-green-600">
              🎉 Đăng ký thành công!
            </h2>
            <p className="mt-2 text-gray-600">Chào mừng bạn đến với trang chủ</p>
            <button
              onClick={handleCloseModal}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SignUp;

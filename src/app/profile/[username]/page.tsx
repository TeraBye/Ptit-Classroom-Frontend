"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import ProfileHeader from "@/components/Profile/ProfileHeader";
import ProfileForm from "@/components/Profile/ProfileForm";
import ChangePasswordForm from "@/components/Profile/ChangePasswordForm";

export default function ProfilePage() {
  const { username } = useParams();
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  const fetchUser = async () => {
    if (!username) return;
    try {
      const res = await axiosInstance.get(`/profile/users/${username}`);
      setUserData(res.data.result);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [username]);

  const handleSave = async (updatedData: any) => {
    try {
      await axiosInstance.put(`/profile/users/update-profile`, updatedData);
      // refetch to get any server-side normalized fields
      await fetchUser();
    } catch (error) {
      console.error(error);
    }
  };

  if (!userData) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 mt-24">
      <ProfileHeader user={userData} onMessage={() => router.push(`/chat?to=${userData.username}`)} />
      <ProfileForm user={userData} onSave={handleSave} />

      <div className="mt-8 p-6 border rounded-lg bg-white">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        <ChangePasswordForm onSuccess={fetchUser} />
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import ProfileHeader from "@/components/Profile/ProfileHeader";
import ProfileForm from "@/components/Profile/ProfileForm";

export default function ProfilePage() {
  const { username } = useParams();
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (username) {
      axiosInstance.get(`/profile/users/${username}`)
        .then(res => setUserData(res.data.result))
        .catch(err => console.error(err));
    }
  }, [username]);

  const handleSave = async (updatedData: any) => {
    try {
      await axiosInstance.post(`/profile/users/update`, updatedData);
      setUserData(updatedData);
    } catch (error) {
      console.error(error);
    }
  };

  if (!userData) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 mt-24">
      <ProfileHeader user={userData} onMessage={() => router.push(`/chat?to=${userData.username}`)} />
      <ProfileForm user={userData} onSave={handleSave} />
    </div>
  );
}

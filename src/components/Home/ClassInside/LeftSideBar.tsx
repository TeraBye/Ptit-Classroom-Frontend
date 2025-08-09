"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AssignmentModal } from "./ModalAssigmentCreation";
import { useEffect, useState } from "react";
import { getMyInfo, getConversations } from "@/app/api/libApi/api";


export function LeftSidebar() {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const userData = await getMyInfo(token);
        setUser(userData);

        const convoList = await getConversations(userData.username, token);
        console.log("Conversations:", convoList);
      } catch (error) {
        console.error("Error ", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full md:w-64 bg-white rounded-lg overflow-hidden shadow-md p-4 text-center">
      <div className="flex justify-center">
        <Image
          src={user?.avatar || "https://static.vecteezy.com/system/resources/thumbnails/063/477/498/small_2x/illustration-of-generic-male-avatar-in-gray-tones-for-anonymous-profile-placeholder-with-neutral-expression-designed-for-use-in-online-platforms-and-social-media-vector.jpg"}
          alt={user?.fullName || "User Avatar"}
          width={100}
          height={100}
          className="rounded-full"
        />
      </div>
      <h2 className="mt-4 text-xl font-bold">{user?.fullName}</h2>
      <p className="text-gray-600">{user?.role}</p>

      <Button className="mt-4 w-full" variant="outline">
        Join meeting
      </Button>

      {user?.role === "TEACHER" && (
        <Button
          onClick={() => setShowModal(true)}
          className="mt-4 w-full"
          variant="outline"
        >
          New lesson
        </Button>
      )}

      <AssignmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}

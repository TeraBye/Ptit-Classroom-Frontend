"use client"
import { LeftSidebar } from "./LeftSideBar";
import { CenterContent } from "./Center";
import { RightSidebar } from "./RightSideBar";
import React, { useState } from "react";
import StudentListModal from "./StudentListModal";

export default function UserProfileCard() {
  const posts = [1, 2, 3, 4, 5, 6, 7];
  const [openStudentModal, setOpenStudentModal] = useState(false);
  // TODO: Lấy classroomId thực tế từ props/context nếu có
  const classroomId = 1;

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 mt-20 h-screen">
      <LeftSidebar />

      <div className="flex-1 overflow-y-auto flex flex-col gap-4">
        <div className="sticky top-0 z-10 bg-white pt-2 pb-2">
          <button
            className="self-end px-4 py-2 bg-blue-600 text-white rounded mb-2 mt-4"
            onClick={() => setOpenStudentModal(true)}
          >
            Student List
          </button>
        </div>
        {posts.map((postId) => (
          <CenterContent key={postId} />
        ))}
      </div>

      <RightSidebar />
      <StudentListModal
        open={openStudentModal}
        onClose={() => setOpenStudentModal(false)}
        classroomId={classroomId}
      />
    </div>
  );
}

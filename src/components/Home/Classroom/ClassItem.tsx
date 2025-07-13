"use client";
import { StarIcon, UserIcon, EyeIcon, Bars3Icon, ChartBarIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Item = ({ classroom }: { classroom: any }) => {
  const router = useRouter();
  return (
    <div className="w-64 bg-white rounded-lg overflow-hidden shadow-md">

      {/* Banner */}
      <div className="relative">
        <Image
          src="https://i.pinimg.com/736x/33/5d/41/335d419b07dafe16553ddd6ea5a1de14.jpg" // Thay bằng ảnh thật
          alt="Course"
          width={400}
          height={200}
          className="w-full h-32 object-cover"
        />
        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
          2025
        </div>
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
          {classroom.isPublic ? "public" : "private"}
        </div>
      </div>

      {/* Course info */}
      <div className="p-4 space-y-2">
        {/* <p className="text-gray-500 text-sm">Tru's classroom</p> */}
        <h3 className="text-lg font-semibold">{classroom.name}</h3>

        {/* Stats */}
        <div className="flex justify-between mt-4 text-gray-600 text-sm">
          <div className="flex items-center gap-1">
            <UserIcon className="w-4 h-4" />
            <span>{classroom.teacherUsername}</span>
          </div>
          <div className="flex items-center gap-1">
            <EyeIcon className="w-4 h-4" />
            <span>20</span>
          </div>
        </div>

        {/* Additional info */}
        <div className="flex justify-between mt-2 text-gray-600 text-sm">
          <div className="flex items-center gap-1">
            <Bars3Icon className="w-4 h-4" />
            <span>16 posts</span>
          </div>
          <button
            className="w-[100px] py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
            onClick={() => router.push(`/class-inside`)}
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default Item;

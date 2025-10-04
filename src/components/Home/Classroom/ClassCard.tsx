"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    UserIcon,
    EllipsisVerticalIcon,
    PencilSquareIcon,
    TrashIcon,
    DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge"

interface ClassCardProps {
    classroom: any;
    onDelete?: (id: number) => Promise<void> | void;
    onEdit?: (cls: any) => void;
    onActivate?: (id: number) => Promise<void> | void;
    currentRole?: 'TEACHER' | 'STUDENT' | string;
}

export default function ClassCard({ classroom, onDelete, onEdit, onActivate, currentRole }: ClassCardProps) {
    const router = useRouter();
    const [openMenu, setOpenMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const isActive = !classroom.deleted;

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenu(false);
            }
        }
        if (openMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openMenu]);

    return (
    <div className={`w-64 bg-white rounded-lg overflow-hidden shadow-md border ${isActive ? "" : "opacity-60"}`}>
      <div className="relative">
        <Image
          src={classroom.banner || "https://i.pinimg.com/736x/33/5d/41/335d419b07dafe16553ddd6ea5a1de14.jpg"}
          alt={classroom.name}
          width={400}
          height={200}
          className="w-full h-32 object-cover"
        />
        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
          {new Date(classroom.createdAt).getFullYear()}
        </div>

        {/* menu at top-right overlay - hidden for students */}
        {currentRole !== "STUDENT" && (
          <div className="absolute top-2 right-2" ref={menuRef}>
            <button onClick={() => setOpenMenu((s) => !s)} className="p-1 rounded bg-white/80 hover:bg-white">
              <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
            </button>
            {openMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-20">
                <button
                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50"
                  onClick={() => {
                    setOpenMenu(false)
                    onEdit?.(classroom)
                  }}
                >
                  <PencilSquareIcon className="w-4 h-4" /> Edit
                </button>
                {!isActive ? (
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-green-600 hover:bg-gray-50"
                    onClick={() => {
                      setOpenMenu(false)
                      onActivate?.(classroom.id)
                    }}
                  >
                    Activate
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-gray-50"
                    onClick={() => {
                      setOpenMenu(false)
                      onDelete?.(classroom.id)
                    }}
                  >
                    <TrashIcon className="w-4 h-4" /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-3">{classroom.name}</h3>

        <div className="space-y-2.5">
          {/* Code */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Code:</span>
            <span className="text-sm font-medium">{classroom.classCode}</span>
          </div>

          {/* Teacher and subject info */}
          <div className="text-sm text-gray-500 space-y-1 text-left">
            <div>Teacher: {classroom.teacherName || classroom.teacherUsername}</div>
            <div>Subject: {classroom.subjectName || ""}</div>
          </div>

          {/* Posts count */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DocumentTextIcon className="w-4 h-4 text-gray-500" />
            <span>{classroom.postNum ?? 0} posts</span>
          </div>

          {/* Students count */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <UserIcon className="w-4 h-4 text-gray-500" />
            <span>{classroom.studentNum ?? classroom.studentCount ?? 0} students</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Badge
                variant={classroom.public ? "default" : "secondary"}
                className={classroom.public ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-500 hover:bg-gray-700"}
              >
                {classroom.public ? "Public" : "Private"}
              </Badge>

              <Badge
                variant={isActive ? "default" : "secondary"}
                className={isActive ? "bg-green-600 hover:bg-green-700" : "bg-red-100 text-red-700 hover:bg-red-200"}
              >
                {isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <Button onClick={() => router.push(`/class-inside/${classroom.id}`)} className="px-4 text-sm">
              Join
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

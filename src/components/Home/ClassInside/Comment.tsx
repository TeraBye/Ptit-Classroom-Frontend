'use client';

import Image from "next/image";
import { useState } from "react";

export interface CommentProps {
  avatar: string;
  username: string;
  content: string;
  createdAt: string;
  fullName: string;
  replies?: CommentProps[];
  
}

const getTimeAgo = (createdAt: string) => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return `Vừa xong`;
};

export const Comment = ({
  avatar,
  username,
  content,
  createdAt,
  replies,
  fullName,
}: CommentProps) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3 p-3 border rounded-md bg-gray-50">
        <div className="w-9 h-9">
          <Image
            src={avatar}
            width={36}
            height={36}
            alt="avatar"
            className="rounded-full object-cover w-full h-full"
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <p className="font-semibold text-sm">{fullName}</p>
            <p className="text-xs text-gray-500">{getTimeAgo(createdAt)}</p>
          </div>
          <p className="text-gray-700 text-sm mt-1">{content}</p>

          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs text-blue-500 mt-2"
          >
            {showReplies ? "Ẩn phản hồi" : "Xem phản hồi"}
          </button>

          {showReplies && (
            <div className="ml-6 mt-3 flex flex-col gap-3">
              {replies?.map((reply, index) => (
                <Comment key={index} {...reply} />
              ))}

              <input
                type="text"
                placeholder="Viết phản hồi..."
                className="w-full border rounded px-3 py-2 text-sm focus:outline-blue-400"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

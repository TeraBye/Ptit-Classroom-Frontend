'use client';

import { X } from "lucide-react";
import { Comment, CommentProps } from "@/components/Home/ClassInside/Comment";

interface CommentModalProps {
  onClose: () => void;
  comments: CommentProps[];
}

export const CommentModal = ({ onClose, comments }: CommentModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="relative bg-white rounded-lg shadow-lg w-[700px] h-[600px] flex flex-col">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        <h2 className="text-lg font-semibold px-6 pt-6">Bình luận</h2>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {comments.map((cmt, index) => (
            <Comment key={index} {...cmt} />
          ))}
        </div>

        <div className="p-4 border-t">
          <input
            type="text"
            placeholder="Viết bình luận..."
            className="w-full border rounded px-3 py-2 text-sm focus:outline-blue-400"
          />
        </div>
      </div>
    </div>
  );
};

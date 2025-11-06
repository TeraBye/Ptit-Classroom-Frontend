'use client';

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { Comment, CommentProps } from "@/components/Home/ClassInside/Comment";

interface CommentModalProps {
  onClose: () => void;
  comments: CommentProps[];
  postId: number;
  username: string;
}

export const CommentModal = ({
  onClose,
  comments: initialComments,
  postId,
  username
}: CommentModalProps) => {
  const [comments, setComments] = useState<CommentProps[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  // Đồng bộ comments khi initialComments thay đổi
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  // WebSocket để nhận comment mới
  useEffect(() => {
    if (!postId) return;

    const socket = new SockJS("http://localhost:8087/api/post/ws-post");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("📡 Connected to WebSocket for comments");

        client.subscribe(`/topic/comments/${postId}`, (message) => {
          const newCmt: CommentProps = JSON.parse(message.body);
          console.log("💬 New comment received:", newCmt);

          setComments((prev) => [newCmt, ...prev]);
        });
      },
      onDisconnect: () => {
        console.log("❌ Disconnected from comment WebSocket");
      },
      reconnectDelay: 5000,
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8888/api/post/createComment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newComment.trim(),
          username: username,
          createdAt: new Date().toISOString(),
          post_id: postId,
        }),
      });

      const data = await res.json();
      if (data.code === 0) {
        setNewComment(""); // Xóa input sau khi gửi
      } else {
        console.error("Lỗi tạo comment:", data);
      }
    } catch (err) {
      console.error("Error:", err);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="relative bg-white rounded-lg shadow-lg w-[700px] h-[600px] flex flex-col">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
          onClick={onClose}
        >
          <X size={24} />
        </button>

  <h2 className="text-lg font-semibold px-6 pt-6">Comments</h2>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#777' }}>
                No comments
              </div>
          ) : (
            comments.map((cmt, index) => (
              <Comment key={index} {...cmt} />
            ))
          )}
        </div>

        <div className="p-4 border-t flex gap-2">
            <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border rounded px-3 py-2 text-sm focus:outline-blue-400"
            disabled={loading}
          />
          <button
            onClick={handleAddComment}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

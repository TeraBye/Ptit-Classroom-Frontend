'use client';

import { useEffect, useState } from "react";
import { LeftSidebar } from "./LeftSideBar";
import { CenterContent } from "./Center";
import { RightSidebar } from "./RightSideBar";
import { useParams } from "next/navigation";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";


interface Post {
  postId: number;
  assignmentId: number;
  avatar: string;
  fullName: string;
  createdAt: string;
  title: string;
  deadline: string;
  content: string;
  fileUrl: string;
}

export default function UserProfileCard() {
  const params = useParams();
  const id = params.classId;
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!id || !token) return;

    fetch(`http://localhost:8888/api/post/getPostbyClass?classId=${id}&page=0&size=5`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.result) {
          setPosts(data.result);
        } else {
          setPosts([]);
        }
      })
      .catch((err) => console.error(err));
  }, [id]);

  // ✅ WebSocket subscribe giống cách bạn làm ở Chat
  useEffect(() => {
    if (!id) return;

    const socket = new SockJS("http://localhost:8087/api/post/ws-post");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("📡 Connected to WebSocket for posts");

        client.subscribe(`/topic/posts/${id}`, (message) => {
          const newPost: Post = JSON.parse(message.body);
          console.log("🆕 New post received:", newPost);

          setPosts((prev) => [newPost, ...prev]); // Thêm bài mới lên đầu
        });
      },
      onDisconnect: () => {
        console.log("❌ Disconnected from post WebSocket");
      },
      reconnectDelay: 5000,
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [id]);


  return (
  <div className="flex flex-col md:flex-row gap-6 p-6 mt-20 h-screen">
    <LeftSidebar />
    <div className="flex-1 overflow-y-auto flex flex-col gap-4">
      {posts.length > 0 ? (
        posts.map((post) => (
          console.log("post", post),
          <CenterContent
            key={post.postId}
            avatar={post.avatar}
            fullName={post.fullName}
            createdAt={post.createdAt}
            title={post.title}
            deadline={post.deadline}
            content={post.content}
            fileUrl={post.fileUrl}
            assignmentId={post.assignmentId}
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <img
            src="https://i.pinimg.com/1200x/39/2a/26/392a261b73dbcd361a0dac2e93a05284.jpg" // Đường dẫn ảnh minh họa
            alt="No posts"
            className="w-24 h-24 opacity-70"
          />
          <p className="text-center text-gray-500">Chưa có bài post nào.</p>
        </div>
      )}
    </div>
    <RightSidebar />
  </div>
);

}

'use client';

import { useEffect, useState, useLayoutEffect } from "react";
import { LeftSidebar } from "./LeftSideBar";
import { CenterContent } from "./Center";
import { RightSidebar } from "./RightSideBar";
import { useParams } from "next/navigation";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import StudentListModal from "./StudentListModal";


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
  username: string;
}

export default function UserProfileCard() {
  const params = useParams();
  const id = params.classId;
  const [posts, setPosts] = useState<Post[]>([]);
  const [showStudentList, setShowStudentList] = useState(false);

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

  // WebSocket subscribe for new posts
  useEffect(() => {
    if (!id) return;
    const socket = new SockJS("http://localhost:8087/api/post/ws-post");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        client.subscribe(`/topic/posts/${id}`, (message) => {
          const newPost: Post = JSON.parse(message.body);
          setPosts((prev) => [newPost, ...prev]);
        });
      },
      onDisconnect: () => {
        console.log("Disconnected from post WebSocket");
      },
      reconnectDelay: 5000,
    });

    client.activate();
    return () => {
      void client.deactivate();
    };
  }, [id]);

  // Prevent body scroll
  useLayoutEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 mt-20 pt-32 h-screen overflow-hidden">
      <LeftSidebar />
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* Persistent student list button so teacher can open it even if there are no posts */}
        <div className="flex justify-end mb-3 mt-5">
          <button
            onClick={() => setShowStudentList(true)}
            className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
          >
            Student list
          </button>
        </div>

        {posts.length > 0 ? (
          posts.map((post) => (
            <CenterContent
              key={post.postId}
              postId={post.postId}
              avatar={post.avatar}
              fullName={post.fullName}
              createdAt={post.createdAt}
              title={post.title}
              deadline={post.deadline}
              content={post.content}
              fileUrl={post.fileUrl}
              assignmentId={post.assignmentId}
              username={post.username}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <img
              src="https://i.pinimg.com/1200x/39/2a/26/392a261b73dbcd361a0dac2e93a05284.jpg"
              alt="No posts"
              className="w-24 h-24 opacity-70"
            />
            <p className="text-center text-gray-500">No posts yet.</p>
          </div>
        )}

        {showStudentList && (
          <StudentListModal
            open={showStudentList}
            onClose={() => setShowStudentList(false)}
            classroomId={Number(id)}
          />
        )}
      </div>
      <RightSidebar />
    </div>
  );
}

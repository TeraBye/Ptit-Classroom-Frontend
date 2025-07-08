"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getMyInfo, getConversations } from "@/app/api/libApi/api";
import { Conversation } from "./Conversation";

interface Conversation {
  conver_id: number;
  senderUsername: string;
  receiverUsername: string;
  fullName: string;
  avatar: string | null;
}

export default function ChatContainer() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const user = await getMyInfo(token);
        setUsername(user.username);

        const convoList = await getConversations(user.username, token);
        setConversations(convoList);
      } catch (error) {
        console.error("Error loading conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Message List */}
      <div className="w-80 bg-white p-4 border-r flex flex-col">
        <h2 className="text-lg font-bold mb-4">Messages</h2>

        {loading ? (
          <div className="p-4">Loading...</div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2">
            {conversations.map((conversation) => {
              const otherUsername =
                conversation.senderUsername === username
                  ? conversation.receiverUsername
                  : conversation.senderUsername;

              return (
                <div
                  key={conversation.conver_id}
                  className="flex justify-between items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={
                        conversation.avatar ||
                        "https://i.pinimg.com/736x/0a/64/52/0a64526e892a27fa31b0327b51a46e84.jpg"
                      }
                      alt={conversation.fullName}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-semibold">{conversation.fullName}</p>
                      <p className="text-sm text-gray-500">{otherUsername}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">...</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

     {/* Conversation hoặc Placeholder */}
        {selectedConversation ? (
          <Conversation />
        ) : (
          <div className="flex-1 flex justify-center items-center h-full">
            <div className="flex flex-col items-center text-center">
              <Image
                src="https://i.pinimg.com/736x/17/6c/12/176c125838ffa703f850e3f12684bb14.jpg"
                alt="No conversation"
                width={120}
                height={120}
                className="mb-4 opacity-80"
              />
              <p className="text-lg text-gray-500">Hãy thêm đoạn hội thoại của bạn</p>
            </div>
          </div>
        )}

      
    </div>
  );
}

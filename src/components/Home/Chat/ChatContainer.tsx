"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getMyInfo, getConversations } from "@/app/api/libApi/api";
import { Conversation } from "./Conversation";
import { Search } from "lucide-react";


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
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const user = await getMyInfo(token);
        setUsername(user.username);
        setUser(user);

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
        <div className="mt-14 mb-4">
          <h2 className="text-lg font-bold mb-2">Messages</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>



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
          <Conversation conversation={selectedConversation} currentUser={user} />

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
              <p className="text-lg text-gray-500">Choose your conversation</p>
            </div>
          </div>
        )}

      
    </div>
  );
}

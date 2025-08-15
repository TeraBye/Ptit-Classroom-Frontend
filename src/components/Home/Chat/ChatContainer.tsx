"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { getMyInfo, getConversations } from "@/app/api/libApi/api";
import { Conversation } from "./Conversation";
import { Search } from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useSearchParams } from "next/navigation";

interface ConversationType {
  conver_id: number;
  senderUsername: string;
  receiverUsername: string;
  fullName: string;
  avatar: string | null;
  unread?: number; // để undefined khi không cần badge
  isUnread?: boolean;
  lastMessage?: string;
}

export default function ChatContainer() {
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationType | null>(null);
  const [user, setUser] = useState<any>(null);
  const stompClientRef = useRef<Client | null>(null);
  const searchParams = useSearchParams(); // lấy query params
  const receiverUsernameParam = searchParams.get("receiverUsername");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const userData = await getMyInfo(token);
        setUsername(userData.username);
        setUser(userData);

        const convoList = await getConversations(userData.username, token);
        setConversations(convoList);

        if (receiverUsernameParam) {
          const foundConvo = convoList.find(
            (c: ConversationType) =>
              c.senderUsername === receiverUsernameParam ||
              c.receiverUsername === receiverUsernameParam
          );
          if (foundConvo) {
            handleSelectConversation(foundConvo);
          }
        }

      } catch (error) {
        console.error("Error loading conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (conversations.length === 0) return;

    const socket = new SockJS("http://localhost:8082/api/chat/ws-chat");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected to WS");

        conversations.forEach((c) => {
          stompClient.subscribe(
            `/topic/conversations/${c.conver_id}`,
            (message) => {
              const chatMessage = JSON.parse(message.body);
              handleIncomingMessage(chatMessage, c.conver_id);
            }
          );
        });
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
    };
  }, [conversations]);

  const handleIncomingMessage = (msg: any, conversationId: number) => {
    setConversations((prev) => {
      const index = prev.findIndex((c) => c.conver_id === conversationId);
      if (index === -1) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(index, 1);

      const isCurrentOpen =
        selectedConversation &&
        selectedConversation.conver_id === conversationId;

      updated.unshift({
        ...moved,
        unread: isCurrentOpen
          ? undefined
          : (moved.unread || 0) + 1,
        isUnread: !isCurrentOpen,
        lastMessage: msg.content || moved.lastMessage,
      });

      return updated;
    });
  };

  const handleSelectConversation = (conversation: ConversationType) => {
    setSelectedConversation({
      ...conversation,
      unread: undefined,
      isUnread: false,
    });

    setConversations((prev) =>
      prev.map((c) =>
        c.conver_id === conversation.conver_id
          ? { ...c, unread: undefined, isUnread: false }
          : c
      )
    );
  };

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
                  className={`flex justify-between items-center p-2 rounded cursor-pointer hover:bg-gray-100 ${
                    conversation.isUnread ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleSelectConversation(conversation)}
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
                      <p
                        className={`${
                          conversation.isUnread
                            ? "font-bold text-black"
                            : "text-gray-800"
                        }`}
                      >
                        {conversation.fullName}
                      </p>
                      <p className="text-sm text-gray-500 truncate w-40">
                        {conversation.lastMessage || otherUsername}
                      </p>
                    </div>
                  </div>
                  {typeof conversation.unread === "number" &&
                    conversation.unread > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {conversation.unread}
                      </span>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chat Window */}
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

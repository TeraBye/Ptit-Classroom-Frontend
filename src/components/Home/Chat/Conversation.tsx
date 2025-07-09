"use client";
import { useEffect, useState, useRef } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { Loader2 } from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

type Message = {
  id: number;
  text: string;
  isSender: boolean;
  time: string;
};

interface ConversationProps {
  conversation: {
    conver_id: number;
    senderUsername: string;
    receiverUsername: string;
    fullName: string;
    avatar: string | null;
  };
  currentUser: {
    username: string;
    token: string;
  };
}

export function Conversation({ conversation, currentUser }: ConversationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const DEFAULT_FIRST_INDEX = 10_000_000;
  const [firstItemIndex, setFirstItemIndex] = useState(DEFAULT_FIRST_INDEX);
  const [initialLoadDone, setInitialLoadDone] = useState(false); 
  const stompClientRef = useRef<Client | null>(null);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  

  const loadMessages = async (isFirstLoad = false) => {
    if (loading || (!hasMore && !isFirstLoad)) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const currentPage = isFirstLoad ? 0 : page;
      const res = await fetch(`http://localhost:8888/api/chat/startChat/${conversation.conver_id}?page=${currentPage}&size=10`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.code === 0) {
        const newMessages: Message[] = data.result.map((msg: any) => ({
          id: msg.id,
          text: msg.content,
          isSender: msg.sender === currentUser.username,
          time: msg.time,
        }));

        const reversed = newMessages.reverse();

        if (isFirstLoad) {
          setMessages(reversed);
          setPage(1);
          setFirstItemIndex(DEFAULT_FIRST_INDEX);
          setInitialLoadDone(true);
        } else {
          setMessages((prev) => [...reversed, ...prev]);
          setFirstItemIndex((prev) => prev - reversed.length);
          setPage((prev) => prev + 1);
        }

        if (reversed.length < 10) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!initialLoadDone) return;
    virtuosoRef.current?.scrollToIndex({
      index: Number.POSITIVE_INFINITY,
      behavior: "smooth",
      align: "end",
    });
  }, [messages.length]);

  useEffect(() => {
  const socket = new SockJS("http://localhost:8082/api/chat/ws-chat");
  const client = new Client({
    webSocketFactory: () => socket,
    onConnect: () => {
      console.log("Connected to WebSocket");

      // Subscribe theo conversation
      client.subscribe(`/topic/conversations/${conversation.conver_id}`, (message) => {
        const chat = JSON.parse(message.body);
        console.log("New message received:", chat);

        // Thêm message vào cuối danh sách
        setMessages((prev) => [
          ...prev,
          {
            id: chat.id,
            text: chat.content,
            isSender: chat.sender === currentUser.username,
            time: chat.time,
          },
        ]);



      });
    },
    onDisconnect: () => console.log("Disconnected from WebSocket"),
    debug: (str) => console.log(str),
  });

  client.activate();
  stompClientRef.current = client;

  return () => {
    client.deactivate();
  };
}, [conversation.conver_id, currentUser.username]);

  // 👉 Khi đổi conversation
  useEffect(() => {
    setMessages([]);
    setPage(0);
    setHasMore(true);
    setFirstItemIndex(0);
    setInitialLoadDone(false);
    loadMessages(true);
  }, [conversation]);

 
  useEffect(() => {
    if (initialLoadDone) {
      setTimeout(() => {
        virtuosoRef.current?.scrollToIndex({ index: messages.length - 1, behavior: "auto" });
      }, 0);
    }
  }, [initialLoadDone, messages.length]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: input,
      isSender: true,
      time: new Date().toISOString(),
    };

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch("http://localhost:8888/api/chat/startChat", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          content: input,
          time: new Date().toISOString(),
          conversationId: conversation.conver_id,
          sender: currentUser.username,
        }),
      });
    } catch (err) {
      console.error("Send failed:", err);
    }

    setInput("");


  };

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader fullName={conversation.fullName} avatar={conversation.avatar} />

      <Virtuoso
        key={conversation.conver_id} // ⚠️ Thêm key để force reset Virtuoso khi đổi conversation
        ref={virtuosoRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4"
        data={messages}
        firstItemIndex={firstItemIndex}
        followOutput="smooth"
        increaseViewportBy={{ top: 300, bottom: 300 }}
        atTopThreshold={50}
        startReached={() => {
          console.log("Start reached");
          loadMessages(false);
        }}
        itemContent={(index, msg) => (
          <MessageBubble key={msg.id} text={msg.text} isSender={msg.isSender} />
        )}
        components={{
          Header: () =>
            loading && page > 0 ? (
              <div className="flex justify-center my-2 text-gray-500">
                <Loader2 className="animate-spin" />
              </div>
            ) : null,
          Footer: () => <div className="h-4" />,
        }}
      />

      <div className="p-4 border-t flex gap-2">
        <input
          type="text"
          placeholder="Type a message here"
          className="flex-1 px-3 py-2 border rounded focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button onClick={handleSend} className="bg-red-400 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>
    </div>
  );
}

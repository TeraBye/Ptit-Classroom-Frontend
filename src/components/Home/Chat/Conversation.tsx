"use client";

import { useEffect, useRef, useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";

type Message = {
  text: string;
  isSender: boolean;
};

export function Conversation() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Chào cu 😁", isSender: false },
    { text: "Dạo này khỏe không?", isSender: false },
    { text: "Cũng tạm", isSender: true },
    { text: "Sao nhắn tin cho anh vậy em?", isSender: true },
    { text: "Mời cưới hả?", isSender: true },
    { text: "Cho em vay nóng 10tr", isSender: false },
    { text: "Hứa sẽ trả", isSender: false },
    { text: "Không em", isSender: true },
    { text: ":<", isSender: false },
  ]);

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { text: input, isSender: true }]);
    setInput("");
  };

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, index) => (
          <MessageBubble key={index} text={msg.text} isSender={msg.isSender} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t flex gap-2">
        <input
          type="text"
          placeholder="Type a message here"
          className="flex-1 px-3 py-2 border rounded focus:outline-none"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
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

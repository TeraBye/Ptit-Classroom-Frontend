import ChatContainer from "@/components/Home/Chat/ChatContainer";
import { Suspense } from "react";

export default function ChatPage() {
  return (
    <main className=" pt-16 h-screen bg-gray-100"> 
      <div className=" h-[calc(100vh-70px)]" > {/* 100vh trừ đi chiều cao header */}
        <Suspense fallback={<div className="p-4">Loading chat...</div>}>
          <ChatContainer />
        </Suspense>
      </div>
    </main>
  );
}

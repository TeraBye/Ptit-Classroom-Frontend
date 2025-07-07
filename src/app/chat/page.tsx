import ChatContainer from "@/components/Home/Chat/ChatContainer";

export default function ChatPage() {
  return (
    <main className=" pt-16 h-screen bg-gray-100"> 
      <div className=" h-[calc(100vh-70px)]" > {/* 100vh trừ đi chiều cao header */}
        <ChatContainer />
      </div>
    </main>
  );
}

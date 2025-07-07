import { MessageList } from "./MessageList";
import { Conversation } from "./Conversation";

export default function ChatContainer() {
  return (
    <div className="flex h-[calc(100vh-100px)]"> 
      <MessageList />
      <Conversation />
    </div>
  );
}


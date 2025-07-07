export function MessageBubble({ text, isSender }: { text: string; isSender?: boolean }) {
  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"} my-2`}>
      <div className={`rounded-lg p-2 text-sm max-w-xs ${isSender ? "bg-red-400 text-white" : "bg-gray-200 text-black"}`}>
        {text}
      </div>
    </div>
  );
}

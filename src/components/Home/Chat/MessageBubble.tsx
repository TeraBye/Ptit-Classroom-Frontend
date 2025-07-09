export function MessageBubble({ text, isSender }: { text: string; isSender?: boolean }) {
  return (
    <div
      className={`flex ${isSender ? "justify-end pr-8" : "justify-start pl-4"} my-2`}
    >
      <div
        className={`rounded-lg p-2 text-sm max-w-xs break-words ${
          isSender ? "bg-red-400 text-white" : "bg-gray-200 text-black"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

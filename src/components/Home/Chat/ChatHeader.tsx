import Image from "next/image";

interface ChatHeaderProps {
  fullName: string;
  avatar: string | null;
}

export function ChatHeader({ fullName, avatar }: ChatHeaderProps) {
  return (
    <div className="flex justify-between items-center p-4 border-b mt-14">
      <div className="flex items-center gap-3">
        <Image
          src={
            avatar ||
            "https://i.pinimg.com/736x/68/99/6b/68996b1571ad7f4bbed92429f512139e.jpg"
          }
          alt={fullName}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <p className="font-semibold">{fullName}</p>
          <p className="text-xs text-green-500">Online</p>
        </div>
      </div>
    </div>
  );
}

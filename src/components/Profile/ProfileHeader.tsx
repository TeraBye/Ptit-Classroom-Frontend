import Image from "next/image";

export default function ProfileHeader({ user, onMessage }: { user: any; onMessage: () => void }) {
  return (
    <div className="flex items-center gap-6 border-b pb-4 mb-6">
      <Image
        src={user.avatar || "https://i.pinimg.com/736x/6e/59/95/6e599501252c23bcf02658617b29c894.jpg"}
        alt="Avatar"
        width={100}
        height={100}
        className="rounded-full object-cover"
      />
      <div className="flex-1">
        <h1 className="text-2xl font-bold">{user.fullName}</h1>
        <p className="text-gray-500">@{user.username}</p>
        <p className="text-gray-500">{user.email}</p>
      </div>
      <button
        onClick={onMessage}
        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg"
      >
        Message
      </button>
    </div>
  );
}

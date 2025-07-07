import Image from "next/image";

export function MessageList() {
  const users = [
    { id: 1, name: "Lương Đạt Thiện", message: "Hi anh 😁", time: "1:55 PM" },
    { id: 2, name: "Đặng Xuân Nam", message: "Chào anh ạ", time: "1:54 PM" },
    { id: 3, name: "Messi", message: "Đá với anh tí đi cu", time: "1:52 PM" },
    { id: 4, name: "Huỳnh Trung Trụ", message: "Thầy xin lỗi~", time: "1:50 PM" },
    { id: 5, name: "Fan cuồng MU", message: "cay quá bạn...", time: "1:48 PM" },
  ];

  return (
    <div className="w-80 bg-white p-4 border-r flex flex-col">
      <h2 className="text-lg font-bold mb-4">Messages</h2>

      <div className="flex-1 overflow-y-auto space-y-2">
        {users.map(user => (
          <div key={user.id} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
            <div className="flex items-center gap-3">
              <Image src="https://i.pinimg.com/736x/0a/64/52/0a64526e892a27fa31b0327b51a46e84.jpg"
               alt={user.name} width={40} height={40} className="rounded-full" />
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500">{user.message}</p>
              </div>
            </div>
            <span className="text-xs text-gray-400">{user.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


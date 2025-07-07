// components/UserProfile/CenterContent.tsx
'use client';

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle,Bookmark, Mail } from "lucide-react";

export function CenterContent() {
  return (
    <Card className="flex-1">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="https://i.pinimg.com/736x/5c/57/b9/5c57b919d1c2fc9975a30ccaa06f1448.jpg" 
            alt="kik" width={40} height={40} className="rounded-full" />
            <div>
              <h3 className="font-semibold">Huynh Trung Tru</h3>
              <p className="text-xs text-gray-500">3 min ago</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Bookmark className="text-green-500 cursor-pointer" />
            <Mail className="text-red-500 cursor-pointer" />
          </div>
        </div>

        <p className="mt-2 font-semibold">Bài tập mới chương 1</p>
        <div className="flex gap-3 mt-2">
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">Deadline: 20h 20/10/2023</span>
        </div>

        <p className="mt-3 text-gray-600 text-sm">
          Các em làm bài tập chương 1, nộp bài trước 20h ngày 20/10/2023. Các 
          em có thể tham khảo tài liệu đính kèm để hoàn thành bài tập.
        </p>

        <div className="mt-2 text-blue-500 cursor-pointer text-sm">file đính kèm</div>

        <div className="flex flex-wrap gap-2 mt-3">
          {['fileA.doc','fileB.doc'].map(skill => (
            <span key={skill} className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">{skill}</span>
          ))}
        </div>

        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <button
            className="flex gap-2 items-center text-gray-500 hover:text-blue-500 transition"
            onClick={() => console.log("Clicked Discuss")}
          >
            <MessageCircle size={25} />
            <span>Discuss</span>
          </button>

          <div>Discussions 50</div>
        </div>
      </CardContent>
    </Card>
  );
}
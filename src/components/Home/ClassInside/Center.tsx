"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Upload, Mail, X, ClipboardList } from "lucide-react";
import { Comment, CommentProps } from "@/components/Home/ClassInside/Comment";
import { CommentModal } from "@/components/Home/ClassInside/CommentModal";
import { SubmitModal } from "@/components/Home/ClassInside/SubmitModal";
import { Client, Storage, ID } from "appwrite";
import { format } from "date-fns";
import { API_BASE_URL, getMyInfo } from "@/app/api/libApi/api";
import { useParams, useRouter } from "next/navigation";
import { SubmissionListModal } from "./SubmissionListModal";
import axiosInstance from "@/utils/axiosInstance";
import StudentListModal from "./StudentListModal";

interface PostProps {
  avatar: string;
  fullName: string;
  createdAt: string;
  title: string;
  deadline: string;
  content: string;
  fileUrl: string;
  assignmentId: number;
  username: string;
}

const getDaysLeft = (deadline: string) => {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "(Hết hạn)";
  return `(Còn ${diffDays} ngày)`;
};

const getTimeAgo = (createdAt: string) => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return `Vừa xong`;
};

// --- Appwrite config
const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67f02a3c00396aab7f01");
const storage = new Storage(client);
const BUCKET_ID = "67f02a57000c66380420";
const ProjectID = "67f02a3c00396aab7f01";

export function CenterContent({
  avatar,
  fullName,
  createdAt,
  title,
  deadline,
  content,
  fileUrl,
  assignmentId,
  username,
}: PostProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [showStudentList, setShowStudentList] = useState(false);

  const {classId} = useParams<{classId: string}>();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const userData = await getMyInfo(token);
        setUser(userData);
      } catch (error) {
        console.error("Error ", error);
      }
    };

    fetchData();
  }, []);

  const handleSubmissionClick = async () => {
    const res = await axiosInstance.get(`${API_BASE_URL}/assignments/${assignmentId}/check-submitted?studentUsername=${user?.username}`);
    setAlreadySubmitted(res.data.result);
    setShowSubmitModal(true)
  }

  const handleSubmission = async (note: string, file: File | null) => {

    try {
      let fileUrl = "";
      if (file) {
        fileUrl = await uploadFileToAppwrite(file);
      }

      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/assignments/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignmentId,
          studentUsername: user?.username,
          note,
          fileUrl,
        }),
      });

      setShowSubmitModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewSubmissions = () => {
    setShowSubmissions(true);
  };

  const router = useRouter(); // dùng để điều hướng

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const userData = await getMyInfo(token);
        setUser(userData);
      } catch (error) {
        console.error("Error ", error);
      }
    };

    fetchData();
  }, []);

  // Hàm mở tin nhắn
  const handleOpenMessage = async () => {
    if (!user?.username) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8888/api/chat/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senderUsername: user.username,
          receiverUsername: username,
        }),
      });

      if (!res.ok) {
        throw new Error("Không thể tạo cuộc trò chuyện");
      }

      router.push(`/chat?receiverUsername=${encodeURIComponent(username)}`);

    } catch (err) {
      console.error("Lỗi khi mở tin nhắn:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const userData = await getMyInfo(token);
        setUser(userData);
      } catch (error) {
        console.error("Error ", error);
      }
    };

    fetchData();
  }, []);

  const mockComments: CommentProps[] = [
    {
      avatar:
        "https://i.pinimg.com/736x/6e/59/95/6e599501252c23bcf02658617b29c894.jpg",
      username: "student001",
      content: "Thầy giảng rất dễ hiểu ạ!",
      createdAt: new Date().toISOString(),
      replies: [
        {
          avatar:
            "https://i.pinimg.com/736x/6e/59/95/6e599501252c23bcf02658617b29c894.jpg",
          username: "teacher001",
          content: "Cảm ơn em nha!",
          createdAt: new Date().toISOString(),
        },
      ],
    },
    {
      avatar:
        "https://i.pinimg.com/736x/6e/59/95/6e599501252c23bcf02658617b29c894.jpg",
      username: "student002",
      content: "Deadline hơi gấp thầy ơi.",
      createdAt: new Date().toISOString(),
    },
  ];

  // Submit assignments
  const uploadFileToAppwrite = async (file: File) => {
    const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
    return `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${response.$id}/view?project=${ProjectID}`;
  };

  return (
    <Card className="w-full shadow-md rounded-lg border">
      <CardContent className="p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image
              src={avatar}
              alt="avatar"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-base">{fullName}</h3>
              <p className="text-xs text-gray-500">{getTimeAgo(createdAt)}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {user?.role === "STUDENT" ? (
              <Upload
                className="text-green-500 cursor-pointer hover:text-green-600"
                onClick={handleSubmissionClick}
              />
            ) : (
              <ClipboardList
                className="text-blue-500 cursor-pointer hover:text-blue-600"
                onClick={handleViewSubmissions}
              />
            )}
            <Mail className="text-red-500 cursor-pointer hover:text-red-600"
              onClick={() => handleOpenMessage()}
            />
            {/* Nút mở danh sách sinh viên */}
            <button
              className="px-2 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
              onClick={() => setShowStudentList(true)}
            >
              Danh sách sinh viên
            </button>
          </div>
          {showSubmissions && (
            <SubmissionListModal
              assignmentId={assignmentId}
              onClose={() => setShowSubmissions(false)}
            />
          )}
          {showStudentList && (
            <StudentListModal
              open={showStudentList}
              onClose={() => setShowStudentList(false)}
              classroomId={Number(classId)} // Nếu bạn có classroomId riêng, hãy thay bằng biến đó
            />
          )}
        </div>

        <h4 className="font-semibold text-lg">{title}</h4>

        <div className="flex gap-3">
          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded">
            Deadline: {new Date(deadline).toLocaleString()}{" "}
            {getDaysLeft(deadline)}
          </span>
        </div>

        <p className="text-gray-700 leading-relaxed">{content}</p>

        {fileUrl && (
          <div className="border rounded-md p-4 mt-3 bg-gray-50 flex items-center justify-between hover:shadow-sm transition">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-500 text-lg">📄</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {fileUrl.split("/").pop()}
                </p>
                <p className="text-xs text-gray-500">File đính kèm</p>
              </div>
            </div>
            <button
              onClick={() => setShowPreview(true)}
              className="text-blue-600 text-sm hover:underline"
            >
              Xem file
            </button>
          </div>
        )}

        <div className="flex justify-between items-center text-sm text-gray-500 pt-2 border-t">
          <button
            className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition"
            onClick={() => setShowComments(true)}
          >
            <MessageCircle size={20} />
            <span>Bình luận</span>
          </button>
          <div>{mockComments.length} bình luận</div>
        </div>

        <div className="mt-3">
          <input
            type="text"
            placeholder="Viết bình luận..."
            className="w-full border rounded px-3 py-2 text-sm focus:outline-blue-400"
          />
        </div>
      </CardContent>

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="relative bg-white rounded-lg shadow-lg w-11/12 h-5/6 flex flex-col">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              onClick={() => setShowPreview(false)}
            >
              <X size={24} />
            </button>
            <iframe
              src={fileUrl}
              className="flex-1 rounded-b-lg"
              title="File Preview"
            />
          </div>
        </div>
      )}

      {showComments && (
        <CommentModal
          comments={mockComments}
          onClose={() => setShowComments(false)}
        />
      )}

      {showSubmitModal && (
        <SubmitModal
          onClose={() => setShowSubmitModal(false)}
          onSubmit={handleSubmission}
          disabled={alreadySubmitted}
        />
      )}
    </Card>
  );
}

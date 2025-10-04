"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { API_BASE_URL } from "@/app/api/libApi/api";

interface Submission {
  id: number;
  studentUsername: string;
  note: string;
  fileUrl: string;
  submitTime: string;
}

interface SubmissionListModalProps {
  assignmentId: number;
  onClose: () => void;
}

export function SubmissionListModal({ assignmentId, onClose }: SubmissionListModalProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/assignments/${assignmentId}/submissions?page=${page}&size=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      if (data.result.content.length < 10) {
        setHasMore(false);
      }

      setSubmissions((prev) => {
        const newSubs = data.result.content as Submission[];
        // Lọc submissions mới chưa có trong prev
        const uniqueSubs = newSubs.filter(
          (sub: Submission) => !prev.some((p) => p.id === sub.id)
        );
        return [...prev, ...uniqueSubs];
      });
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("Lỗi khi load submissions:", err);
    }
    setLoading(false);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 50) {
      fetchMore();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-3/4 h-4/5 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Danh sách bài đã nộp</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto p-4"
          onScroll={handleScroll}
        >
          {submissions.map((s) => (
            <div
              key={s.id}
              className="border rounded p-3 mb-3 bg-gray-50 hover:bg-gray-100 transition"
            >
              <div className="font-semibold">{s.studentUsername}</div>
              <div className="text-sm text-gray-500">
                Nộp lúc: {s.submitTime}
              </div>
              {s.note && <p className="mt-2">{s.note}</p>}
              {s.fileUrl && (
                <a
                  href={s.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm hover:underline mt-2 inline-block"
                >
                  📄 Xem file
                </a>
              )}
            </div>
          ))}

          {loading && <p className="text-center text-gray-500">Đang tải...</p>}
          {!hasMore && (
            <p className="text-center text-gray-400 mt-2">Đã tải hết</p>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/app/api/libApi/api";

interface UserProfileResponse {
  id: number;
  fullName: string;
  username: string;
  email: string;
  avatar?: string;
}

interface StudentListModalProps {
  open: boolean;
  onClose: () => void;
  classroomId: number;
}

interface ApiResponse<T> {
  result: T;
}

interface Page<T> {
  content: T[];
  totalPages: number;
  number: number;
}

const StudentListModal: React.FC<StudentListModalProps> = ({ open, onClose, classroomId }) => {
  const [students, setStudents] = useState<UserProfileResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    axios
      .get(`${API_BASE_URL}/classrooms/${classroomId}/students-of-class`, {
        params: { page, size: 10 },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        const data: ApiResponse<Page<UserProfileResponse>> = res.data;
        setStudents(data.result.content);
        setTotalPages(data.result.totalPages);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [open, classroomId, page]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-0 relative overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <svg className="h-7 w-7 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m13-6.13a4 4 0 11-8 0 4 4 0 018 0zM7 7a4 4 0 108 0 4 4 0 00-8 0z" /></svg>
            Student List
          </h2>
          <button className="text-white text-2xl hover:bg-white/20 rounded-full w-9 h-9 flex items-center justify-center" onClick={onClose}>&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <svg className="animate-spin h-7 w-7 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-h-96 overflow-y-auto">
              {students.map((student) => (
                <div key={student.id} className="bg-white rounded-lg shadow hover:shadow-lg transition flex items-center gap-4 p-4 border border-gray-100 w-full">
                  {student.avatar ? (
                    <img src={student.avatar} alt={student.fullName} className="w-14 h-14 rounded-full object-cover border-2 border-sky-400" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-sky-200 flex items-center justify-center text-xl font-bold text-sky-700 border-2 border-sky-400">
                      {student.fullName.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate">{student.fullName}</div>
                    <div className="text-xs text-gray-500 truncate">{student.email}</div>
                    <div className="text-xs text-gray-400 truncate">@{student.username}</div>
                  </div>
                </div>
              ))}
              {students.length === 0 && (
                <div className="text-center text-gray-500 py-8">No students found.</div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center px-6 py-3 bg-gray-100 border-t">
          <button
            className="px-4 py-1 rounded bg-sky-600 text-white font-medium hover:bg-sky-700 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">Page {page + 1} / {totalPages}</span>
          <button
            className="px-4 py-1 rounded bg-sky-600 text-white font-medium hover:bg-sky-700 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentListModal; 
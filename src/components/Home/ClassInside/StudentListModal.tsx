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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Student List</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
            {students.map((student) => (
              <li key={student.id} className="py-2 flex items-center gap-3">
                {student.avatar ? (
                  <img src={student.avatar} alt={student.fullName} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm">
                    {student.fullName.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-medium">{student.fullName}</div>
                  <div className="text-xs text-gray-500">{student.email}</div>
                </div>
              </li>
            ))}
            {students.length === 0 && <li>No students found.</li>}
          </ul>
        )}
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </button>
          <span>Page {page + 1} / {totalPages}</span>
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
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
"use client";

import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { API_BASE_URL } from "@/app/api/libApi/api";
import { X } from "lucide-react";
import { toastError } from "@/utils";

type SubmitStatus = "NOT_SUBMITTED" | "SUBMITTED" | "LATE" | "ALL";

interface SubmissionHistory {
  id: number;
  assignmentId: number;
  submitTime: string;
  note?: string;
  fileUrl?: string;
  status?: "ON_TIME" | "LATE" | string;
  submissionCount?: number;
}

interface StudentAssignmentView {
  studentUsername: string;
  studentName?: string;
  avatar?: string | null;
  status: "NOT_SUBMITTED" | "SUBMITTED" | "LATE" | string;
  // legacy: history of submissions
  history?: SubmissionHistory[];
  // new shape: single latest submission and a count
  submission?: SubmissionHistory;
}

interface ApiPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

interface Props {
  assignmentId: number;
  onClose: () => void;
}

export const SubmissionListModal: React.FC<Props> = ({ assignmentId, onClose }) => {
  const [statusFilter, setStatusFilter] = useState<SubmitStatus>("ALL");
  const [submissions, setSubmissions] = useState<StudentAssignmentView[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const load = async (p = 0, s: SubmitStatus = statusFilter) => {
    try {
      setLoading(true);
      const params: string[] = [`page=${p}`, `size=10`];
      if (s !== "ALL") params.push(`status=${s}`);
      const url = `${API_BASE_URL}/assignments/${assignmentId}/submissions?${params.join("&")}`;
      const res = await axiosInstance.get(url);
      const data = res.data?.result as ApiPage<StudentAssignmentView>;
      setSubmissions(data.content || []);
      setTotalPages(data.totalPages ?? 1);
      setTotalElements(data.totalElements ?? 0);
      setPage(data.number ?? p);
    } catch (err) {
  toastError((err as any)?.response?.data?.message || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(0, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId, statusFilter]);

  // close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div ref={wrapperRef} className="bg-white rounded-lg shadow-lg w-[780px] max-h-[80vh] overflow-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Submissions list</h3>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">Total: {totalElements}</div>
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
              <X />
            </button>
          </div>
        </div>

        <div className="p-4 border-b flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {(["ALL", "NOT_SUBMITTED", "SUBMITTED", "LATE"] as SubmitStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded text-sm ${statusFilter === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
              >
                {s === "ALL" ? "All" : s === "NOT_SUBMITTED" ? "Not submitted" : s === "SUBMITTED" ? "Submitted" : "Late"}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-600">
            Page {page + 1} / {totalPages}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {loading ? (
            <div className="text-center py-10 text-sm text-gray-500">Loading...</div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-500">No data</div>
          ) : (
            submissions.map((s) => {
              // API may return submissionCount inside the submission object
              const count = s.submission?.submissionCount ?? s.history?.length ?? (s.submission ? 1 : 0);
              const items: SubmissionHistory[] = s.submission ? [s.submission] : (s.history ?? []);
              const isNotSubmitted = count === 0 && (!s.status || s.status === 'NOT_SUBMITTED');
              return (
                <div key={s.studentUsername} className="p-3 border rounded flex items-start gap-3">
                  <img
                    src={s.avatar || "/default-avatar.png"}
                    alt={s.studentName || s.studentUsername}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{s.studentName || s.studentUsername}</div>
                        <div className="text-xs text-gray-500">{s.studentUsername}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${isNotSubmitted ? "text-gray-500" : s.status === "LATE" ? "text-red-500" : "text-green-600"}`}>
                          {isNotSubmitted ? "Not submitted" : s.status === "LATE" ? "Late" : "Submitted"}
                        </div>
                        <div className="text-xs text-gray-400">{count} submissions</div>
                      </div>
                    </div>

                    <div className="mt-2 space-y-2">
                      {items.length > 0 ? items.map((h) => (
                        <div key={h.id} className="bg-gray-50 p-2 rounded border">
                          <div className="flex items-center justify-between text-sm">
                            <div className="text-gray-700">{h.note || "No note"}</div>
                            <div className="text-xs text-gray-400">{h.submitTime}</div>
                          </div>
                          {h.fileUrl && (
                            <div className="mt-1">
                              <a href={h.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-sm hover:underline">
                                  📄 View file
                                </a>
                            </div>
                          )}
                        </div>
                      )) : (
                        <div className="text-sm text-gray-500">Student has not submitted</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 0}
              onClick={() => load(page - 1, statusFilter)}
              className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => load(page + 1, statusFilter)}
              className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="text-sm text-gray-600">Showing {submissions.length} / {totalElements}</div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionListModal;

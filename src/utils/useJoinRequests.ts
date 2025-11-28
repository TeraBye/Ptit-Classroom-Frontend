import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";

export function useJoinRequests(
  classroomId: number | null,
  enabled: boolean,
  username?: string | null
) {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!enabled || !classroomId || !username) return;
    load(username);
  }, [enabled, classroomId, username]);

  const load = async (currentUsername: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: "PENDING",
        username: currentUsername,
      });
      const res = await axiosInstance.get(
        `/classrooms/${classroomId}/join-requests?${params.toString()}`
      );
      const payload = res.data?.result ?? res.data ?? [];
      const normalized = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.content)
          ? payload.content
          : [];
      setRequests(normalized);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    requestId: number,
    status: "APPROVED" | "REJECTED"
  ) => {
    setProcessing(true);
    try {
      await axiosInstance.patch(
        `/classrooms/${classroomId}/join-requests/${requestId}`,
        { status, username }
      );
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } finally {
      setProcessing(false);
    }
  };

  return { requests, loading, processing, updateStatus };
}

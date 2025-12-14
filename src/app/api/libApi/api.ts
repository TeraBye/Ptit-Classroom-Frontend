import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8888/api";

export async function getMyInfo(token?: string) {
  const res = await axiosInstance.get(`/identity/users/myInfo`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data.result;
}

export async function getConversations(username: string, token?: string) {
  const res = await axiosInstance.get(`/chat/conversation/${username}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data.result;
}

export async function createClassroom(data: any, token?: string) {
  const res = await axiosInstance.post(`/classrooms/create`, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data.result;
}

export async function getAllSubjects(token?: string) {
  try {
    const res = await axiosInstance.get(`/classrooms/subjects`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const result = res.data?.result ?? res.data;
    const content = result?.content ?? result;
    return Array.isArray(content) ? content : [];
  } catch (error: any) {
    toast.error(error?.message || String(error));
    return [];
  }
}

export async function getClassroomByTeacherUsername(
  username: string,
  token?: string,
  page = 0,
  size = 9
) {
  const res = await axiosInstance.get(`/classrooms/teacher/${username}?page=${page}&size=${size}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data.result;
}

export async function addStudent(data: any, token?: string) {
  const res = await axiosInstance.post(`/classrooms/add-student`, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data.result;
}

export async function getStudentClasses(
  username: string,
  token?: string,
  page = 0,
  size = 10
) {
  const res = await axiosInstance.get(`/classrooms/student/${username}?page=${page}&size=${size}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data.result;
}

export async function getAuditLogs(
  username: string,
  page = 0,
  size = 10,
  sort: "asc" | "desc" = "desc",
  token?: string
) {
  try {
    const res = await axiosInstance.get(
      `/logs/?page=${page}&size=${size}&sort=createdAt,${sort}&username=${username}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );
    return res.data.result;
  } catch (error: any) {
    toast.error("Failed to load audit logs");
    return { content: [], totalPages: 0, totalElements: 0 };
  }
}

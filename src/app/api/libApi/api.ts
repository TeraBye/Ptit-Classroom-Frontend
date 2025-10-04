import axios from "axios";
import toast from "react-hot-toast";

export const API_BASE_URL = "http://localhost:8888/api";

export async function getMyInfo(token: string) {
  const response = await axios.get(`${API_BASE_URL}/identity/users/myInfo`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.result;
}

export async function getConversations(username: string, token: string) {
  const response = await axios.get(
    `${API_BASE_URL}/chat/conversation/${username}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.result;
}

export async function createClassroom(data: any, token?: string) {
  const response = await axios.post(`${API_BASE_URL}/classrooms/create`, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data.result;
}

export async function getAllSubjects(token?: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/classrooms/subjects`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    console.log("subjects", response.data.result);
    return response.data.result;
  } catch (error) {
    toast.error(error.message)
  }
}

export async function getClassroomByTeacherUsername(
  username: string,
  token?: string,
  page = 0,
  size = 9
) {
  const response = await axios.get(
    `${API_BASE_URL}/classrooms/teacher/${username}?page=${page}&size=${size}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  return response.data.result;
}

export async function addStudent(data: any, token?: string) {
  const response = await axios.post(
    `${API_BASE_URL}/classrooms/add-student`,
    data,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  return response.data.result;
}

export async function getStudentClasses(
  username: string,
  token?: string,
  page = 0,
  size = 10
) {
  const response = await axios.get(
    `${API_BASE_URL}/classrooms/student/${username}?page=${page}&size=${size}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  console.log("student classes", response.data.result);
  return response.data.result;
}

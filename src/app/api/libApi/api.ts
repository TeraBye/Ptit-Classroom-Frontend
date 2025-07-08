import axios from "axios";

const API_BASE_URL = "http://localhost:8888/api";

export async function getMyInfo(token: string) {
  const response = await axios.get(`${API_BASE_URL}/identity/users/myInfo`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.result;
}

export async function getConversations(username: string, token: string) {
  const response = await axios.get(`${API_BASE_URL}/chat/conversation/${username}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.result;
}

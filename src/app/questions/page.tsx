"use client";
import { useEffect, useState } from "react";
import { API_BASE_URL, getAllSubjects, getMyInfo } from "@/app/api/libApi/api";
import axios from "axios";
import toast from "react-hot-toast";
import SubjectList from "@/components/Questions/SubjectList";
import QuestionList from "@/components/Questions/QuestionList";
import QuestionForm from "@/components/Questions/QuestionForm";
import { AxiosError } from "axios";

interface Subject {
  id?: number;
  name: string;
}

// Đổi tên interface để tránh xung đột với import hoặc global
interface QuestionType {
  id?: number;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation?: string;
  level?: string;
  username?: string;
  subjectId?: number;
}

const initialForm = {
  content: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A",
  explanation: "",
  level: "EASY",
};

// API helpers cho câu hỏi
async function getQuestionsBySubject(subjectId: number, token: string | undefined): Promise<QuestionType[]> {
  try {
    const res = await axios.get(`${API_BASE_URL}/questions/get-by-subject/${subjectId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data.result || [];
  } catch (e) {
    toast.error("Error get questions")
    return [];
  }
}
async function addQuestion(data: QuestionType, token: string | undefined): Promise<QuestionType> {
  try {
    const res = await axios.post(`${API_BASE_URL}/questions/create`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data.result;
  } catch (error) {
    console.log(error)
    const err = error as AxiosError<any>;
    const message =
      err.response?.data?.message ||
      err.message ||
      "An error occurred. Please try again.";
    toast.error(message);
    throw error;
  }
}
async function updateQuestion(questionId: number, data: QuestionType, token: string | undefined): Promise<QuestionType> {
  try {
    const res = await axios.put(`${API_BASE_URL}/questions/${questionId}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data.result;
  } catch (error) {
    const err = error as AxiosError<any>;
    const message =
      err.response?.data?.message ||
      err.message ||
      "An error occurred. Please try again.";
    toast.error(message);
    throw error;
  }
}
async function deleteQuestion(questionId: number, token: string | undefined): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/questions/${questionId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch (error) {
    const err = error as AxiosError<any>;
    const message =
      err.response?.data?.message ||
      err.message ||
      "An error occurred. Please try again.";
    toast.error(message);
    throw error;
  }
}

export default function QuestionsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [form, setForm] = useState<typeof initialForm>(initialForm);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [editQuestionId, setEditQuestionId] = useState<number | null>(null);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<{ username: string } | null>(null);

  // Lấy token và user
  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("token") || undefined;
      setToken(t);
      if (t) {
        getMyInfo(t).then(setUser);
      }
    }
  }, []);

  // Lấy danh sách môn học
  useEffect(() => {
    async function fetchSubjects() {
      setLoading(true);
      try {
        const data = await getAllSubjects(token || undefined);
        setSubjects(data);
      } catch (e) {
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchSubjects();
  }, [token]);

  // Lấy danh sách câu hỏi khi chọn môn
  const handleSelectSubject = async (subjectId: number) => {
    setSelectedSubjectId(subjectId);
    setShowForm(false);
    setEditQuestionId(null);
    setForm(initialForm);
    const data = await getQuestionsBySubject(subjectId, token);
    setQuestions(data);
  };

  // Mở form thêm câu hỏi
  const handleAddQuestion = (subjectId: number) => {
    setSelectedSubjectId(subjectId);
    setShowForm(true);
    setEditQuestionId(null);
    setForm(initialForm);
  };

  // Mở form sửa câu hỏi
  const handleEdit = (question: QuestionType) => {
    setShowForm(true);
    setEditQuestionId(question.id ?? null);
    setForm({
      content: question.content,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || "",
      level: question.level || "EASY",
    });
  };

  // Xóa câu hỏi
  const handleDelete = async (questionId: number) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteQuestion(questionId, token);
      toast.success("Question deleted!");
      // Refresh lại danh sách
      if (selectedSubjectId) {
        const data = await getQuestionsBySubject(selectedSubjectId, token);
        setQuestions(data);
      }
    } catch (e) {
      toast.error("Delete failed!");
    }
  };

  // Thay đổi form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form (thêm hoặc sửa)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !user.username) {
      toast.error("Cannot find your username. Please login again.");
      return;
    }
    setSubmitting(true);
    try {
      if (editQuestionId && selectedSubjectId) {
        await updateQuestion(editQuestionId, {
          ...form,
          subjectId: selectedSubjectId,
          username: user.username,
        }, token);
        toast.success("Question updated successfully!");
      } else if (selectedSubjectId) {
        await addQuestion({
          ...form,
          subjectId: selectedSubjectId,
          username: user.username,
        }, token);
        toast.success("Question added successfully!");
      }
      setShowForm(false);
      setEditQuestionId(null);
      setForm(initialForm);
      // Refresh lại danh sách
      if (selectedSubjectId) {
        const data = await getQuestionsBySubject(selectedSubjectId, token);
        setQuestions(data);
      }
    } catch (err) {
      toast.error("An error occurred while saving the question.");
    } finally {
      setSubmitting(false);
    }
  };

  // Hủy form
  const handleCancel = () => {
    setShowForm(false);
    setEditQuestionId(null);
    setForm(initialForm);
  };

  return (
    <div className="max-w-2xl mx-auto mt-32 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Manage questions by subject</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <SubjectList
          subjects={subjects.filter(s => typeof s.id === 'number')}
          onSelect={handleSelectSubject}
          onAddQuestion={handleAddQuestion}
        />
      )}
      {selectedSubjectId && !showForm && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Question list</h2>
          <QuestionList
            questions={questions as any}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}
      {showForm && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">{editQuestionId ? "Edit question" : "Add question"}</h2>
          <QuestionForm
            form={form}
            onChange={handleChange}
            onSubmit={handleSubmit}
            submitting={submitting}
            onCancel={handleCancel}
            isEdit={!!editQuestionId}
          />
        </div>
      )}
    </div>
  );
}

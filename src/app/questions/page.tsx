"use client"
import React, { useState, useEffect } from "react";
import SubjectList from "@/components/Questions/SubjectList";
import QuestionList from "@/components/Questions/QuestionList";
import QuestionForm from "@/components/Questions/QuestionForm";
import useUndoRedoWithBackend from "@/utils/useUndoRedoWithBackend";
import axiosInstance from "@/utils/axiosInstance";
import { getMyInfo } from "../api/libApi/api";

export default function Page() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [username, setUsername] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const refreshQuestions = async () => {
    if (selectedSubject) {
      const res = await axiosInstance.get(`/questions/get-by-subject/${selectedSubject}`);
      setQuestions(res.data.result);
    }
  };

  const { canUndo, canRedo, undo, redo, refreshStates } = useUndoRedoWithBackend(username, refreshQuestions);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await getMyInfo(token);
        setUsername(res.username);
      } catch (err) {
        console.error("Failed to fetch user info", err);
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    axiosInstance
      .get("/classrooms/subjects")
      .then((res) => setSubjects(res.data.result))
      .catch((err) => console.error("Failed to fetch subjects", err));
  }, []);

  const handleSubjectSelect = (subjectId: number, subjectName: string) => {
    setSelectedSubject(subjectId);
    setSelectedSubjectName(subjectName);
    axiosInstance
      .get(`/questions/get-by-subject/${subjectId}`)
      .then((res) => setQuestions(res.data.result))
      .catch((err) => console.error("Failed to fetch questions", err));
  };

  const handleCreateOrUpdateQuestion = async (data: any) => {
    if (!selectedSubject) return;
    if (editingQuestion) {
      const res = await axiosInstance.put(`/questions/${editingQuestion.id}`, {
        ...data,
        subjectId: selectedSubject,
        username,
      });
      setQuestions((prev) =>
        prev.map((q) => (q.id === editingQuestion.id ? res.data.result : q))
      );
      setEditingQuestion(null);
    } else {
      const res = await axiosInstance.post(`/questions/create`, {
        ...data,
        subjectId: selectedSubject,
        username,
      });
      setQuestions((prev) => [...prev, res.data.result]);
    }
    await refreshStates();
  };

  const handleEditQuestion = (id: number) => {
    const question = questions.find((q) => q.id === id);
    if (question) setEditingQuestion(question);
    setIsModalOpen(false); // đóng modal khi edit
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!username) return;
    await axiosInstance.delete(`/questions/${username}/${id}/delete`);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    await refreshStates();
  };

  const filteredQuestions = questions.filter((q) => {
    const term = searchTerm.toLowerCase();
    return (
      q.content?.toLowerCase().includes(term) ||
      q.optionA?.toLowerCase().includes(term) ||
      q.optionB?.toLowerCase().includes(term) ||
      q.optionC?.toLowerCase().includes(term) ||
      q.optionD?.toLowerCase().includes(term) ||
      q.correctAnswer?.toLowerCase().includes(term) ||
      q.explanation?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen mt-24">
      <h1 className="text-2xl font-bold mb-6">Question Management</h1>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <h2 className="text-lg font-semibold mb-3">Subjects</h2>
          <SubjectList
            subjects={subjects}
            onSelect={handleSubjectSelect}
            selectedSubjectId={selectedSubject}
          />
        </div>

        <div className="col-span-9 space-y-6">
          {selectedSubject ? (
            <>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">
                  Questions for Subject: {selectedSubjectName}
                </h2>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg"
                >
                  Show Questions
                </button>
              </div>

              <QuestionForm
                initialData={editingQuestion || {}}
                onSubmit={handleCreateOrUpdateQuestion}
                onUndo={undo}
                onRedo={redo}
                canUndo={canUndo}
                canRedo={canRedo}
                onCancel={() => setEditingQuestion(null)}
              />
            </>
          ) : (
            <div className="text-gray-500 italic">
              Please select a subject to view questions.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-3/4 max-h-[80vh] overflow-y-auto rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Questions</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black">✕</button>
            </div>
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4 block w-full border rounded-lg p-2"
            />
            <QuestionList
              questions={filteredQuestions}
              onEdit={handleEditQuestion}
              onDelete={handleDeleteQuestion}
            />
          </div>
        </div>
      )}
    </div>
  );
}

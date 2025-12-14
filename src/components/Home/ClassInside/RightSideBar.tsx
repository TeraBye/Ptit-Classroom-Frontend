'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Client, Storage, ID } from "appwrite";
import { getMyInfo } from "@/app/api/libApi/api";
import axiosInstance from '@/utils/axiosInstance';
import { API_BASE_URL } from '@/app/api/libApi/api';
import { Card } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { toastError, toastSuccess } from '@/utils';
import { SubmitModal } from "@/components/Home/ClassInside/SubmitModal";
import JoinRequestSidebar from "@/components/Home/JoinRequest/JoinRequestSidebar";

// Modal review exam after create  
function ReviewExamModal({ open, onClose, examData }: {
  open: boolean;
  onClose: () => void;
  examData: any;
}) {
  if (!open || !examData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 flex flex-col max-h-[80vh]">
        {/* Tiêu đề */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold">{examData.exam.title}</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Thông tin exam */}
        <div className="mb-4 text-sm text-gray-600">
          <p>Thời lượng: {examData.exam.duration} phút</p>
          <p>Số câu hỏi: {examData.exam.numberOfQuestion}</p>
          <p>Thời gian bắt đầu: {new Date(examData.exam.beginTime).toLocaleString()}</p>
        </div>

        {/* Danh sách câu hỏi (cuộn được) */}
        <div className="flex-1 overflow-y-auto pr-2">
          {examData.questions.map((q: any, idx: number) => (
            <div key={q.id} className="mb-4 border-b pb-3">
              <p className="font-medium">
                {idx + 1}. {q.content}
              </p>
              <ul className="list-disc list-inside text-sm mt-1">
                <li>A: {q.optionA}</li>
                <li>B: {q.optionB}</li>
                <li>C: {q.optionC}</li>
                <li>D: {q.optionD}</li>
              </ul>
              <p className="mt-1 text-green-600 text-sm">
                ✅ Đáp án đúng: {q.correctAnswer}
              </p>
              {q.explanation && (
                <p className="text-xs text-gray-500 mt-1">
                  Giải thích: {q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Nút đóng */}
        <div className="flex justify-end mt-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
//Model review exam
interface Exam {
  id: number;
  title: string;
  beginTime: string;
  numberOfQuestion: number;
}

interface StudentExam {
  id: number;
  student: string;
  startedAt: string;
  submittedAt: string;
  score: number;
  fullName: string;
}

interface StudentAnswer {
  id: number;
  questionId: number;
  selectedOption: string | null;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation?: string;
}

interface ExamReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
  user: any;
}

export default function ExamReviewModal({ isOpen, onClose, classId, user }: ExamReviewModalProps) {
  const [viewLevel, setViewLevel] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<StudentExam[]>([]);
  const [answers, setAnswers] = useState<StudentAnswer[]>([]);

  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentExam | null>(null);

  const router = useRouter();

  const [problemExams, setProblemExams] = useState<number[]>([]); // danh sách examId bị isProblemExam=false

  useEffect(() => {
    if (user?.role === "STUDENT" && exams.length > 0) {
      const token = localStorage.getItem("token");
      if (!token) return;

      const fetchStatuses = async () => {
        try {
          const results = await Promise.all(
            exams.map(async (exam) => {
              const res = await fetch(
                `http://localhost:8888/api/exam/isProblemExam?student=${user.username}&examId=${exam.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              const data = await res.json();
              // Nếu isProblemExam = false => đã nộp
              return !data?.result?.isProblemExam ? exam.id : null;
            })
          );

          setProblemExams(results.filter((id) => id !== null) as number[]);
        } catch (error) {
          console.error("Error checking problem exams:", error);
        }
      };

      fetchStatuses();
    }
  }, [user, exams]);

  // Lấy danh sách bài thi (Level 1)
  useEffect(() => {
    if (isOpen && viewLevel === 1) {
      setLoading(true);
      const token = localStorage.getItem("token");
      fetch(`http://localhost:8888/api/exam/getExamsByClass?classId=${classId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      })
        .then(res => res.json())
        .then(data => {
          const sorted = (data.result || []).sort(
            (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setExams(sorted);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, classId, viewLevel]);

  // Lấy danh sách học sinh (Level 2)
  const loadStudents = (exam: Exam) => {
    setSelectedExam(exam);
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8888/api/exam/getExamsByExamId?examId=${exam.id}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
      }
    })
      .then(res => res.json())
      .then(data => {
        setStudents(data.result || []);
        setViewLevel(2);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  // Lấy chi tiết bài làm (Level 3)
  const loadAnswers = (student: StudentExam) => {
    setSelectedStudent(student);
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8888/api/exam/getStudentAnswer?student=${student.student}&examId=${selectedExam?.id}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
      }
    })
      .then(res => res.json())
      .then(data => {
        setAnswers(data.result.answers || []);
        setViewLevel(3);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 8H7a2 2 0 01-2-2V6a2 2 0 012-2h3l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2z" />
            </svg>
            {viewLevel === 1 && "Exams"}
            {viewLevel === 2 && `Students in "${selectedExam?.title}"`}
            {viewLevel === 3 && `Answers of ${selectedStudent?.fullName}`}
          </h2>
          <div className="flex gap-2">
            {viewLevel > 1 && (
              <button
                onClick={() => setViewLevel(prev => (prev === 3 ? 2 : 1))}
                className="px-3 py-1 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition"
              >
                ← Back
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white text-2xl hover:bg-white/20 rounded-full w-9 h-9 flex items-center justify-center"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <svg className="animate-spin h-7 w-7 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            </div>
          ) : viewLevel === 1 ? (
            exams.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No exams found</div>
            ) : (
              <div className="flex flex-col gap-4">
                {exams.map(exam => (
                  <button
                    key={exam.id}
                    className={`w-full text-left rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition p-4 ${user?.role === "STUDENT" && new Date().getTime() - new Date(exam.beginTime).getTime() > 6 * 60 * 60 * 1000 ? "bg-red-50 cursor-not-allowed" : problemExams.includes(exam.id) ? "bg-yellow-50 cursor-not-allowed" : "hover:border-blue-400"}`}
                    onClick={() => {
                      if (user?.role === "TEACHER") {
                        loadStudents(exam);
                      } else {
                        const isExpired = new Date().getTime() - new Date(exam.beginTime).getTime() > 6 * 60 * 60 * 1000;
                        if (isExpired || problemExams.includes(exam.id)) return;
                        router.push(`/exam/${exam.id}`);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 8H7a2 2 0 01-2-2V6a2 2 0 012-2h3l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-blue-700 text-lg truncate">{exam.title}</h3>
                        <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600">
                          <span>📅 {new Date(exam.beginTime).toLocaleString()}</span>
                          <span>📝 {exam.numberOfQuestion} questions</span>
                        </div>
                      </div>
                      {problemExams.includes(exam.id) && (
                        <span className="text-sm font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded">Submitted</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : viewLevel === 2 ? (
            students.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No students found</div>
            ) : (
              <div className="flex flex-col gap-4">
                {students.map(stu => (
                  <button
                    key={stu.id}
                    className="w-full text-left rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition p-4"
                    onClick={() => loadAnswers(stu)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                        <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-green-700 text-lg truncate">{stu.fullName}</h3>
                        <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600">
                          <span>⏱ Started: {new Date(stu.startedAt).toLocaleString()}</span>
                          <span>✅ Score: {stu.score}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-4">
              {answers.map(ans => {
                let optionStyle = (opt: string) => {
                  if (ans.correctAnswer === opt && ans.selectedOption === opt) return "bg-green-100 border-green-300";
                  if (ans.correctAnswer === opt && ans.selectedOption !== opt && ans.selectedOption !== null) return "bg-green-50 border-green-200";
                  if (ans.selectedOption === opt && ans.correctAnswer !== opt) return "bg-red-100 border-red-300";
                  if (ans.correctAnswer === opt && ans.selectedOption === null) return "bg-yellow-100 border-yellow-300";
                  return "bg-gray-50 border-gray-200";
                };
                return (
                  <div key={ans.id} className="border rounded-lg p-4 bg-white shadow-sm">
                    <p className="font-semibold text-gray-800 mb-3">{ans.content}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {(["A", "B", "C", "D"] as const).map(opt => (
                        <div
                          key={opt}
                          className={`p-3 border rounded-lg flex items-center gap-2 ${optionStyle(opt)}`}
                        >
                          <span className="font-bold text-gray-700">{opt}:</span>
                          <span className="text-sm">{ans[`option${opt}` as keyof StudentAnswer]}</span>
                          {ans.correctAnswer === opt && (
                            <span className="ml-auto text-green-600 font-bold">✔</span>
                          )}
                          {ans.selectedOption === opt && ans.correctAnswer !== opt && (
                            <span className="ml-auto text-red-500 font-bold">✗</span>
                          )}
                        </div>
                      ))}
                    </div>
                    {ans.explanation && (
                      <div className="mt-3 text-sm text-gray-600 italic">Giải thích: {ans.explanation}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-100 border-t flex justify-end rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
// Modal tạo exam
function NewExamModal({
  open,
  onClose,
  teacherId,
  onExamCreated
}: {
  open: boolean;
  onClose: () => void;
  teacherId: string;
  onExamCreated: (data: any) => void; 
}) {
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [beginDate, setBeginDate] = useState(""); // datetime-local string
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [duration, setDuration] = useState<number>(15);
  const [notes, setNotes] = useState<string>("");
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const params = useParams();

  useEffect(() => {
    if (!open || !teacherId) return;

    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const url = `http://localhost:8888/api/classrooms/subjects?username=${teacherId}`;
        const res = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
        const data = await res.json();
        if (data.code === 0) {
          const subjectList = data.result?.content || data.result || [];
          setSubjects(Array.isArray(subjectList) ? subjectList : []);
        } else {
          setSubjects([]);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setSubjects([]);
      }
    };

    fetchSubjects();
  }, [open, teacherId]);

  const isFormValid = () => {
    return (
      title.trim().length > 0 &&
      beginDate.trim().length > 0 &&
      selectedSubjectId !== null &&
      numQuestions > 0 &&
      duration > 0
    );
  };

  const handleCreateExam = async () => {
    if (!isFormValid()) {
      toastError('Please fill all required fields');
      return;
    }

    const id = params.classId;
    setCreateLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const body = {
        title: title.trim(),
        createdAt: new Date().toISOString(),
        duration,
        numberOfQuestion: numQuestions,
        beginTime: new Date(beginDate).toISOString(),
        teacher: teacherId,
        classId: id,
        subjectId: selectedSubjectId,
        notes: notes.trim() || undefined
      };

      const res = await fetch("http://localhost:8888/api/exam/createExam", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.code === 0) {
        onClose();
        onExamCreated(data.result);
      } else {
        toastError(data.message || "Failed to create exam");
      }
    } catch (error) {
      console.error("Error creating exam:", error);
      toastError('Network error while creating exam');
    } finally {
      setCreateLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden grid grid-cols-12">
        {/* Left: visual summary */}
        <div className="col-span-5 bg-gradient-to-b from-sky-600 to-indigo-600 text-white p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 8H7a2 2 0 01-2-2V6a2 2 0 012-2h3l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Create Exam</h3>
                <p className="text-sm opacity-90">Design professional, timed assessments easily.</p>
              </div>
            </div>

            <div className="mt-4 bg-white/10 rounded-lg p-4">
              <p className="text-xs uppercase opacity-80 mb-2">Preview</p>
              <h4 className="font-semibold text-lg">{title || 'Untitled Exam'}</h4>
              <p className="text-sm opacity-90 mt-1">Subject: {subjects.find(s => s.id === selectedSubjectId)?.name || 'To be selected'}</p>
              <p className="text-sm opacity-90 mt-1">Start: {beginDate ? new Date(beginDate).toLocaleString() : 'Not set'}</p>
              <p className="text-sm opacity-90 mt-1">Duration: {duration} min • Questions: {numQuestions}</p>
            </div>
          </div>

          <p className="text-xs opacity-80">Tip: Schedule exams ahead of time and attach instructions for students.</p>
        </div>

        {/* Right: form */}
        <div className="col-span-7 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold">New Exam</h2>
              <p className="text-sm text-gray-500 mt-1">Fill required fields and create a scheduled assessment.</p>
            </div>
            <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
              <input
                aria-label="Exam title"
                className="mt-1 block w-full border rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="E.g. Midterm - Chapter 1-4"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Start (date & time) <span className="text-red-500">*</span></label>
              <input
                aria-label="Begin date and time"
                type="datetime-local"
                className="mt-1 block w-full border rounded-md p-2 shadow-sm"
                value={beginDate}
                onChange={(e) => setBeginDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Subject <span className="text-red-500">*</span></label>
              <select
                className="mt-1 block w-full border rounded-md p-2 shadow-sm"
                value={selectedSubjectId ?? ""}
                onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : null)}
                aria-label="Select subject"
              >
                <option value="">Select subject</option>
                {(Array.isArray(subjects) ? subjects : []).map((subj) => (
                  <option key={subj.id} value={subj.id}>{subj.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Duration (minutes) <span className="text-red-500">*</span></label>
              <input
                aria-label="Duration in minutes"
                type="number"
                min={1}
                className="mt-1 block w-full border rounded-md p-2 shadow-sm"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Number of Questions <span className="text-red-500">*</span></label>
              <input
                aria-label="Number of questions"
                type="number"
                min={1}
                className="mt-1 block w-full border rounded-md p-2 shadow-sm"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Instructions (optional)</label>
              <textarea
                aria-label="Exam instructions"
                className="mt-1 block w-full border rounded-md p-2 shadow-sm"
                rows={3}
                placeholder="Add details for students, rules, or materials allowed."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button onClick={onClose} disabled={createLoading} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200">Cancel</button>
            <button
              onClick={handleCreateExam}
              disabled={!isFormValid() || createLoading}
              className={`px-4 py-2 rounded-md text-white flex items-center gap-2 ${isFormValid() && !createLoading ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-300 cursor-not-allowed'}`}
            >
              {createLoading ? (
                <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              ) : null}
              {createLoading ? 'Creating...' : 'Create Exam'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main RightSidebar
export function RightSidebar() {
  const [user, setUser] = useState<any>(null);
  const [openNewExamModal, setOpenNewExamModal] = useState(false);
  const [reviewData, setReviewData] = useState<any>(null);
  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  // assignments for student view
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignTab, setAssignTab] = useState<'ALL' | 'SUBMITTED' | 'NOT_SUBMITTED'>('ALL');
  const [assignPage, setAssignPage] = useState(0);
  const [assignTotalPages, setAssignTotalPages] = useState(1);
  const assignContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // inline submit modal state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitAssign, setSubmitAssign] = useState<any | null>(null);
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showJoinRequests, setShowJoinRequests] = useState(false);
  const [isPrivateClassroom, setIsPrivateClassroom] = useState(false);

  const params = useParams();
  const id = params.classId;
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const userData = await getMyInfo(token);
        setUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (user && user.role !== "TEACHER" && showJoinRequests) {
      setShowJoinRequests(false);
    }
  }, [user, showJoinRequests]);

  useEffect(() => {
    if (!isPrivateClassroom && showJoinRequests) {
      setShowJoinRequests(false);
    }
  }, [isPrivateClassroom, showJoinRequests]);

  useEffect(() => {
    const fetchClassroomInfo = async () => {
      if (!id) return;
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get(
          `/classrooms/${id}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
        );
        const cls = res.data?.result ?? res.data ?? null;
        const privateFlag =
          typeof cls?.public !== "undefined"
            ? !cls.public
            : typeof cls?.isPublic !== "undefined"
              ? !cls.isPublic
              : false;
        setIsPrivateClassroom(privateFlag);
      } catch (err) {
        console.error("Error loading classroom info:", err);
        setIsPrivateClassroom(false);
      }
    };

    fetchClassroomInfo();
  }, [id]);

  // load student assignments for this classroom (only for STUDENT role)
  useEffect(() => {
    // If not a student, skip loading student assignments entirely
    if (!user || user?.role !== 'STUDENT') {
      setAssignments([]);
      setAssignPage(0);
      setAssignTotalPages(1);
      setAssignLoading(false);
      return;
    }

    // load page 0 when user/id/tab changes
    setAssignments([]);
    setAssignPage(0);
    setAssignTotalPages(1);

    const loadAssignments = async (page = 0, status?: string, append = false) => {
      if (!user || !id) return;
      try {
        if (append) setIsLoadingMore(true); else setAssignLoading(true);
        const token = localStorage.getItem('token');
        const size = 6; // page size
        const params: string[] = [`studentUsername=${user.username}`, `classroomId=${id}`, `page=${page}`, `size=${size}`];
        if (status && status !== 'ALL') params.push(`status=${status}`);
        const url = `${API_BASE_URL}/assignments/student?${params.join('&')}`;
        const res = await axiosInstance.get(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const pageData = res.data?.result ?? null;
        const data = pageData?.content ?? [];

        if (append) {
          setAssignments(prev => {
            const prevIds = new Set(prev.map((p: any) => (p.assignment?.id ?? p.id)));
            const filtered = data.filter((d: any) => !prevIds.has(d.assignment?.id ?? d.id));
            return [...prev, ...filtered];
          });
        } else {
          setAssignments(data);
        }

        const resolvedPage = pageData?.number ?? pageData?.pageable?.pageNumber ?? page;
        const resolvedTotal = pageData?.totalPages ?? pageData?.pageable?.totalPages ?? 1;
        setAssignPage(resolvedPage);
        setAssignTotalPages(resolvedTotal);
      } catch (err) {
        console.error(err);
        toastError((err as any)?.response?.data?.message || 'Failed to load assignments');
      } finally {
        setAssignLoading(false);
        setIsLoadingMore(false);
      }
    };

    // initial load
    loadAssignments(0, assignTab === 'ALL' ? undefined : assignTab, false);

    // expose load more on ref for scroll handler
    (assignContainerRef as any).currentLoadMore = async (nextPage: number) => {
      await loadAssignments(nextPage, assignTab === 'ALL' ? undefined : assignTab, true);
    };
  }, [user, id, assignTab]);

  // infinite scroll: fetch next page when scrolled near bottom
  useEffect(() => {
    const el = assignContainerRef.current;
    if (!el) return;

    const onScroll = () => {
      if (assignLoading || isLoadingMore) return;
      if (assignPage + 1 >= assignTotalPages) return;
      const scrollBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (scrollBottom < 120) {
        const next = assignPage + 1;
        // call loader attached above
        (assignContainerRef as any).currentLoadMore?.(next);
      }
    };

    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [assignLoading, assignPage, assignTotalPages, assignModalOpen]);

  // Appwrite client for uploading files (used for inline submit)
  const appwriteClient = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("67f02a3c00396aab7f01");
  const storage = new Storage(appwriteClient);
  const BUCKET_ID = "67f02a57000c66380420";
  const ProjectID = "67f02a3c00396aab7f01";

  const uploadFileToAppwrite = async (file: File) => {
    const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
    return `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${response.$id}/view?project=${ProjectID}`;
  };

  const handleOpenSubmit = async (asg: any) => {
    setSubmitAssign(asg);
    setSubmitLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.get(`${API_BASE_URL}/assignments/${asg.id}/get-submission?studentUsername=${user?.username}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (res.data?.result && res.data.result.id) {
        setSubmittedData(res.data.result);
      } else {
        setSubmittedData(null);
      }
      setSubmitModalOpen(true);
    } catch (err) {
      console.error('Error fetching submission', err);
      setSubmittedData(null);
      setSubmitModalOpen(true);
    } finally {
      setSubmitLoading(false);
    }
  };

  const reloadAssignments = async () => {
    if (!user || !id) return;
    try {
      setAssignLoading(true);
      const token = localStorage.getItem('token');
      const size = 6;
      const params: string[] = [`studentUsername=${user.username}`, `classroomId=${id}`, `page=0`, `size=${size}`];
      if (assignTab && assignTab !== 'ALL') params.push(`status=${assignTab}`);
      const url = `${API_BASE_URL}/assignments/student?${params.join('&')}`;
      const res = await axiosInstance.get(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const pageData = res.data?.result ?? null;
      const data = pageData?.content ?? [];
      setAssignments(data);
      const resolvedPage = pageData?.number ?? pageData?.pageable?.pageNumber ?? 0;
      const resolvedTotal = pageData?.totalPages ?? pageData?.pageable?.totalPages ?? 1;
      setAssignPage(resolvedPage);
      setAssignTotalPages(resolvedTotal);
    } catch (err) {
      console.error(err);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleSubmit = async (note: string, file: File | null) => {
    if (!submitAssign) return;
    try {
      setSubmitLoading(true);
      let fileUrl = "";
      if (file) {
        fileUrl = await uploadFileToAppwrite(file);
      }
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/assignments/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          assignmentId: submitAssign.id,
          studentUsername: user?.username,
          note,
          fileUrl,
        }),
      });

      setSubmitModalOpen(false);
      setSubmitAssign(null);
      setSubmittedData(null);
      // reload assignments to reflect submission
      await reloadAssignments();
      toastSuccess('Submitted successfully');
    } catch (err) {
      console.error(err);
      toastError('Failed to submit');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="w-full md:w-64 flex flex-col gap-4">
      <div className="p-4 text-center border rounded">
        <Image
          src="https://i.pinimg.com/736x/4f/d3/b8/4fd3b89d34c0bb77aaae041dbb3b717a.jpg"
          alt="Workwise"
          width={50}
          height={50}
          className="mx-auto"
        />
        <h3 className="mt-2 font-semibold">EXAM</h3>
        <p className="text-xs text-gray-500">
          You currently have no exams.
        </p>

        {user?.role === "TEACHER" ? (
          <button
            className="mt-3 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            onClick={() => setOpenNewExamModal(true)}
          >
            New exam
          </button>
        ) : (
          <button className="mt-3 w-full border py-2 px-4 rounded"
            onClick={() => setReviewOpen(true)}
          >Do exam</button>
        )}

        <div>
          {/* Nút mở modal */}
          {user?.role === "TEACHER" && (
            <button
              onClick={() => setReviewOpen(true)}
              className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Review exams
            </button>
          )}

          {/* Popup */}
          <ExamReviewModal
            isOpen={reviewOpen}
            onClose={() => setReviewOpen(false)}
            classId={Number(id)}
            user={user}
          />
        </div>
      </div>

      {user?.role === "TEACHER" && isPrivateClassroom && (
        <Card className="p-4">
          <h4 className="font-semibold mb-2">Join requests</h4>
          <p className="text-sm text-gray-500 mb-3">
            Review who wants to join this classroom and approve or reject them.
          </p>
          <button
            className="w-full px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={!user?.username}
            onClick={() => setShowJoinRequests(true)}
          >
            Manage requests
          </button>
        </Card>
      )}

      {user?.role === 'STUDENT' && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Assignments</h4>
            <div className="text-sm text-gray-500">{assignments.length} items</div>
          </div>

          {/* Tabs moved into modal to avoid duplication */}

          <div className="text-sm">
            {assignLoading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : (
              <div className="mb-2 text-gray-600">{assignments.length} assignments</div>
            )}
            <button onClick={() => setAssignModalOpen(true)} disabled={assignLoading} className={`w-full px-3 py-2 ${assignLoading ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white'} rounded`}>Open assignments</button>
          </div>
        </Card>
      )}

      {isPrivateClassroom && (
        <JoinRequestSidebar
          classroomId={id ? Number(id) : null}
          show={showJoinRequests}
          onClose={() => setShowJoinRequests(false)}
          username={user?.username || null}
        />
      )}

      {/* Assignments modal (large view) */}
      {user?.role === 'STUDENT' && assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg p-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Assignments</h3>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-500">{assignments.length} items</div>
                <button onClick={() => setAssignModalOpen(false)} className="px-3 py-1 bg-gray-200 rounded">Close</button>
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              {(['ALL', 'NOT_SUBMITTED', 'SUBMITTED'] as const).map(tab => (
                <button key={tab} onClick={() => setAssignTab(tab)} className={`px-3 py-1 rounded text-sm ${assignTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  {tab === 'ALL' ? 'All' : tab === 'NOT_SUBMITTED' ? 'Not submitted' : 'Submitted'}
                </button>
              ))}
            </div>

            <div ref={assignContainerRef} className="overflow-y-auto flex-1 space-y-3">
              {assignLoading ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : assignments.length === 0 ? (
                <div className="text-sm text-gray-500">No assignments</div>
              ) : (
                assignments.map((item: any) => {
                  const asg = item.assignment || item;
                  const status = item.status;
                  const submission = item.submission;
                  const dueDate = new Date(asg.deadline);
                  const now = new Date();
                  const diffMs = dueDate.getTime() - now.getTime();
                  const isUrgent = status === 'NOT_SUBMITTED' && diffMs > 0 && diffMs < 24 * 60 * 60 * 1000;
                  return (
                    <div key={asg.id} className={`border rounded p-3 ${isUrgent ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className={`font-medium ${isUrgent ? 'text-red-600' : ''}`}>{asg.name}</div>
                          <div className="text-xs text-gray-500">Due: {asg.deadline}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${status === 'NOT_SUBMITTED' ? 'text-gray-500' : status === 'LATE' ? 'text-red-500' : 'text-green-600'}`}>
                            {status === 'NOT_SUBMITTED' ? 'Not submitted' : status === 'LATE' ? 'Late' : 'Submitted'}
                          </div>
                          <div className="text-xs text-gray-400">{submission ? 'Submitted at ' + submission.submitTime : '—'}</div>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          {asg.fileUrl && (
                            <a href={asg.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">📄 View assignment</a>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {submission ? (
                            <button onClick={() => { setAssignModalOpen(false); router.push(`/class-inside/${asg.classroomId}`); }} className="px-3 py-1 text-sm bg-gray-100 rounded">View</button>
                          ) : (
                            <button onClick={() => handleOpenSubmit(asg)} className="px-3 py-1 text-sm bg-blue-500 text-white rounded">Submit</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {isLoadingMore && (
                <div className="py-3 text-center text-sm text-gray-500">Loading more...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inline Submit Modal */}
      {submitModalOpen && (
        <SubmitModal
          onClose={() => setSubmitModalOpen(false)}
          onSubmit={handleSubmit}
          submittedData={submittedData}
          disabled={submitLoading}
        />
      )}

      {/* Popup Tạo exam */}
      <NewExamModal
        open={openNewExamModal}
        onClose={() => setOpenNewExamModal(false)}
        teacherId={user?.username || ""}
        onExamCreated={(data) => {
          setReviewData(data);
          setOpenReviewModal(true);
        }}
      />

      {/* Popup Review exam */}
      <ReviewExamModal
        open={openReviewModal}
        onClose={() => setOpenReviewModal(false)}
        examData={reviewData}
      />
    </div>
  );
}

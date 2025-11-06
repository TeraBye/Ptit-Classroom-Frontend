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
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-blue-500 text-white rounded-t-xl">
          <h2 className="text-lg font-semibold">
            {viewLevel === 1 && "Exams"}
            {viewLevel === 2 && `👨‍🎓 Students in "${selectedExam?.title}"`}
            {viewLevel === 3 && `📄 Answers of ${selectedStudent?.fullName}`}
          </h2>
          <div className="flex gap-2">
            {viewLevel > 1 && (
              <button
                onClick={() => setViewLevel(prev => (prev === 3 ? 2 : 1))}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                ⬅ Back
              </button>
            )}
            <button
              onClick={onClose}
              className="hover:bg-blue-600 rounded-full p-1 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : viewLevel === 1 ? (
            exams.length === 0 ? (
              <p className="text-center text-gray-500">No exams found</p>
            ) : (
              exams.map(exam => (
                <button
                  key={exam.id}
                  className={`w-full text-left border rounded-lg p-3 transition ${user?.role === "STUDENT" &&
                    new Date().getTime() - new Date(exam.beginTime).getTime() > 6 * 60 * 60 * 1000
                    ? "bg-red-100 cursor-not-allowed"
                    : problemExams.includes(exam.id)
                      ? "bg-yellow-100 cursor-not-allowed"
                      : "bg-gray-50 hover:bg-blue-50 hover:shadow-md"
                    }`}
                  onClick={() => {
                    if (user?.role === "TEACHER") {
                      loadStudents(exam);
                    } else {
                      const isExpired =
                        new Date().getTime() - new Date(exam.beginTime).getTime() >
                        6 * 60 * 60 * 1000;
                      if (isExpired || problemExams.includes(exam.id)) return; // Không cho click

                      router.push(`/exam/${exam.id}`);
                    }
                  }}
                >
                  <h3 className="font-semibold text-blue-700">{exam.title}</h3>
                  <p className="text-sm text-gray-600">📅 {new Date(exam.beginTime).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">📝 {exam.numberOfQuestion} questions</p>
                  {problemExams.includes(exam.id) && (
                    <p className="text-sm font-semibold text-yellow-700">✅ Submitted</p>
                  )}
                </button>
              ))
            )
          ) : viewLevel === 2 ? (
            students.length === 0 ? (
              <p className="text-center text-gray-500">No students found</p>
            ) : (
              students.map(stu => (
                <button
                  key={stu.id}
                  className="w-full text-left border rounded-lg p-3 bg-gray-50 hover:bg-green-50 hover:shadow-md transition"
                  onClick={() => loadAnswers(stu)}
                >
                  <h3 className="font-semibold text-green-700">{stu.fullName}</h3>
                  <p className="text-sm text-gray-600">⏱ Started: {new Date(stu.startedAt).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">✅ Score: {stu.score}</p>
                </button>
              ))
            )
          ) : (
            <div className="space-y-4">
              {answers.map(ans => {
                let optionStyle = (opt: string) => {
                  if (ans.correctAnswer === opt && ans.selectedOption === opt) return "bg-green-200"; // đúng
                  if (ans.correctAnswer === opt && ans.selectedOption !== opt && ans.selectedOption !== null) return "bg-green-200"; // câu đúng
                  if (ans.selectedOption === opt && ans.correctAnswer !== opt) return "bg-red-200"; // sai
                  if (ans.correctAnswer === opt && ans.selectedOption === null) return "bg-yellow-200"; // chưa trả lời
                  return "";
                };

                return (
                  <div key={ans.id} className="border p-3 rounded-lg">
                    <p className="font-medium">{ans.content}</p>
                    <div className="mt-2 space-y-1">
                      {(["A", "B", "C", "D"] as const).map(opt => (
                        <div
                          key={opt}
                          className={`p-2 border rounded ${optionStyle(opt)}`}
                        >
                          <strong>{opt}:</strong> {ans[`option${opt}` as keyof StudentAnswer]}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
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
  const [beginDate, setBeginDate] = useState("");
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [duration, setDuration] = useState<number>(15);
  const params = useParams();

  useEffect(() => {
    if (!open) return;

    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:8888/api/classrooms/subjects", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.code === 0) {
          setSubjects(data.result);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, [open]);

  const handleCreateExam = async () => {

    const id = params.classId;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const body = {
        title,
        createdAt: new Date().toISOString(),
        duration,
        numberOfQuestion: numQuestions,
        beginTime: new Date(beginDate).toISOString(),
        teacher: teacherId,
        classId: id,
        subjectId: selectedSubjectId
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
        toastError("Failed to create exam");
      }
    } catch (error) {
      console.error("Error creating exam:", error);
    }
  };


  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg flex overflow-hidden">
        {/* Bên trái */}
        <div className="bg-teal-500 text-white p-8 w-1/3 flex flex-col justify-center items-center">
          <div className="text-2xl font-bold mb-4">Create new Exam</div>
          <p className="text-sm text-center">
            Create periodic tests to assess student learning.
            The system will automatically collect and grade the tests when time is up.
          </p>
        </div>

        {/* Bên phải */}
        <div className="p-8 w-2/3">
          <h2 className="text-xl font-semibold mb-4">
            New Exam
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="date"
              className="border rounded p-2 w-full"
              value={beginDate}
              onChange={(e) => setBeginDate(e.target.value)}
            />
            <input
              type="text"
              className="border rounded p-2 w-full"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="number"
              min={1}
              className="border rounded p-2 w-full"
              placeholder="Number of Questions"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
            />
            <input
              type="number"
              min={0}
              className="border rounded p-2 w-full"
              placeholder="Duration (minutes)"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>

          <select
            className="border rounded p-2 w-full mb-4"
            onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
          >
            <option value="">Select subject</option>
            {subjects.map((subj) => (
              <option key={subj.id} value={subj.id}>
                {subj.name}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-2">
            <button
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
              onClick={handleCreateExam}
            >
              Create Exam
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

      {/* Assignments modal (large view) */}
      {assignModalOpen && (
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

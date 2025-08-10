"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/untils";
import { useParams } from "next/navigation";
import { getMyInfo } from "@/app/api/libApi/api";

const letterMap = ["A", "B", "C", "D", "E", "F"];

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export default function Quiz() {
  const [questions, setQuestions] = useState<
    { question: string; options: string[]; id: number }[]
  >([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [examSubmissionId, setExamSubmissionId] = useState<number | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [duration, setDuration] = useState<number>(15);
  const [isSubmitted, setIsSubmitted] = useState(false); // ✅ Thêm biến để chặn timer sau khi nộp

  const params = useParams();
  const examId = params.examId;

  const [user, setUser] = useState<any>(null);

  // Lấy thông tin user
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const userData = await getMyInfo(token);
        setUser(userData);
      } catch (error) {
        console.error("Error ", error);
      }
    };

    fetchData();
  }, []);

  // Lấy đề và câu trả lời đã lưu
  useEffect(() => {
    if (!user) return;
    const fetchQuestions = async () => {
      try {
        const res = await fetch(
          `http://localhost:8888/api/exam/getStudentAnswer?student=${user.username}&examId=${examId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await res.json();

        const q = data.result.answers.map((item: any) => ({
          id: item.questionId,
          question: item.content,
          options: [item.optionA, item.optionB, item.optionC, item.optionD],
          selectedOption: item.selectedOption,
        }));

        setQuestions(q);
        setAnswers(q.map((item: any) => item.selectedOption || null));
        setExamSubmissionId(data.result.examSubmission.id);

        const durationMinutes = data.result.examSubmission.duration || 15;
        setDuration(durationMinutes);
        const examTimeSeconds = data.result.examSubmission.examTime || 0;
        const calculatedTimeLeft = durationMinutes * 60 - examTimeSeconds;
        setTimeLeft(Math.max(calculatedTimeLeft, 0));
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [user, examId]);

  // Chạy đếm ngược
  useEffect(() => {
    if (loading || questions.length === 0 || isSubmitted) return; // ✅ Chặn timer nếu đã nộp bài

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, questions.length, isSubmitted]);

  const updateAnswerToServer = async (questionId: number, selectedOption: string | null) => {
    if (!selectedOption || !examSubmissionId) return;
    const durationInSeconds = duration * 60 || 0;
    const examTime = durationInSeconds - timeLeft;

    try {
      await fetch("http://localhost:8888/api/exam/updateAnswer", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          examSubmissionId,
          questionId,
          selectedOption,
          examTime,
        }),
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật câu trả lời:", error);
    }
  };

  const updateExamSubmission = async () => {
    try {
      const res = await fetch(
        `http://localhost:8888/api/exam/updateExamSubmission?student=${user.username}&examId=${examId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json();
      setResultData(data.result);
      setShowResultModal(true);
      setIsSubmitted(true); // ✅ Đánh dấu đã nộp
    } catch (error) {
      console.error("Lỗi khi cập nhật bài thi:", error);
    }
  };

  const handleOptionSelect = (letter: string) => {
    const newAnswers = [...answers];
    newAnswers[current] = letter;
    setAnswers(newAnswers);

    const questionId = questions[current].id;
    updateAnswerToServer(questionId, letter);
  };

  const handleNext = () => {
    const questionId = questions[current].id;
    const selectedOption = answers[current];
    updateAnswerToServer(questionId, selectedOption);

    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    const questionId = questions[current].id;
    const selectedOption = answers[current];
    updateAnswerToServer(questionId, selectedOption);

    if (current > 0) setCurrent(current - 1);
  };

  const handleJumpTo = (index: number) => {
    const questionId = questions[current].id;
    const selectedOption = answers[current];
    updateAnswerToServer(questionId, selectedOption);

    setCurrent(index);
  };

  const handleSubmit = () => {
    updateExamSubmission();
  };

  const handleAutoSubmit = () => {
    setIsTimeUp(true);
    updateExamSubmission();
  };

  if (loading) {
    return <div className="text-center py-10">Đang tải đề thi...</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white shadow rounded-md relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📝 Làm bài thi</h1>
        <div className="text-lg font-semibold text-red-600 bg-red-100 px-4 py-2 rounded shadow">
          ⏳ {formatTime(timeLeft)}
        </div>
      </div>

      {/* Nút chọn câu */}
      <div className="overflow-x-auto mb-6">
        <div className="flex gap-2 w-max">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => handleJumpTo(index)}
              className={cn(
                "w-10 h-10 rounded-full text-sm border flex items-center justify-center",
                answers[index]
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-800 border-gray-300",
                current === index && "ring-2 ring-yellow-500"
              )}
              disabled={isTimeUp}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Nội dung câu hỏi */}
      <div className="text-sm text-gray-500 mb-2">
        Câu {current + 1}/{questions.length}
      </div>
      <h2 className="text-xl font-semibold mb-4">
        {questions[current]?.question}
      </h2>

      {/* Danh sách đáp án */}
      <div className="space-y-3 w-full">
        {questions[current]?.options.map((opt, idx) => {
          const letter = letterMap[idx];
          return (
            <div
              key={idx}
              className={cn(
                "w-full p-3 border rounded-md cursor-pointer transition-all",
                answers[current] === letter
                  ? "border-yellow-500 bg-yellow-100"
                  : "hover:bg-gray-50",
                isTimeUp && "cursor-not-allowed opacity-60"
              )}
              onClick={() => !isTimeUp && handleOptionSelect(letter)}
            >
              <span className="block w-full">
                <strong>{letter}.</strong> {opt}
              </span>
            </div>
          );
        })}
      </div>

      {/* Điều hướng */}
      <div className="mt-6 flex justify-between">
        <Button onClick={handleBack} disabled={current === 0 || isTimeUp} variant="outline">
          Back
        </Button>
        <Button onClick={handleNext} disabled={!answers[current] || isTimeUp}>
          {current === questions.length - 1 ? "Submit" : "Forward"}
        </Button>
      </div>

      {/* Popup kết quả */}
      {showResultModal && resultData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-green-600 mb-4"> Hoàn thành bài thi!</h2>
            <p className="text-lg mb-2">Điểm số: <strong>{resultData.score}</strong></p>
            <p className="mb-1">
              Số câu đúng: <strong>{resultData.numberOfCorrectAnswers}/{questions.length}</strong>
            </p>
            <p className="mb-1">
              ⏱️ Thời gian làm bài:{" "}
              <strong>
                {`${Math.floor(resultData.examTime / 60)} phút ${resultData.examTime % 60} giây`}
              </strong>
            </p>
            <p className="mb-4">
              🕒 Thời gian nộp:{" "}
              <strong>
                {new Date(resultData.submittedAt).toLocaleTimeString("vi-VN")}{" "}
                {new Date(resultData.submittedAt).toLocaleDateString("vi-VN")}
              </strong>
            </p>
            <Button onClick={() => setShowResultModal(false)}>Đóng</Button>
          </div>
        </div>
      )}
    </div>
  );
}

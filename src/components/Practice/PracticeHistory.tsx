'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { getMyInfo } from '@/app/api/libApi/api';
import { useParams } from 'next/navigation';

interface PracticeExam {
  id: number;
  title: string;
  createdAt: string | null;
  duration: number;
  numberOfQuestion: number;
  beginTime: string;
  teacher: string;
  classId: number;
  subjectId: number;
  subject?: {
    name: string;
  };
}

interface ExamSubmission {
  id: number;
  student: string;
  startedAt: string;
  submittedAt: string;
  score: number;
  examTime: number;
  numberOfCorrectAnswers: number;
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

export default function PracticeHistory() {
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');
  const [practiceTests, setPracticeTests] = useState<PracticeExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const params = useParams();
  const classId = params.classId;

  // Modal states
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<PracticeExam | null>(null);
  const [examSubmission, setExamSubmission] = useState<ExamSubmission | null>(null);
  const [answers, setAnswers] = useState<StudentAnswer[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Lấy thông tin user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const userData = await getMyInfo(token);
        setUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };

    fetchUser();
  }, []);

  // Lấy danh sách practice tests đã làm
  useEffect(() => {
    if (!user) return;

    const fetchPracticeHistory = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('❌ No token found');
          return;
        }

        console.log('🔍 Fetching practice history for:', user.username);
        
        // Lấy tất cả bài practice của student
        const res = await fetch(
          `http://localhost:8888/api/exam/getExamsByStudent?student=${user.username}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        
        console.log('📦 Practice history response:', data);
        
        if (data.code === 0 && data.result) {
          const exams = data.result || [];
          
          // Sắp xếp theo thời gian tạo mới nhất
          const sorted = exams.sort(
            (a: any, b: any) => new Date(b.beginTime).getTime() - new Date(a.beginTime).getTime()
          );
          
          console.log('✅ Setting practice tests:', sorted.length, 'exams');
          setPracticeTests(sorted);
        } else {
          console.log('⚠️ No data or error:', data);
          setPracticeTests([]);
        }
      } catch (error) {
        console.error('❌ Error fetching practice history:', error);
        setPracticeTests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPracticeHistory();
  }, [user]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatExamTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} phút ${s} giây`;
  };

  // Load exam submission and answers
  const loadExamDetails = async (exam: PracticeExam) => {
    if (!user) return;
    
    setSelectedExam(exam);
    setModalLoading(true);
    setReviewOpen(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch student's submission for this exam
      const res = await fetch(
        `http://localhost:8888/api/exam/getStudentAnswer?student=${user.username}&examId=${exam.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      if (data.code === 0 && data.result) {
        setExamSubmission(data.result.examSubmission);
        setAnswers(data.result.answers || []);
      }
    } catch (error) {
      console.error('Error loading exam details:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setReviewOpen(false);
    setSelectedExam(null);
    setExamSubmission(null);
    setAnswers([]);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center py-4 text-gray-500">Đang tải lịch sử...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-3">
            <svg
              className="h-6 w-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Practice History</h2>
            <p className="text-sm text-gray-600">
              {practiceTests.length} tests completed
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('week')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setFilter('month')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Test List */}
      <div className="space-y-3">
        {practiceTests.map((test) => (
          <button
            key={test.id}
            onClick={() => loadExamDetails(test)}
            className="w-full flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md cursor-pointer"
          >
            <div className="flex items-center gap-4">
              {/* Subject Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-xl font-bold text-white">
                {test.subject?.name?.[0] || test.title?.[0] || '📚'}
              </div>

              {/* Test Info */}
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">
                  {test.subject?.name || test.title || 'Bài luyện tập'}
                </h3>
                <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
                  <span>{test.numberOfQuestion || 0} câu hỏi</span>
                  <span>•</span>
                  <span>Thời gian: {test.duration} phút</span>
                </div>
              </div>
            </div>

            {/* Date and Actions */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700">
                  ID: {test.id}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {new Date(test.beginTime).toLocaleDateString('vi-VN')}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(test.beginTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {!loading && practiceTests.length === 0 && (
        <div className="py-12 text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mt-4 text-gray-600">Chưa có bài luyện tập nào</p>
          <p className="mt-1 text-sm text-gray-500">
            Hãy tạo bài luyện tập đầu tiên của bạn
          </p>
        </div>
      )}

      {/* Review Modal - Chi tiết đáp án */}
      {reviewOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b bg-purple-500 text-white rounded-t-xl">
              <div>
                <h2 className="text-lg f
                ont-semibold">📄 Chi tiết bài làm</h2>
                {examSubmission && (
                  <p className="text-sm opacity-90">
                    Điểm: {examSubmission?.score != null ? examSubmission.score.toFixed(1) : '—'} | 
                    Đúng: {examSubmission?.numberOfCorrectAnswers ?? '—'}/{selectedExam?.numberOfQuestion ?? '—'} | 
                    Thời gian: {examSubmission?.examTime != null ? formatExamTime(examSubmission.examTime) : '—'}
                  </p>
                )}
              </div>
              <button
                onClick={closeModal}
                className="hover:bg-purple-600 rounded-full p-1 transition"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-6 flex-1">
              {modalLoading ? (
                <p className="text-center text-gray-500">Đang tải...</p>
              ) : (
                <div className="space-y-4">
                  {answers.map((ans, idx) => {
                    const isCorrect = ans.selectedOption === ans.correctAnswer;
                    return (
                      <div
                        key={ans.id}
                        className={`border-2 rounded-lg p-4 ${
                          isCorrect
                            ? 'border-green-300 bg-green-50'
                            : 'border-red-300 bg-red-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                              isCorrect ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 mb-2">
                              {ans.content}
                            </p>
                            <div className="space-y-1 text-sm mb-3">
                              <div
                                className={`p-2 rounded ${
                                  ans.selectedOption === 'A'
                                    ? isCorrect
                                      ? 'bg-green-200 font-semibold'
                                      : 'bg-red-200 font-semibold'
                                    : ans.correctAnswer === 'A'
                                    ? 'bg-green-100 font-semibold'
                                    : 'bg-white'
                                }`}
                              >
                                <strong>A.</strong> {ans.optionA}
                              </div>
                              <div
                                className={`p-2 rounded ${
                                  ans.selectedOption === 'B'
                                    ? isCorrect
                                      ? 'bg-green-200 font-semibold'
                                      : 'bg-red-200 font-semibold'
                                    : ans.correctAnswer === 'B'
                                    ? 'bg-green-100 font-semibold'
                                    : 'bg-white'
                                }`}
                              >
                                <strong>B.</strong> {ans.optionB}
                              </div>
                              <div
                                className={`p-2 rounded ${
                                  ans.selectedOption === 'C'
                                    ? isCorrect
                                      ? 'bg-green-200 font-semibold'
                                      : 'bg-red-200 font-semibold'
                                    : ans.correctAnswer === 'C'
                                    ? 'bg-green-100 font-semibold'
                                    : 'bg-white'
                                }`}
                              >
                                <strong>C.</strong> {ans.optionC}
                              </div>
                              <div
                                className={`p-2 rounded ${
                                  ans.selectedOption === 'D'
                                    ? isCorrect
                                      ? 'bg-green-200 font-semibold'
                                      : 'bg-red-200 font-semibold'
                                    : ans.correctAnswer === 'D'
                                    ? 'bg-green-100 font-semibold'
                                    : 'bg-white'
                                }`}
                              >
                                <strong>D.</strong> {ans.optionD}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <p>
                                <span className="text-gray-600">Bạn chọn:</span>{' '}
                                <strong
                                  className={
                                    isCorrect ? 'text-green-700' : 'text-red-700'
                                  }
                                >
                                  {ans.selectedOption || 'Không chọn'}
                                </strong>
                              </p>
                              <p>
                                <span className="text-gray-600">Đáp án đúng:</span>{' '}
                                <strong className="text-green-700">
                                  {ans.correctAnswer}
                                </strong>
                              </p>
                            </div>
                          </div>
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
                onClick={closeModal}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

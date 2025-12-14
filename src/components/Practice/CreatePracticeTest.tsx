'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useRouter, useParams } from 'next/navigation';
import { getMyInfo } from '@/app/api/libApi/api';

interface Subject {
  id: number;
  name: string;
  icon?: string;
}

export default function CreatePracticeTest() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId;

  const [user, setUser] = useState<any>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    subjectId: null as number | null,
    numQuestions: 10,
    timeLimit: 30,
  });

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

  // Lấy danh sách tất cả môn học
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('❌ No token found');
          return;
        }

        // Lấy danh sách tất cả môn học
        console.log('🚀 Fetching all subjects...');
        const subjectsRes = await fetch(
          `http://localhost:8888/api/classrooms/subjects`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        const subjectsData = await subjectsRes.json();
        
        console.log('📦 Subjects data:', subjectsData);
        
        if (subjectsData.code === 0 && subjectsData.result) {
          const subjectList = subjectsData.result.content || [];
          console.log('✅ Setting subjects:', subjectList);
          setSubjects(Array.isArray(subjectList) ? subjectList : []);
        } else {
          console.log('⚠️ No subjects found or error');
          setSubjects([]);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề bài luyện tập');
      return;
    }
    
    if (!formData.subjectId) {
      alert('Vui lòng chọn môn học');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) return;

      const payload = {
        title: formData.title,
        duration: formData.timeLimit,
        numberOfQuestion: formData.numQuestions,
        beginTime: new Date().toISOString(),
        student: user.username,
        classId: Number(classId),
        subjectId: formData.subjectId,
      };

      const res = await fetch('http://localhost:8888/api/exam/createPracticeExam', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (data.code === 0 && data.result?.exam?.id) {
        // Chuyển đến trang làm bài thi practice
        router.push(`/class/${classId}/practice/${data.result.exam.id}`);
      } else {
        alert('Không thể tạo bài luyện tập. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error creating practice test:', error);
      alert('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-blue-100 p-3">
          <svg
            className="h-6 w-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Create Practice Test</h2>
          <p className="text-sm text-gray-600">
            Customize your practice session
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Tiêu đề bài luyện tập
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="VD: Bài luyện tập Toán học cơ bản"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Subject Selection */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Chọn môn học {subjects.length > 0 && `(${subjects.length} môn)`}
          </label>
          {loadingSubjects ? (
            <div className="text-center py-4 text-gray-500">Đang tải môn học...</div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-4 text-gray-500 border border-dashed rounded-lg">
              Không có môn học nào. Vui lòng kiểm tra lại.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => {
                    console.log('Selected subject:', subject);
                    setFormData({ ...formData, subjectId: subject.id });
                  }}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:border-blue-500 hover:bg-blue-50 ${
                    formData.subjectId === subject.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <span className="text-3xl">{subject.icon || '📚'}</span>
                  <span className="text-xs font-medium text-gray-700 text-center">
                    {subject.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Number of Questions */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Số câu hỏi
            </label>
            <select
              value={formData.numQuestions}
              onChange={(e) =>
                setFormData({ ...formData, numQuestions: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 câu hỏi</option>
              <option value={10}>10 câu hỏi</option>
              <option value={15}>15 câu hỏi</option>
              <option value={20}>20 câu hỏi</option>
              <option value={30}>30 câu hỏi</option>
              <option value={50}>50 câu hỏi</option>
            </select>
          </div>

          {/* Time Limit */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Thời gian (phút)
            </label>
            <input
              type="number"
              min="5"
              max="180"
              value={formData.timeLimit}
              onChange={(e) =>
                setFormData({ ...formData, timeLimit: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Đề xuất: 2 phút mỗi câu hỏi
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || loadingSubjects}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Đang tạo bài luyện tập...' : 'Bắt đầu luyện tập'}
        </button>
      </form>
    </Card>
  );
}

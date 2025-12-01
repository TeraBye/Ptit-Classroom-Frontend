'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';

interface PracticeTest {
  id: number;
  subject: string;
  questions: number;
  score: number;
  date: string;
  duration: number;
  difficulty: string;
}

export default function PracticeHistory() {
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');

  // Mock data - replace with API call
  const practiceTests: PracticeTest[] = [
    {
      id: 1,
      subject: 'Mathematics',
      questions: 20,
      score: 85,
      date: '2024-11-25',
      duration: 35,
      difficulty: 'Medium',
    },
    {
      id: 2,
      subject: 'English',
      questions: 15,
      score: 92,
      date: '2024-11-24',
      duration: 28,
      difficulty: 'Easy',
    },
    {
      id: 3,
      subject: 'Science',
      questions: 10,
      score: 78,
      date: '2024-11-23',
      duration: 22,
      difficulty: 'Hard',
    },
    {
      id: 4,
      subject: 'History',
      questions: 20,
      score: 88,
      date: '2024-11-22',
      duration: 40,
      difficulty: 'Medium',
    },
    {
      id: 5,
      subject: 'Geography',
      questions: 15,
      score: 95,
      date: '2024-11-21',
      duration: 30,
      difficulty: 'Easy',
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

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
          <div
            key={test.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-300 hover:bg-blue-50/50"
          >
            <div className="flex items-center gap-4">
              {/* Subject Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-xl font-bold text-white">
                {test.subject[0]}
              </div>

              {/* Test Info */}
              <div>
                <h3 className="font-semibold text-gray-900">{test.subject}</h3>
                <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
                  <span>{test.questions} questions</span>
                  <span>•</span>
                  <span>{test.duration} min</span>
                  <span>•</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                    {test.difficulty}
                  </span>
                </div>
              </div>
            </div>

            {/* Score and Actions */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-lg font-bold ${getScoreColor(test.score)}`}>
                  {test.score}%
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {new Date(test.date).toLocaleDateString()}
                </p>
              </div>

              <button className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                Review
              </button>
            </div>
          </div>
        ))}
      </div>

      {practiceTests.length === 0 && (
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
          <p className="mt-4 text-gray-600">No practice tests yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Create your first practice test to get started
          </p>
        </div>
      )}
    </Card>
  );
}

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

export default function LearningProgress() {
  const subjects = [
    { name: 'Mathematics', progress: 85, color: 'bg-blue-500', tests: 12 },
    { name: 'English', progress: 92, color: 'bg-green-500', tests: 8 },
    { name: 'Science', progress: 78, color: 'bg-purple-500', tests: 10 },
    { name: 'History', progress: 88, color: 'bg-yellow-500', tests: 6 },
    { name: 'Geography', progress: 95, color: 'bg-red-500', tests: 5 },
  ];

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-green-100 p-3">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Learning Progress</h2>
          <p className="text-sm text-gray-600">Subject mastery overview</p>
        </div>
      </div>

      <div className="space-y-5">
        {subjects.map((subject) => (
          <div key={subject.name}>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {subject.name}
                </p>
                <p className="text-xs text-gray-500">{subject.tests} tests</p>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {subject.progress}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full ${subject.color} transition-all duration-500`}
                style={{ width: `${subject.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Overall Stats */}
      <div className="mt-6 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Overall Progress</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">87.6%</p>
          </div>
          <div className="rounded-full bg-blue-200 p-3">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
        </div>
      </div>
    </Card>
  );
}

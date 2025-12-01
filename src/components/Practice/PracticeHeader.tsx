'use client';

import React from 'react';

export default function PracticeHeader() {
  return (
    <div className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Practice Center</h1>
          <p className="text-blue-100 text-lg">
            Enhance your knowledge with customized practice tests
          </p>
        </div>
        <div className="hidden md:block">
          <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
            <svg
              className="h-16 w-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
          <p className="text-sm text-blue-100">Tests Completed</p>
          <p className="mt-1 text-2xl font-bold">24</p>
        </div>
        <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
          <p className="text-sm text-blue-100">Average Score</p>
          <p className="mt-1 text-2xl font-bold">85%</p>
        </div>
        <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
          <p className="text-sm text-blue-100">Study Streak</p>
          <p className="mt-1 text-2xl font-bold">7 days</p>
        </div>
      </div>
    </div>
  );
}

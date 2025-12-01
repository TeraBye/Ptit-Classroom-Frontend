'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';

export default function CreatePracticeTest() {
  const [formData, setFormData] = useState({
    subject: '',
    numQuestions: 10,
    difficulty: 'medium',
    timeLimit: 30,
  });

  const subjects = [
    { id: 1, name: 'Mathematics', icon: '📐' },
    { id: 2, name: 'English', icon: '📚' },
    { id: 3, name: 'Science', icon: '🔬' },
    { id: 4, name: 'History', icon: '📜' },
    { id: 5, name: 'Geography', icon: '🌍' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating practice test:', formData);
    // TODO: Implement API call
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
        {/* Subject Selection */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Select Subject
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                type="button"
                onClick={() => setFormData({ ...formData, subject: subject.name })}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:border-blue-500 hover:bg-blue-50 ${
                  formData.subject === subject.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <span className="text-3xl">{subject.icon}</span>
                <span className="text-xs font-medium text-gray-700">
                  {subject.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Number of Questions */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Number of Questions
            </label>
            <select
              value={formData.numQuestions}
              onChange={(e) =>
                setFormData({ ...formData, numQuestions: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions</option>
              <option value={30}>30 Questions</option>
            </select>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Difficulty Level
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({ ...formData, difficulty: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>

        {/* Time Limit */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Time Limit (minutes)
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
            Recommended: 2 minutes per question
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Start Practice Test
        </button>
      </form>
    </Card>
  );
}

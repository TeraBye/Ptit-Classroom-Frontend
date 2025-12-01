'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';

export default function PerformanceChart() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  // Mock data for the chart
  const performanceData = {
    week: [
      { day: 'Mon', score: 75 },
      { day: 'Tue', score: 82 },
      { day: 'Wed', score: 78 },
      { day: 'Thu', score: 85 },
      { day: 'Fri', score: 88 },
      { day: 'Sat', score: 92 },
      { day: 'Sun', score: 90 },
    ],
    month: [
      { day: 'Week 1', score: 78 },
      { day: 'Week 2', score: 82 },
      { day: 'Week 3', score: 85 },
      { day: 'Week 4', score: 90 },
    ],
    year: [
      { day: 'Q1', score: 75 },
      { day: 'Q2', score: 80 },
      { day: 'Q3', score: 85 },
      { day: 'Q4', score: 90 },
    ],
  };

  const data = performanceData[timeRange];
  const maxScore = Math.max(...data.map((d) => d.score));

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-orange-100 p-3">
            <svg
              className="h-6 w-6 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Performance</h2>
            <p className="text-sm text-gray-600">Score trends</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </div>

      {/* Chart */}
      <div className="mb-4">
        <div className="flex h-48 items-end justify-between gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative w-full">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500 hover:from-blue-600 hover:to-blue-500"
                  style={{ height: `${(item.score / maxScore) * 160}px` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-700">
                    {item.score}%
                  </div>
                </div>
              </div>
              <p className="text-xs font-medium text-gray-600">{item.day}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-3 rounded-lg bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Highest Score</span>
          <span className="font-bold text-green-600">{maxScore}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Average Score</span>
          <span className="font-bold text-blue-600">
            {Math.round(data.reduce((sum, d) => sum + d.score, 0) / data.length)}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Improvement</span>
          <span className="font-bold text-orange-600">
            +{data[data.length - 1].score - data[0].score}%
          </span>
        </div>
      </div>

      {/* Achievement Badge */}
      <div className="mt-4 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white/30 p-2">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold">Keep it up!</p>
            <p className="text-xs text-yellow-100">
              You're improving every day 🎯
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

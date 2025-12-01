'use client';

import React from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import {
  PracticeHeader,
  CreatePracticeTest,
  PracticeHistory,
  LearningProgress,
  PerformanceChart
} from '@/components/Practice';

export default function PracticePage() {
  return (
    <>
      <Breadcrumb
        links={[
          { href: '/', text: 'Home' },
          { href: '/practice', text: 'Practice Tests' }
        ]}
      />

      <section className="pb-16 pt-24 md:pt-28 lg:pt-32">
        <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4">
          {/* Header Section */}
          <PracticeHeader />

          {/* Main Content Grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column - Create & History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Create Practice Test */}
              <CreatePracticeTest />

              {/* Practice History */}
              <PracticeHistory />
            </div>

            {/* Right Column - Progress & Stats */}
            <div className="space-y-6">
              {/* Learning Progress */}
              <LearningProgress />

              {/* Performance Chart */}
              <PerformanceChart />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

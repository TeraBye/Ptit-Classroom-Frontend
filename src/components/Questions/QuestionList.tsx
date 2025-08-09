import React from "react";
import QuestionCard from "./QuestionCard";

interface Question {
  id: number;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
}

interface QuestionListProps {
  questions: Question[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function QuestionList({ questions, onEdit, onDelete }: QuestionListProps) {
  if (!questions.length) {
    return <div className="text-gray-500 italic">No questions available.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

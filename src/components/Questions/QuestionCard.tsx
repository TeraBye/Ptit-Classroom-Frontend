import React from "react";

interface Question {
  id: number;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
}

interface QuestionCardProps {
  question: Question;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function QuestionCard({ question, onEdit, onDelete }: QuestionCardProps) {
  return (
    <div className="border rounded-lg bg-white shadow-sm p-4 hover:shadow-md transition">
      <p className="font-medium">{question.content}</p>
      <ul className="text-sm text-gray-600 mt-2 space-y-1">
        <li><strong>A:</strong> {question.optionA}</li>
        <li><strong>B:</strong> {question.optionB}</li>
        <li><strong>C:</strong> {question.optionC}</li>
        <li><strong>D:</strong> {question.optionD}</li>
      </ul>
      <p className="mt-2 text-green-600 text-sm">
        Correct: {question.correctAnswer}
      </p>
      <div className="flex gap-2 mt-3">
        <button
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => onEdit(question.id)}
        >
          Edit
        </button>
        <button
          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => onDelete(question.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

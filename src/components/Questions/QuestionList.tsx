import React from "react";

interface Question {
  id: number;
  content: string;
  correctAnswer: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  explanation?: string;
  level?: string;
}

interface QuestionListProps {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: (questionId: number) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({ questions, onEdit, onDelete }) => {
  if (!questions.length) return <div>No questions.</div>;
  return (
    <ul className="space-y-2 mt-4">
      {questions.map(q => (
        <li key={q.id} className="border p-3 rounded bg-gray-50">
          <div className="font-medium mb-1">{q.content}</div>
          <div className="text-sm mb-1">
            <div>A: {q.optionA}</div>
            <div>B: {q.optionB}</div>
            <div>C: {q.optionC}</div>
            <div>D: {q.optionD}</div>
            <div>Correct answer: <b>{q.correctAnswer}</b></div>
            {q.explanation && <div>Explanation: {q.explanation}</div>}
            {q.level && <div>Level: {q.level}</div>}
          </div>
          <div className="flex gap-2 mt-2">
            <button
              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              onClick={() => onEdit(q)}
            >
              Edit
            </button>
            <button
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => onDelete(q.id)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default QuestionList; 
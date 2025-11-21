import React, { useState } from "react";

interface Question {
  id: number;
  content: string;
  explanation?: string;
  level?: string;
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
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(question.id);
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <div className="border rounded-lg bg-white shadow-sm p-4 hover:shadow-md transition">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="font-medium flex-1">{question.content}</p>
          {question.level && (
            <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${question.level === 'EASY' ? 'bg-green-100 text-green-700' :
                question.level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
              }`}>
              {question.level}
            </span>
          )}
        </div>
        <ul className="text-sm text-gray-600 mt-2 space-y-1">
          <li><strong>A:</strong> {question.optionA}</li>
          <li><strong>B:</strong> {question.optionB}</li>
          <li><strong>C:</strong> {question.optionC}</li>
          <li><strong>D:</strong> {question.optionD}</li>
        </ul>
        <p className="mt-2 text-green-600 text-sm">
          Correct Answer: {question.correctAnswer}
        </p>
        {question.explanation && (
          <p className="mt-2 text-sm text-gray-700 bg-blue-50 p-2 rounded">
            <strong>Explanation:</strong> {question.explanation}
          </p>
        )}
        <div className="flex gap-2 mt-3">
          <button
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => onEdit(question.id)}
          >
            Edit
          </button>
          <button
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            onClick={handleDeleteClick}
          >
            Delete
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <p className="mb-4">Are you sure you want to delete this question?</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

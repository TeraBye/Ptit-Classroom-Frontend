import React from "react";

interface Subject {
  id?: number;
  name: string;
}

interface SubjectListProps {
  subjects: Subject[];
  onSelect: (subjectId: number) => void;
  onAddQuestion: (subjectId: number) => void;
}

const SubjectList: React.FC<SubjectListProps> = ({ subjects, onSelect, onAddQuestion }) => {
  return (
    <ul className="space-y-3">
      {subjects.length === 0 && <li>There are no subjects.</li>}
      {subjects.map(subject => (
        <li key={subject.id} className="flex items-center justify-between">
          <span>{subject.name}</span>
          <div className="flex gap-2">
            {typeof subject.id === 'number' && (
              <>
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => onSelect(subject.id as number)}
                >
                  View questions
                </button>
                <button
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={() => onAddQuestion(subject.id as number)}
                >
                  Add question
                </button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default SubjectList; 
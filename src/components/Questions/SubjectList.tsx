import React from "react";
import SubjectCard from "./SubjectCard";

interface Subject {
  id: number;
  name: string;
}

interface SubjectListProps {
  subjects: Subject[];
  onSelect: (subjectId: number, subjectName: string) => void;
  selectedSubjectId: number | null;
}

export default function SubjectList({
  subjects,
  onSelect,
  selectedSubjectId,
}: SubjectListProps) {
  return (
    <div className="space-y-2">
      {subjects.map((subject) => (
        <div
          key={subject.id}
          onClick={() => onSelect(subject.id, subject.name)}
          className={`p-3 border rounded-lg cursor-pointer ${
            selectedSubjectId === subject.id ? "bg-yellow-300" : "bg-white"
          }`}
        >
          {subject.name}
        </div>
      ))}
    </div>
  );
}

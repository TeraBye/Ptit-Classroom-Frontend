import React from "react";

interface Subject {
  id: number;
  name: string;
}

interface SubjectCardProps {
  subject: Subject;
  onClick: () => void;
}

export default function SubjectCard({ subject, onClick }: SubjectCardProps) {
  return (
    <div
      className="p-3 border rounded-lg bg-white shadow-sm hover:shadow-md cursor-pointer transition"
      onClick={onClick}
    >
      <h3 className="font-medium">{subject.name}</h3>
    </div>
  );
}

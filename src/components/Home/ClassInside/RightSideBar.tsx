import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getMyInfo } from "@/app/api/libApi/api"; // đổi sang đường dẫn thật của bạn
import { Card } from "@/components/ui/card"; // nếu không có Card thì dùng <div>
import { Button } from "@/components/ui/button"; // nếu không có Button thì dùng <button>

// Component Popup New Exam
function NewExamModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;

    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:8888/api/classrooms/subjects", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.code === 0) {
          setSubjects(data.result);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg flex overflow-hidden">
        {/* Bên trái */}
        <div className="bg-teal-500 text-white p-8 w-1/3 flex flex-col justify-center items-center">
          <div className="text-2xl font-bold mb-4">Create new Exam</div>
          <p className="text-sm text-center">
            Create periodic tests to assess student learning.
            The system will automatically collect and grade the tests when time is up.
          </p>
        </div>

        {/* Bên phải */}
        <div className="p-8 w-2/3">
          <h2 className="text-xl font-semibold mb-4">
            New Exam
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="date"
              className="border rounded p-2 w-full"
              placeholder="Begin Date"
            />
            <input
              type="text"
              className="border rounded p-2 w-full"
              placeholder="Title"
            />
            <input
              type="number"
              min={1}
              className="border rounded p-2 w-full"
              placeholder="Number of Questions"
            />
            <input
              type="number"
              min={0}
              className="border rounded p-2 w-full"
              placeholder="Duration (minutes)"
            />
          </div>

          <select
            className="border rounded p-2 w-full mb-4"
            onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
          >
            <option value="">Select subject</option>
            {subjects.map((subj) => (
              <option key={subj.id} value={subj.id}>
                {subj.name}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-2">
            <button
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
              onClick={() => console.log("Selected subject ID:", selectedSubjectId)}
            >
              Create Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main RightSidebar
export function RightSidebar() {
  const [user, setUser] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const userData = await getMyInfo(token);
        setUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full md:w-64 flex flex-col gap-4">
      <Card className="p-4 text-center">
        <Image
          src="https://i.pinimg.com/736x/4f/d3/b8/4fd3b89d34c0bb77aaae041dbb3b717a.jpg"
          alt="Workwise"
          width={50}
          height={50}
          className="mx-auto"
        />
        <h3 className="mt-2 font-semibold">EXAM</h3>
        <p className="text-xs text-gray-500">
          You currently have no exams.
        </p>

        {user?.role === "TEACHER" ? (
          <button
            className="mt-3 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            onClick={() => setOpenModal(true)}
          >
            New exam
          </button>
        ) : (
          <Button className="mt-3 w-full">Do exam</Button>
        )}

        <div className="text-blue-500 text-xs mt-1 cursor-pointer">
          Learn More
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold mb-2">Assignments due soon</h4>
        {["Assignment 1", "Assignment 2", "Assignment 3"].map((job, index) => (
          <div key={index} className="mb-2">
            <p className="text-sm font-medium">{job}</p>
            <p className="text-xs text-gray-500">Due in 3 hours!</p>
          </div>
        ))}
      </Card>

      {/* Popup */}
      <NewExamModal open={openModal} onClose={() => setOpenModal(false)} />
    </div>
  );
}

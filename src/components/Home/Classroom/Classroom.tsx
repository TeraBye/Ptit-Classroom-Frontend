"use client";
import { useState } from "react";
import { PlayIcon, QuestionMarkCircleIcon, WifiIcon, PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Item from "./ClassItem";

type LessonType = "video" | "quiz" | "live";

interface Lesson {
  title: string;
  type: LessonType;
}

interface Section {
  title: string;
  lessons: Lesson[];
}

const Classroom = () => {
  const [sections] = useState<Section[]>([
    {
      title: "Join Classroom",
      lessons: [
        { title: "Join your classroom", type: "video" },
        { title: "Or search other classrooms", type: "video" },
        { title: "If you have any questions, please contact admin", type: "quiz" },
      ],
    },
    {
      title: "Create your classroom",
      lessons: [
        { title: "Open a new classroom", type: "video" },
        { title: "Setting your classroom's state", type: "live" },
      ],
    },
  ]);

  const [classrooms, setClassrooms] = useState<number[]>([]);

  const getIcon = (type: LessonType) => {
    switch (type) {
      case "video": return <PlayIcon className="w-5 h-5 text-green-500" />;
      case "quiz": return <QuestionMarkCircleIcon className="w-5 h-5 text-yellow-500" />;
      case "live": return <WifiIcon className="w-5 h-5 text-pink-500" />;
      default: return null;
    }
  };

  return (
    <section id="classroom">
      <div className="flex h-screen bg-gray-50 mt-[50px]">
        {/* Sidebar */}
        <div className="w-1/3 bg-white p-4 overflow-y-auto border-r">
          <h2 className="text-lg font-semibold mb-4">Class</h2>
          {sections.map((section, idx) => (
            <div key={idx} className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{section.title}</h3>
                <button className="text-gray-400 hover:text-gray-600">▼</button>
              </div>
              <div className="space-y-2">
                {section.lessons.map((lesson, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {getIcon(lesson.type)}
                    <span>{lesson.title}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex items-center gap-1 text-blue-600 hover:underline">
                  <PlusIcon className="w-4 h-4" />
                  Use your code
                </button>
                <button className="flex items-center gap-1 text-gray-600 hover:underline">
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  Search classroom
                </button>
              </div>
            </div>
          ))}
          <button
            className="w-full py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
            onClick={() => setClassrooms(prev => [...prev, Date.now()])}
          >
            Create new classroom
          </button>
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col justify-start items-center text-center px-8 py-8">
          {classrooms.length === 0 ? (
            <div className="mb-8">
              <img
                src="https://i.pinimg.com/736x/6b/3e/cd/6b3ecd42ab413ac9c002e52e360f8627.jpg"
                alt="Build Course"
                className="w-20 h-20 mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Let's begin your classroom!</h3>
              <p className="text-gray-500">
                You don't have any classroom.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classrooms.map((id) => (
                <Item key={id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Classroom;

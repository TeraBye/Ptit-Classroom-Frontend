"use client";
import { useEffect, useState } from "react";
import {
  PlayIcon,
  QuestionMarkCircleIcon,
  WifiIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Item from "./ClassItem";
import {
  createClassroom,
  getAllSubjects,
  getMyInfo,
  getClassroomByTeacherUsername,
  addStudent,
  getStudentClasses,
} from "@/app/api/libApi/api"; // import hàm vừa tạo
import { useRouter } from "next/navigation";

type LessonType = "video" | "quiz" | "live";

interface Lesson {
  title: string;
  type: LessonType;
}

interface Section {
  title: string;
  lessons: Lesson[];
}

const PAGE_SIZE = 10;

// Thêm interface cho user
interface User {
  username: string;
  role: 'TEACHER' | 'STUDENT';
  // ... các trường khác nếu cần
}

const Classroom = () => {
  const [sections] = useState<Section[]>([
    {
      title: "Join Classroom",
      lessons: [
        { title: "Join your classroom", type: "video" },
        { title: "Or search other classrooms", type: "video" },
        {
          title: "If you have any questions, please contact admin",
          type: "quiz",
        },
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

  const [page, setPage] = useState(0);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  // const { user } = useAuth();

  // State cho modal
  const [showModal, setShowModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);

  // State cho form
  const [form, setForm] = useState({
    name: "",
    subject: "",
    meetLink: "",
    isPublic: true,
    teacherUsername: "",
  });

  // State cho danh sách môn học và search
  const [subjects, setSubjects] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [token, setToken] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token") || undefined);
    }
  }, []);

  useEffect(() => {
    if (token) {
      getMyInfo(token).then((user) => {
        setUser(user); // user.role sẽ có giá trị "TEACHER" hoặc "STUDENT"
        setForm((prev) => ({
          ...prev,
          teacherUsername: user?.username || "",
        }));
      });
    }
  }, [token]);

  useEffect(() => {
    if (user?.role === "TEACHER" && token && user?.username) {
      setLoading(true);
      const fetchClassrooms = async () => {
        const result = await getClassroomByTeacherUsername(
          user.username,
          token,
          page,
          PAGE_SIZE
        );
        setClassrooms(result.content); // content là mảng lớp học
        setTotalPages(result.totalPages); // totalPages từ backend trả về
        setLoading(false);
      };
      fetchClassrooms();
    } else if (user?.role === "STUDENT" && token && user?.username) {
      const fetchClassrooms = async () => {
        const result = await getStudentClasses(
          user.username,
          token,
          page,
          PAGE_SIZE
        );
        setClassrooms(result.content); // content là mảng lớp học
        setTotalPages(result.totalPages); // totalPages từ backend trả về
        setLoading(false);
      };
      fetchClassrooms();
    }
  }, [page, token, user]);

  useEffect(() => {
    if (showModal && token) {
      // Lấy danh sách môn học
      getAllSubjects(token).then(setSubjects);
    }
  }, [showModal, token]);

  const getIcon = (type: LessonType) => {
    switch (type) {
      case "video":
        return <PlayIcon className="w-5 h-5 text-green-500" />;
      case "quiz":
        return <QuestionMarkCircleIcon className="w-5 h-5 text-yellow-500" />;
      case "live":
        return <WifiIcon className="w-5 h-5 text-pink-500" />;
      default:
        return null;
    }
  };

  // Xử lý thay đổi input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Lọc môn học theo search
  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // Submit form
  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        subject: { id: form.subject }, // chỉ cần id
      };
      await createClassroom(data, token);
      setShowModal(false);
      setForm({
        name: "",
        subject: "",
        meetLink: "",
        isPublic: true,
        teacherUsername: "", // hoặc gọi lại getMyInfo(token) nếu cần
      });
      // Gọi lại API để lấy danh sách mới nhất
      if (user?.username) {
        setLoading(true);
        const result = await getClassroomByTeacherUsername(
          user.username,
          token,
          page,
          PAGE_SIZE
        );
        setClassrooms(result.content);
        setTotalPages(result.totalPages);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("Tạo classroom thất bại!");
    }
  };

  return (
    <section id="classroom">
      <div className="flex h-screen bg-gray-50 mt-[50px]">
        {/* Sidebar */}
        <div className="w-1/3 bg-white p-4 overflow-y-auto border-r">
          <h2 className="text-lg font-semibold mb-4">Class</h2>
          {/* Luôn render section[0] */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">{sections[0].title}</h3>
              <button className="text-gray-400 hover:text-gray-600">▼</button>
            </div>
            <div className="space-y-2">
              {sections[0].lessons.map((lesson, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {getIcon(lesson.type)}
                  <span>{lesson.title}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <button
                className="flex items-center gap-1 text-blue-600 hover:underline"
                onClick={() => setShowJoinModal(true)}
              >
                <PlusIcon className="w-4 h-4" />
                Use your code
              </button>
              <button className="flex items-center gap-1 text-gray-600 hover:underline">
                <MagnifyingGlassIcon className="w-4 h-4" />
                Search classroom
              </button>
            </div>
          </div>

          {/* Chỉ render section[1] và nút tạo lớp nếu là TEACHER */}
          {user?.role === "TEACHER" && (
            <>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{sections[1].title}</h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    ▼
                  </button>
                </div>
                <div className="space-y-2">
                  {sections[1].lessons.map((lesson, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      {getIcon(lesson.type)}
                      <span>{lesson.title}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                className="w-full py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
                onClick={() => setShowModal(true)}
              >
                Create new classroom
              </button>
            </>
          )}
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col justify-start items-center text-center px-8 py-8">
          {loading ? (
            <div>Loading...</div>
          ) : classrooms.length === 0 ? (
            <div className="mb-8">
              <img
                src="https://i.pinimg.com/736x/6b/3e/cd/6b3ecd42ab413ac9c002e52e360f8627.jpg"
                alt="Build Course"
                className="w-20 h-20 mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">
                Let's begin your classroom!
              </h3>
              <p className="text-gray-500">You don't have any classroom.</p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user?.role === "TEACHER" &&
                  classrooms.map((classroom) => (
                    <Item key={classroom.id} classroom={classroom} />
                  ))}

                {user?.role === "STUDENT" &&
                  classrooms.map((classroom) => (
                    <Item key={classroom.id} classroom={classroom.classroom} />
                  ))}
              </div>
              <div className="flex justify-center mt-4 gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span>
                  Page {page + 1} / {totalPages}
                </span>
                <button
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500 flex items-center justify-center w-8 h-8 text-2xl"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4">Create New Classroom</h2>
              <form onSubmit={handleCreateClassroom} className="space-y-3">
                <input
                  className="w-full border p-2 rounded"
                  name="name"
                  placeholder="Classroom name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <input
                  className="w-full border p-2 rounded"
                  name="meetLink"
                  placeholder="Meet link"
                  value={form.meetLink}
                  onChange={handleChange}
                />
                {/* teacherUsername: readonly, tự động lấy */}
                <input
                  className="w-full border p-2 rounded bg-gray-100"
                  name="teacherUsername"
                  placeholder="Teacher username"
                  value={form.teacherUsername}
                  readOnly
                  disabled
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={form.isPublic}
                    onChange={handleChange}
                  />
                  Public
                </label>
                {/* Combobox môn học autocomplete */}
                <div className="relative">
                  <input
                    className="w-full border p-2 rounded mb-2"
                    placeholder="Search subject..."
                    value={form.subject ? subjects.find(s => s.id === form.subject)?.name || search : search}
                    onChange={e => {
                      setSearch(e.target.value);
                      setForm(prev => ({ ...prev, subject: '' }));
                    }}
                    autoComplete="off"
                    onFocus={() => setSearch('')}
                    required
                  />
                  {/* Dropdown gợi ý môn học */}
                  {search && !form.subject && (
                    <div className="absolute left-0 right-0 bg-white border rounded shadow z-10 max-h-40 overflow-auto">
                      {filteredSubjects.length === 0 && (
                        <div className="p-2 text-gray-400">No subject found</div>
                      )}
                      {filteredSubjects.map(subject => (
                        <div
                          key={subject.id}
                          className="p-2 hover:bg-blue-100 cursor-pointer"
                          onMouseDown={() => {
                            setForm(prev => ({ ...prev, subject: subject.id }));
                            setSearch('');
                          }}
                        >
                          {subject.name}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Nếu đã chọn môn, hiện nút xóa/chọn lại */}
                  {form.subject && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-red-500" onClick={() => setForm(prev => ({ ...prev, subject: '' }))} title="Clear">
                      ×
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create classroom
                </button>
              </form>
            </div>
          </div>
        )}

        {showJoinModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500 flex items-center justify-center w-8 h-8 text-2xl"
                onClick={() => setShowJoinModal(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4">Join Classroom</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!classCode) return;
                  setJoinLoading(true);
                  try {
                    const res = await addStudent(
                      { classCode: classCode, studentUsername: user?.username },
                      token
                    );
                    setShowJoinModal(false);
                    setClassCode("");
                    router.push(`/class-inside/${res.classroom.id}`);
                  } catch (err) {
                    alert("Join failed! Please check your code.");
                  } finally {
                    setJoinLoading(false);
                  }
                }}
                className="space-y-3"
              >
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Enter class code"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={joinLoading}
                >
                  {joinLoading ? "Joining..." : "Join"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Classroom;

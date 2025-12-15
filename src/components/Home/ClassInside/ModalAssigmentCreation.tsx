"use client";
import { useEffect, useState } from "react";
import { X, Paperclip } from "lucide-react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { Client, Storage, ID } from "appwrite";
import { getMyInfo } from "@/app/api/libApi/api";
import { Card } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

// --- Appwrite config
const client = new Client();
client.setEndpoint("https://cloud.appwrite.io/v1").setProject("67f02a3c00396aab7f01");
const storage = new Storage(client);
const BUCKET_ID = "67f02a57000c66380420";
const ProjectID = "67f02a3c00396aab7f01";

export function AssignmentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user, setUser] = useState<any>(null);
  const [createLoading, setCreateLoading] = useState<boolean>(false);

  const router = useRouter();
  const params = useParams();
  const classId = params.classId;


  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;
  
          const userData = await getMyInfo(token);
          setUser(userData);
        } catch (error) {
          console.error("Error ", error);
        }
      };
  
      fetchData();
    }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFileToAppwrite = async (file: File) => {
    const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
    return `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${response.$id}/view?project=${ProjectID}`;
  };

  const handlePost = async () => {
    if (!title.trim()) {
      return;
    }

    setCreateLoading(true);
    try {
      let fileUrl = "";
      if (files.length > 0) {
        fileUrl = await uploadFileToAppwrite(files[0]);
      }

      const formattedDeadline = deadline
        ? format(deadline, "HH:mm:ss dd:MM:yyyy")
        : null;

      const token = localStorage.getItem("token");

      await fetch(`http://localhost:8888/api/post/createPost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          username: user?.username,
          deadline: formattedDeadline,
          fileUrl: fileUrl || "",
          classId: classId,
        }),
      });

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setCreateLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl overflow-hidden grid grid-cols-12" onClick={(e) => e.stopPropagation()}>
        {/* Left visual (sky-blue, instructional) */}
        <div className="col-span-4 bg-gradient-to-b from-sky-600 to-indigo-600 text-white p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 rounded-lg p-2">
                <Paperclip size={22} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">New Assignment</h3>
                <p className="text-xs opacity-90">Create tasks quickly and clearly for your class.</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-white/10 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold">Set a clear deadline</p>
                  <p className="text-xs opacity-90">Helps students manage time and submissions.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white/10 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 2a1 1 0 00-1 1v1H5a2 2 0 00-2 2v2h14V6a2 2 0 00-2-2h-2V3a1 1 0 00-1-1H8z" />
                    <path d="M3 11v3a2 2 0 002 2h10a2 2 0 002-2v-3H3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold">Attach resources</p>
                  <p className="text-xs opacity-90">Upload materials or examples for students.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white/10 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 00-1 1v6H5a1 1 0 000 2h3v6a1 1 0 002 0v-6h3a1 1 0 100-2H11V3a1 1 0 00-1-1z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold">Provide instructions</p>
                  <p className="text-xs opacity-90">Include rubric or expectations for grading.</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs opacity-80">Tip: use clear titles and examples to improve student outcomes.</p>
        </div>

        {/* Right form */}
        <div className="col-span-8 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Create Assignment</h2>
              <p className="text-sm text-gray-500 mt-1">Provide title, deadline, instructions and attachments.</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700">✕</button>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Assignment title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={createLoading}
                className="mt-1 block w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Deadline</label>
                <DatePicker
                  selected={deadline}
                  onChange={(date) => setDeadline(date)}
                  dateFormat="yyyy/MM/dd"
                  placeholderText="Choose deadline"
                  disabled={createLoading}
                  className="mt-1 block w-full p-2 rounded border text-center"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Attach file</label>
                <div className="mt-1 flex items-center gap-2">
                  <label htmlFor="file-upload" className={`cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded bg-white/5 text-sm ${createLoading ? 'opacity-50 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                    <Paperclip size={16} />
                    <span className="text-white">Choose file</span>
                  </label>
                  <input
                    type="file"
                    multiple
                    id="file-upload"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".doc,.docx,.pdf,.rar,.zip"
                    disabled={createLoading}
                  />
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center gap-2">
                      <span>📄 {file.name}</span>
                      <button onClick={() => removeFile(index)} disabled={createLoading} className="text-gray-500 hover:text-red-500">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Instructions</label>
              <textarea
                placeholder="Details, steps, grading rubric..."
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={createLoading}
                className="mt-1 block w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} disabled={createLoading} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
            <button
              onClick={handlePost}
              disabled={createLoading || !title.trim()}
              className={`px-4 py-2 rounded text-white flex items-center gap-2 ${!createLoading && title.trim() ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-300 cursor-not-allowed'}`}
            >
              {createLoading ? (
                <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              ) : null}
              {createLoading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { X, Paperclip } from "lucide-react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { Client, Storage, ID } from "appwrite";

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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

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
          username: "teacher001",
          deadline: formattedDeadline,
          fileUrl: fileUrl || "",
          classId: "1",
        }),
      });

      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-[450px] shadow-lg font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-blue-500 text-white text-lg font-semibold p-3 rounded-t-lg flex justify-between items-center">
          <span>New Lesson</span>
          <button onClick={onClose} className="hover:text-gray-200">X</button>
        </div>

        <div className="p-4 space-y-4 text-gray-800">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded text-gray-800 placeholder-gray-400 focus:outline-none focus:ring focus:border-blue-300"
          />

          <div>
            <label className="block text-sm font-medium mb-1">Deadline</label>
            <DatePicker
              selected={deadline}
              onChange={(date) => setDeadline(date)}
              dateFormat="yyyy/MM/dd"
              placeholderText="Choose deadline"
              className="w-full p-2 border rounded text-center text-gray-800 placeholder-gray-400 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <textarea
            placeholder="Content"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded text-gray-800 placeholder-gray-400 focus:outline-none focus:ring focus:border-blue-300"
          />

          <div>
            <label className="block text-sm font-medium mb-1">Attach file</label>
            <div className="flex items-center gap-2">
              <label htmlFor="file-upload" className="cursor-pointer text-blue-500 hover:text-blue-700 flex items-center gap-1">
                <Paperclip size={20} />
                <span>Choose file</span>
              </label>
              <input
                type="file"
                multiple
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
                accept=".doc,.docx,.pdf,.rar,.zip"
              />
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {files.map((file, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                >
                  📄 {file.name}
                  <button
                    onClick={() => removeFile(index)}
                    className="ml-1 text-blue-600 hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-4 py-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

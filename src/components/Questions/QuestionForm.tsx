import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface QuestionFormProps {
  initialData: any;
  onSubmit: (data: any) => Promise<void>;
  onUndo: () => Promise<void>;
  onRedo: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
  onCancel: () => void;
}

export default function QuestionForm({
  initialData,
  onSubmit,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onCancel,
}: QuestionFormProps) {
  const [formData, setFormData] = useState({
    content: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "",
    explanation: "",
    level: "EASY",
  });

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<"undo" | "redo" | null>(
    null
  );

  useEffect(() => {
    if (initialData) {
      setFormData({
        content: initialData.content || "",
        optionA: initialData.optionA || "",
        optionB: initialData.optionB || "",
        optionC: initialData.optionC || "",
        optionD: initialData.optionD || "",
        correctAnswer: initialData.correctAnswer || "",
        explanation: initialData.explanation || "",
        level: initialData.level || "EASY",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      toast.success(
        initialData?.id
          ? "Question updated successfully"
          : "Question created successfully"
      );
      setFormData({
        content: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "",
        explanation: "",
        level: "EASY",
      });
    } catch (error: any) {
      toast.error(error.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    setActionLoading("undo");
    try {
      await onUndo();
      toast.info("Undo successful");
    } catch (error: any) {
      toast.error(error.message || "Undo failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRedo = async () => {
    setActionLoading("redo");
    try {
      await onRedo();
      toast.info("Redo successful");
    } catch (error: any) {
      toast.error(error.message || "Redo failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <form
        className="bg-white shadow-md rounded-lg p-6 space-y-6 border"
        onSubmit={handleSubmit}
      >
        {/* Undo/Redo Buttons */}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={handleUndo}
            disabled={!canUndo || actionLoading === "undo"}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              canUndo
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-gray-300 cursor-not-allowed"
            } text-white`}
          >
            {actionLoading === "undo" && <span className="loader"></span>}
            Undo
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={!canRedo || actionLoading === "redo"}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              canRedo
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-300 cursor-not-allowed"
            } text-white`}
          >
            {actionLoading === "redo" && <span className="loader"></span>}
            Redo
          </button>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">
              Question Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={3}
              className="mt-1 block w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Explanation</label>
            <textarea
              name="explanation"
              value={formData.explanation}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border rounded-lg p-2"
            />
          </div>

          {["A", "B", "C", "D"].map((opt) => (
            <div key={opt}>
              <label className="block text-sm font-medium">{`Option ${opt}`}</label>
              <input
                type="text"
                name={`option${opt}`}
                value={(formData as any)[`option${opt}`]}
                onChange={handleChange}
                required
                className="mt-1 block w-full border rounded-lg p-2"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium">Correct Answer</label>
            <select
              name="correctAnswer"
              value={formData.correctAnswer}
              onChange={handleChange}
              required
              className="mt-1 block w-full border rounded-lg p-2"
            >
              <option value="">Select Correct Answer</option>
              <option value="A">Option A</option>
              <option value="B">Option B</option>
              <option value="C">Option C</option>
              <option value="D">Option D</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              required
              className="mt-1 block w-full border rounded-lg p-2"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-2">
          {initialData?.id && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            {loading && <span className="loader"></span>}
            {initialData && initialData.id
              ? "Update Question"
              : "Create Question"}
          </button>
        </div>

        {/* Loader CSS */}
        <style>{`
          .loader {
            border: 2px solid #f3f3f3;
            border-top: 2px solid white;
            border-radius: 50%;
            width: 14px;
            height: 14px;
            animation: spin 0.6s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </form>
    </>
  );
}

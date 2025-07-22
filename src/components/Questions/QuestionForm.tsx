import React from "react";

interface QuestionFormProps {
  form: {
    content: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    explanation: string;
    level: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
  onCancel: () => void;
  isEdit?: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ form, onChange, onSubmit, submitting, onCancel, isEdit }) => {
  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div>
        <label className="block font-medium">Content</label>
        <textarea
          name="content"
          value={form.content}
          onChange={onChange}
          className="w-full border rounded p-2"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label>Option A</label>
          <input
            name="optionA"
            value={form.optionA}
            onChange={onChange}
            className="w-full border rounded p-1"
            required
          />
        </div>
        <div>
          <label>Option B</label>
          <input
            name="optionB"
            value={form.optionB}
            onChange={onChange}
            className="w-full border rounded p-1"
            required
          />
        </div>
        <div>
          <label>Option C</label>
          <input
            name="optionC"
            value={form.optionC}
            onChange={onChange}
            className="w-full border rounded p-1"
            required
          />
        </div>
        <div>
          <label>Option D</label>
          <input
            name="optionD"
            value={form.optionD}
            onChange={onChange}
            className="w-full border rounded p-1"
            required
          />
        </div>
      </div>
      <div>
        <label>Correct answer</label>
        <select
          name="correctAnswer"
          value={form.correctAnswer}
          onChange={onChange}
          className="w-full border rounded p-1"
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
      </div>
      <div>
        <label>Explanation</label>
        <input
          name="explanation"
          value={form.explanation}
          onChange={onChange}
          className="w-full border rounded p-1"
        />
      </div>
      <div>
        <label>Level</label>
        <select
          name="level"
          value={form.level}
          onChange={onChange}
          className="w-full border rounded p-1"
        >
          <option value="EASY">EASY</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HARD">HARD</option>
        </select>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={submitting}
        >
          {submitting ? (isEdit ? "Updating..." : "Adding...") : (isEdit ? "Update" : "Add question")}
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default QuestionForm; 
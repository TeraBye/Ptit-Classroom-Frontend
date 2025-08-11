import { useState } from "react";

export default function ProfileForm({ user, onSave }: { user: any; onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    userId: user.userId || 0,          // ✅ Thêm userId
    username: user.username || "",     // ✅ username
    fullName: user.fullName || "",
    email: user.email || "",
    dob: user.dob || "",
    roles: user.roles || "",           // ✅ roles
    avatar: user.avatar || "",         // Không có trong DTO nhưng giữ cho UI
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Tạo object đúng theo DTO UpdateUserRequest
    const updateData = {
      userId: formData.userId,
      username: formData.username,
      fullName: formData.fullName,
      email: formData.email,
      dob: formData.dob,
    };

    onSave(updateData);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium">Username</label>
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-lg p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Full Name</label>
        <input
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-lg p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-lg p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Date of Birth</label>
        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-lg p-2"
          required
        />
      </div>

      <button
        type="submit"
        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
      >
        Save Changes
      </button>
    </form>
  );
}

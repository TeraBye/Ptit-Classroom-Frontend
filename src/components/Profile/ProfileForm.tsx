import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { Upload } from "lucide-react";

const CLOUDINARY_CLOUD_NAME = process.env
  .NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string;
const CLOUDINARY_UPLOAD_PRESET = process.env
  .NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string;

export default function ProfileForm({
  user,
  onSave,
}: {
  user: any;
  onSave: (data: any) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    userId: user.userId || 0,
    username: user.username || "",
    fullName: user.fullName || "",
    email: user.email || "",
    dob: user.dob || "",
    roles: user.roles || "",
    avatar: user.avatar || "",
  });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Upload to Cloudinary immediately
    uploadAvatarToCloudinary(file);
  };

  // Delete old avatar from Cloudinary before uploading new one
  const deleteOldAvatar = async () => {
    try {
      const publicId = `ptit-classroom/avatars/avatar_${formData.username}`;
      const response = await fetch("/api/cloudinary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });
      if (!response.ok) {
        console.warn("Failed to delete old avatar, continuing anyway");
      }
    } catch (err) {
      console.warn("Error deleting old avatar:", err);
      // Continue with upload even if delete fails
    }
  };

  const uploadAvatarToCloudinary = async (file: File) => {
    setUploadingAvatar(true);
    try {
      // Delete old avatar first (best practice to save storage)
      if (formData.avatar) {
        await deleteOldAvatar();
      }

      const cloudinaryData = new FormData();
      cloudinaryData.append("file", file);
      cloudinaryData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      cloudinaryData.append("folder", "ptit-classroom/avatars");
      cloudinaryData.append("public_id", `avatar_${formData.username}`);
      cloudinaryData.append("filename_override", `avatar_${formData.username}`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: cloudinaryData,
        }
      );

      if (!response.ok) {
        throw new Error("Cloudinary upload failed");
      }

      const data = await response.json();
      // Add cache busting with timestamp to force reload
      const avatarUrl = `${data.secure_url}?t=${Date.now()}`;

      setFormData((prev) => ({ ...prev, avatar: avatarUrl }));

      toast.success("Avatar uploaded successfully");

      // Reset input để upload được lần tiếp theo
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      const errorMsg = err?.message || "Failed to upload avatar";
      toast.error(errorMsg);
      console.error("Avatar upload error:", err);
    } finally {
      setUploadingAvatar(false);
    }
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
      avatar: formData.avatar, // Gửi avatar URL
    };

    onSave(updateData);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Avatar Upload Section */}
      <div className="mb-6 pb-6 border-b">
        <label className="block text-sm font-medium mb-3">
          Profile Picture
        </label>
        <label className="cursor-pointer inline-block">
          {/* Preview - Click to upload */}
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-gray-300 shadow-md hover:opacity-80 transition-opacity">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg
                  className="w-12 h-12"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                <div className="animate-spin">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleAvatarChange}
            disabled={uploadingAvatar}
          />
        </label>
        <p className="text-xs text-gray-500 mt-2">
          Click avatar to upload image
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium">Username</label>
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-lg p-2"
          disabled
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

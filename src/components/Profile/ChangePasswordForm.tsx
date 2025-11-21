import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function ChangePasswordForm({ onSuccess }: { onSuccess?: () => void }) {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const validate = () => {
        if (!oldPassword) return "Please enter your current password.";
        if (!newPassword) return "Please enter a new password.";
        if (newPassword.length < 6) return "New password must be at least 6 characters.";
        if (newPassword !== confirmPassword) return "New password and confirmation do not match.";
        if (newPassword === oldPassword) return "New password must be different from the old password.";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const v = validate();
        if (v) {
            toast.error(v);
            return;
        }

        setLoading(true);
        try {
            // Backend expects a PATCH to /change-password with { oldPassword, newPassword }
            await axiosInstance.patch('/identity/auth/change-password', { oldPassword, newPassword });
            toast.success('Password changed successfully');
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            onSuccess?.();
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to change password';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-lg">
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Current password</label>
                <div className="relative">
                    <input
                        type={showOld ? 'text' : 'password'}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="Enter current password"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowOld(s => !s)}
                        className="absolute right-2 top-2 text-sm text-gray-600"
                    >
                        {showOld ? 'Hide' : 'Show'}
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">New password</label>
                <div className="relative">
                    <input
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="At least 6 characters"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowNew(s => !s)}
                        className="absolute right-2 top-2 text-sm text-gray-600"
                    >
                        {showNew ? 'Hide' : 'Show'}
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Use a strong password that you don't use elsewhere.</p>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Confirm new password</label>
                <input
                    type={showNew ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Repeat new password"
                    required
                />
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
                >
                    {loading ? 'Saving...' : 'Change password'}
                </button>
                <button
                    type="button"
                    onClick={() => { setOldPassword(''); setNewPassword(''); setConfirmPassword(''); }}
                    className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                >
                    Reset
                </button>
            </div>
        </form>
    );
}

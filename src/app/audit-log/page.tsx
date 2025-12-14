"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMyInfo } from "@/app/api/libApi/api";
import AuditLogPage from "@/components/AuditLog/AuditLogPage";

export default function TeacherAuditLogPage() {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            setToken(localStorage.getItem("token") || undefined);
        }
    }, []);

    useEffect(() => {
        if (token) {
            getMyInfo(token)
                .then((userInfo) => {
                    setUser(userInfo);
                    // Check if user is teacher
                    if (userInfo?.role !== "TEACHER") {
                        router.push("/");
                    }
                })
                .catch(() => router.push("/"))
                .finally(() => setLoading(false));
        }
    }, [token, router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin">
                    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            </div>
        );
    }

    if (!user) {
        return <div className="text-center py-8">Access Denied</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6 mt-24">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Audit Log</h1>
                <p className="text-gray-600">View all your activities and actions in the system</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <AuditLogPage username={user.username} token={token} />
            </div>
        </div>
    );
}

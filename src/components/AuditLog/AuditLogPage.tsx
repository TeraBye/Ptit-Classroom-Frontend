"use client";
import { useState, useEffect } from "react";
import { getAuditLogs } from "@/app/api/libApi/api";
import AuditLogTable from "./AuditLogTable";

interface AuditLogPageProps {
    username: string;
    token?: string;
}

export default function AuditLogPage({ username, token }: AuditLogPageProps) {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [totalPages, setTotalPages] = useState(0);
    const PAGE_SIZE = 10;

    useEffect(() => {
        fetchLogs();
    }, [page, sortOrder]);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const data = await getAuditLogs(username, page, PAGE_SIZE, sortOrder, token);
            console.log("Fetched audit logs:", data);
            if (!data) {
                console.warn("getAuditLogs returned empty:", data);
                setLogs([]);
                setTotalPages(0);
            } else if (Array.isArray(data)) {
                // backend returned array of logs directly
                setLogs(data);
                setTotalPages(1);
            } else {
                setLogs(Array.isArray(data.content) ? data.content : []);
                setTotalPages(typeof data.totalPages === "number" ? data.totalPages : 0);
            }
        } catch (err) {
            console.error("Failed to fetch logs", err);
            setLogs([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Logs Table (Time header is clickable to toggle sort) */}
            <AuditLogTable
                logs={logs}
                isLoading={isLoading}
                sortOrder={sortOrder}
                onToggleSort={() => {
                    setPage(0);
                    setSortOrder((s) => (s === "desc" ? "asc" : "desc"));
                }}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                        Page {page + 1} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                            disabled={page === totalPages - 1}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

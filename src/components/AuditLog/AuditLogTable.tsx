"use client";

interface AuditLog {
    id: number;
    username: string;
    role: string;
    action: string;
    description: string;
    createdAt: string;
}

interface AuditLogTableProps {
    logs: AuditLog[];
    isLoading?: boolean;
    sortOrder?: "asc" | "desc";
    onToggleSort?: () => void;
}

// Get color based on action type
const getActionColor = (action: string): string => {
    switch (action) {
        case "CREATE CLASSROOM":
            return "text-green-600 bg-green-50";
        case "DELETE CLASSROOM":
            return "text-red-600 bg-red-50";
        case "UPDATE CLASSROOM":
            return "text-blue-600 bg-blue-50";
        case "RESTORE CLASSROOM":
            return "text-yellow-600 bg-yellow-50";
        case "IMPORT FILE":
            return "text-purple-600 bg-purple-50";
        case "CREATE EXAM":
            return "text-green-600 bg-green-50";
        case "DELETE EXAM":
            return "text-red-600 bg-red-50";
        default:
            return "text-gray-600 bg-gray-50";
    }
};

export default function AuditLogTable({ logs, isLoading, sortOrder, onToggleSort }: AuditLogTableProps) {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            </div>
        );
    }

    if (!logs || logs.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No audit logs found
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead className="bg-gray-100 border-b-2">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            <div
                                className="flex items-center gap-1 cursor-pointer select-none"
                                role="button"
                                tabIndex={0}
                                onClick={() => onToggleSort?.()}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") onToggleSort?.();
                                }}
                            >
                                <span>Time</span>
                                <span className="text-gray-400 text-xs" title={sortOrder === "asc" ? "Sorted by oldest first" : "Sorted by latest first"}>
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium`}>
                                    {log.action}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                                {log.description}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                                {new Date(log.createdAt).toLocaleString("vi-VN")}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

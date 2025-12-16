"use client";

import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { API_BASE_URL, getMyInfo, getAllSubjects } from "@/app/api/libApi/api";
import { toast } from "react-toastify";

type Props = {
    onImported?: (result?: any) => void;
    onRefreshData?: () => Promise<void> | void;
};

// Timeout configuration
const MAX_POLLING_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const POLLING_INTERVAL = 2000; // 2 seconds
const MAX_POLL_ATTEMPTS = Math.floor(MAX_POLLING_TIME / POLLING_INTERVAL); // 150 attempts

export default function QuestionImport({ onImported, onRefreshData }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [jobId, setJobId] = useState<number | null>(null);
    const [jobStatus, setJobStatus] = useState<any>(null);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [showSubjects, setShowSubjects] = useState(false);
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const pollRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const pollStartTimeRef = useRef<number | null>(null);
    const pollAttemptsRef = useRef<number>(0);
    const elapsedTimeRef = useRef<number | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] ?? null;
        setFile(f);
    };

    const stopPolling = () => {
        if (pollRef.current) {
            window.clearInterval(pollRef.current);
            pollRef.current = null;
        }
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (elapsedTimeRef.current) {
            window.clearInterval(elapsedTimeRef.current);
            elapsedTimeRef.current = null;
        }
        pollStartTimeRef.current = null;
        pollAttemptsRef.current = 0;
        setElapsedTime(0);
    };

    const handleCancelImport = () => {
        stopPolling();
        setUploading(false);
        setJobId(null);
        setJobStatus(null);
        toast.info("Stopped tracking import. You can check the status in the backend.");
    };

    const startPolling = (id: number) => {
        // Stop any existing polling
        stopPolling();

        // Reset tracking variables
        pollStartTimeRef.current = Date.now();
        pollAttemptsRef.current = 0;
        setElapsedTime(0);

        // Start elapsed time counter
        elapsedTimeRef.current = window.setInterval(() => {
            if (pollStartTimeRef.current) {
                const elapsed = Math.floor((Date.now() - pollStartTimeRef.current) / 1000);
                setElapsedTime(elapsed);
            }
        }, 1000);

        // Set timeout to stop polling after MAX_POLLING_TIME
        timeoutRef.current = window.setTimeout(() => {
            stopPolling();
            setUploading(false);
            setJobId(null);
            toast.warning(
                `Import is taking too long (${MAX_POLLING_TIME / 1000 / 60} minutes). ` +
                `Please check the import status in the backend or try again later.`
            );
            setJobStatus((prev: any) => ({
                ...prev,
                status: "TIMEOUT",
                message: "Import timeout - processing took too long"
            }));
        }, MAX_POLLING_TIME);

        // Start polling every 2s
        pollRef.current = window.setInterval(async () => {
            try {
                pollAttemptsRef.current += 1;

                // Check if we've exceeded max attempts
                if (pollAttemptsRef.current > MAX_POLL_ATTEMPTS) {
                    stopPolling();
                    setUploading(false);
                    setJobId(null);
                    toast.warning(
                        `Import has reached the maximum number of checks (${MAX_POLL_ATTEMPTS} times). ` +
                        `Please check the import status in the backend.`
                    );
                    setJobStatus((prev: any) => ({
                        ...prev,
                        status: "TIMEOUT",
                        message: "Import timeout - exceeded max polling attempts"
                    }));
                    return;
                }

                const res = await axiosInstance.get(`${API_BASE_URL}/imports/jobs/${id}`);
                const data = res.data?.result;
                setJobStatus(data);
                const status = String(data?.status || "").toUpperCase();

                // Treat common terminal states from backend as completion
                const terminal = new Set(["COMPLETED", "FAILED", "SUCCESS", "DONE", "ERROR"]);
                if (terminal.has(status)) {
                    stopPolling();
                    setUploading(false);
                    setJobId(null);

                    if (status === "SUCCESS" || status === "COMPLETED" || status === "DONE") {
                        toast.success("Import successful!");

                        // Fetch lại dữ liệu mới khi import thành công
                        if (onRefreshData) {
                            try {
                                await onRefreshData();
                            } catch (err) {
                                console.error("Failed to refresh data after import", err);
                                toast.warning("Import successful but unable to reload data. Please refresh the page.");
                            }
                        }

                        onImported?.(data);
                    } else {
                        const errorMessage = data?.message || "Import failed";
                        toast.error(`Import failed: ${errorMessage}`);
                        onImported?.(data);
                    }
                }
            } catch (err: any) {
                console.error("Error polling job", err);
                // If we get consistent errors, stop polling after some attempts
                if (pollAttemptsRef.current > 10) {
                    stopPolling();
                    setUploading(false);
                    setJobId(null);
                    toast.error("Unable to check import status. Please check again later.");
                }
            }
        }, POLLING_INTERVAL) as unknown as number;
    };

    const handleUpload = async () => {
        if (!file) return toast.error("Please choose a file to import");

        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Not authenticated. Please login first.");
            return;
        }

        let username = "";
        try {
            const user = await getMyInfo(token);
            username = user?.username || user?.userName || "";
        } catch (err) {
            console.error("Failed to fetch profile for username", err);
        }

        if (!username) {
            toast.error("Unable to determine username from profile. Please login again.");
            return;
        }

        const form = new FormData();
        form.append("file", file);
        form.append("username", username);

        try {
            setUploading(true);
            const res = await axiosInstance.post(`${API_BASE_URL}/imports/questions`, form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const job = res.data?.result;
            if (job?.jobId) {
                setJobId(job.jobId);
                setJobStatus({ status: "PENDING" });
                startPolling(job.jobId);
                toast.info("Import started. Polling job status...");
            } else {
                setUploading(false);
                toast.error("Failed to start import");
            }
        } catch (err: any) {
            console.error("Import error", err);
            setUploading(false);
            toast.error(err?.response?.data?.message || "Upload failed");
        }
    };

    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, []);

    // load subjects to show to user (so they can see subject id)
    useEffect(() => {
        const load = async () => {
            try {
                const token = localStorage.getItem('token') || undefined;
                const res = await getAllSubjects(token as any);
                if (Array.isArray(res)) setSubjects(res);
            } catch (err) {
                console.error('Failed to load subjects', err);
            }
        };
        load();
    }, []);

    return (
        <div className="border rounded p-4 bg-white">
            <h4 className="font-semibold mb-2">Import questions from Excel</h4>
            <p className="text-sm text-gray-500 mb-3">Upload an .xls/.xlsx file with your questions. The backend will process the file and report progress.</p>

            <div className="mb-3 p-3 bg-gray-50 rounded">
                <h5 className="font-semibold">Required columns</h5>
                <p className="text-sm text-gray-600">Your Excel must contain these columns (header row):</p>
                <ul className="text-sm text-gray-700 list-disc list-inside mt-2">
                    <li><strong>content</strong> — question text</li>
                    <li><strong>optionA</strong>, <strong>optionB</strong>, <strong>optionC</strong>, <strong>optionD</strong> — options</li>
                    <li><strong>correctAnswer</strong> — one of A/B/C/D</li>
                    <li><strong>explanation</strong> — optional explanation text</li>
                    <li><strong>level</strong> — EASY | MEDIUM | HARD</li>
                    <li><strong>subjectId</strong> — numeric id of subject (click list below to view ids)</li>
                    <li><strong>username</strong> — username of the teacher importing</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">Example header row: <code>content,optionA,optionB,optionC,optionD,correctAnswer,explanation,level,subjectId,username</code></p>
            </div>

            <div className="mb-3">
                <button onClick={() => setShowSubjects(prev => !prev)} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm">{showSubjects ? 'Hide subjects' : 'Show subjects (click to reveal id)'}</button>
                {showSubjects && (
                    <div className="mt-2 max-h-40 overflow-y-auto border rounded p-2 bg-white">
                        {subjects.length === 0 ? (
                            <div className="text-sm text-gray-500">No subjects loaded</div>
                        ) : (
                            <ul className="space-y-1 text-sm">
                                {subjects.map((s: any) => (
                                    <li key={s.id} className="flex items-center justify-between">
                                        <span>{s.name}</span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setSelectedSubjectId(s.id)} className="text-xs px-2 py-1 bg-blue-50 rounded hover:bg-blue-100">Show id</button>
                                            <button onClick={() => { navigator.clipboard?.writeText(String(s.id)); toast.info('Copied id to clipboard'); }} className="text-xs px-2 py-1 bg-gray-50 rounded hover:bg-gray-100">Copy id</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {selectedSubjectId !== null && (
                            <div className="mt-2 text-sm text-gray-700">Selected subject id: <strong>{selectedSubjectId}</strong></div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex gap-2 items-center">
                <input type="file" accept=".xls,.xlsx,.csv" onChange={handleFileChange} />
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className={`px-3 py-1 rounded ${!file || uploading ? "bg-gray-300 text-gray-600" : "bg-blue-600 text-white"}`}
                >
                    {uploading ? "Uploading..." : "Start import"}
                </button>
            </div>

            {jobStatus && (
                <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <span className="font-semibold">Status: </span>
                            <strong className={`${jobStatus.status === "SUCCESS" || jobStatus.status === "COMPLETED" || jobStatus.status === "DONE"
                                    ? "text-green-600"
                                    : jobStatus.status === "FAILED" || jobStatus.status === "ERROR" || jobStatus.status === "TIMEOUT"
                                        ? "text-red-600"
                                        : "text-blue-600"
                                }`}>{jobStatus.status}</strong>
                        </div>
                        {uploading && (
                            <button
                                onClick={handleCancelImport}
                                className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded"
                            >
                                Stop tracking
                            </button>
                        )}
                    </div>
                    {jobStatus.total && (
                        <div className="mb-1">
                            <span>Processed: </span>
                            <strong>{jobStatus.processed || 0}/{jobStatus.total}</strong>
                            {jobStatus.total > 0 && (
                                <span className="text-gray-500 ml-2">
                                    ({Math.round(((jobStatus.processed || 0) / jobStatus.total) * 100)}%)
                                </span>
                            )}
                        </div>
                    )}
                    {uploading && elapsedTime > 0 && (
                        <div className="mb-1 text-gray-600">
                            <span>Elapsed time: </span>
                            <strong>{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</strong>
                            <span className="text-xs ml-2">(Max: {Math.floor(MAX_POLLING_TIME / 60000)} minutes)</span>
                        </div>
                    )}
                    {jobStatus.message && (
                        <div className="text-gray-600 mt-1 italic">{jobStatus.message}</div>
                    )}
                    {jobStatus.status === "TIMEOUT" && (
                        <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-yellow-800 text-xs">
                            ⚠️ Import has exceeded the wait time. Please check the status in the backend or try again later.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

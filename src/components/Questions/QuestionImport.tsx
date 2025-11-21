"use client";

import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { API_BASE_URL, getMyInfo, getAllSubjects } from "@/app/api/libApi/api";
import { toast } from "react-toastify";

type Props = {
    onImported?: (result?: any) => void;
};

export default function QuestionImport({ onImported }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [jobId, setJobId] = useState<number | null>(null);
    const [jobStatus, setJobStatus] = useState<any>(null);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [showSubjects, setShowSubjects] = useState(false);
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
    const pollRef = useRef<number | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] ?? null;
        setFile(f);
    };

    const startPolling = (id: number) => {
        // poll every 2s
        if (pollRef.current) window.clearInterval(pollRef.current);
        pollRef.current = window.setInterval(async () => {
            try {
                const res = await axiosInstance.get(`${API_BASE_URL}/imports/jobs/${id}`);
                const data = res.data?.result;
                setJobStatus(data);
                const status = String(data?.status || "").toUpperCase();
                // Treat common terminal states from backend as completion
                const terminal = new Set(["COMPLETED", "FAILED", "SUCCESS", "DONE", "ERROR"]);
                if (terminal.has(status)) {
                    if (pollRef.current) {
                        window.clearInterval(pollRef.current);
                        pollRef.current = null;
                    }
                    setUploading(false);
                    setJobId(null);
                    if (status === "SUCCESS") {
                        toast.success("Import completed");
                        onImported?.(data);
                    } else {
                        toast.error("Import failed");
                        onImported?.(data);
                    }
                }
            } catch (err: any) {
                console.error("Error polling job", err);
            }
        }, 2000) as unknown as number;
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
            if (pollRef.current) {
                window.clearInterval(pollRef.current);
                pollRef.current = null;
            }
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
                <div className="mt-3 text-sm">
                    <div>Status: <strong>{jobStatus.status}</strong></div>
                    {jobStatus.total && <div>Processed: {jobStatus.processed}/{jobStatus.total}</div>}
                    {jobStatus.message && <div className="text-gray-600">{jobStatus.message}</div>}
                </div>
            )}
        </div>
    );
}

// useUndoRedoWithBackend.ts
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/app/api/libApi/api";
import axiosInstance from "./axiosInstance";

interface UndoRedoHook {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  refreshStates: () => Promise<void>;
}

export default function useUndoRedoWithBackend(username: string, refreshData?: () => Promise<void>): UndoRedoHook {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    if (username) {
      refreshStates();
    }
  }, [username]);

  const undo = async () => {
    try {
      await axiosInstance.post(`${API_BASE_URL}/questions/${username}/undo`);
      await refreshStates();
      if (refreshData) await refreshData(); // reload questions
    } catch (err) {
      console.error("Undo failed", err);
    }
  };

  const redo = async () => {
    try {
      await axiosInstance.post(`${API_BASE_URL}/questions/${username}/redo`);
      await refreshStates();
      if (refreshData) await refreshData(); // reload questions
    } catch (err) {
      console.error("Redo failed", err);
    }
  };

  const refreshStates = async () => {
    try {
      const undoRes = await axiosInstance.get(`${API_BASE_URL}/questions/${username}/canUndo`);
      const redoRes = await axiosInstance.get(`${API_BASE_URL}/questions/${username}/canRedo`);
      setCanUndo(undoRes.data.result);
      setCanRedo(redoRes.data.result);
    } catch (err) {
      console.error("Failed to refresh undo/redo states", err);
    }
  };

  return { canUndo, canRedo, undo, redo, refreshStates };
}

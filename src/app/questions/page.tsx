"use client"
import React, { useState, useEffect } from "react";
import SubjectList from "@/components/Questions/SubjectList";
import QuestionList from "@/components/Questions/QuestionList";
import QuestionForm from "@/components/Questions/QuestionForm";
import QuestionImport from "@/components/Questions/QuestionImport";
import useUndoRedoWithBackend from "@/utils/useUndoRedoWithBackend";
import axiosInstance from "@/utils/axiosInstance";
import { getMyInfo } from "../api/libApi/api";
import { getClassroomByTeacherUsername } from "@/app/api/libApi/api";
import { toast } from "react-toastify";

export default function Page() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>("");
  // questions (server-paginated) are stored in questionsItems
  const [questionsItems, setQuestionsItems] = useState<any[]>([]);
  const [questionsNextCursor, setQuestionsNextCursor] = useState<number | null>(null);
  const [questionsHasNext, setQuestionsHasNext] = useState<boolean>(false);
  const [questionsLoading, setQuestionsLoading] = useState<boolean>(false);
  const [questionsLoadingMore, setQuestionsLoadingMore] = useState<boolean>(false);
  const [levelFilter, setLevelFilter] = useState<string | 'ALL'>('ALL');
  const [keyword, setKeyword] = useState<string>("");
  const questionsContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [username, setUsername] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  // searchTerm replaced by server-side `keyword`

  const refreshQuestions = async (opts?: { ignoreFilters?: boolean; level?: string; keyword?: string }) => {
    // reset and fetch first page
    if (!selectedSubject) return;
    setQuestionsLoading(true);
    try {
      const params: any = {};
      const useFilters = !opts?.ignoreFilters;
      const effectiveLevel = opts?.level ?? levelFilter;
      const effectiveKeyword = opts?.keyword ?? keyword;
      if (useFilters && effectiveLevel && effectiveLevel !== 'ALL') params.level = effectiveLevel;
      if (useFilters && effectiveKeyword) params.keyword = effectiveKeyword;
      // cursor=0 to start
      const res = await axiosInstance.get(`/questions/get-by-subject/${selectedSubject}`, { params: { ...params, cursor: 0 } });
      const result = res.data?.result ?? {};
      const items = result.items ?? [];
      setQuestionsItems(items);
      setQuestionsNextCursor(result.nextCursor ?? null);
      setQuestionsHasNext(Boolean(result.hasNext));
    } catch (err) {
      console.error('Failed to refresh questions', err);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const loadMoreQuestions = async () => {
    if (!selectedSubject) return;
    if (!questionsHasNext || questionsLoadingMore) return;
    const cursor = questionsNextCursor ?? 0;
    setQuestionsLoadingMore(true);
    try {
      const params: any = {};
      if (levelFilter && levelFilter !== 'ALL') params.level = levelFilter;
      if (keyword) params.keyword = keyword;
      const res = await axiosInstance.get(`/questions/get-by-subject/${selectedSubject}`, { params: { ...params, cursor } });
      const result = res.data?.result ?? {};
      const items = result.items ?? [];
      // dedupe by id
      setQuestionsItems((prev) => {
        const existing = new Set(prev.map((p) => p.id));
        const filtered = items.filter((it: any) => !existing.has(it.id));
        return [...prev, ...filtered];
      });
      setQuestionsNextCursor(result.nextCursor ?? null);
      setQuestionsHasNext(Boolean(result.hasNext));
    } catch (err) {
      console.error('Failed to load more questions', err);
    } finally {
      setQuestionsLoadingMore(false);
    }
  };

  const { canUndo, canRedo, undo, redo, refreshStates } = useUndoRedoWithBackend(username, refreshQuestions);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await getMyInfo(token);
        setUsername(res.username);
      } catch (err) {
        console.error("Failed to fetch user info", err);
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const token = localStorage.getItem("token");
        // Default: fetch all subjects
        let allSubjects: any[] = [];

        // If token exists, try to detect role and call teacher-specific endpoint
        if (token) {
          try {
            const user = await getMyInfo(token);
            if (user?.role === "TEACHER") {
              // Call the teacher-scoped subjects endpoint which accepts ?username=teacher001
              const tRes = await axiosInstance.get(`/classrooms/subjects`, { params: { username: user.username } });
              // Response shape: { code: 0, result: { content: [...] , ... } }
              allSubjects = (tRes.data?.result?.content) ?? [];
              setSubjects(allSubjects);
              return;
            }
          } catch (err) {
            console.error("Failed to fetch teacher subjects, falling back to public list", err);
            // fall through to fetch public subjects
          }
        }

        // // Fallback: regular subjects endpoint (returns result as array in older API)
        // const res = await axiosInstance.get("/classrooms/subjects");
        // // handle either result array or result.content
        // const maybeResult = res.data?.result;
        // if (Array.isArray(maybeResult)) {
        //   allSubjects = maybeResult;
        // } else if (maybeResult?.content && Array.isArray(maybeResult.content)) {
        //   allSubjects = maybeResult.content;
        // } else {
        //   allSubjects = [];
        // }

        setSubjects(allSubjects);
      } catch (err) {
        console.error("Failed to fetch subjects", err);
      }
    };

    loadSubjects();
  }, []);

  // attach scroll handler for infinite scroll in modal
  useEffect(() => {
    const el = questionsContainerRef.current;
    if (!el) return;

    const onScroll = () => {
      if (questionsLoadingMore || questionsLoading) return;
      const scrollBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (scrollBottom < 120) {
        loadMoreQuestions();
      }
    };

    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [questionsContainerRef, questionsLoadingMore, questionsLoading, questionsHasNext, questionsNextCursor]);

  const handleSubjectSelect = (subjectId: number, subjectName: string) => {
    setSelectedSubject(subjectId);
    setSelectedSubjectName(subjectName);
    // reset paged list; do not fetch yet. Fetch happens when user clicks "Show Questions"
    setQuestionsItems([]);
    setQuestionsNextCursor(null);
    setQuestionsHasNext(false);
  };

  const handleCreateOrUpdateQuestion = async (data: any) => {
    if (!selectedSubject) return;
    try {
      if (editingQuestion) {
        const res = await axiosInstance.put(`/questions/${editingQuestion.id}`, {
          ...data,
          subjectId: selectedSubject,
          username,
        });
        // If backend returns an error code in body, treat it as failure
        if (res?.data && typeof res.data.code !== 'undefined' && res.data.code !== 0) {
          throw new Error(res.data.message || 'Update failed');
        }
        setQuestionsItems((prev) => prev.map((q) => (q.id === editingQuestion.id ? res.data.result : q)));
        toast.success('Question updated successfully');
        setEditingQuestion(null);
        await refreshStates();
      } else {
        const res = await axiosInstance.post(`/questions/create`, {
          ...data,
          subjectId: selectedSubject,
          username,
        });
        if (res?.data && typeof res.data.code !== 'undefined' && res.data.code !== 0) {
          throw new Error(res.data.message || 'Create failed');
        }
        // Optimistically show the created item so the user sees it immediately
        setQuestionsItems((prev) => [res.data.result, ...prev]);
        // Then refresh the server-side list to make sure fields like `level` and `explanation`
        // (which may be filled or normalized by the backend) are up-to-date in the UI.
        try {
          await refreshQuestions();
        } catch (e) {
          // if refresh fails, we still keep the optimistic item but log the error
          console.error('Failed to refresh questions after create', e);
        }
        toast.success('Question created successfully');
        await refreshStates();
      }
    } catch (err: any) {
      const errorMsg = err?.response.data.message || 'Operation failed';
      toast.error(errorMsg);
      console.error('Create/Update error:', err);
    }
  };

  const handleEditQuestion = (id: number) => {
    const question = questionsItems.find((q) => q.id === id);
    if (question) {
      // set a shallow copy to ensure React sees a new object reference
      const copy = { ...question };
      console.debug('Editing question selected', copy.id);
      setEditingQuestion(copy);
      // ensure modal is visible when editing from the list
      setIsModalOpen(true);
    }
    // Keep modal open and show edit form inside it
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!username) return;
    try {
      const res = await axiosInstance.delete(`/questions/${username}/${id}/delete`);
      if (res?.data && typeof res.data.code !== 'undefined' && res.data.code !== 0) {
        throw new Error(res.data.message || 'Delete failed');
      }
      setQuestionsItems((prev) => prev.filter((q) => q.id !== id));
      toast.success('Question deleted successfully');
      await refreshStates();
    } catch (err: any) {
      const errorMsg = err?.response.data.message || 'Delete failed';
      toast.error(errorMsg);
      console.error('Delete error:', err);
    }
  };
  // client-side filtering is removed in favor of server-side keyword

  return (
    <div className="p-6 bg-gray-100 min-h-screen mt-24">
      <h1 className="text-2xl font-bold mb-6">Question Management</h1>
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar: Subjects */}
        <div className="col-span-3">
          <div className="space-y-6">
            {/* Subjects Section */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-semibold mb-3">Subjects</h2>
              <SubjectList
                subjects={subjects}
                onSelect={handleSubjectSelect}
                selectedSubjectId={selectedSubject}
              />
            </div>

          </div>
        </div>

        {/* Right Main Area */}
        <div className="col-span-9">
          {selectedSubject ? (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedSubjectName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Manage all questions for this subject</p>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    setTimeout(() => refreshQuestions({ ignoreFilters: true }), 0);
                  }}
                  className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium"
                >
                  📝 Create / Edit Questions
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  💡 <strong>Tip:</strong> Click "Create / Edit Questions" to add new questions, edit existing ones, or manage the full question list with search and filtering.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-12 shadow-sm text-center">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Select a Subject</h2>
              <p className="text-gray-500">
                Choose a subject from the left sidebar to view and manage its questions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-lg flex h-[90vh] w-[95%] max-w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}>
            {/* Left Pane: Question List */}
            <div className={`w-1/2 flex flex-col border-r border-gray-200 transition-all duration-200`}>
              <div className="flex justify-between items-center mb-4 p-6 border-b">
                <h3 className="text-xl font-bold">Questions</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black">✕</button>
              </div>
              <div className="px-6 mb-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={keyword}
                  onChange={(e) => { const v = e.target.value; setKeyword(v); setTimeout(() => refreshQuestions({ keyword: v }), 300); }}
                  className="flex-1 block border rounded-lg p-2"
                />
                <select value={levelFilter} onChange={(e) => { const v = e.target.value as any; setLevelFilter(v); refreshQuestions({ level: v }); }} className="border rounded px-2 py-1 text-sm">
                  <option value="ALL">All</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              <div ref={questionsContainerRef} className="flex-1 overflow-y-auto px-6">
                {questionsLoading && <div className="text-center text-sm text-gray-500">Loading...</div>}
                {!questionsLoading && questionsItems.length === 0 && (
                  <div className="text-sm text-gray-500">No questions</div>
                )}
                <QuestionList
                  questions={questionsItems}
                  onEdit={handleEditQuestion}
                  onDelete={handleDeleteQuestion}
                />
                {questionsLoadingMore && (
                  <div className="py-3 text-center text-sm text-gray-500">Loading more...</div>
                )}
              </div>
            </div>

            {/* Right Pane: Create or Edit Form */}
            <div className="w-1/2 flex flex-col border-l border-gray-200 p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{editingQuestion ? 'Edit Question' : 'Create Question'}</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditingQuestion(null); }} className="text-gray-500 hover:text-black">Clear</button>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black">Close</button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <QuestionForm
                  initialData={editingQuestion ?? {}}
                  onSubmit={handleCreateOrUpdateQuestion}
                  onUndo={undo}
                  onRedo={redo}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onCancel={() => setEditingQuestion(null)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

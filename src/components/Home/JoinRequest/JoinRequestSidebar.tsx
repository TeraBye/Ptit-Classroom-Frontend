import JoinRequestList from "./JoinRequestList";
import { useJoinRequests } from "@/utils/useJoinRequests";

type JoinRequestSidebarProps = {
  classroomId: number | null;
  show: boolean;
  onClose?: () => void;
  username?: string | null;
};

export default function JoinRequestSidebar({
  classroomId,
  show,
  onClose,
  username,
}: JoinRequestSidebarProps) {
  const { requests, loading, processing, updateStatus } = useJoinRequests(
    classroomId,
    show,
    username
  );

  if (!show) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-[39]"
        onClick={onClose}
        role="presentation"
      />
      <div className="w-80 bg-white border-l h-full flex flex-col fixed right-0 top-0 z-40 shadow-xl">
        <div className="p-4 border-b font-semibold text-lg flex justify-between items-center">
          <span>Join Requests</span>
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>

        {loading ? (
          <div className="text-gray-500 p-4 text-center">Loading...</div>
        ) : (
          <JoinRequestList
            requests={requests}
            processing={processing}
            updateStatus={updateStatus}
          />
        )}
      </div>
    </>
  );
}

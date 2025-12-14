import type { MouseEvent } from "react";

type JoinRequest = {
  id?: number;
  avatar?: string;
  fullName: string;
  username: string;
  requestedAt: string | number | Date;
};

type Props = {
  r: JoinRequest;
  processing?: boolean;
  // Handlers may be async (return Promise<void>) in callers, allow both
  onApprove?: (e?: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  onReject?: (e?: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
};

export default function JoinRequestItem({ r, processing = false, onApprove = () => {}, onReject = () => {} }: Props) {
  return (
    <li className="border rounded-lg p-3">
      <div className="flex gap-2 mb-2">
        <img
          src={r.avatar}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="font-medium text-sm">{r.fullName}</div>
          <div className="text-xs text-gray-500">{r.username}</div>
          <div className="text-xs text-gray-400 mt-1">
            {new Date(r.requestedAt).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          disabled={processing}
          onClick={onApprove}
          className="flex-1 bg-green-600 text-white text-sm px-2 py-1 rounded"
        >
          {processing ? "..." : "Approve"}
        </button>
        <button
          disabled={processing}
          onClick={onReject}
          className="flex-1 bg-red-500 text-white text-sm px-2 py-1 rounded"
        >
          {processing ? "..." : "Reject"}
        </button>
      </div>
    </li>
  );
}

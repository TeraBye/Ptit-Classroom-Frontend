import JoinRequestItem from "./JoinRequestItem";
import type { MouseEvent } from "react";

type Request = {
  id: number;
  avatar?: string;
  fullName: string;
  username: string;
  requestedAt: string | number | Date;
};

type Props = {
  requests: Request[];
  processing?: boolean;
  // updateStatus may be async in callers (returns Promise<void>), so allow Promise return
  updateStatus: (id: number, status: "APPROVED" | "REJECTED") => void | Promise<void>;
};

export default function JoinRequestList({ requests, processing = false, updateStatus }: Props) {
  if (requests.length === 0)
    return <div className="text-gray-500 p-4 text-center">No pending requests</div>;

  return (
    <ul className="space-y-4 p-4">
      {requests.map((r) => (
        <JoinRequestItem
          key={r.id}
          r={r}
          processing={processing}
          onApprove={(e?: MouseEvent<HTMLButtonElement>) => updateStatus(r.id, "APPROVED")}
          onReject={(e?: MouseEvent<HTMLButtonElement>) => updateStatus(r.id, "REJECTED")}
        />
      ))}
    </ul>
  );
}

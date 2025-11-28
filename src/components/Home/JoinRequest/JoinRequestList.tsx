import JoinRequestItem from "./JoinRequestItem";

export default function JoinRequestList({ requests, processing, updateStatus }) {
  if (requests.length === 0)
    return <div className="text-gray-500 p-4 text-center">No pending requests</div>;

  return (
    <ul className="space-y-4 p-4">
      {requests.map((r) => (
        <JoinRequestItem
          key={r.id}
          r={r}
          processing={processing}
          onApprove={() => updateStatus(r.id, "APPROVED")}
          onReject={() => updateStatus(r.id, "REJECTED")}
        />
      ))}
    </ul>
  );
}

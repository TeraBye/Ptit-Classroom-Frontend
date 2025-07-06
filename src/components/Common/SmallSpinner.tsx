"use client";
import { Loader2 } from "lucide-react";

export default function SmallSpinner() {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className="animate-spin text-black" size={20} />
    </div>
  );
}

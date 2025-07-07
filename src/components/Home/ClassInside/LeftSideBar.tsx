"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AssignmentModal } from "./ModalAssigmentCreation";

export function LeftSidebar() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="w-full md:w-64 bg-white rounded-lg overflow-hidden shadow-md p-4 text-center">
      <div className="flex justify-center">
        <Image src="https://i.pinimg.com/736x/5c/57/b9/5c57b919d1c2fc9975a30ccaa06f1448.jpg" alt="John Doe" width={100} height={100} className="rounded-full" />
      </div>
      <h2 className="mt-4 text-xl font-bold">Huynh Trung Tru</h2>
      <p className="text-gray-600">Lập trình hướng đối tượng</p>

      <div className="mt-4">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Assignments</p>
            <p className="font-semibold">10</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Exams</p>
            <p className="font-semibold">2</p>
          </div>
        </div>
      </div>

      <Button className="mt-4 w-full" variant="outline">Join meeting</Button>
      <Button onClick={() => setShowModal(true)} className="mt-4 w-full" variant="outline">New lesson</Button>

      <AssignmentModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}

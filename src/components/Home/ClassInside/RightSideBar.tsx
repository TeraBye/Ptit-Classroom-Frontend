// components/UserProfile/RightSidebar.tsx
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function RightSidebar() {
  return (
    <div className="w-full md:w-64 flex flex-col gap-4 ">
      <Card className="p-4 text-center">
        <Image src="https://i.pinimg.com/736x/4f/d3/b8/4fd3b89d34c0bb77aaae041dbb3b717a.jpg" alt="Workwise" width={50} height={50} className="mx-auto" />
        <h3 className="mt-2 font-semibold">EXAM</h3>
        <p className="text-xs text-gray-500">You currently have no exams.</p>
        <Button className="mt-3 w-full">Do exam</Button>
        <div className="text-blue-500 text-xs mt-1 cursor-pointer">Learn More</div>
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold mb-2">Assignments due soon</h4>
        {['Assignment 1', 'Assignment 2', 'Assignment 3'].map((job, index) => (
          <div key={index} className="mb-2">
            <p className="text-sm font-medium">{job}</p>
            <p className="text-xs text-gray-500">Due in 3 hours!</p>
          </div>
        ))}
      </Card>
    </div>
  );
}
 import { LeftSidebar } from "@/components/Home/ClassInside/LeftSideBar";
 import Exam from "./Exam";
 
 export default function ExamContainer() {
 return (
  <div className="flex flex-col md:flex-row gap-6 p-6 mt-20 h-screen">
    <LeftSidebar />
    <div className="flex-1 overflow-y-auto flex flex-col gap-4 basis-3/4">
        <Exam />
    </div>
    </div>
    );
 }

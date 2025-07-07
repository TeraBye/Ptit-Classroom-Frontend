import { LeftSidebar } from "./LeftSideBar";
import { CenterContent } from "./Center";
import { RightSidebar } from "./RightSideBar";

export default function UserProfileCard() {
  const posts = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 mt-20 h-screen">
      <LeftSidebar />

      <div className="flex-1 overflow-y-auto flex flex-col gap-4">
        {posts.map((postId) => (
          <CenterContent key={postId} />
        ))}
      </div>

      <RightSidebar />
    </div>
  );
}

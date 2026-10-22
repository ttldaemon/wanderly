import { NavTab, UserSummary } from "@/types/wanderly";
import { Compass, Plus } from "lucide-react";

interface EmptyUserToursProps {
  selectedUser: UserSummary | null;
  activeTab: NavTab;
  setPostModalOpen: (isOpen: boolean) => void;
}

export default function EmptyUserTours({
  selectedUser,
  activeTab,
  setPostModalOpen,
}: EmptyUserToursProps) {
  return (
    <div className="flex flex-col items-center gap-3 pt-24">
      <Compass size={28} className="text-forest" />
      <h2 className="text-lg font-bold text-ink">No tours available</h2>
      <p className="text-sm text-ink-soft">
        {selectedUser
          ? `${selectedUser.name} hasn't shared any public tours yet.`
          : activeTab === "home"
            ? "No Tours Publically available yet"
            : "You haven't published any tours yet."}
      </p>

      {!selectedUser && activeTab === "your-posts" && (
        <button
          type="button"
          onClick={() => setPostModalOpen(true)}
          className="mt-3 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={16} className="mr-2 inline" />
          Create a Post
        </button>
      )}
    </div>
  );
}

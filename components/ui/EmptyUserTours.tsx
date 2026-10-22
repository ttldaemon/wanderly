import { NavTab, UserSummary } from "@/types/wanderly";
import { Feather, MountainSnow, Plus } from "lucide-react";
import Button from "./Button";

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
      <MountainSnow size={28} className="text-forest" />
      <h2 className="text-lg font-bold text-ink">No tours available</h2>
      <p className="text-sm text-ink-soft">
        {selectedUser
          ? `${selectedUser.name} hasn't shared any public tours yet.`
          : activeTab === "home"
            ? "No Tours Publically available yet"
            : "You haven't published any tours yet."}
      </p>

      {!selectedUser && activeTab === "your-posts" && (
        <Button
          variant="primary"
          size="md"
          icon={<Feather size={18} className="mr-1 inline" />}
          onClick={() => setPostModalOpen(true)}
        >
          Create a Post
        </Button>
      )}
    </div>
  );
}

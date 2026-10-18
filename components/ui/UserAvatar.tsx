import { UserSummary } from "@/types/wanderly";
import {getUserInitials} from "@/utils/utilityFn"
interface UserProps {
  user: UserSummary,
  isLeftPanel?: boolean
}

export default function UserAvatar({ user, isLeftPanel = false }: UserProps) {
  return (
    <div className="flex items-center gap-3">
      {user.imgUrl ? (
        <img
          src={user.imgUrl}
          alt={user.name}
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-sm font-semibold text-white">
          {getUserInitials(user.name)}
        </div>
      )}
      <div className={`min-w-0 flex-1 ${isLeftPanel && "hidden xl:block"} `}>
        <p className="truncate text-sm font-semibold text-ink">
          {user.name}
        </p>
        <p className="truncate text-xs text-ink-soft">
          @{user.userName}
        </p>
      </div>
    </div>
  )
}
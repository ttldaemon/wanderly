"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, Feather, Home, LogOut, User } from "lucide-react";
import Button from "./ui/Button";
import { NavTab, UserSummary } from "@/types/wanderly";

interface LeftPanelProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenPostModal: () => void;
  currentUser?: UserSummary | null;
}

function getUserInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "W";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function LeftPanel({
  activeTab,
  onSelectTab,
  onOpenPostModal,
  currentUser,
}: LeftPanelProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
    } catch {
      setLoggingOut(false);
    }
  }

  const navItems: { id: NavTab; label: string; icon: typeof Home }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "your-posts", label: "Your Posts", icon: User },
  ];

  return (
    <>
      <aside
        aria-label="Primary Navigation"
        className="sticky top-0 hidden h-screen w-20 shrink-0 flex-col justify-between border-r border-sand bg-cream px-3 py-6 md:flex xl:w-64 xl:px-5"
      >
        <div className="flex flex-col gap-6">
          <button
            type="button"
            onClick={() => onSelectTab("home")}
            className="flex items-center gap-3 rounded-full px-3 py-2 text-left transition hover:bg-cream-200"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest text-white shadow-sm">
              <Compass size={22} />
            </div>
            <span className="hidden text-xl font-bold tracking-tight text-ink xl:inline">
              Wanderly
            </span>
          </button>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={[
                    "flex items-center gap-4 rounded-full px-4 py-3 text-base transition",
                    isActive
                      ? "bg-cream-200 font-semibold text-forest"
                      : " font-medium text-ink hover:bg-cream-100",
                  ].join(" ")}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
                  <span className="hidden xl:inline">{item.label}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-4 rounded-full px-4 py-3 text-base font-medium text-ink-muted transition hover:bg-clay-light hover:text-clay disabled:opacity-50"
            >
              <LogOut size={22} strokeWidth={1.8} />
              <span className="hidden xl:inline">
                {loggingOut ? "Logging out..." : "Logout"}
              </span>
            </button>
          </nav>

          <div className="pt-2">
            <div className="hidden xl:block">
              <Button
                variant="primary"
                size="sm"
                fullWidth
                icon={<Feather size={18} />}
                onClick={onOpenPostModal}
              >
                Post
              </Button>
            </div>
            <button
              type="button"
              aria-label="Create Post"
              onClick={onOpenPostModal}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-forest text-white shadow-md transition hover:bg-forest-dark xl:hidden"
            >
              <Feather size={20} />
            </button>
          </div>
        </div>

        {currentUser && (
          <div className="flex items-center gap-3 rounded-full border border-sand bg-cream-100/70 p-2.5 xl:px-4 xl:py-3">
            {currentUser.imgUrl ? (
              <img
                src={currentUser.imgUrl}
                alt={currentUser.name}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-sm font-semibold text-white">
                {getUserInitials(currentUser.name)}
              </div>
            )}
            <div className="hidden min-w-0 flex-1 xl:block">
              <p className="truncate text-sm font-semibold text-ink">
                {currentUser.name}
              </p>
              <p className="truncate text-xs text-ink-soft">
                @{currentUser.userName}
              </p>
            </div>
          </div>
        )}
      </aside>

      <nav
        aria-label="Mobile Navigation"
        className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-sand bg-cream/95 px-4 py-2.5 backdrop-blur-md md:hidden"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-xs ${
                isActive ? "font-semibold text-forest" : "text-ink-muted"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onOpenPostModal}
          className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-white shadow-sm"
        >
          <Feather size={16} />
          <span>Post</span>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-xs text-clay"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>
    </>
  );
}

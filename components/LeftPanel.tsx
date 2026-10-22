"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Feather, Home, LogOut, User } from "lucide-react";
import Button from "./ui/Button";
import { NavTab, UserSummary } from "@/types/wanderly";

import UserAvatar from "./ui/UserAvatar";
import { useAuth } from "@/context/authContext";
import NavBtn from "./ui/NavBtn";
import Logo from "./ui/Logo";

interface LeftPanelProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenPostModal: () => void;
  currentUser?: UserSummary | null;
}

export default function LeftPanel({
  activeTab,
  onSelectTab,
  onOpenPostModal,
  currentUser,
}: LeftPanelProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const { setUser } = useAuth();

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      setUser(null);
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
          >
            <Logo />
          </button>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              return (
                <NavBtn
                  key={item.id}
                  item={item}
                  onSelectTab={onSelectTab}
                  activeTab={activeTab}
                />
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
          <div className="flex items-center max-xl:justify-center rounded-full border border-sand py-2 bg-cream-100/70 xl:px-4 xl:py-3">
            <UserAvatar user={currentUser} isLeftPanel />
          </div>
        )}
      </aside>

      {/*Bottom Nav when left panel becomes hidden*/}
      <nav
        aria-label="Mobile Navigation"
        className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-sand bg-cream/95 px-4 py-2.5 backdrop-blur-md md:hidden"
      >
        {navItems.map((item) => {
          return (
            <NavBtn
              key={item.id}
              item={item}
              onSelectTab={onSelectTab}
              activeTab={activeTab}
              isMobile
            />
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

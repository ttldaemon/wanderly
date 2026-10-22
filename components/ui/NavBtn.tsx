import { NavTab } from "@/types/wanderly";
import { Home } from "lucide-react";

interface NavBtnProps {
  item: {
    id: NavTab;
    label: string;
    icon: typeof Home;
  };
  onSelectTab: (tab: NavTab) => void;
  activeTab: string;
  isMobile?: boolean;
}

const navBtnStyles = {
  base: "transition",
  desktop: {
    container: "flex items-center gap-4 rounded-full px-4 py-3 text-base",
    active: "bg-cream-200 font-semibold text-forest",
    inactive: "font-medium text-ink hover:bg-cream-100",
    label: "hidden xl:inline",
  },
  mobile: {
    container: "flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-xs",
    active: "font-semibold text-forest",
    inactive: "text-ink-muted",
    label: "",
  },
};

export default function NavBtn({
  item,
  onSelectTab,
  activeTab,
  isMobile = false,
}: NavBtnProps) {
  const Icon = item.icon;
  const isActive = activeTab === item.id;
  const styles = isMobile ? navBtnStyles.mobile : navBtnStyles.desktop;

  return (
    <button
      type="button"
      onClick={() => onSelectTab(item.id)}
      className={[
        navBtnStyles.base,
        styles.container,
        isActive ? styles.active : styles.inactive,
      ].join(" ")}
    >
      <Icon
        size={isMobile ? 20 : 22}
        strokeWidth={isMobile ? undefined : isActive ? 2.4 : 1.8}
      />

      <span className={styles.label}>{item.label}</span>
    </button>
  );
}
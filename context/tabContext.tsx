"use client";

import { NavTab, UserSummary } from "@/types/wanderly";
import { createContext, ReactNode, useContext, useState } from "react";

interface TabContextType {
  selectedUser: UserSummary | null;
  setSelectedUser: (user: UserSummary | null) => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

const TabCtx = createContext<TabContextType | undefined>(undefined);

export function TabProvider({ children }: { children: ReactNode }) {
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>("home");

  const value: TabContextType = {
    selectedUser,
    setSelectedUser,
    activeTab,
    setActiveTab,
  };

  return <TabCtx.Provider value={value}>{children}</TabCtx.Provider>;
}

export function useTab(): TabContextType {
  const ctx = useContext(TabCtx);

  if (ctx === undefined) {
    throw new Error("useTab must be used inside a Tab Provider");
  }

  return ctx;
}

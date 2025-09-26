"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface NavigationContextType {
  activeMainTab: string;
  setActiveMainTab: (tab: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [activeMainTab, setActiveMainTab] = useState("voting");

  return (
    <NavigationContext.Provider
      value={{
        activeMainTab,
        setActiveMainTab,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};

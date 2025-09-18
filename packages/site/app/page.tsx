"use client";

import { useState } from "react";
import { FHESimpleVoting } from "@/components/FHESimpleVoting";
import { TabNavigation } from "@/components/TabNavigation";

export default function Home() {
  const [activeTab, setActiveTab] = useState("active");

  return (
    <div className="flex flex-col gap-8 items-center w-full h-full px-3 md:px-0">
      {/* Tab Navigation - Ẩn khi ở chế độ voting */}
      {activeTab !== "voting" && (
        <div className="w-full bg-white shadow-sm z-10 px-4 py-4">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      )}
      
      {/* Main Content */}
      <div className="w-full flex-1 overflow-auto">
        <FHESimpleVoting activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}

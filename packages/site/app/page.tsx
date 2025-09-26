"use client";

import { FHEVoting } from "@/components/FHEVoting";
import { useNavigation } from "@/contexts/NavigationContext";

export default function Home() {
  const { activeMainTab } = useNavigation();

  return (
    <div className="h-full">
      {/* Main Content */}
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {activeMainTab === "voting" && (
          <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
            <FHEVoting />
          </div>
        )}
        
        {activeMainTab === "governance" && (
          <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
            <div className="text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">DAO Governance</h2>
              <p className="text-gray-600 mb-6">Decentralized governance features coming soon...</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  This section will include proposal creation, voting on governance decisions, 
                  and community-driven protocol upgrades.
                </p>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}

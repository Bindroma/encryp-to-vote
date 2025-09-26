"use client";

import { useNavigation } from "../contexts/NavigationContext";
import { WalletButton } from "./WalletButton";

export const AppHeader = () => {
  const { activeMainTab, setActiveMainTab } = useNavigation();
  const tabs = [
    { 
      id: "voting", 
      label: "Voting"
    },
    { 
      id: "governance", 
      label: "Governance (Soon)",
      disabled: true
    },
  ];

  return (
    <div className="w-full app-header-bg border-b border-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand + Navigation Tabs */}
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <h1 className="text-4xl font-bold text-white">EncryptoVote</h1>
            </div>
            
            {/* Navigation Tabs */}
            <nav className="hidden md:flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveMainTab(tab.id)}
                disabled={tab.disabled}
                className={`group relative px-4 py-2 rounded text-sm font-bold transition-all duration-200 ${
                  tab.disabled
                    ? "text-gray-500 cursor-not-allowed"
                    : activeMainTab === tab.id
                    ? "primary-accent"
                    : "text-secondary hover:text-primary hover:bg-gray-700"
                }`}
              >
                <div className="font-semibold">
                  {tab.label}
                </div>
                
              </button>
            ))}
            </nav>
          </div>

          {/* Wallet Button */}
          <div className="flex items-center">
            <WalletButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <WalletButton />
            <button
              onClick={() => {
                // Toggle mobile menu - you can implement this later
                console.log("Mobile menu toggle");
              }}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-600">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id)}
                className={`w-full flex items-center px-4 py-2 rounded text-base font-bold ${
                  activeMainTab === tab.id
                    ? "primary-accent"
                    : "text-secondary hover:text-primary hover:bg-gray-700"
                }`}
              >
                <div className="font-semibold">
                  {tab.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
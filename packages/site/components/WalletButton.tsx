"use client";

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState, useEffect, useRef } from 'react';

export const WalletButton = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      // Có thể thêm toast notification ở đây
    }
  };

  // Mount check để tránh hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Tránh hydration mismatch - chỉ render sau khi mount
  if (!isMounted) {
    return (
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-[200px]">
        Connect Wallet
      </button>
    );
  }

  if (isConnected) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-[200px]"
        >
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </button>
        
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-[200px] bg-white rounded shadow-lg z-50 border">
            {/* Dòng trên: Địa chỉ + icon copy */}
            <div className="px-4 py-2 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-gray-700">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <button
                  onClick={copyAddress}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  title="Copy address"
                >
                  📋
                </button>
              </div>
            </div>
            
            {/* Dòng dưới: Disconnect */}
            <div className="px-4 py-2">
              <button
                onClick={() => {
                  disconnect();
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left text-sm text-red-600 hover:text-red-800 hover:bg-red-50 py-1 px-2 rounded"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        // Chỉ dùng connector đầu tiên (injected)
        if (connectors[0]) {
          connect({ connector: connectors[0] });
        }
      }}
      disabled={isPending}
      className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded w-[200px]"
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
};

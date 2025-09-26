"use client";

import { useState } from "react";

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSession: (title: string, question: string, startTime: string, endTime: string) => void;
  isCreating: boolean;
}

export const CreateSessionModal = ({ 
  isOpen, 
  onClose, 
  onCreateSession, 
  isCreating 
}: CreateSessionModalProps) => {
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold mb-4 pr-8">Create FHE Voting Session</h3>
        
        {/* Proposal Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proposal Title:
          </label>
          <input
            type="text"
            placeholder="Enter session title (e.g., FHE Voting System Implementation)"
            className="w-full p-2 border border-gray-300 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter a descriptive title for this voting session
          </p>
        </div>

        {/* Proposal Question */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proposal Question:
          </label>
          <input
            type="text"
            placeholder="Do you agree to implement the FHE Voting system trial?"
            className="w-full p-2 border border-gray-300 rounded"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your custom voting question
          </p>
        </div>

        {/* Time Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Range:
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Start Time:</label>
              <input
                type="datetime-local"
                className="w-full p-2 border border-gray-300 rounded"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">End Time:</label>
              <input
                type="datetime-local"
                className="w-full p-2 border border-gray-300 rounded"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Set your preferred start and end times
          </p>
        </div>

        {/* Voting Options Info */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Voting Options:
          </label>
          <div className="space-y-2">
            <div className="flex items-center p-3 bg-gray-50 rounded border">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">1</span>
              <span className="font-medium">Yes (Agree)</span>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded border">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">2</span>
              <span className="font-medium">No (Disagree)</span>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded border">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">3</span>
              <span className="font-medium">Abstain (No Opinion)</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Fixed options for FHE Voting system
          </p>
        </div>
        
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => onCreateSession(title, question, startTime, endTime)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isCreating || !startTime || !endTime}
          >
            {isCreating ? "Creating..." : "Create Session"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

"use client";

import { useState } from 'react';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export default function JobDescriptionInput({
  value,
  onChange,
  onSubmit,
  isLoading,
}: JobDescriptionInputProps) {
  const characterCount = value.length;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Job Description
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job description here..."
        className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={isLoading}
      />

      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-gray-500">
          {characterCount.toLocaleString()} characters
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => onChange('')}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
            disabled={isLoading || !value}
          >
            Clear
          </button>

          <button
            onClick={onSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isLoading || !value.trim()}
          >
            {isLoading ? 'Optimizing...' : 'Optimize Resume'}
          </button>
        </div>
      </div>
    </div>
  );
}

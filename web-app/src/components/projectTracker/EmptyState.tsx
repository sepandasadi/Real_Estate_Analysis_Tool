import React from 'react';

interface EmptyStateProps {
  onGetStarted: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onGetStarted }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-12 text-center">
      <div className="max-w-2xl mx-auto">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-full shadow-lg">
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Project Tracker
        </h2>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-8">
          Track your renovation project from start to finish with comprehensive tools for
          managing timelines, budgets, permits, contractors, and more.
        </p>

        {/* Features List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl">📅</div>
            <div>
              <h3 className="font-semibold text-gray-900">Timeline & Budget</h3>
              <p className="text-sm text-gray-600">Track phases with estimated vs actual costs</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
            <div className="text-2xl">📋</div>
            <div>
              <h3 className="font-semibold text-gray-900">Permits & Inspections</h3>
              <p className="text-sm text-gray-600">Manage all permits and approvals</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl">🏗️</div>
            <div>
              <h3 className="font-semibold text-gray-900">Materials & Vendors</h3>
              <p className="text-sm text-gray-600">Track orders and delivery schedules</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="font-semibold text-gray-900">Issues & Delays</h3>
              <p className="text-sm text-gray-600">Document problems and their impact</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg">
            <div className="text-2xl">⭐</div>
            <div>
              <h3 className="font-semibold text-gray-900">Contractor Performance</h3>
              <p className="text-sm text-gray-600">Rate and track contractor quality</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
            <div className="text-2xl">📊</div>
            <div>
              <h3 className="font-semibold text-gray-900">Project Dashboard</h3>
              <p className="text-sm text-gray-600">Auto-calculated metrics and alerts</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onGetStarted}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
        >
          Get Started
        </button>

        <p className="text-sm text-gray-500 mt-4">
          All data is saved automatically to your browser's local storage
        </p>
      </div>
    </div>
  );
};

export default EmptyState;

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
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-full shadow-lg">
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Partnership Management
        </h2>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-8">
          Manage multi-partner investments with comprehensive tools for tracking capital,
          distributions, waterfall calculations, and partner performance metrics.
        </p>

        {/* Features List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl">👥</div>
            <div>
              <h3 className="font-semibold text-gray-900">Partner Information</h3>
              <p className="text-sm text-gray-600">Track ownership, roles, and capital</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl">💰</div>
            <div>
              <h3 className="font-semibold text-gray-900">Capital Contributions</h3>
              <p className="text-sm text-gray-600">Record all partner investments</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
            <div className="text-2xl">💧</div>
            <div>
              <h3 className="font-semibold text-gray-900">Waterfall Distribution</h3>
              <p className="text-sm text-gray-600">Multi-tier profit distribution calculator</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl">📊</div>
            <div>
              <h3 className="font-semibold text-gray-900">Distribution Tracking</h3>
              <p className="text-sm text-gray-600">Monitor all partner distributions</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg">
            <div className="text-2xl">💵</div>
            <div>
              <h3 className="font-semibold text-gray-900">Cash Flow Management</h3>
              <p className="text-sm text-gray-600">Track inflows and outflows</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
            <div className="text-2xl">📈</div>
            <div>
              <h3 className="font-semibold text-gray-900">Performance Metrics</h3>
              <p className="text-sm text-gray-600">ROI, MOIC, IRR calculations</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onGetStarted}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
        >
          Add Your First Partner
        </button>

        <p className="text-sm text-gray-500 mt-4">
          All data is saved automatically to your browser's local storage
        </p>
      </div>
    </div>
  );
};

export default EmptyState;

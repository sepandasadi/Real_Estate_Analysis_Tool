import React, { useState } from 'react';
import { PropertyHistoryEntry } from '../utils/localStorage';

interface PropertyHistoryProps {
  history: PropertyHistoryEntry[];
  onSelectProperty: (formData: PropertyHistoryEntry['formData']) => void;
  onRemoveProperty: (id: string) => void;
  onClearHistory: () => void;
}

const PropertyHistory: React.FC<PropertyHistoryProps> = ({
  history,
  onSelectProperty,
  onRemoveProperty,
  onClearHistory,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (history.length === 0) {
    return null;
  }

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Recent Searches</h3>
              <p className="text-sm text-gray-600">Click to load a previous property analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClearHistory}
              className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-medium"
              title="Clear all history"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-primary-200 rounded-lg transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <svg
                className={`w-5 h-5 text-gray-700 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* History List */}
      {isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="group relative bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer"
                onClick={() => onSelectProperty(entry.formData)}
              >
                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveProperty(entry.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  title="Remove from history"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Address Icon */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-primary-100 p-2 rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate" title={entry.displayAddress}>
                      {entry.formData.address}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {entry.formData.city}, {entry.formData.state} {entry.formData.zip}
                    </p>
                  </div>
                </div>

                {/* Property Details */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Purchase Price:</span>
                    <span className="font-semibold text-gray-800">
                      ${entry.formData.purchasePrice.toLocaleString()}
                    </span>
                  </div>
                  {entry.formData.rehabCost !== undefined && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Rehab Cost:</span>
                      <span className="font-semibold text-gray-800">
                        ${entry.formData.rehabCost.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-2 border-t border-gray-200">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatTimestamp(entry.timestamp)}</span>
                </div>

                {/* Hover Indicator */}
                <div className="absolute inset-0 border-2 border-primary-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyHistory;

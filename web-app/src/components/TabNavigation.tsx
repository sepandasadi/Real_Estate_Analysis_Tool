import React from 'react';
import { TabMode, getTabsByMode } from '../types/tabs';

interface TabNavigationProps {
  activeTab: string;
  mode: TabMode;
  onTabChange: (tabId: string) => void;
  onModeChange: (mode: TabMode) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  mode,
  onTabChange,
  onModeChange
}) => {
  const visibleTabs = getTabsByMode(mode);

  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      {/* Mode Toggle */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Analysis Mode</h3>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onModeChange(TabMode.SIMPLE)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                mode === TabMode.SIMPLE
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Simple Mode
            </button>
            <button
              onClick={() => onModeChange(TabMode.ADVANCED)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                mode === TabMode.ADVANCED
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Advanced Mode
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {mode === TabMode.SIMPLE
            ? 'Viewing 6 essential tabs for quick analysis'
            : 'Viewing all 14 tabs with advanced features'}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="overflow-x-auto">
        <div className="flex px-4 py-2 gap-2 min-w-max">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-50 text-primary-700 border-2 border-primary-500 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 border-2 border-transparent'
              }`}
            >
              {tab.icon && <span className="text-lg">{tab.icon}</span>}
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Count Indicator */}
      <div className="border-t border-gray-200 px-6 py-2 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            Showing {visibleTabs.length} tab{visibleTabs.length !== 1 ? 's' : ''}
          </span>
          {mode === TabMode.SIMPLE && (
            <button
              onClick={() => onModeChange(TabMode.ADVANCED)}
              className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
            >
              Switch to Advanced Mode for more features →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;

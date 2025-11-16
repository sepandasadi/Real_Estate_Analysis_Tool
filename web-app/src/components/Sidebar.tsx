import React, { useState } from 'react';
import { TabMode, getTabsByMode } from '../types/tabs';

interface SidebarProps {
  activeTab: string;
  mode: TabMode;
  onTabChange: (tabId: string) => void;
  onModeChange: (mode: TabMode) => void;
}

interface TabCategory {
  name: string;
  icon: string;
  tabs: string[];
}

const TAB_CATEGORIES: TabCategory[] = [
  {
    name: 'Core Analysis',
    icon: '📊',
    tabs: ['inputs', 'flip', 'rental']
  },
  {
    name: 'Financial Details',
    icon: '💰',
    tabs: ['tax', 'amortization', 'loan-comparison']
  },
  {
    name: 'Market Data',
    icon: '🏘️',
    tabs: ['comps', 'filtered-comps', 'state-comparison']
  },
  {
    name: 'Advanced Tools',
    icon: '🎯',
    tabs: ['flip-sensitivity', 'charts', 'advanced-metrics', 'project-tracker', 'partnership']
  }
];

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  mode,
  onTabChange,
  onModeChange
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(['Financial Details', 'Market Data', 'Advanced Tools'])
  );
  const visibleTabs = getTabsByMode(mode);
  const visibleTabIds = new Set(visibleTabs.map(t => t.id));

  const toggleCategory = (categoryName: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    // Close mobile sidebar after selection
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 flex flex-col ${
          isOpen ? 'w-64' : 'w-20'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {isOpen && (
            <h3 className="font-semibold text-gray-800 text-sm">Navigation</h3>
          )}
          <button
            onClick={toggleSidebar}
            className="hidden lg:block p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${isOpen ? '' : 'rotate-180'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="p-4 border-b border-gray-200">
          {isOpen ? (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => onModeChange(TabMode.SIMPLE)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    mode === TabMode.SIMPLE
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Simple
                </button>
                <button
                  onClick={() => onModeChange(TabMode.ADVANCED)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    mode === TabMode.ADVANCED
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Advanced
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className={`w-2 h-2 rounded-full ${mode === TabMode.SIMPLE ? 'bg-blue-500' : 'bg-purple-500'}`} />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          {TAB_CATEGORIES.map((category) => {
            // Filter tabs that are visible in current mode
            const categoryTabs = category.tabs
              .filter(tabId => visibleTabIds.has(tabId))
              .map(tabId => visibleTabs.find(t => t.id === tabId))
              .filter(Boolean);

            // Don't show category if no tabs are visible
            if (categoryTabs.length === 0) return null;

            const isCollapsed = collapsedCategories.has(category.name);

            return (
              <div key={category.name}>
                {isOpen && (
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="w-full flex items-center gap-2 px-3 mb-2 hover:bg-gray-50 rounded-lg py-1 transition-colors"
                  >
                    <span className="text-sm">{category.icon}</span>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex-1 text-left">
                      {category.name}
                    </h4>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
                {!isCollapsed && (
                  <div className="space-y-1">
                    {categoryTabs.map((tab) => {
                      if (!tab) return null;
                      const isActive = activeTab === tab.id;

                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabClick(tab.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                              : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                          }`}
                          title={isOpen ? '' : tab.label}
                        >
                          <span className="text-lg flex-shrink-0">{tab.icon}</span>
                          {isOpen && (
                            <span className="truncate text-left">{tab.label}</span>
                          )}
                          {isActive && isOpen && (
                            <div className="ml-auto w-2 h-2 bg-primary-600 rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        {isOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              {visibleTabs.length} tab{visibleTabs.length !== 1 ? 's' : ''} available
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;

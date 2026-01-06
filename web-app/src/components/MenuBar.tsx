import React, { useState, useEffect, useRef } from 'react';
import { TabMode } from '../types/tabs';

interface MenuBarProps {
  onNewAnalysis: () => void;
  onExport?: () => void;
  onPrint?: () => void;
  onModeChange: (mode: TabMode) => void;
  currentMode: TabMode;
  hasResults: boolean;
  onTabChange?: (tabId: string) => void;
}

interface MenuItem {
  label?: string;
  action?: () => void;
  shortcut?: string;
  divider?: boolean;
  submenu?: MenuItem[];
}

const MenuBar: React.FC<MenuBarProps> = ({
  onNewAnalysis,
  onExport,
  onPrint,
  onModeChange,
  currentMode,
  hasResults,
  onTabChange,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N: New Analysis
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        onNewAnalysis();
      }
      // Ctrl/Cmd + P: Print
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        if (onPrint) onPrint();
      }
      // Ctrl/Cmd + E: Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        if (onExport) onExport();
      }
      // Ctrl/Cmd + M: Toggle Mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        onModeChange(currentMode === TabMode.SIMPLE ? TabMode.ADVANCED : TabMode.SIMPLE);
      }
      // Ctrl/Cmd + 1-9: Quick tab navigation
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9' && hasResults && onTabChange) {
        e.preventDefault();
        const tabMap: { [key: string]: string } = {
          '1': 'inputs',
          '2': 'flip',
          '3': 'rental',
          '4': 'tax',
          '5': 'amortization',
          '6': 'comps',
          '7': 'flip-sensitivity',
          '8': 'charts',
          '9': 'advanced-metrics',
        };
        const tabId = tabMap[e.key];
        if (tabId) onTabChange(tabId);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNewAnalysis, onExport, onPrint, onModeChange, currentMode, hasResults, onTabChange]);

  const handleMenuClick = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleMenuItemClick = (action?: () => void) => {
    if (action) action();
    setActiveMenu(null);
  };

  const fileMenu: MenuItem[] = [
    { label: 'New Analysis', action: onNewAnalysis, shortcut: 'Ctrl+N' },
    { divider: true },
    { label: 'Export Results', action: onExport, shortcut: 'Ctrl+E' },
    { label: 'Print', action: onPrint, shortcut: 'Ctrl+P' },
  ];

  const viewMenu: MenuItem[] = [
    {
      label: currentMode === TabMode.SIMPLE ? 'Switch to Advanced Mode' : 'Switch to Simple Mode',
      action: () => onModeChange(currentMode === TabMode.SIMPLE ? TabMode.ADVANCED : TabMode.SIMPLE),
      shortcut: 'Ctrl+M',
    },
    { divider: true },
    {
      label: 'Quick Navigation',
      submenu: [
        { label: 'Inputs Summary', action: () => onTabChange?.('inputs'), shortcut: 'Ctrl+1' },
        { label: 'Flip Analysis', action: () => onTabChange?.('flip'), shortcut: 'Ctrl+2' },
        { label: 'Rental Analysis', action: () => onTabChange?.('rental'), shortcut: 'Ctrl+3' },
        { label: 'Tax Benefits', action: () => onTabChange?.('tax'), shortcut: 'Ctrl+4' },
        { label: 'Amortization', action: () => onTabChange?.('amortization'), shortcut: 'Ctrl+5' },
        { label: 'Comps', action: () => onTabChange?.('comps'), shortcut: 'Ctrl+6' },
      ],
    },
  ];

  const toolsMenu: MenuItem[] = [
    { label: 'Sensitivity Matrix', action: () => onTabChange?.('flip-sensitivity') },
    { label: 'Charts & Visualizations', action: () => onTabChange?.('charts') },
    { label: 'Advanced Metrics', action: () => onTabChange?.('advanced-metrics') },
    { divider: true },
    { label: 'Loan Comparison', action: () => onTabChange?.('loan-comparison') },
    { label: 'Project Tracker', action: () => onTabChange?.('project-tracker') },
    { label: 'Partnership Management', action: () => onTabChange?.('partnership') },
    { divider: true },
    { label: 'Filtered Comps', action: () => onTabChange?.('filtered-comps') },
    { label: 'State Comparison', action: () => onTabChange?.('state-comparison') },
  ];

  const helpMenu: MenuItem[] = [
    { label: 'Keyboard Shortcuts', action: () => alert('Keyboard Shortcuts:\n\nCtrl+N: New Analysis\nCtrl+E: Export\nCtrl+P: Print\nCtrl+M: Toggle Mode\nCtrl+1-9: Quick Tab Navigation') },
    { label: 'Documentation', action: () => window.open('https://github.com/ThinkTankShark/Real_Estate_Analysis_Tool', '_blank') },
    { divider: true },
    { label: 'About', action: () => alert('Real Estate Analysis Tool v3.0\n\nBuilt with React, TypeScript, and Tailwind CSS\n\n© 2026 All Rights Reserved') },
  ];

  const renderMenuItem = (item: MenuItem, index: number) => {
    if (item.divider) {
      return <div key={`divider-${index}`} className="border-t border-gray-200 my-1" />;
    }

    if (item.submenu) {
      return (
        <div key={index} className="relative group">
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!hasResults}
          >
            <span>{item.label}</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {hasResults && (
            <div className="absolute left-full top-0 ml-1 hidden group-hover:block bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px] z-50">
              {item.submenu.map((subItem, subIndex) => renderMenuItem(subItem, subIndex))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={index}
        onClick={() => handleMenuItemClick(item.action)}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!hasResults && item.action !== onNewAnalysis}
      >
        <span>{item.label}</span>
        {item.shortcut && (
          <span className="text-xs text-gray-400 ml-4">{item.shortcut}</span>
        )}
      </button>
    );
  };

  const renderMenu = (menuName: string, items: MenuItem[]) => {
    const isActive = activeMenu === menuName;
    return (
      <div className="relative">
        <button
          onClick={() => handleMenuClick(menuName)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            isActive
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {menuName}
        </button>
        {isActive && (
          <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[220px] z-50">
            {items.map((item, index) => renderMenuItem(item, index))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={menuRef} className="bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full">
        <div className="flex items-center h-12 px-4">
          {/* Logo/Title */}
          <div className="flex items-center gap-2 mr-6">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-1.5 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-bold text-gray-800 hidden sm:inline">REI Tools</span>
          </div>

          {/* Menu Items */}
          <div className="flex items-center gap-1">
            {renderMenu('File', fileMenu)}
            {renderMenu('View', viewMenu)}
            {renderMenu('Tools', toolsMenu)}
            {renderMenu('Help', helpMenu)}
          </div>

          {/* Mode Indicator */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden md:inline">Mode:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              currentMode === TabMode.SIMPLE
                ? 'bg-blue-100 text-blue-700'
                : 'bg-purple-100 text-purple-700'
            }`}>
              {currentMode === TabMode.SIMPLE ? 'Simple' : 'Advanced'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuBar;

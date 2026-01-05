/**
 * Tab types and definitions for the Real Estate Analysis Tool
 */

export enum TabMode {
  SIMPLE = 'simple',
  ADVANCED = 'advanced'
}

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  mode: TabMode | 'both'; // 'both' means visible in both modes
  order: number;
}

export const TABS: Tab[] = [
  {
    id: 'inputs',
    label: 'Inputs Summary',
    icon: '📋',
    mode: 'both',
    order: 1
  },
  {
    id: 'flip',
    label: 'Flip Analysis',
    icon: '🔨',
    mode: 'both',
    order: 2
  },
  {
    id: 'rental',
    label: 'Rental Analysis',
    icon: '🏠',
    mode: 'both',
    order: 3
  },
  {
    id: 'flip-sensitivity',
    label: 'Flip Sensitivity',
    icon: '📊',
    mode: TabMode.ADVANCED,
    order: 4
  },
  {
    id: 'charts',
    label: 'Charts & Visualizations',
    icon: '📈',
    mode: TabMode.ADVANCED,
    order: 5
  },
  {
    id: 'tax',
    label: 'Tax Benefits',
    icon: '💰',
    mode: 'both',
    order: 6
  },
  {
    id: 'amortization',
    label: 'Amortization',
    icon: '📅',
    mode: 'both',
    order: 7
  },
  {
    id: 'advanced-metrics',
    label: 'Advanced Metrics',
    icon: '🎯',
    mode: TabMode.ADVANCED,
    order: 8
  },
  {
    id: 'loan-comparison',
    label: 'Loan Comparison',
    icon: '🏦',
    mode: TabMode.ADVANCED,
    order: 9
  },
  {
    id: 'project-tracker',
    label: 'Project Tracker',
    icon: '✅',
    mode: TabMode.ADVANCED,
    order: 10
  },
  {
    id: 'partnership',
    label: 'Partnership',
    icon: '🤝',
    mode: TabMode.ADVANCED,
    order: 11
  },
  {
    id: 'comps',
    label: 'Comps',
    icon: '🏘️',
    mode: 'both',
    order: 12
  },
  {
    id: 'filtered-comps',
    label: 'Filtered Comps',
    icon: '🔍',
    mode: TabMode.ADVANCED,
    order: 13
  },
  {
    id: 'location-quality',
    label: 'Location Quality',
    icon: '📍',
    mode: TabMode.ADVANCED,
    order: 14
  },
  {
    id: 'state-comparison',
    label: 'State Comparison',
    icon: '🗺️',
    mode: TabMode.ADVANCED,
    order: 15
  },
  {
    id: 'scenarios',
    label: 'Custom Scenarios',
    icon: '🎲',
    mode: TabMode.ADVANCED,
    order: 16
  }
];

/**
 * Get tabs filtered by mode
 */
export function getTabsByMode(mode: TabMode): Tab[] {
  return TABS.filter(tab => tab.mode === 'both' || tab.mode === mode).sort((a, b) => a.order - b.order);
}

/**
 * Get tab by ID
 */
export function getTabById(id: string): Tab | undefined {
  return TABS.find(tab => tab.id === id);
}

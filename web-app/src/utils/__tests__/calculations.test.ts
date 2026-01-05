/**
 * Tests for calculation utilities
 */

import { calculateProjectSummary } from '../calculations';
import { ProjectTrackerData } from '../../types/projectTracker';

describe('Project Tracker Calculations', () => {
  describe('calculateProjectSummary', () => {
    it('should calculate project summary correctly', () => {
      const mockData: ProjectTrackerData = {
        propertyId: 'test-123',
        renovationPhases: [
          {
            id: '1',
            name: 'Foundation',
            status: 'completed',
            estimatedCost: 10000,
            actualCost: 9500,
            estimatedDuration: 10,
            actualDuration: 9,
            startDate: '2026-01-01',
            endDate: '2026-01-10',
            notes: '',
          },
          {
            id: '2',
            name: 'Framing',
            status: 'in_progress',
            estimatedCost: 15000,
            actualCost: 14000,
            estimatedDuration: 15,
            actualDuration: 10,
            startDate: '2026-01-11',
            endDate: '',
            notes: '',
          },
        ],
        criticalMilestones: [],
        delays: [],
        materialOrders: [],
        permits: [],
        contractorPerformance: [],
        changeOrders: [],
      };

      const result = calculateProjectSummary(mockData);

      expect(result.totalBudget).toBe(25000);
      expect(result.totalActualCost).toBe(23500);
      expect(result.budgetVariance).toBe(1500);
      expect(result.completedPhases).toBe(1);
    });

    it('should handle empty data', () => {
      const emptyData: ProjectTrackerData = {
        propertyId: 'test-empty',
        renovationPhases: [],
        criticalMilestones: [],
        delays: [],
        materialOrders: [],
        permits: [],
        contractorPerformance: [],
        changeOrders: [],
      };

      const result = calculateProjectSummary(emptyData);

      expect(result.totalBudget).toBe(0);
      expect(result.totalActualCost).toBe(0);
      expect(result.completedPhases).toBe(0);
      expect(result.completionPercent).toBe(0);
    });
  });
});

describe('Basic Math Checks', () => {
  it('should perform basic calculations', () => {
    expect(1 + 1).toBe(2);
    expect(10 - 5).toBe(5);
    expect(5 * 2).toBe(10);
    expect(10 / 2).toBe(5);
  });

  it('should handle percentages', () => {
    const percentage = (50 / 100) * 100;
    expect(percentage).toBe(50);
  });

  it('should round numbers correctly', () => {
    expect(Math.round(1.4)).toBe(1);
    expect(Math.round(1.5)).toBe(2);
    expect(Math.round(1.6)).toBe(2);
  });
});

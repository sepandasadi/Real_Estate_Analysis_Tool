/**
 * Custom hook for managing Partnership Management data
 */

import { useState, useEffect, useCallback } from 'react';
import {
  PartnershipManagementData,
  Partner,
  CapitalContribution,
  WaterfallConfig,
  Distribution,
  PartnershipMilestone,
  CashFlowEntry,
  PartnerPerformance,
  PartnerDistribution,
} from '../types/partnershipManagement';
import {
  savePartnershipData,
  loadPartnershipData,
} from '../utils/localStorage';
import {
  generateId,
  calculateWaterfallDistribution,
  calculatePartnerPerformance,
  validatePartnershipOwnership,
} from '../utils/calculations';

export const usePartnershipManagement = (propertyId: string) => {
  const [data, setData] = useState<PartnershipManagementData>({
    propertyId,
    partners: [],
    capitalContributions: [],
    waterfallConfig: {
      tier1_returnOfCapital: true,
      tier2_preferredReturnRate: 0.08,
      tier2_preferredReturnEnabled: true,
      tier3_catchupEnabled: true,
      tier3_gpPromotePercent: 0.20,
      tier4_splitByOwnership: true,
      distributionFrequency: 'at-exit',
    },
    distributions: [],
    milestones: [],
    cashFlowEntries: [],
    lastUpdated: new Date().toISOString(),
  });

  const [partnerDistributions, setPartnerDistributions] = useState<PartnerDistribution[]>([]);
  const [partnerPerformance, setPartnerPerformance] = useState<PartnerPerformance[]>([]);
  const [ownershipValidation, setOwnershipValidation] = useState<{ isValid: boolean; totalOwnership: number }>({
    isValid: true,
    totalOwnership: 0,
  });

  // Load data from IndexedDB on mount
  useEffect(() => {
    if (propertyId) {
      loadPartnershipData(propertyId).then((loadedData) => {
        if (loadedData) {
          setData(loadedData);
        }
      });
    }
  }, [propertyId]);

  // Validate ownership whenever partners change
  useEffect(() => {
    const isValid = validatePartnershipOwnership(data.partners);
    const totalOwnership = data.partners.reduce((sum, p) => sum + p.ownershipPercent, 0);
    setOwnershipValidation({ isValid, totalOwnership });
  }, [data.partners]);

  // Calculate partner distributions whenever relevant data changes
  useEffect(() => {
    if (data.partners.length > 0) {
      const totalProfit = data.distributions
        .filter(d => d.status === 'completed')
        .reduce((sum, d) => sum + d.totalAmount, 0);

      const result = calculateWaterfallDistribution(
        data.partners,
        data.waterfallConfig,
        totalProfit
      );
      setPartnerDistributions(result.partnerDistributions);
    }
  }, [data.partners, data.waterfallConfig, data.distributions]);

  // Calculate partner performance whenever relevant data changes
  useEffect(() => {
    if (data.partners.length > 0) {
      const performance = data.partners.map(partner => {
        // Calculate total contributions for this partner
        const totalContributions = data.capitalContributions
          .filter(c => c.partnerId === partner.id && c.status === 'verified')
          .reduce((sum, c) => sum + c.amount, 0);

        // Calculate total distributions for this partner
        const totalDistributions = data.distributions
          .filter(d => d.status === 'completed')
          .reduce((sum, d) => {
            const partnerDist = d.partnerDistributions.find(pd => pd.partnerId === partner.id);
            return sum + (partnerDist?.amount || 0);
          }, 0);

        // Get partner-specific cash flows
        const partnerCashFlows = data.cashFlowEntries.filter(cf =>
          cf.description.includes(partner.name) || cf.description.includes(partner.id)
        );

        // Calculate holding period in months
        const joinDate = new Date(partner.joinDate);
        const currentDate = new Date();
        const holdingPeriodMonths = Math.max(1,
          (currentDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        );

        return calculatePartnerPerformance(
          partner,
          totalContributions,
          totalDistributions,
          partnerCashFlows,
          holdingPeriodMonths
        );
      });
      setPartnerPerformance(performance);
    }
  }, [data.partners, data.capitalContributions, data.distributions, data.cashFlowEntries]);

  // Save data to IndexedDB whenever it changes
  useEffect(() => {
    if (propertyId && data.partners.length > 0) {
      savePartnershipData(propertyId, data).catch((error) => {
        console.error('Failed to save partnership data:', error);
      });
    }
  }, [propertyId, data]);

  // Partners CRUD
  const addPartner = useCallback((partner: Omit<Partner, 'id'>) => {
    const newPartner: Partner = { ...partner, id: generateId() };
    setData((prev) => ({
      ...prev,
      partners: [...prev.partners, newPartner],
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const updatePartner = useCallback((id: string, updates: Partial<Partner>) => {
    setData((prev) => ({
      ...prev,
      partners: prev.partners.map((partner) =>
        partner.id === id ? { ...partner, ...updates } : partner
      ),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const deletePartner = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      partners: prev.partners.filter((partner) => partner.id !== id),
      // Also remove related contributions
      capitalContributions: prev.capitalContributions.filter((c) => c.partnerId !== id),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  // Capital Contributions CRUD
  const addCapitalContribution = useCallback((contribution: Omit<CapitalContribution, 'id'>) => {
    const newContribution: CapitalContribution = { ...contribution, id: generateId() };
    setData((prev) => ({
      ...prev,
      capitalContributions: [...prev.capitalContributions, newContribution],
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const updateCapitalContribution = useCallback((id: string, updates: Partial<CapitalContribution>) => {
    setData((prev) => ({
      ...prev,
      capitalContributions: prev.capitalContributions.map((contribution) =>
        contribution.id === id ? { ...contribution, ...updates } : contribution
      ),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const deleteCapitalContribution = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      capitalContributions: prev.capitalContributions.filter((contribution) => contribution.id !== id),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  // Waterfall Config Update
  const updateWaterfallConfig = useCallback((updates: Partial<WaterfallConfig>) => {
    setData((prev) => ({
      ...prev,
      waterfallConfig: { ...prev.waterfallConfig, ...updates },
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  // Distributions CRUD
  const addDistribution = useCallback((distribution: Omit<Distribution, 'id'>) => {
    const newDistribution: Distribution = { ...distribution, id: generateId() };
    setData((prev) => ({
      ...prev,
      distributions: [...prev.distributions, newDistribution],
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const updateDistribution = useCallback((id: string, updates: Partial<Distribution>) => {
    setData((prev) => ({
      ...prev,
      distributions: prev.distributions.map((distribution) =>
        distribution.id === id ? { ...distribution, ...updates } : distribution
      ),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const deleteDistribution = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      distributions: prev.distributions.filter((distribution) => distribution.id !== id),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  // Cash Flow Entries CRUD
  const addCashFlowEntry = useCallback((entry: CashFlowEntry) => {
    setData((prev) => ({
      ...prev,
      cashFlowEntries: [...prev.cashFlowEntries, entry],
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const updateCashFlowEntry = useCallback((index: number, updates: Partial<CashFlowEntry>) => {
    setData((prev) => ({
      ...prev,
      cashFlowEntries: prev.cashFlowEntries.map((entry, i) =>
        i === index ? { ...entry, ...updates } : entry
      ),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const deleteCashFlowEntry = useCallback((index: number) => {
    setData((prev) => ({
      ...prev,
      cashFlowEntries: prev.cashFlowEntries.filter((_, i) => i !== index),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  // Milestones CRUD
  const addMilestone = useCallback((milestone: Omit<PartnershipMilestone, 'id'>) => {
    const newMilestone: PartnershipMilestone = { ...milestone, id: generateId() };
    setData((prev) => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone],
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const updateMilestone = useCallback((id: string, updates: Partial<PartnershipMilestone>) => {
    setData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((milestone) =>
        milestone.id === id ? { ...milestone, ...updates } : milestone
      ),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const deleteMilestone = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((milestone) => milestone.id !== id),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const hasData = data.partners.length > 0;

  return {
    data,
    hasData,
    partnerDistributions,
    partnerPerformance,
    ownershipValidation,
    // Partners
    addPartner,
    updatePartner,
    deletePartner,
    // Capital Contributions
    addCapitalContribution,
    updateCapitalContribution,
    deleteCapitalContribution,
    // Waterfall Config
    updateWaterfallConfig,
    // Distributions
    addDistribution,
    updateDistribution,
    deleteDistribution,
    // Cash Flow Entries
    addCashFlowEntry,
    updateCashFlowEntry,
    deleteCashFlowEntry,
    // Milestones
    addMilestone,
    updateMilestone,
    deleteMilestone,
  };
};

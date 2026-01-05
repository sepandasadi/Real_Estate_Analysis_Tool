/**
 * Calculation utilities for Project Tracker and Partnership Management
 */

import {
  ProjectTrackerData,
  ProjectSummary,
  RenovationPhase,
  ContractorPerformance,
} from '../types/projectTracker';
import {
  PartnershipManagementData,
  Partner,
  WaterfallConfig,
  PartnerDistribution,
  WaterfallTier,
  PartnerPerformance,
  CashFlowEntry,
} from '../types/partnershipManagement';

// ============================================
// PROJECT TRACKER CALCULATIONS
// ============================================

export const calculateProjectSummary = (data: ProjectTrackerData): ProjectSummary => {
  const { renovationPhases, delays, permits, contractorPerformance, changeOrders } = data;

  // Budget calculations
  const totalBudget = renovationPhases.reduce((sum, phase) => sum + phase.estimatedCost, 0);
  const totalActualCost = renovationPhases.reduce((sum, phase) => sum + phase.actualCost, 0);
  const budgetVariance = totalBudget - totalActualCost;
  const budgetVariancePercent = totalBudget > 0 ? (budgetVariance / totalBudget) * 100 : 0;

  // Duration calculations
  const totalEstimatedDuration = renovationPhases.reduce(
    (sum, phase) => sum + phase.estimatedDuration,
    0
  );
  const totalActualDuration = renovationPhases.reduce(
    (sum, phase) => sum + phase.actualDuration,
    0
  );
  const scheduleVariance = totalEstimatedDuration - totalActualDuration;
  const scheduleVariancePercent =
    totalEstimatedDuration > 0 ? (scheduleVariance / totalEstimatedDuration) * 100 : 0;

  // Completion calculations
  const completedPhases = renovationPhases.filter((phase) => phase.status === 'completed').length;
  const completionPercent =
    renovationPhases.length > 0 ? (completedPhases / renovationPhases.length) * 100 : 0;

  // Issue tracking
  const activeIssuesCount = delays.filter(
    (delay) => delay.status === 'open' || delay.status === 'in-progress'
  ).length;

  const pendingPermitsCount = permits.filter(
    (permit) => permit.status === 'pending' || permit.status === 'not-applied'
  ).length;

  // Overdue tasks (phases that are delayed)
  const overdueTasksCount = renovationPhases.filter((phase) => phase.status === 'delayed').length;

  // Average contractor rating
  const averageContractorRating =
    contractorPerformance.length > 0
      ? contractorPerformance.reduce((sum, contractor) => sum + contractor.overallRating, 0) /
        contractorPerformance.length
      : 0;

  // Total change orders cost
  const totalChangeOrdersCost = changeOrders
    .filter((co) => co.status === 'approved' || co.status === 'completed')
    .reduce((sum, co) => sum + co.costImpact, 0);

  // Projected completion date (last phase end date)
  const sortedPhases = [...renovationPhases].sort(
    (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
  );
  const projectedCompletionDate = sortedPhases.length > 0 ? sortedPhases[0].endDate : '';

  // Status flags
  const isOnBudget = budgetVariance >= 0;
  const isOnSchedule = scheduleVariance >= 0;

  return {
    totalBudget,
    totalActualCost,
    budgetVariance,
    budgetVariancePercent,
    totalEstimatedDuration,
    totalActualDuration,
    scheduleVariance,
    scheduleVariancePercent,
    completionPercent,
    activeIssuesCount,
    pendingPermitsCount,
    overdueTasksCount,
    averageContractorRating,
    totalChangeOrdersCost,
    projectedCompletionDate,
    isOnBudget,
    isOnSchedule,
  };
};

// ============================================
// PARTNERSHIP MANAGEMENT CALCULATIONS
// ============================================

export const validatePartnershipOwnership = (partners: Partner[]): boolean => {
  const totalOwnership = partners.reduce((sum, partner) => sum + partner.ownershipPercent, 0);
  return Math.abs(totalOwnership - 100) < 0.01; // Allow for floating point precision
};

export const calculateWaterfallDistribution = (
  partners: Partner[],
  config: WaterfallConfig,
  totalProfit: number
): { tiers: WaterfallTier[]; partnerDistributions: PartnerDistribution[] } => {
  const tiers: WaterfallTier[] = [];
  const partnerDistributions: PartnerDistribution[] = [];

  const totalCapital = partners.reduce((sum, p) => sum + p.initialCapital, 0);
  let remainingProfit = totalProfit;

  // Tier 1: Return of Capital
  const tier1Amount = config.tier1_returnOfCapital ? Math.min(remainingProfit, totalCapital) : 0;
  tiers.push({
    tierNumber: 1,
    tierName: 'Return of Capital',
    description: '100% to investors pro-rata',
    amount: tier1Amount,
    notes: 'Return original investment',
  });
  remainingProfit -= tier1Amount;

  // Tier 2: Preferred Return
  const tier2Amount =
    config.tier2_preferredReturnEnabled && remainingProfit > 0
      ? Math.min(remainingProfit, totalCapital * config.tier2_preferredReturnRate)
      : 0;
  tiers.push({
    tierNumber: 2,
    tierName: 'Preferred Return',
    description: `${(config.tier2_preferredReturnRate * 100).toFixed(1)}% annually to investors`,
    amount: tier2Amount,
    notes: 'Preferred return on capital',
  });
  remainingProfit -= tier2Amount;

  // Tier 3: GP Catch-up
  const gpPartner = partners.find((p) => p.role === 'General Partner');
  const catchupTarget =
    config.tier3_catchupEnabled && gpPartner
      ? tier2Amount * (config.tier3_gpPromotePercent / (1 - config.tier3_gpPromotePercent))
      : 0;
  const tier3Amount = Math.min(remainingProfit, catchupTarget);
  tiers.push({
    tierNumber: 3,
    tierName: 'GP Catch-up',
    description: `GP gets ${(config.tier3_gpPromotePercent * 100).toFixed(0)}% promote`,
    amount: tier3Amount,
    notes: 'GP catch-up to promote level',
  });
  remainingProfit -= tier3Amount;

  // Tier 4: Remaining Profit
  const tier4Amount = remainingProfit;
  tiers.push({
    tierNumber: 4,
    tierName: 'Remaining Profit',
    description: 'Split by ownership percentage',
    amount: tier4Amount,
    notes: 'Pro-rata distribution',
  });

  // Calculate per-partner distributions
  partners.forEach((partner) => {
    const ownershipPct = partner.ownershipPercent / 100;
    const isGP = partner.role === 'General Partner';

    // Tier 1: Return of capital (pro-rata)
    const returnOfCapital = totalCapital > 0 ? (partner.initialCapital / totalCapital) * tier1Amount : 0;

    // Tier 2: Preferred return (pro-rata)
    const preferredReturn = totalCapital > 0 ? (partner.initialCapital / totalCapital) * tier2Amount : 0;

    // Tier 3: Catch-up (100% to GP)
    const catchup = isGP ? tier3Amount : 0;

    // Tier 4: Remaining profit (by ownership %)
    const remainingProfitShare = tier4Amount * ownershipPct;

    const totalDistribution = returnOfCapital + preferredReturn + catchup + remainingProfitShare;
    const percentOfTotal = totalProfit > 0 ? totalDistribution / totalProfit : 0;
    const roi = partner.initialCapital > 0 ? (totalDistribution - partner.initialCapital) / partner.initialCapital : 0;
    const moic = partner.initialCapital > 0 ? totalDistribution / partner.initialCapital : 0;

    partnerDistributions.push({
      partnerId: partner.id,
      partnerName: partner.name,
      returnOfCapital,
      preferredReturn,
      catchup,
      remainingProfit: remainingProfitShare,
      totalDistribution,
      percentOfTotal,
      roi,
      moic,
    });
  });

  return { tiers, partnerDistributions };
};

export const calculatePartnerPerformance = (
  partner: Partner,
  contributions: number,
  distributions: number,
  cashFlows: CashFlowEntry[],
  holdingPeriodMonths: number
): PartnerPerformance => {
  const totalContributions = contributions;
  const totalDistributions = distributions;
  const currentEquity = totalContributions - totalDistributions;

  // ROI calculation
  const roi = totalContributions > 0 ? (totalDistributions - totalContributions) / totalContributions : 0;

  // MOIC calculation
  const moic = totalContributions > 0 ? totalDistributions / totalContributions : 0;

  // IRR calculation (simplified - using XIRR approximation)
  const irr = calculateIRR(cashFlows);

  // Cash-on-Cash Return
  const annualDistributions = totalDistributions / (holdingPeriodMonths / 12);
  const cashOnCashReturn = totalContributions > 0 ? annualDistributions / totalContributions : 0;

  // Annualized Return
  const years = holdingPeriodMonths / 12;
  const annualizedReturn = years > 0 ? Math.pow(1 + roi, 1 / years) - 1 : 0;

  return {
    partnerId: partner.id,
    partnerName: partner.name,
    initialInvestment: partner.initialCapital,
    totalContributions,
    totalDistributions,
    currentEquity,
    roi,
    moic,
    irr,
    cashOnCashReturn,
    holdingPeriodMonths,
    annualizedReturn,
  };
};

// Simplified IRR calculation using Newton-Raphson method
export const calculateIRR = (cashFlows: CashFlowEntry[]): number => {
  if (cashFlows.length < 2) return 0;

  // Sort cash flows by date
  const sortedFlows = [...cashFlows].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const startDate = new Date(sortedFlows[0].date);

  // Convert to periods (in years from start)
  const flows = sortedFlows.map((cf) => ({
    period: (new Date(cf.date).getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    amount: cf.amount,
  }));

  // Newton-Raphson method to find IRR
  let rate = 0.1; // Initial guess: 10%
  const maxIterations = 100;
  const tolerance = 0.0001;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    flows.forEach((flow) => {
      const discountFactor = Math.pow(1 + rate, flow.period);
      npv += flow.amount / discountFactor;
      dnpv -= (flow.period * flow.amount) / (discountFactor * (1 + rate));
    });

    const newRate = rate - npv / dnpv;

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }

    rate = newRate;
  }

  return rate;
};

// Format currency
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format percentage
export const formatPercent = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

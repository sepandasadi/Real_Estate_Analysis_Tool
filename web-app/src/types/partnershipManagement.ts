/**
 * Partnership Management data types
 */

// Status types
export type PartnerStatus = 'active' | 'inactive' | 'exited';
export type PartnerRole = 'General Partner' | 'Limited Partner' | 'Operating Partner' | 'Investor';
export type ContributionType = 'Initial Capital' | 'Additional Capital' | 'Loan' | 'In-Kind' | 'Sweat Equity';
export type ContributionStatus = 'pending' | 'verified' | 'received' | 'rejected';
export type DistributionType = 'Quarterly Cash Flow' | 'Annual Distribution' | 'Refinance Proceeds' | 'Sale Proceeds' | 'Special Distribution';
export type DistributionStatus = 'projected' | 'approved' | 'completed' | 'cancelled';
export type MilestoneType = 'acquisition' | 'rehab-start' | 'rehab-complete' | 'tenant-placed' | 'refinance' | 'sale' | 'other';

// Section 1: Partnership Structure
export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  ownershipPercent: number;
  initialCapital: number;
  role: PartnerRole;
  status: PartnerStatus;
  joinDate: string;
  exitDate: string;
  notes: string;
}

// Section 2: Capital Contributions Tracker
export interface CapitalContribution {
  id: string;
  partnerId: string;
  partnerName: string;
  contributionDate: string;
  type: ContributionType;
  amount: number;
  status: ContributionStatus;
  paymentMethod: string;
  description: string;
  notes: string;
}

// Section 3: Profit/Loss Allocation
export interface ProfitLossAllocation {
  partnerId: string;
  partnerName: string;
  ownershipPercent: number;
  allocatedProfit: number;
  allocatedLoss: number;
  netAllocation: number;
  cumulativeAllocation: number;
}

// Section 4: Waterfall Distribution Calculator
export interface WaterfallConfig {
  tier1_returnOfCapital: boolean;
  tier2_preferredReturnRate: number; // e.g., 0.08 for 8%
  tier2_preferredReturnEnabled: boolean;
  tier3_catchupEnabled: boolean;
  tier3_gpPromotePercent: number; // e.g., 0.20 for 20%
  tier4_splitByOwnership: boolean;
  distributionFrequency: 'at-exit' | 'quarterly' | 'annually';
}

export interface WaterfallTier {
  tierNumber: number;
  tierName: string;
  description: string;
  amount: number;
  notes: string;
}

export interface PartnerDistribution {
  partnerId: string;
  partnerName: string;
  returnOfCapital: number;
  preferredReturn: number;
  catchup: number;
  remainingProfit: number;
  totalDistribution: number;
  percentOfTotal: number;
  roi: number;
  moic: number;
}

// Section 5: Distribution History & Projections
export interface Distribution {
  id: string;
  distributionDate: string;
  type: DistributionType;
  totalAmount: number;
  status: DistributionStatus;
  isProjected: boolean;
  notes: string;
  partnerDistributions: {
    partnerId: string;
    partnerName: string;
    amount: number;
  }[];
}

// Section 6: Milestone Tracker
export interface PartnershipMilestone {
  id: string;
  milestoneName: string;
  type: MilestoneType;
  description: string;
  targetDate: string;
  actualDate: string;
  isCompleted: boolean;
  financialImpact: number;
  notes: string;
}

// Section 7: Partner Performance Dashboard
export interface PartnerPerformance {
  partnerId: string;
  partnerName: string;
  initialInvestment: number;
  totalContributions: number;
  totalDistributions: number;
  currentEquity: number;
  roi: number; // Return on Investment
  moic: number; // Multiple on Invested Capital
  irr: number; // Internal Rate of Return
  cashOnCashReturn: number;
  holdingPeriodMonths: number;
  annualizedReturn: number;
}

// IRR Calculation - Cash Flow Entry
export interface CashFlowEntry {
  date: string;
  amount: number; // Negative for investments, positive for distributions
  description: string;
}

// Complete Partnership Management Data
export interface PartnershipManagementData {
  propertyId: string;
  partners: Partner[];
  capitalContributions: CapitalContribution[];
  waterfallConfig: WaterfallConfig;
  distributions: Distribution[];
  milestones: PartnershipMilestone[];
  cashFlowEntries: CashFlowEntry[]; // For IRR calculation
  lastUpdated: string;
}

// Form data for modals
export interface PartnerFormData extends Omit<Partner, 'id'> {}
export interface CapitalContributionFormData extends Omit<CapitalContribution, 'id'> {}
export interface DistributionFormData extends Omit<Distribution, 'id'> {}
export interface PartnershipMilestoneFormData extends Omit<PartnershipMilestone, 'id'> {}

// Validation
export interface PartnershipValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

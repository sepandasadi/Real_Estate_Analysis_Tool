/**
 * Project Tracker data types
 */

// Status types
export type ProjectStatus = 'not-started' | 'in-progress' | 'completed' | 'delayed' | 'on-hold';
export type PermitStatus = 'not-applied' | 'pending' | 'approved' | 'rejected' | 'expired';
export type DeliveryStatus = 'ordered' | 'in-transit' | 'delivered' | 'delayed' | 'cancelled';
export type IssueStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type ChangeOrderStatus = 'pending' | 'approved' | 'rejected' | 'completed';

// Section 1: Renovation Timeline & Budget
export interface RenovationPhase {
  id: string;
  phaseName: string;
  description: string;
  estimatedCost: number;
  actualCost: number;
  estimatedDuration: number; // in days
  actualDuration: number; // in days
  startDate: string;
  endDate: string;
  contractor: string;
  status: ProjectStatus;
  notes: string;
}

// Section 2: Inspection & Permit Tracker
export interface Permit {
  id: string;
  permitType: string; // Building, Electrical, Plumbing, HVAC, etc.
  permitNumber: string;
  applicationDate: string;
  approvalDate: string;
  expirationDate: string;
  cost: number;
  issuingAuthority: string;
  status: PermitStatus;
  notes: string;
}

// Section 3: Material & Vendor Tracking
export interface MaterialOrder {
  id: string;
  materialName: string;
  vendor: string;
  vendorContact: string;
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  status: DeliveryStatus;
  notes: string;
}

// Section 4: Critical Milestones & Alerts
export interface CriticalMilestone {
  id: string;
  milestoneName: string;
  description: string;
  targetDate: string;
  actualDate: string;
  isCompleted: boolean;
  isCritical: boolean;
  dependencies: string[]; // IDs of other milestones
  notes: string;
}

// Section 5: Delays & Issues Tracker
export interface ProjectDelay {
  id: string;
  issueTitle: string;
  description: string;
  category: string; // Weather, Contractor, Materials, Permits, etc.
  reportedDate: string;
  resolvedDate: string;
  daysDelayed: number;
  costImpact: number;
  responsibleParty: string;
  status: IssueStatus;
  resolutionNotes: string;
}

// Section 6: Contractor Performance Tracker
export interface ContractorPerformance {
  id: string;
  contractorName: string;
  company: string;
  contact: string;
  specialty: string;
  projectPhase: string;
  qualityRating: number; // 1-5 scale
  timelinessRating: number; // 1-5 scale
  budgetAdherenceRating: number; // 1-5 scale
  communicationRating: number; // 1-5 scale
  overallRating: number; // Average of above
  contractAmount: number;
  amountPaid: number;
  wouldRecommend: boolean;
  notes: string;
}

// Section 7: Change Orders Tracker
export interface ChangeOrder {
  id: string;
  changeOrderNumber: string;
  title: string;
  description: string;
  requestedBy: string;
  requestDate: string;
  approvalDate: string;
  originalScope: string;
  newScope: string;
  costImpact: number;
  timeImpact: number; // in days
  status: ChangeOrderStatus;
  justification: string;
  notes: string;
}

// Section 8: Project Summary Dashboard (Auto-calculated)
export interface ProjectSummary {
  totalBudget: number;
  totalActualCost: number;
  budgetVariance: number;
  budgetVariancePercent: number;
  totalEstimatedDuration: number;
  totalActualDuration: number;
  scheduleVariance: number;
  scheduleVariancePercent: number;
  completionPercent: number;
  activeIssuesCount: number;
  pendingPermitsCount: number;
  overdueTasksCount: number;
  averageContractorRating: number;
  totalChangeOrdersCost: number;
  projectedCompletionDate: string;
  isOnBudget: boolean;
  isOnSchedule: boolean;
}

// Complete Project Tracker Data
export interface ProjectTrackerData {
  propertyId: string;
  renovationPhases: RenovationPhase[];
  permits: Permit[];
  materialOrders: MaterialOrder[];
  criticalMilestones: CriticalMilestone[];
  delays: ProjectDelay[];
  contractorPerformance: ContractorPerformance[];
  changeOrders: ChangeOrder[];
  summary?: ProjectSummary;
  lastUpdated: string;
}

// Form data for modals
export interface RenovationPhaseFormData extends Omit<RenovationPhase, 'id'> {}
export interface PermitFormData extends Omit<Permit, 'id'> {}
export interface MaterialOrderFormData extends Omit<MaterialOrder, 'id'> {}
export interface CriticalMilestoneFormData extends Omit<CriticalMilestone, 'id'> {}
export interface ProjectDelayFormData extends Omit<ProjectDelay, 'id'> {}
export interface ContractorPerformanceFormData extends Omit<ContractorPerformance, 'id'> {}
export interface ChangeOrderFormData extends Omit<ChangeOrder, 'id'> {}

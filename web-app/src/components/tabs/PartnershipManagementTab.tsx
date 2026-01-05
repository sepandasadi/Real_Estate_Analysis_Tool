import React, { useState } from 'react';
import { PropertyAnalysisResult } from '../../types/property';
import { usePartnershipManagement } from '../../hooks/usePartnershipManagement';
import EmptyState from '../partnershipManagement/EmptyState';
import PartnerInformation from '../partnershipManagement/PartnerInformation';
import CapitalContributions from '../partnershipManagement/CapitalContributions';
import WaterfallConfiguration from '../partnershipManagement/WaterfallConfiguration';
import DistributionTracking from '../partnershipManagement/DistributionTracking';
import CashFlowManagement from '../partnershipManagement/CashFlowManagement';
import PartnerPerformanceComponent from '../partnershipManagement/PartnerPerformance';
import PartnershipSummary from '../partnershipManagement/PartnershipSummary';

interface PartnershipManagementTabProps {
  data: PropertyAnalysisResult | null;
  propertyId: string;
}

const PartnershipManagementTab: React.FC<PartnershipManagementTabProps> = ({ data, propertyId }) => {
  const [showEmptyState, setShowEmptyState] = useState(false);

  const {
    data: partnershipData,
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
  } = usePartnershipManagement(propertyId);

  // Calculate totals
  const totalContributions = partnershipData.capitalContributions
    .filter(c => c.status === 'verified' || c.status === 'received')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalDistributions = partnershipData.distributions
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.totalAmount, 0);

  // Get profit from analysis data for waterfall calculations
  const totalProfit = data?.flip?.netProfit || (data?.rental?.cashFlow ? data.rental.cashFlow * 12 : 0) || 0;

  // Show empty state if no data
  if (!hasData && !showEmptyState) {
    return <EmptyState onGetStarted={() => setShowEmptyState(true)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🤝</span>
          <div>
            <h2 className="text-2xl font-bold">Partnership Management</h2>
            <p className="text-purple-100">Multi-partner investment tracking and distribution calculator</p>
          </div>
        </div>
      </div>

      {/* Section 1: Partner Information */}
      <PartnerInformation
        partners={partnershipData.partners}
        onAdd={addPartner}
        onUpdate={updatePartner}
        onDelete={deletePartner}
        ownershipValidation={ownershipValidation}
      />

      {/* Section 2: Capital Contributions */}
      <CapitalContributions
        contributions={partnershipData.capitalContributions}
        partners={partnershipData.partners}
        onAdd={addCapitalContribution}
        onUpdate={updateCapitalContribution}
        onDelete={deleteCapitalContribution}
      />

      {/* Section 3: Waterfall Configuration */}
      <WaterfallConfiguration
        config={partnershipData.waterfallConfig}
        partners={partnershipData.partners}
        partnerDistributions={partnerDistributions}
        onUpdate={updateWaterfallConfig}
        totalProfit={totalProfit}
      />

      {/* Section 4: Distribution Tracking */}
      <DistributionTracking
        distributions={partnershipData.distributions}
        partners={partnershipData.partners}
        onAdd={addDistribution}
        onUpdate={updateDistribution}
        onDelete={deleteDistribution}
      />

      {/* Section 5: Cash Flow Management */}
      <CashFlowManagement
        cashFlowEntries={partnershipData.cashFlowEntries}
        onAdd={addCashFlowEntry}
        onUpdate={updateCashFlowEntry}
        onDelete={deleteCashFlowEntry}
      />

      {/* Section 6: Partner Performance */}
      <PartnerPerformanceComponent
        partnerPerformance={partnerPerformance}
      />

      {/* Section 7: Partnership Summary */}
      <PartnershipSummary
        partners={partnershipData.partners}
        partnerDistributions={partnerDistributions}
        partnerPerformance={partnerPerformance}
        totalContributions={totalContributions}
        totalDistributions={totalDistributions}
        ownershipValidation={ownershipValidation}
      />
    </div>
  );
};

export default PartnershipManagementTab;

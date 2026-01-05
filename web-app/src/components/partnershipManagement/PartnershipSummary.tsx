import React from 'react';
import { Partner, PartnerDistribution, PartnerPerformance } from '../../types/partnershipManagement';

interface PartnershipSummaryProps {
  partners: Partner[];
  partnerDistributions: PartnerDistribution[];
  partnerPerformance: PartnerPerformance[];
  totalContributions: number;
  totalDistributions: number;
  ownershipValidation: { isValid: boolean; totalOwnership: number };
}

const PartnershipSummary: React.FC<PartnershipSummaryProps> = ({
  partners,
  partnerDistributions,
  partnerPerformance,
  totalContributions,
  totalDistributions,
  ownershipValidation,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const totalCapital = partners.reduce((sum, p) => sum + p.initialCapital, 0);
  const netCashFlow = totalDistributions - totalContributions;

  // Calculate partnership-wide metrics
  const avgROI = partnerPerformance.length > 0
    ? partnerPerformance.reduce((sum, p) => sum + p.roi, 0) / partnerPerformance.length
    : 0;
  const avgMOIC = partnerPerformance.length > 0
    ? partnerPerformance.reduce((sum, p) => sum + p.moic, 0) / partnerPerformance.length
    : 0;
  const avgIRR = partnerPerformance.length > 0
    ? partnerPerformance.reduce((sum, p) => sum + p.irr, 0) / partnerPerformance.length
    : 0;

  // Count partners by role
  const gpCount = partners.filter(p => p.role === 'General Partner').length;
  const lpCount = partners.filter(p => p.role === 'Limited Partner').length;
  const activePartners = partners.filter(p => p.status === 'active').length;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <span className="mr-2">📋</span>
          Partnership Summary
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Comprehensive overview of partnership metrics and performance
        </p>
      </div>

      {partners.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-2">No partnership data available</p>
          <p className="text-sm text-gray-400">Add partners to see summary metrics</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="text-sm text-purple-700 mb-1">Total Partners</div>
              <div className="text-3xl font-bold text-purple-900">{partners.length}</div>
              <div className="text-xs text-purple-600 mt-1">
                {activePartners} active • {gpCount} GP • {lpCount} LP
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-blue-700 mb-1">Total Capital</div>
              <div className="text-3xl font-bold text-blue-900">{formatCurrency(totalCapital)}</div>
              <div className="text-xs text-blue-600 mt-1">Initial investments</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="text-sm text-green-700 mb-1">Total Contributions</div>
              <div className="text-3xl font-bold text-green-900">{formatCurrency(totalContributions)}</div>
              <div className="text-xs text-green-600 mt-1">All capital calls</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
              <div className="text-sm text-yellow-700 mb-1">Total Distributions</div>
              <div className="text-3xl font-bold text-yellow-900">{formatCurrency(totalDistributions)}</div>
              <div className="text-xs text-yellow-600 mt-1">All payouts</div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border-2 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Average ROI</span>
                <span className="text-2xl">📊</span>
              </div>
              <div className={`text-2xl font-bold ${avgROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(avgROI)}
              </div>
              <div className="text-xs text-gray-500 mt-1">Return on Investment</div>
            </div>

            <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Average MOIC</span>
                <span className="text-2xl">💎</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {avgMOIC.toFixed(2)}x
              </div>
              <div className="text-xs text-gray-500 mt-1">Multiple on Invested Capital</div>
            </div>

            <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Average IRR</span>
                <span className="text-2xl">📈</span>
              </div>
              <div className={`text-2xl font-bold ${avgIRR >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                {formatPercent(avgIRR)}
              </div>
              <div className="text-xs text-gray-500 mt-1">Internal Rate of Return</div>
            </div>
          </div>

          {/* Ownership Breakdown */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🥧</span>
              Ownership Breakdown
            </h4>

            {/* Ownership Validation */}
            {!ownershipValidation.isValid && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <span className="text-yellow-600 mr-2">⚠️</span>
                  <span className="text-sm font-medium text-yellow-800">
                    Total ownership is {ownershipValidation.totalOwnership.toFixed(2)}% (should be 100%)
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {partners.map((partner) => (
                <div key={partner.id} className="flex items-center">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{partner.name}</span>
                      <span className="text-sm font-semibold text-gray-900">{partner.ownershipPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${partner.ownershipPercent}%` }}
                      />
                    </div>
                  </div>
                  <span className={`ml-4 px-2 py-1 text-xs font-semibold rounded-full ${
                    partner.role === 'General Partner'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {partner.role === 'General Partner' ? 'GP' : 'LP'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Waterfall Distribution Summary */}
          {partnerDistributions.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">💧</span>
                Projected Waterfall Distribution
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Partner</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Total Distribution</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">% of Total</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerDistributions.map((dist) => (
                      <tr key={dist.partnerId} className="border-b border-gray-200">
                        <td className="px-4 py-2 text-sm text-gray-900">{dist.partnerName}</td>
                        <td className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                          {formatCurrency(dist.totalDistribution)}
                        </td>
                        <td className="px-4 py-2 text-right text-sm text-gray-700">
                          {formatPercent(dist.percentOfTotal)}
                        </td>
                        <td className="px-4 py-2 text-right text-sm font-semibold">
                          <span className={dist.roi >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatPercent(dist.roi)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cash Flow Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">💵</span>
              Cash Flow Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Inflows</div>
                <div className="text-xl font-bold text-green-600">{formatCurrency(totalDistributions)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Outflows</div>
                <div className="text-xl font-bold text-red-600">{formatCurrency(totalContributions)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Net Cash Flow</div>
                <div className={`text-xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netCashFlow)}
                </div>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">💡</span>
              Key Insights
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                • <strong>Partnership Structure:</strong> {partners.length} partners with {formatCurrency(totalCapital)} in initial capital
              </p>
              <p>
                • <strong>Ownership Distribution:</strong> {ownershipValidation.isValid ? '✅ Validated (100%)' : `⚠️ ${ownershipValidation.totalOwnership.toFixed(2)}% (should be 100%)`}
              </p>
              <p>
                • <strong>Capital Activity:</strong> {formatCurrency(totalContributions)} contributed, {formatCurrency(totalDistributions)} distributed
              </p>
              <p>
                • <strong>Average Performance:</strong> {formatPercent(avgROI)} ROI, {avgMOIC.toFixed(2)}x MOIC, {formatPercent(avgIRR)} IRR
              </p>
              <p>
                • <strong>Active Partners:</strong> {activePartners} of {partners.length} partners are currently active
              </p>
              {netCashFlow !== 0 && (
                <p>
                  • <strong>Net Position:</strong> Partnership has {netCashFlow > 0 ? 'distributed' : 'received'} a net {formatCurrency(Math.abs(netCashFlow))}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PartnershipSummary;

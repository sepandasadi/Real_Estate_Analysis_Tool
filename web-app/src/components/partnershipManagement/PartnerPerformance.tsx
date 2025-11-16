import React from 'react';
import { PartnerPerformance } from '../../types/partnershipManagement';

interface PartnerPerformanceProps {
  partnerPerformance: PartnerPerformance[];
}

const PartnerPerformanceComponent: React.FC<PartnerPerformanceProps> = ({
  partnerPerformance,
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

  const getPerformanceColor = (value: number, threshold: number = 0) => {
    if (value > threshold) return 'text-green-600';
    if (value < threshold) return 'text-red-600';
    return 'text-gray-600';
  };

  const getPerformanceRating = (roi: number) => {
    if (roi >= 0.50) return { label: 'Excellent', color: 'bg-green-500', emoji: '🌟' };
    if (roi >= 0.25) return { label: 'Very Good', color: 'bg-blue-500', emoji: '⭐' };
    if (roi >= 0.10) return { label: 'Good', color: 'bg-indigo-500', emoji: '👍' };
    if (roi >= 0) return { label: 'Fair', color: 'bg-yellow-500', emoji: '👌' };
    return { label: 'Poor', color: 'bg-red-500', emoji: '⚠️' };
  };

  // Calculate averages
  const avgROI = partnerPerformance.length > 0
    ? partnerPerformance.reduce((sum, p) => sum + p.roi, 0) / partnerPerformance.length
    : 0;
  const avgMOIC = partnerPerformance.length > 0
    ? partnerPerformance.reduce((sum, p) => sum + p.moic, 0) / partnerPerformance.length
    : 0;
  const avgIRR = partnerPerformance.length > 0
    ? partnerPerformance.reduce((sum, p) => sum + p.irr, 0) / partnerPerformance.length
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <span className="mr-2">📈</span>
          Partner Performance Dashboard
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Comprehensive performance metrics for each partner
        </p>
      </div>

      {partnerPerformance.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-2">No performance data available</p>
          <p className="text-sm text-gray-400">Add partners and contributions to see performance metrics</p>
        </div>
      ) : (
        <>
          {/* Average Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="text-sm text-green-700 mb-1">Average ROI</div>
              <div className={`text-2xl font-bold ${getPerformanceColor(avgROI)}`}>
                {formatPercent(avgROI)}
              </div>
              <div className="text-xs text-green-600 mt-1">Return on Investment</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-blue-700 mb-1">Average MOIC</div>
              <div className="text-2xl font-bold text-blue-900">
                {avgMOIC.toFixed(2)}x
              </div>
              <div className="text-xs text-blue-600 mt-1">Multiple on Invested Capital</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="text-sm text-purple-700 mb-1">Average IRR</div>
              <div className={`text-2xl font-bold ${getPerformanceColor(avgIRR)}`}>
                {formatPercent(avgIRR)}
              </div>
              <div className="text-xs text-purple-600 mt-1">Internal Rate of Return</div>
            </div>
          </div>

          {/* Performance Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Partner
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Initial Investment
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Contributions
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Distributions
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Equity
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ROI
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MOIC
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IRR
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {partnerPerformance.map((performance) => {
                  const rating = getPerformanceRating(performance.roi);
                  return (
                    <tr key={performance.partnerId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                        {performance.partnerName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-gray-700">
                        {formatCurrency(performance.initialInvestment)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-gray-700">
                        {formatCurrency(performance.totalContributions)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-gray-700">
                        {formatCurrency(performance.totalDistributions)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-gray-900">
                        {formatCurrency(performance.currentEquity)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right font-semibold">
                        <span className={getPerformanceColor(performance.roi)}>
                          {formatPercent(performance.roi)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-gray-900">
                        {performance.moic.toFixed(2)}x
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right font-semibold">
                        <span className={getPerformanceColor(performance.irr)}>
                          {formatPercent(performance.irr)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${rating.color}`}>
                          {rating.emoji} {rating.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Additional Metrics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cash-on-Cash Return */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">💰 Cash-on-Cash Return</h4>
              <div className="space-y-2">
                {partnerPerformance.map((performance) => (
                  <div key={performance.partnerId} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{performance.partnerName}</span>
                    <span className={`text-sm font-semibold ${getPerformanceColor(performance.cashOnCashReturn)}`}>
                      {formatPercent(performance.cashOnCashReturn)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Holding Period & Annualized Return */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">📅 Holding Period & Annualized Return</h4>
              <div className="space-y-2">
                {partnerPerformance.map((performance) => (
                  <div key={performance.partnerId} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700">{performance.partnerName}</span>
                      <span className="text-xs text-gray-500">
                        {performance.holdingPeriodMonths} months
                      </span>
                    </div>
                    <span className={`text-sm font-semibold ${getPerformanceColor(performance.annualizedReturn)}`}>
                      {formatPercent(performance.annualizedReturn)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Metrics Explanation */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">ℹ️</span>
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">Performance Metrics Explained:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-blue-800">
                  <div>
                    <strong>ROI (Return on Investment):</strong> Total profit divided by initial investment
                  </div>
                  <div>
                    <strong>MOIC (Multiple on Invested Capital):</strong> Total distributions divided by total contributions
                  </div>
                  <div>
                    <strong>IRR (Internal Rate of Return):</strong> Annualized rate of return considering timing of cash flows
                  </div>
                  <div>
                    <strong>Cash-on-Cash Return:</strong> Annual cash distributions divided by initial investment
                  </div>
                  <div>
                    <strong>Current Equity:</strong> Total contributions minus total distributions received
                  </div>
                  <div>
                    <strong>Annualized Return:</strong> ROI adjusted for the holding period in years
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PartnerPerformanceComponent;

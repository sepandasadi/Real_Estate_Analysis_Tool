import React from 'react';
import { FlipAnalysis } from '../../types/property';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface FlipAnalysisTabProps {
  flip: FlipAnalysis;
}

const FlipAnalysisTab: React.FC<FlipAnalysisTabProps> = ({ flip }) => {
  // Calculate scenarios
  const bestCase = {
    arv: flip.arv * 1.1, // 10% higher ARV
    rehabCost: flip.rehabCost * 0.9, // 10% lower rehab
    holdingMonths: Math.max(1, flip.holdingMonths - 2)
  };

  const worstCase = {
    arv: flip.arv * 0.9, // 10% lower ARV
    rehabCost: flip.rehabCost * 1.2, // 20% higher rehab
    holdingMonths: flip.holdingMonths + 3
  };

  const calculateProfit = (arv: number, rehab: number) => {
    const sellingCosts = arv * 0.08;
    const totalInvestment = flip.purchasePrice + rehab;
    return arv - totalInvestment - sellingCosts;
  };

  const bestProfit = calculateProfit(bestCase.arv, bestCase.rehabCost);
  const worstProfit = calculateProfit(worstCase.arv, worstCase.rehabCost);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow-md p-6 text-white">
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <span className="text-3xl">🔨</span>
          Flip Analysis
        </h3>
        <p className="text-blue-100">Comprehensive flip strategy analysis with scenarios</p>
      </div>

      {/* Key Metrics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4">Key Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border-2 border-green-200">
            <p className="text-sm text-gray-600 mb-1">Net Profit</p>
            <p className={`text-3xl font-bold ${flip.netProfit > 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(flip.netProfit)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-1">ROI</p>
            <p className="text-3xl font-bold text-blue-700">{formatPercent(flip.roi)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border-2 border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Timeline</p>
            <p className="text-3xl font-bold text-purple-700">{flip.timeline}</p>
          </div>
        </div>
      </div>

      {/* Scenario Analysis */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📊</span>
          Scenario Analysis
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Scenario</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">ARV</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Rehab Cost</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Timeline</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="bg-green-50 hover:bg-green-100 transition-colors">
                <td className="px-4 py-4 text-sm font-medium text-gray-800">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    Best Case
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-right font-medium text-gray-800">
                  {formatCurrency(bestCase.arv)}
                </td>
                <td className="px-4 py-4 text-sm text-right font-medium text-gray-800">
                  {formatCurrency(bestCase.rehabCost)}
                </td>
                <td className="px-4 py-4 text-sm text-right font-medium text-gray-800">
                  {bestCase.holdingMonths} months
                </td>
                <td className="px-4 py-4 text-sm text-right font-bold text-green-700">
                  {formatCurrency(bestProfit)}
                </td>
              </tr>
              <tr className="bg-blue-50 hover:bg-blue-100 transition-colors">
                <td className="px-4 py-4 text-sm font-medium text-gray-800">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">📍</span>
                    Base Case
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-right font-medium text-gray-800">
                  {formatCurrency(flip.arv)}
                </td>
                <td className="px-4 py-4 text-sm text-right font-medium text-gray-800">
                  {formatCurrency(flip.rehabCost)}
                </td>
                <td className="px-4 py-4 text-sm text-right font-medium text-gray-800">
                  {flip.holdingMonths} months
                </td>
                <td className="px-4 py-4 text-sm text-right font-bold text-blue-700">
                  {formatCurrency(flip.netProfit)}
                </td>
              </tr>
              <tr className="bg-red-50 hover:bg-red-100 transition-colors">
                <td className="px-4 py-4 text-sm font-medium text-gray-800">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    Worst Case
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-right font-medium text-gray-800">
                  {formatCurrency(worstCase.arv)}
                </td>
                <td className="px-4 py-4 text-sm text-right font-medium text-gray-800">
                  {formatCurrency(worstCase.rehabCost)}
                </td>
                <td className="px-4 py-4 text-sm text-right font-medium text-gray-800">
                  {worstCase.holdingMonths} months
                </td>
                <td className="px-4 py-4 text-sm text-right font-bold text-red-700">
                  {formatCurrency(worstProfit)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">💵</span>
          Cost Breakdown
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700 font-medium">Purchase Price</span>
            <span className="text-lg font-bold text-gray-800">{formatCurrency(flip.purchasePrice)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700 font-medium">Rehab Cost</span>
            <span className="text-lg font-bold text-gray-800">{formatCurrency(flip.rehabCost)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-t-2 border-blue-200">
            <span className="text-gray-800 font-semibold">Total Investment</span>
            <span className="text-xl font-bold text-blue-700">{formatCurrency(flip.totalInvestment)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mt-4">
            <span className="text-gray-700 font-medium">After Repair Value (ARV)</span>
            <span className="text-lg font-bold text-gray-800">{formatCurrency(flip.arv)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700 font-medium">Selling Costs (8%)</span>
            <span className="text-lg font-bold text-red-600">-{formatCurrency(flip.sellingCosts)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-t-2 border-green-200">
            <span className="text-gray-800 font-semibold">Net Profit</span>
            <span className={`text-xl font-bold ${flip.netProfit > 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(flip.netProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Holding Costs Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📅</span>
          Holding Costs Breakdown
        </h4>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Holding Period: {flip.holdingMonths} months
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Consider monthly costs like mortgage payments, utilities, insurance, and property taxes during the renovation period.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profit Waterfall Visualization */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📈</span>
          Profit Waterfall
        </h4>
        <div className="space-y-2">
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">ARV</span>
              <span className="text-sm font-bold text-gray-800">{formatCurrency(flip.arv)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="bg-blue-500 h-4 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Less: Total Investment</span>
              <span className="text-sm font-bold text-red-600">-{formatCurrency(flip.totalInvestment)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="bg-red-400 h-4 rounded-full" style={{ width: `${(flip.totalInvestment / flip.arv) * 100}%` }}></div>
            </div>
          </div>
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Less: Selling Costs</span>
              <span className="text-sm font-bold text-red-600">-{formatCurrency(flip.sellingCosts)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="bg-orange-400 h-4 rounded-full" style={{ width: `${(flip.sellingCosts / flip.arv) * 100}%` }}></div>
            </div>
          </div>
          <div className="relative pt-2 border-t-2 border-gray-300">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-800">Net Profit</span>
              <span className={`text-sm font-bold ${flip.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(flip.netProfit)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${flip.netProfit > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${Math.abs((flip.netProfit / flip.arv) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-800">Pro Tips</p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li>Always budget 10-20% contingency for unexpected rehab costs</li>
              <li>Factor in holding costs: mortgage, utilities, insurance, taxes</li>
              <li>Consider market conditions and seasonal trends for selling</li>
              <li>Get multiple contractor quotes before starting work</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipAnalysisTab;

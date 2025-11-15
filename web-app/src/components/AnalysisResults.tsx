import React from 'react';
import { PropertyAnalysisResult } from '../types/property';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface AnalysisResultsProps {
  results: PropertyAnalysisResult;
  onNewAnalysis: () => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ results, onNewAnalysis }) => {
  const { property, flip, rental, score, alerts, insights, comps } = results;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Analysis Results</h2>
            <p className="text-gray-600 mt-1">
              {property.address}, {property.city}, {property.state} {property.zip}
            </p>
          </div>
          <button
            onClick={onNewAnalysis}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            New Analysis
          </button>
        </div>
      </div>

      {/* Deal Score */}
      {score && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Deal Score</h3>
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold">{score.score}</span>
                <span className="text-2xl">/100</span>
              </div>
              <p className="text-primary-100 mt-2">{score.rating} Deal</p>
            </div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-8 h-8 ${i < score.stars ? 'text-yellow-300' : 'text-primary-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Alerts</h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-md border-l-4 ${
                  alert.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-400'
                    : alert.type === 'error'
                    ? 'bg-red-50 border-red-400'
                    : 'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex items-start">
                  <span className="text-lg mr-2">
                    {alert.type === 'warning' ? '⚠️' : alert.type === 'error' ? '❌' : 'ℹ️'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800 capitalize">{alert.category}</p>
                    <p className="text-gray-700 text-sm mt-1">{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {insights && insights.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Insights & Recommendations</h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-md border-l-4 ${
                  insight.type === 'positive'
                    ? 'bg-green-50 border-green-400'
                    : insight.type === 'negative'
                    ? 'bg-red-50 border-red-400'
                    : 'bg-gray-50 border-gray-400'
                }`}
              >
                <div className="flex items-start">
                  <span className="text-lg mr-2">
                    {insight.type === 'positive' ? '✅' : insight.type === 'negative' ? '❌' : '💡'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800 capitalize">{insight.category}</p>
                    <p className="text-gray-700 text-sm mt-1">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flip Analysis */}
      {flip && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Flip Analysis</h3>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Net Profit</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(flip.netProfit)}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">ROI</p>
              <p className="text-2xl font-bold text-gray-800">{formatPercent(flip.roi)}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Timeline</p>
              <p className="text-2xl font-bold text-gray-800">{flip.timeline}</p>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-800 mb-3">Cost Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Purchase Price:</span>
                <span className="font-medium">{formatCurrency(flip.purchasePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rehab Cost:</span>
                <span className="font-medium">{formatCurrency(flip.rehabCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Investment:</span>
                <span className="font-medium">{formatCurrency(flip.totalInvestment)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-600">After Repair Value (ARV):</span>
                <span className="font-medium">{formatCurrency(flip.arv)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Selling Costs (8%):</span>
                <span className="font-medium text-red-600">-{formatCurrency(flip.sellingCosts)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-800 font-semibold">Net Profit:</span>
                <span className={`font-bold ${flip.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(flip.netProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rental Analysis */}
      {rental && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Rental Analysis</h3>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Monthly Cash Flow</p>
              <p className={`text-2xl font-bold ${rental.cashFlow > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(rental.cashFlow)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Cap Rate</p>
              <p className="text-2xl font-bold text-gray-800">{formatPercent(rental.capRate)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Cash-on-Cash Return</p>
              <p className="text-2xl font-bold text-gray-800">{formatPercent(rental.cashOnCashReturn)}</p>
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-800 mb-3">Monthly Cash Flow</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Rent:</span>
                <span className="font-medium text-green-600">+{formatCurrency(rental.monthlyRent)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-800 font-medium">Expenses:</span>
              </div>
              <div className="flex justify-between pl-4">
                <span className="text-gray-600">Mortgage Payment:</span>
                <span className="font-medium text-red-600">-{formatCurrency(rental.monthlyPayment)}</span>
              </div>
              <div className="flex justify-between pl-4">
                <span className="text-gray-600">Property Tax:</span>
                <span className="font-medium text-red-600">-{formatCurrency(rental.propertyTax)}</span>
              </div>
              <div className="flex justify-between pl-4">
                <span className="text-gray-600">Insurance:</span>
                <span className="font-medium text-red-600">-{formatCurrency(rental.insurance)}</span>
              </div>
              <div className="flex justify-between pl-4">
                <span className="text-gray-600">Maintenance:</span>
                <span className="font-medium text-red-600">-{formatCurrency(rental.maintenance)}</span>
              </div>
              <div className="flex justify-between pl-4">
                <span className="text-gray-600">Vacancy Reserve:</span>
                <span className="font-medium text-red-600">-{formatCurrency(rental.vacancy)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-800 font-semibold">Net Cash Flow:</span>
                <span className={`font-bold ${rental.cashFlow > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(rental.cashFlow)}
                </span>
              </div>
            </div>
          </div>

          {/* Investment Summary */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="font-semibold text-gray-800 mb-3">Investment Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Purchase Price:</span>
                <span className="font-medium">{formatCurrency(rental.purchasePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Down Payment:</span>
                <span className="font-medium">{formatCurrency(rental.downPayment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loan Amount:</span>
                <span className="font-medium">{formatCurrency(rental.loanAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparable Properties */}
      {comps && comps.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Comparable Properties</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beds/Baths
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sqft
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sale Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comps.map((comp, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {comp.propertyUrl ? (
                        <a
                          href={comp.propertyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 hover:underline"
                        >
                          {comp.address}
                        </a>
                      ) : (
                        <span className="text-gray-900">{comp.address}</span>
                      )}
                      <div className="text-xs text-gray-500">
                        {comp.city}, {comp.state} {comp.zip}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(comp.price)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {comp.beds && comp.baths ? `${comp.beds}/${comp.baths}` : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {comp.sqft ? comp.sqft.toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {comp.saleDate || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {comp.distance ? `${comp.distance.toFixed(2)} mi` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;

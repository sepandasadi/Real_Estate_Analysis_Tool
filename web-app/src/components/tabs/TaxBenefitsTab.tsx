import React from 'react';
import { PropertyAnalysisResult } from '../../types/property';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface TaxBenefitsTabProps {
  results: PropertyAnalysisResult;
}

const TaxBenefitsTab: React.FC<TaxBenefitsTabProps> = ({ results }) => {
  const { rental } = results;

  if (!rental) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
        <p className="text-yellow-800">Tax benefits analysis requires rental property data.</p>
      </div>
    );
  }

  // Tax calculations
  const propertyValue = rental.purchasePrice;
  const landValue = propertyValue * 0.2; // Assume 20% land value
  const buildingValue = propertyValue * 0.8; // 80% building value
  const annualDepreciation = buildingValue / 27.5; // Residential rental property depreciation

  const taxBracket = 0.24; // Assume 24% federal tax bracket
  const annualTaxSavings = annualDepreciation * taxBracket;

  // Generate 27.5 year depreciation schedule (show first 10 years)
  const depreciationSchedule = Array.from({ length: 10 }, (_, i) => ({
    year: i + 1,
    depreciation: annualDepreciation,
    cumulativeDepreciation: annualDepreciation * (i + 1),
    taxSavings: annualTaxSavings,
    cumulativeTaxSavings: annualTaxSavings * (i + 1)
  }));

  // Capital gains calculation (assuming 5-year hold)
  const holdYears = 5;
  const appreciationRate = 0.03;
  const futureValue = propertyValue * Math.pow(1 + appreciationRate, holdYears);
  const capitalGain = futureValue - propertyValue;
  const longTermCapGainsRate = 0.15; // 15% long-term capital gains rate
  const capitalGainsTax = capitalGain * longTermCapGainsRate;
  const depreciationRecapture = annualDepreciation * holdYears * 0.25; // 25% recapture rate
  const totalTaxOnSale = capitalGainsTax + depreciationRecapture;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg shadow-md p-6 text-white">
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <span className="text-3xl">💰</span>
          Tax Benefits Analysis
        </h3>
        <p className="text-purple-100">Maximize your tax advantages with rental property ownership</p>
      </div>

      {/* Key Tax Benefits */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4">Key Tax Benefits</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border-2 border-green-200">
            <p className="text-sm text-gray-600 mb-1">Annual Depreciation</p>
            <p className="text-3xl font-bold text-green-700">{formatCurrency(annualDepreciation)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Annual Tax Savings</p>
            <p className="text-3xl font-bold text-blue-700">{formatCurrency(annualTaxSavings)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border-2 border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Effective Tax Rate</p>
            <p className="text-3xl font-bold text-purple-700">{formatPercent(taxBracket)}</p>
          </div>
        </div>
      </div>

      {/* Depreciation Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📉</span>
          Depreciation Breakdown
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Property Value</p>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(propertyValue)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Land Value (20%)</p>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(landValue)}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Depreciable Basis (80%)</p>
              <p className="text-lg font-bold text-blue-700">{formatCurrency(buildingValue)}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Depreciation Period</p>
              <p className="text-lg font-bold text-blue-700">27.5 years</p>
            </div>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Residential rental properties are depreciated over 27.5 years using the straight-line method.
              Land is not depreciable, so we exclude the estimated land value (typically 20% of property value).
            </p>
          </div>
        </div>
      </div>

      {/* Depreciation Schedule */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📅</span>
          10-Year Depreciation Schedule
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Year</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Annual Depreciation</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Cumulative Depreciation</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Tax Savings</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Cumulative Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {depreciationSchedule.map((item, index) => (
                <tr key={item.year} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">Year {item.year}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">
                    {formatCurrency(item.depreciation)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-blue-700">
                    {formatCurrency(item.cumulativeDepreciation)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-green-700">
                    {formatCurrency(item.taxSavings)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-green-700">
                    {formatCurrency(item.cumulativeTaxSavings)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Total Tax Savings (10 years):</strong> {formatCurrency(annualTaxSavings * 10)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Over the full 27.5-year depreciation period, total tax savings: {formatCurrency(annualTaxSavings * 27.5)}
          </p>
        </div>
      </div>

      {/* Capital Gains Analysis */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📈</span>
          Capital Gains Analysis (5-Year Hold)
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Purchase Price</p>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(propertyValue)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Future Value (3% appreciation)</p>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(futureValue)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Capital Gain</p>
              <p className="text-lg font-bold text-green-700">{formatCurrency(capitalGain)}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Capital Gains Tax (15%)</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(capitalGainsTax)}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Depreciation Recapture (25%)</p>
              <p className="text-lg font-bold text-orange-600">{formatCurrency(depreciationRecapture)}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
              <p className="text-sm text-gray-600 mb-1">Total Tax on Sale</p>
              <p className="text-lg font-bold text-red-700">{formatCurrency(totalTaxOnSale)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 1031 Exchange */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🔄</span>
          1031 Exchange Planning
        </h4>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg border-2 border-indigo-200">
          <h5 className="text-lg font-semibold text-gray-800 mb-3">Defer Capital Gains Tax</h5>
          <p className="text-sm text-gray-700 mb-4">
            A 1031 exchange allows you to defer paying capital gains taxes by reinvesting the proceeds
            from the sale of your property into a "like-kind" property.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Tax Without 1031</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totalTaxOnSale)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Tax With 1031</p>
              <p className="text-xl font-bold text-green-600">$0 (Deferred)</p>
            </div>
          </div>
          <div className="mt-4 bg-white p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-800 mb-2">Key Requirements:</p>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Identify replacement property within 45 days</li>
              <li>Complete exchange within 180 days</li>
              <li>Use a qualified intermediary</li>
              <li>Replacement property must be equal or greater value</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Deductible Expenses */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📝</span>
          Common Tax Deductions
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-semibold text-gray-800 mb-2">Operating Expenses</h5>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Property management fees</li>
              <li>Repairs and maintenance</li>
              <li>Property insurance</li>
              <li>Property taxes</li>
              <li>Utilities (if paid by owner)</li>
              <li>HOA fees</li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="font-semibold text-gray-800 mb-2">Other Deductions</h5>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Mortgage interest</li>
              <li>Depreciation</li>
              <li>Legal and professional fees</li>
              <li>Advertising for tenants</li>
              <li>Travel expenses (property visits)</li>
              <li>Home office (if applicable)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-yellow-800">Important Disclaimer</p>
            <p className="text-sm text-yellow-700 mt-1">
              This analysis is for informational purposes only and should not be considered tax advice.
              Tax laws are complex and vary by jurisdiction. Always consult with a qualified tax professional
              or CPA for personalized tax planning and advice specific to your situation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxBenefitsTab;

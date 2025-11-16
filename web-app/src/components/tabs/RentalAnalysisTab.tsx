import React from 'react';
import { RentalAnalysis } from '../../types/property';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface RentalAnalysisTabProps {
  rental: RentalAnalysis;
}

const RentalAnalysisTab: React.FC<RentalAnalysisTabProps> = ({ rental }) => {
  // Calculate 10-year projection
  const years = Array.from({ length: 10 }, (_, i) => i + 1);
  const annualAppreciation = 0.03; // 3% annual appreciation
  const rentGrowth = 0.025; // 2.5% annual rent growth

  const projections = years.map(year => {
    const propertyValue = rental.purchasePrice * Math.pow(1 + annualAppreciation, year);
    const monthlyRent = rental.monthlyRent * Math.pow(1 + rentGrowth, year);
    const annualRent = monthlyRent * 12;
    const annualExpenses = (rental.monthlyPayment + rental.propertyTax + rental.insurance +
                           rental.maintenance + rental.vacancy) * 12;
    const annualCashFlow = annualRent - annualExpenses;
    const equity = propertyValue - (rental.loanAmount * Math.pow(0.99, year * 12)); // Simplified equity calculation

    return {
      year,
      propertyValue,
      monthlyRent,
      annualCashFlow,
      equity
    };
  });

  // Calculate DSCR (Debt Service Coverage Ratio)
  const annualRent = rental.monthlyRent * 12;
  const annualDebtService = rental.monthlyPayment * 12;
  const dscr = annualRent / annualDebtService;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-lg shadow-md p-6 text-white">
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <span className="text-3xl">🏠</span>
          Rental Analysis
        </h3>
        <p className="text-green-100">Long-term rental investment analysis with projections</p>
      </div>

      {/* Key Metrics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4">Key Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border-2 border-green-200">
            <p className="text-sm text-gray-600 mb-1">Monthly Cash Flow</p>
            <p className={`text-3xl font-bold ${rental.cashFlow > 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(rental.cashFlow)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Cap Rate</p>
            <p className="text-3xl font-bold text-blue-700">{formatPercent(rental.capRate)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border-2 border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Cash-on-Cash Return</p>
            <p className="text-3xl font-bold text-purple-700">{formatPercent(rental.cashOnCashReturn)}</p>
          </div>
        </div>
      </div>

      {/* DSCR */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📊</span>
          Debt Service Coverage Ratio (DSCR)
        </h4>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg border-2 border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">DSCR</p>
              <p className={`text-4xl font-bold ${dscr >= 1.25 ? 'text-green-700' : dscr >= 1.0 ? 'text-yellow-700' : 'text-red-700'}`}>
                {dscr.toFixed(2)}x
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {dscr >= 1.25 ? '✅ Excellent - Strong coverage' :
                 dscr >= 1.0 ? '⚠️ Adequate - Minimal coverage' :
                 '❌ Poor - Insufficient coverage'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Annual Rent</p>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(annualRent)}</p>
              <p className="text-sm text-gray-600 mt-2">Annual Debt Service</p>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(annualDebtService)}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <p className="text-sm text-blue-800">
            <strong>DSCR</strong> measures the property's ability to cover debt payments.
            Lenders typically require a minimum DSCR of 1.25x for rental properties.
          </p>
        </div>
      </div>

      {/* Monthly Cash Flow Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">💵</span>
          Monthly Cash Flow Breakdown
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
            <span className="text-gray-700 font-medium">Monthly Rent</span>
            <span className="text-lg font-bold text-green-700">+{formatCurrency(rental.monthlyRent)}</span>
          </div>
          <div className="border-t-2 border-gray-200 pt-3">
            <p className="text-sm font-semibold text-gray-700 mb-2">Monthly Expenses:</p>
          </div>
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg pl-6">
            <span className="text-gray-700 font-medium">Mortgage Payment</span>
            <span className="text-lg font-bold text-red-600">-{formatCurrency(rental.monthlyPayment)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg pl-6">
            <span className="text-gray-700 font-medium">Property Tax</span>
            <span className="text-lg font-bold text-red-600">-{formatCurrency(rental.propertyTax)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg pl-6">
            <span className="text-gray-700 font-medium">Insurance</span>
            <span className="text-lg font-bold text-red-600">-{formatCurrency(rental.insurance)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg pl-6">
            <span className="text-gray-700 font-medium">Maintenance (10%)</span>
            <span className="text-lg font-bold text-red-600">-{formatCurrency(rental.maintenance)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg pl-6">
            <span className="text-gray-700 font-medium">Vacancy Reserve (5%)</span>
            <span className="text-lg font-bold text-red-600">-{formatCurrency(rental.vacancy)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-t-2 border-blue-200">
            <span className="text-gray-800 font-semibold">Total Expenses</span>
            <span className="text-lg font-bold text-red-600">-{formatCurrency(rental.totalExpenses)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-300">
            <span className="text-gray-800 font-bold">Net Cash Flow</span>
            <span className={`text-xl font-bold ${rental.cashFlow > 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(rental.cashFlow)}
            </span>
          </div>
        </div>
      </div>

      {/* Investment Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🏦</span>
          Investment Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Purchase Price</p>
            <p className="text-lg font-bold text-gray-800">{formatCurrency(rental.purchasePrice)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Down Payment</p>
            <p className="text-lg font-bold text-gray-800">{formatCurrency(rental.downPayment)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Loan Amount</p>
            <p className="text-lg font-bold text-gray-800">{formatCurrency(rental.loanAmount)}</p>
          </div>
        </div>
      </div>

      {/* 10-Year Projection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📈</span>
          10-Year Projection
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Year</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Property Value</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Monthly Rent</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Annual Cash Flow</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Equity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projections.map((proj, index) => (
                <tr key={proj.year} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">Year {proj.year}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">
                    {formatCurrency(proj.propertyValue)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">
                    {formatCurrency(proj.monthlyRent)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-green-700">
                    {formatCurrency(proj.annualCashFlow)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-blue-700">
                    {formatCurrency(proj.equity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Assumptions:</strong> 3% annual property appreciation, 2.5% annual rent growth
          </p>
        </div>
      </div>

      {/* BRRRR Strategy */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🔄</span>
          BRRRR Strategy Comparison
        </h4>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border-2 border-purple-200">
          <p className="text-sm font-semibold text-gray-800 mb-3">
            Buy, Rehab, Rent, Refinance, Repeat
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Traditional Buy & Hold</p>
              <p className="text-lg font-bold text-gray-800">
                Down Payment: {formatCurrency(rental.downPayment)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">BRRRR Potential</p>
              <p className="text-lg font-bold text-purple-700">
                Refinance after rehab to recover capital
              </p>
            </div>
          </div>
          <div className="mt-4 bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              With BRRRR, you could potentially refinance based on the improved property value,
              recovering most or all of your initial investment while maintaining cash flow.
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-green-800">Rental Investment Tips</p>
            <ul className="text-sm text-green-700 mt-2 space-y-1 list-disc list-inside">
              <li>Target properties with at least 1% monthly rent-to-price ratio</li>
              <li>Maintain 6-12 months of reserves for vacancies and repairs</li>
              <li>Screen tenants thoroughly to minimize turnover and issues</li>
              <li>Consider property management costs (typically 8-10% of rent)</li>
              <li>Review local landlord-tenant laws and regulations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalAnalysisTab;

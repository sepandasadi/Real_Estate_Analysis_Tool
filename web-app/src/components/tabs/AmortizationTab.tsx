import React, { useState } from 'react';
import { RentalAnalysis } from '../../types/property';
import { formatCurrency } from '../../utils/formatters';

interface AmortizationTabProps {
  rental: RentalAnalysis;
}

const AmortizationTab: React.FC<AmortizationTabProps> = ({ rental }) => {
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  // Calculate amortization schedule
  const loanAmount = rental.loanAmount;
  const monthlyPayment = rental.monthlyPayment;
  const annualRate = 0.07; // Assume 7% interest rate (should come from form data)
  const monthlyRate = annualRate / 12;
  const totalMonths = 360; // 30-year loan

  const generateSchedule = (months: number) => {
    const schedule = [];
    let remainingBalance = loanAmount;

    for (let month = 1; month <= months; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;

      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, remainingBalance)
      });
    }

    return schedule;
  };

  const firstYearSchedule = generateSchedule(12);
  const fullSchedule = showFullSchedule ? generateSchedule(totalMonths) : [];

  // Calculate totals
  const firstYearTotals = firstYearSchedule.reduce(
    (acc, month) => ({
      principal: acc.principal + month.principal,
      interest: acc.interest + month.interest
    }),
    { principal: 0, interest: 0 }
  );

  const lifetimeTotals = {
    payments: monthlyPayment * totalMonths,
    principal: loanAmount,
    interest: (monthlyPayment * totalMonths) - loanAmount
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-lg shadow-md p-6 text-white">
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <span className="text-3xl">📅</span>
          Amortization Schedule
        </h3>
        <p className="text-indigo-100">Detailed breakdown of your loan payments over time</p>
      </div>

      {/* Loan Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4">Loan Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Loan Amount</p>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(loanAmount)}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border-2 border-green-200">
            <p className="text-sm text-gray-600 mb-1">Monthly Payment</p>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(monthlyPayment)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border-2 border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Interest Rate</p>
            <p className="text-2xl font-bold text-purple-700">{(annualRate * 100).toFixed(2)}%</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-lg border-2 border-orange-200">
            <p className="text-sm text-gray-600 mb-1">Loan Term</p>
            <p className="text-2xl font-bold text-orange-700">30 years</p>
          </div>
        </div>
      </div>

      {/* First Year Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📊</span>
          First Year Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Payments</p>
            <p className="text-lg font-bold text-gray-800">{formatCurrency(monthlyPayment * 12)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Principal Paid</p>
            <p className="text-lg font-bold text-green-700">{formatCurrency(firstYearTotals.principal)}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Interest Paid</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(firstYearTotals.interest)}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Principal vs Interest (Year 1)</span>
            <span className="text-sm text-gray-600">
              {((firstYearTotals.principal / (monthlyPayment * 12)) * 100).toFixed(1)}% Principal
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            <div className="flex h-full">
              <div
                className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${(firstYearTotals.principal / (monthlyPayment * 12)) * 100}%` }}
              >
                Principal
              </div>
              <div
                className="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${(firstYearTotals.interest / (monthlyPayment * 12)) * 100}%` }}
              >
                Interest
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* First Year Schedule */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📋</span>
          First Year Payment Schedule
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Month</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Payment</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Principal</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Interest</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {firstYearSchedule.map((item, index) => (
                <tr key={item.month} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">Month {item.month}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">
                    {formatCurrency(item.payment)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-green-700">
                    {formatCurrency(item.principal)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                    {formatCurrency(item.interest)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-blue-700">
                    {formatCurrency(item.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lifetime Totals */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">💰</span>
          Lifetime Loan Totals (30 Years)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
            <p className="text-sm text-gray-600 mb-1">Total Payments</p>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(lifetimeTotals.payments)}</p>
          </div>
          <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-400">
            <p className="text-sm text-gray-600 mb-1">Total Principal</p>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(lifetimeTotals.principal)}</p>
          </div>
          <div className="bg-red-50 p-5 rounded-lg border-l-4 border-red-400">
            <p className="text-sm text-gray-600 mb-1">Total Interest</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(lifetimeTotals.interest)}</p>
          </div>
        </div>
        <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <p className="text-sm text-yellow-800">
            <strong>Interest Cost:</strong> Over the life of the loan, you'll pay{' '}
            {formatCurrency(lifetimeTotals.interest)} in interest, which is{' '}
            {((lifetimeTotals.interest / lifetimeTotals.principal) * 100).toFixed(1)}% of the original loan amount.
          </p>
        </div>
      </div>

      {/* Full Schedule Toggle */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-xl">📑</span>
            Full Amortization Schedule
          </h4>
          <button
            onClick={() => setShowFullSchedule(!showFullSchedule)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            {showFullSchedule ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Hide Full Schedule
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Show Full Schedule (360 months)
              </>
            )}
          </button>
        </div>

        {showFullSchedule && (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Month</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Payment</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Principal</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Interest</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fullSchedule.map((item, index) => (
                  <tr key={item.month} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      Month {item.month} (Year {Math.ceil(item.month / 12)})
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">
                      {formatCurrency(item.payment)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-green-700">
                      {formatCurrency(item.principal)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                      {formatCurrency(item.interest)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-blue-700">
                      {formatCurrency(item.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!showFullSchedule && (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-600">
              Click "Show Full Schedule" to view all 360 monthly payments
            </p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-800">Amortization Tips</p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li>Early in the loan, most of your payment goes toward interest</li>
              <li>Making extra principal payments can significantly reduce total interest paid</li>
              <li>Consider bi-weekly payments to pay off your loan faster</li>
              <li>Refinancing to a lower rate can save thousands in interest</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmortizationTab;

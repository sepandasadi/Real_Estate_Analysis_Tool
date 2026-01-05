import React, { useState } from 'react';

interface LoanComparisonTabProps {
  rental?: {
    purchasePrice: number;
    downPayment: number;
    loanAmount: number;
    monthlyPayment: number;
    propertyTax: number;
    insurance: number;
    maintenance: number;
    vacancy: number;
    monthlyRent: number;
  };
}

interface LoanScenario {
  name: string;
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  loanAmount: number;
  downPaymentAmount: number;
  monthlyPMI: number;
  effectiveRate: number;
}

const LoanComparisonTab: React.FC<LoanComparisonTabProps> = ({ rental }) => {
  const [customDownPayment, setCustomDownPayment] = useState<number>(20);
  const [customInterestRate, setCustomInterestRate] = useState<number>(7.0);
  const [customLoanTerm, setCustomLoanTerm] = useState<number>(30);

  if (!rental) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
        <p className="text-yellow-800">Loan comparison requires rental property data.</p>
      </div>
    );
  }

  const purchasePrice = rental.purchasePrice;

  // Calculate loan scenario
  const calculateLoanScenario = (
    name: string,
    downPaymentPercent: number,
    interestRate: number,
    loanTermYears: number
  ): LoanScenario => {
    const downPaymentAmount = purchasePrice * (downPaymentPercent / 100);
    const loanAmount = purchasePrice - downPaymentAmount;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTermYears * 12;

    // Calculate monthly payment (P&I)
    const monthlyPayment =
      loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    // Calculate PMI (if down payment < 20%)
    const monthlyPMI = downPaymentPercent < 20 ? loanAmount * 0.005 / 12 : 0;

    // Total paid over life of loan
    const totalPaid = monthlyPayment * numPayments + downPaymentAmount;
    const totalInterest = (monthlyPayment * numPayments) - loanAmount;

    // Effective rate including PMI
    const effectiveRate = monthlyPMI > 0
      ? ((monthlyPayment + monthlyPMI) * numPayments - loanAmount) / loanAmount / loanTermYears * 100
      : interestRate;

    return {
      name,
      downPaymentPercent,
      interestRate,
      loanTermYears,
      monthlyPayment,
      totalInterest,
      totalPaid,
      loanAmount,
      downPaymentAmount,
      monthlyPMI,
      effectiveRate,
    };
  };

  // Pre-defined scenarios
  const scenarios: LoanScenario[] = [
    calculateLoanScenario('Conventional 20%', 20, 7.0, 30),
    calculateLoanScenario('Conventional 15%', 15, 7.0, 30),
    calculateLoanScenario('FHA 3.5%', 3.5, 6.5, 30),
    calculateLoanScenario('15-Year Fixed', 20, 6.5, 15),
    calculateLoanScenario('Custom', customDownPayment, customInterestRate, customLoanTerm),
  ];

  // Calculate monthly costs including all expenses
  const calculateMonthlyCost = (scenario: LoanScenario) => {
    return (
      scenario.monthlyPayment +
      scenario.monthlyPMI +
      rental.propertyTax +
      rental.insurance +
      rental.maintenance +
      rental.vacancy
    );
  };

  // Calculate cash flow
  const calculateCashFlow = (scenario: LoanScenario) => {
    return rental.monthlyRent - calculateMonthlyCost(scenario);
  };

  // Calculate cash-on-cash return
  const calculateCashOnCash = (scenario: LoanScenario) => {
    const annualCashFlow = calculateCashFlow(scenario) * 12;
    return (annualCashFlow / scenario.downPaymentAmount) * 100;
  };

  // Find best scenario
  const bestScenario = scenarios.reduce((best, current) => {
    const bestCashFlow = calculateCashFlow(best);
    const currentCashFlow = calculateCashFlow(current);
    return currentCashFlow > bestCashFlow ? current : best;
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Loan Comparison</h2>
        <p className="text-gray-600">
          Compare different financing options and find the best loan structure for your investment
        </p>
      </div>

      {/* Property Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Property Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Purchase Price</p>
            <p className="text-xl font-bold text-gray-900">${purchasePrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Monthly Rent</p>
            <p className="text-xl font-bold text-green-600">${rental.monthlyRent.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Property Tax</p>
            <p className="text-lg font-semibold text-gray-700">${rental.propertyTax.toLocaleString()}/mo</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Insurance</p>
            <p className="text-lg font-semibold text-gray-700">${rental.insurance.toLocaleString()}/mo</p>
          </div>
        </div>
      </div>

      {/* Custom Scenario Builder */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Custom Scenario Builder</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Down Payment (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={customDownPayment}
              onChange={(e) => setCustomDownPayment(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interest Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.125"
              value={customInterestRate}
              onChange={(e) => setCustomInterestRate(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Term (years)
            </label>
            <select
              value={customLoanTerm}
              onChange={(e) => setCustomLoanTerm(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="15">15 years</option>
              <option value="20">20 years</option>
              <option value="30">30 years</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loan Scenarios Comparison Table */}
      <div className="overflow-x-auto mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Loan Scenarios Comparison</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">Scenario</th>
              <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700">Down Payment</th>
              <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700">Loan Amount</th>
              <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700">Rate</th>
              <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700">Term</th>
              <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700">Monthly P&I</th>
              <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700">PMI</th>
              <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700">Total Cost</th>
              <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700">Cash Flow</th>
              <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700">CoC Return</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((scenario, index) => {
              const isBest = scenario.name === bestScenario.name;
              const cashFlow = calculateCashFlow(scenario);
              const cocReturn = calculateCashOnCash(scenario);

              return (
                <tr
                  key={index}
                  className={`${
                    isBest ? 'bg-green-50 border-2 border-green-500' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="border border-gray-300 p-3 font-semibold text-gray-800">
                    {scenario.name}
                    {isBest && (
                      <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">
                        BEST
                      </span>
                    )}
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    <div className="font-semibold text-gray-800">
                      {scenario.downPaymentPercent.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">
                      ${scenario.downPaymentAmount.toLocaleString()}
                    </div>
                  </td>
                  <td className="border border-gray-300 p-3 text-center font-semibold text-gray-800">
                    ${scenario.loanAmount.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 p-3 text-center font-semibold text-gray-800">
                    {scenario.interestRate.toFixed(2)}%
                  </td>
                  <td className="border border-gray-300 p-3 text-center font-semibold text-gray-800">
                    {scenario.loanTermYears} yrs
                  </td>
                  <td className="border border-gray-300 p-3 text-center font-semibold text-gray-800">
                    ${scenario.monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    {scenario.monthlyPMI > 0 ? (
                      <span className="text-orange-600 font-semibold">
                        ${scenario.monthlyPMI.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    ) : (
                      <span className="text-green-600 font-semibold">None</span>
                    )}
                  </td>
                  <td className="border border-gray-300 p-3 text-center font-semibold text-gray-800">
                    ${calculateMonthlyCost(scenario).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className={`border border-gray-300 p-3 text-center font-bold ${
                    cashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${cashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className={`border border-gray-300 p-3 text-center font-bold ${
                    cocReturn >= 8 ? 'text-green-600' : cocReturn >= 5 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {cocReturn.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detailed Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {scenarios.slice(0, 3).map((scenario, index) => {
          const cashFlow = calculateCashFlow(scenario);
          const cocReturn = calculateCashOnCash(scenario);
          const isBest = scenario.name === bestScenario.name;

          return (
            <div
              key={index}
              className={`rounded-lg p-4 border-2 ${
                isBest
                  ? 'bg-green-50 border-green-500'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-gray-800">{scenario.name}</h4>
                {isBest && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-semibold">
                    BEST
                  </span>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Down Payment:</span>
                  <span className="font-semibold text-gray-800">
                    ${scenario.downPaymentAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly P&I:</span>
                  <span className="font-semibold text-gray-800">
                    ${scenario.monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest:</span>
                  <span className="font-semibold text-gray-800">
                    ${scenario.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="text-gray-600">Cash Flow:</span>
                  <span className={`font-bold ${cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${cashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CoC Return:</span>
                  <span className={`font-bold ${
                    cocReturn >= 8 ? 'text-green-600' : cocReturn >= 5 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {cocReturn.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clipRule="evenodd"
            />
          </svg>
          Key Insights
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              <strong>Best Option:</strong> {bestScenario.name} provides the highest cash flow of{' '}
              ${calculateCashFlow(bestScenario).toLocaleString(undefined, { maximumFractionDigits: 0 })}/month
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              <strong>PMI Impact:</strong> Scenarios with less than 20% down include PMI, which reduces cash flow
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              <strong>15-Year Advantage:</strong> Shorter loan terms have higher monthly payments but save significantly on total interest
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              <strong>Cash-on-Cash:</strong> Target 8%+ for good rental returns. Lower down payments can increase CoC return if cash flow remains positive
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LoanComparisonTab;

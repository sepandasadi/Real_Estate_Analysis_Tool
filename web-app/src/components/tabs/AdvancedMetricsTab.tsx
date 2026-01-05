import React from 'react';

interface AdvancedMetricsTabProps {
  flip?: {
    purchasePrice: number;
    rehabCost: number;
    arv: number;
    totalInvestment: number;
    sellingCosts: number;
    netProfit: number;
    roi: number;
    holdingMonths: number;
  };
  rental?: {
    purchasePrice: number;
    downPayment: number;
    loanAmount: number;
    monthlyRent: number;
    monthlyPayment: number;
    propertyTax: number;
    insurance: number;
    maintenance: number;
    vacancy: number;
    totalExpenses: number;
    cashFlow: number;
    capRate: number;
    cashOnCashReturn: number;
  };
}

const AdvancedMetricsTab: React.FC<AdvancedMetricsTabProps> = ({ flip, rental }) => {
  // Calculate advanced flip metrics
  const calculateFlipMetrics = () => {
    if (!flip) return null;

    // Annualized ROI
    const annualizedROI = (flip.roi / flip.holdingMonths) * 12;

    // Profit Margin
    const profitMargin = (flip.netProfit / flip.arv) * 100;

    // Cost to ARV Ratio (70% rule benchmark)
    const costToARVRatio = (flip.totalInvestment / flip.arv) * 100;

    // Break-even ARV (minimum ARV needed to break even)
    const breakEvenARV = flip.totalInvestment + flip.sellingCosts;

    // Downside Protection (how much ARV can drop before losing money)
    const downsideProtection = ((flip.arv - breakEvenARV) / flip.arv) * 100;

    // Return on Investment per Month
    const roiPerMonth = flip.roi / flip.holdingMonths;

    return {
      annualizedROI,
      profitMargin,
      costToARVRatio,
      breakEvenARV,
      downsideProtection,
      roiPerMonth,
    };
  };

  // Calculate advanced rental metrics
  const calculateRentalMetrics = () => {
    if (!rental) return null;

    // Gross Rent Multiplier (GRM)
    const annualRent = rental.monthlyRent * 12;
    const grm = rental.purchasePrice / annualRent;

    // Debt Service Coverage Ratio (DSCR)
    const noi = annualRent - (rental.totalExpenses - rental.monthlyPayment) * 12;
    const annualDebtService = rental.monthlyPayment * 12;
    const dscr = noi / annualDebtService;

    // Operating Expense Ratio
    const operatingExpenses = (rental.totalExpenses - rental.monthlyPayment) * 12;
    const operatingExpenseRatio = (operatingExpenses / annualRent) * 100;

    // Break-even Occupancy
    const breakEvenOccupancy = (rental.totalExpenses / rental.monthlyRent) * 100;

    // Payback Period (years to recover down payment from cash flow)
    const annualCashFlow = rental.cashFlow * 12;
    const paybackPeriod = annualCashFlow > 0 ? rental.downPayment / annualCashFlow : Infinity;

    // Equity Multiple (projected over 5 years)
    const fiveYearCashFlow = annualCashFlow * 5;
    const equityMultiple = (rental.downPayment + fiveYearCashFlow) / rental.downPayment;

    // Rent to Price Ratio (1% rule benchmark)
    const rentToPriceRatio = (rental.monthlyRent / rental.purchasePrice) * 100;

    return {
      grm,
      dscr,
      operatingExpenseRatio,
      breakEvenOccupancy,
      paybackPeriod,
      equityMultiple,
      rentToPriceRatio,
      annualRent,
      annualCashFlow,
    };
  };

  const flipMetrics = calculateFlipMetrics();
  const rentalMetrics = calculateRentalMetrics();

  // Helper function to get metric status color
  const getMetricStatus = (value: number, good: number, fair: number, reverse = false) => {
    if (reverse) {
      if (value <= good) return 'text-green-600';
      if (value <= fair) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (value >= good) return 'text-green-600';
      if (value >= fair) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Advanced Metrics</h2>
        <p className="text-gray-600">
          Detailed financial metrics and performance indicators
        </p>
      </div>

      <div className="space-y-8">
        {/* Flip Advanced Metrics */}
        {flip && flipMetrics && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Flip Investment Metrics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Annualized ROI */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-700">Annualized ROI</h4>
                    <p className="text-xs text-gray-500 mt-1">ROI adjusted to annual basis</p>
                  </div>
                  <span className={`text-2xl font-bold ${getMetricStatus(flipMetrics.annualizedROI, 30, 20)}`}>
                    {flipMetrics.annualizedROI.toFixed(2)}%
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    <strong>Benchmark:</strong> &gt;30% Excellent, 20-30% Good
                  </p>
                </div>
              </div>

              {/* Profit Margin */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-700">Profit Margin</h4>
                    <p className="text-xs text-gray-500 mt-1">Net profit as % of ARV</p>
                  </div>
                  <span className={`text-2xl font-bold ${getMetricStatus(flipMetrics.profitMargin, 15, 10)}`}>
                    {flipMetrics.profitMargin.toFixed(2)}%
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    <strong>Benchmark:</strong> &gt;15% Excellent, 10-15% Good
                  </p>
                </div>
              </div>

              {/* Cost to ARV Ratio */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-700">Cost to ARV Ratio</h4>
                    <p className="text-xs text-gray-500 mt-1">70% rule compliance</p>
                  </div>
                  <span className={`text-2xl font-bold ${getMetricStatus(flipMetrics.costToARVRatio, 70, 75, true)}`}>
                    {flipMetrics.costToARVRatio.toFixed(2)}%
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    <strong>Benchmark:</strong> &lt;70% Excellent, 70-75% Good
                  </p>
                </div>
              </div>

              {/* ROI per Month */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-700">ROI per Month</h4>
                    <p className="text-xs text-gray-500 mt-1">Monthly return rate</p>
                  </div>
                  <span className={`text-2xl font-bold ${getMetricStatus(flipMetrics.roiPerMonth, 2.5, 1.5)}`}>
                    {flipMetrics.roiPerMonth.toFixed(2)}%
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    <strong>Benchmark:</strong> &gt;2.5% Excellent, 1.5-2.5% Good
                  </p>
                </div>
              </div>

              {/* Break-even ARV */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-700">Break-even ARV</h4>
                    <p className="text-xs text-gray-500 mt-1">Minimum ARV to avoid loss</p>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">
                    ${flipMetrics.breakEvenARV.toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    Current ARV: <strong>${flip.arv.toLocaleString()}</strong>
                  </p>
                </div>
              </div>

              {/* Downside Protection */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-700">Downside Protection</h4>
                    <p className="text-xs text-gray-500 mt-1">ARV cushion before loss</p>
                  </div>
                  <span className={`text-2xl font-bold ${getMetricStatus(flipMetrics.downsideProtection, 20, 10)}`}>
                    {flipMetrics.downsideProtection.toFixed(2)}%
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    <strong>Benchmark:</strong> &gt;20% Excellent, 10-20% Good
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rental Advanced Metrics */}
        {rental && rentalMetrics && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Rental Investment Metrics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rent to Price Ratio */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-700">Rent to Price Ratio</h4>
                    <p className="text-xs text-gray-500 mt-1">1% rule compliance</p>
                  </div>
                  <span className={`text-2xl font-bold ${getMetricStatus(rentalMetrics.rentToPriceRatio, 1.0, 0.7)}`}>
                    {rentalMetrics.rentToPriceRatio.toFixed(3)}%
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    <strong>Benchmark:</strong> &gt;1% Excellent, 0.7-1% Good
                  </p>
                </div>
              </div>

              {/* Debt Service Coverage Ratio */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-700">DSCR</h4>
                    <p className="text-xs text-gray-500 mt-1">Debt service coverage ratio</p>
                  </div>
                  <span className={`text-2xl font-bold ${getMetricStatus(rentalMetrics.dscr, 1.25, 1.0)}`}>
                    {rentalMetrics.dscr.toFixed(2)}x
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    <strong>Benchmark:</strong> &gt;1.25x Excellent, 1.0-1.25x Good
                  </p>
                </div>
              </div>

              {/* Gross Rent Multiplier */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-700">Gross Rent Multiplier</h4>
                    <p className="text-xs text-gray-500 mt-1">Price to annual rent ratio</p>
                  </div>
                  <span className={`text-2xl font-bold ${getMetricStatus(rentalMetrics.grm, 15, 12, true)}`}>
                    {rentalMetrics.grm.toFixed(2)}x
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    <strong>Benchmark:</strong> &lt;12x Excellent, 12-15x Good
                  </p>
                </div>
              </div>

              {/* Operating Expense Ratio */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-700">Operating Expense Ratio</h4>
                    <p className="text-xs text-gray-500 mt-1">OpEx as % of gross rent</p>
                  </div>
                  <span className={`text-2xl font-bold ${getMetricStatus(rentalMetrics.operatingExpenseRatio, 50, 35, true)}`}>
                    {rentalMetrics.operatingExpenseRatio.toFixed(2)}%
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    <strong>Benchmark:</strong> &lt;35% Excellent, 35-50% Good
                  </p>
                </div>
              </div>

              {/* Break-even Occupancy */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-700">Break-even Occupancy</h4>
                    <p className="text-xs text-gray-500 mt-1">Minimum occupancy needed</p>
                  </div>
                  <span className={`text-2xl font-bold ${getMetricStatus(rentalMetrics.breakEvenOccupancy, 90, 80, true)}`}>
                    {rentalMetrics.breakEvenOccupancy.toFixed(2)}%
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    <strong>Benchmark:</strong> &lt;80% Excellent, 80-90% Good
                  </p>
                </div>
              </div>

              {/* Payback Period */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-700">Payback Period</h4>
                    <p className="text-xs text-gray-500 mt-1">Years to recover down payment</p>
                  </div>
                  <span className={`text-2xl font-bold ${
                    rentalMetrics.paybackPeriod === Infinity
                      ? 'text-red-600'
                      : getMetricStatus(rentalMetrics.paybackPeriod, 15, 10, true)
                  }`}>
                    {rentalMetrics.paybackPeriod === Infinity
                      ? 'N/A'
                      : `${rentalMetrics.paybackPeriod.toFixed(1)} yrs`}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    <strong>Benchmark:</strong> &lt;10 yrs Excellent, 10-15 yrs Good
                  </p>
                </div>
              </div>

              {/* Equity Multiple (5-year) */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-700">5-Year Equity Multiple</h4>
                    <p className="text-xs text-gray-500 mt-1">Projected return multiple</p>
                  </div>
                  <span className={`text-2xl font-bold ${getMetricStatus(rentalMetrics.equityMultiple, 1.5, 1.2)}`}>
                    {rentalMetrics.equityMultiple.toFixed(2)}x
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    <strong>Benchmark:</strong> &gt;1.5x Excellent, 1.2-1.5x Good
                  </p>
                </div>
              </div>

              {/* Annual Cash Flow */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-700">Annual Cash Flow</h4>
                    <p className="text-xs text-gray-500 mt-1">Yearly net income</p>
                  </div>
                  <span className={`text-2xl font-bold ${rentalMetrics.annualCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${rentalMetrics.annualCashFlow.toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    Monthly: <strong>${rental.cashFlow.toLocaleString()}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Insights */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Metric Interpretations
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            {flip && flipMetrics && (
              <>
                <div className="bg-white rounded-lg p-3">
                  <p className="font-semibold text-gray-800 mb-1">Flip Analysis:</p>
                  <ul className="space-y-1 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>
                        Your annualized ROI of <strong>{flipMetrics.annualizedROI.toFixed(2)}%</strong> shows the yearly return rate
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>
                        Cost-to-ARV ratio of <strong>{flipMetrics.costToARVRatio.toFixed(2)}%</strong> {flipMetrics.costToARVRatio <= 70 ? 'meets' : 'exceeds'} the 70% rule
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>
                        You have <strong>{flipMetrics.downsideProtection.toFixed(2)}%</strong> downside protection if ARV estimates are high
                      </span>
                    </li>
                  </ul>
                </div>
              </>
            )}
            {rental && rentalMetrics && (
              <>
                <div className="bg-white rounded-lg p-3">
                  <p className="font-semibold text-gray-800 mb-1">Rental Analysis:</p>
                  <ul className="space-y-1 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>
                        Rent-to-price ratio of <strong>{rentalMetrics.rentToPriceRatio.toFixed(3)}%</strong> {rentalMetrics.rentToPriceRatio >= 1.0 ? 'exceeds' : 'is below'} the 1% rule
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>
                        DSCR of <strong>{rentalMetrics.dscr.toFixed(2)}x</strong> indicates {rentalMetrics.dscr >= 1.25 ? 'strong' : rentalMetrics.dscr >= 1.0 ? 'adequate' : 'weak'} debt coverage
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>
                        {rentalMetrics.paybackPeriod === Infinity
                          ? 'Negative cash flow means no payback period'
                          : `Down payment recovers in ${rentalMetrics.paybackPeriod.toFixed(1)} years from cash flow`}
                      </span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        {/* No Data Message */}
        {!flip && !rental && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
            <p className="text-yellow-800">No analysis data available for advanced metrics.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedMetricsTab;

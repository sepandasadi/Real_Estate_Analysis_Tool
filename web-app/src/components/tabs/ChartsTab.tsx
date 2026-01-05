import React from 'react';

interface ChartsTabProps {
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

const ChartsTab: React.FC<ChartsTabProps> = ({ flip, rental }) => {
  // Calculate percentages for flip cost breakdown
  const getFlipBreakdown = () => {
    if (!flip) return null;
    const total = flip.purchasePrice + flip.rehabCost + flip.sellingCosts;
    return {
      purchase: (flip.purchasePrice / total) * 100,
      rehab: (flip.rehabCost / total) * 100,
      selling: (flip.sellingCosts / total) * 100,
    };
  };

  // Calculate percentages for rental expense breakdown
  const getRentalExpenseBreakdown = () => {
    if (!rental) return null;
    const total = rental.totalExpenses;
    return {
      mortgage: (rental.monthlyPayment / total) * 100,
      tax: (rental.propertyTax / total) * 100,
      insurance: (rental.insurance / total) * 100,
      maintenance: (rental.maintenance / total) * 100,
      vacancy: (rental.vacancy / total) * 100,
    };
  };

  // Generate 12-month cash flow projection
  const getCashFlowProjection = () => {
    if (!rental) return [];
    const projection = [];
    let cumulative = 0;
    for (let i = 1; i <= 12; i++) {
      cumulative += rental.cashFlow;
      projection.push({
        month: i,
        monthly: rental.cashFlow,
        cumulative: cumulative,
      });
    }
    return projection;
  };

  const flipBreakdown = getFlipBreakdown();
  const rentalBreakdown = getRentalExpenseBreakdown();
  const cashFlowProjection = getCashFlowProjection();

  // Find max cumulative for scaling
  const maxCumulative = cashFlowProjection.length > 0
    ? Math.max(...cashFlowProjection.map(p => Math.abs(p.cumulative)))
    : 1;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Charts & Visualizations</h2>
        <p className="text-gray-600">
          Visual analysis of investment costs, returns, and projections
        </p>
      </div>

      <div className="space-y-8">
        {/* Flip vs Rental Comparison */}
        {flip && rental && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Investment Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Flip ROI */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-700 mb-3">Flip Analysis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">ROI</span>
                    <span className="text-2xl font-bold text-green-600">{flip.roi.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Net Profit</span>
                    <span className="text-lg font-semibold text-gray-800">${flip.netProfit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Hold Time</span>
                    <span className="text-lg font-semibold text-gray-800">{flip.holdingMonths} months</span>
                  </div>
                </div>
              </div>

              {/* Rental Returns */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-700 mb-3">Rental Analysis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cash-on-Cash</span>
                    <span className="text-2xl font-bold text-blue-600">{rental.cashOnCashReturn.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monthly Cash Flow</span>
                    <span className={`text-lg font-semibold ${rental.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${rental.cashFlow.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cap Rate</span>
                    <span className="text-lg font-semibold text-gray-800">{rental.capRate.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Flip Cost Breakdown Chart */}
        {flip && flipBreakdown && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Flip Cost Breakdown</h3>
            <div className="space-y-4">
              {/* Purchase Price Bar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Purchase Price</span>
                  <span className="text-sm font-semibold text-gray-800">
                    ${flip.purchasePrice.toLocaleString()} ({flipBreakdown.purchase.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                    style={{ width: `${flipBreakdown.purchase}%` }}
                  >
                    <span className="text-white text-xs font-semibold">
                      {flipBreakdown.purchase > 15 ? `${flipBreakdown.purchase.toFixed(1)}%` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rehab Cost Bar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Rehab Cost</span>
                  <span className="text-sm font-semibold text-gray-800">
                    ${flip.rehabCost.toLocaleString()} ({flipBreakdown.rehab.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                    style={{ width: `${flipBreakdown.rehab}%` }}
                  >
                    <span className="text-white text-xs font-semibold">
                      {flipBreakdown.rehab > 15 ? `${flipBreakdown.rehab.toFixed(1)}%` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selling Costs Bar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Selling Costs</span>
                  <span className="text-sm font-semibold text-gray-800">
                    ${flip.sellingCosts.toLocaleString()} ({flipBreakdown.selling.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                    style={{ width: `${flipBreakdown.selling}%` }}
                  >
                    <span className="text-white text-xs font-semibold">
                      {flipBreakdown.selling > 15 ? `${flipBreakdown.selling.toFixed(1)}%` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total and Profit */}
              <div className="mt-6 pt-4 border-t-2 border-gray-300">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base font-bold text-gray-800">Total Costs</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${(flip.purchasePrice + flip.rehabCost + flip.sellingCosts).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base font-bold text-gray-800">ARV</span>
                  <span className="text-lg font-bold text-green-600">
                    ${flip.arv.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-800">Net Profit</span>
                  <span className={`text-xl font-bold ${flip.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${flip.netProfit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rental Expense Breakdown Chart */}
        {rental && rentalBreakdown && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly Rental Expense Breakdown</h3>
            <div className="space-y-4">
              {/* Mortgage Payment Bar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Mortgage Payment</span>
                  <span className="text-sm font-semibold text-gray-800">
                    ${rental.monthlyPayment.toLocaleString()} ({rentalBreakdown.mortgage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                    style={{ width: `${rentalBreakdown.mortgage}%` }}
                  >
                    <span className="text-white text-xs font-semibold">
                      {rentalBreakdown.mortgage > 15 ? `${rentalBreakdown.mortgage.toFixed(1)}%` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Property Tax Bar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Property Tax</span>
                  <span className="text-sm font-semibold text-gray-800">
                    ${rental.propertyTax.toLocaleString()} ({rentalBreakdown.tax.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                    style={{ width: `${rentalBreakdown.tax}%` }}
                  >
                    <span className="text-white text-xs font-semibold">
                      {rentalBreakdown.tax > 15 ? `${rentalBreakdown.tax.toFixed(1)}%` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Insurance Bar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Insurance</span>
                  <span className="text-sm font-semibold text-gray-800">
                    ${rental.insurance.toLocaleString()} ({rentalBreakdown.insurance.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                    style={{ width: `${rentalBreakdown.insurance}%` }}
                  >
                    <span className="text-white text-xs font-semibold">
                      {rentalBreakdown.insurance > 15 ? `${rentalBreakdown.insurance.toFixed(1)}%` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Maintenance Bar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Maintenance</span>
                  <span className="text-sm font-semibold text-gray-800">
                    ${rental.maintenance.toLocaleString()} ({rentalBreakdown.maintenance.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                    style={{ width: `${rentalBreakdown.maintenance}%` }}
                  >
                    <span className="text-white text-xs font-semibold">
                      {rentalBreakdown.maintenance > 15 ? `${rentalBreakdown.maintenance.toFixed(1)}%` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vacancy Reserve Bar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Vacancy Reserve</span>
                  <span className="text-sm font-semibold text-gray-800">
                    ${rental.vacancy.toLocaleString()} ({rentalBreakdown.vacancy.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-pink-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                    style={{ width: `${rentalBreakdown.vacancy}%` }}
                  >
                    <span className="text-white text-xs font-semibold">
                      {rentalBreakdown.vacancy > 15 ? `${rentalBreakdown.vacancy.toFixed(1)}%` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total and Cash Flow */}
              <div className="mt-6 pt-4 border-t-2 border-gray-300">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base font-bold text-gray-800">Monthly Rent</span>
                  <span className="text-lg font-bold text-green-600">
                    ${rental.monthlyRent.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base font-bold text-gray-800">Total Expenses</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${rental.totalExpenses.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-800">Monthly Cash Flow</span>
                  <span className={`text-xl font-bold ${rental.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${rental.cashFlow.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 12-Month Cash Flow Projection */}
        {rental && cashFlowProjection.length > 0 && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">12-Month Cash Flow Projection</h3>
            <div className="space-y-3">
              {cashFlowProjection.map((projection) => (
                <div key={projection.month} className="flex items-center gap-4">
                  <div className="w-16 text-sm font-medium text-gray-700">
                    Month {projection.month}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden relative">
                        <div
                          className={`h-6 rounded-full transition-all duration-500 ${
                            projection.cumulative >= 0
                              ? 'bg-gradient-to-r from-green-500 to-green-600'
                              : 'bg-gradient-to-r from-red-500 to-red-600'
                          }`}
                          style={{
                            width: `${(Math.abs(projection.cumulative) / maxCumulative) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="w-32 text-right">
                        <span className={`text-sm font-semibold ${
                          projection.cumulative >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${projection.cumulative.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t-2 border-gray-300">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-gray-800">Year 1 Total Cash Flow</span>
                <span className={`text-xl font-bold ${
                  cashFlowProjection[11].cumulative >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${cashFlowProjection[11].cumulative.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {!flip && !rental && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
            <p className="text-yellow-800">No analysis data available for charts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartsTab;

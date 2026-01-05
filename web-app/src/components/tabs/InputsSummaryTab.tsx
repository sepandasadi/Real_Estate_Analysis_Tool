import React from 'react';
import { PropertyFormData, PropertyAnalysisResult } from '../../types/property';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface InputsSummaryTabProps {
  formData: PropertyFormData;
  results: PropertyAnalysisResult;
  onEdit: () => void;
}

const InputsSummaryTab: React.FC<InputsSummaryTabProps> = ({ formData, results, onEdit }) => {
  const { flip, rental } = results;

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-800">Input Summary</h3>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Inputs
          </button>
        </div>

        {/* Property Information */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-xl">🏠</span>
            Property Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Address</p>
              <p className="text-base font-medium text-gray-800">{formData.address}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">City</p>
              <p className="text-base font-medium text-gray-800">{formData.city}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">State</p>
              <p className="text-base font-medium text-gray-800">{formData.state}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">ZIP Code</p>
              <p className="text-base font-medium text-gray-800">{formData.zip}</p>
            </div>
          </div>
        </div>

        {/* Purchase & Financing */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-xl">💵</span>
            Purchase & Financing
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Purchase Price</p>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(formData.purchasePrice)}</p>
            </div>
            {formData.downPayment !== undefined && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Down Payment</p>
                <p className="text-lg font-bold text-gray-800">{formData.downPayment}%</p>
              </div>
            )}
            {formData.loanInterestRate !== undefined && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Loan Interest Rate</p>
                <p className="text-lg font-bold text-gray-800">{formData.loanInterestRate}%</p>
              </div>
            )}
            {formData.loanTerm !== undefined && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Loan Term</p>
                <p className="text-lg font-bold text-gray-800">{formData.loanTerm} years</p>
              </div>
            )}
          </div>
        </div>

        {/* Flip Details */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-xl">🔨</span>
            Flip Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formData.rehabCost !== undefined && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Rehab Cost</p>
                <p className="text-lg font-bold text-gray-800">{formatCurrency(formData.rehabCost)}</p>
              </div>
            )}
            {formData.monthsToFlip !== undefined && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Months to Flip</p>
                <p className="text-lg font-bold text-gray-800">{formData.monthsToFlip} months</p>
              </div>
            )}
            {formData.cashInvestment !== undefined && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Cash Investment</p>
                <p className="text-lg font-bold text-gray-800">{formatCurrency(formData.cashInvestment)}</p>
              </div>
            )}
            {formData.helocInterest !== undefined && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">HELOC / Loan Interest</p>
                <p className="text-lg font-bold text-gray-800">{formData.helocInterest}%</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📊</span>
          Quick Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {flip && (
            <>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">ARV (After Repair Value)</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(flip.arv)}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1">Net Profit (Flip)</p>
                <p className={`text-2xl font-bold ${flip.netProfit > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(flip.netProfit)}
                </p>
              </div>
            </>
          )}
          {rental && (
            <>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600 mb-1">Cap Rate</p>
                <p className="text-2xl font-bold text-purple-700">{formatPercent(rental.capRate)}</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-lg border border-indigo-200">
                <p className="text-sm text-gray-600 mb-1">Cash-on-Cash Return</p>
                <p className="text-2xl font-bold text-indigo-700">{formatPercent(rental.cashOnCashReturn)}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-800">
              This summary shows all the inputs you provided for this property analysis.
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Click "Edit Inputs" to modify any values and re-run the analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputsSummaryTab;

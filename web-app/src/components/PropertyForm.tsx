import React, { useState, useEffect } from 'react';
import { PropertyFormData, US_STATES } from '../types/property';

interface PropertyFormProps {
  onSubmit: (data: PropertyFormData) => void;
  loading?: boolean;
  initialData?: Partial<PropertyFormData>;
  selectedHistoryData?: PropertyFormData | null;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ onSubmit, loading = false, initialData, selectedHistoryData }) => {
  const [formData, setFormData] = useState<PropertyFormData>({
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zip: initialData?.zip || '',
    purchasePrice: initialData?.purchasePrice || 0,
    downPayment: initialData?.downPayment,
    loanInterestRate: initialData?.loanInterestRate || 7.0,
    loanTerm: initialData?.loanTerm || 30,
    rehabCost: initialData?.rehabCost,
    monthsToFlip: initialData?.monthsToFlip || 6,
    cashInvestment: initialData?.cashInvestment,
    helocInterest: initialData?.helocInterest,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PropertyFormData, string>>>({});
  const [analysisType, setAnalysisType] = useState<'both' | 'flip' | 'rental'>('both');

  // Update form when history item is selected
  useEffect(() => {
    if (selectedHistoryData) {
      setFormData(selectedHistoryData);
      // Determine analysis type based on data
      if (selectedHistoryData.rehabCost !== undefined && selectedHistoryData.rehabCost > 0) {
        setAnalysisType('both');
      } else {
        setAnalysisType('rental');
      }
    }
  }, [selectedHistoryData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof PropertyFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PropertyFormData, string>> = {};

    // Required fields
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    if (!formData.zip.trim()) {
      newErrors.zip = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zip)) {
      newErrors.zip = 'Invalid ZIP code format';
    }
    if (!formData.purchasePrice || formData.purchasePrice <= 0) {
      newErrors.purchasePrice = 'Purchase price must be greater than 0';
    }

    // Analysis-specific validation
    if (analysisType === 'flip' || analysisType === 'both') {
      if (!formData.rehabCost && formData.rehabCost !== 0) {
        newErrors.rehabCost = 'Rehab cost is required for flip analysis';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 space-y-8 border border-gray-200">
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary-600 p-3 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Property Analysis</h2>
            <p className="text-gray-600 mt-1">Enter property details to analyze investment potential</p>
          </div>
        </div>
      </div>

      {/* Analysis Type Selection */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Analysis Type
        </label>
        <div className="flex flex-wrap gap-3">
          <label className={`flex items-center px-5 py-3 rounded-lg border-2 cursor-pointer transition-all ${
            analysisType === 'both'
              ? 'bg-primary-50 border-primary-500'
              : 'bg-white border-gray-300 hover:border-primary-400'
          }`}>
            <input
              type="radio"
              name="analysisType"
              value="both"
              checked={analysisType === 'both'}
              onChange={(e) => setAnalysisType(e.target.value as any)}
              className="mr-3 w-4 h-4 text-primary-600"
            />
            <span className={`text-sm font-medium ${analysisType === 'both' ? 'text-primary-700' : 'text-gray-700'}`}>
              Both (Flip & Rental)
            </span>
          </label>
          <label className={`flex items-center px-5 py-3 rounded-lg border-2 cursor-pointer transition-all ${
            analysisType === 'flip'
              ? 'bg-blue-50 border-blue-500'
              : 'bg-white border-gray-300 hover:border-blue-400'
          }`}>
            <input
              type="radio"
              name="analysisType"
              value="flip"
              checked={analysisType === 'flip'}
              onChange={(e) => setAnalysisType(e.target.value as any)}
              className="mr-3 w-4 h-4 text-blue-600"
            />
            <span className={`text-sm font-medium ${analysisType === 'flip' ? 'text-blue-700' : 'text-gray-700'}`}>
              Flip Only
            </span>
          </label>
          <label className={`flex items-center px-5 py-3 rounded-lg border-2 cursor-pointer transition-all ${
            analysisType === 'rental'
              ? 'bg-green-50 border-green-500'
              : 'bg-white border-gray-300 hover:border-green-400'
          }`}>
            <input
              type="radio"
              name="analysisType"
              value="rental"
              checked={analysisType === 'rental'}
              onChange={(e) => setAnalysisType(e.target.value as any)}
              className="mr-3 w-4 h-4 text-green-600"
            />
            <span className={`text-sm font-medium ${analysisType === 'rental' ? 'text-green-700' : 'text-gray-700'}`}>
              Rental Only
            </span>
          </label>
        </div>
      </div>

      {/* Property Details */}
      <div className="space-y-5 bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Property Details
        </h3>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-primary-500'
            }`}
            placeholder="123 Main St"
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-primary-500'
              }`}
              placeholder="San Francisco"
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.state ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-primary-500'
              }`}
            >
              <option value="">Select State</option>
              {US_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
          </div>

          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code *
            </label>
            <input
              type="text"
              id="zip"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.zip ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-primary-500'
              }`}
              placeholder="94102"
            />
            {errors.zip && <p className="text-red-500 text-sm mt-1">{errors.zip}</p>}
          </div>
        </div>
      </div>

      {/* Purchase Information */}
      <div className="space-y-5 bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Purchase Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Price *
            </label>
            <input
              type="number"
              id="purchasePrice"
              name="purchasePrice"
              value={formData.purchasePrice || ''}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.purchasePrice ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-primary-500'
              }`}
              placeholder="300000"
              min="0"
              step="1000"
            />
            {errors.purchasePrice && <p className="text-red-500 text-sm mt-1">{errors.purchasePrice}</p>}
          </div>

          <div>
            <label htmlFor="downPayment" className="block text-sm font-medium text-gray-700 mb-1">
              Down Payment % (optional)
            </label>
            <input
              type="number"
              id="downPayment"
              name="downPayment"
              value={formData.downPayment === undefined ? '' : formData.downPayment}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="20"
              min="0"
              max="100"
              step="0.1"
            />
          </div>

        </div>
      </div>

      {/* Loan Details */}
      <div className="space-y-5 bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Loan Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="loanInterestRate" className="block text-sm font-medium text-gray-700 mb-1">
              Mortgage Interest Rate (%)
            </label>
            <input
              type="number"
              id="loanInterestRate"
              name="loanInterestRate"
              value={formData.loanInterestRate || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="7.00"
              min="0"
              max="20"
              step="0.01"
            />
          </div>

          <div>
            <label htmlFor="loanTerm" className="block text-sm font-medium text-gray-700 mb-1">
              Loan Term (years)
            </label>
            <input
              type="number"
              id="loanTerm"
              name="loanTerm"
              value={formData.loanTerm || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="30"
              min="1"
              max="40"
              step="1"
            />
          </div>
        </div>
      </div>

      {/* Flip Analysis Fields */}
      {(analysisType === 'flip' || analysisType === 'both') && (
        <div className="space-y-5 bg-blue-50 p-6 rounded-lg border border-blue-200 animate-fadeIn">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Flip Analysis
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="rehabCost" className="block text-sm font-medium text-gray-700 mb-1">
                Rehab Cost *
              </label>
              <input
                type="number"
                id="rehabCost"
                name="rehabCost"
                value={formData.rehabCost || ''}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.rehabCost ? 'border-red-500 bg-red-50' : 'border-blue-300 bg-white focus:border-blue-500'
                }`}
                placeholder="50000"
                min="0"
                step="1000"
              />
              {errors.rehabCost && <p className="text-red-500 text-sm mt-1">{errors.rehabCost}</p>}
            </div>


            <div>
              <label htmlFor="monthsToFlip" className="block text-sm font-medium text-gray-700 mb-1">
                Months to Flip
              </label>
              <input
                type="number"
                id="monthsToFlip"
                name="monthsToFlip"
                value={formData.monthsToFlip || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-blue-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="6"
                min="1"
                max="24"
                step="1"
              />
            </div>

            <div>
              <label htmlFor="cashInvestment" className="block text-sm font-medium text-gray-700 mb-1">
                Cash Investment ($)
              </label>
              <input
                type="number"
                id="cashInvestment"
                name="cashInvestment"
                value={formData.cashInvestment || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-blue-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="75000"
                min="0"
                step="1000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="helocInterest" className="block text-sm font-medium text-gray-700 mb-1">
                HELOC / Loan Interest (%)
              </label>
              <input
                type="number"
                id="helocInterest"
                name="helocInterest"
                value={formData.helocInterest || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-blue-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="7.00"
                min="0"
                max="20"
                step="0.01"
              />
            </div>
          </div>
        </div>
      )}


      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className={`group relative px-8 py-4 rounded-lg font-semibold text-white text-lg transition-all ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500'
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Property...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analyze Property
            </span>
          )}
        </button>
      </div>
    </form>
  );
};

export default PropertyForm;

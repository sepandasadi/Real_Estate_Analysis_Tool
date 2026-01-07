import React, { useState, useEffect } from 'react';
import { PropertyFormData, US_STATES, UserProvidedComp } from '../types/property';
import DeepModePasswordModal from './DeepModePasswordModal';

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
    analysisMode: initialData?.analysisMode || 'STANDARD',
    beds: initialData?.beds,
    baths: initialData?.baths,
    sqft: initialData?.sqft,
    yearBuilt: initialData?.yearBuilt,
    arv: initialData?.arv,
    userProvidedComps: initialData?.userProvidedComps || [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PropertyFormData, string>>>({});
  const [analysisType, setAnalysisType] = useState<'both' | 'flip' | 'rental'>('both');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [, setPreviousMode] = useState<'BASIC' | 'STANDARD' | 'DEEP'>('STANDARD');
  const [newComp, setNewComp] = useState<UserProvidedComp>({
    address: '',
    price: 0,
    beds: undefined,
    baths: undefined,
    sqft: undefined,
    yearBuilt: undefined,
    saleDate: '',
  });

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

  const handleAnalysisModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMode = e.target.value as 'BASIC' | 'STANDARD' | 'DEEP';

    // If selecting Deep Mode, show password modal
    if (newMode === 'DEEP') {
      setPreviousMode(formData.analysisMode || 'STANDARD');
      setShowPasswordModal(true);
    } else {
      // For Basic and Standard modes, change directly
      setFormData(prev => ({ ...prev, analysisMode: newMode }));
    }
  };

  const handlePasswordSuccess = () => {
    // Password validated successfully, activate Deep Mode
    setFormData(prev => ({ ...prev, analysisMode: 'DEEP' }));
  };

  const handlePasswordModalClose = () => {
    // Password modal closed without success, revert to previous mode
    setShowPasswordModal(false);
    // Keep the previous mode selected
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

    // Basic Mode: Property details are required
    if (formData.analysisMode === 'BASIC') {
      if (!formData.beds || formData.beds <= 0) {
        newErrors.beds = 'Number of beds is required in Basic Mode';
      }
      if (!formData.baths || formData.baths <= 0) {
        newErrors.baths = 'Number of baths is required in Basic Mode';
      }
      if (!formData.sqft || formData.sqft <= 0) {
        newErrors.sqft = 'Square footage is required in Basic Mode';
      }
      if (!formData.yearBuilt || formData.yearBuilt < 1800 || formData.yearBuilt > new Date().getFullYear()) {
        newErrors.yearBuilt = 'Valid year built is required in Basic Mode';
      }
      // ARV is required in Basic Mode for flip analysis
      if ((analysisType === 'flip' || analysisType === 'both') && (!formData.arv || formData.arv <= 0)) {
        newErrors.arv = 'ARV is required in Basic Mode for flip analysis';
      }
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
    <>
      {/* Deep Mode Password Modal */}
      <DeepModePasswordModal
        isOpen={showPasswordModal}
        onClose={handlePasswordModalClose}
        onSuccess={handlePasswordSuccess}
      />

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

      {/* Analysis Mode Selection */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border-2 border-purple-200">
        <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Analysis Mode
          <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
            {formData.analysisMode === 'BASIC' && '⚡ Basic'}
            {formData.analysisMode === 'STANDARD' && '⭐ Standard'}
            {formData.analysisMode === 'DEEP' && '🚀 Deep'}
          </span>
        </label>
        <p className="text-xs text-gray-600 mb-4">
          Choose how much data to fetch automatically (affects API usage)
          {formData.analysisMode === 'BASIC' && ' • Manual input required'}
          {formData.analysisMode === 'STANDARD' && ' • Auto-fetch essentials'}
          {formData.analysisMode === 'DEEP' && ' • Full automation active'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Basic Mode */}
          <label className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
            formData.analysisMode === 'BASIC'
              ? 'bg-white border-purple-500 shadow-md'
              : 'bg-white border-gray-300 hover:border-purple-400'
          }`}>
            <input
              type="radio"
              name="analysisMode"
              value="BASIC"
              checked={formData.analysisMode === 'BASIC'}
              onChange={handleAnalysisModeChange}
              className="absolute top-3 right-3 w-4 h-4 text-purple-600"
            />
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚡</span>
              <span className={`text-sm font-bold ${formData.analysisMode === 'BASIC' ? 'text-purple-700' : 'text-gray-700'}`}>
                Basic Mode
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-2">You provide all data manually</p>
            <div className="text-xs text-gray-500 space-y-1">
              <div>• 0-1 API calls</div>
              <div>• Unlimited capacity</div>
              <div>• Manual input required</div>
            </div>
          </label>

          {/* Standard Mode */}
          <label className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
            formData.analysisMode === 'STANDARD'
              ? 'bg-white border-blue-500 shadow-md'
              : 'bg-white border-gray-300 hover:border-blue-400'
          }`}>
            <input
              type="radio"
              name="analysisMode"
              value="STANDARD"
              checked={formData.analysisMode === 'STANDARD'}
              onChange={handleAnalysisModeChange}
              className="absolute top-3 right-3 w-4 h-4 text-blue-600"
            />
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⭐</span>
              <span className={`text-sm font-bold ${formData.analysisMode === 'STANDARD' ? 'text-blue-700' : 'text-gray-700'}`}>
                Standard Mode
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-2">Auto-fetch essentials</p>
            <div className="text-xs text-gray-500 space-y-1">
              <div>• 2-4 API calls</div>
              <div>• 300-600 properties/mo</div>
              <div>• Recommended</div>
            </div>
          </label>

          {/* Deep Mode */}
          <label className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
            formData.analysisMode === 'DEEP'
              ? 'bg-white border-green-500 shadow-md'
              : 'bg-white border-gray-300 hover:border-green-400'
          }`}>
            <input
              type="radio"
              name="analysisMode"
              value="DEEP"
              checked={formData.analysisMode === 'DEEP'}
              onChange={handleAnalysisModeChange}
              className="absolute top-3 right-3 w-4 h-4 text-green-600"
            />
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🚀</span>
              <span className={`text-sm font-bold ${formData.analysisMode === 'DEEP' ? 'text-green-700' : 'text-gray-700'}`}>
                Deep Mode
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-2">Full automation & validation</p>
            <div className="text-xs text-gray-500 space-y-1">
              <div>• 8-12 API calls</div>
              <div>• 100-200 properties/mo</div>
              <div>• Maximum accuracy</div>
            </div>
          </label>
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

      {/* Deep Mode Active Indicator */}
      {formData.analysisMode === 'DEEP' && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg p-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="bg-green-500 p-2 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-green-800 mb-1">🚀 Deep Mode Active</h4>
              <p className="text-xs text-green-700 mb-2">
                Most fields will be auto-populated from APIs. Only provide the basic property information below.
              </p>
              <ul className="text-xs text-green-600 space-y-1">
                <li>• Property details will be validated automatically</li>
                <li>• Comps will be fetched and filtered automatically</li>
                <li>• ARV will be calculated from multiple sources</li>
                <li>• Historical data will be analyzed for trends</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Property Details */}
      <div className="space-y-5 bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Property Details
          {formData.analysisMode === 'DEEP' && (
            <span className="ml-auto text-xs font-normal text-green-600 bg-green-100 px-3 py-1 rounded-full">
              Auto-validated by API
            </span>
          )}
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

        {/* Basic Mode: Manual Property Details */}
        {formData.analysisMode === 'BASIC' && (
          <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200 animate-fadeIn">
            <p className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
              <span>⚡</span>
              Basic Mode: Provide property details manually
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="beds" className="block text-sm font-medium text-gray-700 mb-1">
                  Beds *
                </label>
                <input
                  type="number"
                  id="beds"
                  name="beds"
                  value={formData.beds || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border bg-white rounded-lg focus:outline-none focus:ring-2 ${
                    errors.beds ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-purple-300 focus:ring-purple-500'
                  }`}
                  placeholder="3"
                  min="0"
                  step="1"
                />
                {errors.beds && <p className="text-red-500 text-sm mt-1">{errors.beds}</p>}
              </div>
              <div>
                <label htmlFor="baths" className="block text-sm font-medium text-gray-700 mb-1">
                  Baths *
                </label>
                <input
                  type="number"
                  id="baths"
                  name="baths"
                  value={formData.baths || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border bg-white rounded-lg focus:outline-none focus:ring-2 ${
                    errors.baths ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-purple-300 focus:ring-purple-500'
                  }`}
                  placeholder="2"
                  min="0"
                  step="0.5"
                />
                {errors.baths && <p className="text-red-500 text-sm mt-1">{errors.baths}</p>}
              </div>
              <div>
                <label htmlFor="sqft" className="block text-sm font-medium text-gray-700 mb-1">
                  Sqft *
                </label>
                <input
                  type="number"
                  id="sqft"
                  name="sqft"
                  value={formData.sqft || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border bg-white rounded-lg focus:outline-none focus:ring-2 ${
                    errors.sqft ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-purple-300 focus:ring-purple-500'
                  }`}
                  placeholder="1500"
                  min="0"
                  step="100"
                />
                {errors.sqft && <p className="text-red-500 text-sm mt-1">{errors.sqft}</p>}
              </div>
              <div>
                <label htmlFor="yearBuilt" className="block text-sm font-medium text-gray-700 mb-1">
                  Year Built *
                </label>
                <input
                  type="number"
                  id="yearBuilt"
                  name="yearBuilt"
                  value={formData.yearBuilt || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border bg-white rounded-lg focus:outline-none focus:ring-2 ${
                    errors.yearBuilt ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-purple-300 focus:ring-purple-500'
                  }`}
                  placeholder="2000"
                  min="1800"
                  max={new Date().getFullYear()}
                  step="1"
                />
                {errors.yearBuilt && <p className="text-red-500 text-sm mt-1">{errors.yearBuilt}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Deep Mode: Optional Property Details */}
        {formData.analysisMode === 'DEEP' && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border-2 border-green-300 animate-fadeIn">
            <p className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
              <span className="text-xl">🚀</span>
              Deep Mode: Optional Details (Auto-fetched if not provided)
            </p>
            <p className="text-xs text-green-700 mb-3">
              These fields are optional in Deep Mode. If you leave them blank, they'll be automatically fetched and validated from our APIs.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="beds-deep" className="block text-sm font-medium text-gray-700 mb-1">
                  Beds <span className="text-xs text-green-600">(Optional)</span>
                </label>
                <input
                  type="number"
                  id="beds-deep"
                  name="beds"
                  value={formData.beds || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-green-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Auto-fetch"
                  min="0"
                  step="1"
                />
              </div>
              <div>
                <label htmlFor="baths-deep" className="block text-sm font-medium text-gray-700 mb-1">
                  Baths <span className="text-xs text-green-600">(Optional)</span>
                </label>
                <input
                  type="number"
                  id="baths-deep"
                  name="baths"
                  value={formData.baths || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-green-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Auto-fetch"
                  min="0"
                  step="0.5"
                />
              </div>
              <div>
                <label htmlFor="sqft-deep" className="block text-sm font-medium text-gray-700 mb-1">
                  Sqft <span className="text-xs text-green-600">(Optional)</span>
                </label>
                <input
                  type="number"
                  id="sqft-deep"
                  name="sqft"
                  value={formData.sqft || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-green-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Auto-fetch"
                  min="0"
                  step="100"
                />
              </div>
              <div>
                <label htmlFor="yearBuilt-deep" className="block text-sm font-medium text-gray-700 mb-1">
                  Year Built <span className="text-xs text-green-600">(Optional)</span>
                </label>
                <input
                  type="number"
                  id="yearBuilt-deep"
                  name="yearBuilt"
                  value={formData.yearBuilt || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-green-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Auto-fetch"
                  min="1800"
                  max={new Date().getFullYear()}
                  step="1"
                />
              </div>
            </div>
            <div className="mt-3 flex items-start gap-2 text-xs text-green-700">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Leaving these blank will trigger automatic data fetching, using 8-12 API calls for maximum accuracy.</span>
            </div>
          </div>
        )}
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

            {/* Basic & Standard Mode: ARV Input */}
            {(formData.analysisMode === 'BASIC' || formData.analysisMode === 'STANDARD') && (
              <div>
                <label htmlFor="arv" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  ARV (After Repair Value) {formData.analysisMode === 'BASIC' ? '*' : '(Optional)'}
                  {formData.analysisMode === 'STANDARD' && (
                    <span className="text-xs text-blue-600 font-normal">⭐ Leave blank to auto-calculate</span>
                  )}
                </label>
                <input
                  type="number"
                  id="arv"
                  name="arv"
                  value={formData.arv || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border bg-white rounded-lg focus:outline-none focus:ring-2 ${
                    errors.arv
                      ? 'border-red-500 bg-red-50 focus:ring-red-500'
                      : formData.analysisMode === 'BASIC'
                      ? 'border-purple-300 focus:ring-purple-500'
                      : 'border-blue-300 focus:ring-blue-500'
                  }`}
                  placeholder={formData.analysisMode === 'BASIC' ? '400000' : '400000 (optional override)'}
                  min="0"
                  step="1000"
                />
                {errors.arv && <p className="text-red-500 text-sm mt-1">{errors.arv}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  {formData.analysisMode === 'BASIC'
                    ? 'Provide your estimated ARV or use comps below'
                    : 'Auto-calculated from comps if left blank'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Basic Mode: Comparable Properties */}
      {formData.analysisMode === 'BASIC' && (analysisType === 'flip' || analysisType === 'both') && (
        <div className="space-y-5 bg-purple-50 p-6 rounded-lg border-2 border-purple-200 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              Comparable Properties (Optional)
            </h3>
            <span className="text-sm text-gray-600">
              {formData.userProvidedComps?.length || 0} comps added
            </span>
          </div>
          <p className="text-sm text-gray-600">Add comparable properties to calculate ARV automatically</p>

          {/* Comp Input Form */}
          <div className="bg-white p-4 rounded-lg border border-purple-300">
            <p className="text-sm font-semibold text-purple-800 mb-3">Add New Comp</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Address *</label>
                <input
                  type="text"
                  value={newComp.address}
                  onChange={(e) => setNewComp(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="456 Oak St"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Sale Price *</label>
                <input
                  type="number"
                  value={newComp.price || ''}
                  onChange={(e) => setNewComp(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="350000"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Beds</label>
                <input
                  type="number"
                  value={newComp.beds || ''}
                  onChange={(e) => setNewComp(prev => ({ ...prev, beds: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="3"
                  min="0"
                  step="1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Baths</label>
                <input
                  type="number"
                  value={newComp.baths || ''}
                  onChange={(e) => setNewComp(prev => ({ ...prev, baths: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="2"
                  min="0"
                  step="0.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Sqft</label>
                <input
                  type="number"
                  value={newComp.sqft || ''}
                  onChange={(e) => setNewComp(prev => ({ ...prev, sqft: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="1500"
                  min="0"
                  step="100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Sale Date</label>
                <input
                  type="date"
                  value={newComp.saleDate || ''}
                  onChange={(e) => setNewComp(prev => ({ ...prev, saleDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (newComp.address && newComp.price > 0) {
                  setFormData(prev => ({
                    ...prev,
                    userProvidedComps: [...(prev.userProvidedComps || []), newComp]
                  }));
                  setNewComp({
                    address: '',
                    price: 0,
                    beds: undefined,
                    baths: undefined,
                    sqft: undefined,
                    yearBuilt: undefined,
                    saleDate: '',
                  });
                }
              }}
              className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Comp
            </button>
          </div>

          {/* Display Added Comps */}
          {formData.userProvidedComps && formData.userProvidedComps.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-purple-800">Added Comps:</p>
              {formData.userProvidedComps.map((comp, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border border-purple-200 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{comp.address}</p>
                    <p className="text-xs text-gray-600">
                      ${comp.price.toLocaleString()}
                      {comp.beds && ` • ${comp.beds} beds`}
                      {comp.baths && ` • ${comp.baths} baths`}
                      {comp.sqft && ` • ${comp.sqft} sqft`}
                      {comp.saleDate && ` • Sold: ${comp.saleDate}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        userProvidedComps: prev.userProvidedComps?.filter((_, i) => i !== index)
                      }));
                    }}
                    className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
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
    </>
  );
};

export default PropertyForm;

import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../../utils/formatters';

interface StateComparisonTabProps {
  purchasePrice: number;
}

interface StateData {
  code: string;
  name: string;
  propertyTaxRate: number;
  insuranceRate: number;
}

const StateComparisonTab: React.FC<StateComparisonTabProps> = ({ purchasePrice }) => {
  const [sortBy, setSortBy] = useState<'state' | 'tax' | 'insurance' | 'total'>('total');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterRegion, setFilterRegion] = useState<string>('All');

  // San Diego County specific data
  const sanDiegoCounty = {
    code: 'SD',
    name: 'San Diego County, CA',
    propertyTaxRate: 0.0073, // San Diego County average
    insuranceRate: 0.0032,
  };

  // State data with tax and insurance rates
  const stateData: StateData[] = [
    { code: 'AL', name: 'Alabama', propertyTaxRate: 0.0041, insuranceRate: 0.0038 },
    { code: 'AK', name: 'Alaska', propertyTaxRate: 0.0120, insuranceRate: 0.0018 },
    { code: 'AZ', name: 'Arizona', propertyTaxRate: 0.0062, insuranceRate: 0.0018 },
    { code: 'AR', name: 'Arkansas', propertyTaxRate: 0.0062, insuranceRate: 0.0030 },
    { code: 'CA', name: 'California', propertyTaxRate: 0.0076, insuranceRate: 0.0028 },
    { code: 'CO', name: 'Colorado', propertyTaxRate: 0.0051, insuranceRate: 0.0018 },
    { code: 'CT', name: 'Connecticut', propertyTaxRate: 0.0213, insuranceRate: 0.0023 },
    { code: 'DE', name: 'Delaware', propertyTaxRate: 0.0057, insuranceRate: 0.0020 },
    { code: 'FL', name: 'Florida', propertyTaxRate: 0.0097, insuranceRate: 0.0060 },
    { code: 'GA', name: 'Georgia', propertyTaxRate: 0.0092, insuranceRate: 0.0032 },
    { code: 'HI', name: 'Hawaii', propertyTaxRate: 0.0028, insuranceRate: 0.0025 },
    { code: 'ID', name: 'Idaho', propertyTaxRate: 0.0063, insuranceRate: 0.0016 },
    { code: 'IL', name: 'Illinois', propertyTaxRate: 0.0223, insuranceRate: 0.0019 },
    { code: 'IN', name: 'Indiana', propertyTaxRate: 0.0085, insuranceRate: 0.0019 },
    { code: 'IA', name: 'Iowa', propertyTaxRate: 0.0145, insuranceRate: 0.0020 },
    { code: 'KS', name: 'Kansas', propertyTaxRate: 0.0141, insuranceRate: 0.0022 },
    { code: 'KY', name: 'Kentucky', propertyTaxRate: 0.0086, insuranceRate: 0.0020 },
    { code: 'LA', name: 'Louisiana', propertyTaxRate: 0.0055, insuranceRate: 0.0055 },
    { code: 'ME', name: 'Maine', propertyTaxRate: 0.0132, insuranceRate: 0.0021 },
    { code: 'MD', name: 'Maryland', propertyTaxRate: 0.0109, insuranceRate: 0.0021 },
    { code: 'MA', name: 'Massachusetts', propertyTaxRate: 0.0123, insuranceRate: 0.0022 },
    { code: 'MI', name: 'Michigan', propertyTaxRate: 0.0143, insuranceRate: 0.0020 },
    { code: 'MN', name: 'Minnesota', propertyTaxRate: 0.0111, insuranceRate: 0.0019 },
    { code: 'MS', name: 'Mississippi', propertyTaxRate: 0.0063, insuranceRate: 0.0040 },
    { code: 'MO', name: 'Missouri', propertyTaxRate: 0.0097, insuranceRate: 0.0021 },
    { code: 'MT', name: 'Montana', propertyTaxRate: 0.0083, insuranceRate: 0.0016 },
    { code: 'NE', name: 'Nebraska', propertyTaxRate: 0.0173, insuranceRate: 0.0020 },
    { code: 'NV', name: 'Nevada', propertyTaxRate: 0.0060, insuranceRate: 0.0017 },
    { code: 'NH', name: 'New Hampshire', propertyTaxRate: 0.0218, insuranceRate: 0.0020 },
    { code: 'NJ', name: 'New Jersey', propertyTaxRate: 0.0249, insuranceRate: 0.0024 },
    { code: 'NM', name: 'New Mexico', propertyTaxRate: 0.0080, insuranceRate: 0.0019 },
    { code: 'NY', name: 'New York', propertyTaxRate: 0.0149, insuranceRate: 0.0025 },
    { code: 'NC', name: 'North Carolina', propertyTaxRate: 0.0084, insuranceRate: 0.0033 },
    { code: 'ND', name: 'North Dakota', propertyTaxRate: 0.0098, insuranceRate: 0.0018 },
    { code: 'OH', name: 'Ohio', propertyTaxRate: 0.0157, insuranceRate: 0.0019 },
    { code: 'OK', name: 'Oklahoma', propertyTaxRate: 0.0090, insuranceRate: 0.0042 },
    { code: 'OR', name: 'Oregon', propertyTaxRate: 0.0097, insuranceRate: 0.0015 },
    { code: 'PA', name: 'Pennsylvania', propertyTaxRate: 0.0147, insuranceRate: 0.0019 },
    { code: 'RI', name: 'Rhode Island', propertyTaxRate: 0.0153, insuranceRate: 0.0022 },
    { code: 'SC', name: 'South Carolina', propertyTaxRate: 0.0057, insuranceRate: 0.0035 },
    { code: 'SD', name: 'South Dakota', propertyTaxRate: 0.0128, insuranceRate: 0.0019 },
    { code: 'TN', name: 'Tennessee', propertyTaxRate: 0.0067, insuranceRate: 0.0021 },
    { code: 'TX', name: 'Texas', propertyTaxRate: 0.0173, insuranceRate: 0.0045 },
    { code: 'UT', name: 'Utah', propertyTaxRate: 0.0060, insuranceRate: 0.0017 },
    { code: 'VT', name: 'Vermont', propertyTaxRate: 0.0186, insuranceRate: 0.0018 },
    { code: 'VA', name: 'Virginia', propertyTaxRate: 0.0082, insuranceRate: 0.0020 },
    { code: 'WA', name: 'Washington', propertyTaxRate: 0.0092, insuranceRate: 0.0016 },
    { code: 'WV', name: 'West Virginia', propertyTaxRate: 0.0058, insuranceRate: 0.0020 },
    { code: 'WI', name: 'Wisconsin', propertyTaxRate: 0.0176, insuranceRate: 0.0019 },
    { code: 'WY', name: 'Wyoming', propertyTaxRate: 0.0061, insuranceRate: 0.0016 },
  ];

  // Regional groupings
  const regions: { [key: string]: string[] } = {
    'Northeast': ['CT', 'ME', 'MA', 'NH', 'RI', 'VT', 'NJ', 'NY', 'PA'],
    'Southeast': ['DE', 'FL', 'GA', 'MD', 'NC', 'SC', 'VA', 'WV', 'AL', 'KY', 'MS', 'TN', 'AR', 'LA', 'OK', 'TX'],
    'Midwest': ['IL', 'IN', 'MI', 'OH', 'WI', 'IA', 'KS', 'MN', 'MO', 'NE', 'ND', 'SD'],
    'West': ['AZ', 'CO', 'ID', 'MT', 'NV', 'NM', 'UT', 'WY', 'AK', 'CA', 'HI', 'OR', 'WA'],
  };

  // Calculate expenses for San Diego County
  const sanDiegoExpenses = useMemo(() => {
    const annualTax = purchasePrice * sanDiegoCounty.propertyTaxRate;
    const monthlyInsurance = Math.round((purchasePrice * sanDiegoCounty.insuranceRate) / 12);
    const annualInsurance = monthlyInsurance * 12;
    const totalAnnual = annualTax + annualInsurance;

    return {
      ...sanDiegoCounty,
      annualTax,
      monthlyInsurance,
      annualInsurance,
      totalAnnual,
    };
  }, [purchasePrice]);

  // Calculate expenses for each state
  const stateExpenses = useMemo(() => {
    return stateData.map(state => {
      const annualTax = purchasePrice * state.propertyTaxRate;
      const monthlyInsurance = Math.round((purchasePrice * state.insuranceRate) / 12);
      const annualInsurance = monthlyInsurance * 12;
      const totalAnnual = annualTax + annualInsurance;

      return {
        ...state,
        annualTax,
        monthlyInsurance,
        annualInsurance,
        totalAnnual,
      };
    });
  }, [purchasePrice]);

  // Get California data
  const californiaData = stateExpenses.find(state => state.code === 'CA');

  // Filter by region
  const filteredStates = useMemo(() => {
    if (filterRegion === 'All') return stateExpenses;
    const regionStates = regions[filterRegion] || [];
    return stateExpenses.filter(state => regionStates.includes(state.code));
  }, [stateExpenses, filterRegion]);

  // Sort states
  const sortedStates = useMemo(() => {
    const sorted = [...filteredStates];
    sorted.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'state':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'tax':
          aVal = a.annualTax;
          bVal = b.annualTax;
          break;
        case 'insurance':
          aVal = a.annualInsurance;
          bVal = b.annualInsurance;
          break;
        case 'total':
          aVal = a.totalAnnual;
          bVal = b.totalAnnual;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [filteredStates, sortBy, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (sortedStates.length === 0) return { avgTax: 0, avgIns: 0, avgTotal: 0, minTotal: 0, maxTotal: 0 };

    const avgTax = sortedStates.reduce((sum, s) => sum + s.annualTax, 0) / sortedStates.length;
    const avgIns = sortedStates.reduce((sum, s) => sum + s.annualInsurance, 0) / sortedStates.length;
    const avgTotal = sortedStates.reduce((sum, s) => sum + s.totalAnnual, 0) / sortedStates.length;
    const minTotal = Math.min(...sortedStates.map(s => s.totalAnnual));
    const maxTotal = Math.max(...sortedStates.map(s => s.totalAnnual));

    return { avgTax, avgIns, avgTotal, minTotal, maxTotal };
  }, [sortedStates]);

  // Find best and worst states
  const bestState = sortedStates.length > 0 ? sortedStates.reduce((min, s) => s.totalAnnual < min.totalAnnual ? s : min) : null;
  const worstState = sortedStates.length > 0 ? sortedStates.reduce((max, s) => s.totalAnnual > max.totalAnnual ? s : max) : null;

  const handleSort = (column: 'state' | 'tax' | 'insurance' | 'total') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">📊</span>
          <div>
            <h2 className="text-2xl font-bold">State Expense Comparison</h2>
            <p className="text-blue-100">Compare property tax and insurance costs across all 50 states</p>
          </div>
        </div>
      </div>

      {/* Purchase Price Display */}
      <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Analysis Based On</h3>
        <p className="text-3xl font-bold text-indigo-600">{formatCurrency(purchasePrice)}</p>
        <p className="text-sm text-gray-600 mt-1">Purchase Price</p>
      </div>

      {/* Featured Locations - California & San Diego County */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">📍</span>
          Featured Locations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* California Card */}
          {californiaData && (
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-5 border-2 border-amber-300 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">🌟</span>
                  California
                </h4>
                <span className="px-3 py-1 bg-amber-200 text-amber-800 text-xs font-bold rounded-full">
                  STATE
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Property Tax Rate:</span>
                  <span className="font-semibold text-gray-900">{(californiaData.propertyTaxRate * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Annual Tax:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(californiaData.annualTax)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monthly Insurance:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(californiaData.monthlyInsurance)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t-2 border-amber-300">
                  <span className="text-sm font-bold text-gray-900">Total Annual:</span>
                  <span className="text-xl font-bold text-amber-700">{formatCurrency(californiaData.totalAnnual)}</span>
                </div>
              </div>
            </div>
          )}

          {/* San Diego County Card */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-5 border-2 border-orange-300 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">🏖️</span>
                San Diego County
              </h4>
              <span className="px-3 py-1 bg-orange-200 text-orange-800 text-xs font-bold rounded-full">
                COUNTY
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Property Tax Rate:</span>
                <span className="font-semibold text-gray-900">{(sanDiegoExpenses.propertyTaxRate * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Annual Tax:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(sanDiegoExpenses.annualTax)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Insurance:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(sanDiegoExpenses.monthlyInsurance)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t-2 border-orange-300">
                <span className="text-sm font-bold text-gray-900">Total Annual:</span>
                <span className="text-xl font-bold text-orange-700">{formatCurrency(sanDiegoExpenses.totalAnnual)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-700">
            <strong>💡 Comparison:</strong> San Diego County saves {formatCurrency(Math.abs(sanDiegoExpenses.totalAnnual - (californiaData?.totalAnnual || 0)))} per year compared to California state average
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-600 mb-1">Best State (Lowest)</div>
          <div className="text-xl font-bold text-gray-900">{bestState?.name || 'N/A'}</div>
          <div className="text-sm text-green-600 font-semibold">{bestState ? formatCurrency(bestState.totalAnnual) : 'N/A'}/year</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="text-sm text-gray-600 mb-1">Worst State (Highest)</div>
          <div className="text-xl font-bold text-gray-900">{worstState?.name || 'N/A'}</div>
          <div className="text-sm text-red-600 font-semibold">{worstState ? formatCurrency(worstState.totalAnnual) : 'N/A'}/year</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 mb-1">Average Total</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avgTotal)}</div>
          <div className="text-sm text-gray-600">/year</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="text-sm text-gray-600 mb-1">Cost Range</div>
          <div className="text-lg font-bold text-gray-900">{formatCurrency(stats.maxTotal - stats.minTotal)}</div>
          <div className="text-sm text-gray-600">difference</div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">🎛️ Filters & Sorting</h3>
        <div className="flex flex-wrap gap-4">
          {/* Region Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Region</label>
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All States ({stateData.length})</option>
              <option value="Northeast">Northeast ({regions.Northeast.length})</option>
              <option value="Southeast">Southeast ({regions.Southeast.length})</option>
              <option value="Midwest">Midwest ({regions.Midwest.length})</option>
              <option value="West">West ({regions.West.length})</option>
            </select>
          </div>

          {/* Sort Controls */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleSort('state')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  sortBy === 'state' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                State {sortBy === 'state' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSort('tax')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  sortBy === 'tax' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tax {sortBy === 'tax' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSort('insurance')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  sortBy === 'insurance' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Insurance {sortBy === 'insurance' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSort('total')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  sortBy === 'total' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Total {sortBy === 'total' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* State Comparison Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📋</span>
          State-by-State Breakdown ({sortedStates.length} states)
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">State</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Tax Rate</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Annual Tax</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Monthly Ins.</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Annual Ins.</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total Annual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedStates.map((state) => {
                const isBest = state.code === bestState?.code;
                const isWorst = state.code === worstState?.code;
                const isCalifornia = state.code === 'CA';
                const rowClass = isBest ? 'bg-green-50 font-semibold' : isWorst ? 'bg-red-50 font-semibold' : isCalifornia ? 'bg-amber-50 border-l-4 border-amber-400' : '';

                return (
                  <tr key={state.code} className={`hover:bg-gray-100 transition-colors ${rowClass}`}>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">{state.name}</span>
                        <span className="ml-2 text-xs text-gray-500">({state.code})</span>
                        {isCalifornia && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-amber-200 text-amber-800 rounded">
                            🌟 Featured
                          </span>
                        )}
                        {isBest && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-200 text-green-800 rounded">
                            Best
                          </span>
                        )}
                        {isWorst && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-200 text-red-800 rounded">
                            Highest
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {(state.propertyTaxRate * 100).toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                      {formatCurrency(state.annualTax)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {formatCurrency(state.monthlyInsurance)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {formatCurrency(state.annualInsurance)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-blue-700">
                      {formatCurrency(state.totalAnnual)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
          <span className="mr-2">💡</span>
          Key Insights
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• <strong>Best State:</strong> {bestState?.name} has the lowest total annual expenses at {bestState ? formatCurrency(bestState.totalAnnual) : 'N/A'}</p>
          <p>• <strong>Highest State:</strong> {worstState?.name} has the highest total annual expenses at {worstState ? formatCurrency(worstState.totalAnnual) : 'N/A'}</p>
          <p>• <strong>Cost Difference:</strong> Investing in {bestState?.name} vs {worstState?.name} saves {formatCurrency(stats.maxTotal - stats.minTotal)} per year</p>
          <p>• <strong>Average Expenses:</strong> {formatCurrency(stats.avgTotal)}/year across all states</p>
          <p>• <strong>Tax vs Insurance:</strong> Average tax is {formatCurrency(stats.avgTax)}/year, average insurance is {formatCurrency(stats.avgIns)}/year</p>
          <p>• <strong>Regional Filtering:</strong> Use the region filter to compare states within specific areas</p>
          <p>• <strong>Note:</strong> These are state averages. Actual costs may vary by county, city, and property characteristics</p>
        </div>
      </div>
    </div>
  );
};

export default StateComparisonTab;

import React, { useState, useMemo } from 'react';
import { ComparableProperty } from '../../types/property';
import { formatCurrency } from '../../utils/formatters';

interface FilteredCompsTabProps {
  comps: ComparableProperty[];
}

interface FilterCriteria {
  dateRangeMonths: number | null;
  maxDistance: number | null;
  propertyType: string;
  minBeds: number | null;
  minBaths: number | null;
  minSqft: number | null;
  maxSqft: number | null;
  condition: string;
}

const FilteredCompsTab: React.FC<FilteredCompsTabProps> = ({ comps }) => {
  const [filters, setFilters] = useState<FilterCriteria>({
    dateRangeMonths: null,
    maxDistance: null,
    propertyType: 'All',
    minBeds: null,
    minBaths: null,
    minSqft: null,
    maxSqft: null,
    condition: 'All',
  });

  // Filter comps based on criteria
  const filteredComps = useMemo(() => {
    if (!comps || comps.length === 0) return [];

    let filtered = [...comps];

    // Filter by date range (months)
    if (filters.dateRangeMonths) {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - filters.dateRangeMonths);

      filtered = filtered.filter(comp => {
        if (!comp.saleDate) return true;
        const saleDate = new Date(comp.saleDate);
        return saleDate >= cutoffDate;
      });
    }

    // Filter by distance
    if (filters.maxDistance !== null) {
      filtered = filtered.filter(comp => {
        if (!comp.distance) return true;
        return comp.distance <= filters.maxDistance!;
      });
    }

    // Filter by property type (not available in current data model, skip for now)
    // if (filters.propertyType && filters.propertyType !== 'All') {
    //   filtered = filtered.filter(comp => {
    //     if (!comp.propertyType) return true;
    //     return comp.propertyType.toLowerCase() === filters.propertyType.toLowerCase();
    //   });
    // }

    // Filter by minimum beds
    if (filters.minBeds !== null) {
      filtered = filtered.filter(comp => {
        if (!comp.beds) return true;
        return comp.beds >= filters.minBeds!;
      });
    }

    // Filter by minimum baths
    if (filters.minBaths !== null) {
      filtered = filtered.filter(comp => {
        if (!comp.baths) return true;
        return comp.baths >= filters.minBaths!;
      });
    }

    // Filter by square footage range
    if (filters.minSqft !== null) {
      filtered = filtered.filter(comp => {
        if (!comp.sqft) return true;
        return comp.sqft >= filters.minSqft!;
      });
    }

    if (filters.maxSqft !== null) {
      filtered = filtered.filter(comp => {
        if (!comp.sqft) return true;
        return comp.sqft <= filters.maxSqft!;
      });
    }

    // Filter by condition
    if (filters.condition && filters.condition !== 'All') {
      filtered = filtered.filter(comp => {
        if (!comp.condition) return true;
        return comp.condition.toLowerCase() === filters.condition.toLowerCase();
      });
    }

    return filtered;
  }, [comps, filters]);

  // Calculate statistics for filtered comps
  const stats = useMemo(() => {
    if (filteredComps.length === 0) {
      return { avgPrice: 0, avgSqft: 0, avgPricePerSqft: 0, minPrice: 0, maxPrice: 0 };
    }

    const avgPrice = filteredComps.reduce((sum, comp) => sum + comp.price, 0) / filteredComps.length;
    const compsWithSqft = filteredComps.filter(c => c.sqft);
    const avgSqft = compsWithSqft.length > 0
      ? compsWithSqft.reduce((sum, comp) => sum + (comp.sqft || 0), 0) / compsWithSqft.length
      : 0;
    const avgPricePerSqft = avgSqft > 0 ? avgPrice / avgSqft : 0;
    const minPrice = Math.min(...filteredComps.map(c => c.price));
    const maxPrice = Math.max(...filteredComps.map(c => c.price));

    return { avgPrice, avgSqft, avgPricePerSqft, minPrice, maxPrice };
  }, [filteredComps]);

  // Quick filter presets
  const applyQuickFilter = (preset: string) => {
    switch (preset) {
      case 'recent':
        setFilters({ ...filters, dateRangeMonths: 3, maxDistance: 1 });
        break;
      case 'nearby':
        setFilters({ ...filters, maxDistance: 0.5 });
        break;
      case 'similar':
        setFilters({ ...filters, dateRangeMonths: 6, maxDistance: 1 });
        break;
      case 'remodeled':
        setFilters({ ...filters, condition: 'remodeled' });
        break;
      case 'reset':
        setFilters({
          dateRangeMonths: null,
          maxDistance: null,
          propertyType: 'All',
          minBeds: null,
          minBaths: null,
          minSqft: null,
          maxSqft: null,
          condition: 'All',
        });
        break;
    }
  };

  if (!comps || comps.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
        <p className="text-yellow-800">No comparable properties available to filter.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🔍</span>
          <div>
            <h2 className="text-2xl font-bold">Filtered Comps</h2>
            <p className="text-indigo-100">Advanced filtering for comparable properties</p>
          </div>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">⚡ Quick Filters</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => applyQuickFilter('recent')}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
          >
            📅 Recent (3 months, 1 mi)
          </button>
          <button
            onClick={() => applyQuickFilter('nearby')}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
          >
            📍 Nearby (0.5 mi)
          </button>
          <button
            onClick={() => applyQuickFilter('similar')}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
          >
            🎯 Similar (6 months, 1 mi)
          </button>
          <button
            onClick={() => applyQuickFilter('remodeled')}
            className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors font-medium"
          >
            ✨ Remodeled Only
          </button>
          <button
            onClick={() => applyQuickFilter('reset')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            🔄 Reset All
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">🎛️ Custom Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range (Months)
            </label>
            <input
              type="number"
              min="1"
              max="24"
              placeholder="All"
              value={filters.dateRangeMonths || ''}
              onChange={(e) => setFilters({ ...filters, dateRangeMonths: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Max Distance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Distance (Miles)
            </label>
            <input
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              placeholder="All"
              value={filters.maxDistance || ''}
              onChange={(e) => setFilters({ ...filters, maxDistance: e.target.value ? parseFloat(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Min Beds */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Bedrooms
            </label>
            <input
              type="number"
              min="1"
              max="10"
              placeholder="Any"
              value={filters.minBeds || ''}
              onChange={(e) => setFilters({ ...filters, minBeds: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Min Baths */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Bathrooms
            </label>
            <input
              type="number"
              min="1"
              max="10"
              step="0.5"
              placeholder="Any"
              value={filters.minBaths || ''}
              onChange={(e) => setFilters({ ...filters, minBaths: e.target.value ? parseFloat(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Min Sqft */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Sqft
            </label>
            <input
              type="number"
              min="0"
              step="100"
              placeholder="Any"
              value={filters.minSqft || ''}
              onChange={(e) => setFilters({ ...filters, minSqft: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Max Sqft */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Sqft
            </label>
            <input
              type="number"
              min="0"
              step="100"
              placeholder="Any"
              value={filters.maxSqft || ''}
              onChange={(e) => setFilters({ ...filters, maxSqft: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type
            </label>
            <select
              value={filters.propertyType}
              onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="All">All Types</option>
              <option value="Single Family">Single Family</option>
              <option value="Condo">Condo</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Multi-Family">Multi-Family</option>
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition
            </label>
            <select
              value={filters.condition}
              onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="All">All Conditions</option>
              <option value="remodeled">Remodeled</option>
              <option value="unremodeled">Unremodeled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
          <span className="mr-2">📊</span>
          Filter Results
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Showing</p>
            <p className="text-2xl font-bold text-indigo-600">
              {filteredComps.length} of {comps.length}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {((filteredComps.length / comps.length) * 100).toFixed(0)}% of total comps
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Active Filters</p>
            <p className="text-2xl font-bold text-purple-600">
              {Object.values(filters).filter(v => v !== null && v !== 'All').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">filters applied</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {filteredComps.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-4">Filtered Market Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border-2 border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Average Price</p>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(stats.avgPrice)}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border-2 border-green-200">
              <p className="text-sm text-gray-600 mb-1">Price Range</p>
              <p className="text-lg font-bold text-green-700">
                {formatCurrency(stats.minPrice)} - {formatCurrency(stats.maxPrice)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border-2 border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Avg Sqft</p>
              <p className="text-2xl font-bold text-purple-700">
                {stats.avgSqft > 0 ? stats.avgSqft.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'N/A'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-lg border-2 border-orange-200">
              <p className="text-sm text-gray-600 mb-1">Avg $/Sqft</p>
              <p className="text-2xl font-bold text-orange-700">
                {stats.avgPricePerSqft > 0 ? formatCurrency(stats.avgPricePerSqft) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtered Comps Table */}
      {filteredComps.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">📋</span>
            Filtered Properties
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Address</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Beds</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Baths</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Sqft</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">$/Sqft</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Sale Date</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Distance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredComps.map((comp, index) => {
                  const pricePerSqft = comp.sqft ? comp.price / comp.sqft : null;
                  const isTopThree = index < 3;

                  return (
                    <tr
                      key={index}
                      className={`hover:bg-gray-100 transition-colors ${
                        isTopThree ? 'bg-green-50 font-semibold' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          {comp.propertyUrl ? (
                            <a
                              href={comp.propertyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-800 hover:underline font-medium"
                            >
                              {comp.address}
                            </a>
                          ) : (
                            <span className="text-gray-900 font-medium">{comp.address}</span>
                          )}
                          {isTopThree && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-200 text-green-800 rounded">
                              Top {index + 1}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {comp.city}, {comp.state} {comp.zip}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                        {formatCurrency(comp.price)}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">
                        {comp.beds || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">
                        {comp.baths || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">
                        {comp.sqft ? comp.sqft.toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-blue-700">
                        {pricePerSqft ? formatCurrency(pricePerSqft) : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">
                        {comp.saleDate || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">
                        {comp.distance ? `${comp.distance.toFixed(2)} mi` : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
          <p className="text-yellow-800">
            No properties match your filter criteria. Try adjusting your filters or click "Reset All" to start over.
          </p>
        </div>
      )}

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
          <span className="mr-2">💡</span>
          Key Insights
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• <strong>Filter Effectiveness:</strong> {filteredComps.length} of {comps.length} comps match your criteria ({((filteredComps.length / comps.length) * 100).toFixed(0)}%)</p>
          {filteredComps.length > 0 && (
            <>
              <p>• <strong>Average Price:</strong> {formatCurrency(stats.avgPrice)} for filtered properties</p>
              <p>• <strong>Price Range:</strong> {formatCurrency(stats.minPrice)} to {formatCurrency(stats.maxPrice)}</p>
              {stats.avgPricePerSqft > 0 && (
                <p>• <strong>Average $/Sqft:</strong> {formatCurrency(stats.avgPricePerSqft)} - use this as a baseline for valuation</p>
              )}
              <p>• <strong>Top 3 Closest:</strong> Highlighted in green for quick reference</p>
            </>
          )}
          <p>• <strong>Quick Filters:</strong> Use preset buttons for common filtering scenarios</p>
          <p>• <strong>Custom Filters:</strong> Combine multiple criteria for precise results</p>
        </div>
      </div>
    </div>
  );
};

export default FilteredCompsTab;

import React from 'react';
import { ComparableProperty } from '../../types/property';
import { formatCurrency } from '../../utils/formatters';

interface CompsTabProps {
  comps: ComparableProperty[];
}

const CompsTab: React.FC<CompsTabProps> = ({ comps }) => {
  if (!comps || comps.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
        <p className="text-yellow-800">No comparable properties found for this analysis.</p>
      </div>
    );
  }

  // Calculate statistics
  const avgPrice = comps.reduce((sum, comp) => sum + comp.price, 0) / comps.length;
  const avgSqft = comps.filter(c => c.sqft).reduce((sum, comp) => sum + (comp.sqft || 0), 0) / comps.filter(c => c.sqft).length;
  const avgPricePerSqft = avgSqft > 0 ? avgPrice / avgSqft : 0;
  const minPrice = Math.min(...comps.map(c => c.price));
  const maxPrice = Math.max(...comps.map(c => c.price));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-700 rounded-lg shadow-md p-6 text-white">
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <span className="text-3xl">🏘️</span>
          Comparable Properties
        </h3>
        <p className="text-teal-100">Recently sold properties in the area to help determine market value</p>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4">Market Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Average Price</p>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(avgPrice)}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border-2 border-green-200">
            <p className="text-sm text-gray-600 mb-1">Price Range</p>
            <p className="text-lg font-bold text-green-700">
              {formatCurrency(minPrice)} - {formatCurrency(maxPrice)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border-2 border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Avg Sqft</p>
            <p className="text-2xl font-bold text-purple-700">
              {avgSqft > 0 ? avgSqft.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'N/A'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-lg border-2 border-orange-200">
            <p className="text-sm text-gray-600 mb-1">Avg $/Sqft</p>
            <p className="text-2xl font-bold text-orange-700">
              {avgPricePerSqft > 0 ? formatCurrency(avgPricePerSqft) : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Comps Count */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-800">
              Found {comps.length} comparable propert{comps.length === 1 ? 'y' : 'ies'} in the area
            </p>
            <p className="text-sm text-blue-700 mt-1">
              These properties were recently sold and match similar characteristics to your subject property.
            </p>
          </div>
        </div>
      </div>

      {/* Comparable Properties Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📋</span>
          Property Details
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
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Year Built</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Sale Date</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Distance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {comps.map((comp, index) => {
                const pricePerSqft = comp.sqft ? comp.price / comp.sqft : null;
                // Clean address - remove trailing commas
                const cleanAddress = comp.address.replace(/,\s*$/, '');
                // Build location string with proper comma handling
                const locationParts = [comp.city, comp.state, comp.zip].filter(Boolean);
                const locationString = locationParts.join(', ');

                // Determine row background color based on condition
                let rowBgColor = '';
                if (comp.condition === 'remodeled') {
                  rowBgColor = 'bg-green-50';
                } else if (comp.condition === 'unremodeled') {
                  rowBgColor = 'bg-yellow-50';
                }

                // Determine data quality badge
                const getDataQualityBadge = () => {
                  if (comp.isReal === false || comp.dataSource === 'synthetic' || comp.dataSource === 'gemini') {
                    return <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">Estimated</span>;
                  } else if (comp.dataSource === 'zillow' || comp.dataSource === 'api') {
                    return <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">Real Data</span>;
                  }
                  return null;
                };

                // Determine condition badge
                const getConditionBadge = () => {
                  if (comp.condition === 'remodeled') {
                    return <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">Remodeled</span>;
                  } else if (comp.condition === 'unremodeled') {
                    return <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">Unremodeled</span>;
                  }
                  return null;
                };

                return (
                  <tr key={index} className={`hover:bg-gray-100 transition-colors ${rowBgColor}`}>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center">
                        {comp.propertyUrl ? (
                          <a
                            href={comp.propertyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-800 hover:underline font-medium"
                          >
                            {cleanAddress}
                          </a>
                        ) : (
                          <span className="text-gray-900 font-medium">{cleanAddress}</span>
                        )}
                        {getDataQualityBadge()}
                        {getConditionBadge()}
                      </div>
                      {locationString && (
                        <div className="text-xs text-gray-500 mt-1">
                          {locationString}
                        </div>
                      )}
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
                      {comp.yearBuilt || 'N/A'}
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

      {/* Property Cards (Mobile-Friendly Alternative) */}
      <div className="bg-white rounded-lg shadow-md p-6 md:hidden">
        <h4 className="text-xl font-semibold text-gray-800 mb-4">Property Cards</h4>
        <div className="space-y-4">
          {comps.map((comp, index) => {
            const pricePerSqft = comp.sqft ? comp.price / comp.sqft : null;
            // Clean address - remove trailing commas
            const cleanAddress = comp.address.replace(/,\s*$/, '');
            // Build location string with proper comma handling
            const locationParts = [comp.city, comp.state, comp.zip].filter(Boolean);
            const locationString = locationParts.join(', ');
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="mb-3">
                  {comp.propertyUrl ? (
                    <a
                      href={comp.propertyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-800 hover:underline font-semibold text-lg"
                    >
                      {cleanAddress}
                    </a>
                  ) : (
                    <h5 className="text-gray-900 font-semibold text-lg">{cleanAddress}</h5>
                  )}
                  {locationString && (
                    <p className="text-sm text-gray-500">
                      {locationString}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Price</p>
                    <p className="text-lg font-bold text-blue-700">{formatCurrency(comp.price)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Beds/Baths</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {comp.beds || 'N/A'} / {comp.baths || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Sqft</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {comp.sqft ? comp.sqft.toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-xs text-gray-600">$/Sqft</p>
                    <p className="text-lg font-bold text-green-700">
                      {pricePerSqft ? formatCurrency(pricePerSqft) : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex justify-between text-sm text-gray-600">
                  <span>Built: {comp.yearBuilt || 'N/A'}</span>
                  <span>Sold: {comp.saleDate || 'N/A'}</span>
                  <span>{comp.distance ? `${comp.distance.toFixed(2)} mi` : 'N/A'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-teal-50 border-l-4 border-teal-400 p-4 rounded-r-lg">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-teal-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-teal-800">Using Comparable Properties</p>
            <ul className="text-sm text-teal-700 mt-2 space-y-1 list-disc list-inside">
              <li>Look for properties with similar bed/bath counts and square footage</li>
              <li>Consider properties sold within the last 3-6 months for accuracy</li>
              <li>Pay attention to distance - closer comps are generally more reliable</li>
              <li>Adjust for differences in condition, upgrades, and location</li>
              <li>Use price per square foot as a baseline for valuation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompsTab;

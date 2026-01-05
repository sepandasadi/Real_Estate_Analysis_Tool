import React from 'react';

interface LocationQualityTabProps {
  locationData?: {
    schools?: {
      avgRating: number;
      schools: Array<{
        name: string;
        type: string;
        rating: number;
        distance: number;
        grades?: string;
      }>;
    };
    walkability?: {
      walkScore: number;
      transitScore: number;
      bikeScore: number;
      category: string;
      description: string;
    };
    environmental?: {
      noiseScore: number;
      noiseLevel: string;
      description: string;
      emoji: string;
    };
    adjustment?: {
      adjustedARV: number;
      baseARV: number;
      totalAdjustment: number;
      totalPercentage: string;
      totalDollarAmount: number;
      breakdown: {
        schools: {
          premium: number;
          dollarAmount: number;
          description: string;
          grade: string;
          rating: number;
        };
        walkability: {
          premium: number;
          dollarAmount: number;
          description: string;
          category: string;
          walkScore: number;
        };
        environmental: {
          adjustment: number;
          dollarAmount: number;
          description: string;
          noiseLevel: string;
          emoji: string;
        };
      };
    };
  };
}

const LocationQualityTab: React.FC<LocationQualityTabProps> = ({ locationData }) => {
  if (!locationData) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Location Quality Analysis</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Location quality data will be displayed here once an analysis with location features is run.</p>
              <p className="mt-2">This feature analyzes:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>School ratings and quality (premium up to +15%)</li>
                <li>Walkability and transit scores (premium up to +10%)</li>
                <li>Noise levels and environmental quality (adjustment ±3%)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { schools, walkability, environmental, adjustment } = locationData;

  // Helper function to format score color
  const getScoreColor = (score: number, max: number = 10) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Helper function to get grade color
  const getGradeColor = (grade: string) => {
    if (grade === 'A') return 'bg-green-100 text-green-800 border-green-200';
    if (grade === 'B') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (grade === 'C') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (grade === 'D') return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* ARV Adjustment Summary */}
      {adjustment && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-3">📍</span>
            Location-Adjusted ARV
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Base ARV</p>
              <p className="text-2xl font-bold text-gray-900">${adjustment.baseARV.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Location Adjustment</p>
              <p className={`text-2xl font-bold ${adjustment.totalAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {adjustment.totalAdjustment >= 0 ? '+' : ''}{adjustment.totalPercentage}
              </p>
              <p className={`text-sm ${adjustment.totalDollarAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {adjustment.totalDollarAmount >= 0 ? '+' : ''}${Math.abs(adjustment.totalDollarAmount).toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-4 shadow-md">
              <p className="text-sm text-blue-100 mb-1">Adjusted ARV</p>
              <p className="text-2xl font-bold text-white">${adjustment.adjustedARV.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* School Quality */}
      {schools && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-3 text-3xl">🎓</span>
            School Quality
          </h3>

          {adjustment?.breakdown.schools && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className={`inline-block px-3 py-1 text-lg font-bold rounded-lg border-2 ${getGradeColor(adjustment.breakdown.schools.grade)}`}>
                    Grade {adjustment.breakdown.schools.grade}
                  </span>
                  <span className="ml-3 text-sm text-gray-600">
                    Avg Rating: <span className={`font-bold ${getScoreColor(adjustment.breakdown.schools.rating)}`}>
                      {adjustment.breakdown.schools.rating.toFixed(1)}/10
                    </span>
                  </span>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${adjustment.breakdown.schools.premium >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {adjustment.breakdown.schools.premium >= 0 ? '+' : ''}{(adjustment.breakdown.schools.premium * 100).toFixed(1)}%
                  </p>
                  <p className={`text-sm ${adjustment.breakdown.schools.dollarAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {adjustment.breakdown.schools.dollarAmount >= 0 ? '+' : ''}${Math.abs(adjustment.breakdown.schools.dollarAmount).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700">{adjustment.breakdown.schools.description}</p>
            </div>
          )}

          {schools.schools && schools.schools.length > 0 ? (
            <div className="space-y-3">
              {schools.schools.slice(0, 5).map((school, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{school.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-600 capitalize">{school.type}</span>
                      {school.grades && <span className="text-sm text-gray-500">• {school.grades}</span>}
                      <span className="text-sm text-gray-500">• {school.distance.toFixed(1)} mi</span>
                    </div>
                  </div>
                  <div className="flex items-center ml-4">
                    <span className={`text-lg font-bold ${getScoreColor(school.rating)}`}>
                      {school.rating}/10
                    </span>
                  </div>
                </div>
              ))}
              {schools.schools.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  + {schools.schools.length - 5} more schools
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-600">No school data available for this location.</p>
          )}
        </div>
      )}

      {/* Walkability & Transit */}
      {walkability && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-3 text-3xl">🚶</span>
            Walkability & Transit
          </h3>

          {adjustment?.breakdown.walkability && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-lg font-bold text-gray-900">{walkability.category}</span>
                  <span className="ml-3 text-sm text-gray-600">Walk Score: {walkability.walkScore}/100</span>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${adjustment.breakdown.walkability.premium >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {adjustment.breakdown.walkability.premium >= 0 ? '+' : ''}{(adjustment.breakdown.walkability.premium * 100).toFixed(1)}%
                  </p>
                  <p className={`text-sm ${adjustment.breakdown.walkability.dollarAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {adjustment.breakdown.walkability.dollarAmount >= 0 ? '+' : ''}${Math.abs(adjustment.breakdown.walkability.dollarAmount).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700">{walkability.description}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Walk Score */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Walk Score</span>
                <span className={`text-sm font-bold ${getScoreColor(walkability.walkScore, 100)}`}>
                  {walkability.walkScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    walkability.walkScore >= 70 ? 'bg-green-500' :
                    walkability.walkScore >= 50 ? 'bg-blue-500' :
                    walkability.walkScore >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${walkability.walkScore}%` }}
                ></div>
              </div>
            </div>

            {/* Transit Score */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Transit Score</span>
                <span className={`text-sm font-bold ${getScoreColor(walkability.transitScore, 100)}`}>
                  {walkability.transitScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    walkability.transitScore >= 70 ? 'bg-green-500' :
                    walkability.transitScore >= 50 ? 'bg-blue-500' :
                    walkability.transitScore >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${walkability.transitScore}%` }}
                ></div>
              </div>
            </div>

            {/* Bike Score */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Bike Score</span>
                <span className={`text-sm font-bold ${getScoreColor(walkability.bikeScore, 100)}`}>
                  {walkability.bikeScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    walkability.bikeScore >= 70 ? 'bg-green-500' :
                    walkability.bikeScore >= 50 ? 'bg-blue-500' :
                    walkability.bikeScore >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${walkability.bikeScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Environmental Quality */}
      {environmental && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-3 text-3xl">{environmental.emoji}</span>
            Environmental Quality
          </h3>

          {adjustment?.breakdown.environmental && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-lg font-bold text-gray-900 capitalize">{environmental.noiseLevel.replace('_', ' ')}</span>
                  <span className="ml-3 text-sm text-gray-600">Noise Score: {environmental.noiseScore}/100</span>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${adjustment.breakdown.environmental.adjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {adjustment.breakdown.environmental.adjustment >= 0 ? '+' : ''}{(adjustment.breakdown.environmental.adjustment * 100).toFixed(1)}%
                  </p>
                  <p className={`text-sm ${adjustment.breakdown.environmental.dollarAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {adjustment.breakdown.environmental.dollarAmount >= 0 ? '+' : ''}${Math.abs(adjustment.breakdown.environmental.dollarAmount).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700">{environmental.description}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Noise Level</span>
                <span className={`text-sm font-bold ${
                  environmental.noiseScore < 40 ? 'text-green-600' :
                  environmental.noiseScore < 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {environmental.noiseScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    environmental.noiseScore < 40 ? 'bg-green-500' :
                    environmental.noiseScore < 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${environmental.noiseScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationQualityTab;


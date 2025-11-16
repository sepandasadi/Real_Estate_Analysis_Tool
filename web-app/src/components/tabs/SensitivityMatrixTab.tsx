import React from 'react';

interface SensitivityMatrixTabProps {
  flip: {
    purchasePrice: number;
    rehabCost: number;
    arv: number;
    totalInvestment: number;
    sellingCosts: number;
    netProfit: number;
    roi: number;
  };
}

const SensitivityMatrixTab: React.FC<SensitivityMatrixTabProps> = ({ flip }) => {
  // ARV variations: -10%, -5%, 0%, +5%, +10%
  const arvVariations = [-0.10, -0.05, 0, 0.05, 0.10];
  // Rehab cost variations: -10%, -5%, 0%, +5%, +10%
  const rehabVariations = [-0.10, -0.05, 0, 0.05, 0.10];

  const calculateROI = (arvMultiplier: number, rehabMultiplier: number) => {
    const adjustedARV = flip.arv * (1 + arvMultiplier);
    const adjustedRehab = flip.rehabCost * (1 + rehabMultiplier);
    const adjustedTotalInvestment = flip.purchasePrice + adjustedRehab;
    const adjustedSellingCosts = adjustedARV * 0.08;
    const adjustedNetProfit = adjustedARV - adjustedTotalInvestment - adjustedSellingCosts;
    const adjustedROI = (adjustedNetProfit / adjustedTotalInvestment) * 100;
    return adjustedROI;
  };

  const getROIColor = (roi: number) => {
    if (roi >= 20) return 'bg-green-100 text-green-800 font-bold';
    if (roi >= 15) return 'bg-green-50 text-green-700';
    if (roi >= 10) return 'bg-yellow-50 text-yellow-700';
    if (roi >= 5) return 'bg-orange-50 text-orange-700';
    return 'bg-red-100 text-red-800 font-bold';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Flip Sensitivity Matrix</h2>
        <p className="text-gray-600">
          Analyze how ROI changes with different ARV and rehab cost scenarios
        </p>
      </div>

      {/* Base Case Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Base Case Scenario</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-blue-700">ARV</p>
            <p className="text-xl font-bold text-blue-900">${flip.arv.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Rehab Cost</p>
            <p className="text-xl font-bold text-blue-900">${flip.rehabCost.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Net Profit</p>
            <p className="text-xl font-bold text-blue-900">${flip.netProfit.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-blue-700">ROI</p>
            <p className="text-xl font-bold text-blue-900">{flip.roi.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      {/* Sensitivity Matrix */}
      <div className="overflow-x-auto">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">ROI Sensitivity Matrix (%)</h3>
          <p className="text-sm text-gray-600 mb-4">
            Rows: ARV variations | Columns: Rehab Cost variations
          </p>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-2 border-gray-300 bg-gray-100 p-3 text-center font-bold text-gray-700">
                ARV ↓ / Rehab →
              </th>
              {rehabVariations.map((variation) => (
                <th
                  key={variation}
                  className="border-2 border-gray-300 bg-blue-100 p-3 text-center font-semibold text-blue-900"
                >
                  {variation >= 0 ? '+' : ''}
                  {(variation * 100).toFixed(0)}%
                  <div className="text-xs font-normal text-blue-700 mt-1">
                    ${(flip.rehabCost * (1 + variation)).toLocaleString()}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {arvVariations.map((arvVar) => (
              <tr key={arvVar}>
                <td className="border-2 border-gray-300 bg-green-100 p-3 text-center font-semibold text-green-900">
                  {arvVar >= 0 ? '+' : ''}
                  {(arvVar * 100).toFixed(0)}%
                  <div className="text-xs font-normal text-green-700 mt-1">
                    ${(flip.arv * (1 + arvVar)).toLocaleString()}
                  </div>
                </td>
                {rehabVariations.map((rehabVar) => {
                  const roi = calculateROI(arvVar, rehabVar);
                  const isBaseCase = arvVar === 0 && rehabVar === 0;
                  return (
                    <td
                      key={`${arvVar}-${rehabVar}`}
                      className={`border-2 border-gray-300 p-3 text-center ${
                        isBaseCase
                          ? 'bg-blue-200 border-blue-500 border-4'
                          : getROIColor(roi)
                      }`}
                    >
                      <div className={`text-lg font-bold ${isBaseCase ? 'text-blue-900' : ''}`}>
                        {roi.toFixed(2)}%
                      </div>
                      {isBaseCase && (
                        <div className="text-xs text-blue-700 font-semibold mt-1">BASE</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-3">ROI Color Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-sm text-gray-700">≥ 20% (Excellent)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-50 border border-green-200 rounded"></div>
            <span className="text-sm text-gray-700">15-20% (Good)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-50 border border-yellow-200 rounded"></div>
            <span className="text-sm text-gray-700">10-15% (Fair)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-50 border border-orange-200 rounded"></div>
            <span className="text-sm text-gray-700">5-10% (Poor)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-sm text-gray-700">&lt; 5% (Very Poor)</span>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
        <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clipRule="evenodd"
            />
          </svg>
          Key Insights
        </h4>
        <ul className="space-y-2 text-sm text-purple-800">
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-0.5">•</span>
            <span>
              <strong>Best Case:</strong> ARV +10%, Rehab -10% = ROI{' '}
              {calculateROI(0.10, -0.10).toFixed(2)}%
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-0.5">•</span>
            <span>
              <strong>Worst Case:</strong> ARV -10%, Rehab +10% = ROI{' '}
              {calculateROI(-0.10, 0.10).toFixed(2)}%
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-0.5">•</span>
            <span>
              The matrix shows how sensitive your deal is to changes in ARV estimates and rehab
              costs
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-0.5">•</span>
            <span>
              Green cells indicate profitable scenarios, while red cells indicate potential losses
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SensitivityMatrixTab;

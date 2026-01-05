import React, { useState } from 'react';
import { WaterfallConfig, Partner, PartnerDistribution } from '../../types/partnershipManagement';

interface WaterfallConfigurationProps {
  config: WaterfallConfig;
  partners: Partner[];
  partnerDistributions: PartnerDistribution[];
  onUpdate: (updates: Partial<WaterfallConfig>) => void;
  totalProfit: number;
}

const WaterfallConfiguration: React.FC<WaterfallConfigurationProps> = ({
  config,
  partners,
  partnerDistributions,
  onUpdate,
  totalProfit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<WaterfallConfig>(config);

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(config);
    setIsEditing(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const totalCapital = partners.reduce((sum, p) => sum + p.initialCapital, 0);

  // Calculate waterfall tiers
  const tier1 = config.tier1_returnOfCapital ? Math.min(totalProfit, totalCapital) : 0;
  const remainingAfterTier1 = Math.max(0, totalProfit - tier1);

  const tier2 = config.tier2_preferredReturnEnabled
    ? Math.min(remainingAfterTier1, totalCapital * config.tier2_preferredReturnRate)
    : 0;
  const remainingAfterTier2 = Math.max(0, remainingAfterTier1 - tier2);

  const catchupTarget = config.tier3_catchupEnabled
    ? tier2 * (config.tier3_gpPromotePercent / (1 - config.tier3_gpPromotePercent))
    : 0;
  const tier3 = Math.min(remainingAfterTier2, catchupTarget);
  const remainingAfterTier3 = Math.max(0, remainingAfterTier2 - tier3);

  const tier4 = remainingAfterTier3;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="mr-2">💧</span>
            Waterfall Distribution Configuration
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Configure multi-tier profit distribution structure
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            ⚙️ Edit Configuration
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Configuration Form */}
      <div className="bg-blue-50 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">⚙️ Waterfall Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tier 1 */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <label className="font-medium text-gray-900">Tier 1: Return of Capital</label>
              <input
                type="checkbox"
                checked={isEditing ? formData.tier1_returnOfCapital : config.tier1_returnOfCapital}
                onChange={(e) => setFormData({ ...formData, tier1_returnOfCapital: e.target.checked })}
                disabled={!isEditing}
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
            </div>
            <p className="text-sm text-gray-600">Return 100% of capital to investors pro-rata</p>
          </div>

          {/* Tier 2 */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <label className="font-medium text-gray-900">Tier 2: Preferred Return</label>
              <input
                type="checkbox"
                checked={isEditing ? formData.tier2_preferredReturnEnabled : config.tier2_preferredReturnEnabled}
                onChange={(e) => setFormData({ ...formData, tier2_preferredReturnEnabled: e.target.checked })}
                disabled={!isEditing}
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="mt-2">
              <label className="block text-sm text-gray-600 mb-1">Preferred Return Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={isEditing ? formData.tier2_preferredReturnRate * 100 : config.tier2_preferredReturnRate * 100}
                onChange={(e) => setFormData({ ...formData, tier2_preferredReturnRate: parseFloat(e.target.value) / 100 })}
                disabled={!isEditing || !formData.tier2_preferredReturnEnabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Tier 3 */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <label className="font-medium text-gray-900">Tier 3: GP Catch-up</label>
              <input
                type="checkbox"
                checked={isEditing ? formData.tier3_catchupEnabled : config.tier3_catchupEnabled}
                onChange={(e) => setFormData({ ...formData, tier3_catchupEnabled: e.target.checked })}
                disabled={!isEditing}
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="mt-2">
              <label className="block text-sm text-gray-600 mb-1">GP Promote (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={isEditing ? formData.tier3_gpPromotePercent * 100 : config.tier3_gpPromotePercent * 100}
                onChange={(e) => setFormData({ ...formData, tier3_gpPromotePercent: parseFloat(e.target.value) / 100 })}
                disabled={!isEditing || !formData.tier3_catchupEnabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Tier 4 */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <label className="font-medium text-gray-900">Tier 4: Remaining Profit</label>
              <input
                type="checkbox"
                checked={isEditing ? formData.tier4_splitByOwnership : config.tier4_splitByOwnership}
                onChange={(e) => setFormData({ ...formData, tier4_splitByOwnership: e.target.checked })}
                disabled={!isEditing}
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
            </div>
            <p className="text-sm text-gray-600">Split remaining profit by ownership percentage</p>
          </div>

          {/* Distribution Frequency */}
          <div className="bg-white rounded-lg p-4 border border-blue-200 md:col-span-2">
            <label className="block font-medium text-gray-900 mb-2">Distribution Frequency</label>
            <select
              value={isEditing ? formData.distributionFrequency : config.distributionFrequency}
              onChange={(e) => setFormData({ ...formData, distributionFrequency: e.target.value as 'at-exit' | 'quarterly' | 'annually' })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="at-exit">At Exit</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>
        </div>
      </div>

      {/* Waterfall Breakdown */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">📊 Waterfall Breakdown</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % of Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">1</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">Return of Capital</td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-gray-900">
                  {formatCurrency(tier1)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-gray-700">
                  {totalProfit > 0 ? formatPercent(tier1 / totalProfit) : '0%'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">100% to investors pro-rata</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">2</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">Preferred Return</td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-gray-900">
                  {formatCurrency(tier2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-gray-700">
                  {totalProfit > 0 ? formatPercent(tier2 / totalProfit) : '0%'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  @ {formatPercent(config.tier2_preferredReturnRate)} annually
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">3</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">GP Catch-up</td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-gray-900">
                  {formatCurrency(tier3)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-gray-700">
                  {totalProfit > 0 ? formatPercent(tier3 / totalProfit) : '0%'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  GP gets {formatPercent(config.tier3_gpPromotePercent)} promote
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">4</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">Remaining Profit</td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-gray-900">
                  {formatCurrency(tier4)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-gray-700">
                  {totalProfit > 0 ? formatPercent(tier4 / totalProfit) : '0%'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">Split by ownership %</td>
              </tr>
              <tr className="bg-gray-50 font-bold">
                <td className="px-4 py-3 whitespace-nowrap" colSpan={2}>
                  TOTAL DISTRIBUTION
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-green-600">
                  {formatCurrency(totalProfit)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">100.0%</td>
                <td className="px-4 py-3 whitespace-nowrap"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Partner Distribution Summary */}
      {partnerDistributions.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">👥 Distribution by Partner</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Partner
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return of Capital
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preferred Return
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catch-up
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remaining
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ROI
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MOIC
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {partnerDistributions.map((dist) => (
                  <tr key={dist.partnerId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                      {dist.partnerName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-700">
                      {formatCurrency(dist.returnOfCapital)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-700">
                      {formatCurrency(dist.preferredReturn)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-700">
                      {formatCurrency(dist.catchup)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-700">
                      {formatCurrency(dist.remainingProfit)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-gray-900">
                      {formatCurrency(dist.totalDistribution)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span className={dist.roi >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatPercent(dist.roi)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-gray-900">
                      {dist.moic.toFixed(2)}x
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaterfallConfiguration;

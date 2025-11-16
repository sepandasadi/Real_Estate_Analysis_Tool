import React, { useState } from 'react';
import { Distribution, DistributionType, DistributionStatus, Partner } from '../../types/partnershipManagement';
import Modal from './Modal';

interface DistributionTrackingProps {
  distributions: Distribution[];
  partners: Partner[];
  onAdd: (distribution: Omit<Distribution, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Distribution>) => void;
  onDelete: (id: string) => void;
}

const DistributionTracking: React.FC<DistributionTrackingProps> = ({
  distributions,
  partners,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDistribution, setEditingDistribution] = useState<Distribution | null>(null);
  const [formData, setFormData] = useState<Omit<Distribution, 'id'>>({
    distributionDate: new Date().toISOString().split('T')[0],
    type: 'Quarterly Cash Flow',
    totalAmount: 0,
    status: 'projected',
    isProjected: false,
    notes: '',
    partnerDistributions: [],
  });

  const handleOpenModal = (distribution?: Distribution) => {
    if (distribution) {
      setEditingDistribution(distribution);
      setFormData(distribution);
    } else {
      setEditingDistribution(null);
      // Initialize with equal distribution
      const equalAmount = 0;
      setFormData({
        distributionDate: new Date().toISOString().split('T')[0],
        type: 'Quarterly Cash Flow',
        totalAmount: 0,
        status: 'projected',
        isProjected: false,
        notes: '',
        partnerDistributions: partners.map(p => ({
          partnerId: p.id,
          partnerName: p.name,
          amount: equalAmount,
        })),
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDistribution(null);
  };

  const handleTotalAmountChange = (totalAmount: number) => {
    // Distribute proportionally by ownership
    const totalOwnership = partners.reduce((sum, p) => sum + p.ownershipPercent, 0);
    const partnerDistributions = partners.map(p => ({
      partnerId: p.id,
      partnerName: p.name,
      amount: totalOwnership > 0 ? (p.ownershipPercent / totalOwnership) * totalAmount : 0,
    }));

    setFormData({
      ...formData,
      totalAmount,
      partnerDistributions,
    });
  };

  const handlePartnerAmountChange = (partnerId: string, amount: number) => {
    const updatedPartnerDistributions = formData.partnerDistributions.map(pd =>
      pd.partnerId === partnerId ? { ...pd, amount } : pd
    );
    const newTotal = updatedPartnerDistributions.reduce((sum, pd) => sum + pd.amount, 0);

    setFormData({
      ...formData,
      totalAmount: newTotal,
      partnerDistributions: updatedPartnerDistributions,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDistribution) {
      onUpdate(editingDistribution.id, formData);
    } else {
      onAdd(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this distribution?')) {
      onDelete(id);
    }
  };

  const getStatusColor = (status: DistributionStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'projected':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalDistributions = distributions.reduce((sum, d) => sum + d.totalAmount, 0);
  const completedDistributions = distributions
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.totalAmount, 0);
  const projectedDistributions = distributions
    .filter(d => d.status === 'projected')
    .reduce((sum, d) => sum + d.totalAmount, 0);

  // Sort distributions by date (newest first)
  const sortedDistributions = [...distributions].sort(
    (a, b) => new Date(b.distributionDate).getTime() - new Date(a.distributionDate).getTime()
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="mr-2">📊</span>
            Distribution Tracking
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Track all partner distributions and payouts
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
          disabled={partners.length === 0}
        >
          + Add Distribution
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-sm text-green-600 mb-1">Completed Distributions</div>
          <div className="text-2xl font-bold text-green-900">{formatCurrency(completedDistributions)}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="text-sm text-yellow-600 mb-1">Projected Distributions</div>
          <div className="text-2xl font-bold text-yellow-900">{formatCurrency(projectedDistributions)}</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-sm text-blue-600 mb-1">Total Distributions</div>
          <div className="text-2xl font-bold text-blue-900">{formatCurrency(totalDistributions)}</div>
        </div>
      </div>

      {partners.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-2">No partners added yet</p>
          <p className="text-sm text-gray-400">Add partners first before tracking distributions</p>
        </div>
      ) : distributions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No distributions recorded yet</p>
          <button
            onClick={() => handleOpenModal()}
            className="text-yellow-600 hover:text-yellow-700 font-medium"
          >
            Record your first distribution
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Partners
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedDistributions.map((distribution) => (
                <tr key={distribution.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {distribution.distributionDate}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {distribution.type}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-gray-900">
                    {formatCurrency(distribution.totalAmount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(distribution.status)}`}>
                      {distribution.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {distribution.partnerDistributions.length} partners
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {distribution.notes || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleOpenModal(distribution)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(distribution.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td className="px-4 py-3 whitespace-nowrap" colSpan={2}>
                  TOTAL
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-green-600">
                  {formatCurrency(totalDistributions)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap" colSpan={4}></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingDistribution ? 'Edit Distribution' : 'Add New Distribution'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distribution Date *
              </label>
              <input
                type="date"
                required
                value={formData.distributionDate}
                onChange={(e) => setFormData({ ...formData, distributionDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as DistributionType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="Quarterly Cash Flow">Quarterly Cash Flow</option>
                <option value="Annual Distribution">Annual Distribution</option>
                <option value="Refinance Proceeds">Refinance Proceeds</option>
                <option value="Sale Proceeds">Sale Proceeds</option>
                <option value="Special Distribution">Special Distribution</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Amount ($) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.totalAmount}
                onChange={(e) => handleTotalAmountChange(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as DistributionStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="projected">Projected</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Partner Distributions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distribution by Partner
            </label>
            <div className="border border-gray-300 rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
              {formData.partnerDistributions.map((pd) => (
                <div key={pd.partnerId} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{pd.partnerName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={pd.amount}
                      onChange={(e) => handlePartnerAmountChange(pd.partnerId, parseFloat(e.target.value) || 0)}
                      className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-200 flex items-center justify-between font-semibold">
                <span className="text-sm text-gray-900">Total</span>
                <span className="text-sm text-gray-900">{formatCurrency(formData.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              {editingDistribution ? 'Update Distribution' : 'Add Distribution'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DistributionTracking;

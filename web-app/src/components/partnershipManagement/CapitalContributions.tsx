import React, { useState } from 'react';
import { CapitalContribution, ContributionType, ContributionStatus, Partner } from '../../types/partnershipManagement';
import Modal from './Modal';

interface CapitalContributionsProps {
  contributions: CapitalContribution[];
  partners: Partner[];
  onAdd: (contribution: Omit<CapitalContribution, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<CapitalContribution>) => void;
  onDelete: (id: string) => void;
}

const CapitalContributions: React.FC<CapitalContributionsProps> = ({
  contributions,
  partners,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContribution, setEditingContribution] = useState<CapitalContribution | null>(null);
  const [formData, setFormData] = useState<Omit<CapitalContribution, 'id'>>({
    partnerId: '',
    partnerName: '',
    contributionDate: new Date().toISOString().split('T')[0],
    type: 'Initial Capital',
    amount: 0,
    status: 'pending',
    paymentMethod: '',
    description: '',
    notes: '',
  });

  const handleOpenModal = (contribution?: CapitalContribution) => {
    if (contribution) {
      setEditingContribution(contribution);
      setFormData(contribution);
    } else {
      setEditingContribution(null);
      setFormData({
        partnerId: '',
        partnerName: '',
        contributionDate: new Date().toISOString().split('T')[0],
        type: 'Initial Capital',
        amount: 0,
        status: 'pending',
        paymentMethod: '',
        description: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContribution(null);
  };

  const handlePartnerChange = (partnerId: string) => {
    const partner = partners.find(p => p.id === partnerId);
    setFormData({
      ...formData,
      partnerId,
      partnerName: partner?.name || '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContribution) {
      onUpdate(editingContribution.id, formData);
    } else {
      onAdd(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this contribution?')) {
      onDelete(id);
    }
  };

  const getStatusColor = (status: ContributionStatus) => {
    switch (status) {
      case 'verified':
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
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

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const verifiedContributions = contributions
    .filter(c => c.status === 'verified' || c.status === 'received')
    .reduce((sum, c) => sum + c.amount, 0);

  // Sort contributions by date (newest first)
  const sortedContributions = [...contributions].sort(
    (a, b) => new Date(b.contributionDate).getTime() - new Date(a.contributionDate).getTime()
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="mr-2">💰</span>
            Capital Contributions
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Track all partner capital contributions and investments
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          disabled={partners.length === 0}
        >
          + Add Contribution
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-sm text-blue-600 mb-1">Total Contributions</div>
          <div className="text-2xl font-bold text-blue-900">{formatCurrency(totalContributions)}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-sm text-green-600 mb-1">Verified Contributions</div>
          <div className="text-2xl font-bold text-green-900">{formatCurrency(verifiedContributions)}</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-sm text-purple-600 mb-1">Total Entries</div>
          <div className="text-2xl font-bold text-purple-900">{contributions.length}</div>
        </div>
      </div>

      {partners.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-2">No partners added yet</p>
          <p className="text-sm text-gray-400">Add partners first before tracking contributions</p>
        </div>
      ) : contributions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No contributions recorded yet</p>
          <button
            onClick={() => handleOpenModal()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Record your first contribution
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
                  Partner
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedContributions.map((contribution) => (
                <tr key={contribution.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {contribution.contributionDate}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                    {contribution.partnerName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {contribution.type}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-gray-900">
                    {formatCurrency(contribution.amount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {contribution.paymentMethod || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contribution.status)}`}>
                      {contribution.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {contribution.description || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleOpenModal(contribution)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(contribution.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td className="px-4 py-3 whitespace-nowrap" colSpan={3}>
                  TOTAL
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-green-600">
                  {formatCurrency(totalContributions)}
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
        title={editingContribution ? 'Edit Contribution' : 'Add New Contribution'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partner *
              </label>
              <select
                required
                value={formData.partnerId}
                onChange={(e) => handlePartnerChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Partner</option>
                {partners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contribution Date *
              </label>
              <input
                type="date"
                required
                value={formData.contributionDate}
                onChange={(e) => setFormData({ ...formData, contributionDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ContributionType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Initial Capital">Initial Capital</option>
                <option value="Additional Capital">Additional Capital</option>
                <option value="Loan">Loan</option>
                <option value="In-Kind">In-Kind</option>
                <option value="Sweat Equity">Sweat Equity</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount ($) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ContributionStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="received">Received</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <input
                type="text"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                placeholder="e.g., Wire Transfer, Check"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the contribution"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingContribution ? 'Update Contribution' : 'Add Contribution'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CapitalContributions;

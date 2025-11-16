import React, { useState } from 'react';
import { Partner, PartnerRole, PartnerStatus } from '../../types/partnershipManagement';
import Modal from './Modal';

interface PartnerInformationProps {
  partners: Partner[];
  onAdd: (partner: Omit<Partner, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Partner>) => void;
  onDelete: (id: string) => void;
  ownershipValidation: { isValid: boolean; totalOwnership: number };
}

const PartnerInformation: React.FC<PartnerInformationProps> = ({
  partners,
  onAdd,
  onUpdate,
  onDelete,
  ownershipValidation,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState<Omit<Partner, 'id'>>({
    name: '',
    email: '',
    phone: '',
    ownershipPercent: 0,
    initialCapital: 0,
    role: 'Limited Partner',
    status: 'active',
    joinDate: new Date().toISOString().split('T')[0],
    exitDate: '',
    notes: '',
  });

  const handleOpenModal = (partner?: Partner) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData(partner);
    } else {
      setEditingPartner(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        ownershipPercent: 0,
        initialCapital: 0,
        role: 'Limited Partner',
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        exitDate: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPartner(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPartner) {
      onUpdate(editingPartner.id, formData);
    } else {
      onAdd(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this partner? This will also remove all related contributions.')) {
      onDelete(id);
    }
  };

  const getStatusColor = (status: PartnerStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'exited':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getRoleColor = (role: PartnerRole) => {
    switch (role) {
      case 'General Partner':
        return 'bg-purple-100 text-purple-800';
      case 'Limited Partner':
        return 'bg-blue-100 text-blue-800';
      case 'Operating Partner':
        return 'bg-indigo-100 text-indigo-800';
      case 'Investor':
        return 'bg-green-100 text-green-800';
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

  const totalCapital = partners.reduce((sum, p) => sum + p.initialCapital, 0);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="mr-2">👥</span>
            Partner Information
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage partner ownership, roles, and capital contributions
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          + Add Partner
        </button>
      </div>

      {/* Ownership Validation Alert */}
      {!ownershipValidation.isValid && partners.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-yellow-600 mr-2">⚠️</span>
            <span className="text-sm font-medium text-yellow-800">
              Total ownership is {ownershipValidation.totalOwnership.toFixed(2)}% (should be 100%)
            </span>
          </div>
        </div>
      )}

      {partners.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No partners added yet</p>
          <button
            onClick={() => handleOpenModal()}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Add your first partner
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Partner
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ownership %
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Initial Capital
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {partners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{partner.name}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{partner.email}</div>
                      <div className="text-xs text-gray-500">{partner.phone}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(partner.role)}`}>
                        {partner.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-gray-900">
                      {partner.ownershipPercent}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-gray-900">
                      {formatCurrency(partner.initialCapital)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(partner.status)}`}>
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {partner.joinDate}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleOpenModal(partner)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(partner.id)}
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
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    {ownershipValidation.totalOwnership.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    {formatCurrency(totalCapital)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" colSpan={3}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPartner ? 'Edit Partner' : 'Add New Partner'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partner Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as PartnerRole })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="General Partner">General Partner</option>
                <option value="Limited Partner">Limited Partner</option>
                <option value="Operating Partner">Operating Partner</option>
                <option value="Investor">Investor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ownership Percent (%) *
              </label>
              <input
                type="number"
                required
                min="0"
                max="100"
                step="0.01"
                value={formData.ownershipPercent}
                onChange={(e) => setFormData({ ...formData, ownershipPercent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Capital ($) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.initialCapital}
                onChange={(e) => setFormData({ ...formData, initialCapital: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as PartnerStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="exited">Exited</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Join Date *
              </label>
              <input
                type="date"
                required
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exit Date
              </label>
              <input
                type="date"
                value={formData.exitDate}
                onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {editingPartner ? 'Update Partner' : 'Add Partner'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PartnerInformation;

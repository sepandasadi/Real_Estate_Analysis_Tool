/**
 * Section 2: Inspection & Permit Tracker
 * Track permits with status and dates
 */

import React, { useState } from 'react';
import { Permit, PermitStatus } from '../../types/projectTracker';
import Modal from './Modal';

interface PermitTrackerProps {
  permits: Permit[];
  onAdd: (permit: Omit<Permit, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Permit>) => void;
  onDelete: (id: string) => void;
}

const PermitTracker: React.FC<PermitTrackerProps> = ({
  permits,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermit, setEditingPermit] = useState<Permit | null>(null);
  const [formData, setFormData] = useState<Omit<Permit, 'id'>>({
    permitType: '',
    permitNumber: '',
    applicationDate: '',
    approvalDate: '',
    expirationDate: '',
    cost: 0,
    issuingAuthority: '',
    status: 'not-applied',
    notes: '',
  });

  const handleOpenModal = (permit?: Permit) => {
    if (permit) {
      setEditingPermit(permit);
      setFormData(permit);
    } else {
      setEditingPermit(null);
      setFormData({
        permitType: '',
        permitNumber: '',
        applicationDate: '',
        approvalDate: '',
        expirationDate: '',
        cost: 0,
        issuingAuthority: '',
        status: 'not-applied',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPermit(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPermit) {
      onUpdate(editingPermit.id, formData);
    } else {
      onAdd(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this permit?')) {
      onDelete(id);
    }
  };

  const getStatusColor = (status: PermitStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getStatusIcon = (status: PermitStatus) => {
    switch (status) {
      case 'approved':
        return '✓';
      case 'pending':
        return '⏳';
      case 'rejected':
        return '✗';
      case 'expired':
        return '⚠';
      default:
        return '📋';
    }
  };

  const totalCost = permits.reduce((sum, p) => sum + p.cost, 0);
  const approvedCount = permits.filter(p => p.status === 'approved').length;
  const pendingCount = permits.filter(p => p.status === 'pending').length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Inspection & Permit Tracker</h3>
          <p className="text-sm text-gray-600">Track permit applications and approvals</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Permit
        </button>
      </div>

      {/* Summary Cards */}
      {permits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Total Permits</p>
            <p className="text-2xl font-bold text-blue-900">{permits.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-700 mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-900">{approvedCount}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-yellow-700 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-700 mb-1">Total Cost</p>
            <p className="text-2xl font-bold text-purple-900">${totalCost.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Permits Grid */}
      {permits.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 mb-2">No permits tracked yet</p>
          <p className="text-sm text-gray-500">Click "Add Permit" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {permits.map((permit) => (
            <div
              key={permit.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getStatusIcon(permit.status)}</span>
                  <div>
                    <h4 className="font-bold text-gray-900">{permit.permitType}</h4>
                    {permit.permitNumber && (
                      <p className="text-xs text-gray-500">#{permit.permitNumber}</p>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(permit.status)}`}>
                  {permit.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Authority:</span>
                  <span className="font-medium text-gray-900">{permit.issuingAuthority || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost:</span>
                  <span className="font-medium text-gray-900">${permit.cost.toLocaleString()}</span>
                </div>
                {permit.applicationDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Applied:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(permit.applicationDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {permit.approvalDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approved:</span>
                    <span className="font-medium text-green-700">
                      {new Date(permit.approvalDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {permit.expirationDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires:</span>
                    <span className={`font-medium ${
                      new Date(permit.expirationDate) < new Date() ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {new Date(permit.expirationDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {permit.notes && (
                <div className="mb-4 p-2 bg-gray-50 rounded text-xs text-gray-700">
                  {permit.notes}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleOpenModal(permit)}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(permit.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPermit ? 'Edit Permit' : 'Add Permit'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permit Type *
              </label>
              <select
                required
                value={formData.permitType}
                onChange={(e) => setFormData({ ...formData, permitType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select type...</option>
                <option value="Building">Building</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="HVAC">HVAC</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Demolition">Demolition</option>
                <option value="Roofing">Roofing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permit Number
              </label>
              <input
                type="text"
                value={formData.permitNumber}
                onChange={(e) => setFormData({ ...formData, permitNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., BLD-2025-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issuing Authority *
              </label>
              <input
                type="text"
                required
                value={formData.issuingAuthority}
                onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., City Building Dept"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
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
                onChange={(e) => setFormData({ ...formData, status: e.target.value as PermitStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="not-applied">Not Applied</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Date
              </label>
              <input
                type="date"
                value={formData.applicationDate}
                onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approval Date
              </label>
              <input
                type="date"
                value={formData.approvalDate}
                onChange={(e) => setFormData({ ...formData, approvalDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date
              </label>
              <input
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Additional notes or requirements"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingPermit ? 'Update Permit' : 'Add Permit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PermitTracker;

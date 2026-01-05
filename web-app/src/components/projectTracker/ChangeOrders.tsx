/**
 * Section 7: Change Orders Tracker
 * Track scope changes with cost and time impact
 */

import React, { useState } from 'react';
import { ChangeOrder, ChangeOrderStatus } from '../../types/projectTracker';
import Modal from './Modal';

interface ChangeOrdersProps {
  changeOrders: ChangeOrder[];
  onAdd: (changeOrder: Omit<ChangeOrder, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<ChangeOrder>) => void;
  onDelete: (id: string) => void;
}

const ChangeOrders: React.FC<ChangeOrdersProps> = ({
  changeOrders,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ChangeOrder | null>(null);
  const [formData, setFormData] = useState<Omit<ChangeOrder, 'id'>>({
    changeOrderNumber: '',
    title: '',
    description: '',
    requestedBy: '',
    requestDate: '',
    approvalDate: '',
    originalScope: '',
    newScope: '',
    costImpact: 0,
    timeImpact: 0,
    status: 'pending',
    justification: '',
    notes: '',
  });

  const handleOpenModal = (order?: ChangeOrder) => {
    if (order) {
      setEditingOrder(order);
      setFormData(order);
    } else {
      setEditingOrder(null);
      setFormData({
        changeOrderNumber: '',
        title: '',
        description: '',
        requestedBy: '',
        requestDate: new Date().toISOString().split('T')[0],
        approvalDate: '',
        originalScope: '',
        newScope: '',
        costImpact: 0,
        timeImpact: 0,
        status: 'pending',
        justification: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOrder) {
      onUpdate(editingOrder.id, formData);
    } else {
      onAdd(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this change order?')) {
      onDelete(id);
    }
  };

  const getStatusColor = (status: ChangeOrderStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getStatusIcon = (status: ChangeOrderStatus) => {
    switch (status) {
      case 'approved':
        return '✓';
      case 'completed':
        return '✓✓';
      case 'rejected':
        return '✗';
      default:
        return '⏳';
    }
  };

  const totalCostImpact = changeOrders.reduce((sum, co) => sum + co.costImpact, 0);
  const totalTimeImpact = changeOrders.reduce((sum, co) => sum + co.timeImpact, 0);
  // const approvedCount = changeOrders.filter(co => co.status === 'approved' || co.status === 'completed').length;
  const pendingCount = changeOrders.filter(co => co.status === 'pending').length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Change Orders Tracker</h3>
          <p className="text-sm text-gray-600">Track scope changes and their impact</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Change Order
        </button>
      </div>

      {/* Summary Cards */}
      {changeOrders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-blue-900">{changeOrders.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-yellow-700 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-700 mb-1">Cost Impact</p>
            <p className="text-2xl font-bold text-purple-900">${totalCostImpact.toLocaleString()}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-sm text-orange-700 mb-1">Time Impact</p>
            <p className="text-2xl font-bold text-orange-900">{totalTimeImpact} days</p>
          </div>
        </div>
      )}

      {/* Change Orders List */}
      {changeOrders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 mb-2">No change orders yet</p>
          <p className="text-sm text-gray-500">Click "Add Change Order" to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {changeOrders.map((order) => (
            <div
              key={order.id}
              className={`border-2 rounded-lg p-4 transition-all ${
                order.status === 'approved'
                  ? 'border-green-200 bg-green-50'
                  : order.status === 'rejected'
                  ? 'border-red-200 bg-red-50'
                  : order.status === 'completed'
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-yellow-200 bg-yellow-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl mt-1">{getStatusIcon(order.status)}</span>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {order.changeOrderNumber && (
                        <span className="px-2 py-1 bg-gray-700 text-white text-xs font-bold rounded">
                          CO-{order.changeOrderNumber}
                        </span>
                      )}
                      <h4 className="font-bold text-gray-900">{order.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>

                    {order.description && (
                      <p className="text-sm text-gray-600 mb-3">{order.description}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-gray-600">Requested By</p>
                        <p className="font-semibold text-gray-900">{order.requestedBy || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Request Date</p>
                        <p className="font-semibold text-gray-900">
                          {order.requestDate ? new Date(order.requestDate).toLocaleDateString() : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Cost Impact</p>
                        <p className={`font-semibold ${order.costImpact > 0 ? 'text-red-700' : order.costImpact < 0 ? 'text-green-700' : 'text-gray-900'}`}>
                          {order.costImpact > 0 ? '+' : ''}${order.costImpact.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Time Impact</p>
                        <p className={`font-semibold ${order.timeImpact > 0 ? 'text-orange-700' : 'text-gray-900'}`}>
                          {order.timeImpact > 0 ? '+' : ''}{order.timeImpact} days
                        </p>
                      </div>
                    </div>

                    {(order.originalScope || order.newScope) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        {order.originalScope && (
                          <div className="p-2 bg-white rounded border border-gray-200">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Original Scope:</p>
                            <p className="text-xs text-gray-700">{order.originalScope}</p>
                          </div>
                        )}
                        {order.newScope && (
                          <div className="p-2 bg-white rounded border border-gray-200">
                            <p className="text-xs font-semibold text-gray-700 mb-1">New Scope:</p>
                            <p className="text-xs text-gray-700">{order.newScope}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {order.justification && (
                      <div className="mb-2 p-2 bg-white rounded border border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Justification:</p>
                        <p className="text-xs text-gray-700">{order.justification}</p>
                      </div>
                    )}

                    {order.notes && (
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Notes:</p>
                        <p className="text-xs text-gray-700">{order.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleOpenModal(order)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingOrder ? 'Edit Change Order' : 'Add Change Order'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Change Order Number
              </label>
              <input
                type="text"
                value={formData.changeOrderNumber}
                onChange={(e) => setFormData({ ...formData, changeOrderNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ChangeOrderStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief title of the change"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Detailed description of the change"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requested By
              </label>
              <input
                type="text"
                value={formData.requestedBy}
                onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Name or role"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Request Date *
              </label>
              <input
                type="date"
                required
                value={formData.requestDate}
                onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
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
                Cost Impact *
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.costImpact}
                onChange={(e) => setFormData({ ...formData, costImpact: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Use negative for savings"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Impact (days) *
              </label>
              <input
                type="number"
                required
                value={formData.timeImpact}
                onChange={(e) => setFormData({ ...formData, timeImpact: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Use negative for time saved"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Scope
              </label>
              <textarea
                value={formData.originalScope}
                onChange={(e) => setFormData({ ...formData, originalScope: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="What was originally planned?"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Scope
              </label>
              <textarea
                value={formData.newScope}
                onChange={(e) => setFormData({ ...formData, newScope: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="What is the new plan?"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Justification
              </label>
              <textarea
                value={formData.justification}
                onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Why is this change necessary?"
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
                rows={2}
                placeholder="Additional notes"
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
              {editingOrder ? 'Update Change Order' : 'Add Change Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ChangeOrders;

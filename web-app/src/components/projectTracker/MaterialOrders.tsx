/**
 * Section 3: Material & Vendor Tracking
 * Track material orders with delivery status
 */

import React, { useState } from 'react';
import { MaterialOrder, DeliveryStatus } from '../../types/projectTracker';
import Modal from './Modal';

interface MaterialOrdersProps {
  orders: MaterialOrder[];
  onAdd: (order: Omit<MaterialOrder, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<MaterialOrder>) => void;
  onDelete: (id: string) => void;
}

const MaterialOrders: React.FC<MaterialOrdersProps> = ({
  orders,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<MaterialOrder | null>(null);
  const [formData, setFormData] = useState<Omit<MaterialOrder, 'id'>>({
    materialName: '',
    vendor: '',
    vendorContact: '',
    orderDate: '',
    expectedDeliveryDate: '',
    actualDeliveryDate: '',
    quantity: 0,
    unitCost: 0,
    totalCost: 0,
    status: 'ordered',
    notes: '',
  });

  const handleOpenModal = (order?: MaterialOrder) => {
    if (order) {
      setEditingOrder(order);
      setFormData(order);
    } else {
      setEditingOrder(null);
      setFormData({
        materialName: '',
        vendor: '',
        vendorContact: '',
        orderDate: '',
        expectedDeliveryDate: '',
        actualDeliveryDate: '',
        quantity: 0,
        unitCost: 0,
        totalCost: 0,
        status: 'ordered',
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
    // Calculate total cost
    const totalCost = formData.quantity * formData.unitCost;
    if (editingOrder) {
      onUpdate(editingOrder.id, { ...formData, totalCost });
    } else {
      onAdd({ ...formData, totalCost });
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      onDelete(id);
    }
  };

  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in-transit':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getStatusIcon = (status: DeliveryStatus) => {
    switch (status) {
      case 'delivered':
        return '✓';
      case 'in-transit':
        return '🚚';
      case 'delayed':
        return '⚠';
      case 'cancelled':
        return '✗';
      default:
        return '📦';
    }
  };

  const totalCost = orders.reduce((sum, o) => sum + o.totalCost, 0);
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;
  const pendingCount = orders.filter(o => o.status === 'ordered' || o.status === 'in-transit').length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Material & Vendor Tracking</h3>
          <p className="text-sm text-gray-600">Track material orders and deliveries</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Order
        </button>
      </div>

      {/* Summary Cards */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-blue-900">{orders.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-700 mb-1">Delivered</p>
            <p className="text-2xl font-bold text-green-900">{deliveredCount}</p>
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

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-600 mb-2">No material orders yet</p>
          <p className="text-sm text-gray-500">Click "Add Order" to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Material</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Quantity</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Unit Cost</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Delivery</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getStatusIcon(order.status)}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{order.materialName}</p>
                        {order.orderDate && (
                          <p className="text-xs text-gray-500">
                            Ordered: {new Date(order.orderDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.vendor}</p>
                      {order.vendorContact && (
                        <p className="text-xs text-gray-500">{order.vendorContact}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                      {order.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">
                    {order.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">
                    ${order.unitCost.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ${order.totalCost.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs">
                      {order.expectedDeliveryDate && (
                        <p className="text-gray-600">
                          Expected: {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                        </p>
                      )}
                      {order.actualDeliveryDate && (
                        <p className="text-green-700 font-medium">
                          Delivered: {new Date(order.actualDeliveryDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(order)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingOrder ? 'Edit Material Order' : 'Add Material Order'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material Name *
              </label>
              <input
                type="text"
                required
                value={formData.materialName}
                onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Hardwood Flooring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor *
              </label>
              <input
                type="text"
                required
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Vendor name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Contact
              </label>
              <input
                type="text"
                value={formData.vendorContact}
                onChange={(e) => setFormData({ ...formData, vendorContact: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Phone or email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Cost *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Cost (Auto-calculated)
              </label>
              <input
                type="text"
                disabled
                value={`$${(formData.quantity * formData.unitCost).toLocaleString()}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as DeliveryStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ordered">Ordered</option>
                <option value="in-transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Date
              </label>
              <input
                type="date"
                value={formData.orderDate}
                onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={formData.expectedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actual Delivery Date
              </label>
              <input
                type="date"
                value={formData.actualDeliveryDate}
                onChange={(e) => setFormData({ ...formData, actualDeliveryDate: e.target.value })}
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
                placeholder="Additional notes about the order"
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
              {editingOrder ? 'Update Order' : 'Add Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaterialOrders;

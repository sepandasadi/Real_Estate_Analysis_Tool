import React, { useState } from 'react';
import { CashFlowEntry } from '../../types/partnershipManagement';
import Modal from './Modal';

interface CashFlowManagementProps {
  cashFlowEntries: CashFlowEntry[];
  onAdd: (entry: CashFlowEntry) => void;
  onUpdate: (index: number, updates: Partial<CashFlowEntry>) => void;
  onDelete: (index: number) => void;
}

const CashFlowManagement: React.FC<CashFlowManagementProps> = ({
  cashFlowEntries,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<CashFlowEntry>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    description: '',
  });

  const handleOpenModal = (entry?: CashFlowEntry, index?: number) => {
    if (entry && index !== undefined) {
      setEditingIndex(index);
      setFormData(entry);
    } else {
      setEditingIndex(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndex !== null) {
      onUpdate(editingIndex, formData);
    } else {
      onAdd(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (index: number) => {
    if (window.confirm('Are you sure you want to delete this cash flow entry?')) {
      onDelete(index);
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

  // Sort entries by date (newest first)
  const sortedEntries = cashFlowEntries
    .map((entry, index) => ({ ...entry, originalIndex: index }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate totals
  const totalInflows = cashFlowEntries
    .filter(e => e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0);
  const totalOutflows = cashFlowEntries
    .filter(e => e.amount < 0)
    .reduce((sum, e) => sum + Math.abs(e.amount), 0);
  const netCashFlow = totalInflows - totalOutflows;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="mr-2">💵</span>
            Cash Flow Management
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Track all cash inflows and outflows for IRR calculations
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          + Add Cash Flow
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-sm text-green-600 mb-1">Total Inflows</div>
          <div className="text-2xl font-bold text-green-900">{formatCurrency(totalInflows)}</div>
          <div className="text-xs text-gray-600 mt-1">Positive cash flows</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="text-sm text-red-600 mb-1">Total Outflows</div>
          <div className="text-2xl font-bold text-red-900">{formatCurrency(totalOutflows)}</div>
          <div className="text-xs text-gray-600 mt-1">Negative cash flows</div>
        </div>
        <div className={`rounded-lg p-4 border ${netCashFlow >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
          <div className={`text-sm mb-1 ${netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            Net Cash Flow
          </div>
          <div className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
            {formatCurrency(netCashFlow)}
          </div>
          <div className="text-xs text-gray-600 mt-1">Inflows - Outflows</div>
        </div>
      </div>

      {cashFlowEntries.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No cash flow entries yet</p>
          <button
            onClick={() => handleOpenModal()}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Add your first cash flow entry
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
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
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
              {sortedEntries.map((entry) => (
                <tr key={entry.originalIndex} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {entry.date}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right font-semibold">
                    <span className={entry.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {entry.amount >= 0 ? '+' : ''}{formatCurrency(entry.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      entry.amount >= 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {entry.amount >= 0 ? 'Inflow' : 'Outflow'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {entry.description}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleOpenModal(entry, entry.originalIndex)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(entry.originalIndex)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td className="px-4 py-3 whitespace-nowrap">
                  NET CASH FLOW
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <span className={netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(netCashFlow)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap" colSpan={3}></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-blue-600 mr-2">ℹ️</span>
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Cash Flow Entry Guidelines:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li><strong>Negative amounts</strong> represent cash outflows (investments, capital calls)</li>
              <li><strong>Positive amounts</strong> represent cash inflows (distributions, returns)</li>
              <li>These entries are used to calculate IRR (Internal Rate of Return) for partners</li>
              <li>Include the date and clear description for each entry</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingIndex !== null ? 'Edit Cash Flow Entry' : 'Add New Cash Flow Entry'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount ($) *
            </label>
            <input
              type="number"
              required
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              placeholder="Use negative for outflows, positive for inflows"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Negative = Outflow (investment), Positive = Inflow (distribution)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="e.g., Initial capital contribution, Q1 distribution, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Amount Selection
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, amount: -50000 })}
                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
              >
                -$50,000 (Outflow)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, amount: -100000 })}
                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
              >
                -$100,000 (Outflow)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, amount: 25000 })}
                className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
              >
                +$25,000 (Inflow)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, amount: 50000 })}
                className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
              >
                +$50,000 (Inflow)
              </button>
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
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {editingIndex !== null ? 'Update Entry' : 'Add Entry'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CashFlowManagement;

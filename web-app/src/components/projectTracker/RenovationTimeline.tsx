/**
 * Section 1: Renovation Timeline & Budget
 * Displays and manages renovation phases with costs and durations
 */

import React, { useState } from 'react';
import { RenovationPhase, ProjectStatus } from '../../types/projectTracker';
import Modal from './Modal';

interface RenovationTimelineProps {
  phases: RenovationPhase[];
  onAdd: (phase: Omit<RenovationPhase, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<RenovationPhase>) => void;
  onDelete: (id: string) => void;
}

const RenovationTimeline: React.FC<RenovationTimelineProps> = ({
  phases,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<RenovationPhase | null>(null);
  const [formData, setFormData] = useState<Omit<RenovationPhase, 'id'>>({
    phaseName: '',
    description: '',
    estimatedCost: 0,
    actualCost: 0,
    estimatedDuration: 0,
    actualDuration: 0,
    startDate: '',
    endDate: '',
    contractor: '',
    status: 'not-started',
    notes: '',
  });

  const handleOpenModal = (phase?: RenovationPhase) => {
    if (phase) {
      setEditingPhase(phase);
      setFormData(phase);
    } else {
      setEditingPhase(null);
      setFormData({
        phaseName: '',
        description: '',
        estimatedCost: 0,
        actualCost: 0,
        estimatedDuration: 0,
        actualDuration: 0,
        startDate: '',
        endDate: '',
        contractor: '',
        status: 'not-started',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPhase(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPhase) {
      onUpdate(editingPhase.id, formData);
    } else {
      onAdd(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this phase?')) {
      onDelete(id);
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const totalEstimated = phases.reduce((sum, p) => sum + p.estimatedCost, 0);
  const totalActual = phases.reduce((sum, p) => sum + p.actualCost, 0);
  const variance = totalEstimated - totalActual;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Renovation Timeline & Budget</h3>
          <p className="text-sm text-gray-600">Track phases with estimated and actual costs</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Phase
        </button>
      </div>

      {/* Summary Cards */}
      {phases.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Total Estimated</p>
            <p className="text-2xl font-bold text-blue-900">${totalEstimated.toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-700 mb-1">Total Actual</p>
            <p className="text-2xl font-bold text-purple-900">${totalActual.toLocaleString()}</p>
          </div>
          <div className={`rounded-lg p-4 border ${variance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className={`text-sm mb-1 ${variance >= 0 ? 'text-green-700' : 'text-red-700'}`}>Variance</p>
            <p className={`text-2xl font-bold ${variance >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              {variance >= 0 ? '+' : '-'}${Math.abs(variance).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Phases Table */}
      {phases.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-600 mb-2">No renovation phases yet</p>
          <p className="text-sm text-gray-500">Click "Add Phase" to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Phase</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Contractor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Est. Cost</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actual Cost</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Duration</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {phases.map((phase) => {
                const costVariance = phase.estimatedCost - phase.actualCost;
                const durationVariance = phase.estimatedDuration - phase.actualDuration;

                return (
                  <tr key={phase.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-900">{phase.phaseName}</p>
                        <p className="text-sm text-gray-600">{phase.description}</p>
                        {phase.startDate && phase.endDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{phase.contractor || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(phase.status)}`}>
                        {phase.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">
                      ${phase.estimatedCost.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">${phase.actualCost.toLocaleString()}</p>
                        {phase.actualCost > 0 && (
                          <p className={`text-xs ${costVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {costVariance >= 0 ? '↓' : '↑'} ${Math.abs(costVariance).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div>
                        <p className="text-sm text-gray-900">{phase.estimatedDuration}d / {phase.actualDuration}d</p>
                        {phase.actualDuration > 0 && (
                          <p className={`text-xs ${durationVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {durationVariance >= 0 ? '↓' : '↑'} {Math.abs(durationVariance)}d
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(phase)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(phase.id)}
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPhase ? 'Edit Renovation Phase' : 'Add Renovation Phase'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phase Name *
              </label>
              <input
                type="text"
                required
                value={formData.phaseName}
                onChange={(e) => setFormData({ ...formData, phaseName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Foundation Repair"
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
                placeholder="Brief description of the phase"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Cost *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actual Cost
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.actualCost}
                onChange={(e) => setFormData({ ...formData, actualCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Duration (days) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actual Duration (days)
              </label>
              <input
                type="number"
                min="0"
                value={formData.actualDuration}
                onChange={(e) => setFormData({ ...formData, actualDuration: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contractor
              </label>
              <input
                type="text"
                value={formData.contractor}
                onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contractor name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
                <option value="on-hold">On Hold</option>
              </select>
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
                placeholder="Additional notes or comments"
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
              {editingPhase ? 'Update Phase' : 'Add Phase'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RenovationTimeline;

/**
 * Section 4: Critical Milestones & Alerts
 * Track key project milestones with target and actual dates
 */

import React, { useState } from 'react';
import { CriticalMilestone } from '../../types/projectTracker';
import Modal from './Modal';

interface CriticalMilestonesProps {
  milestones: CriticalMilestone[];
  onAdd: (milestone: Omit<CriticalMilestone, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<CriticalMilestone>) => void;
  onDelete: (id: string) => void;
}

const CriticalMilestones: React.FC<CriticalMilestonesProps> = ({
  milestones,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<CriticalMilestone | null>(null);
  const [formData, setFormData] = useState<Omit<CriticalMilestone, 'id'>>({
    milestoneName: '',
    description: '',
    targetDate: '',
    actualDate: '',
    isCompleted: false,
    isCritical: false,
    dependencies: [],
    notes: '',
  });

  const handleOpenModal = (milestone?: CriticalMilestone) => {
    if (milestone) {
      setEditingMilestone(milestone);
      setFormData(milestone);
    } else {
      setEditingMilestone(null);
      setFormData({
        milestoneName: '',
        description: '',
        targetDate: '',
        actualDate: '',
        isCompleted: false,
        isCritical: false,
        dependencies: [],
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMilestone(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMilestone) {
      onUpdate(editingMilestone.id, formData);
    } else {
      onAdd(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      onDelete(id);
    }
  };

  const toggleComplete = (milestone: CriticalMilestone) => {
    onUpdate(milestone.id, {
      isCompleted: !milestone.isCompleted,
      actualDate: !milestone.isCompleted ? new Date().toISOString().split('T')[0] : '',
    });
  };

  const isOverdue = (milestone: CriticalMilestone) => {
    if (milestone.isCompleted) return false;
    if (!milestone.targetDate) return false;
    return new Date(milestone.targetDate) < new Date();
  };

  const completedCount = milestones.filter(m => m.isCompleted).length;
  const criticalCount = milestones.filter(m => m.isCritical && !m.isCompleted).length;
  const overdueCount = milestones.filter(m => isOverdue(m)).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Critical Milestones & Alerts</h3>
          <p className="text-sm text-gray-600">Track key project milestones and dependencies</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Milestone
        </button>
      </div>

      {/* Summary Cards */}
      {milestones.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Total Milestones</p>
            <p className="text-2xl font-bold text-blue-900">{milestones.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-700 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-900">{completedCount}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-sm text-red-700 mb-1">Critical Pending</p>
            <p className="text-2xl font-bold text-red-900">{criticalCount}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-sm text-orange-700 mb-1">Overdue</p>
            <p className="text-2xl font-bold text-orange-900">{overdueCount}</p>
          </div>
        </div>
      )}

      {/* Milestones List */}
      {milestones.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="text-gray-600 mb-2">No milestones defined yet</p>
          <p className="text-sm text-gray-500">Click "Add Milestone" to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {milestones.map((milestone) => {
            const overdue = isOverdue(milestone);

            return (
              <div
                key={milestone.id}
                className={`border-2 rounded-lg p-4 transition-all ${
                  milestone.isCompleted
                    ? 'border-green-200 bg-green-50'
                    : overdue
                    ? 'border-red-300 bg-red-50'
                    : milestone.isCritical
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => toggleComplete(milestone)}
                      className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        milestone.isCompleted
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {milestone.isCompleted && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className={`font-bold ${milestone.isCompleted ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                          {milestone.milestoneName}
                        </h4>
                        {milestone.isCritical && !milestone.isCompleted && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full border border-red-300">
                            CRITICAL
                          </span>
                        )}
                        {overdue && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full border border-orange-300">
                            OVERDUE
                          </span>
                        )}
                      </div>

                      {milestone.description && (
                        <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        {milestone.targetDate && (
                          <div>
                            <p className="text-gray-600">Target Date</p>
                            <p className={`font-semibold ${overdue ? 'text-red-600' : 'text-gray-900'}`}>
                              {new Date(milestone.targetDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {milestone.actualDate && (
                          <div>
                            <p className="text-gray-600">Actual Date</p>
                            <p className="font-semibold text-green-700">
                              {new Date(milestone.actualDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {milestone.dependencies.length > 0 && (
                          <div>
                            <p className="text-gray-600">Dependencies</p>
                            <p className="font-semibold text-gray-900">
                              {milestone.dependencies.length} milestone(s)
                            </p>
                          </div>
                        )}
                      </div>

                      {milestone.notes && (
                        <div className="mt-3 p-2 bg-white rounded border border-gray-200">
                          <p className="text-xs text-gray-700">{milestone.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleOpenModal(milestone)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(milestone.id)}
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
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Milestone Name *
              </label>
              <input
                type="text"
                required
                value={formData.milestoneName}
                onChange={(e) => setFormData({ ...formData, milestoneName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Foundation Inspection Complete"
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
                placeholder="Brief description of the milestone"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Date *
              </label>
              <input
                type="date"
                required
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actual Date
              </label>
              <input
                type="date"
                value={formData.actualDate}
                onChange={(e) => setFormData({ ...formData, actualDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2 space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isCompleted}
                  onChange={(e) => setFormData({ ...formData, isCompleted: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Mark as completed</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isCritical}
                  onChange={(e) => setFormData({ ...formData, isCritical: e.target.checked })}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Mark as critical (high priority)
                </span>
              </label>
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
              {editingMilestone ? 'Update Milestone' : 'Add Milestone'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CriticalMilestones;

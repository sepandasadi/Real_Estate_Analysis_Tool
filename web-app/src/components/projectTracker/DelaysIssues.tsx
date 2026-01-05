/**
 * Section 5: Delays & Issues Tracker
 * Document delays with cost and time impact
 */

import React, { useState } from 'react';
import { ProjectDelay, IssueStatus } from '../../types/projectTracker';
import Modal from './Modal';

interface DelaysIssuesProps {
  delays: ProjectDelay[];
  onAdd: (delay: Omit<ProjectDelay, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<ProjectDelay>) => void;
  onDelete: (id: string) => void;
}

const DelaysIssues: React.FC<DelaysIssuesProps> = ({
  delays,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDelay, setEditingDelay] = useState<ProjectDelay | null>(null);
  const [formData, setFormData] = useState<Omit<ProjectDelay, 'id'>>({
    issueTitle: '',
    description: '',
    category: '',
    reportedDate: '',
    resolvedDate: '',
    daysDelayed: 0,
    costImpact: 0,
    responsibleParty: '',
    status: 'open',
    resolutionNotes: '',
  });

  const handleOpenModal = (delay?: ProjectDelay) => {
    if (delay) {
      setEditingDelay(delay);
      setFormData(delay);
    } else {
      setEditingDelay(null);
      setFormData({
        issueTitle: '',
        description: '',
        category: '',
        reportedDate: new Date().toISOString().split('T')[0],
        resolvedDate: '',
        daysDelayed: 0,
        costImpact: 0,
        responsibleParty: '',
        status: 'open',
        resolutionNotes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDelay(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDelay) {
      onUpdate(editingDelay.id, formData);
    } else {
      onAdd(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      onDelete(id);
    }
  };

  const getStatusColor = (status: IssueStatus) => {
    switch (status) {
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'weather':
        return '🌧️';
      case 'contractor':
        return '👷';
      case 'materials':
        return '📦';
      case 'permits':
        return '📋';
      case 'inspection':
        return '🔍';
      default:
        return '⚠️';
    }
  };

  const totalCostImpact = delays.reduce((sum, d) => sum + d.costImpact, 0);
  const totalDaysDelayed = delays.reduce((sum, d) => sum + d.daysDelayed, 0);
  const openCount = delays.filter(d => d.status === 'open').length;
  const resolvedCount = delays.filter(d => d.status === 'resolved' || d.status === 'closed').length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Delays & Issues Tracker</h3>
          <p className="text-sm text-gray-600">Document and track project delays and issues</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Issue
        </button>
      </div>

      {/* Summary Cards */}
      {delays.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-sm text-red-700 mb-1">Open Issues</p>
            <p className="text-2xl font-bold text-red-900">{openCount}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-700 mb-1">Resolved</p>
            <p className="text-2xl font-bold text-green-900">{resolvedCount}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-sm text-orange-700 mb-1">Total Days Delayed</p>
            <p className="text-2xl font-bold text-orange-900">{totalDaysDelayed}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-700 mb-1">Cost Impact</p>
            <p className="text-2xl font-bold text-purple-900">${totalCostImpact.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Issues List */}
      {delays.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-gray-600 mb-2">No delays or issues reported</p>
          <p className="text-sm text-gray-500">Click "Add Issue" to document a delay</p>
        </div>
      ) : (
        <div className="space-y-3">
          {delays.map((delay) => (
            <div
              key={delay.id}
              className={`border-2 rounded-lg p-4 transition-all ${
                delay.status === 'open'
                  ? 'border-red-300 bg-red-50'
                  : delay.status === 'in-progress'
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl mt-1">{getCategoryIcon(delay.category)}</span>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-gray-900">{delay.issueTitle}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(delay.status)}`}>
                        {delay.status.replace('-', ' ').toUpperCase()}
                      </span>
                      {delay.category && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                          {delay.category}
                        </span>
                      )}
                    </div>

                    {delay.description && (
                      <p className="text-sm text-gray-600 mb-3">{delay.description}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-gray-600">Reported</p>
                        <p className="font-semibold text-gray-900">
                          {delay.reportedDate ? new Date(delay.reportedDate).toLocaleDateString() : '-'}
                        </p>
                      </div>
                      {delay.resolvedDate && (
                        <div>
                          <p className="text-gray-600">Resolved</p>
                          <p className="font-semibold text-green-700">
                            {new Date(delay.resolvedDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-600">Days Delayed</p>
                        <p className="font-semibold text-orange-700">{delay.daysDelayed} days</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Cost Impact</p>
                        <p className="font-semibold text-red-700">${delay.costImpact.toLocaleString()}</p>
                      </div>
                    </div>

                    {delay.responsibleParty && (
                      <div className="mb-2">
                        <span className="text-xs text-gray-600">Responsible: </span>
                        <span className="text-xs font-medium text-gray-900">{delay.responsibleParty}</span>
                      </div>
                    )}

                    {delay.resolutionNotes && (
                      <div className="mt-3 p-2 bg-white rounded border border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Resolution Notes:</p>
                        <p className="text-xs text-gray-700">{delay.resolutionNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleOpenModal(delay)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(delay.id)}
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
        title={editingDelay ? 'Edit Issue/Delay' : 'Add Issue/Delay'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Title *
              </label>
              <input
                type="text"
                required
                value={formData.issueTitle}
                onChange={(e) => setFormData({ ...formData, issueTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Rain delayed foundation work"
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
                placeholder="Detailed description of the issue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select category...</option>
                <option value="Weather">Weather</option>
                <option value="Contractor">Contractor</option>
                <option value="Materials">Materials</option>
                <option value="Permits">Permits</option>
                <option value="Inspection">Inspection</option>
                <option value="Design">Design</option>
                <option value="Budget">Budget</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as IssueStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reported Date *
              </label>
              <input
                type="date"
                required
                value={formData.reportedDate}
                onChange={(e) => setFormData({ ...formData, reportedDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resolved Date
              </label>
              <input
                type="date"
                value={formData.resolvedDate}
                onChange={(e) => setFormData({ ...formData, resolvedDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Days Delayed *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.daysDelayed}
                onChange={(e) => setFormData({ ...formData, daysDelayed: parseInt(e.target.value) || 0 })}
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
                min="0"
                step="0.01"
                value={formData.costImpact}
                onChange={(e) => setFormData({ ...formData, costImpact: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsible Party
              </label>
              <input
                type="text"
                value={formData.responsibleParty}
                onChange={(e) => setFormData({ ...formData, responsibleParty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Who is responsible for this issue?"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resolution Notes
              </label>
              <textarea
                value={formData.resolutionNotes}
                onChange={(e) => setFormData({ ...formData, resolutionNotes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="How was this issue resolved?"
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
              {editingDelay ? 'Update Issue' : 'Add Issue'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DelaysIssues;

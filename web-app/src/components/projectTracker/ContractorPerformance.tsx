/**
 * Section 6: Contractor Performance Tracker
 * Rate contractors on quality, timeliness, budget, and communication
 */

import React, { useState } from 'react';
import { ContractorPerformance } from '../../types/projectTracker';
import Modal from './Modal';

interface ContractorPerformanceProps {
  contractors: ContractorPerformance[];
  onAdd: (contractor: Omit<ContractorPerformance, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<ContractorPerformance>) => void;
  onDelete: (id: string) => void;
}

const ContractorPerformanceTracker: React.FC<ContractorPerformanceProps> = ({
  contractors,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<ContractorPerformance | null>(null);
  const [formData, setFormData] = useState<Omit<ContractorPerformance, 'id'>>({
    contractorName: '',
    company: '',
    contact: '',
    specialty: '',
    projectPhase: '',
    qualityRating: 0,
    timelinessRating: 0,
    budgetAdherenceRating: 0,
    communicationRating: 0,
    overallRating: 0,
    contractAmount: 0,
    amountPaid: 0,
    wouldRecommend: false,
    notes: '',
  });

  const handleOpenModal = (contractor?: ContractorPerformance) => {
    if (contractor) {
      setEditingContractor(contractor);
      setFormData(contractor);
    } else {
      setEditingContractor(null);
      setFormData({
        contractorName: '',
        company: '',
        contact: '',
        specialty: '',
        projectPhase: '',
        qualityRating: 0,
        timelinessRating: 0,
        budgetAdherenceRating: 0,
        communicationRating: 0,
        overallRating: 0,
        contractAmount: 0,
        amountPaid: 0,
        wouldRecommend: false,
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContractor(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Calculate overall rating
    const overallRating = (
      formData.qualityRating +
      formData.timelinessRating +
      formData.budgetAdherenceRating +
      formData.communicationRating
    ) / 4;

    if (editingContractor) {
      onUpdate(editingContractor.id, { ...formData, overallRating });
    } else {
      onAdd({ ...formData, overallRating });
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this contractor?')) {
      onDelete(id);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    if (rating >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const totalContract = contractors.reduce((sum, c) => sum + c.contractAmount, 0);
  const totalPaid = contractors.reduce((sum, c) => sum + c.amountPaid, 0);
  const recommendedCount = contractors.filter(c => c.wouldRecommend).length;
  const avgRating = contractors.length > 0
    ? contractors.reduce((sum, c) => sum + c.overallRating, 0) / contractors.length
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Contractor Performance Tracker</h3>
          <p className="text-sm text-gray-600">Rate and track contractor performance</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Contractor
        </button>
      </div>

      {/* Summary Cards */}
      {contractors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Total Contractors</p>
            <p className="text-2xl font-bold text-blue-900">{contractors.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-yellow-700 mb-1">Avg Rating</p>
            <p className="text-2xl font-bold text-yellow-900">{avgRating.toFixed(1)} / 5</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-700 mb-1">Recommended</p>
            <p className="text-2xl font-bold text-green-900">{recommendedCount}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-700 mb-1">Total Paid</p>
            <p className="text-2xl font-bold text-purple-900">${totalPaid.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Contractors Grid */}
      {contractors.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-600 mb-2">No contractors tracked yet</p>
          <p className="text-sm text-gray-500">Click "Add Contractor" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contractors.map((contractor) => {
            const balance = contractor.contractAmount - contractor.amountPaid;

            return (
              <div
                key={contractor.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900">{contractor.contractorName}</h4>
                    {contractor.company && (
                      <p className="text-sm text-gray-600">{contractor.company}</p>
                    )}
                    {contractor.specialty && (
                      <p className="text-xs text-gray-500">{contractor.specialty}</p>
                    )}
                  </div>
                  {contractor.wouldRecommend && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-300">
                      ✓ RECOMMENDED
                    </span>
                  )}
                </div>

                {/* Overall Rating */}
                <div className="mb-3 pb-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Overall Rating</span>
                    <div className="flex items-center gap-2">
                      {renderStars(Math.round(contractor.overallRating))}
                      <span className={`text-lg font-bold ${getRatingColor(contractor.overallRating)}`}>
                        {contractor.overallRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Individual Ratings */}
                <div className="space-y-2 mb-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Quality:</span>
                    <div className="flex items-center gap-2">
                      {renderStars(contractor.qualityRating)}
                      <span className="font-medium text-gray-900 w-8">{contractor.qualityRating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Timeliness:</span>
                    <div className="flex items-center gap-2">
                      {renderStars(contractor.timelinessRating)}
                      <span className="font-medium text-gray-900 w-8">{contractor.timelinessRating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Budget:</span>
                    <div className="flex items-center gap-2">
                      {renderStars(contractor.budgetAdherenceRating)}
                      <span className="font-medium text-gray-900 w-8">{contractor.budgetAdherenceRating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Communication:</span>
                    <div className="flex items-center gap-2">
                      {renderStars(contractor.communicationRating)}
                      <span className="font-medium text-gray-900 w-8">{contractor.communicationRating}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="space-y-1 text-sm mb-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contract Amount:</span>
                    <span className="font-semibold text-gray-900">${contractor.contractAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-semibold text-green-700">${contractor.amountPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Balance:</span>
                    <span className={`font-semibold ${balance > 0 ? 'text-orange-700' : 'text-gray-900'}`}>
                      ${balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {contractor.notes && (
                  <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-700">
                    {contractor.notes}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleOpenModal(contractor)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(contractor.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    Delete
                  </button>
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
        title={editingContractor ? 'Edit Contractor' : 'Add Contractor'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contractor Name *
              </label>
              <input
                type="text"
                required
                value={formData.contractorName}
                onChange={(e) => setFormData({ ...formData, contractorName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact
              </label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Phone or email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialty
              </label>
              <input
                type="text"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Plumbing, Electrical"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Phase
              </label>
              <input
                type="text"
                value={formData.projectPhase}
                onChange={(e) => setFormData({ ...formData, projectPhase: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Which phase did they work on?"
              />
            </div>

            {/* Ratings */}
            <div className="md:col-span-2 pt-3 border-t border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Performance Ratings (1-5)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quality Rating *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.qualityRating}
                    onChange={(e) => setFormData({ ...formData, qualityRating: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timeliness Rating *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.timelinessRating}
                    onChange={(e) => setFormData({ ...formData, timelinessRating: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Adherence *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.budgetAdherenceRating}
                    onChange={(e) => setFormData({ ...formData, budgetAdherenceRating: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Communication *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.communicationRating}
                    onChange={(e) => setFormData({ ...formData, communicationRating: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Financial */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Amount *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.contractAmount}
                onChange={(e) => setFormData({ ...formData, contractAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Paid
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amountPaid}
                onChange={(e) => setFormData({ ...formData, amountPaid: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.wouldRecommend}
                  onChange={(e) => setFormData({ ...formData, wouldRecommend: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Would recommend this contractor
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
                placeholder="Additional notes about this contractor"
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
              {editingContractor ? 'Update Contractor' : 'Add Contractor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ContractorPerformanceTracker;

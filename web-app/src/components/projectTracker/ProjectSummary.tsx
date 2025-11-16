/**
 * Section 8: Project Summary Dashboard
 * Auto-calculated metrics from all sections
 */

import React from 'react';
import { ProjectSummary as ProjectSummaryType } from '../../types/projectTracker';

interface ProjectSummaryProps {
  summary: ProjectSummaryType | undefined;
}

const ProjectSummary: React.FC<ProjectSummaryProps> = ({ summary }) => {
  if (!summary) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Project Summary Dashboard</h3>
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-600 mb-2">No project data available</p>
          <p className="text-sm text-gray-500">Add renovation phases to see project summary</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (isGood: boolean, label: string) => {
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
        isGood ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {label}
      </span>
    );
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-600';
    if (variance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Project Summary Dashboard</h3>
        <p className="text-sm text-gray-600">Auto-calculated metrics from all project sections</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`rounded-lg p-6 border-2 ${
          summary.isOnBudget ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold text-gray-800">Budget Status</h4>
            {getStatusBadge(summary.isOnBudget, summary.isOnBudget ? 'On Budget' : 'Over Budget')}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Budget:</span>
              <span className="font-semibold text-gray-900">${summary.totalBudget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Actual Cost:</span>
              <span className="font-semibold text-gray-900">${summary.totalActualCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Variance:</span>
              <span className={`font-bold ${getVarianceColor(summary.budgetVariance)}`}>
                {summary.budgetVariance >= 0 ? '+' : '-'}${Math.abs(summary.budgetVariance).toLocaleString()}
                <span className="text-xs ml-1">({Math.abs(summary.budgetVariancePercent).toFixed(1)}%)</span>
              </span>
            </div>
          </div>
        </div>

        <div className={`rounded-lg p-6 border-2 ${
          summary.isOnSchedule ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold text-gray-800">Schedule Status</h4>
            {getStatusBadge(summary.isOnSchedule, summary.isOnSchedule ? 'On Schedule' : 'Delayed')}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Est. Duration:</span>
              <span className="font-semibold text-gray-900">{summary.totalEstimatedDuration} days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Actual Duration:</span>
              <span className="font-semibold text-gray-900">{summary.totalActualDuration} days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Variance:</span>
              <span className={`font-bold ${getVarianceColor(summary.scheduleVariance)}`}>
                {summary.scheduleVariance >= 0 ? '+' : '-'}{Math.abs(summary.scheduleVariance)} days
                <span className="text-xs ml-1">({Math.abs(summary.scheduleVariancePercent).toFixed(1)}%)</span>
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-300">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold text-gray-800">Completion</h4>
            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
              {summary.completionPercent.toFixed(0)}%
            </span>
          </div>
          <div className="space-y-3">
            <div className="w-full bg-blue-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${summary.completionPercent}%` }}
              />
            </div>
            {summary.projectedCompletionDate && (
              <div className="text-sm">
                <span className="text-gray-600">Projected Completion:</span>
                <p className="font-semibold text-gray-900 mt-1">
                  {new Date(summary.projectedCompletionDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-800">Active Issues</span>
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-red-900">{summary.activeIssuesCount}</p>
          <p className="text-xs text-red-700 mt-1">Open or in-progress</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-yellow-800">Pending Permits</span>
            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-yellow-900">{summary.pendingPermitsCount}</p>
          <p className="text-xs text-yellow-700 mt-1">Awaiting approval</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-800">Overdue Tasks</span>
            <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-orange-900">{summary.overdueTasksCount}</p>
          <p className="text-xs text-orange-700 mt-1">Delayed phases</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-800">Change Orders</span>
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-purple-900">${summary.totalChangeOrdersCost.toLocaleString()}</p>
          <p className="text-xs text-purple-700 mt-1">Total cost impact</p>
        </div>
      </div>

      {/* Contractor Performance */}
      {summary.averageContractorRating > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-6 border border-indigo-200 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Average Contractor Rating</h4>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-6 h-6 ${
                        star <= Math.round(summary.averageContractorRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-3xl font-bold text-indigo-900">
                  {summary.averageContractorRating.toFixed(1)}
                </span>
                <span className="text-sm text-indigo-700">/ 5.0</span>
              </div>
            </div>
            <svg className="w-16 h-16 text-indigo-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
        </div>
      )}

      {/* Alerts & Recommendations */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Project Insights & Alerts
        </h4>
        <ul className="space-y-2 text-sm">
          {!summary.isOnBudget && (
            <li className="flex items-start gap-2 text-red-700">
              <span className="text-red-600 mt-0.5">⚠</span>
              <span>
                <strong>Budget Alert:</strong> Project is ${Math.abs(summary.budgetVariance).toLocaleString()} over budget
                ({Math.abs(summary.budgetVariancePercent).toFixed(1)}%). Review costs and consider adjustments.
              </span>
            </li>
          )}
          {!summary.isOnSchedule && (
            <li className="flex items-start gap-2 text-orange-700">
              <span className="text-orange-600 mt-0.5">⚠</span>
              <span>
                <strong>Schedule Alert:</strong> Project is {Math.abs(summary.scheduleVariance)} days behind schedule
                ({Math.abs(summary.scheduleVariancePercent).toFixed(1)}%). Review timeline and resource allocation.
              </span>
            </li>
          )}
          {summary.activeIssuesCount > 0 && (
            <li className="flex items-start gap-2 text-red-700">
              <span className="text-red-600 mt-0.5">•</span>
              <span>
                <strong>Active Issues:</strong> {summary.activeIssuesCount} open issue(s) require attention.
              </span>
            </li>
          )}
          {summary.pendingPermitsCount > 0 && (
            <li className="flex items-start gap-2 text-yellow-700">
              <span className="text-yellow-600 mt-0.5">•</span>
              <span>
                <strong>Pending Permits:</strong> {summary.pendingPermitsCount} permit(s) awaiting approval.
              </span>
            </li>
          )}
          {summary.overdueTasksCount > 0 && (
            <li className="flex items-start gap-2 text-orange-700">
              <span className="text-orange-600 mt-0.5">•</span>
              <span>
                <strong>Overdue Tasks:</strong> {summary.overdueTasksCount} phase(s) are delayed.
              </span>
            </li>
          )}
          {summary.isOnBudget && summary.isOnSchedule && summary.activeIssuesCount === 0 && (
            <li className="flex items-start gap-2 text-green-700">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>
                <strong>Project Health:</strong> Project is on track! Budget and schedule are within targets with no active issues.
              </span>
            </li>
          )}
          {summary.completionPercent >= 75 && (
            <li className="flex items-start gap-2 text-blue-700">
              <span className="text-blue-600 mt-0.5">ℹ</span>
              <span>
                <strong>Nearing Completion:</strong> Project is {summary.completionPercent.toFixed(0)}% complete.
                Begin planning for final inspections and closeout.
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ProjectSummary;

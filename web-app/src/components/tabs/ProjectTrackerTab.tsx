import React from 'react';
import { useProjectTracker } from '../../hooks/useProjectTracker';
import EmptyState from '../projectTracker/EmptyState';
import RenovationTimeline from '../projectTracker/RenovationTimeline';
import PermitTracker from '../projectTracker/PermitTracker';
import MaterialOrders from '../projectTracker/MaterialOrders';
import CriticalMilestones from '../projectTracker/CriticalMilestones';
import DelaysIssues from '../projectTracker/DelaysIssues';
import ContractorPerformance from '../projectTracker/ContractorPerformance';
import ChangeOrders from '../projectTracker/ChangeOrders';
import ProjectSummary from '../projectTracker/ProjectSummary';

interface ProjectTrackerTabProps {
  propertyId: string;
}

const ProjectTrackerTab: React.FC<ProjectTrackerTabProps> = ({ propertyId }) => {
  const [showTimeline, setShowTimeline] = React.useState(false);

  const {
    data,
    summary,
    hasData,
    addRenovationPhase,
    updateRenovationPhase,
    deleteRenovationPhase,
    addPermit,
    updatePermit,
    deletePermit,
    addMaterialOrder,
    updateMaterialOrder,
    deleteMaterialOrder,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    addDelay,
    updateDelay,
    deleteDelay,
    addContractor,
    updateContractor,
    deleteContractor,
    addChangeOrder,
    updateChangeOrder,
    deleteChangeOrder,
  } = useProjectTracker(propertyId);

  const handleGetStarted = () => {
    setShowTimeline(true);
  };

  // Show empty state if no data - clicking "Get Started" will show the first section
  if (!hasData) {
    return (
      <div className="space-y-6">
        <EmptyState onGetStarted={handleGetStarted} />

        {/* Show Renovation Timeline section after clicking Get Started */}
        {showTimeline && (
          <RenovationTimeline
            phases={data.renovationPhases}
            onAdd={addRenovationPhase}
            onUpdate={updateRenovationPhase}
            onDelete={deleteRenovationPhase}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Summary Dashboard - Always at top */}
      <ProjectSummary summary={summary} />

      {/* Section 1: Renovation Timeline & Budget */}
      <RenovationTimeline
        phases={data.renovationPhases}
        onAdd={addRenovationPhase}
        onUpdate={updateRenovationPhase}
        onDelete={deleteRenovationPhase}
      />

      {/* Section 2: Inspection & Permit Tracker */}
      <PermitTracker
        permits={data.permits}
        onAdd={addPermit}
        onUpdate={updatePermit}
        onDelete={deletePermit}
      />

      {/* Section 3: Material & Vendor Tracking */}
      <MaterialOrders
        orders={data.materialOrders}
        onAdd={addMaterialOrder}
        onUpdate={updateMaterialOrder}
        onDelete={deleteMaterialOrder}
      />

      {/* Section 4: Critical Milestones & Alerts */}
      <CriticalMilestones
        milestones={data.criticalMilestones}
        onAdd={addMilestone}
        onUpdate={updateMilestone}
        onDelete={deleteMilestone}
      />

      {/* Section 5: Delays & Issues Tracker */}
      <DelaysIssues
        delays={data.delays}
        onAdd={addDelay}
        onUpdate={updateDelay}
        onDelete={deleteDelay}
      />

      {/* Section 6: Contractor Performance Tracker */}
      <ContractorPerformance
        contractors={data.contractorPerformance}
        onAdd={addContractor}
        onUpdate={updateContractor}
        onDelete={deleteContractor}
      />

      {/* Section 7: Change Orders Tracker */}
      <ChangeOrders
        changeOrders={data.changeOrders}
        onAdd={addChangeOrder}
        onUpdate={updateChangeOrder}
        onDelete={deleteChangeOrder}
      />
    </div>
  );
};

export default ProjectTrackerTab;

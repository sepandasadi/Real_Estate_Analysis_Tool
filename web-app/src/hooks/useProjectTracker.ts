/**
 * Custom hook for managing Project Tracker data
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ProjectTrackerData,
  RenovationPhase,
  Permit,
  MaterialOrder,
  CriticalMilestone,
  ProjectDelay,
  ContractorPerformance,
  ChangeOrder,
  ProjectSummary,
} from '../types/projectTracker';
import {
  saveProjectTrackerData,
  loadProjectTrackerData,
} from '../utils/localStorage';
import { calculateProjectSummary, generateId } from '../utils/calculations';

export const useProjectTracker = (propertyId: string) => {
  const [data, setData] = useState<ProjectTrackerData>({
    propertyId,
    renovationPhases: [],
    permits: [],
    materialOrders: [],
    criticalMilestones: [],
    delays: [],
    contractorPerformance: [],
    changeOrders: [],
    lastUpdated: new Date().toISOString(),
  });

  const [summary, setSummary] = useState<ProjectSummary | undefined>(undefined);

  // Load data from IndexedDB on mount
  useEffect(() => {
    if (propertyId) {
      loadProjectTrackerData(propertyId).then((loadedData) => {
        if (loadedData) {
          setData(loadedData);
        }
      });
    }
  }, [propertyId]);

  // Calculate summary whenever data changes
  useEffect(() => {
    const calculatedSummary = calculateProjectSummary(data);
    setSummary(calculatedSummary);
  }, [data]);

  // Save data to IndexedDB whenever it changes
  useEffect(() => {
    if (propertyId && data.renovationPhases.length > 0) {
      saveProjectTrackerData(propertyId, { ...data, summary }).catch((error) => {
        console.error('Failed to save project tracker data:', error);
      });
    }
  }, [propertyId, data, summary]);

  // Renovation Phases CRUD
  const addRenovationPhase = useCallback((phase: Omit<RenovationPhase, 'id'>) => {
    const newPhase: RenovationPhase = { ...phase, id: generateId() };
    setData((prev) => ({
      ...prev,
      renovationPhases: [...prev.renovationPhases, newPhase],
    }));
  }, []);

  const updateRenovationPhase = useCallback((id: string, updates: Partial<RenovationPhase>) => {
    setData((prev) => ({
      ...prev,
      renovationPhases: prev.renovationPhases.map((phase) =>
        phase.id === id ? { ...phase, ...updates } : phase
      ),
    }));
  }, []);

  const deleteRenovationPhase = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      renovationPhases: prev.renovationPhases.filter((phase) => phase.id !== id),
    }));
  }, []);

  // Permits CRUD
  const addPermit = useCallback((permit: Omit<Permit, 'id'>) => {
    const newPermit: Permit = { ...permit, id: generateId() };
    setData((prev) => ({
      ...prev,
      permits: [...prev.permits, newPermit],
    }));
  }, []);

  const updatePermit = useCallback((id: string, updates: Partial<Permit>) => {
    setData((prev) => ({
      ...prev,
      permits: prev.permits.map((permit) =>
        permit.id === id ? { ...permit, ...updates } : permit
      ),
    }));
  }, []);

  const deletePermit = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      permits: prev.permits.filter((permit) => permit.id !== id),
    }));
  }, []);

  // Material Orders CRUD
  const addMaterialOrder = useCallback((order: Omit<MaterialOrder, 'id'>) => {
    const newOrder: MaterialOrder = { ...order, id: generateId() };
    setData((prev) => ({
      ...prev,
      materialOrders: [...prev.materialOrders, newOrder],
    }));
  }, []);

  const updateMaterialOrder = useCallback((id: string, updates: Partial<MaterialOrder>) => {
    setData((prev) => ({
      ...prev,
      materialOrders: prev.materialOrders.map((order) =>
        order.id === id ? { ...order, ...updates } : order
      ),
    }));
  }, []);

  const deleteMaterialOrder = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      materialOrders: prev.materialOrders.filter((order) => order.id !== id),
    }));
  }, []);

  // Critical Milestones CRUD
  const addMilestone = useCallback((milestone: Omit<CriticalMilestone, 'id'>) => {
    const newMilestone: CriticalMilestone = { ...milestone, id: generateId() };
    setData((prev) => ({
      ...prev,
      criticalMilestones: [...prev.criticalMilestones, newMilestone],
    }));
  }, []);

  const updateMilestone = useCallback((id: string, updates: Partial<CriticalMilestone>) => {
    setData((prev) => ({
      ...prev,
      criticalMilestones: prev.criticalMilestones.map((milestone) =>
        milestone.id === id ? { ...milestone, ...updates } : milestone
      ),
    }));
  }, []);

  const deleteMilestone = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      criticalMilestones: prev.criticalMilestones.filter((milestone) => milestone.id !== id),
    }));
  }, []);

  // Delays CRUD
  const addDelay = useCallback((delay: Omit<ProjectDelay, 'id'>) => {
    const newDelay: ProjectDelay = { ...delay, id: generateId() };
    setData((prev) => ({
      ...prev,
      delays: [...prev.delays, newDelay],
    }));
  }, []);

  const updateDelay = useCallback((id: string, updates: Partial<ProjectDelay>) => {
    setData((prev) => ({
      ...prev,
      delays: prev.delays.map((delay) =>
        delay.id === id ? { ...delay, ...updates } : delay
      ),
    }));
  }, []);

  const deleteDelay = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      delays: prev.delays.filter((delay) => delay.id !== id),
    }));
  }, []);

  // Contractor Performance CRUD
  const addContractor = useCallback((contractor: Omit<ContractorPerformance, 'id'>) => {
    const newContractor: ContractorPerformance = { ...contractor, id: generateId() };
    setData((prev) => ({
      ...prev,
      contractorPerformance: [...prev.contractorPerformance, newContractor],
    }));
  }, []);

  const updateContractor = useCallback((id: string, updates: Partial<ContractorPerformance>) => {
    setData((prev) => ({
      ...prev,
      contractorPerformance: prev.contractorPerformance.map((contractor) =>
        contractor.id === id ? { ...contractor, ...updates } : contractor
      ),
    }));
  }, []);

  const deleteContractor = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      contractorPerformance: prev.contractorPerformance.filter((contractor) => contractor.id !== id),
    }));
  }, []);

  // Change Orders CRUD
  const addChangeOrder = useCallback((changeOrder: Omit<ChangeOrder, 'id'>) => {
    const newChangeOrder: ChangeOrder = { ...changeOrder, id: generateId() };
    setData((prev) => ({
      ...prev,
      changeOrders: [...prev.changeOrders, newChangeOrder],
    }));
  }, []);

  const updateChangeOrder = useCallback((id: string, updates: Partial<ChangeOrder>) => {
    setData((prev) => ({
      ...prev,
      changeOrders: prev.changeOrders.map((changeOrder) =>
        changeOrder.id === id ? { ...changeOrder, ...updates } : changeOrder
      ),
    }));
  }, []);

  const deleteChangeOrder = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      changeOrders: prev.changeOrders.filter((changeOrder) => changeOrder.id !== id),
    }));
  }, []);

  const hasData = data.renovationPhases.length > 0;

  return {
    data,
    summary,
    hasData,
    // Renovation Phases
    addRenovationPhase,
    updateRenovationPhase,
    deleteRenovationPhase,
    // Permits
    addPermit,
    updatePermit,
    deletePermit,
    // Material Orders
    addMaterialOrder,
    updateMaterialOrder,
    deleteMaterialOrder,
    // Milestones
    addMilestone,
    updateMilestone,
    deleteMilestone,
    // Delays
    addDelay,
    updateDelay,
    deleteDelay,
    // Contractors
    addContractor,
    updateContractor,
    deleteContractor,
    // Change Orders
    addChangeOrder,
    updateChangeOrder,
    deleteChangeOrder,
  };
};

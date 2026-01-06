/**
 * IndexedDB Database using Dexie.js
 * Provides structured storage for property analyses, comps, and user data
 */

import Dexie, { Table } from 'dexie';
import { PropertyFormData } from '../types/property';
import { ProjectTrackerData } from '../types/projectTracker';
import { PartnershipManagementData } from '../types/partnershipManagement';

// ============================================
// DATABASE SCHEMA INTERFACES
// ============================================

export interface PropertyAnalysis {
  id?: number;
  propertyId: string;
  formData: PropertyFormData;
  analysisResults: any; // Full analysis results from API
  timestamp: string;
  displayAddress: string;
}

export interface ProjectTracker {
  id?: number;
  propertyId: string;
  data: ProjectTrackerData;
  lastUpdated: string;
}

export interface PartnershipData {
  id?: number;
  propertyId: string;
  data: PartnershipManagementData;
  lastUpdated: string;
}

export interface PropertyHistory {
  id?: number;
  propertyId: string;
  formData: PropertyFormData;
  timestamp: string;
  displayAddress: string;
}

// ============================================
// DATABASE CLASS
// ============================================

export class RealEstateDB extends Dexie {
  // Tables
  propertyAnalyses!: Table<PropertyAnalysis, number>;
  projectTrackers!: Table<ProjectTracker, number>;
  partnershipData!: Table<PartnershipData, number>;
  propertyHistory!: Table<PropertyHistory, number>;

  constructor() {
    super('RealEstateAnalysisDB');

    // Define schema
    this.version(1).stores({
      propertyAnalyses: '++id, propertyId, timestamp, displayAddress',
      projectTrackers: '++id, propertyId, lastUpdated',
      partnershipData: '++id, propertyId, lastUpdated',
      propertyHistory: '++id, propertyId, timestamp, displayAddress',
    });
  }
}

// Create database instance
export const db = new RealEstateDB();

// ============================================
// PROPERTY ANALYSIS FUNCTIONS
// ============================================

export async function savePropertyAnalysis(
  propertyId: string,
  formData: PropertyFormData,
  analysisResults: any
): Promise<number> {
  const displayAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`;

  // Check if analysis already exists for this property
  const existing = await db.propertyAnalyses
    .where('propertyId')
    .equals(propertyId)
    .first();

  if (existing) {
    // Update existing
    await db.propertyAnalyses.update(existing.id!, {
      formData,
      analysisResults,
      timestamp: new Date().toISOString(),
      displayAddress,
    });
    return existing.id!;
  } else {
    // Create new
    return await db.propertyAnalyses.add({
      propertyId,
      formData,
      analysisResults,
      timestamp: new Date().toISOString(),
      displayAddress,
    });
  }
}

export async function getPropertyAnalysis(propertyId: string): Promise<PropertyAnalysis | undefined> {
  return await db.propertyAnalyses.where('propertyId').equals(propertyId).first();
}

export async function getAllPropertyAnalyses(): Promise<PropertyAnalysis[]> {
  return await db.propertyAnalyses.orderBy('timestamp').reverse().toArray();
}

export async function deletePropertyAnalysis(propertyId: string): Promise<void> {
  await db.propertyAnalyses.where('propertyId').equals(propertyId).delete();
}

// ============================================
// PROJECT TRACKER FUNCTIONS
// ============================================

export async function saveProjectTracker(
  propertyId: string,
  data: ProjectTrackerData
): Promise<number> {
  const existing = await db.projectTrackers.where('propertyId').equals(propertyId).first();

  if (existing) {
    await db.projectTrackers.update(existing.id!, {
      data,
      lastUpdated: new Date().toISOString(),
    });
    return existing.id!;
  } else {
    return await db.projectTrackers.add({
      propertyId,
      data,
      lastUpdated: new Date().toISOString(),
    });
  }
}

export async function getProjectTracker(propertyId: string): Promise<ProjectTrackerData | null> {
  const tracker = await db.projectTrackers.where('propertyId').equals(propertyId).first();
  return tracker ? tracker.data : null;
}

export async function deleteProjectTracker(propertyId: string): Promise<void> {
  await db.projectTrackers.where('propertyId').equals(propertyId).delete();
}

// ============================================
// PARTNERSHIP DATA FUNCTIONS
// ============================================

export async function savePartnershipDataDB(
  propertyId: string,
  data: PartnershipManagementData
): Promise<number> {
  const existing = await db.partnershipData.where('propertyId').equals(propertyId).first();

  if (existing) {
    await db.partnershipData.update(existing.id!, {
      data,
      lastUpdated: new Date().toISOString(),
    });
    return existing.id!;
  } else {
    return await db.partnershipData.add({
      propertyId,
      data,
      lastUpdated: new Date().toISOString(),
    });
  }
}

export async function getPartnershipDataDB(
  propertyId: string
): Promise<PartnershipManagementData | null> {
  const partnership = await db.partnershipData.where('propertyId').equals(propertyId).first();
  return partnership ? partnership.data : null;
}

export async function deletePartnershipDataDB(propertyId: string): Promise<void> {
  await db.partnershipData.where('propertyId').equals(propertyId).delete();
}

// ============================================
// PROPERTY HISTORY FUNCTIONS
// ============================================

const MAX_HISTORY_ENTRIES = 10;

export async function savePropertyToHistoryDB(formData: PropertyFormData): Promise<number> {
  const displayAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`;
  const propertyId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Check if this address already exists in history
  const existing = await db.propertyHistory
    .where('displayAddress')
    .equalsIgnoreCase(displayAddress)
    .first();

  if (existing) {
    // Update existing entry
    await db.propertyHistory.update(existing.id!, {
      formData,
      timestamp: new Date().toISOString(),
    });
    return existing.id!;
  } else {
    // Add new entry
    const id = await db.propertyHistory.add({
      propertyId,
      formData,
      timestamp: new Date().toISOString(),
      displayAddress,
    });

    // Keep only the most recent entries
    const allHistory = await db.propertyHistory.orderBy('timestamp').reverse().toArray();
    if (allHistory.length > MAX_HISTORY_ENTRIES) {
      const toDelete = allHistory.slice(MAX_HISTORY_ENTRIES);
      await Promise.all(toDelete.map((entry) => db.propertyHistory.delete(entry.id!)));
    }

    return id;
  }
}

export async function getPropertyHistoryDB(): Promise<PropertyHistory[]> {
  return await db.propertyHistory.orderBy('timestamp').reverse().toArray();
}

export async function removePropertyFromHistoryDB(id: number): Promise<void> {
  await db.propertyHistory.delete(id);
}

export async function clearPropertyHistoryDB(): Promise<void> {
  await db.propertyHistory.clear();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export async function clearAllPropertyData(propertyId: string): Promise<void> {
  await Promise.all([
    deletePropertyAnalysis(propertyId),
    deleteProjectTracker(propertyId),
    deletePartnershipDataDB(propertyId),
  ]);
}

export async function getAllStoredPropertyIds(): Promise<string[]> {
  const propertyIds = new Set<string>();

  const [analyses, trackers, partnerships] = await Promise.all([
    db.propertyAnalyses.toArray(),
    db.projectTrackers.toArray(),
    db.partnershipData.toArray(),
  ]);

  analyses.forEach((a) => propertyIds.add(a.propertyId));
  trackers.forEach((t) => propertyIds.add(t.propertyId));
  partnerships.forEach((p) => propertyIds.add(p.propertyId));

  return Array.from(propertyIds);
}

export async function clearAllStoredData(): Promise<void> {
  await Promise.all([
    db.propertyAnalyses.clear(),
    db.projectTrackers.clear(),
    db.partnershipData.clear(),
    db.propertyHistory.clear(),
  ]);
}

export async function getDatabaseStats(): Promise<{
  analyses: number;
  trackers: number;
  partnerships: number;
  history: number;
}> {
  const [analyses, trackers, partnerships, history] = await Promise.all([
    db.propertyAnalyses.count(),
    db.projectTrackers.count(),
    db.partnershipData.count(),
    db.propertyHistory.count(),
  ]);

  return { analyses, trackers, partnerships, history };
}

// ============================================
// MIGRATION FROM LOCALSTORAGE
// ============================================

export async function migrateFromLocalStorage(): Promise<void> {
  try {
    // Check if migration already done
    const migrationKey = 'indexeddb_migration_complete';
    if (localStorage.getItem(migrationKey) === 'true') {
      console.log('IndexedDB migration already completed');
      return;
    }

    console.log('Starting migration from localStorage to IndexedDB...');

    // Migrate property history
    const historyData = localStorage.getItem('propertySearchHistory');
    if (historyData) {
      const history = JSON.parse(historyData);
      for (const entry of history) {
        await savePropertyToHistoryDB(entry.formData);
      }
      console.log(`Migrated ${history.length} property history entries`);
    }

    // Migrate project tracker data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('projectTracker_')) {
        const propertyId = key.replace('projectTracker_', '');
        const data = localStorage.getItem(key);
        if (data) {
          const trackerData = JSON.parse(data);
          await saveProjectTracker(propertyId, trackerData);
          console.log(`Migrated project tracker for property: ${propertyId}`);
        }
      }
    }

    // Migrate partnership data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('partnershipData_')) {
        const propertyId = key.replace('partnershipData_', '');
        const data = localStorage.getItem(key);
        if (data) {
          const partnershipData = JSON.parse(data);
          await savePartnershipDataDB(propertyId, partnershipData);
          console.log(`Migrated partnership data for property: ${propertyId}`);
        }
      }
    }

    // Mark migration as complete
    localStorage.setItem(migrationKey, 'true');
    console.log('Migration from localStorage to IndexedDB completed successfully!');
  } catch (error) {
    console.error('Error during migration from localStorage:', error);
  }
}

// Auto-run migration on import
migrateFromLocalStorage();

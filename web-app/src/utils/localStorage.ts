/**
 * localStorage utilities for Project Tracker, Partnership Management, and Property History
 *
 * NOTE: This file now uses IndexedDB (via db.ts) as the primary storage mechanism.
 * localStorage is kept as a fallback for older browsers that don't support IndexedDB.
 */

import { ProjectTrackerData } from '../types/projectTracker';
import { PartnershipManagementData } from '../types/partnershipManagement';
import { PropertyFormData } from '../types/property';
import {
  saveProjectTracker as saveProjectTrackerDB,
  getProjectTracker as getProjectTrackerDB,
  deleteProjectTracker as deleteProjectTrackerDB,
  savePartnershipDataDB,
  getPartnershipDataDB,
  deletePartnershipDataDB,
  savePropertyToHistoryDB,
  getPropertyHistoryDB,
  removePropertyFromHistoryDB,
  clearPropertyHistoryDB,
  getAllStoredPropertyIds as getAllStoredPropertyIdsDB,
  clearAllStoredData as clearAllStoredDataDB,
} from './db';

// Storage keys
const PROJECT_TRACKER_KEY_PREFIX = 'projectTracker_';
const PARTNERSHIP_DATA_KEY_PREFIX = 'partnershipData_';
const PROPERTY_HISTORY_KEY = 'propertySearchHistory';

// ============================================
// PROJECT TRACKER STORAGE
// ============================================

export const saveProjectTrackerData = async (propertyId: string, data: ProjectTrackerData): Promise<void> => {
  try {
    // Try IndexedDB first
    await saveProjectTrackerDB(propertyId, data);
  } catch (error) {
    console.warn('IndexedDB failed, falling back to localStorage:', error);
    // Fallback to localStorage
    try {
      const key = `${PROJECT_TRACKER_KEY_PREFIX}${propertyId}`;
      const dataToSave = {
        ...data,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(dataToSave));
    } catch (localStorageError) {
      console.error('Error saving project tracker data:', localStorageError);
    }
  }
};

export const loadProjectTrackerData = async (propertyId: string): Promise<ProjectTrackerData | null> => {
  try {
    // Try IndexedDB first
    const data = await getProjectTrackerDB(propertyId);
    if (data) {
      return data;
    }

    // Fallback to localStorage
    const key = `${PROJECT_TRACKER_KEY_PREFIX}${propertyId}`;
    const localData = localStorage.getItem(key);
    if (localData) {
      return JSON.parse(localData) as ProjectTrackerData;
    }
    return null;
  } catch (error) {
    console.error('Error loading project tracker data:', error);
    return null;
  }
};

export const clearProjectTrackerData = async (propertyId: string): Promise<void> => {
  try {
    // Clear from IndexedDB
    await deleteProjectTrackerDB(propertyId);

    // Also clear from localStorage (fallback)
    const key = `${PROJECT_TRACKER_KEY_PREFIX}${propertyId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing project tracker data:', error);
  }
};

// ============================================
// PARTNERSHIP MANAGEMENT STORAGE
// ============================================

export const savePartnershipData = async (propertyId: string, data: PartnershipManagementData): Promise<void> => {
  try {
    // Try IndexedDB first
    await savePartnershipDataDB(propertyId, data);
  } catch (error) {
    console.warn('IndexedDB failed, falling back to localStorage:', error);
    // Fallback to localStorage
    try {
      const key = `${PARTNERSHIP_DATA_KEY_PREFIX}${propertyId}`;
      const dataToSave = {
        ...data,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(dataToSave));
    } catch (localStorageError) {
      console.error('Error saving partnership data:', localStorageError);
    }
  }
};

export const loadPartnershipData = async (propertyId: string): Promise<PartnershipManagementData | null> => {
  try {
    // Try IndexedDB first
    const data = await getPartnershipDataDB(propertyId);
    if (data) {
      return data;
    }

    // Fallback to localStorage
    const key = `${PARTNERSHIP_DATA_KEY_PREFIX}${propertyId}`;
    const localData = localStorage.getItem(key);
    if (localData) {
      return JSON.parse(localData) as PartnershipManagementData;
    }
    return null;
  } catch (error) {
    console.error('Error loading partnership data:', error);
    return null;
  }
};

export const clearPartnershipData = async (propertyId: string): Promise<void> => {
  try {
    // Clear from IndexedDB
    await deletePartnershipDataDB(propertyId);

    // Also clear from localStorage (fallback)
    const key = `${PARTNERSHIP_DATA_KEY_PREFIX}${propertyId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing partnership data:', error);
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const clearAllPropertyData = async (propertyId: string): Promise<void> => {
  await Promise.all([
    clearProjectTrackerData(propertyId),
    clearPartnershipData(propertyId),
  ]);
};

export const getAllStoredPropertyIds = async (): Promise<string[]> => {
  try {
    // Try IndexedDB first
    const ids = await getAllStoredPropertyIdsDB();
    if (ids.length > 0) {
      return ids;
    }

    // Fallback to localStorage
    const propertyIds = new Set<string>();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        if (key.startsWith(PROJECT_TRACKER_KEY_PREFIX)) {
          const id = key.replace(PROJECT_TRACKER_KEY_PREFIX, '');
          propertyIds.add(id);
        } else if (key.startsWith(PARTNERSHIP_DATA_KEY_PREFIX)) {
          const id = key.replace(PARTNERSHIP_DATA_KEY_PREFIX, '');
          propertyIds.add(id);
        }
      }
    }
    return Array.from(propertyIds);
  } catch (error) {
    console.error('Error getting stored property IDs:', error);
    return [];
  }
};

export const clearAllStoredData = async (): Promise<void> => {
  try {
    // Clear IndexedDB
    await clearAllStoredDataDB();

    // Also clear localStorage (fallback)
    const propertyIds = await getAllStoredPropertyIds();
    await Promise.all(propertyIds.map((id) => clearAllPropertyData(id)));
  } catch (error) {
    console.error('Error clearing all stored data:', error);
  }
};

// ============================================
// PROPERTY SEARCH HISTORY
// ============================================

export interface PropertyHistoryEntry {
  id: string;
  formData: PropertyFormData;
  timestamp: string;
  displayAddress: string;
}

const MAX_HISTORY_ENTRIES = 10;

export const savePropertyToHistory = async (formData: PropertyFormData): Promise<void> => {
  try {
    // Try IndexedDB first
    await savePropertyToHistoryDB(formData);
  } catch (error) {
    console.warn('IndexedDB failed, falling back to localStorage:', error);
    // Fallback to localStorage
    try {
      const history = await getPropertyHistory();

      // Create display address
      const displayAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`;

      // Check if this address already exists in history
      const existingIndex = history.findIndex(
        (entry) => entry.displayAddress.toLowerCase() === displayAddress.toLowerCase()
      );

      // Create new entry
      const newEntry: PropertyHistoryEntry = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        formData,
        timestamp: new Date().toISOString(),
        displayAddress,
      };

      // If address exists, remove the old entry
      if (existingIndex !== -1) {
        history.splice(existingIndex, 1);
      }

      // Add new entry to the beginning
      history.unshift(newEntry);

      // Keep only the most recent entries
      const trimmedHistory = history.slice(0, MAX_HISTORY_ENTRIES);

      localStorage.setItem(PROPERTY_HISTORY_KEY, JSON.stringify(trimmedHistory));
    } catch (localStorageError) {
      console.error('Error saving property to history:', localStorageError);
    }
  }
};

export const getPropertyHistory = async (): Promise<PropertyHistoryEntry[]> => {
  try {
    // Try IndexedDB first
    const history = await getPropertyHistoryDB();
    if (history.length > 0) {
      // Convert to PropertyHistoryEntry format
      return history.map(h => ({
        id: h.id?.toString() || h.propertyId,
        formData: h.formData,
        timestamp: h.timestamp,
        displayAddress: h.displayAddress,
      }));
    }

    // Fallback to localStorage
    const data = localStorage.getItem(PROPERTY_HISTORY_KEY);
    if (data) {
      return JSON.parse(data) as PropertyHistoryEntry[];
    }
    return [];
  } catch (error) {
    console.error('Error loading property history:', error);
    return [];
  }
};

export const removePropertyFromHistory = async (id: string): Promise<void> => {
  try {
    // Try IndexedDB first (id is numeric in IndexedDB)
    const numericId = parseInt(id);
    if (!isNaN(numericId)) {
      await removePropertyFromHistoryDB(numericId);
    }

    // Also remove from localStorage (fallback)
    const history = await getPropertyHistory();
    const updatedHistory = history.filter((entry) => entry.id !== id);
    localStorage.setItem(PROPERTY_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error removing property from history:', error);
  }
};

export const clearPropertyHistory = async (): Promise<void> => {
  try {
    // Clear from IndexedDB
    await clearPropertyHistoryDB();

    // Also clear from localStorage (fallback)
    localStorage.removeItem(PROPERTY_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing property history:', error);
  }
};

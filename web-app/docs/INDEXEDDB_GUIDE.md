# IndexedDB Storage Guide

## Overview

The Real Estate Analysis Tool uses **IndexedDB** (via Dexie.js) as the primary storage mechanism for all application data. This provides significantly better performance, larger storage capacity, and better offline support compared to localStorage.

## Why IndexedDB?

### Benefits over localStorage:
- ✅ **Much larger storage** (50MB+ vs 5-10MB)
- ✅ **Asynchronous** - doesn't block UI
- ✅ **Structured data** with indexes for fast queries
- ✅ **Better for PWA** offline functionality
- ✅ **Automatic caching** for API responses
- ✅ **Type-safe** with full TypeScript support

### Backward Compatibility:
- localStorage is kept as a fallback for older browsers
- Automatic migration from localStorage on first load
- Existing data is preserved and transferred seamlessly

## Database Schema

The database (`RealEstateAnalysisDB`) contains 4 tables:

### 1. `propertyAnalyses`
Stores complete property analysis results including comps, flip analysis, rental analysis, score, alerts, and insights.

**Fields:**
- `id` (auto-increment)
- `propertyId` (string, indexed)
- `formData` (PropertyFormData)
- `analysisResults` (any) - Full API response
- `timestamp` (string, indexed)
- `displayAddress` (string, indexed)

**Use Cases:**
- Save complete analysis results from API
- Retrieve past analyses
- Offline access to analysis data

### 2. `projectTrackers`
Stores project tracking data for renovation projects.

**Fields:**
- `id` (auto-increment)
- `propertyId` (string, indexed)
- `data` (ProjectTrackerData)
- `lastUpdated` (string, indexed)

**Use Cases:**
- Track renovation phases, permits, materials
- Monitor contractor performance
- Track delays and change orders
- Budget monitoring

### 3. `partnershipData`
Stores partnership management data including partners, contributions, and distributions.

**Fields:**
- `id` (auto-increment)
- `propertyId` (string, indexed)
- `data` (PartnershipManagementData)
- `lastUpdated` (string, indexed)

**Use Cases:**
- Manage multiple partners
- Track capital contributions
- Calculate waterfall distributions
- Monitor partner performance

### 4. `propertyHistory`
Stores recent property searches (max 10 entries).

**Fields:**
- `id` (auto-increment)
- `propertyId` (string, indexed)
- `formData` (PropertyFormData)
- `timestamp` (string, indexed)
- `displayAddress` (string, indexed)

**Use Cases:**
- Quick access to recent searches
- Property search history
- Auto-complete suggestions

## Usage Examples

### Importing the Database

```typescript
import { db } from '../utils/db';
```

### Property Analysis

```typescript
// Save analysis
import { savePropertyAnalysis } from '../utils/db';

await savePropertyAnalysis(
  propertyId,
  formData,
  analysisResults
);

// Get analysis
import { getPropertyAnalysis } from '../utils/db';

const analysis = await getPropertyAnalysis(propertyId);

// Get all analyses
import { getAllPropertyAnalyses } from '../utils/db';

const allAnalyses = await getAllPropertyAnalyses();
```

### Project Tracker

```typescript
// Save project tracker data
import { saveProjectTracker } from '../utils/db';

await saveProjectTracker(propertyId, projectTrackerData);

// Load project tracker data
import { getProjectTracker } from '../utils/db';

const data = await getProjectTracker(propertyId);

// Delete project tracker data
import { deleteProjectTracker } from '../utils/db';

await deleteProjectTracker(propertyId);
```

### Partnership Data

```typescript
// Save partnership data
import { savePartnershipDataDB } from '../utils/db';

await savePartnershipDataDB(propertyId, partnershipData);

// Load partnership data
import { getPartnershipDataDB } from '../utils/db';

const data = await getPartnershipDataDB(propertyId);

// Delete partnership data
import { deletePartnershipDataDB } from '../utils/db';

await deletePartnershipDataDB(propertyId);
```

### Property History

```typescript
// Save to history
import { savePropertyToHistoryDB } from '../utils/db';

await savePropertyToHistoryDB(formData);

// Get history
import { getPropertyHistoryDB } from '../utils/db';

const history = await getPropertyHistoryDB();

// Remove from history
import { removePropertyFromHistoryDB } from '../utils/db';

await removePropertyFromHistoryDB(id);

// Clear all history
import { clearPropertyHistoryDB } from '../utils/db';

await clearPropertyHistoryDB();
```

### Utility Functions

```typescript
// Get all stored property IDs
import { getAllStoredPropertyIds } from '../utils/db';

const propertyIds = await getAllStoredPropertyIds();

// Clear all data for a property
import { clearAllPropertyData } from '../utils/db';

await clearAllPropertyData(propertyId);

// Clear all stored data (use with caution!)
import { clearAllStoredData } from '../utils/db';

await clearAllStoredData();

// Get database statistics
import { getDatabaseStats } from '../utils/db';

const stats = await getDatabaseStats();
// Returns: { analyses: 5, comps: 12, trackers: 3, partnerships: 2, history: 10 }
```

## Migration from localStorage

Migration happens automatically on first load. The migration process:

1. Checks if migration has already been completed
2. Migrates property history
3. Migrates project tracker data
4. Migrates partnership data
5. Marks migration as complete in localStorage

**Note:** The migration is non-destructive - localStorage data is preserved as a fallback.

## Using with React Hooks

The custom hooks (`useProjectTracker`, `usePartnershipManagement`) have been updated to use IndexedDB automatically:

```typescript
// useProjectTracker.ts
useEffect(() => {
  if (propertyId) {
    loadProjectTrackerData(propertyId).then((loadedData) => {
      if (loadedData) {
        setData(loadedData);
      }
    });
  }
}, [propertyId]);
```

## Using with localStorage Wrapper

The `localStorage.ts` wrapper provides backward compatibility:

```typescript
// These functions now use IndexedDB with localStorage fallback
import {
  saveProjectTrackerData,
  loadProjectTrackerData,
  savePartnershipData,
  loadPartnershipData,
  savePropertyToHistory,
  getPropertyHistory,
} from '../utils/localStorage';

// All functions are now async
await saveProjectTrackerData(propertyId, data);
const data = await loadProjectTrackerData(propertyId);
```

## Browser Support

IndexedDB is supported in all modern browsers:
- ✅ Chrome 24+
- ✅ Firefox 16+
- ✅ Safari 10+
- ✅ Edge 12+
- ✅ iOS Safari 10+
- ✅ Chrome Android

For older browsers, the app automatically falls back to localStorage.

## Performance Tips

1. **Batch Operations**: Use `Promise.all()` for multiple operations
   ```typescript
   await Promise.all([
     saveProjectTracker(id1, data1),
     saveProjectTracker(id2, data2),
   ]);
   ```

2. **Use Indexes**: Query by indexed fields for faster lookups
   ```typescript
   // Fast (uses index)
   await db.propertyAnalyses.where('propertyId').equals(id).first();

   // Slower (full table scan)
   await db.propertyAnalyses.filter(a => a.propertyId === id).first();
   ```

3. **Limit Results**: Use `.limit()` for large datasets
   ```typescript
   const recent = await db.propertyHistory
     .orderBy('timestamp')
     .reverse()
     .limit(10)
     .toArray();
   ```

4. **Clear Expired Data**: Run cleanup periodically
   ```typescript
   await clearExpiredCompsCache();
   ```

## Debugging

### View Database in Browser DevTools

**Chrome/Edge:**
1. Open DevTools (F12)
2. Go to **Application** tab
3. Expand **IndexedDB** in left sidebar
4. Click **RealEstateAnalysisDB**
5. View tables and data

**Firefox:**
1. Open DevTools (F12)
2. Go to **Storage** tab
3. Expand **Indexed DB**
4. Click **RealEstateAnalysisDB**

### Clear Database

```typescript
// Clear all data
import { clearAllStoredData } from '../utils/db';
await clearAllStoredData();

// Or manually in DevTools:
// Right-click database → Delete database
```

### Check Database Stats

```typescript
import { getDatabaseStats } from '../utils/db';

const stats = await getDatabaseStats();
console.log('Database stats:', stats);
```

## Troubleshooting

### Issue: "QuotaExceededError"

**Solution**: Clear old data or request more storage
```typescript
// Clear expired cache
await clearExpiredCompsCache();

// Clear old analyses
const analyses = await getAllPropertyAnalyses();
const oldAnalyses = analyses.filter(a =>
  new Date(a.timestamp) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
);
await Promise.all(oldAnalyses.map(a => deletePropertyAnalysis(a.propertyId)));
```

### Issue: Migration not working

**Solution**: Check console for errors and manually trigger migration
```typescript
import { migrateFromLocalStorage } from '../utils/db';
await migrateFromLocalStorage();
```

### Issue: Data not persisting

**Solution**: Check if IndexedDB is blocked by browser settings
```typescript
// Test IndexedDB availability
try {
  const testDB = indexedDB.open('test');
  testDB.onsuccess = () => console.log('IndexedDB available');
  testDB.onerror = () => console.error('IndexedDB blocked');
} catch (e) {
  console.error('IndexedDB not supported');
}
```

## Best Practices

1. **Always use async/await** - IndexedDB operations are asynchronous
2. **Handle errors** - Wrap operations in try/catch blocks
3. **Use transactions** - For multiple related operations
4. **Clean up old data** - Implement data retention policies
5. **Test offline** - Verify PWA functionality works offline
6. **Monitor storage** - Check quota usage periodically

## Additional Resources

- [Dexie.js Documentation](https://dexie.org/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [PWA Storage Best Practices](https://web.dev/storage-for-the-web/)

---

**Last Updated**: November 16, 2025
**Version**: 1.0

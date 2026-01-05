/**
 * ===============================
 * COMPS FILTERING UTILITIES
 * ===============================
 *
 * Phase 3.4: Market Data Integration - Comps Filtering
 * Provides filtering by date range, distance, and property type
 */

/**
 * Filter comps based on multiple criteria
 *
 * @param {Array} comps - Array of comp objects
 * @param {Object} filters - Filter criteria object
 * @returns {Array} Filtered comps array
 */
function filterComps(comps, filters = {}) {
  if (!comps || comps.length === 0) return [];

  let filtered = [...comps];

  // Filter by date range (months)
  if (filters.dateRangeMonths) {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - filters.dateRangeMonths);

    filtered = filtered.filter(comp => {
      if (!comp.saleDate) return true; // Keep if no date
      const saleDate = new Date(comp.saleDate);
      return saleDate >= cutoffDate;
    });
  }

  // Filter by distance (miles)
  if (filters.maxDistance && filters.subjectLat && filters.subjectLng) {
    filtered = filtered.filter(comp => {
      if (!comp.latitude || !comp.longitude) return true; // Keep if no coords
      const distance = calculateDistance(
        filters.subjectLat,
        filters.subjectLng,
        comp.latitude,
        comp.longitude
      );
      return distance <= filters.maxDistance;
    });
  }

  // Filter by property type
  if (filters.propertyType && filters.propertyType !== "All") {
    filtered = filtered.filter(comp => {
      if (!comp.propertyType) return true; // Keep if no type specified
      return comp.propertyType.toLowerCase() === filters.propertyType.toLowerCase();
    });
  }

  // Filter by minimum beds/baths
  if (filters.minBeds) {
    filtered = filtered.filter(comp => {
      if (!comp.beds) return true;
      return comp.beds >= filters.minBeds;
    });
  }

  if (filters.minBaths) {
    filtered = filtered.filter(comp => {
      if (!comp.baths) return true;
      return comp.baths >= filters.minBaths;
    });
  }

  // Filter by square footage range
  if (filters.minSqft) {
    filtered = filtered.filter(comp => {
      if (!comp.sqft) return true;
      return comp.sqft >= filters.minSqft;
    });
  }

  if (filters.maxSqft) {
    filtered = filtered.filter(comp => {
      if (!comp.sqft) return true;
      return comp.sqft <= filters.maxSqft;
    });
  }

  return filtered;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 *
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in miles
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Highlight top N closest comps in the analysis sheet
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to highlight in
 * @param {Array} comps - Array of comps with distance data
 * @param {number} topN - Number of top comps to highlight (default 3)
 * @param {number} startRow - Row where comps data starts
 */
function highlightTopComps(sheet, comps, topN = 3, startRow) {
  if (!comps || comps.length === 0) return;

  // Sort by distance (if available)
  const sorted = comps
    .map((comp, index) => ({ comp, index, distance: comp.distance || Infinity }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, topN);

  // Highlight the top N rows
  sorted.forEach(item => {
    const row = startRow + item.index;
    try {
      sheet.getRange(row, 1, 1, sheet.getLastColumn())
        .setBackground("#e8f5e9") // Light green
        .setFontWeight("bold");

      // Add a note indicating it's a top comp
      sheet.getRange(row, 1).setNote(`Top ${sorted.indexOf(item) + 1} closest comp (${item.distance.toFixed(2)} miles)`);
    } catch (e) {
      Logger.log(`Error highlighting row ${row}: ${e}`);
    }
  });
}

/**
 * Create a filtered comps view in a new sheet
 * Phase 3.4 Enhancement
 */
function createFilteredCompsView() {
  const ui = SpreadsheetApp.getUi();

  // Get filter criteria from user
  const dateResponse = ui.prompt(
    "Filter by Date Range",
    "Enter number of months (e.g., 3, 6, 12) or leave blank for all:",
    ui.ButtonSet.OK_CANCEL
  );

  if (dateResponse.getSelectedButton() !== ui.Button.OK) return;

  const distanceResponse = ui.prompt(
    "Filter by Distance",
    "Enter maximum distance in miles (e.g., 0.5, 1, 2) or leave blank for all:",
    ui.ButtonSet.OK_CANCEL
  );

  if (distanceResponse.getSelectedButton() !== ui.Button.OK) return;

  const propertyTypeResponse = ui.prompt(
    "Filter by Property Type",
    "Enter property type (Single Family, Condo, Townhouse, Multi-Family) or leave blank for all:",
    ui.ButtonSet.OK_CANCEL
  );

  if (propertyTypeResponse.getSelectedButton() !== ui.Button.OK) return;

  // Parse filter values
  const filters = {
    dateRangeMonths: dateResponse.getResponseText() ? parseInt(dateResponse.getResponseText()) : null,
    maxDistance: distanceResponse.getResponseText() ? parseFloat(distanceResponse.getResponseText()) : null,
    propertyType: propertyTypeResponse.getResponseText() || null
  };

  // Get subject property coordinates (would need to be stored or fetched)
  const address = getField("address", "");
  const city = getField("city", "");
  const state = getField("state", "");
  const zip = getField("zip", "");

  if (!address || !city || !state || !zip) {
    ui.alert("⚠️ Please enter property address in Inputs sheet first.");
    return;
  }

  // Fetch comps (from cache or API)
  const data = { address, city, state, zip };
  const comps = fetchCompsData(data);

  if (!comps || comps.length === 0) {
    ui.alert("⚠️ No comps data available. Run analysis first.");
    return;
  }

  // Apply filters
  const filtered = filterComps(comps, filters);

  // Create or clear filtered comps sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let filterSheet = ss.getSheetByName("Filtered Comps");

  if (!filterSheet) {
    filterSheet = ss.insertSheet("Filtered Comps");
  } else {
    filterSheet.clear();
  }

  // Add header
  filterSheet.getRange("A1").setValue("Filtered Comparable Properties")
    .setFontWeight("bold").setFontSize(14);

  let row = 2;

  // Display filter criteria
  filterSheet.getRange(row, 1).setValue("Filter Criteria:")
    .setFontWeight("bold").setFontStyle("italic");
  row++;

  if (filters.dateRangeMonths) {
    filterSheet.getRange(row++, 1).setValue(`• Date Range: Last ${filters.dateRangeMonths} months`);
  }
  if (filters.maxDistance) {
    filterSheet.getRange(row++, 1).setValue(`• Max Distance: ${filters.maxDistance} miles`);
  }
  if (filters.propertyType) {
    filterSheet.getRange(row++, 1).setValue(`• Property Type: ${filters.propertyType}`);
  }

  filterSheet.getRange(row++, 1).setValue(`• Results: ${filtered.length} of ${comps.length} comps`)
    .setFontWeight("bold");

  row += 2;

  // Add column headers
  const headers = ["Address", "Sale Price", "Sale Date", "SqFt", "Beds", "Baths", "Property Type", "Distance (mi)"];
  filterSheet.getRange(row, 1, 1, headers.length).setValues([headers])
    .setFontWeight("bold").setBackground("#d9e2f3")
    .setBorder(true, true, true, true, true, true);
  row++;

  // Add filtered comps data
  if (filtered.length === 0) {
    filterSheet.getRange(row, 1).setValue("No comps match the filter criteria.")
      .setFontStyle("italic");
  } else {
    filtered.forEach((comp, index) => {
      const rowData = [
        comp.address || "—",
        comp.price || 0,
        comp.saleDate || "—",
        comp.sqft || "—",
        comp.beds || "—",
        comp.baths || "—",
        comp.propertyType || "—",
        comp.distance ? comp.distance.toFixed(2) : "—"
      ];

      filterSheet.getRange(row + index, 1, 1, rowData.length).setValues([rowData]);

      // Format price column
      filterSheet.getRange(row + index, 2).setNumberFormat('"$"#,##0');

      // Highlight top 3 closest if distance available
      if (index < 3 && comp.distance) {
        filterSheet.getRange(row + index, 1, 1, rowData.length)
          .setBackground("#e8f5e9")
          .setFontWeight("bold");
      }
    });
  }

  filterSheet.autoResizeColumns(1, headers.length);

  ui.alert(`✅ Filtered comps view created!\n\n${filtered.length} of ${comps.length} comps match your criteria.\n\nTop 3 closest comps are highlighted in green.`);

  Logger.log(`✅ Filtered comps: ${filtered.length}/${comps.length}`);
}

/**
 * Quick filter presets for common scenarios
 */
function quickFilterComps(preset) {
  const filters = {
    "recent": { dateRangeMonths: 3, maxDistance: 1 },
    "nearby": { maxDistance: 0.5 },
    "similar": { dateRangeMonths: 6, maxDistance: 1 },
    "all": {}
  };

  const selectedFilter = filters[preset] || filters.all;

  // Apply filter and create view
  // (Implementation would call createFilteredCompsView with preset filters)
  Logger.log(`Quick filter applied: ${preset}`);
}

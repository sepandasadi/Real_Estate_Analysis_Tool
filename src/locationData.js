/**
 * ===============================
 * LOCATION DATA & AUTO-POPULATION
 * ===============================
 *
 * Phase 3.1: Tax, Insurance & Expense Automation
 * Provides location-based lookup tables for property taxes and insurance rates
 */

/**
 * Property tax rates by state (annual rate as decimal)
 * Source: Tax Foundation 2024 data (approximate averages)
 */
const PROPERTY_TAX_RATES_BY_STATE = {
  // High tax states
  "NJ": 0.0249, // New Jersey
  "IL": 0.0223, // Illinois
  "NH": 0.0218, // New Hampshire
  "CT": 0.0213, // Connecticut
  "VT": 0.0186, // Vermont
  "WI": 0.0176, // Wisconsin
  "TX": 0.0173, // Texas
  "NE": 0.0173, // Nebraska
  "OH": 0.0157, // Ohio
  "RI": 0.0153, // Rhode Island

  // Medium tax states
  "NY": 0.0149, // New York
  "PA": 0.0147, // Pennsylvania
  "IA": 0.0145, // Iowa
  "MI": 0.0143, // Michigan
  "KS": 0.0141, // Kansas
  "MA": 0.0123, // Massachusetts
  "CA": 0.0076, // California (Prop 13)
  "FL": 0.0097, // Florida
  "OR": 0.0097, // Oregon
  "MN": 0.0111, // Minnesota

  // Low tax states
  "AZ": 0.0062, // Arizona
  "NV": 0.0060, // Nevada
  "CO": 0.0051, // Colorado
  "UT": 0.0060, // Utah
  "NC": 0.0084, // North Carolina
  "GA": 0.0092, // Georgia
  "TN": 0.0067, // Tennessee
  "SC": 0.0057, // South Carolina
  "AL": 0.0041, // Alabama
  "LA": 0.0055, // Louisiana
  "WV": 0.0058, // West Virginia
  "HI": 0.0028, // Hawaii (lowest)

  // Other states
  "WA": 0.0092, // Washington
  "ID": 0.0063, // Idaho
  "MT": 0.0083, // Montana
  "WY": 0.0061, // Wyoming
  "ND": 0.0098, // North Dakota
  "SD": 0.0128, // South Dakota
  "MO": 0.0097, // Missouri
  "AR": 0.0062, // Arkansas
  "OK": 0.0090, // Oklahoma
  "NM": 0.0080, // New Mexico
  "KY": 0.0086, // Kentucky
  "IN": 0.0085, // Indiana
  "MS": 0.0063, // Mississippi
  "VA": 0.0082, // Virginia
  "MD": 0.0109, // Maryland
  "DE": 0.0057, // Delaware
  "DC": 0.0056, // District of Columbia
  "ME": 0.0132, // Maine
  "AK": 0.0120  // Alaska
};

/**
 * Insurance rates by state (annual cost as % of property value)
 * Source: Insurance industry averages 2024
 */
const INSURANCE_RATES_BY_STATE = {
  // High insurance cost states (coastal, hurricane-prone)
  "FL": 0.0060, // Florida (highest due to hurricanes)
  "LA": 0.0055, // Louisiana
  "TX": 0.0045, // Texas
  "OK": 0.0042, // Oklahoma (tornadoes)
  "MS": 0.0040, // Mississippi
  "AL": 0.0038, // Alabama
  "SC": 0.0035, // South Carolina
  "NC": 0.0033, // North Carolina
  "GA": 0.0032, // Georgia
  "AR": 0.0030, // Arkansas

  // Medium insurance cost states
  "CA": 0.0028, // California (earthquakes, fires)
  "NY": 0.0025, // New York
  "NJ": 0.0024, // New Jersey
  "CT": 0.0023, // Connecticut
  "MA": 0.0022, // Massachusetts
  "RI": 0.0022, // Rhode Island
  "MD": 0.0021, // Maryland
  "VA": 0.0020, // Virginia
  "PA": 0.0019, // Pennsylvania
  "IL": 0.0019, // Illinois

  // Low insurance cost states
  "OR": 0.0015, // Oregon (lowest)
  "WA": 0.0016, // Washington
  "ID": 0.0016, // Idaho
  "UT": 0.0017, // Utah
  "NV": 0.0017, // Nevada
  "AZ": 0.0018, // Arizona
  "CO": 0.0018, // Colorado
  "WY": 0.0016, // Wyoming
  "MT": 0.0016, // Montana
  "VT": 0.0018, // Vermont

  // Other states
  "WI": 0.0019, // Wisconsin
  "MI": 0.0020, // Michigan
  "MN": 0.0019, // Minnesota
  "IA": 0.0020, // Iowa
  "MO": 0.0021, // Missouri
  "KS": 0.0022, // Kansas
  "NE": 0.0020, // Nebraska
  "SD": 0.0019, // South Dakota
  "ND": 0.0018, // North Dakota
  "OH": 0.0019, // Ohio
  "IN": 0.0019, // Indiana
  "KY": 0.0020, // Kentucky
  "TN": 0.0021, // Tennessee
  "WV": 0.0020, // West Virginia
  "NH": 0.0020, // New Hampshire
  "ME": 0.0021, // Maine
  "DE": 0.0020, // Delaware
  "DC": 0.0022, // District of Columbia
  "NM": 0.0019, // New Mexico
  "AK": 0.0018, // Alaska
  "HI": 0.0025  // Hawaii
};

/**
 * Get property tax rate for a given state
 *
 * @param {string} state - Two-letter state code
 * @returns {number} Annual property tax rate as decimal (e.g., 0.0125 = 1.25%)
 */
function getPropertyTaxRate(state) {
  if (!state) return 0.0125; // Default 1.25%

  const stateUpper = state.toUpperCase().trim();
  return PROPERTY_TAX_RATES_BY_STATE[stateUpper] || 0.0125;
}

/**
 * Get insurance rate for a given state
 *
 * @param {string} state - Two-letter state code
 * @param {number} propertyValue - Property value to calculate monthly insurance
 * @returns {number} Monthly insurance cost
 */
function getInsuranceRate(state, propertyValue) {
  if (!state || !propertyValue) return 100; // Default $100/month

  const stateUpper = state.toUpperCase().trim();
  const annualRate = INSURANCE_RATES_BY_STATE[stateUpper] || 0.0020; // Default 0.2%
  const annualCost = propertyValue * annualRate;
  return Math.round(annualCost / 12);
}

/**
 * Auto-populate tax and insurance fields based on property location
 * Phase 3.1 Enhancement
 */
function autoPopulateExpenses() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const inputs = ss.getSheetByName("Inputs");

    if (!inputs) {
      Logger.log("❌ Inputs sheet not found");
      return;
    }

    // Get location data
    const state = getField("state", "");
    const purchasePrice = getField("purchasePrice", 0);

    if (!state || !purchasePrice) {
      SpreadsheetApp.getUi().alert("⚠️ Please enter State and Purchase Price first.");
      return;
    }

    // Get current values to check if manually set
    const currentTaxRate = getField("propertyTaxRate", 0);
    const currentInsurance = getField("insuranceMonthly", 0);

    // Calculate auto-populated values
    const autoTaxRate = getPropertyTaxRate(state);
    const autoInsurance = getInsuranceRate(state, purchasePrice);

    // Ask user if they want to overwrite existing values
    let shouldUpdate = true;
    if (currentTaxRate > 0 || currentInsurance > 0) {
      const ui = SpreadsheetApp.getUi();
      const response = ui.alert(
        "Auto-Populate Expenses",
        `Found existing values:\n\n` +
        `Property Tax Rate: ${(currentTaxRate * 100).toFixed(2)}%\n` +
        `Insurance: $${currentInsurance}/month\n\n` +
        `Replace with auto-populated values for ${state}?\n\n` +
        `New Property Tax Rate: ${(autoTaxRate * 100).toFixed(2)}%\n` +
        `New Insurance: $${autoInsurance}/month`,
        ui.ButtonSet.YES_NO
      );

      shouldUpdate = (response === ui.Button.YES);
    }

    if (shouldUpdate) {
      // Set the auto-populated values
      setField("propertyTaxRate", autoTaxRate, "0.00%");
      setField("insuranceMonthly", autoInsurance, '"$"#,##0');

      // Add notes to indicate auto-population
      const taxRateRef = getFieldRef("propertyTaxRate");
      const insuranceRef = getFieldRef("insuranceMonthly");

      if (taxRateRef) {
        const cell = inputs.getRange(taxRateRef);
        cell.setNote(`Auto-populated for ${state}. Based on state average. You can manually override this value.`);
        cell.setBackground("#e8f5e9"); // Light green to indicate auto-populated
      }

      if (insuranceRef) {
        const cell = inputs.getRange(insuranceRef);
        cell.setNote(`Auto-populated for ${state}. Based on ${(INSURANCE_RATES_BY_STATE[state.toUpperCase()] * 100).toFixed(2)}% of property value. You can manually override this value.`);
        cell.setBackground("#e8f5e9"); // Light green to indicate auto-populated
      }

      SpreadsheetApp.getUi().alert(
        `✅ Expenses auto-populated for ${state}!\n\n` +
        `Property Tax Rate: ${(autoTaxRate * 100).toFixed(2)}%\n` +
        `Insurance: $${autoInsurance}/month\n\n` +
        `Note: These are state averages. You can manually override these values if you have more accurate local data.`
      );

      Logger.log(`✅ Auto-populated expenses for ${state}`);
    } else {
      Logger.log("User chose not to update existing values");
    }

  } catch (error) {
    Logger.log("❌ Error auto-populating expenses: " + error);
    SpreadsheetApp.getUi().alert("⚠️ Error: " + error.message);
  }
}

/**
 * Clear auto-population indicators (background colors and notes)
 */
function clearAutoPopulationIndicators() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const inputs = ss.getSheetByName("Inputs");

    if (!inputs) return;

    const taxRateRef = getFieldRef("propertyTaxRate");
    const insuranceRef = getFieldRef("insuranceMonthly");

    if (taxRateRef) {
      const cell = inputs.getRange(taxRateRef);
      cell.setBackground(null);
      cell.clearNote();
    }

    if (insuranceRef) {
      const cell = inputs.getRange(insuranceRef);
      cell.setBackground(null);
      cell.clearNote();
    }

    Logger.log("✅ Cleared auto-population indicators");
  } catch (error) {
    Logger.log("❌ Error clearing indicators: " + error);
  }
}

/**
 * Get location-based expense estimates
 * Returns an object with recommended values
 *
 * @param {string} state - Two-letter state code
 * @param {number} purchasePrice - Property purchase price
 * @returns {Object} Expense estimates
 */
function getLocationExpenseEstimates(state, purchasePrice) {
  return {
    propertyTaxRate: getPropertyTaxRate(state),
    insuranceMonthly: getInsuranceRate(state, purchasePrice),
    propertyTaxAnnual: purchasePrice * getPropertyTaxRate(state),
    insuranceAnnual: getInsuranceRate(state, purchasePrice) * 12,
    state: state,
    source: "State averages"
  };
}

/**
 * Display expense comparison for different states
 * Useful for comparing investment locations
 */
function compareStateExpenses() {
  const purchasePrice = getField("purchasePrice", 500000);

  if (!purchasePrice) {
    SpreadsheetApp.getUi().alert("⚠️ Please enter Purchase Price first.");
    return;
  }

  // Create comparison sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let compSheet = ss.getSheetByName("State Expense Comparison");

  if (!compSheet) {
    compSheet = ss.insertSheet("State Expense Comparison");
  } else {
    compSheet.clear();
  }

  // Add header
  compSheet.getRange("A1").setValue("State Expense Comparison")
    .setFontWeight("bold").setFontSize(14);
  compSheet.getRange("A2").setValue(`Based on Purchase Price: $${purchasePrice.toLocaleString()}`)
    .setFontStyle("italic");

  let row = 4;

  // Add column headers
  const headers = ["State", "Property Tax Rate", "Annual Property Tax", "Monthly Insurance", "Annual Insurance", "Total Annual"];
  compSheet.getRange(row, 1, 1, headers.length).setValues([headers])
    .setFontWeight("bold").setBackground("#d9e2f3");
  row++;

  // Add data for all states
  const states = Object.keys(PROPERTY_TAX_RATES_BY_STATE).sort();

  states.forEach(state => {
    const taxRate = PROPERTY_TAX_RATES_BY_STATE[state];
    const annualTax = purchasePrice * taxRate;
    const monthlyIns = getInsuranceRate(state, purchasePrice);
    const annualIns = monthlyIns * 12;
    const totalAnnual = annualTax + annualIns;

    compSheet.getRange(row, 1, 1, 6).setValues([[
      state,
      taxRate,
      annualTax,
      monthlyIns,
      annualIns,
      totalAnnual
    ]]);

    // Format
    compSheet.getRange(row, 2).setNumberFormat("0.00%");
    compSheet.getRange(row, 3).setNumberFormat('"$"#,##0');
    compSheet.getRange(row, 4).setNumberFormat('"$"#,##0');
    compSheet.getRange(row, 5).setNumberFormat('"$"#,##0');
    compSheet.getRange(row, 6).setNumberFormat('"$"#,##0');

    row++;
  });

  compSheet.autoResizeColumns(1, 6);

  SpreadsheetApp.getUi().alert("✅ State expense comparison created!\n\nCheck the 'State Expense Comparison' tab.");
  Logger.log("✅ State expense comparison generated");
}

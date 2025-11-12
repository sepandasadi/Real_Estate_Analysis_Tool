/**
 * ===============================
 * CONFIGURATION & FIELD MAPPING
 * ===============================
 *
 * This module provides dynamic field mapping for the REI Analysis Tool.
 * Instead of hardcoded cell references (e.g., "B8"), fields are accessed by name.
 *
 * Benefits:
 * - Survives layout changes (add/remove rows)
 * - Self-documenting code
 * - Centralized field management
 * - Easy to maintain and extend
 */

// Cache for field mappings (initialized once per execution)
let FIELD_CACHE = null;

/**
 * Field mapping configuration
 * Maps logical field names to their labels in the Inputs sheet
 */
const FIELD_LABELS = {
  // API & Property Info
  apiSource: "API Source",
  address: "Property Address",
  city: "City",
  state: "State",
  zip: "Zip",

  // Acquisition & Financing
  purchasePrice: "Purchase Price",
  downPayment: "Down Payment (%)",
  loanInterestRate: "Loan Interest Rate (%)",
  loanTerm: "Loan Term (Years)",
  cashInvestment: "Cash Investment ($)",
  helocAmount: "HELOC / Loan Amount ($)",
  helocInterest: "HELOC / Loan Interest (%)",

  // Rehab & Project Timeline
  rehabCost: "Rehab Cost",
  monthsToFlip: "Months to Flip",
  contingency: "Contingency (%)",

  // Rental Inputs
  propertyTaxRate: "Property Tax Rate (%)",
  insuranceMonthly: "Insurance / Utilities (Monthly)",
  vacancyRate: "Vacancy Rate (%)",
  maintenanceRate: "Maintenance Rate (% of Property Value)",
  propertyManagementRate: "Property Management Rate (%)",
  includePropertyManagement: "Include Property Management?",
  hoaFees: "HOA Fees (Monthly)",
  rentEstimate: "Monthly Rent (Est.)",

  // Output References (auto-linked)
  baseARV: "Base ARV",
  netProfit: "Net Profit (Flip)",
  capRate: "Cap Rate (Rental)",
  cocReturn: "CoC Return (Rental)"
};

/**
 * Initialize field mappings by scanning the Inputs sheet
 * This function caches the mappings for performance
 *
 * @returns {Object} Map of field names to cell references
 */
function initializeFieldMappings() {
  if (FIELD_CACHE) return FIELD_CACHE;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inputs = ss.getSheetByName("Inputs");

  if (!inputs) {
    Logger.log("❌ Inputs sheet not found");
    return {};
  }

  const data = inputs.getDataRange().getValues();
  const mappings = {};

  // Scan column A for labels, map to column B cells
  for (let i = 0; i < data.length; i++) {
    const label = data[i][0];
    if (label && typeof label === 'string') {
      // Find matching field name for this label
      for (const [fieldName, fieldLabel] of Object.entries(FIELD_LABELS)) {
        if (label.trim() === fieldLabel) {
          mappings[fieldName] = `B${i + 1}`;
          break;
        }
      }
    }
  }

  FIELD_CACHE = mappings;
  Logger.log(`✅ Initialized ${Object.keys(mappings).length} field mappings`);
  return mappings;
}

/**
 * Clear the field mapping cache
 * Call this if the sheet structure changes during execution
 */
function clearFieldCache() {
  FIELD_CACHE = null;
  Logger.log("🔄 Field cache cleared");
}

/**
 * Get a field value from the Inputs sheet by field name
 *
 * @param {string} fieldName - The logical field name (e.g., "purchasePrice")
 * @param {*} defaultValue - Default value if field not found or empty
 * @returns {*} The field value
 */
function getField(fieldName, defaultValue = null) {
  const mappings = initializeFieldMappings();
  const cellRef = mappings[fieldName];

  if (!cellRef) {
    Logger.log(`⚠️ Field not found: ${fieldName}`);
    return defaultValue;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inputs = ss.getSheetByName("Inputs");
  const value = inputs.getRange(cellRef).getValue();

  // Return default if value is empty
  return (value === "" || value === null || value === undefined) ? defaultValue : value;
}

/**
 * Set a field value in the Inputs sheet by field name
 *
 * @param {string} fieldName - The logical field name
 * @param {*} value - The value to set
 * @param {string} format - Optional number format (e.g., '"$"#,##0')
 */
function setField(fieldName, value, format = null) {
  const mappings = initializeFieldMappings();
  const cellRef = mappings[fieldName];

  if (!cellRef) {
    Logger.log(`⚠️ Field not found: ${fieldName}`);
    return;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inputs = ss.getSheetByName("Inputs");
  const range = inputs.getRange(cellRef);

  range.setValue(value);
  if (format) {
    range.setNumberFormat(format);
  }
}

/**
 * Get multiple field values at once
 *
 * @param {Array<string>} fieldNames - Array of field names to retrieve
 * @returns {Object} Map of field names to values
 */
function getFields(fieldNames) {
  const result = {};
  for (const fieldName of fieldNames) {
    result[fieldName] = getField(fieldName);
  }
  return result;
}

/**
 * Set multiple field values at once
 *
 * @param {Object} fieldValues - Map of field names to values
 * @param {Object} formats - Optional map of field names to number formats
 */
function setFields(fieldValues, formats = {}) {
  for (const [fieldName, value] of Object.entries(fieldValues)) {
    const format = formats[fieldName] || null;
    setField(fieldName, value, format);
  }
}

/**
 * Get all input values as an object
 * Useful for passing data between functions
 *
 * @returns {Object} All input field values
 */
function getAllInputs() {
  const fieldNames = Object.keys(FIELD_LABELS);
  return getFields(fieldNames);
}

/**
 * Validate that all required fields exist in the sheet
 * Call this during initialization to catch configuration errors
 *
 * @returns {Array<string>} Array of missing field names
 */
function validateFieldMappings() {
  const mappings = initializeFieldMappings();
  const missing = [];

  for (const fieldName of Object.keys(FIELD_LABELS)) {
    if (!mappings[fieldName]) {
      missing.push(fieldName);
    }
  }

  if (missing.length > 0) {
    Logger.log(`⚠️ Missing field mappings: ${missing.join(", ")}`);
  } else {
    Logger.log("✅ All field mappings validated");
  }

  return missing;
}

/**
 * Get field cell reference (for formulas)
 *
 * @param {string} fieldName - The logical field name
 * @returns {string} Cell reference (e.g., "B8") or null if not found
 */
function getFieldRef(fieldName) {
  const mappings = initializeFieldMappings();
  return mappings[fieldName] || null;
}

/**
 * Legacy compatibility: Get value by cell reference
 * Use this temporarily during migration from hardcoded references
 *
 * @param {string} cellRef - Cell reference (e.g., "B8")
 * @param {*} defaultValue - Default value if empty
 * @returns {*} The cell value
 */
function getByRef(cellRef, defaultValue = null) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inputs = ss.getSheetByName("Inputs");
  const value = inputs.getRange(cellRef).getValue();
  return (value === "" || value === null || value === undefined) ? defaultValue : value;
}

/**
 * Legacy compatibility: Set value by cell reference
 *
 * @param {string} cellRef - Cell reference (e.g., "B8")
 * @param {*} value - The value to set
 * @param {string} format - Optional number format
 */
function setByRef(cellRef, value, format = null) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inputs = ss.getSheetByName("Inputs");
  const range = inputs.getRange(cellRef);
  range.setValue(value);
  if (format) {
    range.setNumberFormat(format);
  }
}

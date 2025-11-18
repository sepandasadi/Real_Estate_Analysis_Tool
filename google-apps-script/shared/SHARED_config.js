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

// ============================================================================
// ANALYSIS MODE CONFIGURATION (Phase 2.5)
// ============================================================================

/**
 * Deep Mode Password Protection
 * Password is stored in Script Properties (like API keys)
 *
 * To set your password:
 * 1. Go to Project Settings → Script Properties
 * 2. Add property: DEEP_MODE_PASSWORD
 * 3. Set your desired password as the value
 */

/**
 * Get Deep Mode password from Script Properties
 *
 * @returns {string|null} Password or null if not set
 */
function getDeepModePassword() {
  try {
    const scriptProps = PropertiesService.getScriptProperties();
    const password = scriptProps.getProperty('DEEP_MODE_PASSWORD');

    if (!password) {
      Logger.log('⚠️ DEEP_MODE_PASSWORD not set in Script Properties');
      return null;
    }

    return password;
  } catch (error) {
    Logger.log(`❌ Error getting Deep Mode password: ${error.message}`);
    return null;
  }
}

/**
 * Validate Deep Mode password
 *
 * @param {string} inputPassword - Password entered by user
 * @returns {boolean} True if password is correct
 */
function validateDeepModePassword(inputPassword) {
  if (!inputPassword || typeof inputPassword !== 'string') {
    return false;
  }

  const storedPassword = getDeepModePassword();

  if (!storedPassword) {
    Logger.log('⚠️ Deep Mode password not configured in Script Properties');
    return false;
  }

  // Simple comparison (case-sensitive)
  return inputPassword === storedPassword;
}


/**
 * Analysis Mode Constants
 * Defines the three tiers of analysis depth
 */
const ANALYSIS_MODE = {
  BASIC: 'BASIC',      // 0-1 API calls - User provides data
  STANDARD: 'STANDARD', // 2-4 API calls - Fetch essentials
  DEEP: 'DEEP'         // 8-12 API calls - Full automation
};

/**
 * Analysis Mode Configuration
 * Defines API call limits and features for each mode
 */
const ANALYSIS_MODE_CONFIG = {
  [ANALYSIS_MODE.BASIC]: {
    name: 'Basic Mode',
    description: 'User provides property details and comps. Minimal API usage.',
    maxApiCalls: 1,
    features: {
      userProvidedData: true,
      propertyDetails: false,
      compsData: false,
      historicalValidation: false,
      marketTrends: false,
      rentalAnalysis: false,
      locationQuality: false,
      taxRateValidation: true // Optional: 1 API call
    },
    estimatedMonthlyCapacity: 'Unlimited',
    tooltip: 'Perfect for quick analysis when you already have property details and comps. Uses 0-1 API calls.'
  },
  [ANALYSIS_MODE.STANDARD]: {
    name: 'Standard Mode',
    description: 'Fetch property details and comps automatically. Moderate API usage.',
    maxApiCalls: 4,
    features: {
      userProvidedData: false,
      propertyDetails: true,    // 1 API call
      compsData: true,          // 1 API call
      historicalValidation: false,
      marketTrends: false,
      rentalAnalysis: true,     // 1 API call
      locationQuality: false,
      taxRateValidation: true   // 1 API call
    },
    estimatedMonthlyCapacity: '300-600 properties',
    tooltip: 'Automatically fetches property details and comps. Uses 2-4 API calls per property.'
  },
  [ANALYSIS_MODE.DEEP]: {
    name: 'Deep Mode',
    description: 'Full automation with historical validation and market analysis. Maximum API usage.',
    maxApiCalls: 12,
    features: {
      userProvidedData: false,
      propertyDetails: true,        // 1 API call
      compsData: true,              // 1 API call
      historicalValidation: true,   // 2-4 API calls
      marketTrends: true,           // 2-3 API calls
      rentalAnalysis: true,         // 1 API call
      locationQuality: true,        // 1-2 API calls
      taxRateValidation: true       // 1 API call
    },
    estimatedMonthlyCapacity: '100-200 properties',
    tooltip: 'Maximum accuracy with historical validation, market trends, and location analysis. Uses 8-12 API calls per property.'
  }
};

/**
 * Get the current analysis mode from document properties
 * Defaults to STANDARD if not set
 *
 * @returns {string} Current analysis mode (BASIC, STANDARD, or DEEP)
 */
function getAnalysisMode() {
  try {
    const docProps = PropertiesService.getDocumentProperties();
    const mode = docProps.getProperty('ANALYSIS_MODE');

    // Validate mode
    if (mode && Object.values(ANALYSIS_MODE).includes(mode)) {
      return mode;
    }

    // Default to STANDARD
    return ANALYSIS_MODE.STANDARD;
  } catch (error) {
    Logger.log(`⚠️ Error getting analysis mode: ${error.message}`);
    return ANALYSIS_MODE.STANDARD;
  }
}

/**
 * Set the analysis mode in document properties
 *
 * @param {string} mode - Analysis mode (BASIC, STANDARD, or DEEP)
 * @returns {boolean} Success status
 */
function setAnalysisMode(mode) {
  try {
    // Validate mode
    if (!Object.values(ANALYSIS_MODE).includes(mode)) {
      Logger.log(`❌ Invalid analysis mode: ${mode}`);
      return false;
    }

    const docProps = PropertiesService.getDocumentProperties();
    docProps.setProperty('ANALYSIS_MODE', mode);

    Logger.log(`✅ Analysis mode set to: ${mode}`);
    return true;
  } catch (error) {
    Logger.log(`❌ Error setting analysis mode: ${error.message}`);
    return false;
  }
}

/**
 * Get analysis mode configuration
 *
 * @param {string} mode - Analysis mode (optional, defaults to current mode)
 * @returns {Object} Mode configuration object
 */
function getAnalysisModeConfig(mode = null) {
  const targetMode = mode || getAnalysisMode();
  return ANALYSIS_MODE_CONFIG[targetMode] || ANALYSIS_MODE_CONFIG[ANALYSIS_MODE.STANDARD];
}

/**
 * Validate analysis mode
 *
 * @param {string} mode - Mode to validate
 * @returns {boolean} True if valid
 */
function isValidAnalysisMode(mode) {
  return Object.values(ANALYSIS_MODE).includes(mode);
}

/**
 * Get all available analysis modes with their configurations
 *
 * @returns {Array<Object>} Array of mode objects with name, value, and config
 */
function getAllAnalysisModes() {
  return Object.values(ANALYSIS_MODE).map(mode => ({
    value: mode,
    config: ANALYSIS_MODE_CONFIG[mode]
  }));
}

/**
 * Check if a feature is enabled for the current analysis mode
 *
 * @param {string} featureName - Name of the feature to check
 * @param {string} mode - Analysis mode (optional, defaults to current mode)
 * @returns {boolean} True if feature is enabled
 */
function isFeatureEnabled(featureName, mode = null) {
  const config = getAnalysisModeConfig(mode);
  return config.features[featureName] || false;
}

// ============================================================================
// EXPORTS - Make functions available globally
// ============================================================================

if (typeof global !== 'undefined') {
  global.getField = getField;
  global.setField = setField;
  global.getFields = getFields;
  global.setFields = setFields;
  global.getAllInputs = getAllInputs;
  global.getFieldRef = getFieldRef;
  global.validateFieldMappings = validateFieldMappings;
  global.clearFieldCache = clearFieldCache;
  global.initializeFieldMappings = initializeFieldMappings;
  global.getByRef = getByRef;
  global.setByRef = setByRef;

  // Analysis Mode exports (Phase 2.5)
  global.ANALYSIS_MODE = ANALYSIS_MODE;
  global.ANALYSIS_MODE_CONFIG = ANALYSIS_MODE_CONFIG;
  global.getDeepModePassword = getDeepModePassword;
  global.validateDeepModePassword = validateDeepModePassword;
  global.getAnalysisMode = getAnalysisMode;
  global.setAnalysisMode = setAnalysisMode;
  global.getAnalysisModeConfig = getAnalysisModeConfig;
  global.isValidAnalysisMode = isValidAnalysisMode;
  global.getAllAnalysisModes = getAllAnalysisModes;
  global.isFeatureEnabled = isFeatureEnabled;
}

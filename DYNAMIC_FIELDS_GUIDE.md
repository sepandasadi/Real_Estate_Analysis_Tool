# Dynamic Field Mapping System - Implementation Guide

## 🎯 Overview

The REI Analysis Tool now uses a **dynamic field mapping system** instead of hardcoded cell references. This makes the codebase more maintainable, flexible, and resilient to layout changes.

**Date Implemented:** November 12, 2025
**Files Modified:** config.js (new), main.js, analyzer.js, sensitivity.js

---

## 🔄 What Changed

### Before (Hardcoded)
```javascript
const purchasePrice = inputs.getRange("B8").getValue() || 0;
const downPayment = inputs.getRange("B9").getValue() / 100 || 0.2;
inputs.getRange("B16").setValue(rehabCost);
```

**Problems:**
- ❌ Breaks if rows are added/removed
- ❌ Hard to maintain
- ❌ Not self-documenting
- ❌ Error-prone

### After (Dynamic)
```javascript
const purchasePrice = getField("purchasePrice", 0);
const downPayment = getField("downPayment", 20) / 100;
setField("rehabCost", rehabCost, '"$"#,##0');
```

**Benefits:**
- ✅ Survives layout changes
- ✅ Self-documenting code
- ✅ Centralized configuration
- ✅ Easy to maintain

---

## 📚 Core Functions

### Reading Values

#### `getField(fieldName, defaultValue)`
Get a single field value from the Inputs sheet.

```javascript
// Basic usage
const purchasePrice = getField("purchasePrice", 0);

// With default value
const loanTerm = getField("loanTerm", 30);

// Percentage fields (stored as decimal, need conversion)
const downPaymentPct = getField("downPayment", 20) / 100;
```

#### `getFields(fieldNames)`
Get multiple field values at once.

```javascript
const fields = getFields(["purchasePrice", "rehabCost", "monthsToFlip"]);
// Returns: { purchasePrice: 1250000, rehabCost: 80000, monthsToFlip: 4 }
```

#### `getAllInputs()`
Get all input field values as an object.

```javascript
const allInputs = getAllInputs();
// Returns object with all field values
```

### Writing Values

#### `setField(fieldName, value, format)`
Set a single field value in the Inputs sheet.

```javascript
// Basic usage
setField("purchasePrice", 1250000);

// With number formatting
setField("rehabCost", 80000, '"$"#,##0');
setField("downPayment", 0.15, "0.00%");
```

#### `setFields(fieldValues, formats)`
Set multiple field values at once.

```javascript
const values = {
  purchasePrice: 1250000,
  rehabCost: 80000,
  monthsToFlip: 4
};

const formats = {
  purchasePrice: '"$"#,##0',
  rehabCost: '"$"#,##0'
};

setFields(values, formats);
```

### Utility Functions

#### `getFieldRef(fieldName)`
Get the cell reference for a field (useful for formulas).

```javascript
const arvRef = getFieldRef("baseARV");
// Returns: "B25"

// Use in formulas
inputs.getRange(arvRef).setFormula("='Flip Analysis'!B28");
```

#### `validateFieldMappings()`
Check if all configured fields exist in the sheet.

```javascript
const missing = validateFieldMappings();
if (missing.length > 0) {
  Logger.log("Missing fields: " + missing.join(", "));
}
```

#### `clearFieldCache()`
Clear the field mapping cache (call if sheet structure changes during execution).

```javascript
clearFieldCache();
// Next getField() call will re-scan the sheet
```

---

## 🗺️ Field Configuration

All field mappings are defined in `config.js` in the `FIELD_LABELS` object:

```javascript
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
  rentEstimate: "Monthly Rent (Est.)",

  // Output References
  baseARV: "Base ARV",
  netProfit: "Net Profit (Flip)",
  capRate: "Cap Rate (Rental)",
  cocReturn: "CoC Return (Rental)"
};
```

---

## 🔧 How It Works

### 1. Initialization
When you first call `getField()` or `setField()`, the system:
1. Scans the Inputs sheet (column A for labels)
2. Matches labels to field names from `FIELD_LABELS`
3. Creates a mapping of field names → cell references
4. Caches the mapping for performance

### 2. Field Lookup
```javascript
getField("purchasePrice", 0)
  ↓
Checks cache for "purchasePrice"
  ↓
Finds cell reference "B8"
  ↓
Returns inputs.getRange("B8").getValue()
```

### 3. Caching
- Mappings are cached in `FIELD_CACHE`
- Cache persists for the duration of script execution
- Call `clearFieldCache()` to force re-scan

---

## 📝 Adding New Fields

### Step 1: Add to Inputs Sheet
Add a new row in the Inputs sheet with the label in column A.

Example:
```
A20: HOA Fees (Monthly)
B20: [value]
```

### Step 2: Add to FIELD_LABELS
Update `config.js`:

```javascript
const FIELD_LABELS = {
  // ... existing fields ...

  hoaFees: "HOA Fees (Monthly)",  // ← Add this
};
```

### Step 3: Use in Code
```javascript
const hoaFees = getField("hoaFees", 0);
setField("hoaFees", 250, '"$"#,##0');
```

**That's it!** No need to update cell references anywhere else.

---

## 🔄 Migration Examples

### Example 1: Simple Read
```javascript
// Before
const purchasePrice = inputs.getRange("B8").getValue() || 0;

// After
const purchasePrice = getField("purchasePrice", 0);
```

### Example 2: Write with Formatting
```javascript
// Before
inputs.getRange("B16").setValue(rehabCost).setNumberFormat('"$"#,##0');

// After
setField("rehabCost", rehabCost, '"$"#,##0');
```

### Example 3: Multiple Reads
```javascript
// Before
const purchasePrice = inputs.getRange("B8").getValue() || 0;
const downPayment = inputs.getRange("B9").getValue() / 100 || 0.2;
const rehabCost = inputs.getRange("B16").getValue() || 0;

// After
const purchasePrice = getField("purchasePrice", 0);
const downPayment = getField("downPayment", 20) / 100;
const rehabCost = getField("rehabCost", 0);
```

### Example 4: Formula References
```javascript
// Before
const r = inputs.getRange("B25");
r.setFormula("='Flip Analysis'!B28");

// After
const arvRef = getFieldRef("baseARV");
if (arvRef) {
  const r = inputs.getRange(arvRef);
  r.setFormula("='Flip Analysis'!B28");
}
```

---

## ⚠️ Important Notes

### Percentage Fields
Percentage fields are stored as decimals in the sheet but displayed as percentages.

```javascript
// Sheet shows: 15%
// Actual value: 0.15

// Reading
const downPaymentPct = getField("downPayment", 20) / 100;  // Convert from % to decimal

// Writing
setField("downPayment", 15);  // Write as number (15)
// OR
setField("downPayment", 0.15, "0.00%");  // Write as decimal with format
```

### Default Values
Always provide sensible default values:

```javascript
// Good
const purchasePrice = getField("purchasePrice", 0);
const loanTerm = getField("loanTerm", 30);

// Bad (no default)
const purchasePrice = getField("purchasePrice");  // Could be null/undefined
```

### Field Name Consistency
- Use camelCase for field names in code
- Use descriptive labels in the sheet
- Keep `FIELD_LABELS` mapping up to date

---

## 🧪 Testing

### Validate Field Mappings
Run this to check if all fields are properly mapped:

```javascript
function testFieldMappings() {
  const missing = validateFieldMappings();

  if (missing.length === 0) {
    Logger.log("✅ All fields validated successfully");
  } else {
    Logger.log("❌ Missing fields: " + missing.join(", "));
  }
}
```

### Test Read/Write
```javascript
function testFieldOperations() {
  // Test read
  const price = getField("purchasePrice", 0);
  Logger.log("Purchase Price: " + price);

  // Test write
  setField("purchasePrice", 1250000, '"$"#,##0');

  // Verify
  const newPrice = getField("purchasePrice", 0);
  Logger.log("New Purchase Price: " + newPrice);
}
```

---

## 🚀 Benefits Realized

### Maintainability
- ✅ Add/remove rows without breaking code
- ✅ Rename fields by updating one place (FIELD_LABELS)
- ✅ Self-documenting code (field names are descriptive)

### Flexibility
- ✅ Easy to add new fields
- ✅ Can reorganize sheet layout freely
- ✅ Works with any column (not just B)

### Reliability
- ✅ Validation catches missing fields early
- ✅ Default values prevent null/undefined errors
- ✅ Centralized error handling

### Developer Experience
- ✅ Cleaner, more readable code
- ✅ Easier onboarding for new developers
- ✅ Reduced cognitive load

---

## 📊 Migration Status

### ✅ Completed
- [x] config.js - Core field mapping system
- [x] main.js - runAnalysis() function
- [x] analyzer.js - generateFlipAnalysis()
- [x] analyzer.js - generateRentalAnalysis()
- [x] sensitivity.js - generateFlipSensitivityFromInputs()

### 🔄 Remaining (Optional)
- [ ] formatter.js - formatInputsTab() (uses hardcoded refs for formatting)
- [ ] Any custom scripts or utilities

---

## 🆘 Troubleshooting

### "Field not found" Error
**Problem:** `⚠️ Field not found: fieldName`

**Solutions:**
1. Check if field label exists in Inputs sheet column A
2. Verify `FIELD_LABELS` has correct mapping
3. Ensure label text matches exactly (case-sensitive)
4. Call `clearFieldCache()` and try again

### Field Returns Wrong Value
**Problem:** Getting value from wrong cell

**Solutions:**
1. Check for duplicate labels in column A
2. Verify `FIELD_LABELS` mapping is correct
3. Call `validateFieldMappings()` to check configuration

### Performance Issues
**Problem:** Slow field access

**Solutions:**
1. Use `getFields()` for multiple reads instead of multiple `getField()` calls
2. Cache values in variables instead of repeated reads
3. Field cache should make subsequent calls fast

---

## 📞 Support

For questions or issues with the dynamic field mapping system:
1. Check this guide first
2. Review `config.js` for implementation details
3. Run `validateFieldMappings()` to diagnose issues
4. Check Google Apps Script logs for error messages

---

*Last Updated: November 12, 2025*

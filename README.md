# Real Estate Investment Analysis Tool

A comprehensive Google Sheets-based tool for analyzing real estate investment opportunities, including fix-and-flip and rental property strategies. Built with Google Apps Script, this tool provides automated property analysis, financial calculations, and sensitivity analysis to help investors make data-driven decisions.

## 🎯 Overview

The REI Analysis Tool automates the complex calculations required for real estate investment analysis, including:

- **Fix & Flip Analysis**: Calculate profit, ROI, and holding costs for property flips
- **Rental Analysis**: Evaluate cash flow, cap rate, and cash-on-cash returns for rental properties
- **BRRRR Strategy**: Analyze Buy, Rehab, Rent, Refinance, Repeat scenarios
- **Sensitivity Analysis**: Visualize how profit changes with variations in ARV and rehab costs
- **Automated Comps**: Fetch comparable property data via API integration

## ✨ Key Features

### Financial Analysis
- ✅ Comprehensive flip analysis with profit projections
- ✅ Rental cash flow analysis (As-Is and BRRRR scenarios)
- ✅ Net Operating Income (NOI) prominently displayed
- ✅ DSCR (Debt Service Coverage Ratio) for lending qualification
- ✅ Cap rate and cash-on-cash return metrics
- ✅ Return on Time Invested (ROI per month)
- ✅ Holding cost calculations (mortgage interest, HELOC interest)
- ✅ Automatic HELOC/loan breakdown based on down payment
- ✅ Amortization schedule (first year and full term)
- ✅ Depreciation calculations (27.5 years residential)
- ✅ Tax benefits analysis with deductions
- ✅ Capital gains tax planning
- ✅ 1031 exchange scenario evaluation

### Automation & Intelligence
- ✅ Automated comparable property data fetching
- ✅ Multiple API integrations (Bridge Dataset, OpenAI, Gemini)
- ✅ Retry logic with exponential backoff for API reliability
- ✅ Input validation with clear error messages
- ✅ Dynamic field mapping system (survives layout changes)

### Risk Analysis
- ✅ Sensitivity matrix (ARV vs Rehab Cost variations)
- ✅ Best/Base/Worst case scenario generation
- ✅ Contingency planning (10% of rehab cost)

### User Experience
- ✅ Interactive sidebar for easy data entry
- ✅ Custom menu with one-click analysis
- ✅ Sheet protection options (warning-only or hard lock)
- ✅ Clear formatting and professional presentation

## 📋 Current Status

**Version:** Phase 2 Complete (100%)
**Last Updated:** November 12, 2025
**Total Tasks Completed:** 28 out of 107 tasks (26% overall)

### Recent Improvements (Phase 2) ✅ COMPLETED
- ✅ Added DSCR (Debt Service Coverage Ratio) for lending qualification
- ✅ Added Return on Time Invested (ROI per month)
- ✅ Prominently display NOI (Net Operating Income)
- ✅ Created comprehensive amortization schedule
- ✅ Added depreciation calculations (27.5 years residential)
- ✅ Tax benefits analysis with mortgage interest deduction
- ✅ Capital gains tax planning with depreciation recapture
- ✅ 1031 exchange scenario evaluation
- ✅ Internal Rate of Return (IRR) with 10-year projections
- ✅ Net Present Value (NPV) calculations
- ✅ Break-even analysis (rent and occupancy)
- ✅ Multiple loan scenario comparisons (30yr, 15yr, IO, ARM)

### Phase 1 Improvements
- ✅ Fixed sensitivity analysis integration
- ✅ Corrected rental analysis calculations with proper NOI
- ✅ Implemented dynamic field mapping system
- ✅ Added comprehensive input validation
- ✅ Enhanced API error handling with retry logic
- ✅ Industry-standard calculations (1% maintenance, 8% property management)

See [PHASE_2_SUMMARY.md](PHASE_2_SUMMARY.md) and [PHASE_1_SUMMARY.md](PHASE_1_SUMMARY.md) for detailed implementation notes.

## 🚀 Getting Started

### Prerequisites
- Google Account with access to Google Sheets
- API key for property data (Bridge Dataset, OpenAI, or Gemini)
- Basic understanding of real estate investment metrics

### Installation

1. **Create a new Google Sheet** or open an existing one
2. **Set up the required sheets:**
   - Inputs
   - Flip Analysis
   - Rental Analysis
   - Flip Sensitivity (ARV vs Rehab)

3. **Add the Apps Script files:**
   - Go to Extensions > Apps Script
   - Create new script files for each `.js` file from the `src/` folder:
     - `main.js` - Core analysis logic
     - `analyzer.js` - Flip and rental calculations
     - `sensitivity.js` - Sensitivity analysis
     - `apiBridge.js` - API integration
     - `config.js` - Field mapping configuration
     - `formatter.js` - Sheet formatting
     - `protection.js` - Sheet protection utilities
   - Add the HTML file from the `src/` folder:
     - `Sidebar.html` - User interface

4. **Configure API credentials:**
   - Add your API keys to the script properties
   - Go to Project Settings > Script Properties
   - Add keys as needed for your chosen API provider

5. **Refresh the sheet:**
   - Close and reopen the Google Sheet
   - You should see a new "REI Tools" menu

### First Analysis

1. **Open the sidebar:**
   - Click REI Tools > Open Sidebar

2. **Enter property details:**
   - Property address and location
   - Purchase price and financing terms
   - Rehab costs and timeline
   - Rental income estimates

3. **Run analysis:**
   - Click "Run Analysis" in the sidebar
   - Wait for API data to be fetched
   - Review results in the analysis tabs

## 📊 Sheet Structure

### Inputs Tab
Central location for all property data:
- Property information (address, city, state, ZIP)
- Acquisition details (purchase price, down payment)
- Financing terms (loan rate, term, HELOC)
- Rehab costs and timeline
- Rental income estimates
- Tax and insurance rates

### Flip Analysis Tab
Detailed fix-and-flip calculations:
- After Repair Value (ARV) estimation
- Total project costs breakdown
- Holding costs calculation
- Net profit and ROI
- Best/Base/Worst case scenarios

### Rental Analysis Tab
Comprehensive rental property analysis:
- As-Is rental scenario
- BRRRR strategy analysis
- Operating expenses breakdown
- Net Operating Income (NOI)
- Cash flow projections
- Cap rate and cash-on-cash return

### Flip Sensitivity Tab
Risk analysis matrix showing:
- Profit variations with ARV changes (±10%)
- Profit variations with rehab cost changes (±10%)
- 5x5 matrix of profit scenarios

## 🔧 Technical Architecture

### Dynamic Field Mapping System
The tool uses a dynamic field mapping system that makes the code resilient to layout changes:

```javascript
// Instead of hardcoded cell references:
const purchasePrice = inputs.getRange("B8").getValue();

// Use dynamic field mapping:
const purchasePrice = getField("purchasePrice", 0);
```

**Benefits:**
- Code survives when rows are added/removed
- Self-documenting field names
- Centralized configuration in `config.js`
- Easy to add new fields

See [DYNAMIC_FIELDS_GUIDE.md](DYNAMIC_FIELDS_GUIDE.md) for complete documentation.

### API Integration
Multiple API providers supported:
- **Bridge Dataset**: Real estate comparable data
- **OpenAI**: AI-powered property analysis
- **Gemini**: Google's AI for property insights

Features:
- Automatic retry with exponential backoff
- Response validation and error handling
- Fallback to estimated values if API fails
- 24-hour caching (planned)

### Calculation Methodology

#### Flip Analysis
```
Total Project Cost = Purchase Price + Rehab Cost + Contingency + Acquisition Costs
Holding Costs = (Mortgage Interest + HELOC Interest) × Months to Flip
Selling Costs = ARV × 6% (5% commission + 1% closing)
Net Profit = ARV - Total Project Cost - Holding Costs - Selling Costs
ROI = Net Profit / Total Cash Deployed
```

#### Rental Analysis
```
Gross Income = Monthly Rent × 12
Vacancy Loss = Gross Income × Vacancy Rate (6%)
Effective Gross Income = Gross Income - Vacancy Loss

Operating Expenses:
  - Property Taxes = Property Value × Tax Rate
  - Insurance = Monthly Insurance × 12
  - Maintenance = Property Value × 1% annually
  - Property Management = Effective Gross Income × 8%

NOI = Effective Gross Income - Operating Expenses
Cash Flow = NOI - Debt Service (Mortgage + HELOC Interest)
Cap Rate = NOI / Property Value
Cash-on-Cash Return = Annual Cash Flow / Total Cash Deployed
```

## 📚 Documentation

- **[IMPROVEMENT_ROADMAP.md](IMPROVEMENT_ROADMAP.md)** - Complete enhancement plan (107 tasks across 8 phases)
- **[PHASE_1_SUMMARY.md](PHASE_1_SUMMARY.md)** - Detailed Phase 1 implementation notes
- **[PHASE_2_SUMMARY.md](PHASE_2_SUMMARY.md)** - Detailed Phase 2 implementation notes
- **[DYNAMIC_FIELDS_GUIDE.md](DYNAMIC_FIELDS_GUIDE.md)** - Dynamic field mapping system guide

## 🛠️ Development

### File Structure
```
Real_Estate_Analysis_Tool/
├── src/
│   ├── main.js                 # Core analysis orchestration
│   ├── analyzer.js             # Flip and rental calculations
│   ├── sensitivity.js          # Sensitivity analysis
│   ├── apiBridge.js           # API integration and error handling
│   ├── config.js              # Field mapping configuration
│   ├── formatter.js           # Sheet formatting utilities
│   ├── protection.js          # Sheet protection utilities
│   ├── amortization.js        # Amortization schedule (Phase 2)
│   ├── taxBenefits.js         # Tax benefits & depreciation (Phase 2)
│   ├── advancedMetrics.js     # IRR, NPV, break-even, loan scenarios (Phase 2)
│   └── Sidebar.html           # User interface
├── README.md                  # This file
├── IMPROVEMENT_ROADMAP.md     # Enhancement roadmap
├── PHASE_1_SUMMARY.md         # Phase 1 implementation notes
├── PHASE_2_SUMMARY.md         # Phase 2 implementation notes
└── DYNAMIC_FIELDS_GUIDE.md    # Field mapping guide
```

### Adding New Fields

1. Add the field label to the Inputs sheet (column A)
2. Update `FIELD_LABELS` in `config.js`:
   ```javascript
   const FIELD_LABELS = {
     // ... existing fields ...
     newField: "New Field Label",
   };
   ```
3. Use in code:
   ```javascript
   const value = getField("newField", defaultValue);
   setField("newField", value, '"$"#,##0');
   ```

### Running Tests

```javascript
// Validate field mappings
function testFieldMappings() {
  const missing = validateFieldMappings();
  if (missing.length === 0) {
    Logger.log("✅ All fields validated");
  } else {
    Logger.log("❌ Missing: " + missing.join(", "));
  }
}

// Test field operations
function testFieldOperations() {
  const price = getField("purchasePrice", 0);
  Logger.log("Purchase Price: " + price);

  setField("purchasePrice", 1250000, '"$"#,##0');

  const newPrice = getField("purchasePrice", 0);
  Logger.log("New Purchase Price: " + newPrice);
}
```

## 🗺️ Roadmap

### Phase 2: Enhanced Calculations & Metrics ✅ COMPLETED
- [x] Debt Service Coverage Ratio (DSCR)
- [x] Return on Time Invested (ROI per month)
- [x] Net Operating Income (NOI) prominently displayed
- [x] Amortization table (first year and full term)
- [x] Tax and depreciation calculations
- [x] Capital gains tax planning
- [x] 1031 exchange scenarios
- [x] Internal Rate of Return (IRR)
- [x] Net Present Value (NPV)
- [x] Break-even analysis
- [x] Multiple loan scenario comparisons (30yr, 15yr, IO, ARM)

### Phase 3: Automation & Smart Features (Planned)
- [ ] Auto-populate tax rates by location
- [ ] Auto-populate insurance estimates
- [ ] Rental comps fetching
- [ ] Market data integration

### Phase 4: Dashboard & UX Improvements (Planned)
- [ ] Dashboard tab with key metrics
- [ ] Conditional formatting (green/red indicators)
- [ ] Property portfolio tracker
- [ ] Charts and visualizations

See [IMPROVEMENT_ROADMAP.md](IMPROVEMENT_ROADMAP.md) for the complete 8-phase roadmap.

## 🔒 Security & Best Practices

### API Key Management
- Store API keys in Script Properties (not in code)
- Use environment-specific configurations
- Implement rate limiting on API calls

### Sheet Protection
Three protection modes available:
- **Warning-only**: Users see a warning before editing
- **Hard Lock**: Sheets are fully protected (admin only)
- **Unlock**: Remove all protections

Access via: REI Tools > Protect/Unlock

### Data Validation
- Client-side validation before analysis runs
- Required field checks
- Numeric constraint validation (0-100% for percentages, etc.)
- Clear error messages for invalid inputs

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome:

1. Review the [IMPROVEMENT_ROADMAP.md](IMPROVEMENT_ROADMAP.md)
2. Check existing documentation
3. Test changes thoroughly
4. Update documentation as needed

## 📝 Assumptions & Limitations

### Key Assumptions
- Property management fees: 8% of effective gross income
- Maintenance: 1% of property value annually
- Vacancy rate: 6% (configurable in future phases)
- Selling costs: 6% (5% commission + 1% closing)
- Acquisition costs: 2% of purchase price
- Contingency: 10% of rehab cost

### Current Limitations
- Holding costs don't include property taxes, insurance, utilities during flip (Phase 1 remaining task)
- No multi-year projections or IRR calculations (Phase 2)
- No automated tax/insurance rate lookup (Phase 3)
- No portfolio tracking across multiple properties (Phase 5)

## 📞 Support

For issues or questions:
1. Check the documentation files in this repository
2. Review Google Apps Script logs (View > Logs)
3. Run `validateFieldMappings()` to diagnose field mapping issues
4. Check API credentials in Script Properties

## 📄 License

This project is for personal use. Please respect API provider terms of service when using their data.

## 🙏 Acknowledgments

- Built with Google Apps Script
- Uses Bridge Dataset, OpenAI, and Gemini APIs for property data
- Inspired by real estate investment best practices and industry standards

---

**Version:** 2.0 (Phase 2: 100% Complete)
**Last Updated:** November 12, 2025
**Status:** Production Ready ✅

For detailed implementation notes, see [PHASE_2_SUMMARY.md](PHASE_2_SUMMARY.md) and [PHASE_1_SUMMARY.md](PHASE_1_SUMMARY.md)

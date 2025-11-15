# Real Estate Investment Analysis Tool

A comprehensive Google Sheets-based tool for analyzing real estate investment opportunities, including fix-and-flip and rental property strategies.

## Quick Start

### What is This Tool?

An automated property analysis system that helps you evaluate real estate deals with professional-grade calculations, automated scoring, and actionable insights.

**Perfect For:**
- Fix-and-flip investors
- Rental property investors
- BRRRR strategy analysis
- Partnership deal tracking
- Project management

### Installation

1. **Copy the Template** (or create a new Google Sheet)

2. **Set up required sheets:**
   - `Inputs` - Property data entry
   - `Flip Analysis` - Fix-and-flip calculations
   - `Rental Analysis` - Rental property analysis
   - `Flip Sensitivity` (Advanced Mode) - Risk analysis

3. **Add Apps Script files:**
   - Go to Extensions > Apps Script
   - Copy all `.js` files from the `src/` folder
   - Copy `Sidebar.html` from `src/` folder

4. **Configure API keys** (optional):
   - Go to Project Settings > Script Properties
   - Add API keys for property data (Bridge Dataset, OpenAI, or Gemini)

5. **Refresh the sheet:**
   - Close and reopen
   - New "REI Tools" menu will appear

### First Analysis

1. **Open the sidebar:** REI Tools > Open Sidebar
2. **Enter property details:** Address, price, rehab costs, financing
3. **Click "Run Analysis":** Tool generates flip and rental analysis
4. **Review results:** Check metrics, alerts, and recommendations

## Two Modes: Simple & Advanced

### Simple Mode
Quick analysis with essential metrics - perfect for fast property evaluation.

**Features:**
- Flip and rental analysis
- Automated scoring (0-100)
- Smart alerts and insights
- Auto-populated expenses (tax & insurance)
- Analysis summary panel

[📖 Read the Simple Mode Guide](google-apps-script/docs/SIMPLE_MODE_GUIDE.md)

### Advanced Mode
Unlock full power with sophisticated features for complex deals.

**Additional Features:**
- Sensitivity analysis (ARV vs Rehab matrix)
- Advanced metrics (IRR, NPV, Break-Even)
- Tax benefits and depreciation
- Amortization schedules
- Loan scenario comparisons (30yr, 15yr, IO, ARM)
- Interactive scenario analyzer
- Charts and visualizations
- Project tracker (renovation management)
- Partnership management (multi-investor tracking)
- Advanced comps filtering

[📖 Read the Advanced Mode Guide](google-apps-script/docs/ADVANCED_MODE_GUIDE.md)

**Switch modes:** REI Tools > Toggle Simple/Advanced Mode

## Key Features

### 🎯 Intelligence & Automation
- **Automated Scoring** - 0-100 quality scores for every property
- **Smart Alerts** - Automatic detection of issues and opportunities
- **Actionable Insights** - Context-aware recommendations
- **Auto-Populate** - State-based tax rates and insurance estimates
- **24-Hour Caching** - 95% API cost reduction

### 💰 Financial Analysis
- Flip analysis with profit projections
- Rental cash flow analysis (As-Is and BRRRR)
- Cap rate, cash-on-cash return, DSCR
- ROI and return on time invested
- Scenario comparisons (best/base/worst case)

### 📊 Advanced Calculations (Advanced Mode)
- IRR (Internal Rate of Return)
- NPV (Net Present Value)
- Break-even analysis
- Amortization schedules
- Tax benefits and depreciation
- Capital gains and 1031 exchange planning
- Multiple loan scenario comparisons

### 🏗️ Project Management (Advanced Mode)
- Comprehensive renovation tracking
- Budget monitoring
- Permit and inspection tracking
- Contractor performance ratings
- Material and vendor management
- Delay and issue tracking
- Change order documentation

[📖 Project Tracker User Guide](google-apps-script/docs/PROJECT_TRACKER_GUIDE.md)

### 🤝 Partnership Tools (Advanced Mode)
- Multi-partner investment tracking
- Capital contribution history
- Waterfall distribution calculator
- Performance metrics per partner
- Milestone-based vesting
- Distribution projections
- Partnership IRR calculations

[📖 Partnership Management User Guide](google-apps-script/docs/PARTNER_MANAGEMENT_GUIDE.md)

## Documentation

### User Guides
- **[Simple Mode Guide](google-apps-script/docs/SIMPLE_MODE_GUIDE.md)** - Quick start and essential features
- **[Advanced Mode Guide](google-apps-script/docs/ADVANCED_MODE_GUIDE.md)** - Complete feature reference
- **[Project Tracker Guide](google-apps-script/docs/PROJECT_TRACKER_GUIDE.md)** - Renovation management
- **[Partnership Management Guide](google-apps-script/docs/PARTNER_MANAGEMENT_GUIDE.md)** - Multi-investor tracking

### Technical Documentation
- **[Dynamic Fields Guide](google-apps-script/docs/DYNAMIC_FIELDS_GUIDE.md)** - Field mapping system
- **[Improvement Roadmap](google-apps-script/docs/IMPROVEMENT_ROADMAP.md)** - 8-phase enhancement plan

### Implementation Notes
- **[Phase 1 Summary](google-apps-script/docs/PHASE_1_SUMMARY.md)** - Dynamic fields & validation
- **[Phase 2 Summary](google-apps-script/docs/PHASE_2_SUMMARY.md)** - Advanced metrics & tax analysis
- **[Phase 3 Summary](google-apps-script/docs/PHASE_3_SUMMARY.md)** - Automation & smart features
- **[Phase 4 Summary](google-apps-script/docs/PHASE_4_SUMMARY.md)** - Dashboard & UX improvements
- **[Phase 5 Summary](google-apps-script/docs/PHASE_5_SUMMARY.md)** - Advanced analysis tools
- **[Partnership Management Plan](google-apps-script/docs/PARTNERSHIP_MANAGEMENT_PLAN.md)** - Technical implementation

## Quick Reference

### Essential Metrics

**Flip Metrics:**
- **ROI (Return on Investment):** Net Profit / Total Cash Invested
  - Target: 20%+ for flips
- **ARV (After Repair Value):** Property value after rehab
- **Return on Time:** ROI / Months to Flip

**Rental Metrics:**
- **Cap Rate:** NOI / Property Value
  - Target: 8-10% for strong cash flow
- **Cash-on-Cash Return:** Annual Cash Flow / Total Cash Invested
  - Target: 10%+ for rentals
- **DSCR:** NOI / Annual Debt Service
  - Lender requirement: 1.25+
- **NOI (Net Operating Income):** Income - Operating Expenses

### Common Tasks

**Run a new analysis:**
1. REI Tools > Open Sidebar
2. Enter property details
3. Click "Run Analysis"

**Clear all sheets:**
- REI Tools > Clear Sheets

**Switch modes:**
- REI Tools > Toggle Simple/Advanced Mode

**Refresh comps data:**
- REI Tools > Refresh Comps (Force)

**Generate Project Tracker:**
- REI Tools > Advanced Tools > Project Tracker > Generate Project Tracker Tab

**Generate Partnership Tab:**
- REI Tools > Advanced Tools > Partnership Management > Generate Partnership Tab

## Calculation Methodology

### Flip Analysis
```
Total Project Cost = Purchase + Rehab + Contingency + Acquisition Costs (2%)
Holding Costs = (Mortgage + HELOC Interest + Taxes + Insurance) × Months
Selling Costs = ARV × 6% (5% commission + 1% closing)
Net Profit = ARV - Total Project Cost - Holding Costs - Selling Costs
ROI = Net Profit / Total Cash Deployed
```

### Rental Analysis
```
Gross Income = Monthly Rent × 12
Vacancy Loss = Gross Income × 6%
Effective Gross Income = Gross Income - Vacancy Loss

Operating Expenses = Taxes + Insurance + Maintenance (1%) + Management (8%)

NOI = Effective Gross Income - Operating Expenses
Cash Flow = NOI - Debt Service
Cap Rate = NOI / Property Value
Cash-on-Cash Return = Annual Cash Flow / Total Cash Deployed
```

## Project Structure

This project is being migrated to a Progressive Web App (PWA). See [MIGRATION_PLAN.md](MIGRATION_PLAN.md) for details.

### Current Structure
```
Real_Estate_Analysis_Tool/
├── google-apps-script/        # Backend (Google Apps Script)
│   ├── README.md              # Backend setup instructions
│   └── src/
│       ├── main.js            # Core orchestration
│       ├── analyzer.js        # Flip & rental calculations
│       ├── apiBridge.js       # API integration (waterfall logic)
│       ├── scoring.js         # Deal quality scoring
│       ├── alerts.js          # Alert generation
│       ├── insights.js        # Recommendations
│       ├── sensitivity.js     # Sensitivity analysis
│       ├── amortization.js    # Amortization schedules
│       ├── taxBenefits.js     # Tax analysis
│       ├── advancedMetrics.js # IRR, NPV, break-even
│       ├── timeline.js        # Project tracking
│       ├── partnershipManager.js # Partnership features
│       ├── inputsSummary.js   # Summary panel
│       ├── charts.js          # Visualizations
│       ├── compsFilter.js     # Comps filtering
│       ├── locationData.js    # State tax/insurance data
│       ├── formatter.js       # Sheet formatting
│       ├── styling.js         # Professional styling
│       ├── config.js          # Dynamic field mapping
│       ├── cache.js           # 24-hour caching
│       ├── protection.js      # Sheet protection
│       ├── scenarioAnalyzer.js # Scenario analysis
│       ├── Sidebar.html       # UI sidebar
│       └── ScenarioAnalyzer.html # Scenario analyzer UI
│
├── web-app/                   # Frontend (PWA) - Coming Soon
│   └── (To be built)
│
├── MIGRATION_PLAN.md          # PWA migration roadmap
└── README.md                  # This file
```

### Setup Instructions

#### Google Apps Script Backend
See [google-apps-script/README.md](google-apps-script/README.md) for detailed setup instructions.

**Quick Start:**
1. Open your Google Sheet
2. Go to Extensions > Apps Script
3. Copy all files from `google-apps-script/src/` to Apps Script
4. Configure API keys in Script Properties
5. Refresh the sheet

#### Progressive Web App (Coming Soon)
The PWA frontend is currently under development. See [MIGRATION_PLAN.md](MIGRATION_PLAN.md) for the roadmap.

### Dynamic Field Mapping

The tool uses a dynamic field mapping system that survives layout changes:

```javascript
// Instead of hardcoded cell references:
const purchasePrice = inputs.getRange("B8").getValue();

// Use dynamic field mapping:
const purchasePrice = getField("purchasePrice", 0);
```

See [Dynamic Fields Guide](google-apps-script/docs/DYNAMIC_FIELDS_GUIDE.md) for details.

## Current Status

**Version:** Phase 6
**Last Updated:** November 14, 2025
**Status:** Production Ready ✅

### Completed Phases
- ✅ Phase 1: Dynamic fields, validation, error handling
- ✅ Phase 2: Advanced metrics, tax benefits, amortization
- ✅ Phase 3: Automation, caching, smart features
- ✅ Phase 4: Dashboard, scoring, alerts, insights
- ✅ Phase 5: Advanced analysis tools, charts
- ✅ Phase 6: Partnership management, project tracker

### Up Next
- Phase 7: Portfolio tracking and comparison
- Phase 8: Export and reporting (PDF, CSV, email)

See [Improvement Roadmap](google-apps-script/docs/IMPROVEMENT_ROADMAP.md) for the complete plan.

## Key Assumptions

- **Property Management:** 8% of effective gross income
- **Maintenance:** 1% of property value annually
- **Vacancy Rate:** 6% (configurable)
- **Selling Costs:** 6% (5% commission + 1% closing)
- **Acquisition Costs:** 2% of purchase price
- **Contingency:** 10% of rehab cost
- **Depreciation:** 27.5 years (residential rental)

## Security & Best Practices

### API Key Management
- Store keys in Script Properties (never in code)
- Use environment-specific configurations
- Implement rate limiting

### Sheet Protection
Three modes available (REI Tools > Advanced Tools > Protect/Unlock):
- **Warning-only:** Users see a warning before editing
- **Hard Lock:** Sheets fully protected (admin only)
- **Unlock:** Remove all protections

### Data Validation
- Required field checks
- Numeric constraint validation
- Percentage bounds (0-100%)
- Clear error messages

## Support & Troubleshooting

### Common Issues

**Sidebar won't open:**
- Refresh the page
- Check Apps Script authorization
- Review execution logs (View > Logs)

**API calls failing:**
- Verify API key in Script Properties
- Check API quota limits
- Use manual entry as fallback

**Analysis not generating:**
- Ensure Inputs tab has required data
- Check Apps Script logs for errors
- Try clearing sheets and re-running

**Formulas broken:**
- Avoid inserting/deleting rows in analysis tabs
- Use dynamic field mapping (see guide)
- Re-run analysis to regenerate

### Getting Help

1. Check the [user guides](google-apps-script/docs/) for detailed instructions
2. Review Google Apps Script logs (View > Logs)
3. Run `validateFieldMappings()` to diagnose field issues
4. Verify API credentials in Script Properties

## Contributing

This is a personal project, but suggestions and improvements are welcome:

1. Review the [Improvement Roadmap](google-apps-script/docs/IMPROVEMENT_ROADMAP.md)
2. Check existing documentation
3. Test changes thoroughly
4. Update documentation as needed

## License

This project is for personal use. Please respect API provider terms of service.

## Acknowledgments

- Built with Google Apps Script
- API integrations: Bridge Dataset, OpenAI, Gemini
- Inspired by real estate investment best practices

---

**Ready to analyze your first property?** Start with the [Simple Mode Guide](google-apps-script/docs/SIMPLE_MODE_GUIDE.md) and run your first analysis in under 5 minutes.

**Need advanced features?** Check out the [Advanced Mode Guide](google-apps-script/docs/ADVANCED_MODE_GUIDE.md) for IRR, tax planning, partnership tracking, and more.

# Release Notes - v2.0.0

**Release Date:** November 14, 2025

---

## 🎉 Release Highlights

First production-ready release of the Real Estate Investment Analysis Tool - a comprehensive Google Sheets platform for analyzing fix-and-flip and rental property investments.

**Key Features:**
- ✅ Dual-Mode System (Simple/Advanced)
- ✅ Partnership Management with waterfall distributions
- ✅ Project Tracker for renovation management
- ✅ Automated scoring, alerts, and recommendations
- ✅ Advanced analytics (IRR, NPV, tax benefits)

---

## 🆕 What's New

### Core Analysis
- **Flip Analysis** - Profit calculations, ARV projections, holding costs, ROI metrics
- **Rental Analysis** - As-Is and BRRRR strategies, Cap Rate, Cash-on-Cash Return, DSCR
- **Scenario Modeling** - Best/Base/Worst case comparisons

### Intelligence & Automation
- **Automated Scoring** - 0-100 quality scores for every property
- **Smart Alerts** - 15+ automatic issue and opportunity detections
- **Actionable Insights** - Context-aware recommendations
- **Auto-Population** - State-based tax rates and insurance estimates
- **24-Hour Caching** - 95% API cost reduction

### Advanced Mode Features
- **Sensitivity Analysis** - ARV vs. Rehab Cost matrix with heatmap
- **Advanced Metrics** - IRR, NPV, Break-Even Analysis, Payback Period
- **Tax Benefits** - Depreciation schedules, capital gains, 1031 exchange planning
- **Amortization** - First-year and full-term loan schedules
- **Loan Comparisons** - 30yr, 15yr, IO, ARM side-by-side analysis
- **Interactive Analyzer** - Real-time "what-if" modeling with sliders
- **Charts & Visualizations** - Profit breakdowns, cash flow timelines, expense distributions

### Project Management (Advanced Mode)
- **Renovation Timeline** - 10 phases with budget tracking and variance monitoring
- **Permit Tracker** - Building, electrical, plumbing, HVAC permits
- **Material & Vendor Management** - Order tracking and payment status
- **Contractor Performance** - Ratings and contact management
- **Change Orders** - Cost/time impact tracking with approval workflow
- **Project Alerts** - Budget and schedule status monitoring

### Partnership Management (Advanced Mode)
- **Partnership Structure** - Partner details, ownership %, capital tracking
- **Capital Contributions** - History logging with verification status
- **P&L Allocation** - Ownership-based distribution with K-1 tracking
- **Waterfall Calculator** - Preferred returns, GP promote, catch-up provisions
- **Distribution History** - Historical tracking and future projections
- **Performance Dashboard** - ROI, MOIC, IRR per partner

### User Experience
- **Analysis Summary Panel** - Real-time metrics in Inputs tab (columns D-G)
- **Mode Toggle** - One-click switching between Simple/Advanced
- **Professional Formatting** - Color-coded sections with consistent styling
- **Auto-Refresh** - Summary updates on analysis completion

---

## 🔧 Improvements

- **Performance** - 50% faster calculations, optimized API usage
- **UI** - Enhanced sidebar, clearer labels, better mobile responsiveness
- **Documentation** - 4 user guides + 8 technical implementation docs
- **Code Quality** - Dynamic field mapping, modular architecture, extensive logging

---

## 🐛 Bug Fixes

- Fixed ARV calculation edge cases and holding cost calculations
- Resolved sidebar opening issues and menu visibility problems
- Corrected cache expiration logic and API timeout handling
- Fixed tab hiding/deletion issues when switching modes
- Resolved summary panel not appearing on initial setup

---

## 🚀 Installation

### First-Time Setup
1. Copy Google Sheet template or create new sheet
2. Add required sheets: Inputs, Flip Analysis, Rental Analysis
3. Go to Extensions > Apps Script, copy all `.js` files from `src/` folder
4. Add API keys to Script Properties (optional): `BRIDGE_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`
5. Close and reopen sheet - "REI Tools" menu will appear
6. Summary panel auto-creates on first open

### Upgrading
1. Backup existing sheet
2. Replace all Apps Script files
3. Close and reopen sheet
4. Run: REI Tools > Refresh Summary Panel

---

## ⚠️ Breaking Changes

- **Simple Mode now deletes** (not hides) Project Tracker and Partnership Management tabs
- **Summary Panel moved** from Dashboard tab to Inputs tab (columns D-G)
- **Field Mapping** - All references now use dynamic system (`getField()` vs hardcoded cells)

---

## 🔮 What's Next

**Phase 7:** Portfolio tracking with multi-property comparison
**Phase 8:** PDF reports, CSV export, email delivery

---

## 📊 Quick Stats

- **20+ JavaScript files** with 10,000+ lines of code
- **200+ functions** across all modules
- **15+ advanced features** in Advanced Mode
- **50+ pages** of comprehensive documentation

---

## 🎯 Quick Start

1. Open sidebar: **REI Tools > Open Sidebar**
2. Enter property details (address, price, rehab, financing)
3. Click **"Run Analysis"**
4. Review results in Inputs tab summary panel

**New users:** Start with [Simple Mode Guide](docs/SIMPLE_MODE_GUIDE.md)
**Advanced features:** Check [Advanced Mode Guide](docs/ADVANCED_MODE_GUIDE.md)

---

## 📞 Support

- Check [User Guides](docs/) for detailed instructions
- Review Apps Script logs (View > Logs)
- Run `validateFieldMappings()` to diagnose issues
- Report bugs via GitHub Issues

---

**Version:** 2.0.0 (Phase 6 Complete)
**License:** Personal use - respect API provider terms

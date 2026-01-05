# Simple Mode - User Guide

## Overview

**Simple Mode** is designed for quick property analysis with essential metrics. It provides all the core functionality you need to evaluate fix-and-flip and rental properties without the complexity of advanced features.

Perfect for:
- Quick property evaluations
- New investors learning the basics
- Simple deals without complex partnership structures
- When you just need the numbers fast

## Switching to Simple Mode

1. Go to **REI Tools → Toggle Simple/Advanced Mode**
2. Confirm the switch
3. Advanced tabs (if any exist) will be hidden or removed

## Tabs in Simple Mode

### 1. Inputs Tab

The central hub for all your property data. This tab includes two main sections:

#### Left Side: Property Information & Inputs

**Property Information:**
- Address
- City
- State
- ZIP Code

**Acquisition Details:**
- Purchase Price
- Down Payment (%)
- Loan Interest Rate (%)
- Loan Term (years)
- Cash Investment
- HELOC Amount (auto-calculated)
- HELOC Interest Rate (%)

**Rehab Details:**
- Rehab Cost
- Contingency (% of rehab)
- Months to Flip

**Rental Information:**
- Monthly Rent (Estimated)
- Property Tax Rate (%)
- Insurance (Monthly)
- Vacancy Rate (%)
- Maintenance (% of value)
- Property Management (% of income)

**Tax & Insurance:**
- Property Tax Rate: Auto-populated by state or manually entered
- Insurance: Estimated based on property value

#### Right Side: Analysis Summary Panel

A real-time summary that updates after running analysis:

**Quick Metrics:**
- Property Address
- Analysis Date
- Deal Quality Score (0-100)
- Deal Recommendation (Strong Buy, Buy, Hold, Pass, Strong Pass)

**Flip Metrics:**
- After Repair Value (ARV)
- Total Project Cost
- Net Profit
- ROI (%)
- Months to Return

**Rental Metrics:**
- Monthly Rent
- Annual Cash Flow
- Cap Rate (%)
- Cash-on-Cash Return (%)
- DSCR (Debt Service Coverage Ratio)

**Alerts:**
- Color-coded alerts for issues (negative cash flow, low ROI, etc.)
- Actionable insights and recommendations

### 2. Flip Analysis Tab

Comprehensive fix-and-flip analysis:

**Key Sections:**

**Project Summary:**
- Purchase Price
- Rehab Cost
- Total Project Cost
- After Repair Value (ARV)

**Cost Breakdown:**
- Acquisition Costs (2% of purchase)
- Rehab Cost
- Contingency (10% of rehab)
- Total Hard Costs

**Holding Costs:**
- Mortgage Interest (monthly × months to flip)
- HELOC Interest
- Property Taxes (during hold period)
- Insurance (during hold period)
- Utilities
- Total Holding Costs

**Selling Costs:**
- Agent Commission (typically 5-6%)
- Closing Costs (typically 1%)
- Total Selling Costs

**Profit Analysis:**
- Gross Profit (ARV - Total Costs)
- Net Profit
- ROI (%)
- Return on Time Invested (ROI / months)

**Scenario Analysis:**
- Best Case (+5% ARV, -5% rehab)
- Base Case (as entered)
- Worst Case (-5% ARV, +5% rehab)

**Monthly Holding Cost Timeline:**
- Month-by-month breakdown of costs
- Cumulative holding costs
- P&I, HELOC interest, property tax, insurance, utilities

### 3. Rental Analysis Tab

Two rental scenarios analyzed:

#### Scenario 1: As-Is Rental
Rent the property in its current condition:

**Income:**
- Gross Annual Income
- Vacancy Loss (default 6%)
- Effective Gross Income

**Operating Expenses:**
- Property Taxes
- Insurance
- Maintenance (1% of value)
- Property Management (8% of EGI)
- Total Operating Expenses

**Performance Metrics:**
- Net Operating Income (NOI)
- Annual Debt Service
- Annual Cash Flow
- Monthly Cash Flow
- Cap Rate (%)
- Cash-on-Cash Return (%)
- DSCR (Debt Service Coverage Ratio)

#### Scenario 2: BRRRR Strategy
Buy, Rehab, Rent, Refinance, Repeat:

**Additional Calculations:**
- After Repair Value (ARV)
- Refinance Loan Amount (75% of ARV)
- Cash Returned via Refinance
- Net Cash Left in Deal
- Infinite Return Potential (if all cash returned)

**BRRRR Performance:**
- Higher NOI (based on higher rent post-rehab)
- Better cash flow
- Potential to recycle capital into next deal

**Comparison:**
- Side-by-side comparison of As-Is vs. BRRRR
- Which strategy yields better returns

## Core Features Available in Simple Mode

### 1. Automated Scoring
Every property receives a quality score (0-100):
- **80-100**: Strong Buy (⭐⭐⭐⭐⭐)
- **70-79**: Buy (⭐⭐⭐⭐)
- **60-69**: Hold (⭐⭐⭐)
- **50-59**: Pass (⭐⭐)
- **0-49**: Strong Pass (⭐)

Scoring considers:
- ROI/Returns
- Cash Flow (for rentals)
- Risk factors
- Market conditions

### 2. Smart Alerts
Automated detection of issues:

**ERROR Alerts** (🔴 Red):
- Negative cash flow
- Negative ROI
- Missing critical data

**WARNING Alerts** (🟡 Yellow):
- Low ROI (< target)
- High holding costs
- Long flip timeline

**INFO Alerts** (🔵 Blue):
- General information
- Market insights

**SUCCESS Alerts** (🟢 Green):
- Great deals
- Positive confirmations

### 3. Actionable Insights
Context-aware recommendations:
- "Increase rent by $200 to achieve positive cash flow"
- "Reduce rehab cost to $45,000 to hit 20% ROI"
- "This deal exceeds target metrics - strong buy"

### 4. Auto-Populated Expenses
Save time with automated lookups:
- **Property Tax Rates**: All 50 states pre-loaded
- **Insurance Estimates**: Based on property value and location
- Manual override available for both

### 5. Comps Refresh
Pull fresh comparable data:
- Go to **REI Tools → Refresh Comps (Force)**
- Bypasses 24-hour cache
- Gets latest market data

### 6. Analysis History
Every analysis is automatically saved:
- Hidden "Analysis_History" sheet tracks all runs
- Compare properties over time
- Learn from past analyses

## Running an Analysis

### Method 1: Using the Sidebar (Recommended)

1. **Open Sidebar:**
   - Go to **REI Tools → Open Sidebar**

2. **Enter Property Data:**
   - Property address and location
   - Purchase price and down payment
   - Rehab cost and timeline
   - Rental income estimate

3. **Click "Run Analysis":**
   - Tool fetches comparable data via API
   - Calculates flip and rental scenarios
   - Generates analysis tabs
   - Updates summary panel

4. **Review Results:**
   - Check Flip Analysis for profit potential
   - Check Rental Analysis for cash flow
   - Review alerts and insights
   - Check quality score and recommendation

### Method 2: Using the Menu

1. **Fill in Inputs tab manually** (all fields in column B)

2. **Run Analysis:**
   - Go to **REI Tools → Run Full Analysis**

3. **Review results** in generated tabs

## Understanding the Metrics

### Flip Metrics

**ARV (After Repair Value)**
- What the property will be worth after rehab
- Based on comparable sales data
- Critical for calculating profit

**ROI (Return on Investment)**
- Formula: Net Profit / Total Cash Invested
- Industry Target: 20%+ for flips
- Measures profit per dollar invested

**Return on Time Invested**
- Formula: ROI / Months to Flip
- Accounts for how long your money is tied up
- Higher is better (faster returns)

### Rental Metrics

**Cap Rate (Capitalization Rate)**
- Formula: NOI / Property Value
- Industry Target: 8-10% for strong cash flow
- Measures property's yield potential

**Cash-on-Cash Return**
- Formula: Annual Cash Flow / Total Cash Invested
- Industry Target: 10%+ for rentals
- Measures actual cash returns

**DSCR (Debt Service Coverage Ratio)**
- Formula: NOI / Annual Debt Service
- Lender Requirement: Typically 1.25 or higher
- Measures ability to cover mortgage payments

**NOI (Net Operating Income)**
- Formula: Effective Gross Income - Operating Expenses
- Does NOT include mortgage payments
- Key metric for property value and cash flow

## Best Practices

### 1. Conservative Inputs
- Use realistic ARV (don't over-estimate)
- Add 10-20% contingency to rehab
- Estimate rents conservatively
- Account for vacancy (6%+)

### 2. Validate Comps
- Review comparable sales data
- Adjust for location, condition, size
- Use recent sales (< 6 months)
- Adjust ARV manually if needed

### 3. Multiple Scenarios
- Run analysis with different inputs
- Test sensitivity (what if rehab costs increase?)
- Consider best/worst case scenarios
- Don't rely on a single analysis

### 4. Focus on Cash Flow (Rentals)
- Positive cash flow is critical
- DSCR > 1.25 ensures you can cover mortgage
- Factor in maintenance and vacancies
- Don't forget property management (8%)

### 5. Know Your Exit (Flips)
- Clear exit strategy (retail sale, wholesale, rental)
- Understand local market timing
- Have backup plan if property doesn't sell
- Consider seasonality

## When to Switch to Advanced Mode

Consider upgrading to Advanced Mode when:

1. **Multiple Partners**: You need partnership tracking and waterfall distributions
2. **Complex Projects**: You want detailed renovation timeline and budget tracking
3. **Advanced Metrics**: You need IRR, NPV, amortization schedules, tax benefits
4. **Loan Comparisons**: You want to compare 30yr, 15yr, IO, and ARM scenarios
5. **Sensitivity Analysis**: You need detailed ARV vs. Rehab Cost matrices
6. **Charts & Visualizations**: You want graphical reports
7. **Portfolio Tracking**: You're managing multiple properties

## Clearing Sheets

To start a fresh analysis:

1. Go to **REI Tools → Clear Sheets**
2. Confirm the action
3. All analysis tabs are cleared
4. Inputs remain (unless you manually clear them)
5. Ready for next property analysis

## Tips for Success

**For Flips:**
- Target 20%+ ROI
- Keep holding time under 6 months
- Budget for contingencies (10-15%)
- Factor in all holding costs
- Account for seasonality in sales

**For Rentals:**
- Target 10%+ cash-on-cash return
- Ensure DSCR > 1.25
- Use conservative rent estimates
- Factor in 6%+ vacancy
- Include property management even if self-managing

**For Both:**
- Run multiple scenarios
- Validate assumptions with local data
- Consider market trends
- Have an exit strategy
- Document everything

## Troubleshooting

**Q: The sidebar won't open**
- Refresh the page
- Check if Apps Script is enabled
- Review authorization prompts

**Q: API calls are failing**
- Check API key in Script Properties
- Verify API quota hasn't been exceeded
- Use manual entry as backup

**Q: Numbers look wrong**
- Verify input data in Inputs tab
- Check formulas haven't been overwritten
- Re-run analysis to refresh

**Q: Analysis tabs aren't generating**
- Ensure Inputs tab exists and has data
- Check for errors in Apps Script logs
- Try clearing sheets and re-running

## Next Steps

Once comfortable with Simple Mode:

1. Run analyses on 5-10 properties to learn patterns
2. Track your analyses in a separate tracker
3. Compare your assumptions to actual results (if you buy)
4. Refine your target metrics based on experience
5. Consider switching to Advanced Mode for complex deals

---

For questions, refer to the main [README](../README.md) or explore [ADVANCED_MODE_GUIDE](ADVANCED_MODE_GUIDE.md) to learn about upgrading.

## Related Documentation

- [Advanced Mode Guide](ADVANCED_MODE_GUIDE.md) - Complete feature reference
- [Project Tracker Guide](PROJECT_TRACKER_GUIDE.md) - Renovation management (Advanced Mode)
- [Partnership Management Guide](PARTNER_MANAGEMENT_GUIDE.md) - Multi-investor tracking (Advanced Mode)

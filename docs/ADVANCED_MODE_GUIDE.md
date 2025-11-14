# Advanced Mode - User Guide

## Overview

**Advanced Mode** unlocks the full power of the REI Analysis Tool with sophisticated features for complex deals, partnerships, and detailed financial analysis.

Perfect for:
- Experienced investors
- Properties with multiple partners
- Complex financing structures
- Detailed project management needs
- Portfolio tracking and comparison
- Tax planning and optimization

## Switching to Advanced Mode

1. Go to **REI Tools → Toggle Simple/Advanced Mode**
2. Confirm the switch
3. Additional tabs and menu options become available
4. Charts and visualizations are generated automatically

## What's Different in Advanced Mode

### All Simple Mode Features, Plus:

1. **Sensitivity Analysis** - ARV vs. Rehab Cost matrix
2. **Advanced Metrics** - IRR, NPV, Break-Even Analysis
3. **Tax Benefits** - Depreciation, tax deductions, 1031 exchanges
4. **Amortization Schedules** - First year and full loan term
5. **Loan Scenario Comparisons** - 30yr, 15yr, Interest-Only, ARM
6. **Interactive Scenario Analyzer** - Real-time "what-if" scenarios
7. **Charts & Visualizations** - Graphical reports
8. **Project Tracker** - Comprehensive renovation management
9. **Partnership Management** - Multi-partner investment tracking
10. **Advanced Comps Filtering** - Filter by date, distance, property type
11. **State Expense Comparison** - Compare tax/insurance across states

## Additional Tabs in Advanced Mode

### 1. Flip Sensitivity (ARV vs Rehab)

A 5×5 matrix showing profit at different ARV and rehab cost scenarios:

**Variations Tested:**
- ARV: -10%, -5%, Base, +5%, +10%
- Rehab Cost: -10%, -5%, Base, +5%, +10%

**Shows:**
- Net profit for each combination
- Color-coding (green = good, yellow = marginal, red = poor)
- Helps identify deal sensitivity to assumptions

**Use Case:**
You're not sure if your $50K rehab estimate is accurate. The sensitivity matrix shows:
- If rehab increases to $55K (-10%), profit drops from $60K to $55K
- If rehab hits $60K (+20%), profit drops to $50K
- If ARV drops to $380K (-5%), profit becomes $45K
- Worst case (high rehab + low ARV): $35K profit

This helps you understand your risk and margin of error.

**Access:** Auto-generated in Advanced Mode, or via **REI Tools → Advanced Tools → Interactive Scenario Analyzer**

### 2. Charts & Visualizations

Graphical representations of your analysis:

**Available Charts:**
- Profit sensitivity chart (ARV vs. Rehab)
- Cash flow timeline for flips
- Rental income vs. expenses breakdown
- Amortization schedule visualization
- Partnership distribution waterfall
- Comparative loan scenarios

**Auto-Generated:** Charts update automatically when you run analysis

**Customization:** Charts can be edited using Google Sheets chart editor

### 3. Advanced Metrics

Detailed financial metrics for sophisticated analysis:

#### IRR (Internal Rate of Return)
- Measures time-value of money
- Accounts for timing of cash flows
- Industry benchmark: 15-20% for flips, 12-18% for rentals
- **Located in:** Advanced Metrics tab

#### NPV (Net Present Value)
- Today's value of future cash flows
- Discount rate: Typically 10-12%
- Positive NPV = good investment
- **Located in:** Advanced Metrics tab

#### Break-Even Analysis
- **Break-Even Rent:** Minimum rent to cover all expenses
- **Break-Even Occupancy:** Minimum occupancy to break even
- **Safety Margin:** How much buffer you have
- **Located in:** Advanced Metrics tab

#### Loan Scenario Comparison
Compare 4 loan structures:

| Loan Type | Term | Feature | Best For |
|-----------|------|---------|----------|
| 30-Year Fixed | 30 yrs | Lowest monthly payment | Long-term rentals |
| 15-Year Fixed | 15 yrs | Lower total interest | Faster equity build |
| Interest-Only | 5-10 yrs | Very low payments | Short-term holds, flips |
| ARM | 5/1, 7/1 | Low initial rate | Medium-term holds |

**Compares:**
- Monthly payment
- Total interest paid
- Break-even rent
- Cash flow impact
- Total cost over life of loan

**Access:** **REI Tools → Advanced Tools → Advanced Metrics (IRR, NPV, Break-Even)**

### 4. Tax Benefits & Depreciation

Comprehensive tax analysis:

#### Depreciation Schedule
- Residential: 27.5 years straight-line
- Breakdown: Building vs. land value
- Annual depreciation amount
- Cumulative depreciation
- **Reduces taxable income significantly**

#### Tax Deductions Tracked
- Mortgage interest
- Property taxes
- Insurance
- Repairs and maintenance
- Property management fees
- HOA fees
- Utilities (if landlord-paid)
- Professional services
- Travel expenses
- Home office (if applicable)

#### Tax Benefits Calculation
- **Taxable Income:** Rental income - deductions - depreciation
- **Tax Savings:** (Deductions + Depreciation) × Tax Rate
- **After-Tax Cash Flow:** Cash flow + tax savings
- **After-Tax Return:** Including tax benefits

#### Capital Gains Analysis
- Sale price vs. adjusted basis
- Capital gains tax (15-20% federal + state)
- Depreciation recapture (25% rate)
- Net proceeds after tax

#### 1031 Exchange Evaluation
- Tax deferral potential
- Requirements for like-kind exchange
- Timeline (45 days to identify, 180 days to close)
- Net benefit vs. paying tax and reinvesting

**Access:** **REI Tools → Advanced Tools → Tax Benefits & Depreciation**

### 5. Amortization Schedules

Detailed loan payment breakdown:

#### First Year Schedule (12 months)
- Month-by-month payments
- Principal vs. interest breakdown
- Remaining balance after each payment
- Cumulative interest paid
- Total paid in Year 1

#### Full Loan Term Schedule
- Every payment over 30 years (360 months)
- Total interest paid over life of loan
- Equity build-up over time
- Interest vs. principal trends

**Insights:**
- Early payments are mostly interest
- Principal accelerates in later years
- Visualize total interest burden
- Plan refinance timing

**Access:** **REI Tools → Advanced Tools → Amortization**

### 6. Project Tracker

Comprehensive renovation and project management:

**8 Integrated Sections:**
1. Enhanced Renovation Timeline & Budget
2. Inspection & Permit Tracker
3. Material & Vendor Tracking
4. Critical Milestones & Alerts
5. Delays & Issues Tracker
6. Contractor Performance Tracker
7. Change Orders Tracker
8. Project Summary & Alerts

**See [PROJECT_TRACKER.md](PROJECT_TRACKER.md) for complete guide.**

**Access:** **REI Tools → Advanced Tools → Project Tracker → Generate Project Tracker Tab**

### 7. Partnership Management

Multi-partner investment tracking:

**7 Integrated Sections:**
1. Partnership Structure Overview
2. Capital Contributions Tracker
3. Profit/Loss Allocation
4. Waterfall Distribution Calculator
5. Distribution History & Projections
6. Milestone Tracker
7. Partner Performance Dashboard

**See [PARTNER_MANAGEMENT.md](PARTNER_MANAGEMENT.md) for complete guide.**

**Access:** **REI Tools → Advanced Tools → Partnership Management → Generate Partnership Tab**

## Advanced Features Deep Dive

### Interactive Scenario Analyzer

Real-time "what-if" analysis with sliders:

**Adjustable Parameters:**
- Purchase Price
- ARV
- Rehab Cost
- Monthly Rent
- Interest Rate
- Down Payment

**Live Updates:**
- Flip profit and ROI
- Rental cash flow and returns
- Sensitivity analysis
- Visual charts update instantly

**Use Case:**
Playing with the analyzer, you discover:
- Increasing rent by just $100/month makes the deal cash flow positive
- Reducing rehab by $5K increases ROI from 18% to 21%
- Lowering purchase price by $10K makes it a "Strong Buy"

**Access:** **REI Tools → Advanced Tools → Interactive Scenario Analyzer**

### Auto-Populate Expenses

Save time with automated expense estimates:

**Property Tax Rates** - All 50 States:
- Pre-loaded average effective tax rates
- Automatically populated based on state
- Can override with actual rate from assessor

**Insurance Estimates** - All 50 States:
- Based on property value and location
- Accounts for regional risk factors (hurricanes, earthquakes, etc.)
- Manual override available

**Access:** **REI Tools → Advanced Tools → Auto-Populate Expenses (Tax & Insurance)**

### State Expense Comparison

Compare costs across different states:

**Compares:**
- Property tax rates
- Insurance costs
- Total annual expenses
- Impact on cash flow and returns

**Use Case:**
You're deciding between a property in Texas vs. Florida:
- Texas: 1.69% property tax, $1,200 insurance
- Florida: 0.98% property tax, $2,400 insurance (hurricane risk)
- Side-by-side comparison shows which is more affordable

**Access:** **REI Tools → Advanced Tools → Compare State Expenses**

### Advanced Comps Filtering

Refine comparable sales data:

**Filter By:**
- **Date Range:** Last 3/6/12 months
- **Distance:** Within 0.5/1/2/5 miles
- **Property Type:** SFR, Condo, Townhouse, Multi-family
- **Square Footage:** +/- 10/20/30%
- **Bedrooms/Bathrooms:** Exact match or similar

**Benefits:**
- More accurate ARV estimates
- Filter out outliers
- Focus on truly comparable properties
- Adjust for market trends

**Access:** **REI Tools → Advanced Tools → Filter Comps (Date, Distance, Type)**

### Charts & Visualizations

Auto-generated charts include:

**1. Flip Sensitivity Heat Map**
- Visual representation of profit sensitivity
- Color gradient shows risk zones
- Quickly identify safe vs. risky assumptions

**2. Cash Flow Timeline (Flips)**
- Month-by-month holding costs
- Cumulative cost trend line
- Visualize expense burn rate

**3. Rental Income Breakdown**
- Pie chart: Income vs. expenses vs. cash flow
- Bar chart: Monthly breakdown
- Operating expense categories

**4. Loan Comparison Chart**
- Side-by-side payment comparison
- Total interest paid over time
- Monthly payment differences

**5. Partnership Waterfall**
- Tiered distribution visualization
- Shows each partner's share by tier
- Visual representation of preferred return

**6. Amortization Curve**
- Principal vs. interest over time
- Equity build-up trend
- Break-even point visualization

**Access:** Auto-generated or **REI Tools → Advanced Tools → Generate Charts & Visualizations**

## Advanced Workflows

### Workflow 1: Complex Partnership Deal

1. **Setup:**
   - Switch to Advanced Mode
   - Generate Partnership Management tab
   - Enter all partner details and ownership %

2. **Run Analysis:**
   - Complete property analysis (Flip or Rental)
   - Waterfall calculator automatically pulls net profit

3. **Configure Waterfall:**
   - Set preferred return (8%)
   - Set GP promote (20%)
   - Review tiered distributions

4. **Track Progress:**
   - Update milestones as project progresses
   - Log capital contributions if capital calls occur
   - Record distributions as they happen

5. **Exit:**
   - Final waterfall calculation at sale
   - Calculate IRR for each partner
   - Distribute proceeds per waterfall

### Workflow 2: Detailed Flip Project

1. **Initial Analysis:**
   - Run full property analysis
   - Review sensitivity matrix for risk assessment

2. **Project Planning:**
   - Generate Project Tracker tab
   - Customize renovation phases
   - Add contractors and vendors

3. **During Renovation:**
   - Update Project Tracker weekly
   - Log delays and issues
   - Track actual costs vs. budget
   - Rate contractor performance

4. **Monitoring:**
   - Check Budget Summary for overruns
   - Review Project Alerts
   - Adjust strategy if needed

5. **Exit:**
   - Complete final inspection milestone
   - Compare actual vs. estimated metrics
   - Document lessons learned for next project

### Workflow 3: Multi-Scenario Rental Analysis

1. **Base Analysis:**
   - Run standard rental analysis
   - Review cash flow and returns

2. **Advanced Metrics:**
   - Generate IRR and NPV analysis
   - Review break-even rent and occupancy
   - Assess risk margins

3. **Loan Optimization:**
   - Compare 30yr, 15yr, IO, and ARM scenarios
   - Identify loan with best cash flow
   - Consider refinance options

4. **Tax Planning:**
   - Generate Tax Benefits analysis
   - Calculate after-tax cash flow
   - Evaluate 1031 exchange potential

5. **Sensitivity Testing:**
   - Use Interactive Scenario Analyzer
   - Test different rent levels
   - Assess impact of rate changes

### Workflow 4: Portfolio Comparison

1. **Analyze Multiple Properties:**
   - Run analysis on Property A, save results
   - Run analysis on Property B, save results
   - Run analysis on Property C, save results

2. **Compare Metrics:**
   - Review Analysis History (hidden tab)
   - Compare ROI, cash flow, quality scores
   - Identify best opportunity

3. **Deep Dive:**
   - For top 2-3 properties, generate full advanced analysis
   - Compare sensitivity matrices
   - Review tax benefits

4. **Decision:**
   - Select property with best risk-adjusted returns
   - Consider timing, partners, financing
   - Execute on chosen deal

## Tips for Advanced Users

### 1. Leverage Automation
- Use auto-populate for tax and insurance
- Let the tool calculate complex metrics (IRR, NPV)
- Trust the automated alerts and scoring

### 2. Validate Assumptions
- Sensitivity analysis shows which inputs matter most
- Test extreme scenarios (worst case)
- Adjust for local market conditions

### 3. Document Everything
- Use Project Tracker for renovation details
- Track all partner communications
- Save analysis history for learning

### 4. Optimize Financing
- Compare all 4 loan scenarios
- Consider interest-only for flips
- 15-year loan can save huge amounts in interest

### 5. Plan for Taxes
- Depreciation is a powerful benefit
- Track all deductions meticulously
- Consult CPA for 1031 exchange planning

### 6. Monitor Performance
- Rate contractors for future reference
- Track actual vs. estimated costs
- Learn from variances

### 7. Communicate with Partners
- Share Partnership Management tab (view-only)
- Update regularly
- Transparent reporting builds trust

## Advanced Mode Menu Reference

### REI Tools → Advanced Tools

- **📊 Interactive Scenario Analyzer** - Real-time what-if analysis
- **📈 Generate Charts & Visualizations** - Create/update all charts
- **🏗️ Project Tracker** - Renovation and project management
  - Generate Project Tracker Tab
  - Clear Project Tracker Tab
- **🤝 Partnership Management** - Multi-partner tracking
  - Generate Partnership Tab
  - Calculate Partnership IRR
  - Clear Partnership Tab
- **🏠 Auto-Populate Expenses** - State-based tax/insurance lookup
- **📊 Compare State Expenses** - Multi-state comparison
- **🔍 Filter Comps** - Advanced comparable filtering
- **💰 Tax Benefits & Depreciation** - Full tax analysis
- **📉 Advanced Metrics** - IRR, NPV, Break-Even, Loan scenarios
- **Amortization** - First year or full loan term schedules
- **Protect/Unlock** - Sheet protection options
- **Format all tabs** - Apply consistent styling

## When to Use Advanced Mode

**Always use Advanced Mode if:**
- Multiple partners or investors
- Complex financing (multiple loans, creative structures)
- Detailed renovation tracking needed
- Tax planning is important
- You're managing a portfolio
- You want to optimize every detail

**Simple Mode is sufficient if:**
- Solo investor
- Straightforward deal
- Quick evaluation needed
- No partnership structure
- Learning the basics

## Performance Considerations

Advanced Mode generates more data and calculations:
- **Tabs:** 10+ tabs vs. 3 in Simple Mode
- **Charts:** 5-10 charts auto-generated
- **Formulas:** 1000+ formulas vs. 200 in Simple Mode
- **Load Time:** Slightly slower when opening
- **API Calls:** Same as Simple Mode (cached for 24 hours)

**Recommendation:** Use Simple Mode for initial screening, switch to Advanced for serious contenders.

## Switching Between Modes

You can switch freely:
- **Simple → Advanced:** Additional tabs are generated, existing data preserved
- **Advanced → Simple:** Advanced tabs are hidden or removed, core data preserved

**Note:** When switching to Simple Mode, advanced tabs (Project Tracker, Partnership Management) may be deleted. Data is backed up but consider saving a copy first.

## Troubleshooting Advanced Features

**Q: Charts aren't generating**
- Ensure you're in Advanced Mode
- Re-run analysis or use "Generate Charts & Visualizations" menu option
- Check for sufficient data in source tabs

**Q: IRR calculation shows error**
- Ensure you have at least 2 cash flows (investment + return)
- Cash flows should alternate signs (negative investments, positive distributions)
- Dates should be in chronological order

**Q: Project Tracker formulas are broken**
- Don't insert/delete rows in pre-filled sections
- If damaged, clear and regenerate the tab
- Add custom rows at the bottom only

**Q: Partnership tab ownership doesn't sum to 100%**
- Tool validates and alerts you
- Adjust percentages until they total 100%
- Use the auto-calculated totals to check

**Q: Sensitivity matrix shows all red**
- Your base case may already be marginal
- Review inputs (is ARV realistic? Is rehab too high?)
- Red matrix = high-risk deal

## Next Steps

Master Advanced Mode by:

1. **Run 10+ analyses** using all features
2. **Compare results** from Simple vs. Advanced Mode
3. **Test Interactive Analyzer** with extreme scenarios
4. **Generate reports** for partners or lenders
5. **Track actual results** and compare to projections
6. **Refine your process** based on lessons learned

---

For questions, refer to the main [README](../README.md), [PROJECT_TRACKER_GUIDE.md](PROJECT_TRACKER_GUIDE.md), or [PARTNER_MANAGEMENT_GUIDE.md](PARTNER_MANAGEMENT_GUIDE.md).

## Related Documentation

- [Simple Mode Guide](SIMPLE_MODE_GUIDE.md) - Basic feature overview
- [Project Tracker Guide](PROJECT_TRACKER_GUIDE.md) - Renovation management
- [Partnership Management Guide](PARTNER_MANAGEMENT_GUIDE.md) - Multi-investor tracking

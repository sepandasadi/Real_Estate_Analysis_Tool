# Partnership Management - User Guide

## Overview

The **Partnership Management** tab helps you track multi-partner real estate investments, including capital contributions, profit distributions, waterfall calculations, and performance metrics.

**Availability**: Advanced Mode Only

## Accessing Partnership Management

1. Ensure you're in Advanced Mode:
   - Go to **REI Tools → Toggle Simple/Advanced Mode**

2. Generate the Partnership tab:
   - Go to **REI Tools → Advanced Tools → Partnership Management → Generate Partnership Tab**
   - A new "Partnership Management" tab will be created

## What's Included

The Partnership Management tab includes 7 comprehensive sections:

### 1. Partnership Structure Overview

Define your partnership structure and partners:

**Partnership Details:**
- Partnership Name
- Partnership Type (LLC, LP, GP, Joint Venture)
- Formation Date
- Total Partners (auto-calculated)
- Total Capital Committed (auto-calculated)

**Partner Table** (up to 5 partners):
| Field | Description |
|-------|-------------|
| Partner Name | Full name or entity name |
| Partner Type | General Partner, Limited Partner, or Managing Member |
| Ownership % | Equity ownership percentage |
| Initial Capital | Starting capital contribution |
| Current Capital | Total capital invested to date |
| Role | Active Operator, Silent Investor, etc. |
| Status | Active, Inactive, Exited |
| Contact | Email or phone |

**Validation**: The tool ensures ownership percentages sum to exactly 100%.

### 2. Capital Contributions Tracker

Track all capital contributions over time:

**10-row history tracker** with:
- Date
- Partner Name
- Contribution Type (Initial Capital, Capital Call, Additional Investment)
- Amount
- Running Total per partner
- Payment Method
- Notes

**Use this for:**
- Initial capital calls
- Mid-project capital calls (e.g., rehab overruns)
- Additional investment rounds
- Return of capital distributions

### 3. Profit/Loss Allocation

Track how profits and losses are allocated for tax purposes:

**For each partner:**
- Ownership %
- Current Period P&L (links to Flip/Rental Analysis)
- Cumulative P&L
- K-1 Allocation (for tax reporting)
- Tax Year

**Source Data:**
- Automatically pulls Net Profit from Flip Analysis tab
- Automatically pulls Annual Cash Flow from Rental Analysis tab
- Allocates based on ownership percentages

### 4. Waterfall Distribution Calculator

Calculate tiered profit distributions based on return thresholds:

**4-Tier Waterfall Structure:**

**Tier 1: Return of Capital**
- 100% to investors
- Partners get their initial investment back first

**Tier 2: Preferred Return**
- Configurable rate (default 8% annually)
- Investors receive preferred return before GP profits

**Tier 3: Catch-up**
- General Partner receives catch-up payments
- Configurable GP Promote % (default 20%)
- Brings GP to target profit share

**Tier 4: Remaining Profit Split**
- Remaining profits split per agreed ratios
- Typical: 80% Limited Partners / 20% General Partner

**Configuration Options:**
- Preferred Return Rate (%)
- GP Promote (%)
- Catch-up Provision (Yes/No)
- Distribution Frequency (Monthly, Quarterly, Annual, At Exit)

**Distribution Summary** shows:
- Total Distribution per partner
- % of Total Profit
- Return on Investment (ROI)
- Multiple on Invested Capital (MOIC)

### 5. Distribution History & Projections

Track past distributions and project future ones:

**Historical Distributions** (10 rows):
- Date
- Distribution Type (Quarterly Cash Flow, Annual Dividend, Exit Proceeds, etc.)
- Total Amount
- Amount per partner
- Tax Withholding (if applicable)
- Notes

**Future Projections** (5 rows):
- Period (Q3 2024, Q4 2024, etc.)
- Projected Distribution
- Amount per partner
- Confidence Level (High, Medium, Low)
- Basis (Historical Average, Pro Forma, Market Estimate)

### 6. Milestone Tracker

Track key milestones that trigger distributions or vesting:

**Standard Milestones:**
- Property Acquired
- Rehab Completed
- Property Rented/Listed
- Property Sold
- Profit Distributed

**For each milestone:**
- Target Date
- Completion Date
- Status (Pending, In Progress, Complete, Delayed, Cancelled)
- Trigger Event description
- Responsible Party
- Notes

**Progress Summary** shows:
- Total Milestones
- Milestones Complete
- Completion %

**Use Case**: Many partnerships distribute profits only after specific milestones (e.g., property sale). This tracker helps document when those triggers are met.

### 7. Partner Performance Dashboard

Comprehensive performance metrics for each partner:

**Performance Metrics:**

| Metric | Description | Formula |
|--------|-------------|---------|
| Total Invested | Sum of all capital contributions | From Capital Tracker |
| Distributions Received | Total distributions to date | User entry |
| Net Profit | Profit after returning capital | Distributions - Invested |
| ROI | Return on Investment | Net Profit / Invested |
| Current Value | Current equity value | (Partner Capital / Total Capital) × Property Value |
| Cash-on-Cash Return | Annual cash yield | Distributions / Invested |
| MOIC | Multiple on Invested Capital | Distributions / Invested |
| IRR | Internal Rate of Return | Based on manual cash flow entries |
| Status | Current investment status | Active, Exited, etc. |

**Property Value Integration:**
- Automatically pulls ARV from Flip Analysis
- Falls back to Purchase Price from Rental Analysis
- Manual entry option available

**Manual Cash Flow Entry for IRR** (5 rows per partner):
- Period
- Date
- Cash Flow (negative for investments, positive for distributions)
- Type (Investment, Distribution, Capital Call, Return of Capital, Other)
- Notes

**Overall Partnership Performance:**
- Total Capital Invested (All Partners)
- Total Distributions (All Partners)
- Total Net Profit
- Average ROI
- Average MOIC
- Total Current Value

## How to Use

### Initial Setup

1. **Generate the tab** using the menu

2. **Fill in Partnership Structure:**
   - Partnership name and type
   - Formation date
   - Add all partners with ownership %
   - Verify ownership totals 100%

3. **Log Initial Capital Contributions:**
   - Use the Capital Contributions Tracker
   - Enter date, partner, amount for each initial investment

4. **Configure Waterfall Settings:**
   - Set Preferred Return Rate (typically 8%)
   - Set GP Promote (typically 20%)
   - Choose distribution frequency

### During the Investment

1. **Track Additional Capital:**
   - Log any capital calls in the Capital Contributions Tracker
   - Running totals update automatically

2. **Monitor Milestones:**
   - Update milestone status as project progresses
   - Mark completion dates when achieved

3. **Record Distributions:**
   - Enter each distribution in the Distribution History section
   - Update "Distributions Received" in the Performance Dashboard

4. **Review Waterfall:**
   - The Waterfall Calculator automatically pulls profit from Flip/Rental Analysis
   - Shows exactly how profits will be distributed at exit

### At Exit/Sale

1. **Update Final Milestone:**
   - Mark "Property Sold" and "Profit Distributed" as complete

2. **Run Final Waterfall:**
   - Review the 4-tier distribution
   - Verify each partner's share

3. **Record Final Distribution:**
   - Log the exit proceeds in Distribution History
   - Update Performance Dashboard with final distributions

4. **Calculate IRR:**
   - Enter all cash flows (investments + distributions) in the IRR section
   - Use **REI Tools → Advanced Tools → Partnership Management → Calculate Partnership IRR**

## Understanding the Waterfall

### Example Scenario

**Assumptions:**
- 2 Limited Partners, 1 General Partner
- Each LP invests $100,000 (total $200,000)
- GP invests $0 (sweat equity)
- Preferred Return: 8%
- GP Promote: 20%
- Net Profit from sale: $300,000

**Waterfall Calculation:**

| Tier | Description | Amount | LP1 | LP2 | GP |
|------|-------------|--------|-----|-----|----|
| 1 | Return of Capital | $200,000 | $100,000 | $100,000 | $0 |
| 2 | Preferred Return (8%) | $16,000 | $8,000 | $8,000 | $0 |
| 3 | GP Catch-up (20% promote) | $5,333 | $0 | $0 | $5,333 |
| 4 | Remaining Profit (80/20 split) | $78,667 | $31,467 | $31,467 | $15,733 |
| **TOTAL** | | **$300,000** | **$139,467** | **$139,467** | **$21,066** |

**Returns:**
- LP1 & LP2: 39.5% ROI each
- GP: Infinite ROI (no capital invested)

The tool automatically calculates this distribution based on your waterfall settings.

## Use Cases

### Scenario 1: 50/50 Partnership
Two equal partners, no preferred return, simple 50/50 split:
- Set both partners to 50% ownership
- Set Preferred Return to 0%
- Disable Catch-up Provision
- Each partner gets exactly 50% of profits

### Scenario 2: LP/GP Structure
Limited Partners provide capital, General Partner operates:
- LPs: 90% ownership, 8% preferred return
- GP: 10% ownership, 20% promote after preferred return
- Waterfall ensures LPs get return OF and ON capital first

### Scenario 3: Capital Call Scenario
Mid-project, you need more money:
- Log capital call in Capital Contributions Tracker
- Update each partner's Current Capital
- Ownership % may need adjustment if new capital comes at different ratios
- Capital Tracker shows running totals

### Scenario 4: Monthly Rental Distributions
Rental property generating monthly cash flow:
- Set Distribution Frequency to "Monthly"
- Log each month's distribution in Distribution History
- Track cumulative distributions in Performance Dashboard
- Calculate cash-on-cash return over time

### Scenario 5: Exit Planning
Property is ready to sell:
- Update Property Value (ARV) in Flip Analysis
- Waterfall Calculator shows projected distribution at various sale prices
- Partners can see their expected returns before listing
- Plan distribution timing and tax implications

## Tips for Success

1. **Document Everything**: Use the Notes fields extensively
2. **Update Regularly**: Monthly updates keep everyone informed
3. **Communication**: Share the tab (view-only) with all partners
4. **Tax Planning**: Work with a CPA to ensure K-1 allocations are correct
5. **Milestone-Based**: Update immediately when milestones are hit
6. **Scenario Planning**: Create copies of the tab to model different exit scenarios

## Calculating IRR

The tool includes manual cash flow entry for IRR calculation:

1. **Enter all cash flows** in chronological order:
   - Negative values for investments (e.g., -$100,000)
   - Positive values for distributions (e.g., +$10,000)

2. **Use the menu** to calculate:
   - Go to **REI Tools → Advanced Tools → Partnership Management → Calculate Partnership IRR**
   - The tool will calculate IRR based on your cash flow entries

3. **Interpret IRR**:
   - 15-20% IRR: Good deal
   - 20-30% IRR: Great deal
   - 30%+ IRR: Excellent deal

## Common Questions

**Q: Can I have more than 5 partners?**
A: The default setup supports 5 partners. You can manually add more rows to the Partner Table and update formulas.

**Q: What if we don't use a waterfall?**
A: Set Preferred Return to 0% and disable Catch-up. Profits will distribute based on simple ownership %.

**Q: How do I handle partner buyouts?**
A: Update the exiting partner's Status to "Exited", record a final distribution, and adjust ownership % for remaining partners.

**Q: Can I change the waterfall structure mid-investment?**
A: Yes, but document the change in Notes. All previous distributions remain as-is; new distributions use new structure.

**Q: What about tax withholding?**
A: There's a Tax Withholding column in Distribution History for tracking. Consult your CPA for requirements.

## Clearing the Tab

When starting a new partnership:
- Go to **REI Tools → Advanced Tools → Partnership Management → Clear Partnership Tab**
- This removes all data
- Regenerate to start fresh

## Integration with Other Tabs

The Partnership Management tab automatically integrates with:
- **Inputs tab**: Property address, purchase price
- **Flip Analysis tab**: Net Profit for distribution calculations
- **Rental Analysis tab**: Annual Cash Flow for distribution calculations

Changes in those tabs automatically flow through to partnership calculations.

---

For questions or issues, refer to the main [README](../README.md) or the [PARTNERSHIP_MANAGEMENT_PLAN](PARTNERSHIP_MANAGEMENT_PLAN.md) for technical implementation details.

## Related Documentation

- [Simple Mode Guide](SIMPLE_MODE_GUIDE.md) - Basic feature overview
- [Advanced Mode Guide](ADVANCED_MODE_GUIDE.md) - All advanced features
- [Project Tracker Guide](PROJECT_TRACKER_GUIDE.md) - Renovation management

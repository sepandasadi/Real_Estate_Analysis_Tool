# Project Tracker - User Guide

## Overview

The **Project Tracker** is a comprehensive project management dashboard designed for renovation and flip projects. It helps you track timelines, budgets, permits, contractors, materials, and milestones all in one place.

**Availability**: Advanced Mode Only

## Accessing the Project Tracker

1. Ensure you're in Advanced Mode:
   - Go to **REI Tools → Toggle Simple/Advanced Mode**
   - The current mode is displayed in the menu

2. Generate the Project Tracker:
   - Go to **REI Tools → Advanced Tools → Project Tracker → Generate Project Tracker Tab**
   - A new "Project Tracker" tab will be created with all sections

## What's Included

The Project Tracker includes 8 comprehensive sections:

### 1. Enhanced Renovation Timeline & Budget

Track the progress of your renovation through 10 standard phases:

| Phase | Typical Duration |
|-------|------------------|
| Demo & Cleanup | 1 week |
| Framing & Structural | 2 weeks |
| Plumbing & Electrical | 2 weeks |
| HVAC | 1 week |
| Drywall & Insulation | 2 weeks |
| Flooring | 1 week |
| Kitchen & Bath | 2 weeks |
| Paint & Finish | 1 week |
| Landscaping & Exterior | 1 week |
| Final Cleanup & Staging | 1 week |

**For each phase, track:**
- Estimated vs. Actual duration (weeks)
- Estimated vs. Actual cost
- Time and cost variances
- Completion percentage
- Assigned contractor
- Contact information
- Current status (Not Started, In Progress, Complete, Delayed, On Hold)
- Notes

**Budget Summary** automatically calculates:
- Total Estimated Budget
- Total Actual Spend
- Remaining Budget
- Budget Variance ($ and %)

### 2. Inspection & Permit Tracker

Keep tabs on all required permits and inspections:

**Standard Permits:**
- Building Permit
- Electrical Permit
- Plumbing Permit
- HVAC Permit
- Mechanical Permit (if needed)
- Final Inspection

**Track for each permit:**
- Required? (Yes/No)
- Application Date
- Approval Date
- Status (Not Applied, Applied, Approved, Rejected, etc.)
- Inspector/Contact information
- Phone/Email
- Notes

### 3. Material & Vendor Tracking

Manage material orders and vendor relationships:

**Track 10+ line items:**
- Item/Service description
- Vendor name
- Contact information
- Order Date
- Delivery Date
- Cost
- Payment Status (Pending, Deposit Paid, Paid in Full, Overdue, N/A)
- Payment Date
- Notes

### 4. Critical Milestones & Alerts

Monitor key project milestones:

**Standard Milestones:**
- Project Start
- All Permits Approved
- Structural Work Complete
- Rough Inspections Passed
- Final Inspection Passed
- Project Complete

**For each milestone:**
- Target Date
- Actual Date
- Status (Pending, In Progress, Complete, Delayed, Blocked)
- Priority (High, Medium, Low)
- Notes

### 5. Delays & Issues Tracker

Document and resolve project delays:

**Track delays with:**
- Date Reported
- Issue/Delay Type (Weather, Materials Delay, Contractor Issue, Permit Delay, Inspection Failed, Scope Change, Other)
- Description
- Days Delayed
- Cost Impact
- Status (Open, In Progress, Resolved, Escalated)
- Resolution Date
- Notes

### 6. Contractor Performance Tracker

Rate and evaluate your contractors:

**Rating System (1-5 scale):**
- On-Time Rating
- Quality Rating
- Budget Adherence Rating
- Overall Rating (auto-calculated average)

**Track:**
- Contractor Name
- Trade/Specialty
- Contact Information
- Performance ratings
- Notes for future reference

### 7. Change Orders Tracker

Manage scope changes and their impact:

**For each change order:**
- CO # (auto-numbered)
- Date
- Description
- Reason
- Cost Impact
- Time Impact (days)
- Approval Status (Pending, Approved, Rejected, Under Review)
- Approved By
- Notes

### 8. Project Summary & Alerts

Get a bird's-eye view of your project health:

**Auto-Calculated Metrics:**
- Overall Project Progress (%)
- Total Delays (Days)
- Total Change Order Cost
- Average Contractor Rating

**Automated Alerts:**
- Budget Status (Over Budget / On Budget)
- Schedule Status (Behind Schedule / On Schedule)
- Open Issues Count
- Pending Change Orders Count

## How to Use

### Initial Setup

1. **Generate the tracker** using the menu
2. The tool automatically pulls data from your Inputs tab:
   - Purchase Price
   - Rehab Budget
   - Estimated Timeline

3. **Review the pre-filled phases** and adjust costs/durations as needed for your specific project

### During Your Project

1. **Update dates** as phases start and complete
2. **Enter actual costs** as invoices come in
3. **Track permit progress** as you submit applications and receive approvals
4. **Log material orders** to avoid duplicates and track delivery
5. **Update completion percentages** regularly
6. **Document delays immediately** for accurate record-keeping
7. **Rate contractors** after they complete their work
8. **Create change orders** whenever scope changes

### Best Practices

- **Update weekly**: Set a recurring reminder to update the tracker
- **Be specific**: Use the Notes fields to capture important details
- **Track everything**: Even small delays and cost changes add up
- **Use dropdowns**: Consistent status values help with reporting
- **Document issues**: The Issues Tracker protects you from contractor disputes
- **Rate honestly**: Contractor ratings help you build a reliable team

## Tips for Success

1. **Start Early**: Generate the tracker before you break ground
2. **Share Access**: Give your project manager or GC view access
3. **Freeze Header Rows**: Already done for easy scrolling
4. **Color Coding**: Status cells automatically change color (Green=Complete, Yellow=In Progress, Red=Delayed)
5. **Print Reports**: Export to PDF for meetings with contractors
6. **Track Trends**: Compare actual vs. estimated to improve future projects

## Clearing the Tracker

When starting a new project:

- Go to **REI Tools → Advanced Tools → Project Tracker → Clear Project Tracker Tab**
- This removes all data and formatting
- Then regenerate to start fresh

## Integration with Other Tabs

The Project Tracker automatically pulls data from:
- **Inputs tab**: Purchase price, rehab budget, timeline estimates
- **Flip Analysis**: Used for budget validation

The tracker is designed to work alongside your flip analysis but provides much more detailed project-level tracking.

## Common Use Cases

### Scenario 1: Managing Multiple Contractors
Use the Contractor Performance Tracker to rate each contractor as they complete their work. This builds your "trusted vendor list" for future flips.

### Scenario 2: Dealing with Delays
When weather or permits cause delays, log them immediately in the Delays & Issues Tracker. This documentation is crucial for explaining timeline changes to partners or lenders.

### Scenario 3: Budget Overruns
The Budget Summary section highlights variances as soon as actual costs exceed estimates. Catch overruns early and adjust your strategy.

### Scenario 4: Permit Headaches
Track every permit from application to approval. The Inspection & Permit Tracker shows at a glance which permits are blocking progress.

### Scenario 5: Change Orders
Document every scope change with cost and time impact. This protects you from "scope creep" and helps justify budget increases to partners.

## Troubleshooting

**Q: The tracker isn't generating**
- Make sure you're in Advanced Mode (toggle if needed)
- Ensure the Inputs tab has data
- Check the Apps Script logs for errors

**Q: Formulas are broken**
- Don't insert or delete rows in the pre-filled sections
- If you need more rows, add them at the bottom
- Re-generate the tracker if formulas are damaged

**Q: I need more than 10 phases**
- Add rows at the bottom of the Renovation Timeline section
- Copy formulas from the row above
- Keep numbering consistent

**Q: Can I customize the phases?**
- Yes! Edit phase names, durations, and costs directly
- The tool provides defaults but you can fully customize

## Next Steps

After setting up your Project Tracker:

1. Review and customize the 10 renovation phases
2. Add your contractors to the Performance Tracker
3. Apply for permits and track in the Permit section
4. Start ordering materials and log them
5. Update weekly as your project progresses

---

For questions or issues, refer to the main [README](../README.md) or check the [IMPROVEMENT_ROADMAP](IMPROVEMENT_ROADMAP.md) for planned enhancements.

## Related Documentation

- [Simple Mode Guide](SIMPLE_MODE_GUIDE.md) - Basic feature overview
- [Advanced Mode Guide](ADVANCED_MODE_GUIDE.md) - All advanced features
- [Partnership Management Guide](PARTNER_MANAGEMENT_GUIDE.md) - Multi-investor tracking

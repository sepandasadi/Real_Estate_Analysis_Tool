/**
 * ===============================
 * PARTNERSHIP MANAGEMENT
 * ===============================
 *
 * Advanced Mode Only
 * Handles multi-partner investment structures, capital tracking,
 * profit/loss allocation, and distribution calculations
 */

/**
 * Main function to generate Partnership Management tab
 * Advanced Mode Only
 */
function generatePartnershipManagement() {
  // Check mode
  if (isSimpleMode()) {
    SpreadsheetApp.getUi().alert("🤝 Partnership Management is only available in Advanced Mode.\n\nSwitch to Advanced Mode from the REI Tools menu to access this feature.");
    return;
  }

  // Create or clear sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Partnership Management");
  if (!sheet) {
    sheet = ss.insertSheet("Partnership Management");
  } else {
    sheet.clear();
  }

  let row = 1;

  // === HEADER ===
  sheet.getRange(row, 1, 1, 10).merge()
    .setValue("🤝 PARTNERSHIP MANAGEMENT - Advanced Mode")
    .setFontWeight("bold")
    .setFontSize(16)
    .setBackground(COLORS.PRIMARY)
    .setFontColor("white")
    .setHorizontalAlignment("center");
  row += 2;

  // Generate Phase 1 sections
  row = generatePartnershipStructure(sheet, row);
  row = generateCapitalTracker(sheet, row);
  row = generateProfitAllocation(sheet, row);

  // Generate Phase 2 sections
  row = generateWaterfallCalculator(sheet, row);
  row = generateDistributionHistory(sheet, row);

  // Generate Phase 3 sections
  row = generateMilestoneTracker(sheet, row);
  row = generatePerformanceDashboard(sheet, row);

  // Add instructions
  sheet.getRange(row, 1, 1, 10).merge()
    .setValue("💡 Instructions: Enter partner information in the tables above. Ownership percentages must sum to 100%. Use dropdowns for consistent data entry. P&L allocation and waterfall distributions are automatically calculated based on ownership percentages and waterfall structure.")
    .setFontStyle("italic")
    .setFontColor(COLORS.TEXT_SECONDARY)
    .setFontSize(9)
    .setWrap(true);

  // Set column widths
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 120);
  sheet.setColumnWidth(3, 120);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 120);
  sheet.setColumnWidth(6, 120);
  sheet.setColumnWidth(7, 120);
  sheet.setColumnWidth(8, 120);
  sheet.setColumnWidth(9, 150);
  sheet.setColumnWidth(10, 150);

  // Freeze header rows
  sheet.setFrozenRows(3);

  Logger.log("✅ Partnership Management tab generated (Phases 1, 2 & 3)");
  SpreadsheetApp.getUi().alert("✅ Partnership Management tab created!\n\nAll sections include:\n- Partnership Structure Overview\n- Capital Contributions Tracker\n- Profit/Loss Allocation\n- Waterfall Distribution Calculator\n- Distribution History & Projections\n- Milestone Tracker\n- Partner Performance Dashboard\n\nEnter your partnership details to get started.");
}

/**
 * Section 5: Milestone Tracker (Phase 3)
 * @param {Sheet} sheet - The sheet to write to
 * @param {number} row - Starting row
 * @returns {number} - Next available row
 */
function generateMilestoneTracker(sheet, row) {
  // Section header
  sheet.getRange(row, 1, 1, 10).merge()
    .setValue("🎯 Milestone Tracker")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground(COLORS.LIGHT)
    .setHorizontalAlignment("left");
  row += 2;

  // Instructions
  sheet.getRange(row, 1, 1, 10).merge()
    .setValue("Track key project milestones. Profit distribution is triggered when property is sold. Update status and completion dates as milestones are achieved.")
    .setFontStyle("italic")
    .setFontColor(COLORS.TEXT_SECONDARY)
    .setFontSize(9);
  row += 2;

  // Milestone table header
  const milestoneHeaders = [
    "Milestone",
    "Description",
    "Target Date",
    "Completion Date",
    "Status",
    "Trigger Event",
    "Responsible Party",
    "Notes"
  ];

  const headerRange = sheet.getRange(row, 1, 1, milestoneHeaders.length);
  headerRange.setValues([milestoneHeaders]);
  styleHeader(headerRange, 'h3');
  headerRange.setBackground(COLORS.LIGHT);
  headerRange.setHorizontalAlignment("center");
  headerRange.setWrap(true);
  headerRange.setBorder(true, true, true, true, true, true, COLORS.BORDER, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  // Predefined milestones
  const milestoneStartRow = row;
  const milestones = [
    ["Property Acquired", "Purchase closed and title transferred", "", "", "Pending", "Closing completed", "", ""],
    ["Rehab Completed", "All renovation work finished and inspected", "", "", "Pending", "Final inspection passed", "", ""],
    ["Property Rented/Listed", "Property occupied by tenant or listed for sale", "", "", "Pending", "Lease signed or listing active", "", ""],
    ["Property Sold", "Sale closed and proceeds received", "", "", "Pending", "Sale closing completed", "", ""],
    ["Profit Distributed", "Final distributions made to all partners", "", "", "Pending", "All partners paid", "", ""]
  ];

  sheet.getRange(milestoneStartRow, 1, milestones.length, milestoneHeaders.length).setValues(milestones);

  // Format milestone table
  sheet.getRange(milestoneStartRow, 3, milestones.length, 1).setNumberFormat(FORMATS.DATE); // Target Date
  sheet.getRange(milestoneStartRow, 4, milestones.length, 1).setNumberFormat(FORMATS.DATE); // Completion Date

  // Add data validation for Status
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Pending", "In Progress", "Complete", "Delayed", "Cancelled"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(milestoneStartRow, 5, milestones.length, 1).setDataValidation(statusRule);

  // Add conditional formatting for Status
  addMilestoneStatusFormatting(sheet, milestoneStartRow, 5, milestones.length);

  row += milestones.length + 2;

  // Progress summary
  sheet.getRange(row, 1, 1, 5).merge()
    .setValue("📊 Milestone Progress Summary")
    .setFontWeight("bold")
    .setFontSize(11)
    .setBackground("#fff9e6");
  row++;

  const summaryData = [
    ["Total Milestones", milestones.length, "", "", ""],
    ["Completed", `=COUNTIF(E${milestoneStartRow}:E${milestoneStartRow + milestones.length - 1},"Complete")`, "", "", ""],
    ["In Progress", `=COUNTIF(E${milestoneStartRow}:E${milestoneStartRow + milestones.length - 1},"In Progress")`, "", "", ""],
    ["Pending", `=COUNTIF(E${milestoneStartRow}:E${milestoneStartRow + milestones.length - 1},"Pending")`, "", "", ""],
    ["Completion %", `=B${row + 1}/${milestones.length}`, "", "", ""]
  ];

  sheet.getRange(row, 1, summaryData.length, 5).setValues(summaryData);
  sheet.getRange(row, 1, summaryData.length, 1).setFontWeight("bold");
  sheet.getRange(row, 2, summaryData.length - 1, 1).setNumberFormat("0");
  sheet.getRange(row + summaryData.length - 1, 2).setNumberFormat("0.00%");
  sheet.getRange(row, 1, summaryData.length, 5).setBackground("#f9f9f9");

  row += summaryData.length + 2;

  return row;
}

/**
 * Section 6: Partner Performance Dashboard (Phase 3)
 * @param {Sheet} sheet - The sheet to write to
 * @param {number} row - Starting row
 * @returns {number} - Next available row
 */
function generatePerformanceDashboard(sheet, row) {
  // Section header
  sheet.getRange(row, 1, 1, 10).merge()
    .setValue("📊 Partner Performance Dashboard")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground(COLORS.LIGHT)
    .setHorizontalAlignment("left");
  row += 2;

  // Instructions
  sheet.getRange(row, 1, 1, 10).merge()
    .setValue("Comprehensive performance metrics for each partner. Net Profit = Distributions - Invested. Current Value based on capital contribution percentage × property value. Enter manual cash flows for IRR calculation.")
    .setFontStyle("italic")
    .setFontColor(COLORS.TEXT_SECONDARY)
    .setFontSize(9);
  row += 2;

  // Get property value from analysis tabs
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const flipSheet = ss.getSheetByName("Flip Analysis");
  const rentalSheet = ss.getSheetByName("Rental Analysis");

  let propertyValue = 0;
  let valueSource = "Manual Entry";

  // Try to get ARV from Flip Analysis
  if (flipSheet) {
    try {
      propertyValue = getFlipMetric(flipSheet, "After Repair Value (ARV)") || 0;
      if (propertyValue !== 0) {
        valueSource = "Flip Analysis ARV";
      }
    } catch (e) {
      Logger.log("Could not get ARV: " + e);
    }
  }

  // If no flip ARV, try rental property value
  if (propertyValue === 0 && rentalSheet) {
    try {
      propertyValue = getRentalMetric(rentalSheet, "Purchase Price") || 0;
      if (propertyValue !== 0) {
        valueSource = "Rental Analysis";
      }
    } catch (e) {
      Logger.log("Could not get rental value: " + e);
    }
  }

  // Property value input
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue("Current Property Value:")
    .setFontWeight("bold")
    .setFontSize(10);
  sheet.getRange(row, 3).setValue(propertyValue).setNumberFormat(FORMATS.CURRENCY_NO_CENTS);
  sheet.getRange(row, 4, 1, 2).merge()
    .setValue(`Source: ${valueSource}`)
    .setFontStyle("italic")
    .setFontSize(9)
    .setFontColor(COLORS.TEXT_SECONDARY);
  row += 2;

  // Reference to other sections
  const partnerStructureStartRow = 6;
  const partnerTableStartRow = partnerStructureStartRow + 7;
  const capitalTrackerStartRow = partnerTableStartRow + 9;
  const distributionHistoryStartRow = capitalTrackerStartRow + 20; // Approximate

  // Performance metrics table header
  const performanceHeaders = [
    "Partner Name",
    "Total Invested",
    "Distributions Received",
    "Net Profit",
    "ROI",
    "Current Value",
    "Cash-on-Cash Return",
    "MOIC",
    "IRR",
    "Status"
  ];

  const headerRange = sheet.getRange(row, 1, 1, performanceHeaders.length);
  headerRange.setValues([performanceHeaders]);
  styleHeader(headerRange, 'h3');
  headerRange.setBackground(COLORS.LIGHT);
  headerRange.setHorizontalAlignment("center");
  headerRange.setWrap(true);
  headerRange.setBorder(true, true, true, true, true, true, COLORS.BORDER, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  // Add 5 performance rows (matching partner count)
  const performanceStartRow = row;
  const propertyValueCell = `C${row - 2}`;

  for (let i = 0; i < 5; i++) {
    const currentRow = row + i;
    const partnerRow = partnerTableStartRow + i;

    const performanceRow = [
      `=A${partnerRow}`, // Partner Name
      `=C${partnerRow}`, // Total Invested (from Partnership Structure)
      0, // Distributions Received (user enters or pulls from Distribution History)
      `=C${currentRow}-B${currentRow}`, // Net Profit = Distributions - Invested
      `=IF(B${currentRow}>0,D${currentRow}/B${currentRow},0)`, // ROI = Net Profit / Invested
      `=IF(C${partnerTableStartRow + 4}>0,C${partnerRow}/C${partnerTableStartRow + 4}*${propertyValueCell},0)`, // Current Value = (Partner Capital / Total Capital) × Property Value
      `=IF(B${currentRow}>0,C${currentRow}/B${currentRow},0)`, // Cash-on-Cash Return = Distributions / Invested
      `=IF(B${currentRow}>0,C${currentRow}/B${currentRow},0)`, // MOIC = Distributions / Invested
      "", // IRR (calculated from manual cash flows below)
      "Active" // Status
    ];
    sheet.getRange(currentRow, 1, 1, performanceRow.length).setValues([performanceRow]);
  }

  // Format performance table
  sheet.getRange(performanceStartRow, 2, 5, 1).setNumberFormat(FORMATS.CURRENCY_NO_CENTS); // Total Invested
  sheet.getRange(performanceStartRow, 3, 5, 1).setNumberFormat(FORMATS.CURRENCY_NO_CENTS); // Distributions Received
  sheet.getRange(performanceStartRow, 4, 5, 1).setNumberFormat(FORMATS.CURRENCY_NO_CENTS); // Net Profit
  sheet.getRange(performanceStartRow, 5, 5, 1).setNumberFormat("0.00%"); // ROI
  sheet.getRange(performanceStartRow, 6, 5, 1).setNumberFormat(FORMATS.CURRENCY_NO_CENTS); // Current Value
  sheet.getRange(performanceStartRow, 7, 5, 1).setNumberFormat("0.00%"); // Cash-on-Cash Return
  sheet.getRange(performanceStartRow, 8, 5, 1).setNumberFormat("0.00x"); // MOIC
  sheet.getRange(performanceStartRow, 9, 5, 1).setNumberFormat("0.00%"); // IRR

  // Add conditional formatting for Net Profit
  for (let i = 0; i < 5; i++) {
    const netProfitCell = sheet.getRange(performanceStartRow + i, 4);
    netProfitCell.setFontWeight("bold");
  }

  // Add data validation for Status
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Active", "Inactive", "Exited"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(performanceStartRow, 10, 5, 1).setDataValidation(statusRule);

  row += 5 + 2;

  // IRR Cash Flow Entry Section
  sheet.getRange(row, 1, 1, 10).merge()
    .setValue("💰 Manual Cash Flow Entry for IRR Calculation")
    .setFontWeight("bold")
    .setFontSize(11)
    .setBackground("#e8f0fe");
  row++;

  sheet.getRange(row, 1, 1, 10).merge()
    .setValue("Enter cash flows for each partner (negative for investments, positive for distributions). IRR will be calculated automatically.")
    .setFontStyle("italic")
    .setFontColor(COLORS.TEXT_SECONDARY)
    .setFontSize(9);
  row += 2;

  // Cash flow table for each partner
  for (let partnerIdx = 0; partnerIdx < 5; partnerIdx++) {
    const partnerRow = partnerTableStartRow + partnerIdx;
    const performanceRow = performanceStartRow + partnerIdx;

    // Partner name header
    sheet.getRange(row, 1, 1, 8).merge()
      .setValue(`Partner ${partnerIdx + 1}: =A${partnerRow}`)
      .setFontWeight("bold")
      .setFontSize(10)
      .setBackground("#f8f9fa");
    row++;

    // Cash flow entry headers
    const cashFlowHeaders = ["Period", "Date", "Cash Flow", "Type", "Notes"];
    sheet.getRange(row, 1, 1, cashFlowHeaders.length).setValues([cashFlowHeaders]);
    sheet.getRange(row, 1, 1, cashFlowHeaders.length).setFontWeight("bold");
    sheet.getRange(row, 1, 1, cashFlowHeaders.length).setBackground(COLORS.LIGHT);
    row++;

    // Add 5 cash flow entry rows per partner
    const cashFlowStartRow = row;
    for (let i = 0; i < 5; i++) {
      const currentRow = row + i;
      const cashFlowRow = [
        i, // Period
        "", // Date
        "", // Cash Flow
        i === 0 ? "Investment" : "Distribution", // Type (default)
        "" // Notes
      ];
      sheet.getRange(currentRow, 1, 1, cashFlowRow.length).setValues([cashFlowRow]);
    }

    // Format cash flow table
    sheet.getRange(cashFlowStartRow, 2, 5, 1).setNumberFormat(FORMATS.DATE); // Date
    sheet.getRange(cashFlowStartRow, 3, 5, 1).setNumberFormat(FORMATS.CURRENCY_NO_CENTS); // Cash Flow

    // Add data validation for Type
    const typeRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Investment", "Distribution", "Capital Call", "Return of Capital", "Other"], true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(cashFlowStartRow, 4, 5, 1).setDataValidation(typeRule);

    row += 5;

    // IRR calculation note
    sheet.getRange(row, 1, 1, 5).merge()
      .setValue(`IRR for Partner ${partnerIdx + 1}: Manual calculation required - use cash flows above`)
      .setFontStyle("italic")
      .setFontSize(9)
      .setFontColor(COLORS.TEXT_SECONDARY);
    row += 2;
  }

  // Performance summary
  sheet.getRange(row, 1, 1, 8).merge()
    .setValue("📈 Overall Partnership Performance")
    .setFontWeight("bold")
    .setFontSize(11)
    .setBackground("#fff9e6");
  row++;

  const summaryData = [
    ["Total Capital Invested (All Partners)", `=SUM(B${performanceStartRow}:B${performanceStartRow + 4})`, "", "", "", "", "", ""],
    ["Total Distributions (All Partners)", `=SUM(C${performanceStartRow}:C${performanceStartRow + 4})`, "", "", "", "", "", ""],
    ["Total Net Profit (All Partners)", `=SUM(D${performanceStartRow}:D${performanceStartRow + 4})`, "", "", "", "", "", ""],
    ["Average ROI", `=AVERAGE(E${performanceStartRow}:E${performanceStartRow + 4})`, "", "", "", "", "", ""],
    ["Average MOIC", `=AVERAGE(H${performanceStartRow}:H${performanceStartRow + 4})`, "", "", "", "", "", ""],
    ["Total Current Value", `=SUM(F${performanceStartRow}:F${performanceStartRow + 4})`, "", "", "", "", "", ""]
  ];

  sheet.getRange(row, 1, summaryData.length, 8).setValues(summaryData);
  sheet.getRange(row, 1, summaryData.length, 1).setFontWeight("bold");
  sheet.getRange(row, 2, 3, 1).setNumberFormat(FORMATS.CURRENCY_NO_CENTS); // Currency fields
  sheet.getRange(row + 3, 2).setNumberFormat("0.00%"); // Average ROI
  sheet.getRange(row + 4, 2).setNumberFormat("0.00x"); // Average MOIC
  sheet.getRange(row + 5, 2).setNumberFormat(FORMATS.CURRENCY_NO_CENTS); // Total Current Value
  sheet.getRange(row, 1, summaryData.length, 8).setBackground("#f9f9f9");

  row += summaryData.length + 2;

  return row;
}

/**
 * Add conditional formatting for milestone status
 */
function addMilestoneStatusFormatting(sheet, startRow, column, numRows) {
  const range = sheet.getRange(startRow, column, numRows, 1);

  // Complete - Green
  const completeRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Complete")
    .setBackground("#d4edda")
    .setFontColor("#155724")
    .setRanges([range])
    .build();

  // In Progress - Blue
  const inProgressRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("In Progress")
    .setBackground("#d1ecf1")
    .setFontColor("#0c5460")
    .setRanges([range])
    .build();

  // Pending - Yellow
  const pendingRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Pending")
    .setBackground("#fff3cd")
    .setFontColor("#856404")
    .setRanges([range])
    .build();

  // Delayed - Orange
  const delayedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Delayed")
    .setBackground("#ffe5cc")
    .setFontColor("#cc5200")
    .setRanges([range])
    .build();

  // Cancelled - Red
  const cancelledRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Cancelled")
    .setBackground("#f8d7da")
    .setFontColor("#721c24")
    .setRanges([range])
    .build();

  const rules = sheet.getConditionalFormatRules();
  rules.push(completeRule, inProgressRule, pendingRule, delayedRule, cancelledRule);
  sheet.setConditionalFormatRules(rules);
}

/**
 * Section 3: Waterfall Distribution Calculator (Phase 2)
 * @param {Sheet} sheet - The sheet to write to
 * @param {number} row - Starting row
 * @returns {number} - Next available row
 */
function generateWaterfallCalculator(sheet, row) {
  // Section header
  sheet.getRange(row, 1, 1, 10).merge()
    .setValue("💧 Waterfall Distribution Calculator")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground(COLORS.LIGHT)
    .setHorizontalAlignment("left");
  row += 2;

  // Instructions
  sheet.getRange(row, 1, 1, 10).merge()
    .setValue("Configure waterfall structure to calculate tiered profit distributions. Common structure: Return of Capital → Preferred Return → Catch-up → Remaining Profit Split.")
    .setFontStyle("italic")
    .setFontColor(COLORS.TEXT_SECONDARY)
    .setFontSize(9);
  row += 2;

  // Waterfall Configuration
  sheet.getRange(row, 1, 1, 5).merge()
    .setValue("⚙️ Waterfall Configuration")
    .setFontWeight("bold")
    .setFontSize(11)
    .setBackground("#e8f0fe");
  row++;

  const configData = [
    ["Preferred Return Rate (%):", 8, "", "", ""],
    ["GP Promote (%):", 20, "", "", ""],
    ["Catch-up Provision:", "Yes", "", "", ""],
    ["Distribution Frequency:", "At Exit", "", "", ""]
  ];

  sheet.getRange(row, 1, configData.length, 5).setValues(configData);
  sheet.getRange(row, 1, configData.length, 1).setFontWeight("bold");
  sheet.getRange(row, 2, 2, 1).setNumberFormat("0.00%"); // Percentage fields

  // Add data validation for Catch-up Provision
  const yesNoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Yes", "No"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(row + 2, 2).setDataValidation(yesNoRule);

  // Add data validation for Distribution Frequency
  const frequencyRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Monthly", "Quarterly", "Annual", "At Exit"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(row + 3, 2).setDataValidation(frequencyRule);

  const configStartRow = row;
  row += configData.length + 2;

  // Get profit data and partner info
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const flipSheet = ss.getSheetByName("Flip Analysis");
  const rentalSheet = ss.getSheetByName("Rental Analysis");

  let totalProfit = 0;
  let profitSource = "N/A";

  // Try to get net profit from Flip Analysis
  if (flipSheet) {
    try {
      totalProfit = getFlipMetric(flipSheet, "Net Profit ($)") || 0;
      if (totalProfit !== 0) {
        profitSource = "Flip Analysis";
      }
    } catch (e) {
      Logger.log("Could not get flip profit: " + e);
    }
  }

  // If no flip profit, try rental cash flow
  if (totalProfit === 0 && rentalSheet) {
    try {
      totalProfit = getRentalMetric(rentalSheet, "Annual Cash Flow ($)") || 0;
      if (totalProfit !== 0) {
        profitSource = "Rental Analysis";
      }
    } catch (e) {
      Logger.log("Could not get rental cash flow: " + e);
    }
  }

  // Data source info
  sheet.getRange(row, 1, 1, 3).merge()
    .setValue(`Total Available for Distribution: ${Utilities.formatString("$%,.0f", totalProfit)}`)
    .setFontWeight("bold")
    .setFontSize(10)
    .setFontColor(totalProfit >= 0 ? COLORS.SUCCESS : COLORS.DANGER);
  sheet.getRange(row, 4, 1, 2).merge()
    .setValue(`Source: ${profitSource}`)
    .setFontStyle("italic")
    .setFontSize(9)
    .setFontColor(COLORS.TEXT_SECONDARY);
  row += 2;

  // Waterfall Distribution Table
  const waterfallHeaders = [
    "Tier",
    "Description",
    "Amount",
    "Partner 1",
    "Partner 2",
    "Partner 3",
    "Partner 4",
    "Partner 5",
    "Notes"
  ];

  const headerRange = sheet.getRange(row, 1, 1, waterfallHeaders.length);
  headerRange.setValues([waterfallHeaders]);
  styleHeader(headerRange, 'h3');
  headerRange.setBackground(COLORS.LIGHT);
  headerRange.setHorizontalAlignment("center");
  headerRange.setWrap(true);
  headerRange.setBorder(true, true, true, true, true, true, COLORS.BORDER, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  // Reference to partner structure and capital tracker
  const partnerStructureStartRow = 6;
  const partnerTableStartRow = partnerStructureStartRow + 7;
  const capitalTrackerStartRow = partnerTableStartRow + 9; // Approximate

  const waterfallStartRow = row;
  const preferredReturnCell = `B${configStartRow}`;
  const gpPromoteCell = `B${configStartRow + 1}`;
  const catchupCell = `B${configStartRow + 2}`;

  // Tier 1: Return of Capital
  const tier1Data = [
    "1",
    "Return of Capital",
    `=SUM(D${row}:H${row})`, // Total amount
    `=C${partnerTableStartRow}`, // Partner 1 capital
    `=C${partnerTableStartRow + 1}`, // Partner 2 capital
    `=C${partnerTableStartRow + 2}`, // Partner 3 capital
    `=C${partnerTableStartRow + 3}`, // Partner 4 capital
    `=C${partnerTableStartRow + 4}`, // Partner 5 capital
    "100% to investors"
  ];
  sheet.getRange(row, 1, 1, tier1Data.length).setValues([tier1Data]);
  row++;

  // Tier 2: Preferred Return
  const tier2Data = [
    "2",
    "Preferred Return",
    `=SUM(D${row}:H${row})`, // Total amount
    `=D${row - 1}*${preferredReturnCell}`, // Partner 1 preferred
    `=E${row - 1}*${preferredReturnCell}`, // Partner 2 preferred
    `=F${row - 1}*${preferredReturnCell}`, // Partner 3 preferred
    `=G${row - 1}*${preferredReturnCell}`, // Partner 4 preferred
    `=H${row - 1}*${preferredReturnCell}`, // Partner 5 preferred
    `="@ "&TEXT(${preferredReturnCell},"0.0%")&" annually"`
  ];
  sheet.getRange(row, 1, 1, tier2Data.length).setValues([tier2Data]);
  row++;

  // Tier 3: Catch-up (GP only if enabled)
  const tier3Data = [
    "3",
    "Catch-up (GP)",
    `=IF(${catchupCell}="Yes",MIN(${totalProfit}-C${row - 2}-C${row - 1},C${row - 1}*${gpPromoteCell}/(1-${gpPromoteCell})),0)`, // Catch-up amount
    0, // Partner 1
    0, // Partner 2
    0, // Partner 3
    0, // Partner 4
    0, // Partner 5 (or GP gets it all)
    `="GP gets "&TEXT(${gpPromoteCell},"0%")&" promote"`
  ];
  sheet.getRange(row, 1, 1, tier3Data.length).setValues([tier3Data]);
  row++;

  // Tier 4: Remaining Profit Split
  const remainingProfit = `${totalProfit}-C${row - 3}-C${row - 2}-C${row - 1}`;
  const tier4Data = [
    "4",
    "Remaining Profit",
    `=MAX(0,${remainingProfit})`, // Remaining amount
    `=MAX(0,${remainingProfit})*B${partnerTableStartRow}`, // Partner 1 split by ownership %
    `=MAX(0,${remainingProfit})*B${partnerTableStartRow + 1}`, // Partner 2 split
    `=MAX(0,${remainingProfit})*B${partnerTableStartRow + 2}`, // Partner 3 split
    `=MAX(0,${remainingProfit})*B${partnerTableStartRow + 3}`, // Partner 4 split
    `=MAX(0,${remainingProfit})*B${partnerTableStartRow + 4}`, // Partner 5 split
    "Split by ownership %"
  ];
  sheet.getRange(row, 1, 1, tier4Data.length).setValues([tier4Data]);
  row++;

  // Totals row
  const totalsData = [
    "TOTAL",
    "Total Distribution",
    `=SUM(C${waterfallStartRow}:C${row - 1})`,
    `=SUM(D${waterfallStartRow}:D${row - 1})`,
    `=SUM(E${waterfallStartRow}:E${row - 1})`,
    `=SUM(F${waterfallStartRow}:F${row - 1})`,
    `=SUM(G${waterfallStartRow}:G${row - 1})`,
    `=SUM(H${waterfallStartRow}:H${row - 1})`,
    ""
  ];
  sheet.getRange(row, 1, 1, totalsData.length).setValues([totalsData]);
  sheet.getRange(row, 1, 1, totalsData.length).setFontWeight("bold");
  sheet.getRange(row, 1, 1, totalsData.length).setBackground("#f2f2f2");

  // Format waterfall table
  sheet.getRange(waterfallStartRow, 3, 5, 6).setNumberFormat(FORMATS.CURRENCY_NO_CENTS); // All amounts

  row += 2;

  // Summary metrics
  sheet.getRange(row, 1, 1, 5).merge()
    .setValue("📊 Distribution Summary by Partner")
    .setFontWeight("bold")
    .setFontSize(11)
    .setBackground("#fff9e6");
  row++;

  const summaryHeaders = ["Partner", "Total Distribution", "% of Total", "ROI", "MOIC"];
  sheet.getRange(row, 1, 1, summaryHeaders.length).setValues([summaryHeaders]);
  styleHeader(sheet.getRange(row, 1, 1, summaryHeaders.length), 'h3');
  sheet.getRange(row, 1, 1, summaryHeaders.length).setBackground(COLORS.LIGHT);
  row++;

  const summaryStartRow = row;
  for (let i = 0; i < 5; i++) {
    const currentRow = row + i;
    const partnerRow = partnerTableStartRow + i;
    const distributionCol = String.fromCharCode(68 + i); // D, E, F, G, H

    const summaryRow = [
      `=A${partnerRow}`, // Partner name
      `=${distributionCol}${waterfallStartRow + 4}`, // Total distribution (from totals row)
      `=IF(C${waterfallStartRow + 4}>0,B${currentRow}/C${waterfallStartRow + 4},0)`, // % of total
      `=IF(C${partnerRow}>0,(B${currentRow}-C${partnerRow})/C${partnerRow},0)`, // ROI
      `=IF(C${partnerRow}>0,B${currentRow}/C${partnerRow},0)` // MOIC
    ];
    sheet.getRange(currentRow, 1, 1, summaryRow.length).setValues([summaryRow]);
  }

  // Format summary table
  sheet.getRange(summaryStartRow, 2, 5, 1).setNumberFormat(FORMATS.CURRENCY_NO_CENTS); // Total Distribution
  sheet.getRange(summaryStartRow, 3, 5, 1).setNumberFormat("0.00%"); // % of Total
  sheet.getRange(summaryStartRow, 4, 5, 1).setNumberFormat("0.00%"); // ROI
  sheet.getRange(summaryStartRow, 5, 5, 1).setNumberFormat("0.00x"); // MOIC

  row += 5 + 2;

  return row;
}

/**
 * Section 8: Distribution History & Projections (Phase 2)
 * @param {Sheet} sheet - The sheet to write to
 * @param {number} row - Starting row
 * @returns {number} - Next available row
 */
function generateDistributionHistory(sheet, row) {
  // Section header
  sheet.getRange(row, 1, 1, 10).merge()
    .setValue("📅 Distribution History & Projections")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground(COLORS.LIGHT)
    .setHorizontalAlignment("left");
  row += 2;

  // Instructions
  sheet.getRange(row, 1, 1, 10).merge()
    .setValue("Track historical distributions and project future ones. Enter actual distributions as they occur.")
    .setFontStyle("italic")
    .setFontColor(COLORS.TEXT_SECONDARY)
    .setFontSize(9);
  row += 2;

  // Historical Distributions
  sheet.getRange(row, 1, 1, 8).merge()
    .setValue("📜 Historical Distributions")
    .setFontWeight("bold")
    .setFontSize(11)
    .setBackground("#e8f0fe");
  row++;

  const historyHeaders = [
    "Date",
    "Distribution Type",
    "Total Amount",
    "Partner 1",
    "Partner 2",
    "Partner 3",
    "Partner 4",
    "Partner 5",
    "Tax Withholding",
    "Notes"
  ];

  const headerRange = sheet.getRange(row, 1, 1, historyHeaders.length);
  headerRange.setValues([historyHeaders]);
  styleHeader(headerRange, 'h3');
  headerRange.setBackground(COLORS.LIGHT);
  headerRange.setHorizontalAlignment("center");
  headerRange.setWrap(true);
  headerRange.setBorder(true, true, true, true, true, true, COLORS.BORDER, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  // Add 10 history rows
  const historyStartRow = row;
  for (let i = 0; i < 10; i++) {
    const currentRow = row + i;
    const historyRow = [
      "", // Date
      "Quarterly Cash Flow", // Distribution Type (default)
      `=SUM(D${currentRow}:H${currentRow})`, // Total Amount (auto-calculated)
      "", // Partner 1
      "", // Partner 2
      "", // Partner 3
      "", // Partner 4
      "", // Partner 5
      "", // Tax Withholding
      "" // Notes
    ];
    sheet.getRange(currentRow, 1, 1, historyRow.length).setValues([historyRow]);
  }

  // Format history table
  sheet.getRange(historyStartRow, 1, 10, 1).setNumberFormat(FORMATS.DATE); // Date
  sheet.getRange(historyStartRow, 3, 10, 6).setNumberFormat(FORMATS.CURRENCY_NO_CENTS); // All amounts
  sheet.getRange(historyStartRow, 9, 10, 1).setNumberFormat(FORMATS.CURRENCY_NO_CENTS); // Tax Withholding

  // Add data validation for Distribution Type
  const distributionTypeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Monthly Cash Flow", "Quarterly Cash Flow", "Annual Distribution", "Capital Event", "Refinance Proceeds", "Sale Proceeds", "Other"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(historyStartRow, 2, 10, 1).setDataValidation(distributionTypeRule);

  row += 10 + 1;

  // History totals
  const historyTotalsData = [
    ["Total Historical Distributions", `=SUM(C${historyStartRow}:C${historyStartRow + 9})`, "", "", "", "", "", "", "", ""],
    ["Total Tax Withholding", `=SUM(I${historyStartRow}:I${historyStartRow + 9})`, "", "", "", "", "", "", "", ""],
    ["Net Distributions to Partners", `=B${row}-B${row + 1}`, "", "", "", "", "", "", "", ""]
  ];
  sheet.getRange(row, 1, historyTotalsData.length, 10).setValues(historyTotalsData);
  sheet.getRange(row, 1, historyTotalsData.length, 1).setFontWeight("bold");
  sheet.getRange(row, 2, historyTotalsData.length, 1).setNumberFormat(FORMATS.CURRENCY_NO_CENTS);
  sheet.getRange(row, 1, historyTotalsData.length, 10).setBackground("#f9f9f9");

  row += historyTotalsData.length + 2;

  // Projected Distributions
  sheet.getRange(row, 1, 1, 7).merge()
    .setValue("🔮 Projected Future Distributions")
    .setFontWeight("bold")
    .setFontSize(11)
    .setBackground("#e8f0fe");
  row++;

  const projectionHeaders = [
    "Period",
    "Projected Distribution",
    "Partner 1",
    "Partner 2",
    "Partner 3",
    "Partner 4",
    "Partner 5",
    "Basis/Assumption",
    "Confidence",
    "Notes"
  ];

  const projHeaderRange = sheet.getRange(row, 1, 1, projectionHeaders.length);
  projHeaderRange.setValues([projectionHeaders]);
  styleHeader(projHeaderRange, 'h3');
  projHeaderRange.setBackground(COLORS.LIGHT);
  projHeaderRange.setHorizontalAlignment("center");
  projHeaderRange.setWrap(true);
  projHeaderRange.setBorder(true, true, true, true, true, true, COLORS.BORDER, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  // Add 5 projection rows
  const projectionStartRow = row;
  const avgHistoricalDist = `AVERAGE(C${historyStartRow}:C${historyStartRow + 9})`;

  for (let i = 0; i < 5; i++) {
    const currentRow = row + i;
    const quarter = i + 1;
    const projectionRow = [
      `Q${quarter} ${new Date().getFullYear()}`, // Period
      `=${avgHistoricalDist}`, // Projected Distribution (based on historical average)
      `=B${currentRow}*0.20`, // Partner 1 (example: 20% split)
      `=B${currentRow}*0.20`, // Partner 2
      `=B${currentRow}*0.20`, // Partner 3
      `=B${currentRow}*0.20`, // Partner 4
      `=B${currentRow}*0.20`, // Partner 5
      "Historical average", // Basis
      "Medium", // Confidence (default)
      "" // Notes
    ];
    sheet.getRange(currentRow, 1, 1, projectionRow.length).setValues([projectionRow]);
  }

  // Format projection table
  sheet.getRange(projectionStartRow, 2, 5, 6).setNumberFormat(FORMATS.CURRENCY_NO_CENTS); // All amounts

  // Add data validation for Confidence
  const confidenceRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["High", "Medium", "Low"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(projectionStartRow, 9, 5, 1).setDataValidation(confidenceRule);

  // Add conditional formatting for Confidence
  addConfidenceFormatting(sheet, projectionStartRow, 9, 5);

  row += 5 + 1;

  // Projection totals
  const projectionTotalsData = [
    ["Total Projected Distributions", `=SUM(B${projectionStartRow}:B${projectionStartRow + 4})`, "", "", "", "", "", "", "", ""]
  ];
  sheet.getRange(row, 1, projectionTotalsData.length, 10).setValues(projectionTotalsData);
  sheet.getRange(row, 1, projectionTotalsData.length, 1).setFontWeight("bold");
  sheet.getRange(row, 2, projectionTotalsData.length, 1).setNumberFormat(FORMATS.CURRENCY_NO_CENTS);
  sheet.getRange(row, 1, projectionTotalsData.length, 10).setBackground("#f9f9f9");

  row += projectionTotalsData.length + 2;

  return row;
}

/**
 * Add conditional formatting for confidence level
 */
function addConfidenceFormatting(sheet, startRow, column, numRows) {
  const range = sheet.getRange(startRow, column, numRows, 1);

  // High - Green
  const highRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("High")
    .setBackground("#d4edda")
    .setFontColor("#155724")
    .setRanges([range])
    .build();

  // Medium - Yellow
  const mediumRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Medium")
    .setBackground("#fff3cd")
    .setFontColor("#856404")
    .setRanges([range])
    .build();

  // Low - Red
  const lowRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Low")
    .setBackground("#f8d7da")
    .setFontColor("#721c24")
    .setRanges([range])
    .build();

  const rules = sheet.getConditionalFormatRules();
  rules.push(highRule, mediumRule, lowRule);
  sheet.setConditionalFormatRules(rules);
}

/**
 * Section 1: Partnership Structure Overview
 * @param {Sheet} sheet - The sheet to write to
 * @param {number} row - Starting row
 * @returns {number} - Next available row
 */
function generatePartnershipStructure(sheet, row) {
  // Section header
  sheet.getRange(row, 1, 1, 10).merge()
    .setValue("📋 Partnership Structure Overview")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground(COLORS.LIGHT)
    .setHorizontalAlignment("left");
  row += 2;

  // Partnership details
  const detailsData = [
    ["Partnership Name:", "", "", "", "", "", "", "", "", ""],
    ["Partnership Type:", "", "", "", "", "", "", "", "", ""],
    ["Formation Date:", "", "", "", "", "", "", "", "", ""],
    ["Number of Partners:", "=COUNTA(A" + (row + 7) + ":A" + (row + 11) + ")", "", "", "", "", "", "", "", ""],
    ["Total Capital Committed:", "=SUM(C" + (row + 7) + ":C" + (row + 11) + ")", "", "", "", "", "", "", "", ""]
  ];

  sheet.getRange(row, 1, detailsData.length, 10).setValues(detailsData);
  sheet.getRange(row, 1, detailsData.length, 1).setFontWeight("bold");

  // Format calculated fields
  sheet.getRange(row + 3, 2).setNumberFormat("0"); // Number of partners
  sheet.getRange(row + 4, 2).setNumberFormat(FORMATS.CURRENCY_NO_CENTS); // Total capital

  // Add dropdown for Partnership Type
  const partnershipTypeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["LLC", "LP", "GP", "Joint Venture", "S-Corp", "C-Corp"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(row + 1, 2).setDataValidation(partnershipTypeRule);

  // Format formation date
  sheet.getRange(row + 2, 2).setNumberFormat(FORMATS.DATE);

  row += detailsData.length + 2;

  // Partner table header
  const partnerHeaders = [
    "Partner Name",
    "Ownership %",
    "Initial Capital",
    "Investment Type",
    "Date Invested",
    "Contact Email",
    "Phone",
    "Role",
    "Status",
    "Notes"
  ];

  const headerRange = sheet.getRange(row, 1, 1, partnerHeaders.length);
  headerRange.setValues([partnerHeaders]);
  styleHeader(headerRange, 'h3');
  headerRange.setBackground(COLORS.LIGHT);
  headerRange.setHorizontalAlignment("center");
  headerRange.setWrap(true);
  headerRange.setBorder(true, true, true, true, true, true, COLORS.BORDER, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  // Add 5 partner rows
  const partnerStartRow = row;
  for (let i = 0; i < 5; i++) {
    const partnerRow = [
      "", // Partner Name
      "", // Ownership %
      "", // Initial Capital
      "Equity", // Investment Type (default)
      "", // Date Invested
      "", // Contact Email
      "", // Phone
      "Limited Partner", // Role (default)
      "Active", // Status (default)
      "" // Notes
    ];
    sheet.getRange(row + i, 1, 1, partnerRow.length).setValues([partnerRow]);
  }

  // Format partner table
  sheet.getRange(partnerStartRow, 2, 5, 1).setNumberFormat("0.00%"); // Ownership %
  sheet.getRange(partnerStartRow, 3, 5, 1).setNumberFormat(FORMATS.CURRENCY_NO_CENTS); // Initial Capital
  sheet.getRange(partnerStartRow, 5, 5, 1).setNumberFormat(FORMATS.DATE); // Date Invested

  // Add data validation for Investment Type
  const investmentTypeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Equity", "Debt", "Hybrid"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(partnerStartRow, 4, 5, 1).setDataValidation(investmentTypeRule);

  // Add data validation for Role
  const roleRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["General Partner", "Limited Partner", "Managing Member", "Silent Partner"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(partnerStartRow, 8, 5, 1).setDataValidation(roleRule);

  // Add data validation for Status
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Active", "Inactive", "Pending", "Exited"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(partnerStartRow, 9, 5, 1).setDataValidation(statusRule);

  // Add conditional formatting for Status
  addPartnerStatusFormatting(sheet, partnerStartRow, 9, 5);

  row += 5 + 1;

  // Add validation note
  sheet.getRange(row, 1, 1, 10).merge()
    .setValue("⚠️ Note: Ownership percentages should total 100%. Current total: =SUM(B" + partnerStartRow + ":B" + (partnerStartRow + 4) + ")")
    .setFontStyle("italic")
    .setFontColor(COLORS.TEXT_SECONDARY)
    .setFontSize(9);
  row += 2;

  return row;
}

/**
 * Section 2: Capital Contributions Tracker
 * @param {Sheet} sheet - The sheet to write to
 * @param {number} row - Starting row
 * @returns {number} - Next available row
 */
function generateCapitalTracker(sheet, row) {
  // Section header
  sheet.getRange(row, 1, 1, 10).merge()
    .setValue("💰 Capital Contributions Tracker")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground(COLORS.LIGHT)
    .setHorizontalAlignment("left");
  row += 2;

  // Instructions
  sheet.getRange(row, 1, 1, 10).merge()
    .setValue("Track all capital contributions over time. Running totals are calculated automatically per partner.")
    .setFontStyle("italic")
    .setFontColor(COLORS.TEXT_SECONDARY)
    .setFontSize(9);
  row += 2;

  // Contribution table header
  const contributionHeaders = [
    "Date",
    "Partner Name",
    "Contribution Type",
    "Amount",
    "Running Total",
    "Payment Method",
    "Reference #",
    "Verified By",
    "Status",
    "Notes"
  ];

  const headerRange = sheet.getRange(row, 1, 1, contributionHeaders.length);
  headerRange.setValues([contributionHeaders]);
  styleHeader(headerRange, 'h3');
  headerRange.setBackground(COLORS.LIGHT);
  headerRange.setHorizontalAlignment("center");
  headerRange.setWrap(true);
  headerRange.setBorder(true, true, true, true, true, true, COLORS.BORDER, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  // Add 10 contribution rows
  const contributionStartRow = row;
  for (let i = 0; i < 10; i++) {
    const currentRow = row + i;
    const contributionRow = [
      "", // Date
      "", // Partner Name
      "Initial Capital", // Contribution Type (default)
      "", // Amount
      `=SUMIF($B$${contributionStartRow}:$B${currentRow},$B${currentRow},$D$${contributionStartRow}:$D${currentRow})`, // Running Total (formula)
      "Wire Transfer", // Payment Method (default)
      "", // Reference #
      "", // Verified By
      "Pending", // Status (default)
      "" // Notes
    ];
    sheet.getRange(currentRow, 1, 1, contributionRow.length).setValues([contributionRow]);
  }

  // Format contribution table
  sheet.getRange(contributionStartRow, 1, 10, 1).setNumberFormat(FORMATS.DATE); // Date
  sheet.getRange(contributionStartRow, 4, 10, 1).setNumberFormat(FORMATS.CURRENCY_NO_CENTS); // Amount
  sheet.getRange(contributionStartRow, 5, 10, 1).setNumberFormat(FORMATS.CURRENCY_NO_CENTS); // Running Total

  // Add data validation for Contribution Type
  const contributionTypeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Initial Capital", "Capital Call", "Additional Investment", "Loan", "Other"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(contributionStartRow, 3, 10, 1).setDataValidation(contributionTypeRule);

  // Add data validation for Payment Method
  const paymentMethodRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Wire Transfer", "Check", "ACH", "Cash", "Other"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(contributionStartRow, 6, 10, 1).setDataValidation(paymentMethodRule);

  // Add data validation for Status
  const contributionStatusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Pending", "Verified", "Cleared", "Rejected"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(contributionStartRow, 9, 10, 1).setDataValidation(contributionStatusRule);

  // Add conditional formatting for Status
  addContributionStatusFormatting(sheet, contributionStartRow, 9, 10);

  row += 10 + 2;

  // Summary section
  sheet.getRange(row, 1, 1, 5).merge()
    .setValue("📊 Capital Contributions Summary")
    .setFontWeight("bold")
    .setFontSize(11)
    .setBackground("#fff9e6");
  row++;

  const summaryData = [
    ["Total Contributions (All Partners)", `=SUM(D${contributionStartRow}:D${contributionStartRow + 9})`, "", "", ""],
    ["Total Verified Contributions", `=SUMIF(I${contributionStartRow}:I${contributionStartRow + 9},"Verified",D${contributionStartRow}:D${contributionStartRow + 9})`, "", "", ""],
    ["Pending Verification", `=SUMIF(I${contributionStartRow}:I${contributionStartRow + 9},"Pending",D${contributionStartRow}:D${contributionStartRow + 9})`, "", "", ""]
  ];

  sheet.getRange(row, 1, summaryData.length, 5).setValues(summaryData);
  sheet.getRange(row, 1, summaryData.length, 1).setFontWeight("bold");
  sheet.getRange(row, 2, summaryData.length, 1).setNumberFormat(FORMATS.CURRENCY_NO_CENTS);
  sheet.getRange(row, 1, summaryData.length, 5).setBackground("#f9f9f9");

  row += summaryData.length + 2;

  return row;
}

/**
 * Section 4: Profit/Loss Allocation (Phase 1 - Simple % Split)
 * @param {Sheet} sheet - The sheet to write to
 * @param {number} row - Starting row
 * @returns {number} - Next available row
 */
function generateProfitAllocation(sheet, row) {
  // Section header
  sheet.getRange(row, 1, 1, 10).merge()
    .setValue("📈 Profit/Loss Allocation")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground(COLORS.LIGHT)
    .setHorizontalAlignment("left");
  row += 2;

  // Instructions
  sheet.getRange(row, 1, 1, 10).merge()
    .setValue("P&L is allocated based on ownership percentages. Data is pulled from Flip Analysis or Rental Analysis tabs.")
    .setFontStyle("italic")
    .setFontColor(COLORS.TEXT_SECONDARY)
    .setFontSize(9);
  row += 2;

  // Get profit data from analysis tabs
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const flipSheet = ss.getSheetByName("Flip Analysis");
  const rentalSheet = ss.getSheetByName("Rental Analysis");

  let netProfit = 0;
  let profitSource = "N/A";

  // Try to get net profit from Flip Analysis
  if (flipSheet) {
    try {
      netProfit = getFlipMetric(flipSheet, "Net Profit ($)") || 0;
      if (netProfit !== 0) {
        profitSource = "Flip Analysis";
      }
    } catch (e) {
      Logger.log("Could not get flip profit: " + e);
    }
  }

  // If no flip profit, try rental cash flow
  if (netProfit === 0 && rentalSheet) {
    try {
      netProfit = getRentalMetric(rentalSheet, "Annual Cash Flow ($)") || 0;
      if (netProfit !== 0) {
        profitSource = "Rental Analysis";
      }
    } catch (e) {
      Logger.log("Could not get rental cash flow: " + e);
    }
  }

  // Data source info
  sheet.getRange(row, 1, 1, 3).merge()
    .setValue(`Data Source: ${profitSource}`)
    .setFontWeight("bold")
    .setFontSize(10);
  sheet.getRange(row, 4, 1, 2).merge()
    .setValue(`Total Profit/Loss: ${Utilities.formatString("$%,.0f", netProfit)}`)
    .setFontWeight("bold")
    .setFontSize(10)
    .setFontColor(netProfit >= 0 ? COLORS.SUCCESS : COLORS.DANGER);
  row += 2;

  // P&L Allocation table header
  const allocationHeaders = [
    "Partner Name",
    "Ownership %",
    "Current Period P&L",
    "Cumulative P&L",
    "K-1 Allocation",
    "Tax Year",
    "Distribution Received",
    "Undistributed Earnings",
    "Notes"
  ];

  const headerRange = sheet.getRange(row, 1, 1, allocationHeaders.length);
  headerRange.setValues([allocationHeaders]);
  styleHeader(headerRange, 'h3');
  headerRange.setBackground(COLORS.LIGHT);
  headerRange.setHorizontalAlignment("center");
  headerRange.setWrap(true);
  headerRange.setBorder(true, true, true, true, true, true, COLORS.BORDER, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  // Reference to partner structure section (assuming it starts at row 6)
  const partnerStructureStartRow = 6;
  const partnerTableStartRow = partnerStructureStartRow + 7;

  // Add 5 allocation rows (matching partner count)
  const allocationStartRow = row;
  for (let i = 0; i < 5; i++) {
    const currentRow = row + i;
    const partnerRow = partnerTableStartRow + i;

    const allocationRow = [
      `=A${partnerRow}`, // Partner Name (reference from structure)
      `=B${partnerRow}`, // Ownership % (reference from structure)
      `=B${currentRow}*${netProfit}`, // Current Period P&L (ownership % * total profit)
      "", // Cumulative P&L (user enters or formula from history)
      `=C${currentRow}`, // K-1 Allocation (same as current period for now)
      new Date().getFullYear(), // Tax Year (current year)
      "", // Distribution Received (user enters)
      `=C${currentRow}-G${currentRow}`, // Undistributed Earnings
      "" // Notes
    ];
    sheet.getRange(currentRow, 1, 1, allocationRow.length).setValues([allocationRow]);
  }

  // Format allocation table
  sheet.getRange(allocationStartRow, 2, 5, 1).setNumberFormat("0.00%"); // Ownership %
  sheet.getRange(allocationStartRow, 3, 5, 1).setNumberFormat(FORMATS.CURRENCY_NO_CENTS); // Current Period P&L
  sheet.getRange(allocationStartRow, 4, 5, 1).setNumberFormat(FORMATS.CURRENCY_NO_CENTS); // Cumulative P&L
  sheet.getRange(allocationStartRow, 5, 5, 1).setNumberFormat(FORMATS.CURRENCY_NO_CENTS); // K-1 Allocation
  sheet.getRange(allocationStartRow, 7, 5, 1).setNumberFormat(FORMATS.CURRENCY_NO_CENTS); // Distribution Received
  sheet.getRange(allocationStartRow, 8, 5, 1).setNumberFormat(FORMATS.CURRENCY_NO_CENTS); // Undistributed Earnings

  // Add conditional formatting for P&L values
  for (let i = 0; i < 5; i++) {
    const plCell = sheet.getRange(allocationStartRow + i, 3);
    const undistributedCell = sheet.getRange(allocationStartRow + i, 8);

    // Color code based on positive/negative
    plCell.setFontWeight("bold");
    undistributedCell.setFontWeight("bold");
  }

  row += 5 + 2;

  // Totals row
  const totalsRow = [
    "TOTAL",
    `=SUM(B${allocationStartRow}:B${allocationStartRow + 4})`,
    `=SUM(C${allocationStartRow}:C${allocationStartRow + 4})`,
    `=SUM(D${allocationStartRow}:D${allocationStartRow + 4})`,
    `=SUM(E${allocationStartRow}:E${allocationStartRow + 4})`,
    "",
    `=SUM(G${allocationStartRow}:G${allocationStartRow + 4})`,
    `=SUM(H${allocationStartRow}:H${allocationStartRow + 4})`,
    ""
  ];

  sheet.getRange(row, 1, 1, totalsRow.length).setValues([totalsRow]);
  sheet.getRange(row, 1, 1, totalsRow.length).setFontWeight("bold");
  sheet.getRange(row, 1, 1, totalsRow.length).setBackground("#f2f2f2");
  sheet.getRange(row, 2).setNumberFormat("0.00%");
  sheet.getRange(row, 3, 1, 3).setNumberFormat(FORMATS.CURRENCY_NO_CENTS);
  sheet.getRange(row, 7, 1, 2).setNumberFormat(FORMATS.CURRENCY_NO_CENTS);

  row += 2;

  return row;
}

/**
 * Add conditional formatting for partner status
 */
function addPartnerStatusFormatting(sheet, startRow, column, numRows) {
  const range = sheet.getRange(startRow, column, numRows, 1);

  // Active - Green
  const activeRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Active")
    .setBackground("#d4edda")
    .setFontColor("#155724")
    .setRanges([range])
    .build();

  // Inactive - Gray
  const inactiveRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Inactive")
    .setBackground("#e2e3e5")
    .setFontColor("#383d41")
    .setRanges([range])
    .build();

  // Pending - Yellow
  const pendingRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Pending")
    .setBackground("#fff3cd")
    .setFontColor("#856404")
    .setRanges([range])
    .build();

  // Exited - Red
  const exitedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Exited")
    .setBackground("#f8d7da")
    .setFontColor("#721c24")
    .setRanges([range])
    .build();

  const rules = sheet.getConditionalFormatRules();
  rules.push(activeRule, inactiveRule, pendingRule, exitedRule);
  sheet.setConditionalFormatRules(rules);
}

/**
 * Add conditional formatting for contribution status
 */
function addContributionStatusFormatting(sheet, startRow, column, numRows) {
  const range = sheet.getRange(startRow, column, numRows, 1);

  // Verified - Green
  const verifiedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Verified")
    .setBackground("#d4edda")
    .setFontColor("#155724")
    .setRanges([range])
    .build();

  // Cleared - Light Green
  const clearedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Cleared")
    .setBackground("#d1f2eb")
    .setFontColor("#0c5460")
    .setRanges([range])
    .build();

  // Pending - Yellow
  const pendingRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Pending")
    .setBackground("#fff3cd")
    .setFontColor("#856404")
    .setRanges([range])
    .build();

  // Rejected - Red
  const rejectedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Rejected")
    .setBackground("#f8d7da")
    .setFontColor("#721c24")
    .setRanges([range])
    .build();

  const rules = sheet.getConditionalFormatRules();
  rules.push(verifiedRule, clearedRule, pendingRule, rejectedRule);
  sheet.setConditionalFormatRules(rules);
}

/**
 * Calculate IRR for a specific partner from manual cash flow entries
 * @param {Sheet} sheet - Partnership Management sheet
 * @param {number} partnerIndex - Partner index (0-4)
 * @returns {number|null} - IRR as decimal or null
 */
function calculatePartnerIRRFromSheet(sheet, partnerIndex) {
  try {
    // Calculate row positions based on layout
    // Performance Dashboard starts after all previous sections
    const partnerStructureStartRow = 6;
    const partnerTableRows = 5;
    const capitalTrackerRows = 10;
    const profitAllocationRows = 5;
    const waterfallRows = 10;
    const distributionHistoryRows = 20;
    const milestoneRows = 10;
    const performanceDashboardHeaderRows = 5;

    // Cash flow entry section starts after Performance Dashboard
    // Each partner has: 1 header row + 1 instruction row + 1 partner name row + 1 header row + 5 cash flow rows + 1 IRR note row = 10 rows per partner
    const cashFlowSectionStart = partnerStructureStartRow +
                                  10 + // Partnership Structure section
                                  capitalTrackerRows + 5 + // Capital Tracker section
                                  profitAllocationRows + 5 + // Profit Allocation section
                                  waterfallRows + 10 + // Waterfall Calculator section
                                  distributionHistoryRows + 10 + // Distribution History section
                                  milestoneRows + 5 + // Milestone Tracker section
                                  performanceDashboardHeaderRows + 10 + // Performance Dashboard section
                                  3; // IRR Cash Flow Entry header

    const rowsPerPartner = 10;
    const partnerCashFlowStart = cashFlowSectionStart + (partnerIndex * rowsPerPartner) + 2; // +2 for partner header and column headers

    // Read cash flows from column C (Cash Flow column)
    const cashFlowRange = sheet.getRange(partnerCashFlowStart, 3, 5, 1);
    const cashFlowValues = cashFlowRange.getValues();

    // Build cash flow array, filtering out empty values
    const cashFlows = [];
    for (let i = 0; i < cashFlowValues.length; i++) {
      const value = cashFlowValues[i][0];
      if (value !== "" && value !== null && !isNaN(value) && value !== 0) {
        cashFlows.push(parseFloat(value));
      }
    }

    // Need at least 2 cash flows for IRR
    if (cashFlows.length < 2) {
      Logger.log(`⚠️ Partner ${partnerIndex + 1}: Insufficient cash flows (${cashFlows.length})`);
      return null;
    }

    Logger.log(`📊 Partner ${partnerIndex + 1}: Calculating IRR with ${cashFlows.length} cash flows: ${cashFlows}`);

    // Call existing IRR function from advancedMetrics.js
    const irr = calculateIRR(cashFlows);

    if (irr !== null) {
      Logger.log(`✅ Partner ${partnerIndex + 1}: IRR = ${(irr * 100).toFixed(2)}%`);
    } else {
      Logger.log(`⚠️ Partner ${partnerIndex + 1}: IRR calculation failed`);
    }

    return irr;
  } catch (e) {
    Logger.log(`❌ Error calculating IRR for partner ${partnerIndex + 1}: ${e}`);
    return null;
  }
}

/**
 * Update all partner IRR values in Performance Dashboard
 * Called from menu: REI Tools → Partnership Management → Calculate Partnership IRR
 */
function updatePartnershipIRR() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Partnership Management");

  if (!sheet) {
    SpreadsheetApp.getUi().alert("❌ Partnership Management tab not found.\n\nPlease generate the Partnership Management tab first using:\nREI Tools → Partnership Management → Generate Partnership Tab");
    return;
  }

  Logger.log("📊 Starting Partnership IRR calculation...");

  // Calculate row position for Performance Dashboard
  const partnerStructureStartRow = 6;
  const partnerTableRows = 5;
  const capitalTrackerRows = 10;
  const profitAllocationRows = 5;
  const waterfallRows = 10;
  const distributionHistoryRows = 20;
  const milestoneRows = 10;

  // Performance Dashboard starts after all previous sections
  const performanceStartRow = partnerStructureStartRow +
                              10 + // Partnership Structure section
                              capitalTrackerRows + 5 + // Capital Tracker section
                              profitAllocationRows + 5 + // Profit Allocation section
                              waterfallRows + 10 + // Waterfall Calculator section
                              distributionHistoryRows + 10 + // Distribution History section
                              milestoneRows + 5 + // Milestone Tracker section
                              5; // Performance Dashboard header rows

  // Calculate and update IRR for all 5 partners
  let successCount = 0;
  let insufficientDataCount = 0;
  let errorCount = 0;

  for (let i = 0; i < 5; i++) {
    const irr = calculatePartnerIRRFromSheet(sheet, i);
    const irrCell = sheet.getRange(performanceStartRow + i, 9); // Column I (IRR column)

    if (irr !== null && !isNaN(irr)) {
      irrCell.setValue(irr);
      irrCell.setNumberFormat("0.00%");
      irrCell.setFontStyle("normal");
      irrCell.setFontColor("#000000");
      irrCell.setFontWeight("normal");
      successCount++;
    } else if (irr === null) {
      irrCell.setValue("N/A");
      irrCell.setFontStyle("italic");
      irrCell.setFontColor("#999999");
      irrCell.setFontWeight("normal");
      insufficientDataCount++;
    } else {
      irrCell.setValue("Error");
      irrCell.setFontStyle("italic");
      irrCell.setFontColor("#cc0000");
      irrCell.setFontWeight("normal");
      errorCount++;
    }
  }

  Logger.log(`✅ IRR calculation complete: ${successCount} success, ${insufficientDataCount} insufficient data, ${errorCount} errors`);

  // User feedback
  let message = "✅ IRR Calculation Complete!\n\n";
  message += `Successfully calculated: ${successCount} partner(s)\n`;
  message += `Insufficient data: ${insufficientDataCount} partner(s)\n`;
  if (errorCount > 0) {
    message += `Errors: ${errorCount} partner(s)\n`;
  }
  message += "\n💡 Note: At least 2 cash flows required per partner.\n";
  message += "Enter negative values for investments and positive values for distributions.";

  SpreadsheetApp.getUi().alert(message);
}

/**
 * Clear Partnership Management tab only
 * Removes all content, formatting, charts, borders, and background colors
 */
function clearPartnershipManagement() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Partnership Management");

  if (!sheet) {
    SpreadsheetApp.getUi().alert("⚠️ Partnership Management tab not found.\n\nPlease generate the Partnership Management tab first.");
    return;
  }

  // Remove all charts
  const charts = sheet.getCharts();
  charts.forEach(chart => {
    sheet.removeChart(chart);
  });

  // Clear all content and formatting
  sheet.clear();

  // Get the entire data range and clear all formatting
  const maxRows = sheet.getMaxRows();
  const maxCols = sheet.getMaxColumns();
  const fullRange = sheet.getRange(1, 1, maxRows, maxCols);

  // Clear all formatting
  fullRange.clearFormat();
  fullRange.clearNote();
  fullRange.clearDataValidations();

  // Remove all borders
  fullRange.setBorder(false, false, false, false, false, false);

  // Reset background to white
  fullRange.setBackground('#ffffff');

  // Reset font to default
  fullRange.setFontColor('#000000');
  fullRange.setFontFamily('Arial');
  fullRange.setFontSize(10);
  fullRange.setFontWeight('normal');
  fullRange.setFontStyle('normal');

  // Reset alignment
  fullRange.setHorizontalAlignment('left');
  fullRange.setVerticalAlignment('bottom');

  // Remove any conditional formatting rules
  sheet.setConditionalFormatRules([]);

  // Reset column widths to default (100 pixels)
  for (let i = 1; i <= Math.min(maxCols, 20); i++) {
    sheet.setColumnWidth(i, 100);
  }

  // Reset row heights to default (21 pixels)
  for (let i = 1; i <= Math.min(maxRows, 100); i++) {
    sheet.setRowHeight(i, 21);
  }

  // Unfreeze rows and columns
  sheet.setFrozenRows(0);
  sheet.setFrozenColumns(0);

  Logger.log("✅ Partnership Management tab cleared");

  SpreadsheetApp.getUi().alert("🧹 Partnership Management tab cleared!\n\nAll content, formatting, charts, borders, and backgrounds have been removed.\n\nYou can regenerate the tab using:\nREI Tools → Advanced Tools → Partnership Management → Generate Partnership Tab");
}

/**
 * Delete Partnership Management tab (when switching to Simple Mode)
 */
function deletePartnershipManagement() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Partnership Management");

  if (sheet) {
    // Save data to properties before deleting (for potential restoration)
    savePartnershipManagementData(sheet);
    ss.deleteSheet(sheet);
    Logger.log("✅ Partnership Management tab deleted (Simple Mode)");
  }
}

/**
 * Save Partnership Management data to document properties
 */
function savePartnershipManagementData(sheet) {
  try {
    const data = sheet.getDataRange().getValues();
    const docProps = PropertiesService.getDocumentProperties();
    docProps.setProperty('partnershipManagementBackup', JSON.stringify(data));
    Logger.log("✅ Partnership Management data backed up");
  } catch (e) {
    Logger.log("⚠️ Could not backup Partnership Management data: " + e);
  }
}

/**
 * Restore Partnership Management data from document properties
 */
function restorePartnershipManagementData(sheet) {
  try {
    const docProps = PropertiesService.getDocumentProperties();
    const backup = docProps.getProperty('partnershipManagementBackup');

    if (backup) {
      const data = JSON.parse(backup);
      if (data && data.length > 0) {
        sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
        Logger.log("✅ Partnership Management data restored");
        return true;
      }
    }
  } catch (e) {
    Logger.log("⚠️ Could not restore Partnership Management data: " + e);
  }
  return false;
}

// ============================================================================
// EXPORTS - Make functions available globally
// ============================================================================

if (typeof global !== 'undefined') {
  global.generatePartnershipManagement = generatePartnershipManagement;
  global.generatePartnershipStructure = generatePartnershipStructure;
  global.generateCapitalTracker = generateCapitalTracker;
  global.generateProfitAllocation = generateProfitAllocation;
  global.generateWaterfallCalculator = generateWaterfallCalculator;
  global.generateDistributionHistory = generateDistributionHistory;
  global.generateMilestoneTracker = generateMilestoneTracker;
  global.generatePerformanceDashboard = generatePerformanceDashboard;
  global.calculatePartnerIRRFromSheet = calculatePartnerIRRFromSheet;
  global.updatePartnershipIRR = updatePartnershipIRR;
  global.clearPartnershipManagement = clearPartnershipManagement;
  global.deletePartnershipManagement = deletePartnershipManagement;
  global.savePartnershipManagementData = savePartnershipManagementData;
  global.restorePartnershipManagementData = restorePartnershipManagementData;
}

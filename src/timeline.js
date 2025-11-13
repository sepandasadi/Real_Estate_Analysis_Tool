/**
 * ===============================
 * TIMELINE & CASH FLOW UTILITIES
 * ===============================
 *
 * Phase 3.3: Flip Analysis Upgrades
 * Provides timeline-based cash flow tracking and holding cost breakdowns
 */

/**
 * Generate monthly cash flow timeline for flip projects
 * Shows month-by-month breakdown of holding costs
 *
 * @param {number} purchasePrice - Property purchase price
 * @param {number} downPaymentPct - Down payment percentage (0-1)
 * @param {number} interestRate - Annual interest rate (0-1)
 * @param {number} loanTerm - Loan term in years
 * @param {number} helocAmount - HELOC amount
 * @param {number} helocInterest - HELOC annual interest rate (0-1)
 * @param {number} monthsToFlip - Number of months for the flip
 * @param {number} propertyTaxRate - Annual property tax rate (0-1)
 * @param {number} insuranceMonthly - Monthly insurance cost
 * @param {number} utilitiesCost - Monthly utilities cost
 * @returns {Array} Array of monthly cash flow objects
 */
function generateMonthlyTimeline(purchasePrice, downPaymentPct, interestRate, loanTerm, helocAmount, helocInterest, monthsToFlip, propertyTaxRate, insuranceMonthly, utilitiesCost) {
  const timeline = [];

  // Calculate monthly costs
  const loanAmount = purchasePrice * (1 - downPaymentPct);
  const monthlyRate = interestRate / 12;
  const monthlyPI = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm * 12));
  const helocMonthlyInterest = (helocAmount * helocInterest) / 12;
  const propertyTaxMonthly = (purchasePrice * propertyTaxRate) / 12;

  let cumulativeCost = 0;

  for (let month = 1; month <= monthsToFlip; month++) {
    const monthCosts = {
      month: month,
      mortgagePayment: monthlyPI,
      helocInterest: helocMonthlyInterest,
      propertyTax: propertyTaxMonthly,
      insurance: insuranceMonthly,
      utilities: utilitiesCost,
      total: monthlyPI + helocMonthlyInterest + propertyTaxMonthly + insuranceMonthly + utilitiesCost
    };

    cumulativeCost += monthCosts.total;
    monthCosts.cumulative = cumulativeCost;

    timeline.push(monthCosts);
  }

  return timeline;
}

/**
 * Generate timeline-based cash flow chart in Flip Analysis sheet
 * Phase 3.3 Enhancement
 */
function generateFlipTimeline() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const flipSheet = ss.getSheetByName("Flip Analysis");

  if (!flipSheet) {
    Logger.log("❌ Flip Analysis sheet not found");
    return;
  }

  // Get input values
  const purchasePrice = getField("purchasePrice", 0);
  const downPaymentPct = getField("downPayment", 20) / 100;
  const interestRate = getField("loanInterestRate", 7) / 100;
  const loanTerm = getField("loanTerm", 30);
  const helocAmount = getField("helocAmount", 0);
  const helocInterest = getField("helocInterest", 0.07);
  const monthsToFlip = getField("monthsToFlip", 6);
  const propertyTaxRate = getField("propertyTaxRate", 0.0125);
  const insuranceMonthly = getField("insuranceMonthly", 100);
  const utilitiesCost = getField("utilitiesCost", 0);

  // Generate timeline data
  const timeline = generateMonthlyTimeline(
    purchasePrice,
    downPaymentPct,
    interestRate,
    loanTerm,
    helocAmount,
    helocInterest,
    monthsToFlip,
    propertyTaxRate,
    insuranceMonthly,
    utilitiesCost
  );

  // Find where to insert (after existing content)
  let row = flipSheet.getLastRow() + 3;

  // Add section header
  flipSheet.getRange(row, 1).setValue("Monthly Holding Cost Timeline")
    .setFontWeight("bold").setFontSize(12).setBackground("#e8f0fe");
  row += 2;

  // Add column headers
  const headers = ["Month", "Mortgage P&I", "HELOC Interest", "Property Tax", "Insurance", "Utilities", "Monthly Total", "Cumulative"];
  flipSheet.getRange(row, 1, 1, headers.length).setValues([headers])
    .setFontWeight("bold").setBackground("#d9e2f3")
    .setBorder(true, true, true, true, true, true);
  row++;

  // Add timeline data
  timeline.forEach((monthData) => {
    const rowData = [
      monthData.month,
      monthData.mortgagePayment,
      monthData.helocInterest,
      monthData.propertyTax,
      monthData.insurance,
      monthData.utilities,
      monthData.total,
      monthData.cumulative
    ];

    flipSheet.getRange(row, 1, 1, rowData.length).setValues([rowData]);

    // Format currency columns
    flipSheet.getRange(row, 2, 1, 7).setNumberFormat('"$"#,##0');

    row++;
  });

  // Add totals row
  const totalRow = [
    "TOTAL",
    `=SUM(B${row - timeline.length}:B${row - 1})`,
    `=SUM(C${row - timeline.length}:C${row - 1})`,
    `=SUM(D${row - timeline.length}:D${row - 1})`,
    `=SUM(E${row - timeline.length}:E${row - 1})`,
    `=SUM(F${row - timeline.length}:F${row - 1})`,
    `=SUM(G${row - timeline.length}:G${row - 1})`,
    ""
  ];

  flipSheet.getRange(row, 1, 1, totalRow.length).setValues([totalRow])
    .setFontWeight("bold").setBackground("#f2f2f2");
  flipSheet.getRange(row, 2, 1, 6).setNumberFormat('"$"#,##0');

  Logger.log("✅ Monthly timeline generated");
}

/**
 * Generate profit split calculator for partners/investors
 * Phase 3.3 Enhancement
 *
 * @param {number} netProfit - Total net profit from flip
 * @param {Array} partners - Array of partner objects with {name, investmentPct, profitSplitPct}
 * @returns {Array} Array of partner profit distributions
 */
function calculateProfitSplit(netProfit, partners) {
  const distributions = [];

  partners.forEach(partner => {
    const distribution = {
      name: partner.name,
      investmentPct: partner.investmentPct,
      profitSplitPct: partner.profitSplitPct,
      profitAmount: netProfit * (partner.profitSplitPct / 100),
      roi: 0
    };

    // Calculate ROI based on their investment
    if (partner.investmentAmount && partner.investmentAmount > 0) {
      distribution.roi = (distribution.profitAmount / partner.investmentAmount) * 100;
    }

    distributions.push(distribution);
  });

  return distributions;
}

/**
 * Generate profit split section in Flip Analysis
 * Allows users to define partner splits
 */
function generateProfitSplitAnalysis() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const flipSheet = ss.getSheetByName("Flip Analysis");

  if (!flipSheet) {
    Logger.log("❌ Flip Analysis sheet not found");
    return;
  }

  // Get net profit from flip analysis by searching for the label
  let netProfit = 0;
  try {
    const data = flipSheet.getDataRange().getValues();
    for (let i = 0; i < data.length; i++) {
      const label = data[i][0] ? data[i][0].toString().trim() : "";
      if (label.includes("Net Profit") && label.includes("$")) {
        const value = data[i][1];
        if (value !== null && value !== undefined && value !== "") {
          netProfit = parseFloat(value) || 0;
          Logger.log("Found Net Profit: " + netProfit);
          break;
        }
      }
    }

    if (netProfit === 0) {
      Logger.log("⚠️ Warning: Net Profit not found in Flip Analysis sheet, using 0");
    }
  } catch (error) {
    Logger.log("⚠️ Error finding net profit: " + error.message);
    netProfit = 0;
  }

  // Find where to insert
  let row = flipSheet.getLastRow() + 3;

  // Add section header
  flipSheet.getRange(row, 1).setValue("Partner Profit Split Calculator")
    .setFontWeight("bold").setFontSize(12).setBackground("#e8f0fe");
  row += 2;

  // Add instructions
  flipSheet.getRange(row, 1).setValue("Enter partner details below:")
    .setFontStyle("italic").setFontColor("#666666");
  row += 2;

  // Add column headers
  const headers = ["Partner Name", "Investment %", "Profit Split %", "Profit Amount", "ROI %"];
  flipSheet.getRange(row, 1, 1, headers.length).setValues([headers])
    .setFontWeight("bold").setBackground("#d9e2f3")
    .setBorder(true, true, true, true, true, true);
  row++;

  // Get the actual net profit value from the sheet
  const netProfitValue = netProfit || 0;

  // Calculate total cash required for ROI calculation
  const purchasePrice = getField("purchasePrice", 0);
  const downPaymentPct = getField("downPayment", 20) / 100;
  const rehabCost = getField("rehabCost", 0);
  const cashInvestment = getField("cashInvestment", 0);
  const totalInvestment = (purchasePrice * downPaymentPct) + rehabCost + cashInvestment;

  // Add example partners (user can modify)
  const partner1Investment = totalInvestment * 0.50;
  const partner2Investment = totalInvestment * 0.50;
  const partner1Profit = netProfitValue * 0.50;
  const partner2Profit = netProfitValue * 0.50;
  const partner1ROI = partner1Investment > 0 ? (partner1Profit / partner1Investment) : 0;
  const partner2ROI = partner2Investment > 0 ? (partner2Profit / partner2Investment) : 0;

  const examplePartners = [
    ["Partner 1", 0.50, 0.50, partner1Profit, partner1ROI],
    ["Partner 2", 0.50, 0.50, partner2Profit, partner2ROI]
  ];

  examplePartners.forEach((partner, index) => {
    flipSheet.getRange(row + index, 1, 1, partner.length).setValues([partner]);
    flipSheet.getRange(row + index, 2, 1, 2).setNumberFormat("0.00%");
    flipSheet.getRange(row + index, 4).setNumberFormat('"$"#,##0');
    flipSheet.getRange(row + index, 5).setNumberFormat("0.00%");
  });

  row += examplePartners.length + 2;

  // Add validation note
  flipSheet.getRange(row, 1, 1, 5).merge()
    .setValue("Note: Profit Split % should total 100%. Adjust percentages as needed for your partnership structure.")
    .setFontStyle("italic").setFontColor("#666666").setFontSize(9);

  Logger.log("✅ Profit split calculator generated");
}

/**
 * Generate renovation timeline tracker
 * Phase 3.3 Enhancement
 */
function generateRenovationTimeline() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const flipSheet = ss.getSheetByName("Flip Analysis");

  if (!flipSheet) {
    Logger.log("❌ Flip Analysis sheet not found");
    return;
  }

  const monthsToFlip = getField("monthsToFlip", 6);

  // Find where to insert
  let row = flipSheet.getLastRow() + 3;

  // Add section header
  flipSheet.getRange(row, 1).setValue("Renovation Timeline Tracker")
    .setFontWeight("bold").setFontSize(12).setBackground("#e8f0fe");
  row += 2;

  // Add instructions
  flipSheet.getRange(row, 1, 1, 6).merge()
    .setValue("Track your renovation phases below. Enter estimated duration for each phase.")
    .setFontStyle("italic").setFontColor("#666666");
  row += 2;

  // Add column headers
  const headers = ["Phase", "Duration (weeks)", "Start Week", "End Week", "Status", "Notes"];
  flipSheet.getRange(row, 1, 1, headers.length).setValues([headers])
    .setFontWeight("bold").setBackground("#d9e2f3")
    .setBorder(true, true, true, true, true, true);
  row++;

  // Add common renovation phases
  const phases = [
    ["Demo & Cleanup", 1, 1, "=B" + row + "+C" + row, "Not Started", ""],
    ["Framing & Structural", 2, "=D" + (row), "=B" + (row + 1) + "+C" + (row + 1), "Not Started", ""],
    ["Plumbing & Electrical", 2, "=D" + (row + 1), "=B" + (row + 2) + "+C" + (row + 2), "Not Started", ""],
    ["HVAC", 1, "=D" + (row + 2), "=B" + (row + 3) + "+C" + (row + 3), "Not Started", ""],
    ["Drywall & Insulation", 2, "=D" + (row + 3), "=B" + (row + 4) + "+C" + (row + 4), "Not Started", ""],
    ["Flooring", 1, "=D" + (row + 4), "=B" + (row + 5) + "+C" + (row + 5), "Not Started", ""],
    ["Kitchen & Bath", 2, "=D" + (row + 5), "=B" + (row + 6) + "+C" + (row + 6), "Not Started", ""],
    ["Paint & Finish", 1, "=D" + (row + 6), "=B" + (row + 7) + "+C" + (row + 7), "Not Started", ""],
    ["Landscaping & Exterior", 1, "=D" + (row + 7), "=B" + (row + 8) + "+C" + (row + 8), "Not Started", ""],
    ["Final Cleanup & Staging", 1, "=D" + (row + 8), "=B" + (row + 9) + "+C" + (row + 9), "Not Started", ""]
  ];

  const phaseStartRow = row;
  phases.forEach((phase, index) => {
    flipSheet.getRange(row + index, 1, 1, phase.length).setValues([phase]);
  });

  // Apply number formatting to Duration, Start Week, and End Week columns
  flipSheet.getRange(phaseStartRow, 2, phases.length, 1).setNumberFormat("0"); // Duration (weeks)
  flipSheet.getRange(phaseStartRow, 3, phases.length, 1).setNumberFormat("0"); // Start Week
  flipSheet.getRange(phaseStartRow, 4, phases.length, 1).setNumberFormat("0"); // End Week

  row += phases.length + 2;

  // Add total duration
  flipSheet.getRange(row, 1).setValue("Total Duration (weeks):");
  flipSheet.getRange(row, 2).setFormula(`=SUM(B${row - phases.length}:B${row - 1})`);
  flipSheet.getRange(row, 1, 1, 2).setFontWeight("bold").setBackground("#f2f2f2");

  row++;

  // Add comparison to target
  const targetWeeks = monthsToFlip * 4.33; // Average weeks per month
  flipSheet.getRange(row, 1).setValue("Target Duration (weeks):");
  flipSheet.getRange(row, 2).setValue(Math.round(targetWeeks));
  flipSheet.getRange(row, 1, 1, 2).setFontWeight("bold");

  row++;

  // Add variance
  flipSheet.getRange(row, 1).setValue("Variance:");
  flipSheet.getRange(row, 2).setFormula(`=B${row - 2}-B${row - 1}`);
  flipSheet.getRange(row, 1, 1, 2).setFontWeight("bold");

  // Add conditional formatting for variance
  const varianceCell = flipSheet.getRange(row, 2);
  varianceCell.setNumberFormat("0");

  row += 2;

  // Add status legend
  flipSheet.getRange(row, 1).setValue("Status Options: Not Started | In Progress | Complete | Delayed")
    .setFontStyle("italic").setFontColor("#666666").setFontSize(9);

  Logger.log("✅ Renovation timeline tracker generated");
}

/**
 * Generate all Phase 3.3 enhancements in Flip Analysis
 * Call this from the menu or after flip analysis is generated
 */
function generateFlipEnhancements() {
  try {
    generateFlipTimeline();
    generateProfitSplitAnalysis();
    generateRenovationTimeline();

    SpreadsheetApp.getUi().alert("✅ Flip analysis enhancements added!\n\n- Monthly holding cost timeline\n- Partner profit split calculator\n- Renovation timeline tracker");
  } catch (error) {
    Logger.log("❌ Error generating flip enhancements: " + error);
    SpreadsheetApp.getUi().alert("⚠️ Error generating enhancements: " + error.message);
  }
}

/**
 * ===============================
 * PROJECT TRACKER (ADVANCED MODE)
 * ===============================
 * Comprehensive project management dashboard
 * Only available in Advanced Mode
 */

/**
 * Generate comprehensive Project Tracker tab
 * Advanced Mode Only - includes budget tracking, permits, materials, etc.
 */
function generateProjectTracker() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Check if in Advanced Mode
  if (isSimpleMode()) {
    Logger.log("⚠️ Project Tracker only available in Advanced Mode");
    return;
  }

  // Create or get Project Tracker sheet
  let sheet = ss.getSheetByName("Project Tracker");
  if (!sheet) {
    sheet = ss.insertSheet("Project Tracker");
  } else {
    sheet.clear();
  }

  // Get input values
  const purchasePrice = getField("purchasePrice", 0);
  const rehabCost = getField("rehabCost", 0);
  const monthsToFlip = getField("monthsToFlip", 6);

  let row = 1;

  // === HEADER ===
  sheet.getRange(row, 1, 1, 14).merge()
    .setValue("🏗️ PROJECT TRACKER - Advanced Mode")
    .setFontWeight("bold")
    .setFontSize(16)
    .setBackground("#1a73e8")
    .setFontColor("white")
    .setHorizontalAlignment("center");
  row += 2;

  // === SECTION 1: ENHANCED RENOVATION TIMELINE ===
  sheet.getRange(row, 1, 1, 14).merge()
    .setValue("📋 Enhanced Renovation Timeline & Budget")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row += 2;

  // Column headers for timeline
  const timelineHeaders = [
    "Phase",
    "Est. Duration (weeks)",
    "Est. Cost",
    "Actual Start Date",
    "Actual End Date",
    "Actual Duration (weeks)",
    "Actual Cost",
    "Time Variance",
    "Cost Variance",
    "% Complete",
    "Assigned To",
    "Contact",
    "Status",
    "Notes"
  ];

  sheet.getRange(row, 1, 1, timelineHeaders.length).setValues([timelineHeaders])
    .setFontWeight("bold")
    .setBackground("#d9e2f3")
    .setHorizontalAlignment("center")
    .setWrap(true)
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  // Renovation phases with estimated costs
  const estimatedCostPerPhase = rehabCost / 10; // Distribute evenly as starting point
  const phases = [
    ["Demo & Cleanup", 1, estimatedCostPerPhase * 0.8],
    ["Framing & Structural", 2, estimatedCostPerPhase * 1.5],
    ["Plumbing & Electrical", 2, estimatedCostPerPhase * 1.3],
    ["HVAC", 1, estimatedCostPerPhase * 1.2],
    ["Drywall & Insulation", 2, estimatedCostPerPhase * 0.9],
    ["Flooring", 1, estimatedCostPerPhase * 1.1],
    ["Kitchen & Bath", 2, estimatedCostPerPhase * 1.4],
    ["Paint & Finish", 1, estimatedCostPerPhase * 0.7],
    ["Landscaping & Exterior", 1, estimatedCostPerPhase * 0.9],
    ["Final Cleanup & Staging", 1, estimatedCostPerPhase * 0.6]
  ];

  const timelineStartRow = row;
  phases.forEach((phase, index) => {
    const currentRow = row + index;
    const phaseData = [
      phase[0], // Phase name
      phase[1], // Est. Duration
      phase[2], // Est. Cost
      "", // Actual Start Date (user fills)
      "", // Actual End Date (user fills)
      `=IF(AND(D${currentRow}<>"",E${currentRow}<>""),E${currentRow}-D${currentRow},"")`, // Actual Duration
      "", // Actual Cost (user fills)
      `=IF(F${currentRow}<>"",F${currentRow}-B${currentRow},"")`, // Time Variance
      `=IF(G${currentRow}<>"",G${currentRow}-C${currentRow},"")`, // Cost Variance
      0, // % Complete (user updates)
      "", // Assigned To
      "", // Contact
      "Not Started", // Status
      "" // Notes
    ];

    sheet.getRange(currentRow, 1, 1, phaseData.length).setValues([phaseData]);
  });

  // Format timeline section
  sheet.getRange(timelineStartRow, 2, phases.length, 1).setNumberFormat("0"); // Duration
  sheet.getRange(timelineStartRow, 3, phases.length, 1).setNumberFormat('"$"#,##0'); // Est. Cost
  sheet.getRange(timelineStartRow, 4, phases.length, 2).setNumberFormat("mm/dd/yyyy"); // Dates
  sheet.getRange(timelineStartRow, 6, phases.length, 1).setNumberFormat("0"); // Actual Duration
  sheet.getRange(timelineStartRow, 7, phases.length, 1).setNumberFormat('"$"#,##0'); // Actual Cost
  sheet.getRange(timelineStartRow, 8, phases.length, 1).setNumberFormat("0"); // Time Variance
  sheet.getRange(timelineStartRow, 9, phases.length, 1).setNumberFormat('"$"#,##0'); // Cost Variance
  sheet.getRange(timelineStartRow, 10, phases.length, 1).setNumberFormat("0%"); // % Complete

  // Add data validation for Status column
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Not Started", "In Progress", "Complete", "Delayed", "On Hold"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(timelineStartRow, 13, phases.length, 1).setDataValidation(statusRule);

  // Add conditional formatting for Status
  addStatusConditionalFormatting(sheet, timelineStartRow, 13, phases.length);

  row += phases.length + 2;

  // Budget Summary
  sheet.getRange(row, 1, 1, 3).merge()
    .setValue("💰 Budget Summary")
    .setFontWeight("bold")
    .setFontSize(11)
    .setBackground("#fff9e6");
  row++;

  const budgetSummaryData = [
    ["Total Estimated Budget", `=SUM(C${timelineStartRow}:C${timelineStartRow + phases.length - 1})`, ""],
    ["Total Actual Spend", `=SUM(G${timelineStartRow}:G${timelineStartRow + phases.length - 1})`, ""],
    ["Remaining Budget", `=B${row}-B${row + 1}`, ""],
    ["Budget Variance ($)", `=B${row + 1}-B${row}`, ""],
    ["Budget Variance (%)", `=IF(B${row}>0,B${row + 3}/B${row},0)`, ""]
  ];

  sheet.getRange(row, 1, budgetSummaryData.length, 3).setValues(budgetSummaryData);
  sheet.getRange(row, 1, budgetSummaryData.length, 1).setFontWeight("bold");
  sheet.getRange(row, 2, budgetSummaryData.length, 1).setNumberFormat('"$"#,##0');
  sheet.getRange(row + 4, 2).setNumberFormat("0.00%"); // Variance %
  sheet.getRange(row, 1, budgetSummaryData.length, 3).setBackground("#f9f9f9");

  row += budgetSummaryData.length + 3;

  // === SECTION 2: INSPECTION & PERMIT TRACKER ===
  sheet.getRange(row, 1, 1, 8).merge()
    .setValue("📝 Inspection & Permit Tracker")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row += 2;

  const permitHeaders = [
    "Permit Type",
    "Required?",
    "Application Date",
    "Approval Date",
    "Status",
    "Inspector/Contact",
    "Phone/Email",
    "Notes"
  ];

  sheet.getRange(row, 1, 1, permitHeaders.length).setValues([permitHeaders])
    .setFontWeight("bold")
    .setBackground("#d9e2f3")
    .setHorizontalAlignment("center")
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  const permitTypes = [
    ["Building Permit", "Yes", "", "", "Not Applied", "", "", ""],
    ["Electrical Permit", "Yes", "", "", "Not Applied", "", "", ""],
    ["Plumbing Permit", "Yes", "", "", "Not Applied", "", "", ""],
    ["HVAC Permit", "Yes", "", "", "Not Applied", "", "", ""],
    ["Mechanical Permit", "No", "", "", "N/A", "", "", ""],
    ["Final Inspection", "Yes", "", "", "Not Scheduled", "", "", ""]
  ];

  const permitStartRow = row;
  permitTypes.forEach((permit, index) => {
    sheet.getRange(row + index, 1, 1, permit.length).setValues([permit]);
  });

  // Format permit section
  sheet.getRange(permitStartRow, 3, permitTypes.length, 2).setNumberFormat("mm/dd/yyyy"); // Dates

  // Add data validation for Required and Status
  const yesNoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Yes", "No"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(permitStartRow, 2, permitTypes.length, 1).setDataValidation(yesNoRule);

  const permitStatusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Not Applied", "Applied", "Approved", "Rejected", "Not Scheduled", "Scheduled", "Passed", "Failed", "N/A"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(permitStartRow, 5, permitTypes.length, 1).setDataValidation(permitStatusRule);

  row += permitTypes.length + 3;

  // === SECTION 3: MATERIAL & VENDOR TRACKING ===
  sheet.getRange(row, 1, 1, 9).merge()
    .setValue("🛠️ Material & Vendor Tracking")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row += 2;

  const materialHeaders = [
    "Item/Service",
    "Vendor",
    "Contact",
    "Order Date",
    "Delivery Date",
    "Cost",
    "Payment Status",
    "Payment Date",
    "Notes"
  ];

  sheet.getRange(row, 1, 1, materialHeaders.length).setValues([materialHeaders])
    .setFontWeight("bold")
    .setBackground("#d9e2f3")
    .setHorizontalAlignment("center")
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  // Add 10 blank rows for user to fill
  const materialStartRow = row;
  for (let i = 0; i < 10; i++) {
    sheet.getRange(row + i, 1, 1, 9).setValues([["", "", "", "", "", "", "Pending", "", ""]]);
  }

  // Format material section
  sheet.getRange(materialStartRow, 4, 10, 3).setNumberFormat("mm/dd/yyyy"); // Dates
  sheet.getRange(materialStartRow, 6, 10, 1).setNumberFormat('"$"#,##0'); // Cost

  // Add data validation for Payment Status
  const paymentStatusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Pending", "Deposit Paid", "Paid in Full", "Overdue", "N/A"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(materialStartRow, 7, 10, 1).setDataValidation(paymentStatusRule);

  row += 10 + 3;

  // === SECTION 4: CRITICAL MILESTONES & ALERTS ===
  sheet.getRange(row, 1, 1, 6).merge()
    .setValue("⚠️ Critical Milestones & Alerts")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row += 2;

  const milestoneHeaders = [
    "Milestone",
    "Target Date",
    "Actual Date",
    "Status",
    "Priority",
    "Notes"
  ];

  sheet.getRange(row, 1, 1, milestoneHeaders.length).setValues([milestoneHeaders])
    .setFontWeight("bold")
    .setBackground("#d9e2f3")
    .setHorizontalAlignment("center")
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  const milestones = [
    ["Project Start", "", "", "Pending", "High", ""],
    ["All Permits Approved", "", "", "Pending", "High", ""],
    ["Structural Work Complete", "", "", "Pending", "High", ""],
    ["Rough Inspections Passed", "", "", "Pending", "High", ""],
    ["Final Inspection Passed", "", "", "Pending", "High", ""],
    ["Project Complete", "", "", "Pending", "High", ""]
  ];

  const milestoneStartRow = row;
  milestones.forEach((milestone, index) => {
    sheet.getRange(row + index, 1, 1, milestone.length).setValues([milestone]);
  });

  // Format milestone section
  sheet.getRange(milestoneStartRow, 2, milestones.length, 2).setNumberFormat("mm/dd/yyyy"); // Dates

  // Add data validation
  const milestoneStatusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Pending", "In Progress", "Complete", "Delayed", "Blocked"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(milestoneStartRow, 4, milestones.length, 1).setDataValidation(milestoneStatusRule);

  const priorityRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["High", "Medium", "Low"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(milestoneStartRow, 5, milestones.length, 1).setDataValidation(priorityRule);

  // Add conditional formatting for Priority
  addPriorityConditionalFormatting(sheet, milestoneStartRow, 5, milestones.length);

  row += milestones.length + 3;

  // === SECTION 5: DELAYS & ISSUES TRACKER ===
  sheet.getRange(row, 1, 1, 8).merge()
    .setValue("⏰ Delays & Issues Tracker")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row += 2;

  const delayHeaders = [
    "Date Reported",
    "Issue/Delay Type",
    "Description",
    "Days Delayed",
    "Cost Impact",
    "Status",
    "Resolution Date",
    "Notes"
  ];

  sheet.getRange(row, 1, 1, delayHeaders.length).setValues([delayHeaders])
    .setFontWeight("bold")
    .setBackground("#d9e2f3")
    .setHorizontalAlignment("center")
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  // Add 5 blank rows for delays
  const delayStartRow = row;
  for (let i = 0; i < 5; i++) {
    sheet.getRange(row + i, 1, 1, 8).setValues([["", "", "", "", "", "Open", "", ""]]);
  }

  // Format delays section
  sheet.getRange(delayStartRow, 1, 5, 1).setNumberFormat("mm/dd/yyyy"); // Date Reported
  sheet.getRange(delayStartRow, 4, 5, 1).setNumberFormat("0"); // Days Delayed
  sheet.getRange(delayStartRow, 5, 5, 1).setNumberFormat('"$"#,##0'); // Cost Impact
  sheet.getRange(delayStartRow, 7, 5, 1).setNumberFormat("mm/dd/yyyy"); // Resolution Date

  // Add data validation for Issue Type and Status
  const issueTypeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Weather", "Materials Delay", "Contractor Issue", "Permit Delay", "Inspection Failed", "Scope Change", "Other"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(delayStartRow, 2, 5, 1).setDataValidation(issueTypeRule);

  const delayStatusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Open", "In Progress", "Resolved", "Escalated"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(delayStartRow, 6, 5, 1).setDataValidation(delayStatusRule);

  row += 5 + 3;

  // === SECTION 6: CONTRACTOR PERFORMANCE TRACKER ===
  sheet.getRange(row, 1, 1, 8).merge()
    .setValue("⭐ Contractor Performance Tracker")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row += 2;

  const contractorHeaders = [
    "Contractor Name",
    "Trade/Specialty",
    "Contact",
    "On-Time Rating (1-5)",
    "Quality Rating (1-5)",
    "Budget Adherence (1-5)",
    "Overall Rating",
    "Notes"
  ];

  sheet.getRange(row, 1, 1, contractorHeaders.length).setValues([contractorHeaders])
    .setFontWeight("bold")
    .setBackground("#d9e2f3")
    .setHorizontalAlignment("center")
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  // Add 5 blank rows for contractors
  const contractorStartRow = row;
  for (let i = 0; i < 5; i++) {
    const currentRow = row + i;
    sheet.getRange(currentRow, 1, 1, 8).setValues([["", "", "", "", "", "", `=IF(AND(D${currentRow}<>"",E${currentRow}<>"",F${currentRow}<>""),(D${currentRow}+E${currentRow}+F${currentRow})/3,"")`, ""]]);
  }

  // Format contractor section
  sheet.getRange(contractorStartRow, 4, 5, 4).setNumberFormat("0.0"); // Ratings

  // Add data validation for ratings
  const ratingRule = SpreadsheetApp.newDataValidation()
    .requireNumberBetween(1, 5)
    .setAllowInvalid(false)
    .setHelpText("Enter a rating from 1 (poor) to 5 (excellent)")
    .build();
  sheet.getRange(contractorStartRow, 4, 5, 3).setDataValidation(ratingRule);

  // Add conditional formatting for ratings
  addRatingConditionalFormatting(sheet, contractorStartRow, 7, 5);

  row += 5 + 3;

  // === SECTION 7: CHANGE ORDERS TRACKER ===
  sheet.getRange(row, 1, 1, 9).merge()
    .setValue("📝 Change Orders Tracker")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row += 2;

  const changeOrderHeaders = [
    "CO #",
    "Date",
    "Description",
    "Reason",
    "Cost Impact",
    "Time Impact (days)",
    "Approval Status",
    "Approved By",
    "Notes"
  ];

  sheet.getRange(row, 1, 1, changeOrderHeaders.length).setValues([changeOrderHeaders])
    .setFontWeight("bold")
    .setBackground("#d9e2f3")
    .setHorizontalAlignment("center")
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  // Add 5 blank rows for change orders
  const changeOrderStartRow = row;
  for (let i = 0; i < 5; i++) {
    sheet.getRange(row + i, 1, 1, 9).setValues([[i + 1, "", "", "", "", "", "Pending", "", ""]]);
  }

  // Format change orders section
  sheet.getRange(changeOrderStartRow, 2, 5, 1).setNumberFormat("mm/dd/yyyy"); // Date
  sheet.getRange(changeOrderStartRow, 5, 5, 1).setNumberFormat('"$"#,##0'); // Cost Impact
  sheet.getRange(changeOrderStartRow, 6, 5, 1).setNumberFormat("0"); // Time Impact

  // Add data validation for Approval Status
  const approvalStatusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Pending", "Approved", "Rejected", "Under Review"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(changeOrderStartRow, 7, 5, 1).setDataValidation(approvalStatusRule);

  row += 5 + 3;

  // === SECTION 8: PROJECT SUMMARY & ALERTS ===
  sheet.getRange(row, 1, 1, 6).merge()
    .setValue("📊 Project Summary & Alerts")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row += 2;

  // Calculate summary metrics
  const summaryData = [
    ["Overall Project Progress", `=AVERAGE(J${timelineStartRow}:J${timelineStartRow + phases.length - 1})`, ""],
    ["Total Delays (Days)", `=SUM(D${delayStartRow}:D${delayStartRow + 4})`, ""],
    ["Total Change Order Cost", `=SUM(E${changeOrderStartRow}:E${changeOrderStartRow + 4})`, ""],
    ["Average Contractor Rating", `=AVERAGE(G${contractorStartRow}:G${contractorStartRow + 4})`, ""],
    ["", "", ""],
    ["⚠️ ALERTS", "", ""],
    ["Budget Status", `=IF(B${timelineStartRow + phases.length + 3}>B${timelineStartRow + phases.length + 2},"⚠️ OVER BUDGET","✅ On Budget")`, ""],
    ["Schedule Status", `=IF(B${timelineStartRow + phases.length + 1}>B${timelineStartRow + phases.length},"⚠️ BEHIND SCHEDULE","✅ On Schedule")`, ""],
    ["Open Issues", `=COUNTIF(F${delayStartRow}:F${delayStartRow + 4},"Open")`, ""],
    ["Pending Change Orders", `=COUNTIF(G${changeOrderStartRow}:G${changeOrderStartRow + 4},"Pending")`, ""]
  ];

  const summaryStartRow = row;
  sheet.getRange(row, 1, summaryData.length, 3).setValues(summaryData);
  sheet.getRange(row, 1, summaryData.length, 1).setFontWeight("bold");
  sheet.getRange(row, 2, summaryData.length, 1).setHorizontalAlignment("right");

  // Format summary section
  sheet.getRange(summaryStartRow, 2).setNumberFormat("0.0%"); // Progress
  sheet.getRange(summaryStartRow + 1, 2).setNumberFormat("0"); // Days
  sheet.getRange(summaryStartRow + 2, 2).setNumberFormat('"$"#,##0'); // Cost
  sheet.getRange(summaryStartRow + 3, 2).setNumberFormat("0.0"); // Rating

  // Highlight alerts section
  sheet.getRange(summaryStartRow + 5, 1, 5, 3).setBackground("#fff9e6");
  sheet.getRange(summaryStartRow + 5, 1).setFontWeight("bold").setFontSize(11);

  row += summaryData.length + 3;

  // === INSTRUCTIONS ===
  sheet.getRange(row, 1, 1, 14).merge()
    .setValue("💡 Instructions: Update dates, costs, and status as your project progresses. Use dropdowns for consistent data entry. The Project Summary section automatically calculates key metrics and alerts.")
    .setFontStyle("italic")
    .setFontColor("#666666")
    .setFontSize(9)
    .setWrap(true);

  // Set column widths
  sheet.setColumnWidth(1, 180); // Phase/Item
  sheet.setColumnWidth(2, 100); // Duration/Required
  sheet.setColumnWidth(3, 100); // Cost/Date
  sheet.setColumnWidth(4, 100); // Date
  sheet.setColumnWidth(5, 100); // Date
  sheet.setColumnWidth(6, 100); // Duration/Cost
  sheet.setColumnWidth(7, 100); // Cost/Status
  sheet.setColumnWidth(8, 100); // Variance
  sheet.setColumnWidth(9, 100); // Variance
  sheet.setColumnWidth(10, 80); // % Complete
  sheet.setColumnWidth(11, 120); // Assigned To
  sheet.setColumnWidth(12, 120); // Contact
  sheet.setColumnWidth(13, 100); // Status
  sheet.setColumnWidth(14, 150); // Notes

  // Freeze header rows
  sheet.setFrozenRows(5);

  Logger.log("✅ Project Tracker generated successfully");
}

/**
 * Add conditional formatting for Status column
 */
function addStatusConditionalFormatting(sheet, startRow, column, numRows) {
  const range = sheet.getRange(startRow, column, numRows, 1);

  // Complete - Green
  const completeRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Complete")
    .setBackground("#d4edda")
    .setFontColor("#155724")
    .setRanges([range])
    .build();

  // In Progress - Yellow
  const inProgressRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("In Progress")
    .setBackground("#fff3cd")
    .setFontColor("#856404")
    .setRanges([range])
    .build();

  // Delayed - Red
  const delayedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Delayed")
    .setBackground("#f8d7da")
    .setFontColor("#721c24")
    .setRanges([range])
    .build();

  // Not Started - Gray
  const notStartedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Not Started")
    .setBackground("#e2e3e5")
    .setFontColor("#383d41")
    .setRanges([range])
    .build();

  const rules = sheet.getConditionalFormatRules();
  rules.push(completeRule, inProgressRule, delayedRule, notStartedRule);
  sheet.setConditionalFormatRules(rules);
}

/**
 * Add conditional formatting for Priority column
 */
function addPriorityConditionalFormatting(sheet, startRow, column, numRows) {
  const range = sheet.getRange(startRow, column, numRows, 1);

  // High - Red
  const highRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("High")
    .setBackground("#f8d7da")
    .setFontColor("#721c24")
    .setRanges([range])
    .build();

  // Medium - Yellow
  const mediumRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Medium")
    .setBackground("#fff3cd")
    .setFontColor("#856404")
    .setRanges([range])
    .build();

  // Low - Green
  const lowRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Low")
    .setBackground("#d4edda")
    .setFontColor("#155724")
    .setRanges([range])
    .build();

  const rules = sheet.getConditionalFormatRules();
  rules.push(highRule, mediumRule, lowRule);
  sheet.setConditionalFormatRules(rules);
}

/**
 * Add conditional formatting for Rating column (1-5 scale)
 */
function addRatingConditionalFormatting(sheet, startRow, column, numRows) {
  const range = sheet.getRange(startRow, column, numRows, 1);

  // Excellent (4.5-5.0) - Green
  const excellentRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThanOrEqualTo(4.5)
    .setBackground("#d4edda")
    .setFontColor("#155724")
    .setRanges([range])
    .build();

  // Good (3.5-4.4) - Light Green
  const goodRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberBetween(3.5, 4.4)
    .setBackground("#d1f2eb")
    .setFontColor("#0c5460")
    .setRanges([range])
    .build();

  // Average (2.5-3.4) - Yellow
  const averageRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberBetween(2.5, 3.4)
    .setBackground("#fff3cd")
    .setFontColor("#856404")
    .setRanges([range])
    .build();

  // Below Average (1.5-2.4) - Orange
  const belowAverageRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberBetween(1.5, 2.4)
    .setBackground("#ffe5cc")
    .setFontColor("#cc5200")
    .setRanges([range])
    .build();

  // Poor (1.0-1.4) - Red
  const poorRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberLessThanOrEqualTo(1.4)
    .setBackground("#f8d7da")
    .setFontColor("#721c24")
    .setRanges([range])
    .build();

  const rules = sheet.getConditionalFormatRules();
  rules.push(excellentRule, goodRule, averageRule, belowAverageRule, poorRule);
  sheet.setConditionalFormatRules(rules);
}

/**
 * Delete Project Tracker tab (when switching to Simple Mode)
 */
function deleteProjectTracker() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Project Tracker");

  if (sheet) {
    // Save data to properties before deleting (for potential restoration)
    saveProjectTrackerData(sheet);
    ss.deleteSheet(sheet);
    Logger.log("✅ Project Tracker tab deleted (Simple Mode)");
  }
}

/**
 * Save Project Tracker data to document properties
 */
function saveProjectTrackerData(sheet) {
  try {
    const data = sheet.getDataRange().getValues();
    const docProps = PropertiesService.getDocumentProperties();
    docProps.setProperty('projectTrackerBackup', JSON.stringify(data));
    Logger.log("✅ Project Tracker data backed up");
  } catch (e) {
    Logger.log("⚠️ Could not backup Project Tracker data: " + e);
  }
}

/**
 * Restore Project Tracker data from document properties
 */
function restoreProjectTrackerData(sheet) {
  try {
    const docProps = PropertiesService.getDocumentProperties();
    const backup = docProps.getProperty('projectTrackerBackup');

    if (backup) {
      const data = JSON.parse(backup);
      if (data && data.length > 0) {
        sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
        Logger.log("✅ Project Tracker data restored");
        return true;
      }
    }
  } catch (e) {
    Logger.log("⚠️ Could not restore Project Tracker data: " + e);
  }
  return false;
}

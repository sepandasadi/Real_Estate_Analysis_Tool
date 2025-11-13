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

  phases.forEach((phase, index) => {
    flipSheet.getRange(row + index, 1, 1, phase.length).setValues([phase]);
  });

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

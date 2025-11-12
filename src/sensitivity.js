/**
 * Wrapper function to generate sensitivity analysis from Inputs sheet data
 */
function generateFlipSensitivityFromInputs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const flipSheet = ss.getSheetByName("Flip Analysis");

  if (!flipSheet) {
    Logger.log("❌ Flip Analysis sheet not found for sensitivity analysis");
    return;
  }

  // Get values using dynamic field mapping
  const purchasePrice = getField("purchasePrice", 0);
  const downPaymentPct = getField("downPayment", 20) / 100;
  const interestRate = getField("loanInterestRate", 7) / 100;
  const loanTerm = getField("loanTerm", 30);
  const rehabCost = getField("rehabCost", 0);
  const monthsToFlip = getField("monthsToFlip", 6);
  const contingency = rehabCost * 0.1;
  const totalRehab = rehabCost + contingency;

  // Calculate loan and holding costs
  const downPayment = purchasePrice * downPaymentPct;
  const loanAmount = purchasePrice - downPayment;
  const monthlyRate = interestRate / 12;
  const monthlyPI = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm * 12));
  const holdingCost = monthlyPI * monthsToFlip;

  // Get ARV from Flip Analysis sheet (or calculate default)
  const arv = flipSheet.getRange("B28").getValue() || purchasePrice * 1.1;

  // Calculate costs
  const closingCosts = purchasePrice * 0.02;
  const sellCommission = arv * 0.05;
  const sellClosing = arv * 0.01;
  const totalSellCosts = sellCommission + sellClosing;

  // Call the main sensitivity function
  generateFlipSensitivity(arv, totalRehab, purchasePrice, closingCosts, holdingCost, totalSellCosts);
}

/**
 * Generate Flip Sensitivity (ARV vs Rehab) Matrix in dedicated tab.
 */
function generateFlipSensitivity(arv, totalRehab, purchasePrice, closingCosts, holdingCost, totalSellCosts) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Flip Sensitivity (ARV vs Rehab)");
  if (!sheet) return Logger.log("❌ Sensitivity tab not found.");

  sheet.clearContents();

  // Title
  sheet.getRange("A1").setValue("Flip Sensitivity (ARV vs Rehab)").setFontWeight("bold").setFontSize(14);
  sheet.getRange("A1").setBackground("#e8f0fe");
  sheet.getRange("A2").setValue("Generated: " + new Date().toLocaleString());

  let row = 4;

  // Labeling
  sheet.getRange(row, 1).setValue("ARV ↓ / Rehab →").setFontWeight("bold");
  sheet.getRange(row, 2, 1, 5)
    .setValues([["-10%", "-5%", "Base", "+5%", "+10%"]])
    .setFontWeight("bold")
    .setBackground("#d9e2f3")
    .setBorder(true, true, true, true, true, true);
  row++;

  // 5×5 matrix values
  const arvChanges = [-0.1, -0.05, 0, 0.05, 0.1];
  const rehabChanges = [-0.1, -0.05, 0, 0.05, 0.1];

  arvChanges.forEach((a, i) => {
    let label;
    if (a === 0) label = "Base";
    else if (a < 0) label = `${(a * 100).toFixed(0)}%`; // e.g. -10%
    else label = `+${(a * 100).toFixed(0)}%`;            // e.g. +10%

    sheet.getRange(row + i, 1)
      .setValue(label)
      .setFontWeight("bold")
      .setBackground("#f7f9fc");

    rehabChanges.forEach((r, j) => {
      const adjustedARV = arv * (1 + a);
      const adjustedRehab = totalRehab * (1 + r);
      const profit = adjustedARV - (purchasePrice + adjustedRehab + closingCosts + holdingCost + totalSellCosts);
      sheet.getRange(row + i, j + 2).setValue(Math.round(profit));
    });

    // Format row
    sheet.getRange(row + i, 1, 1, 6).setBorder(true, true, true, true, false, false);
  });

  row += arvChanges.length + 2;

  sheet.getRange(row, 1).setValue("💡 Higher ARV and lower rehab = better profit margin.")
    .setFontStyle("italic").setFontColor("#666");
  sheet.autoResizeColumns(1, 6);

  // --- Format profit grid as currency ---
  const currencyNoDecimal = '"$"#,##0';
  const lastRow = sheet.getLastRow();
  sheet.getRange("B5:F" + lastRow).setNumberFormat(currencyNoDecimal);

  const startColumn = 2; // Column B
  const numberOfColumns = 5; // Columns B, C, D
  const widthInPixels = 150;
  sheet.setColumnWidths(startColumn, numberOfColumns, widthInPixels);


  Logger.log("✅ Flip Sensitivity Matrix generated successfully.");
}

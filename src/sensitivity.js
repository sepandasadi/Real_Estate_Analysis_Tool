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
  const helocAmount = getField("helocAmount", 0);
  const helocInterest = getField("helocInterest", 0.07);
  const propertyTaxRate = getField("propertyTaxRate", 0.0125);
  const insuranceMonthly = getField("insuranceMonthly", 100);
  const utilitiesCost = getField("utilitiesCost", 0);

  const contingency = rehabCost * 0.1;
  const totalRehab = rehabCost + contingency;

  // Calculate loan and holding costs
  const downPayment = purchasePrice * downPaymentPct;
  const loanAmount = purchasePrice - downPayment;
  const monthlyRate = interestRate / 12;
  const monthlyPI = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm * 12));

  // Calculate full holding costs (mortgage + HELOC + taxes + insurance + utilities)
  const monthlyPropertyTax = (purchasePrice * propertyTaxRate) / 12;
  const monthlyHoldingCosts = monthlyPI + (helocAmount * helocInterest / 12) + monthlyPropertyTax + insuranceMonthly + utilitiesCost;
  const holdingCost = monthlyHoldingCosts * monthsToFlip;

  // Try to get ARV from Flip Analysis sheet by searching for the label
  let arv = purchasePrice * 1.1; // Default fallback
  try {
    const data = flipSheet.getDataRange().getValues();
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().includes("After Repair Value (ARV)")) {
        arv = parseFloat(data[i][1]) || purchasePrice * 1.1;
        Logger.log(`✅ Found ARV in Flip Analysis: ${arv}`);
        break;
      }
    }
  } catch (e) {
    Logger.log("⚠️ Could not read ARV from Flip Analysis, using default: " + e);
  }

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

  // Title and timestamp - using standardized header formatting with merged cells
  const titleRange = sheet.getRange("A1:F1");
  titleRange.merge();
  titleRange.setValue("Flip Sensitivity (ARV vs Rehab)");
  styleHeader(titleRange, 'h1');
  titleRange.setBackground("#1a73e8");
  titleRange.setFontColor("white");

  const timestampRange = sheet.getRange("A2:F2");
  timestampRange.merge();
  timestampRange.setValue("Generated: " + new Date().toLocaleString())
    .setFontSize(9)
    .setFontColor("#666666");

  let row = 4;

  // Labeling
  sheet.getRange(row, 1).setValue("ARV ↓ / Rehab →")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe");
  sheet.getRange(row, 2, 1, 5)
    .setValues([["-10%", "-5%", "Base", "+5%", "+10%"]])
    .setFontWeight("bold")
    .setBackground("#d9e2f3")
    .setHorizontalAlignment("center")
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
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

  sheet.getRange(row, 1, 1, 6).merge()
    .setValue("💡 Higher ARV and lower rehab = better profit margin.")
    .setFontStyle("italic")
    .setFontColor("#666666")
    .setFontSize(9);

  // --- Format profit grid as currency ---
  const currencyNoDecimal = '"$"#,##0';
  const lastRow = sheet.getLastRow();
  sheet.getRange("B5:F" + lastRow).setNumberFormat(currencyNoDecimal);

  // Set column widths
  sheet.setColumnWidth(1, 150);  // ARV column
  sheet.setColumnWidth(2, 120);  // -10%
  sheet.setColumnWidth(3, 120);  // -5%
  sheet.setColumnWidth(4, 120);  // Base
  sheet.setColumnWidth(5, 120);  // +5%
  sheet.setColumnWidth(6, 120);  // +10%

  Logger.log("✅ Flip Sensitivity Matrix generated successfully.");
}

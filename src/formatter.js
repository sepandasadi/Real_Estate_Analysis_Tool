/**
 * Apply proper number formats to key Inputs tab cells
 */
function formatInputsTab() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Inputs");
  if (!sheet) return;

  const currencyNoDecimal = '"$"#,##0';

  // Format Purchase Price (B8)
  sheet.getRange("B8").setNumberFormat(currencyNoDecimal);
  sheet.getRange("B11").setNumberFormat('"$"#,##0');  // Cash
  sheet.getRange("B12").setNumberFormat('"$"#,##0'); // HELOC Amount
  sheet.getRange("B13").setNumberFormat("0.00%");    // HELOC Interest


  // Format Rehab Cost (B13)
  sheet.getRange("B16").setNumberFormat(currencyNoDecimal);
}

/**
 * Applies standardized formatting and color coding
 */
function formatAllTabs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tabs = ["Inputs", "Flip Analysis", "Rental Analysis", "Flip Sensitivity"];

  tabs.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) return;
    const range = sheet.getDataRange();

    range.setFontFamily("Arial");
    range.setFontSize(10);
    range.setHorizontalAlignment("center");
    range.setVerticalAlignment("middle");
    range.setWrap(true);

    // Example color-coding:
    // Blue = Required Inputs, Orange = Optional Inputs, Black = Calculations, Green = Linked Outputs
    sheet.getRange("A1:Z1").setBackground("#1a73e8").setFontColor("white"); // header
  });

  formatInputsTab();

  SpreadsheetApp.getUi().alert("✅ Formatting applied to all tabs.");
}

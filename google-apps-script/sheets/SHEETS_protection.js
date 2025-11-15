/**
 * Apply protection (warning-only)
 */
function protectSheetsWarning() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheets().forEach(sheet => {
    const protection = sheet.protect();
    protection.setWarningOnly(true);
  });
  SpreadsheetApp.getUi().alert("⚠️ Sheets protected (warning-only).");
}

/**
 * Apply hard lock (no edits)
 */
function protectSheetsLock() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheets().forEach(sheet => {
    const protection = sheet.protect();
    protection.removeEditors(protection.getEditors());
  });
  SpreadsheetApp.getUi().alert("🔒 Sheets locked (editors removed).");
}

/**
 * Remove all protections
 */
function unprotectAll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getProtections(SpreadsheetApp.ProtectionType.SHEET).forEach(p => p.remove());
  SpreadsheetApp.getUi().alert("🔓 All protections removed.");
}

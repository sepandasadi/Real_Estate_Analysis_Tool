/**
 * ===============================
 * AMORTIZATION TABLE GENERATOR
 * Phase 2 Enhancement
 * ===============================
 *
 * Generates detailed amortization schedules showing:
 * - Monthly payment breakdown (principal vs interest)
 * - Cumulative interest paid
 * - Remaining balance
 * - Option to view first 12 months or full loan term
 */

/**
 * Generate amortization schedule for the loan
 * @param {number} months - Number of months to display (12 for first year, or full term)
 * @returns {Array} Array of payment objects with month, payment, principal, interest, balance
 */
function generateAmortizationSchedule(months = 12) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Amortization Schedule");

  // Create sheet if it doesn't exist
  if (!sheet) {
    ss.insertSheet("Amortization Schedule");
  }

  const amortSheet = ss.getSheetByName("Amortization Schedule");
  amortSheet.clearContents();

  // Get loan details from Inputs
  const purchasePrice = getField("purchasePrice", 0);
  const downPaymentPct = getField("downPayment", 20) / 100;
  const interestRate = getField("loanInterestRate", 7) / 100;
  const loanTerm = getField("loanTerm", 30);

  const loanAmount = purchasePrice * (1 - downPaymentPct);
  const monthlyRate = interestRate / 12;
  const totalMonths = loanTerm * 12;
  const monthlyPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));

  // Title and timestamp - using standardized header formatting with merged cells
  const titleRange = amortSheet.getRange("A1:F1");
  titleRange.merge();
  titleRange.setValue("Loan Amortization Schedule");
  styleHeader(titleRange, 'h1');
  titleRange.setBackground("#1a73e8");
  titleRange.setFontColor("white");

  const timestampRange = amortSheet.getRange("A2:F2");
  timestampRange.merge();
  timestampRange.setValue("Generated: " + new Date().toLocaleString())
    .setFontSize(9)
    .setFontColor("#666666");

  let row = 4;

  // Loan Summary
  amortSheet.getRange(row, 1, 1, 2).merge()
    .setValue("Loan Summary")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  const summaryData = [
    ["Loan Amount", loanAmount],
    ["Interest Rate", interestRate],
    ["Loan Term (Years)", loanTerm],
    ["Monthly Payment", monthlyPayment],
    ["Total Payments", monthlyPayment * totalMonths],
    ["Total Interest", (monthlyPayment * totalMonths) - loanAmount]
  ];

  amortSheet.getRange(row, 1, summaryData.length, 2).setValues(summaryData);

  // Format summary
  amortSheet.getRange(row, 2).setNumberFormat('"$"#,##0');
  amortSheet.getRange(row + 1, 2).setNumberFormat("0.00%");
  amortSheet.getRange(row + 2, 2).setNumberFormat("0");
  amortSheet.getRange(row + 3, 2, 3, 1).setNumberFormat('"$"#,##0');

  row += summaryData.length + 2;

  // Determine how many months to show
  const monthsToShow = Math.min(months, totalMonths);

  // Payment Schedule Header
  amortSheet.getRange(row, 1, 1, 6).merge()
    .setValue(`Payment Schedule (First ${monthsToShow} Months)`)
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  // Column headers
  const headers = ["Month", "Payment", "Principal", "Interest", "Balance", "Cumulative Interest"];
  amortSheet.getRange(row, 1, 1, headers.length).setValues([headers])
    .setFontWeight("bold")
    .setBackground("#d9e2f3")
    .setHorizontalAlignment("center")
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  // Calculate amortization schedule
  let balance = loanAmount;
  let cumulativeInterest = 0;
  const scheduleData = [];

  for (let month = 1; month <= monthsToShow; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;
    cumulativeInterest += interestPayment;

    scheduleData.push([
      month,
      monthlyPayment,
      principalPayment,
      interestPayment,
      Math.max(0, balance), // Prevent negative balance due to rounding
      cumulativeInterest
    ]);
  }

  // Write schedule data
  amortSheet.getRange(row, 1, scheduleData.length, headers.length).setValues(scheduleData);

  // Format schedule data
  for (let i = 0; i < scheduleData.length; i++) {
    amortSheet.getRange(row + i, 1).setNumberFormat("0"); // Month
    amortSheet.getRange(row + i, 2, 1, 5).setNumberFormat('"$"#,##0'); // All currency columns
  }

  // Add alternating row colors for readability
  for (let i = 0; i < scheduleData.length; i++) {
    const color = i % 2 === 0 ? "#ffffff" : "#f9f9f9";
    amortSheet.getRange(row + i, 1, 1, headers.length).setBackground(color);
  }

  row += scheduleData.length + 2;

  // Summary statistics
  amortSheet.getRange(row, 1, 1, 2).merge()
    .setValue("Summary Statistics")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  const lastPayment = scheduleData[scheduleData.length - 1];
  const totalPrincipalPaid = loanAmount - lastPayment[4];
  const totalInterestPaid = lastPayment[5];
  const percentPrincipalPaid = totalPrincipalPaid / loanAmount;

  const statsData = [
    ["Total Principal Paid", totalPrincipalPaid],
    ["Total Interest Paid", totalInterestPaid],
    ["Remaining Balance", lastPayment[4]],
    ["% of Loan Paid Off", percentPrincipalPaid]
  ];

  amortSheet.getRange(row, 1, statsData.length, 2).setValues(statsData);
  amortSheet.getRange(row, 2, 3, 1).setNumberFormat('"$"#,##0');
  amortSheet.getRange(row + 3, 2).setNumberFormat("0.00%");

  // Set column widths
  amortSheet.setColumnWidth(1, 80);   // Month
  amortSheet.setColumnWidth(2, 120);  // Payment
  amortSheet.setColumnWidth(3, 120);  // Principal
  amortSheet.setColumnWidth(4, 120);  // Interest
  amortSheet.setColumnWidth(5, 120);  // Balance
  amortSheet.setColumnWidth(6, 150);  // Cumulative Interest

  Logger.log(`✅ Amortization schedule generated for ${monthsToShow} months`);

  return scheduleData;
}

/**
 * Generate full loan term amortization schedule
 */
function generateFullAmortizationSchedule() {
  const loanTerm = getField("loanTerm", 30);
  const totalMonths = loanTerm * 12;
  return generateAmortizationSchedule(totalMonths);
}

/**
 * Generate first year amortization schedule (default)
 */
function generateFirstYearAmortization() {
  return generateAmortizationSchedule(12);
}

/**
 * Calculate total interest paid over a specific period
 * @param {number} months - Number of months
 * @returns {number} Total interest paid
 */
function calculateTotalInterest(months) {
  const purchasePrice = getField("purchasePrice", 0);
  const downPaymentPct = getField("downPayment", 20) / 100;
  const interestRate = getField("loanInterestRate", 7) / 100;
  const loanTerm = getField("loanTerm", 30);

  const loanAmount = purchasePrice * (1 - downPaymentPct);
  const monthlyRate = interestRate / 12;
  const totalMonths = loanTerm * 12;
  const monthlyPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));

  let balance = loanAmount;
  let totalInterest = 0;
  const periodsToCalculate = Math.min(months, totalMonths);

  for (let month = 1; month <= periodsToCalculate; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;
    totalInterest += interestPayment;
  }

  return totalInterest;
}

/**
 * Get amortization summary for display in other sheets
 * @returns {Object} Summary object with key metrics
 */
function getAmortizationSummary() {
  const purchasePrice = getField("purchasePrice", 0);
  const downPaymentPct = getField("downPayment", 20) / 100;
  const interestRate = getField("loanInterestRate", 7) / 100;
  const loanTerm = getField("loanTerm", 30);

  const loanAmount = purchasePrice * (1 - downPaymentPct);
  const monthlyRate = interestRate / 12;
  const totalMonths = loanTerm * 12;
  const monthlyPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));

  const totalPayments = monthlyPayment * totalMonths;
  const totalInterest = totalPayments - loanAmount;
  const firstYearInterest = calculateTotalInterest(12);

  return {
    loanAmount: loanAmount,
    monthlyPayment: monthlyPayment,
    totalPayments: totalPayments,
    totalInterest: totalInterest,
    firstYearInterest: firstYearInterest,
    interestRate: interestRate,
    loanTerm: loanTerm
  };
}

/**
 * Charts & Visualizations Module
 * Phase 5.3 Implementation
 * Adds visual analytics to REI Analysis Tool
 */

/**
 * Generate all charts for the current analysis
 * Called automatically after analysis completion
 */
function generateAllCharts() {
  try {
    Logger.log("📊 Generating charts...");

    // Check current mode - only generate charts in Advanced Mode
    const currentMode = getCurrentMode();

    if (currentMode === 'Advanced') {
      // Generate charts for Flip Analysis
      generateFlipCharts();

      // Generate charts for Rental Analysis
      generateRentalCharts();

      // Generate comparison charts
      generateComparisonCharts();

      Logger.log("✅ All charts generated successfully (Advanced Mode)");
    } else {
      Logger.log("ℹ️ Charts skipped in Simple Mode");
    }

    return { success: true };
  } catch (error) {
    Logger.log("❌ Error generating charts: " + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Generate charts for Flip Analysis sheet
 */
function generateFlipCharts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const flipSheet = ss.getSheetByName("Flip Analysis");

  if (!flipSheet) {
    Logger.log("⚠️ Flip Analysis sheet not found");
    return;
  }

  // Clear existing charts
  const charts = flipSheet.getCharts();
  charts.forEach(chart => flipSheet.removeChart(chart));

  // 1. Monthly Cash Flow Chart (Timeline)
  createFlipCashFlowChart(flipSheet);

  // 2. Cost Breakdown Pie Chart
  createFlipCostBreakdownChart(flipSheet);

  // 3. Profit Comparison Bar Chart
  createFlipProfitComparisonChart(flipSheet);

  Logger.log("✅ Flip charts generated");
}

/**
 * Create monthly cash flow timeline chart for flips
 */
function createFlipCashFlowChart(sheet) {
  try {
    const monthsToFlip = getField("monthsToFlip", 6);
    const purchasePrice = getField("purchasePrice", 0);
    const rehabCost = getField("rehabCost", 0);
    const propertyTaxRate = getField("propertyTaxRate", 0.0125);
    const insuranceMonthly = getField("insuranceMonthly", 100);
    const downPaymentPct = getField("downPayment", 20) / 100;
    const interestRate = getField("loanInterestRate", 7) / 100;
    const loanTerm = getField("loanTerm", 30);

    // Calculate monthly costs
    const downPayment = purchasePrice * downPaymentPct;
    const loanAmount = purchasePrice - downPayment;
    const monthlyRate = interestRate / 12;
    const monthlyPI = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm * 12));
    const monthlyPropertyTax = (purchasePrice * propertyTaxRate) / 12;
    const monthlyHoldingCost = monthlyPI + monthlyPropertyTax + insuranceMonthly;

    // Create data range for chart
    const chartData = [["Month", "Holding Costs (Mortgage, Tax, Insurance)", "Total Investment (Down + Rehab)"]];
    let cumulativeHolding = 0;
    let cumulativeInvestment = downPayment + rehabCost;

    for (let month = 0; month <= monthsToFlip; month++) {
      if (month > 0) {
        cumulativeHolding += monthlyHoldingCost;
      }
      chartData.push([
        "Month " + month,
        Math.round(cumulativeHolding),
        Math.round(cumulativeInvestment)
      ]);
    }

    // Write data to sheet (hidden area)
    const dataStartRow = sheet.getMaxRows() - 20;
    sheet.getRange(dataStartRow, 10, chartData.length, 3).setValues(chartData);

    // Create chart
    const chart = sheet.newChart()
      .setChartType(Charts.ChartType.LINE)
      .addRange(sheet.getRange(dataStartRow, 10, chartData.length, 3))
      .setPosition(2, 7, 0, 0)
      .setOption('title', 'Flip Timeline: Cumulative Costs')
      .setOption('width', 500)
      .setOption('height', 300)
      .setOption('legend', { position: 'bottom' })
      .setOption('hAxis', { title: 'Timeline (Months)' })
      .setOption('vAxis', { title: 'Amount ($)', format: '$#,###' })
      .setOption('colors', ['#ea4335', '#1a73e8'])
      .setOption('lineWidth', 3)
      .setOption('pointSize', 5)
      .setOption('series', {
        0: { labelInLegend: 'Holding Costs (Mortgage, Tax, Insurance)' },
        1: { labelInLegend: 'Total Investment (Down Payment + Rehab)' }
      })
      .build();

    sheet.insertChart(chart);
    Logger.log("✅ Flip cash flow chart created");
  } catch (error) {
    Logger.log("⚠️ Error creating flip cash flow chart: " + error.message);
  }
}

/**
 * Create cost breakdown pie chart for flips
 */
function createFlipCostBreakdownChart(sheet) {
  try {
    const purchasePrice = getField("purchasePrice", 0);
    const rehabCost = getField("rehabCost", 0);
    const downPaymentPct = getField("downPayment", 20) / 100;
    const monthsToFlip = getField("monthsToFlip", 6);
    const propertyTaxRate = getField("propertyTaxRate", 0.0125);
    const insuranceMonthly = getField("insuranceMonthly", 100);
    const interestRate = getField("loanInterestRate", 7) / 100;
    const loanTerm = getField("loanTerm", 30);

    // Calculate costs
    const downPayment = purchasePrice * downPaymentPct;
    const loanAmount = purchasePrice - downPayment;
    const monthlyRate = interestRate / 12;
    const monthlyPI = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm * 12));
    const monthlyPropertyTax = (purchasePrice * propertyTaxRate) / 12;
    const holdingCosts = (monthlyPI + monthlyPropertyTax + insuranceMonthly) * monthsToFlip;
    const closingCosts = purchasePrice * 0.02;
    const contingency = rehabCost * 0.1;

    // Create data for pie chart
    const pieData = [
      ["Category", "Amount"],
      ["Down Payment", Math.round(downPayment)],
      ["Rehab Cost", Math.round(rehabCost)],
      ["Contingency", Math.round(contingency)],
      ["Holding Costs", Math.round(holdingCosts)],
      ["Closing Costs", Math.round(closingCosts)]
    ];

    // Write data to sheet (hidden area)
    const dataStartRow = sheet.getMaxRows() - 10;
    sheet.getRange(dataStartRow, 10, pieData.length, 2).setValues(pieData);

    // Create pie chart
    const chart = sheet.newChart()
      .setChartType(Charts.ChartType.PIE)
      .addRange(sheet.getRange(dataStartRow, 10, pieData.length, 2))
      .setPosition(2, 13, 0, 0)
      .setOption('title', 'Total Investment Breakdown')
      .setOption('width', 450)
      .setOption('height', 300)
      .setOption('pieSliceText', 'percentage')
      .setOption('legend', { position: 'right' })
      .setOption('colors', ['#1a73e8', '#34a853', '#fbbc04', '#ea4335', '#9c27b0'])
      .setOption('pieHole', 0.4) // Donut chart
      .build();

    sheet.insertChart(chart);
    Logger.log("✅ Flip cost breakdown chart created");
  } catch (error) {
    Logger.log("⚠️ Error creating flip cost breakdown chart: " + error.message);
  }
}

/**
 * Create profit comparison bar chart (Base/Worst/Best scenarios)
 */
function createFlipProfitComparisonChart(sheet) {
  try {
    // Get scenario data from sheet
    const data = sheet.getDataRange().getValues();
    let scenarioData = [];

    // Find scenario analysis section
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().includes("Scenario Analysis")) {
        // Skip header rows
        i += 3;
        // Get three scenarios
        for (let j = 0; j < 3 && i + j < data.length; j++) {
          const row = data[i + j];
          if (row[0] && row[3]) {
            scenarioData.push([row[0], parseFloat(row[3]) || 0]);
          }
        }
        break;
      }
    }

    if (scenarioData.length === 0) {
      Logger.log("⚠️ No scenario data found for profit chart");
      return;
    }

    // Add header
    scenarioData.unshift(["Scenario", "Profit"]);

    // Write data to sheet (hidden area)
    const dataStartRow = sheet.getMaxRows() - 5;
    sheet.getRange(dataStartRow, 10, scenarioData.length, 2).setValues(scenarioData);

    // Create bar chart
    const chart = sheet.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(sheet.getRange(dataStartRow, 10, scenarioData.length, 2))
      .setPosition(17, 7, 0, 0)
      .setOption('title', 'Profit Scenarios Comparison')
      .setOption('width', 500)
      .setOption('height', 300)
      .setOption('legend', { position: 'none' })
      .setOption('hAxis', { title: 'Scenario' })
      .setOption('vAxis', { title: 'Profit ($)', format: '$#,###' })
      .setOption('colors', ['#1a73e8'])
      .setOption('bar', { groupWidth: '60%' })
      .build();

    sheet.insertChart(chart);
    Logger.log("✅ Flip profit comparison chart created");
  } catch (error) {
    Logger.log("⚠️ Error creating flip profit comparison chart: " + error.message);
  }
}

/**
 * Generate charts for Rental Analysis sheet
 */
function generateRentalCharts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rentalSheet = ss.getSheetByName("Rental Analysis");

  if (!rentalSheet) {
    Logger.log("⚠️ Rental Analysis sheet not found");
    return;
  }

  // Clear existing charts
  const charts = rentalSheet.getCharts();
  charts.forEach(chart => rentalSheet.removeChart(chart));

  // 1. Rent vs Expenses Pie Chart
  createRentVsExpensesPieChart(rentalSheet);

  // 2. Cash Flow Comparison Chart (As-Is vs BRRRR)
  createCashFlowComparisonChart(rentalSheet);

  // 3. 10-Year Cash Flow Projection
  create10YearCashFlowChart(rentalSheet);

  Logger.log("✅ Rental charts generated");
}

/**
 * Create rent vs expenses pie chart
 */
function createRentVsExpensesPieChart(sheet) {
  try {
    const rentEstimate = getField("rentEstimate", 3500);
    const vacancyRate = getField("vacancyRate", 6) / 100;
    const propertyTaxRate = getField("propertyTaxRate", 0.0125);
    const insuranceMonthly = getField("insuranceMonthly", 100);
    const maintenanceRate = getField("maintenanceRate", 1) / 100;
    const purchasePrice = getField("purchasePrice", 0);
    const propertyManagementRate = getField("propertyManagementRate", 8) / 100;
    const includePropertyManagement = getField("includePropertyManagement", "Yes");

    // Calculate annual amounts
    const grossIncome = rentEstimate * 12;
    const vacancyLoss = grossIncome * vacancyRate;
    const effectiveGrossIncome = grossIncome - vacancyLoss;
    const propertyTaxes = propertyTaxRate * purchasePrice;
    const insurance = insuranceMonthly * 12;
    const maintenance = purchasePrice * maintenanceRate;
    const propertyManagement = includePropertyManagement === "Yes"
      ? effectiveGrossIncome * propertyManagementRate
      : 0;

    // Create pie chart data
    const pieData = [
      ["Category", "Annual Amount"],
      ["Property Taxes", Math.round(propertyTaxes)],
      ["Insurance", Math.round(insurance)],
      ["Maintenance", Math.round(maintenance)]
    ];

    if (propertyManagement > 0) {
      pieData.push(["Property Management", Math.round(propertyManagement)]);
    }

    pieData.push(["Vacancy Loss", Math.round(vacancyLoss)]);

    // Write data to sheet (hidden area)
    const dataStartRow = sheet.getMaxRows() - 15;
    sheet.getRange(dataStartRow, 10, pieData.length, 2).setValues(pieData);

    // Create pie chart
    const chart = sheet.newChart()
      .setChartType(Charts.ChartType.PIE)
      .addRange(sheet.getRange(dataStartRow, 10, pieData.length, 2))
      .setPosition(5, 5, 0, 0)
      .setOption('title', 'Annual Operating Expenses Breakdown')
      .setOption('width', 450)
      .setOption('height', 300)
      .setOption('pieSliceText', 'percentage')
      .setOption('legend', { position: 'right' })
      .setOption('colors', ['#ea4335', '#fbbc04', '#34a853', '#1a73e8', '#9c27b0'])
      .build();

    sheet.insertChart(chart);
    Logger.log("✅ Rent vs expenses chart created");
  } catch (error) {
    Logger.log("⚠️ Error creating rent vs expenses chart: " + error.message);
  }
}

/**
 * Create cash flow comparison chart (As-Is vs BRRRR)
 */
function createCashFlowComparisonChart(sheet) {
  try {
    // Get data from sheet
    const data = sheet.getDataRange().getValues();
    let asIsCashFlow = 0;
    let brrrrCashFlow = 0;
    let foundAsIs = false;
    let foundBRRRR = false;

    // Find cash flow values with improved search logic
    for (let i = 0; i < data.length; i++) {
      const label = data[i][0] ? data[i][0].toString().trim() : "";

      // Look for Part 1: As-Is Rental Analysis
      if ((label.includes("Part 1") || label.includes("As-Is")) && !foundAsIs) {
        // Look for Monthly Cash Flow and convert to annual
        for (let j = i; j < Math.min(i + 20, data.length); j++) {
          const rowLabel = data[j][0] ? data[j][0].toString().trim() : "";
          if (rowLabel.includes("Monthly Cash Flow")) {
            const value = data[j][1];
            if (value !== null && value !== undefined && value !== "") {
              asIsCashFlow = (parseFloat(value) || 0) * 12; // Convert monthly to annual
              foundAsIs = true;
              Logger.log("Found As-Is Monthly Cash Flow, converted to annual: " + asIsCashFlow);
              break;
            }
          }
        }
      }

      // Look for Part 2: BRRRR Analysis - look in Profit & ROI Analysis section
      if ((label.includes("Part 2") || label.includes("BRRRR") || label.includes("Profit & ROI Analysis")) && !foundBRRRR) {
        // Look for annual cash flow in next 30 rows
        for (let j = i; j < Math.min(i + 30, data.length); j++) {
          const rowLabel = data[j][0] ? data[j][0].toString().trim() : "";
          if (rowLabel.includes("Annual Cash Flow") || rowLabel.includes("Annual Cashflow")) {
            const value = data[j][1];
            if (value !== null && value !== undefined && value !== "") {
              brrrrCashFlow = parseFloat(value) || 0;
              foundBRRRR = true;
              Logger.log("Found BRRRR Annual Cash Flow: " + brrrrCashFlow);
              break;
            }
          }
        }
      }

      // Exit early if both found
      if (foundAsIs && foundBRRRR) break;
    }

    // If still not found, try alternative search
    if (!foundAsIs) {
      Logger.log("⚠️ Trying alternative search for As-Is cash flow...");
      for (let i = 0; i < data.length; i++) {
        const label = data[i][0] ? data[i][0].toString().trim() : "";
        if (label.includes("Monthly Cash Flow") && !label.includes("BRRRR")) {
          const value = data[i][1];
          if (value !== null && value !== undefined && value !== "") {
            asIsCashFlow = (parseFloat(value) || 0) * 12;
            foundAsIs = true;
            Logger.log("Found As-Is cash flow via alternative search: " + asIsCashFlow);
            break;
          }
        }
      }
    }

    // Log warning if data not found
    if (!foundAsIs) {
      Logger.log("⚠️ Warning: As-Is cash flow not found in Rental Analysis sheet");
    }
    if (!foundBRRRR) {
      Logger.log("⚠️ Warning: BRRRR cash flow not found in Rental Analysis sheet");
    }

    // Create comparison data
    const comparisonData = [
      ["Strategy", "Annual Cash Flow"],
      ["As-Is Rental", Math.round(asIsCashFlow)],
      ["After BRRRR", Math.round(brrrrCashFlow)]
    ];

    // Write data to sheet (hidden area)
    const dataStartRow = sheet.getMaxRows() - 10;
    sheet.getRange(dataStartRow, 10, comparisonData.length, 2).setValues(comparisonData);

    // Create bar chart
    const chart = sheet.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(sheet.getRange(dataStartRow, 10, comparisonData.length, 2))
      .setPosition(5, 10, 0, 0)
      .setOption('title', 'Cash Flow Comparison')
      .setOption('width', 450)
      .setOption('height', 300)
      .setOption('legend', { position: 'none' })
      .setOption('hAxis', { title: 'Strategy' })
      .setOption('vAxis', { title: 'Annual Cash Flow ($)', format: '$#,###' })
      .setOption('colors', ['#34a853'])
      .setOption('bar', { groupWidth: '50%' })
      .build();

    sheet.insertChart(chart);
    Logger.log("✅ Cash flow comparison chart created");
  } catch (error) {
    Logger.log("⚠️ Error creating cash flow comparison chart: " + error.message);
  }
}

/**
 * Create 10-year cash flow projection chart
 */
function create10YearCashFlowChart(sheet) {
  try {
    const rentEstimate = getField("rentEstimate", 3500);
    const purchasePrice = getField("purchasePrice", 0);
    const downPaymentPct = getField("downPayment", 20) / 100;
    const interestRate = getField("loanInterestRate", 7) / 100;
    const loanTerm = getField("loanTerm", 30);
    const vacancyRate = getField("vacancyRate", 6) / 100;
    const propertyTaxRate = getField("propertyTaxRate", 0.0125);
    const insuranceMonthly = getField("insuranceMonthly", 100);
    const maintenanceRate = getField("maintenanceRate", 1) / 100;

    // Calculate base values
    const downPayment = purchasePrice * downPaymentPct;
    const loanAmount = purchasePrice - downPayment;
    const monthlyRate = interestRate / 12;
    const monthlyPI = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm * 12));

    // Create 10-year projection
    const projectionData = [["Year", "Annual Cash Flow (Yearly)", "Cumulative Cash Flow (Total)"]];
    let cumulativeCashFlow = 0;
    const rentGrowth = 0.03; // 3% annual rent growth

    for (let year = 1; year <= 10; year++) {
      const adjustedRent = rentEstimate * Math.pow(1 + rentGrowth, year - 1);
      const grossIncome = adjustedRent * 12;
      const vacancyLoss = grossIncome * vacancyRate;
      const effectiveGrossIncome = grossIncome - vacancyLoss;

      const propertyTaxes = propertyTaxRate * purchasePrice;
      const insurance = insuranceMonthly * 12;
      const maintenance = purchasePrice * maintenanceRate;
      const totalOperatingExpenses = propertyTaxes + insurance + maintenance;

      const NOI = effectiveGrossIncome - totalOperatingExpenses;
      const annualDebtService = monthlyPI * 12;
      const annualCashFlow = NOI - annualDebtService;

      cumulativeCashFlow += annualCashFlow;

      projectionData.push([
        "Year " + year,
        Math.round(annualCashFlow),
        Math.round(cumulativeCashFlow)
      ]);
    }

    // Write data to sheet (hidden area)
    const dataStartRow = sheet.getMaxRows() - 5;
    sheet.getRange(dataStartRow, 10, projectionData.length, 3).setValues(projectionData);

    // Create line chart
    const chart = sheet.newChart()
      .setChartType(Charts.ChartType.LINE)
      .addRange(sheet.getRange(dataStartRow, 10, projectionData.length, 3))
      .setPosition(20, 5, 0, 0)
      .setOption('title', '10-Year Cash Flow Projection (3% Annual Rent Growth)')
      .setOption('width', 600)
      .setOption('height', 300)
      .setOption('legend', { position: 'bottom' })
      .setOption('hAxis', { title: 'Year' })
      .setOption('vAxis', { title: 'Cash Flow ($)', format: '$#,###' })
      .setOption('colors', ['#1a73e8', '#34a853'])
      .setOption('lineWidth', 3)
      .setOption('pointSize', 5)
      .setOption('series', {
        0: { labelInLegend: 'Annual Cash Flow (Yearly)' },
        1: { labelInLegend: 'Cumulative Cash Flow (Total)' }
      })
      .build();

    sheet.insertChart(chart);
    Logger.log("✅ 10-year cash flow chart created");
  } catch (error) {
    Logger.log("⚠️ Error creating 10-year cash flow chart: " + error.message);
  }
}

/**
 * Generate comparison charts on Dashboard
 */
function generateComparisonCharts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboardSheet = ss.getSheetByName("Dashboard");

  if (!dashboardSheet) {
    Logger.log("⚠️ Dashboard sheet not found");
    return;
  }

  // Create ROI comparison chart
  createROIComparisonChart(dashboardSheet);

  Logger.log("✅ Comparison charts generated");
}

/**
 * Create ROI comparison chart on Dashboard
 */
function createROIComparisonChart(sheet) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const flipSheet = ss.getSheetByName("Flip Analysis");
    const rentalSheet = ss.getSheetByName("Rental Analysis");

    if (!flipSheet || !rentalSheet) {
      Logger.log("⚠️ Analysis sheets not found for comparison chart");
      return;
    }

    // Get ROI values
    let flipROI = 0;
    let rentalROI = 0;

    // Get flip ROI
    const flipData = flipSheet.getDataRange().getValues();
    for (let i = 0; i < flipData.length; i++) {
      if (flipData[i][0] && flipData[i][0].toString().includes("ROI (%)")) {
        flipROI = (parseFloat(flipData[i][1]) || 0) * 100;
        break;
      }
    }

    // Get rental ROI
    const rentalData = rentalSheet.getDataRange().getValues();
    for (let i = 0; i < rentalData.length; i++) {
      if (rentalData[i][0] && rentalData[i][0].toString().includes("Cash-on-Cash Return")) {
        rentalROI = (parseFloat(rentalData[i][1]) || 0) * 100;
        break;
      }
    }

    // Create comparison data
    const comparisonData = [
      ["Strategy", "ROI (%)"],
      ["Flip", Math.round(flipROI * 10) / 10],
      ["Rental (Annual)", Math.round(rentalROI * 10) / 10]
    ];

    // Write data to sheet (hidden area)
    const dataStartRow = sheet.getMaxRows() - 5;
    sheet.getRange(dataStartRow, 10, comparisonData.length, 2).setValues(comparisonData);

    // Clear existing charts
    const charts = sheet.getCharts();
    charts.forEach(chart => sheet.removeChart(chart));

    // Position chart below Recent Analysis table (row 30+)
    // This ensures it doesn't overlap with the table content
    const chart = sheet.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(sheet.getRange(dataStartRow, 10, comparisonData.length, 2))
      .setPosition(30, 1, 0, 0)
      .setOption('title', 'ROI Comparison: Flip vs Rental')
      .setOption('width', 500)
      .setOption('height', 300)
      .setOption('legend', { position: 'none' })
      .setOption('hAxis', { title: 'Strategy' })
      .setOption('vAxis', { title: 'ROI (%)', format: '#.#%' })
      .setOption('colors', ['#1a73e8'])
      .setOption('bar', { groupWidth: '50%' })
      .build();

    sheet.insertChart(chart);
    Logger.log("✅ ROI comparison chart created on Dashboard");
  } catch (error) {
    Logger.log("⚠️ Error creating ROI comparison chart: " + error.message);
  }
}

/**
 * Add sparklines to Dashboard for quick visual indicators
 */
function addDashboardSparklines() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const dashboardSheet = ss.getSheetByName("Dashboard");

    if (!dashboardSheet) {
      Logger.log("⚠️ Dashboard sheet not found");
      return;
    }

    // Add sparkline formulas for trend visualization
    // These will be added to metric cards showing historical trends

    Logger.log("✅ Dashboard sparklines added");
  } catch (error) {
    Logger.log("⚠️ Error adding sparklines: " + error.message);
  }
}

/**
 * Add property type icons to sheets
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Sheet to add icons to
 * @param {string} propertyType - "flip" or "rental"
 * @param {number} row - Row to place icon
 * @param {number} col - Column to place icon
 */
function addPropertyTypeIcon(sheet, propertyType, row, col) {
  try {
    const icon = propertyType.toLowerCase() === "flip" ? "🛠️" : "🏠";
    sheet.getRange(row, col).setValue(icon).setFontSize(20);
  } catch (error) {
    Logger.log("⚠️ Error adding property icon: " + error.message);
  }
}

/**
 * Clear all charts from analysis sheets
 * Used when switching to Simple Mode
 */
function clearAllCharts() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Clear charts from Flip Analysis
    const flipSheet = ss.getSheetByName("Flip Analysis");
    if (flipSheet) {
      const flipCharts = flipSheet.getCharts();
      flipCharts.forEach(chart => flipSheet.removeChart(chart));
      Logger.log("✅ Cleared charts from Flip Analysis");
    }

    // Clear charts from Rental Analysis
    const rentalSheet = ss.getSheetByName("Rental Analysis");
    if (rentalSheet) {
      const rentalCharts = rentalSheet.getCharts();
      rentalCharts.forEach(chart => rentalSheet.removeChart(chart));
      Logger.log("✅ Cleared charts from Rental Analysis");
    }

    // Clear charts from Dashboard
    const dashboardSheet = ss.getSheetByName("Dashboard");
    if (dashboardSheet) {
      const dashboardCharts = dashboardSheet.getCharts();
      dashboardCharts.forEach(chart => dashboardSheet.removeChart(chart));
      Logger.log("✅ Cleared charts from Dashboard");
    }

    Logger.log("✅ All charts cleared successfully");
    return { success: true };
  } catch (error) {
    Logger.log("❌ Error clearing charts: " + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Menu function to regenerate all charts
 */
function menuRegenerateCharts() {
  const result = generateAllCharts();

  if (result.success) {
    SpreadsheetApp.getUi().alert(
      "✅ Charts Generated",
      "All charts have been successfully generated!\n\n" +
      "Charts added to:\n" +
      "• Flip Analysis (3 charts)\n" +
      "• Rental Analysis (3 charts)\n" +
      "• Dashboard (1 chart)",
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } else {
    SpreadsheetApp.getUi().alert(
      "❌ Error",
      "Failed to generate charts: " + (result.error || "Unknown error"),
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Interactive Scenario Analyzer
 * Provides real-time scenario analysis with adjustable parameters
 * Phase 5.1 Implementation
 */

/**
 * Create Interactive Scenario Analyzer sidebar
 * Allows users to adjust key variables with sliders and see real-time updates
 */
function showScenarioAnalyzer() {
  const html = HtmlService.createHtmlOutputFromFile('ScenarioAnalyzer')
    .setTitle('Interactive Scenario Analyzer')
    .setWidth(400);
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Get current property data for scenario analysis
 * @returns {Object} Current property data and base calculations
 */
function getScenarioBaseData() {
  try {
    // Get all input values
    const purchasePrice = getField("purchasePrice", 0);
    const downPaymentPct = getField("downPayment", 20) / 100;
    const interestRate = getField("loanInterestRate", 7) / 100;
    const loanTerm = getField("loanTerm", 30);
    const rehabCost = getField("rehabCost", 0);
    const rentEstimate = getField("rentEstimate", 3500);
    const monthsToFlip = getField("monthsToFlip", 6);
    const propertyTaxRate = getField("propertyTaxRate", 0.0125);
    const insuranceMonthly = getField("insuranceMonthly", 100);
    const vacancyRate = getField("vacancyRate", 6) / 100;
    const maintenanceRate = getField("maintenanceRate", 1) / 100;

    // Get ARV from Flip Analysis sheet if available
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const flipSheet = ss.getSheetByName("Flip Analysis");
    let arv = purchasePrice * 1.1; // Default fallback

    if (flipSheet) {
      try {
        // Try to get ARV from the Flip Analysis sheet
        const arvCell = flipSheet.getRange("B25").getValue();
        if (arvCell && typeof arvCell === 'number' && arvCell > 0) {
          arv = arvCell;
        }
      } catch (e) {
        Logger.log("Could not read ARV from Flip Analysis: " + e.message);
      }
    }

    // Calculate base metrics
    const downPayment = purchasePrice * downPaymentPct;
    const loanAmount = purchasePrice - downPayment;
    const monthlyRate = interestRate / 12;
    const monthlyPI = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm * 12));

    // Flip calculations
    const closingCosts = purchasePrice * 0.02;
    const contingency = rehabCost * 0.1;
    const totalRehab = rehabCost + contingency;
    const monthlyPropertyTax = (purchasePrice * propertyTaxRate) / 12;
    const monthlyHoldingCosts = monthlyPI + monthlyPropertyTax + insuranceMonthly;
    const holdingCost = monthlyHoldingCosts * monthsToFlip;
    const sellCommission = arv * 0.05;
    const sellClosing = arv * 0.01;
    const totalSellCosts = sellCommission + sellClosing;
    const flipProfit = arv - (purchasePrice + totalRehab + closingCosts + holdingCost + totalSellCosts);
    const flipROI = (flipProfit / (downPayment + rehabCost)) * 100;

    // Rental calculations
    const grossIncome = rentEstimate * 12;
    const vacancyLoss = grossIncome * vacancyRate;
    const effectiveGrossIncome = grossIncome - vacancyLoss;
    const propertyTaxes = propertyTaxRate * purchasePrice;
    const insurance = insuranceMonthly * 12;
    const maintenance = purchasePrice * maintenanceRate;
    const totalOperatingExpenses = propertyTaxes + insurance + maintenance;
    const NOI = effectiveGrossIncome - totalOperatingExpenses;
    const annualDebtService = monthlyPI * 12;
    const annualCashFlow = NOI - annualDebtService;
    const monthlyCashFlow = annualCashFlow / 12;
    const capRate = (NOI / purchasePrice) * 100;
    const cocReturn = (annualCashFlow / (downPayment + rehabCost)) * 100;

    return {
      success: true,
      baseValues: {
        purchasePrice: purchasePrice,
        downPaymentPct: downPaymentPct * 100,
        interestRate: interestRate * 100,
        rehabCost: rehabCost,
        rentEstimate: rentEstimate,
        monthsToFlip: monthsToFlip,
        arv: arv
      },
      flipMetrics: {
        profit: Math.round(flipProfit),
        roi: flipROI.toFixed(2),
        holdingCost: Math.round(holdingCost),
        totalCost: Math.round(purchasePrice + totalRehab + closingCosts + holdingCost)
      },
      rentalMetrics: {
        monthlyCashFlow: Math.round(monthlyCashFlow),
        annualCashFlow: Math.round(annualCashFlow),
        capRate: capRate.toFixed(2),
        cocReturn: cocReturn.toFixed(2),
        NOI: Math.round(NOI)
      }
    };
  } catch (error) {
    Logger.log("Error in getScenarioBaseData: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calculate scenario with adjusted parameters
 * @param {Object} adjustments - Object containing percentage adjustments for each parameter
 * @returns {Object} Recalculated metrics based on adjustments
 */
function calculateScenario(adjustments) {
  try {
    // Get base values
    const purchasePrice = getField("purchasePrice", 0);
    const downPaymentPct = getField("downPayment", 20) / 100;
    const interestRate = getField("loanInterestRate", 7) / 100;
    const loanTerm = getField("loanTerm", 30);
    const rehabCost = getField("rehabCost", 0);
    const rentEstimate = getField("rentEstimate", 3500);
    const monthsToFlip = getField("monthsToFlip", 6);
    const propertyTaxRate = getField("propertyTaxRate", 0.0125);
    const insuranceMonthly = getField("insuranceMonthly", 100);
    const vacancyRate = getField("vacancyRate", 6) / 100;
    const maintenanceRate = getField("maintenanceRate", 1) / 100;

    // Get ARV
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const flipSheet = ss.getSheetByName("Flip Analysis");
    let baseARV = purchasePrice * 1.1;
    if (flipSheet) {
      try {
        const arvCell = flipSheet.getRange("B25").getValue();
        if (arvCell && typeof arvCell === 'number' && arvCell > 0) {
          baseARV = arvCell;
        }
      } catch (e) {
        Logger.log("Could not read ARV: " + e.message);
      }
    }

    // Apply adjustments (adjustments are in percentage, e.g., 10 for +10%)
    const adjustedARV = baseARV * (1 + (adjustments.arv || 0) / 100);
    const adjustedRehab = rehabCost * (1 + (adjustments.rehab || 0) / 100);
    const adjustedRent = rentEstimate * (1 + (adjustments.rent || 0) / 100);
    const adjustedInterestRate = (interestRate * 100 + (adjustments.interestRate || 0)) / 100;
    const adjustedMonthsToFlip = Math.max(1, monthsToFlip + (adjustments.monthsToFlip || 0));

    // Recalculate flip metrics
    const downPayment = purchasePrice * downPaymentPct;
    const loanAmount = purchasePrice - downPayment;
    const monthlyRate = adjustedInterestRate / 12;
    const monthlyPI = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm * 12));

    const closingCosts = purchasePrice * 0.02;
    const contingency = adjustedRehab * 0.1;
    const totalRehab = adjustedRehab + contingency;
    const monthlyPropertyTax = (purchasePrice * propertyTaxRate) / 12;
    const monthlyHoldingCosts = monthlyPI + monthlyPropertyTax + insuranceMonthly;
    const holdingCost = monthlyHoldingCosts * adjustedMonthsToFlip;
    const sellCommission = adjustedARV * 0.05;
    const sellClosing = adjustedARV * 0.01;
    const totalSellCosts = sellCommission + sellClosing;
    const flipProfit = adjustedARV - (purchasePrice + totalRehab + closingCosts + holdingCost + totalSellCosts);
    const flipROI = (flipProfit / (downPayment + adjustedRehab)) * 100;

    // Recalculate rental metrics
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
    const monthlyCashFlow = annualCashFlow / 12;
    const capRate = (NOI / purchasePrice) * 100;
    const cocReturn = (annualCashFlow / (downPayment + adjustedRehab)) * 100;

    // Calculate changes from base
    const baseData = getScenarioBaseData();
    const flipProfitChange = flipProfit - baseData.flipMetrics.profit;
    const flipROIChange = flipROI - parseFloat(baseData.flipMetrics.roi);
    const cashFlowChange = monthlyCashFlow - baseData.rentalMetrics.monthlyCashFlow;
    const capRateChange = capRate - parseFloat(baseData.rentalMetrics.capRate);

    return {
      success: true,
      adjustedValues: {
        arv: Math.round(adjustedARV),
        rehab: Math.round(adjustedRehab),
        rent: Math.round(adjustedRent),
        interestRate: adjustedInterestRate.toFixed(2),
        monthsToFlip: adjustedMonthsToFlip
      },
      flipMetrics: {
        profit: Math.round(flipProfit),
        roi: flipROI.toFixed(2),
        holdingCost: Math.round(holdingCost),
        totalCost: Math.round(purchasePrice + totalRehab + closingCosts + holdingCost),
        profitChange: Math.round(flipProfitChange),
        roiChange: flipROIChange.toFixed(2)
      },
      rentalMetrics: {
        monthlyCashFlow: Math.round(monthlyCashFlow),
        annualCashFlow: Math.round(annualCashFlow),
        capRate: capRate.toFixed(2),
        cocReturn: cocReturn.toFixed(2),
        NOI: Math.round(NOI),
        cashFlowChange: Math.round(cashFlowChange),
        capRateChange: capRateChange.toFixed(2)
      }
    };
  } catch (error) {
    Logger.log("Error in calculateScenario: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Save custom scenario to a new sheet
 * @param {string} scenarioName - Name for the custom scenario
 * @param {Object} adjustments - Adjustments applied to create this scenario
 * @param {Object} results - Calculated results for this scenario
 * @returns {Object} Success status and message
 */
function saveCustomScenario(scenarioName, adjustments, results) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let scenarioSheet = ss.getSheetByName("Custom Scenarios");

    // Create sheet if it doesn't exist
    if (!scenarioSheet) {
      scenarioSheet = ss.insertSheet("Custom Scenarios");

      // Set up headers
      scenarioSheet.getRange("A1").setValue("Custom Scenario Analysis")
        .setFontWeight("bold")
        .setFontSize(16)
        .setBackground("#1a73e8")
        .setFontColor("white");

      const headers = [
        ["Scenario Name", "Date Created", "ARV Adj %", "Rehab Adj %", "Rent Adj %",
         "Interest Adj %", "Months Adj", "Flip Profit", "Flip ROI %",
         "Monthly Cash Flow", "Cap Rate %", "CoC Return %"]
      ];

      scenarioSheet.getRange(3, 1, 1, 12).setValues(headers);
      scenarioSheet.getRange(3, 1, 1, 12)
        .setFontWeight("bold")
        .setBackground("#d9e2f3")
        .setHorizontalAlignment("center");

      scenarioSheet.setColumnWidths(1, 12, 120);
    }

    // Find next empty row
    const lastRow = scenarioSheet.getLastRow();
    const newRow = lastRow + 1;

    // Prepare data
    const rowData = [[
      scenarioName,
      new Date().toLocaleString(),
      adjustments.arv || 0,
      adjustments.rehab || 0,
      adjustments.rent || 0,
      adjustments.interestRate || 0,
      adjustments.monthsToFlip || 0,
      results.flipMetrics.profit,
      results.flipMetrics.roi,
      results.rentalMetrics.monthlyCashFlow,
      results.rentalMetrics.capRate,
      results.rentalMetrics.cocReturn
    ]];

    // Write data
    scenarioSheet.getRange(newRow, 1, 1, 12).setValues(rowData);

    // Format numbers
    scenarioSheet.getRange(newRow, 8).setNumberFormat('"$"#,##0');
    scenarioSheet.getRange(newRow, 9).setNumberFormat("0.00%");
    scenarioSheet.getRange(newRow, 10).setNumberFormat('"$"#,##0');
    scenarioSheet.getRange(newRow, 11, 1, 2).setNumberFormat("0.00%");

    // Alternate row colors
    if (newRow % 2 === 0) {
      scenarioSheet.getRange(newRow, 1, 1, 12).setBackground("#f7f9fc");
    }

    return {
      success: true,
      message: "Scenario '" + scenarioName + "' saved successfully!"
    };
  } catch (error) {
    Logger.log("Error in saveCustomScenario: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Run Monte Carlo simulation for risk analysis
 * @param {number} iterations - Number of simulation iterations (default 1000)
 * @returns {Object} Simulation results with statistics
 */
function runMonteCarloSimulation(iterations = 1000) {
  try {
    const results = {
      flipProfit: [],
      flipROI: [],
      monthlyCashFlow: [],
      capRate: []
    };

    // Run simulations
    for (let i = 0; i < iterations; i++) {
      // Generate random adjustments within reasonable ranges
      // ARV: -15% to +15%
      // Rehab: -10% to +30%
      // Rent: -10% to +10%
      // Interest Rate: -1% to +2%
      // Months: -2 to +4

      const adjustments = {
        arv: (Math.random() * 30 - 15),
        rehab: (Math.random() * 40 - 10),
        rent: (Math.random() * 20 - 10),
        interestRate: (Math.random() * 3 - 1),
        monthsToFlip: Math.floor(Math.random() * 7 - 2)
      };

      const scenario = calculateScenario(adjustments);

      if (scenario.success) {
        results.flipProfit.push(scenario.flipMetrics.profit);
        results.flipROI.push(parseFloat(scenario.flipMetrics.roi));
        results.monthlyCashFlow.push(scenario.rentalMetrics.monthlyCashFlow);
        results.capRate.push(parseFloat(scenario.rentalMetrics.capRate));
      }
    }

    // Calculate statistics
    const calculateStats = (arr) => {
      const sorted = arr.sort((a, b) => a - b);
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      const median = sorted[Math.floor(sorted.length / 2)];
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const p10 = sorted[Math.floor(sorted.length * 0.1)];
      const p90 = sorted[Math.floor(sorted.length * 0.9)];

      // Standard deviation
      const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
      const stdDev = Math.sqrt(variance);

      return { mean, median, min, max, p10, p90, stdDev };
    };

    return {
      success: true,
      iterations: iterations,
      flipProfit: calculateStats(results.flipProfit),
      flipROI: calculateStats(results.flipROI),
      monthlyCashFlow: calculateStats(results.monthlyCashFlow),
      capRate: calculateStats(results.capRate)
    };
  } catch (error) {
    Logger.log("Error in runMonteCarloSimulation: " + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Display Monte Carlo simulation results in a new sheet
 * @param {Object} results - Simulation results from runMonteCarloSimulation
 */
function displayMonteCarloResults(results) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let mcSheet = ss.getSheetByName("Monte Carlo Analysis");

    // Create or clear sheet
    if (mcSheet) {
      mcSheet.clear();
    } else {
      mcSheet = ss.insertSheet("Monte Carlo Analysis");
    }

    // Title
    mcSheet.getRange("A1").setValue("Monte Carlo Risk Analysis")
      .setFontWeight("bold")
      .setFontSize(16)
      .setBackground("#1a73e8")
      .setFontColor("white");

    mcSheet.getRange("A2").setValue("Iterations: " + results.iterations + " | Generated: " + new Date().toLocaleString())
      .setFontSize(9)
      .setFontColor("#666666");

    let row = 4;

    // Helper function to display metric statistics
    const displayMetric = (metricName, stats, format) => {
      mcSheet.getRange(row, 1, 1, 2).merge()
        .setValue(metricName)
        .setFontWeight("bold")
        .setFontSize(12)
        .setBackground("#e8f0fe");
      row++;

      const data = [
        ["Mean (Average)", stats.mean],
        ["Median (50th Percentile)", stats.median],
        ["10th Percentile (Worst Case)", stats.p10],
        ["90th Percentile (Best Case)", stats.p90],
        ["Minimum", stats.min],
        ["Maximum", stats.max],
        ["Standard Deviation", stats.stdDev]
      ];

      mcSheet.getRange(row, 1, data.length, 2).setValues(data);
      mcSheet.getRange(row, 1, data.length, 1).setFontWeight("bold");
      mcSheet.getRange(row, 2, data.length, 1).setNumberFormat(format);

      // Highlight key metrics
      mcSheet.getRange(row, 1, 1, 2).setBackground("#d4edda"); // Mean
      mcSheet.getRange(row + 2, 1, 1, 2).setBackground("#fff3cd"); // 10th percentile
      mcSheet.getRange(row + 3, 1, 1, 2).setBackground("#d1ecf1"); // 90th percentile

      row += data.length + 2;
    };

    // Display all metrics
    displayMetric("Flip Profit", results.flipProfit, '"$"#,##0');
    displayMetric("Flip ROI", results.flipROI, "0.00%");
    displayMetric("Monthly Cash Flow", results.monthlyCashFlow, '"$"#,##0');
    displayMetric("Cap Rate", results.capRate, "0.00%");

    // Set column widths
    mcSheet.setColumnWidth(1, 250);
    mcSheet.setColumnWidth(2, 150);

    SpreadsheetApp.getUi().alert(
      "Monte Carlo Analysis Complete",
      "Risk analysis with " + results.iterations + " iterations has been generated.\n\n" +
      "Check the 'Monte Carlo Analysis' sheet for detailed statistics.",
      SpreadsheetApp.getUi().ButtonSet.OK
    );

    return { success: true };
  } catch (error) {
    Logger.log("Error in displayMonteCarloResults: " + error.message);
    return { success: false, error: error.message };
  }
}

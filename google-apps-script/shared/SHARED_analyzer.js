/**
 * Check if currently in Simple Mode
 * @returns {boolean}
 * NOTE: Uses PropertiesService directly for document-specific properties
 * (not migrated to QuotaManager as this is document-level, not script-level)
 */
function isSimpleMode() {
  try {
    const docProps = PropertiesService.getDocumentProperties();
    return (docProps.getProperty('analysisMode') || 'Simple') === 'Simple';
  } catch (e) {
    PlatformLogger.error("Error checking mode: " + e);
    return true; // Default to Simple if error
  }
}

/**
 * Generate Flip Analysis Report
 * Includes: Project Summary, Cost Breakdown, Comps, Profit & ROI, Scenarios
 */
function generateFlipAnalysis(comps) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Flip Analysis");
  if (!sheet) return PlatformLogger.error("❌ Flip Analysis sheet not found.");

  sheet.clearContents();

  // Title and timestamp - using standardized header formatting
  const titleRange = sheet.getRange("A1");
  titleRange.setValue("Fix & Flip Analysis");
  styleHeader(titleRange, 'h1');
  titleRange.setBackground("#1a73e8");
  titleRange.setFontColor("white");

  sheet.getRange("A2").setValue("Generated: " + new Date().toLocaleString())
    .setFontSize(9)
    .setFontColor("#666666");
  let row = 4;

  // Get input values using dynamic field mapping
  const purchasePrice = getField("purchasePrice", 0);
  const downPaymentPct = getField("downPayment", 20) / 100;
  const interestRate = getField("loanInterestRate", 7) / 100;
  const loanTerm = getField("loanTerm", 30);
  const cashInvestment = getField("cashInvestment", 0);
  const helocAmount = getField("helocAmount", 0);
  const helocInterest = getField("helocInterest", 0.07);
  const rehabCost = getField("rehabCost", 0);
  const monthsToFlip = getField("monthsToFlip", 6);
  const downPayment = purchasePrice * downPaymentPct;
  const loanAmount = purchasePrice - downPayment;
  const monthlyRate = interestRate / 12;
  const monthlyPI = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm * 12));
  const helocCost = helocAmount * helocInterest * (monthsToFlip / 12);
  const totalCashRequired = downPayment + rehabCost + cashInvestment;

  // Check if in Simple Mode
  const simpleMode = isSimpleMode();

  // --- Section 1: Project Summary ---
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue("Project Summary")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  let summaryData;
  if (simpleMode) {
    // Simple Mode: Show only essential fields
    summaryData = [
      ["Purchase Price", purchasePrice],
      ["Rehab Cost", rehabCost],
      ["Months to Flip", monthsToFlip],
      ["Total Cash Required", totalCashRequired]
    ];
  } else {
    // Advanced Mode: Show all fields
    summaryData = [
      ["Purchase Price", purchasePrice],
      ["Down Payment (%)", downPaymentPct],
      ["Loan Amount", loanAmount],
      ["Interest Rate (%)", interestRate],
      ["Loan Term (Years)", loanTerm],
      ["Months to Flip", monthsToFlip],
      ["", ""],
      ["HELOC Interest Cost", helocCost],
      ["Total Cash Required", totalCashRequired]
    ];
  }

  sheet.getRange(row, 1, summaryData.length, 2).setValues(summaryData);
  sheet.getRange(row, 1, summaryData.length, 1).setFontWeight("bold").setHorizontalAlignment("left");
  sheet.getRange(row, 2, summaryData.length, 1).setHorizontalAlignment("right");
  row += summaryData.length + 1;

  // --- Section 2: Rehab & Cost Breakdown (Advanced Mode Only) ---
  // Get property tax and insurance values (needed for calculations)
  const propertyTaxRate = getField("propertyTaxRate", 0.0125);
  const insuranceMonthly = getField("insuranceMonthly", 100);
  const utilitiesCost = getField("utilitiesCost", 0);

  // Calculate holding costs (mortgage + HELOC + taxes + insurance + utilities)
  const monthlyPropertyTax = (purchasePrice * propertyTaxRate) / 12;
  const monthlyHoldingCosts = monthlyPI + (helocAmount * helocInterest / 12) + monthlyPropertyTax + insuranceMonthly + utilitiesCost;
  const holdingCost = monthlyHoldingCosts * monthsToFlip;

  const closingCosts = purchasePrice * 0.02;
  const contingency = rehabCost * 0.1;
  const totalRehab = rehabCost + contingency;
  const totalCosts = closingCosts + holdingCost + totalRehab + downPayment;

  let costStartRow = row;
  if (!simpleMode) {
    sheet.getRange(row, 1, 1, 2).merge()
      .setValue("Rehab & Cost Breakdown")
      .setFontWeight("bold")
      .setFontSize(12)
      .setBackground("#e8f0fe")
      .setHorizontalAlignment("left");
    row++;

    const costData = [
      ["Rehab Cost (Base)", rehabCost],
      ["Contingency (10%)", contingency],
      ["Total Rehab Cost", totalRehab],
      ["Acquisition Costs (2%)", closingCosts],
      ["Holding Costs (Monthly)", monthlyHoldingCosts],
      ["  - Mortgage P&I", monthlyPI],
      ["  - HELOC Interest", helocAmount * helocInterest / 12],
      ["  - Property Tax", monthlyPropertyTax],
      ["  - Insurance", insuranceMonthly],
      ["  - Utilities", utilitiesCost],
      ["Total Holding Costs (" + monthsToFlip + " months)", holdingCost],
      ["Total Cash Required", totalCosts]
    ];

    costStartRow = row;
    sheet.getRange(row, 1, costData.length, 2).setValues(costData);
    sheet.getRange(row, 1, costData.length, 1).setFontWeight("bold").setHorizontalAlignment("left");
    sheet.getRange(row, 2, costData.length, 1).setHorizontalAlignment("right");

    // Indent the breakdown items
    sheet.getRange(row + 5, 1, 5, 1).setFontWeight("normal").setFontStyle("italic");

    // Highlight total holding costs
    sheet.getRange(row + 10, 1, 1, 2).setBackground("#fff9e6");

    row += costData.length + 1;
  }

  // --- Section 3: Comps Data (show header in both modes) ---
  sheet.getRange(row, 1, 1, 5).merge()
    .setValue("Comps Data (Auto-Fetched)")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  const compsHeaders = [["Address", "Sale Price", "SqFt", "Sale Date", "Distance", "Link"]];
  sheet.getRange(row, 1, 1, 6).setValues(compsHeaders);
  sheet.getRange(row, 1, 1, 6)
    .setFontWeight("bold")
    .setBackground("#d9e2f3")
    .setHorizontalAlignment("center")
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  // Calculate ARV from Comps with Enhanced Multi-Source Logic
  // Phase 1.5: Multi-Source Weighted ARV Calculation
  let arv = 0;
  let arvCalculationMethod = "Legacy (No Comps)";
  let arvSources = {
    comps: null,
    zillow: null,
    usRealEstate: null
  };

  // Fetch additional estimate sources (Phase 1.2 & 1.3)
  const propertyData = {
    address: getField("address", ""),
    city: getField("city", ""),
    state: getField("state", ""),
    zip: getField("zip", "")
  };

  // Try to get Zillow Zestimate (Phase 1.2)
  try {
    const propertyDetails = fetchPropertyDetails(propertyData);
    if (propertyDetails && propertyDetails.zpid) {
      const zestimate = fetchZillowZestimate(propertyDetails.zpid);
      if (zestimate && zestimate.zestimate) {
        arvSources.zillow = zestimate.zestimate;
        PlatformLogger.success(`💰 Zillow Zestimate: $${zestimate.zestimate.toLocaleString()}`);
      }
    }
  } catch (e) {
    PlatformLogger.warn(`Failed to fetch Zillow Zestimate: ${e.message}`);
  }

  // Try to get US Real Estate estimate (Phase 1.3)
  try {
    const propertyId = getUSRealEstatePropertyId(propertyData);
    if (propertyId) {
      const usEstimate = fetchUSRealEstateHomeEstimate(propertyId);
      if (usEstimate && usEstimate.estimate) {
        arvSources.usRealEstate = usEstimate.estimate;
        PlatformLogger.success(`🏡 US Real Estate Estimate: $${usEstimate.estimate.toLocaleString()}`);
      }
    }
  } catch (e) {
    PlatformLogger.warn(`Failed to fetch US Real Estate estimate: ${e.message}`);
  }

  if (!comps || comps.length === 0) {
    if (!simpleMode) {
      sheet.getRange(row, 1).setValue("⚠️ No comps data returned from API. Using legacy calculation.");
    }
    // Legacy fallback: 20% premium (conservative)
    arv = purchasePrice * 1.20;
    arvCalculationMethod = "Legacy (20% premium on purchase price)";
    PlatformLogger.info(`📊 ARV Calculation: Using legacy method - ${arvCalculationMethod}`);
  } else {

    // Get property details for filtering
    const propertyDetails = fetchPropertyDetails({
      address: getField("address", ""),
      city: getField("city", ""),
      state: getField("state", ""),
      zip: getField("zip", "")
    });

    const targetSqft = propertyDetails.sqft;
    const targetBeds = propertyDetails.beds;
    const targetBaths = propertyDetails.baths;

    PlatformLogger.info(`🏠 Target Property: ${targetBeds} bed, ${targetBaths} bath, ${targetSqft} sqft`);

    // Filter comps by date (last 2 years only)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const recentComps = comps.filter(c => {
      if (!c.saleDate) return false; // Exclude if no date
      try {
        const saleDate = new Date(c.saleDate);
        return saleDate >= twoYearsAgo;
      } catch (e) {
        PlatformLogger.warn(`⚠️ Invalid date format for comp: ${c.saleDate}`);
        return false;
      }
    });

    PlatformLogger.info(`📅 Filtered ${recentComps.length} comps from last 2 years (from ${comps.length} total)`);

    // Filter comps by similarity (±20% sqft, same beds/baths preferred)
    const filteredComps = recentComps.filter(c => {
      const sqftMatch = c.sqft && Math.abs(c.sqft - targetSqft) / targetSqft <= 0.2;
      const bedsMatch = !c.beds || c.beds === targetBeds || Math.abs(c.beds - targetBeds) <= 1;
      const bathsMatch = !c.baths || c.baths === targetBaths || Math.abs(c.baths - targetBaths) <= 1;
      return sqftMatch && bedsMatch && bathsMatch;
    });

    PlatformLogger.info(`🔍 Filtered ${filteredComps.length} comps from ${recentComps.length} recent (by sqft, beds, baths)`);

    // Use filtered comps if we have enough, otherwise use all recent comps
    const compsToUse = filteredComps.length >= 3 ? filteredComps : recentComps;

    // Separate remodeled and unremodeled comps
    const remodeledComps = compsToUse.filter(c => c.condition === "remodeled");
    const unremodeledComps = compsToUse.filter(c => c.condition === "unremodeled");

    PlatformLogger.info(`📊 Remodeled comps: ${remodeledComps.length}, Unremodeled comps: ${unremodeledComps.length}`);

    // Calculate average prices for each category
    const avgRemodeled = remodeledComps.length > 0
      ? remodeledComps.reduce((sum, c) => sum + (c.price || 0), 0) / remodeledComps.length
      : 0;
    const avgUnremodeled = unremodeledComps.length > 0
      ? unremodeledComps.reduce((sum, c) => sum + (c.price || 0), 0) / unremodeledComps.length
      : 0;

    // Enhanced ARV Calculation Logic (Conservative Approach)
    let compsARV = 0;
    if (remodeledComps.length >= 3) {
      // Best case: We have 3+ remodeled comps - use average with 0% premium
      compsARV = avgRemodeled;
      arvSources.comps = compsARV;
      PlatformLogger.success(`✅ Comps ARV: Using ${remodeledComps.length} remodeled comps average (no premium)`);
    } else if (remodeledComps.length > 0 && unremodeledComps.length > 0) {
      // Mixed case: Calculate renovation premium from available data, cap at 25%
      const renovationPremium = avgRemodeled / avgUnremodeled;
      const cappedPremium = Math.min(renovationPremium, 1.25);
      compsARV = avgUnremodeled * cappedPremium;
      arvSources.comps = compsARV;
      PlatformLogger.info(`📊 Comps ARV: Mixed comps with ${((cappedPremium - 1) * 100).toFixed(1)}% premium (capped at 25%)`);
    } else if (unremodeledComps.length >= 3) {
      // Only unremodeled comps: Apply 25% premium
      compsARV = avgUnremodeled * 1.25;
      arvSources.comps = compsARV;
      PlatformLogger.info(`📊 Comps ARV: Using ${unremodeledComps.length} unremodeled comps + 25% premium`);
    } else {
      // Fallback: Use all available comps or legacy calculation
      if (compsToUse.length > 0) {
        const avgAll = compsToUse.reduce((sum, c) => sum + (c.price || 0), 0) / compsToUse.length;
        compsARV = avgAll * 1.20; // Apply 20% premium as conservative estimate
        arvSources.comps = compsARV;
        PlatformLogger.info(`📊 Comps ARV: Using ${compsToUse.length} mixed comps + 20% premium`);
      } else {
        // Ultimate fallback: Legacy calculation
        compsARV = purchasePrice * 1.20;
        arvSources.comps = compsARV;
        PlatformLogger.info(`📊 Comps ARV: Using legacy method - no suitable comps found`);
      }
    }

    // Phase 1.5: Multi-Source Weighted ARV Calculation
    // Calculate weighted average based on available sources
    const availableSources = [];
    if (arvSources.comps) availableSources.push({ name: 'comps', value: arvSources.comps, weight: 0.50 });
    if (arvSources.zillow) availableSources.push({ name: 'zillow', value: arvSources.zillow, weight: 0.25 });
    if (arvSources.usRealEstate) availableSources.push({ name: 'us_real_estate', value: arvSources.usRealEstate, weight: 0.25 });

    if (availableSources.length === 1) {
      // Only one source available - use it at 100%
      arv = availableSources[0].value;
      arvCalculationMethod = `Single source: ${availableSources[0].name} (100%)`;
      PlatformLogger.info(`📊 Final ARV: Single source (${availableSources[0].name}): $${arv.toLocaleString()}`);
    } else if (availableSources.length > 1) {
      // Multiple sources - calculate weighted average
      // Redistribute weights proportionally if not all sources available
      const totalWeight = availableSources.reduce((sum, s) => sum + s.weight, 0);
      let weightedSum = 0;
      let sourceBreakdown = [];

      availableSources.forEach(source => {
        const adjustedWeight = source.weight / totalWeight;
        weightedSum += source.value * adjustedWeight;
        sourceBreakdown.push(`${source.name} (${(adjustedWeight * 100).toFixed(0)}%)`);
      });

      arv = weightedSum;
      arvCalculationMethod = `Multi-source weighted: ${sourceBreakdown.join(' + ')}`;

      PlatformLogger.success(`📊 Final ARV (Multi-Source Weighted): $${arv.toLocaleString()}`);
      PlatformLogger.info(`   - Comps: ${arvSources.comps ? '$' + arvSources.comps.toLocaleString() : 'N/A'}`);
      PlatformLogger.info(`   - Zillow: ${arvSources.zillow ? '$' + arvSources.zillow.toLocaleString() : 'N/A'}`);
      PlatformLogger.info(`   - US Real Estate: ${arvSources.usRealEstate ? '$' + arvSources.usRealEstate.toLocaleString() : 'N/A'}`);
      PlatformLogger.info(`   - Method: ${arvCalculationMethod}`);
    }


    // Sort comps by distance if available
    const sortedComps = comps
      .map((c, index) => ({ ...c, originalIndex: index }))
      .sort((a, b) => {
        if (a.distance && b.distance) return a.distance - b.distance;
        return 0;
      });

    sortedComps.forEach((c, i) => {
      const rowNum = row + 1 + i;
      sheet.getRange(rowNum, 1).setValue(c.address || "—").setHorizontalAlignment("left");
      sheet.getRange(rowNum, 2).setValue(c.price || 0).setNumberFormat('"$"#,##0').setHorizontalAlignment("right");
      sheet.getRange(rowNum, 3).setValue(c.sqft || "—").setHorizontalAlignment("center");
      sheet.getRange(rowNum, 4).setValue(c.saleDate || "—").setHorizontalAlignment("center");
      sheet.getRange(rowNum, 5).setValue(c.distance ? c.distance.toFixed(2) + " mi" : "—").setHorizontalAlignment("center");

      // Add property link with formula
      if (c.link) {
        sheet.getRange(rowNum, 6).setFormula(`=HYPERLINK("${c.link}", "View")`).setHorizontalAlignment("center");
      } else {
        sheet.getRange(rowNum, 6).setValue("—").setHorizontalAlignment("center");
      }

      // Highlight remodeled comps in green, unremodeled in yellow
      if (c.condition === "remodeled") {
        sheet.getRange(rowNum, 1, 1, 6)
          .setBackground("#e8f5e9")
          .setFontWeight("bold")
          .setBorder(true, true, true, true, false, false, "#cccccc", SpreadsheetApp.BorderStyle.SOLID);
        sheet.getRange(rowNum, 1).setNote("Remodeled comp");
      } else if (c.condition === "unremodeled") {
        sheet.getRange(rowNum, 1, 1, 6)
          .setBackground("#fff9c4")
          .setBorder(true, true, true, true, false, false, "#cccccc", SpreadsheetApp.BorderStyle.SOLID);
        sheet.getRange(rowNum, 1).setNote("Unremodeled comp");
      } else {
        sheet.getRange(rowNum, 1, 1, 6)
          .setBorder(true, true, true, true, false, false, "#cccccc", SpreadsheetApp.BorderStyle.SOLID);
      }
    });
  }
  row += (comps?.length || 1) + 3;

  // Add ARV Calculation Method transparency with source breakdown
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue(`💡 ARV Calculation Method: ${arvCalculationMethod}`)
    .setFontSize(10)
    .setFontStyle("italic")
    .setFontColor("#666666")
    .setBackground("#f0f0f0")
    .setHorizontalAlignment("left");
  row++;

  // Add detailed source breakdown if multi-source
  if (arvSources.comps || arvSources.zillow || arvSources.usRealEstate) {
    const sourceDetails = [];
    if (arvSources.comps) sourceDetails.push(`Comps: $${arvSources.comps.toLocaleString()}`);
    if (arvSources.zillow) sourceDetails.push(`Zillow: $${arvSources.zillow.toLocaleString()}`);
    if (arvSources.usRealEstate) sourceDetails.push(`US Real Estate: $${arvSources.usRealEstate.toLocaleString()}`);

    if (sourceDetails.length > 1) {
      sheet.getRange(row, 1, 1, 2).merge()
        .setValue(`   Sources: ${sourceDetails.join(' | ')}`)
        .setFontSize(9)
        .setFontStyle("italic")
        .setFontColor("#888888")
        .setBackground("#f0f0f0")
        .setHorizontalAlignment("left");
      row++;
    }
  }
  row++;

  // --- Section 3.5: Historical Validation & Market Context (Phase 2) ---
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue("Historical Validation & Market Context")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  // Validate ARV against historical market trends
  let validationResult = null;
  try {
    // Get property details for zpid
    const propertyDetails = fetchPropertyDetails(propertyData);
    const zpid = propertyDetails?.zpid;
    const location = `${propertyData.city}, ${propertyData.state}`;

    if (zpid) {
      validationResult = validateARVAgainstMarketTrends(arv, zpid, location);

      if (validationResult) {
        // Display validation status
        const validationStatus = validationResult.isValid
          ? "✅ ARV is validated against historical data"
          : "⚠️ ARV may need review";

        sheet.getRange(row, 1, 1, 2).merge()
          .setValue(validationStatus)
          .setFontWeight("bold")
          .setFontSize(11)
          .setBackground(validationResult.isValid ? "#d4edda" : "#fff3cd")
          .setFontColor(validationResult.isValid ? "#155724" : "#856404")
          .setHorizontalAlignment("left");
        row++;

        // Display market trend indicator
        let trendEmoji = "➡️";
        if (validationResult.marketTrend === "hot") trendEmoji = "🔥";
        else if (validationResult.marketTrend === "rising") trendEmoji = "📈";
        else if (validationResult.marketTrend === "declining") trendEmoji = "📉";

        const validationData = [
          ["Market Trend", `${trendEmoji} ${validationResult.marketTrend.charAt(0).toUpperCase() + validationResult.marketTrend.slice(1)}`],
          ["Historical ARV", validationResult.historicalARV || "N/A"],
          ["ARV Deviation", validationResult.deviation ? `${(validationResult.deviation * 100).toFixed(1)}%` : "N/A"],
          ["Appreciation Rate (Annual)", validationResult.appreciationRate ? `${(validationResult.appreciationRate * 100).toFixed(2)}%` : "N/A"]
        ];

        sheet.getRange(row, 1, validationData.length, 2).setValues(validationData);
        sheet.getRange(row, 1, validationData.length, 1).setFontWeight("bold").setHorizontalAlignment("left");
        sheet.getRange(row, 2, validationData.length, 1).setHorizontalAlignment("right");

        // Format Historical ARV as currency
        if (validationResult.historicalARV) {
          sheet.getRange(row + 1, 2).setNumberFormat('"$"#,##0');
        }

        row += validationData.length;

        // Display warnings if any
        if (validationResult.warnings && validationResult.warnings.length > 0) {
          row++;
          sheet.getRange(row, 1, 1, 2).merge()
            .setValue("⚠️ Validation Warnings:")
            .setFontWeight("bold")
            .setFontSize(10)
            .setBackground("#fff3cd")
            .setFontColor("#856404")
            .setHorizontalAlignment("left");
          row++;

          validationResult.warnings.forEach(warning => {
            sheet.getRange(row, 1, 1, 2).merge()
              .setValue(`   • ${warning}`)
              .setFontSize(9)
              .setFontStyle("italic")
              .setFontColor("#856404")
              .setBackground("#fffbf0")
              .setHorizontalAlignment("left")
              .setWrap(true);
            row++;
          });
        }

        PlatformLogger.success(`✅ Historical validation completed: ${validationResult.isValid ? 'Valid' : 'Needs review'}`);
      } else {
        sheet.getRange(row, 1, 1, 2).merge()
          .setValue("ℹ️ Historical validation data not available")
          .setFontSize(10)
          .setFontStyle("italic")
          .setFontColor("#666666")
          .setBackground("#f0f0f0")
          .setHorizontalAlignment("left");
        row++;
        PlatformLogger.info("Historical validation data not available");
      }
    } else {
      sheet.getRange(row, 1, 1, 2).merge()
        .setValue("ℹ️ Property ID (ZPID) not found - historical validation skipped")
        .setFontSize(10)
        .setFontStyle("italic")
        .setFontColor("#666666")
        .setBackground("#f0f0f0")
        .setHorizontalAlignment("left");
      row++;
      PlatformLogger.info("ZPID not found - historical validation skipped");
    }
  } catch (e) {
    sheet.getRange(row, 1, 1, 2).merge()
      .setValue(`⚠️ Historical validation error: ${e.message}`)
      .setFontSize(9)
      .setFontStyle("italic")
      .setFontColor("#dc3545")
      .setBackground("#f8d7da")
      .setHorizontalAlignment("left");
    row++;
    PlatformLogger.error(`Historical validation error: ${e.message}`);
  }
  row++;

  // --- Section 4: Profit & ROI ---
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue("Profit & ROI Analysis")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  const sellCommission = arv * 0.05;
  const sellClosing = arv * 0.01;
  const totalSellCosts = sellCommission + sellClosing;
  const netProfit = arv - (purchasePrice + totalRehab + closingCosts + holdingCost + totalSellCosts);
  const roi = (netProfit / (cashInvestment + downPayment + rehabCost)); // will be formatted in %
  const mao = (arv * 0.7) - totalRehab;

  const profitData = [
    ["After Repair Value (ARV)", arv],
    ["Total Selling Costs (6%)", totalSellCosts],
    ["Net Profit ($)", netProfit],
    ["ROI (%)", roi],
    ["Max Allowable Offer (MAO)", mao]
  ];

  const profitStartRow = row;
  sheet.getRange(row, 1, profitData.length, 2).setValues(profitData);
  sheet.getRange(row, 1, profitData.length, 1).setFontWeight("bold").setHorizontalAlignment("left");
  sheet.getRange(row, 2, profitData.length, 1).setHorizontalAlignment("right");

  // Highlight key metrics
  sheet.getRange(row + 2, 1, 1, 2).setBackground("#fff3cd"); // Net Profit
  sheet.getRange(row + 3, 1, 1, 2).setBackground("#d1ecf1"); // ROI
  sheet.getRange(row + 4, 1, 1, 2).setBackground("#d4edda"); // MAO

  row += profitData.length + 1;

  // --- Section 5: Scenario Analysis ---
  const scenarioData = {
    baseARV: arv,
    baseRehab: totalRehab,
    baseProfit: netProfit,
    worstARV: arv * 0.9,
    worstRehab: totalRehab * 1.2,
    worstProfit: arv * 0.9 - (purchasePrice + totalRehab * 1.2 + closingCosts + holdingCost + totalSellCosts),
    bestARV: arv * 1.1,
    bestRehab: totalRehab * 0.9,
    bestProfit: arv * 1.1 - (purchasePrice + totalRehab * 0.9 + closingCosts + holdingCost + totalSellCosts),
  };

  row = generateScenarios(sheet, row, scenarioData); // ✅ only one heading now


  // --- Final Formatting ---
  const currencyNoDecimal = '"$"#,##0';
  const percentFormat = "0.00%";

  // Project Summary - Apply formats based on mode
  if (simpleMode) {
    sheet.getRange(5, 2).setNumberFormat(currencyNoDecimal); // Purchase Price
    sheet.getRange(6, 2).setNumberFormat(currencyNoDecimal); // Rehab Cost
    sheet.getRange(7, 2).setNumberFormat("0"); // Months to Flip
    sheet.getRange(8, 2).setNumberFormat(currencyNoDecimal); // Total Cash Required
  } else {
    sheet.getRange(5, 2).setNumberFormat(currencyNoDecimal); // Purchase Price
    sheet.getRange(6, 2).setNumberFormat("0.00%"); // Down Payment %
    sheet.getRange(7, 2).setNumberFormat(currencyNoDecimal); // Loan Amount
    sheet.getRange(8, 2).setNumberFormat("0.00%"); // Interest Rate %
    sheet.getRange(9, 2).setNumberFormat("0"); // Loan Term (Years) - plain number
    sheet.getRange(10, 2).setNumberFormat("0"); // Months to Flip - plain number
    // Row 11 is spacer
    sheet.getRange(12, 2).setNumberFormat(currencyNoDecimal); // HELOC Interest Cost
    sheet.getRange(13, 2).setNumberFormat(currencyNoDecimal); // Total Cash Required
  }

  // Format Profit & ROI section (using stored row positions)
  sheet.getRange(profitStartRow, 2).setNumberFormat(currencyNoDecimal); // ARV
  sheet.getRange(profitStartRow + 1, 2).setNumberFormat(currencyNoDecimal); // Total Selling Costs
  sheet.getRange(profitStartRow + 2, 2).setNumberFormat(currencyNoDecimal); // Net Profit
  sheet.getRange(profitStartRow + 3, 2).setNumberFormat(percentFormat); // ROI
  sheet.getRange(profitStartRow + 4, 2).setNumberFormat(currencyNoDecimal); // MAO

  // Set column widths
  sheet.setColumnWidth(1, 250);
  sheet.setColumnWidth(2, 150);
  sheet.setColumnWidth(3, 100);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 100);
  sheet.setColumnWidth(6, 80); // Link column

  PlatformLogger.success("✅ Flip Analysis finalized with enhanced formatting.");
}

/**
 * Generate Rental Analysis Report
 * Includes: As-Is, After-Flip (BRRRR), Rental Comps, Scenarios
 */
function generateRentalAnalysis(comps) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Rental Analysis");
  if (!sheet) return PlatformLogger.error("❌ Rental Analysis sheet not found.");

  sheet.clearContents();

  // Title and timestamp - using standardized header formatting
  const titleRange = sheet.getRange("A1");
  titleRange.setValue("Rental Analysis Report");
  styleHeader(titleRange, 'h1');
  titleRange.setBackground("#1a73e8");
  titleRange.setFontColor("white");

  sheet.getRange("A2").setValue("Generated: " + new Date().toLocaleString())
    .setFontSize(9)
    .setFontColor("#666666");

  // Get input values using dynamic field mapping
  const purchasePrice = getField("purchasePrice", 0);
  const downPaymentPct = getField("downPayment", 20) / 100;
  const interestRate = getField("loanInterestRate", 7) / 100;
  const loanTerm = getField("loanTerm", 30);
  const cashInvestment = getField("cashInvestment", 0);
  const helocAmount = getField("helocAmount", 0);
  const helocInterest = getField("helocInterest", 0.07);
  const rehabCost = getField("rehabCost", 0);
  const rentEstimate = getField("rentEstimate", 3500);

  // Phase 3: Configurable rental parameters
  const vacancyRate = getField("vacancyRate", 6) / 100; // Default 6%
  const maintenanceRate = getField("maintenanceRate", 1) / 100; // Default 1% of property value
  const propertyManagementRate = getField("propertyManagementRate", 8) / 100; // Default 8%
  const includePropertyManagement = getField("includePropertyManagement", "Yes");
  const hoaFees = getField("hoaFees", 0);
  const utilitiesCost = getField("utilitiesCost", 0);

  const propertyTaxRate = getField("propertyTaxRate", 0.0125);
  const insuranceMonthly = getField("insuranceMonthly", 100);

  const downPayment = purchasePrice * downPaymentPct;
  const loanAmount = purchasePrice - downPayment;
  const monthlyRate = interestRate / 12;
  const monthlyPI = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm * 12));
  const helocMonthlyInterest = (helocAmount * helocInterest) / 12;
  const totalCashDeployed = downPayment + cashInvestment + rehabCost;
  let row = 4;

  // === Section 1: As-Is Rental ===
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue("Part 1 – As-Is Rental")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;
  const asIsStartRow = row;

  // Annual calculations
  const grossIncome = rentEstimate * 12;
  const vacancyLoss = grossIncome * vacancyRate;
  const effectiveGrossIncome = grossIncome - vacancyLoss;

  // Operating expenses (annual) - Phase 3: Using configurable rates
  const propertyTaxes = propertyTaxRate * purchasePrice;
  const insurance = insuranceMonthly * 12;
  const maintenance = purchasePrice * maintenanceRate; // Configurable maintenance rate
  const propertyManagement = includePropertyManagement === "Yes"
    ? effectiveGrossIncome * propertyManagementRate
    : 0; // Conditional property management
  const hoaFeesAnnual = hoaFees * 12;
  const utilitiesAnnual = utilitiesCost * 12;
  const totalOperatingExpenses = propertyTaxes + insurance + maintenance + propertyManagement + hoaFeesAnnual + utilitiesAnnual;

  // Net Operating Income (before debt service)
  const NOI = effectiveGrossIncome - totalOperatingExpenses;
  const capRate = NOI / purchasePrice; // Will be formatted as % later

  // Cash flow after debt service
  const annualDebtService = (monthlyPI + helocMonthlyInterest) * 12;
  const asIsAnnualCashFlow = NOI - annualDebtService;
  const asIsMonthlyCashFlow = asIsAnnualCashFlow / 12;
  const cocReturn = asIsAnnualCashFlow / totalCashDeployed; // Will be formatted as % later

  // DSCR (Debt Service Coverage Ratio) - Phase 2 Enhancement
  const DSCR = NOI / annualDebtService;

  // Return on Time Invested - Phase 2 Enhancement
  const monthsToFlip = getField("monthsToFlip", 6);
  const returnOnTime = (cocReturn * 100) / monthsToFlip; // ROI per month

  const asIsData = [
    ["Purchase Price", purchasePrice],
    ["Monthly Rent (Est.)", rentEstimate],
    ["", ""], // Spacer
    ["Net Operating Income (NOI)", NOI],
    ["Annual Debt Service", annualDebtService],
    ["", ""], // Spacer
    ["Cap Rate (%)", capRate],
    ["Cash-on-Cash Return (%)", cocReturn],
    ["DSCR (Debt Service Coverage)", DSCR],
    ["Return on Time (% per month)", returnOnTime / 100],
    ["HELOC Monthly Interest ($)", helocMonthlyInterest]
  ];

  sheet.getRange(row, 1, asIsData.length, 2).setValues(asIsData);
  sheet.getRange(row, 1, asIsData.length, 1).setFontWeight("bold").setHorizontalAlignment("left");
  sheet.getRange(row, 2, asIsData.length, 1).setHorizontalAlignment("right");

  // Highlight key metrics
  sheet.getRange(row + 3, 1, 1, 2).setBackground("#fff9e6"); // NOI
  sheet.getRange(row + 7, 1, 1, 2).setBackground("#d1ecf1"); // Cash-on-Cash Return

  row += asIsData.length + 2;

  // === Section 2: After-Flip (BRRRR) ===
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue("Part 2 – After-Flip (BRRRR)")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;
  const brrrrStartRow = row;

  // Get ARV from Flip Analysis - look for the ARV value in the Profit & ROI section
  const flipSheet = ss.getSheetByName("Flip Analysis");
  let ARV = purchasePrice * 1.1; // Default fallback
  if (flipSheet) {
    // Search for ARV in Flip Analysis sheet
    const flipData = flipSheet.getDataRange().getValues();
    for (let i = 0; i < flipData.length; i++) {
      if (flipData[i][0] && flipData[i][0].toString().includes("After Repair Value")) {
        ARV = flipData[i][1] || ARV;
        break;
      }
    }
  }
  const newRent = rentEstimate * 1.15;

  // BRRRR calculations (after renovation)
  const newGrossIncome = newRent * 12;
  const newVacancyLoss = newGrossIncome * vacancyRate;
  const newEffectiveGrossIncome = newGrossIncome - newVacancyLoss;

  const newTaxes = propertyTaxRate * ARV;
  const newInsurance = insurance * 1.1;
  const newMaintenance = ARV * maintenanceRate; // Configurable maintenance rate
  const newPropertyManagement = includePropertyManagement === "Yes"
    ? newEffectiveGrossIncome * propertyManagementRate
    : 0; // Conditional property management
  const newHoaFeesAnnual = hoaFees * 12;
  const newUtilitiesAnnual = utilitiesCost * 12;
  const newTotalOperatingExpenses = newTaxes + newInsurance + newMaintenance + newPropertyManagement + newHoaFeesAnnual + newUtilitiesAnnual;

  const newNOI = newEffectiveGrossIncome - newTotalOperatingExpenses;
  const newCapRate = newNOI / ARV; // Will be formatted as % later
  const newLoanAmount = ARV * (1 - downPaymentPct);
  const newMonthlyPI = (newLoanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm * 12));
  const newCashFlow = newNOI / 12 - newMonthlyPI - helocMonthlyInterest;
  const newCoC = (newCashFlow * 12) / totalCashDeployed; // Will be format in % later

  // DSCR for BRRRR - Phase 2 Enhancement
  const newAnnualDebtService = (newMonthlyPI + helocMonthlyInterest) * 12;
  const newDSCR = newNOI / newAnnualDebtService;

  // Return on Time Invested for BRRRR - Phase 2 Enhancement
  const newReturnOnTime = (newCoC * 100) / monthsToFlip;

  const brrrrData = [
    ["After Repair Value (ARV)", ARV],
    ["Post-Flip Monthly Rent (Est.)", newRent],
    ["", ""], // Spacer
    ["Net Operating Income (NOI)", newNOI],
    ["Annual Debt Service", newAnnualDebtService],
    ["", ""], // Spacer
    ["Cap Rate (%)", newCapRate],
    ["Cash-on-Cash Return (%)", newCoC],
    ["DSCR (Debt Service Coverage)", newDSCR],
    ["Return on Time (% per month)", newReturnOnTime / 100]
  ];

  sheet.getRange(row, 1, brrrrData.length, 2).setValues(brrrrData);
  sheet.getRange(row, 1, brrrrData.length, 1).setFontWeight("bold").setHorizontalAlignment("left");
  sheet.getRange(row, 2, brrrrData.length, 1).setHorizontalAlignment("right");

  // Highlight key metrics
  sheet.getRange(row + 3, 1, 1, 2).setBackground("#fff9e6"); // NOI
  sheet.getRange(row + 7, 1, 1, 2).setBackground("#d1ecf1"); // Cash-on-Cash Return

  row += brrrrData.length + 2;

  // === Section 3: Profit & ROI Analysis ===
  const profitROIStartRow = row;
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue("Profit & ROI Analysis")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  // Use the BRRRR cash-on-cash return as the ROI (already calculated above)
  const annualCashFlow = newCashFlow * 12;
  const profitData = [
    ["Annual Cash Flow ($)", annualCashFlow],
    ["ROI (%)", newCoC]
  ];
  sheet.getRange(row, 1, profitData.length, 2).setValues(profitData);
  sheet.getRange(row, 1, profitData.length, 1).setFontWeight("bold").setHorizontalAlignment("left");
  sheet.getRange(row, 2, profitData.length, 1).setHorizontalAlignment("right");

  // Highlight key metrics
  sheet.getRange(row, 1, 1, 2).setBackground("#d4edda"); // Annual Cash Flow
  sheet.getRange(row + 1, 1, 1, 2).setBackground("#d1ecf1"); // ROI

  row += profitData.length + 2;

  // === Section 4: Scenario Analysis ===
  const scenarioData = {
    baseARV: ARV,
    baseRehab: rehabCost,
    baseProfit: annualCashFlow,
    worstARV: ARV * 0.9,
    worstRehab: rehabCost * 1.2,
    worstProfit: annualCashFlow * 0.9,
    bestARV: ARV * 1.1,
    bestRehab: rehabCost * 0.9,
    bestProfit: annualCashFlow * 1.1
  };
  generateScenarios(sheet, row, scenarioData); // uses same layout as Flip Analysis

  // === Final Formatting ===
  const currencyNoDecimal = '"$"#,##0';
  const percentFormat = "0.00%";

  // Apply currency formatting to all monetary values in As-Is section
  sheet.getRange(asIsStartRow, 2).setNumberFormat(currencyNoDecimal); // Purchase Price
  sheet.getRange(asIsStartRow + 1, 2).setNumberFormat(currencyNoDecimal); // Monthly Rent
  sheet.getRange(asIsStartRow + 3, 2).setNumberFormat(currencyNoDecimal); // NOI
  sheet.getRange(asIsStartRow + 4, 2).setNumberFormat(currencyNoDecimal); // Annual Debt Service

  // Apply percentage formatting to As-Is section
  sheet.getRange(asIsStartRow + 6, 2).setNumberFormat(percentFormat); // Cap Rate
  sheet.getRange(asIsStartRow + 7, 2).setNumberFormat(percentFormat); // Cash-on-Cash Return
  sheet.getRange(asIsStartRow + 8, 2).setNumberFormat("0.00"); // DSCR
  sheet.getRange(asIsStartRow + 9, 2).setNumberFormat(percentFormat); // Return on Time
  sheet.getRange(asIsStartRow + 10, 2).setNumberFormat(currencyNoDecimal); // HELOC Interest

  // Apply currency formatting to BRRRR section
  sheet.getRange(brrrrStartRow, 2).setNumberFormat(currencyNoDecimal); // ARV
  sheet.getRange(brrrrStartRow + 1, 2).setNumberFormat(currencyNoDecimal); // Post-Flip Rent
  sheet.getRange(brrrrStartRow + 3, 2).setNumberFormat(currencyNoDecimal); // NOI
  sheet.getRange(brrrrStartRow + 4, 2).setNumberFormat(currencyNoDecimal); // Annual Debt Service

  // Apply percentage formatting to BRRRR section
  sheet.getRange(brrrrStartRow + 6, 2).setNumberFormat(percentFormat); // Cap Rate
  sheet.getRange(brrrrStartRow + 7, 2).setNumberFormat(percentFormat); // Cash-on-Cash Return
  sheet.getRange(brrrrStartRow + 8, 2).setNumberFormat("0.00"); // DSCR
  sheet.getRange(brrrrStartRow + 9, 2).setNumberFormat(percentFormat); // Return on Time

  // Apply formatting to Profit & ROI section
  sheet.getRange(profitROIStartRow + 1, 2).setNumberFormat(currencyNoDecimal); // Annual Cash Flow
  sheet.getRange(profitROIStartRow + 2, 2).setNumberFormat(percentFormat); // ROI

  // Set column widths
  sheet.setColumnWidth(1, 250);
  sheet.setColumnWidth(2, 150);
  sheet.setColumnWidth(3, 120);
  sheet.setColumnWidth(4, 120);

  PlatformLogger.success("✅ Rental Analysis with enhanced formatting completed.");
}

/**
 * Generate the Scenario Analysis section for a sheet.
 * Dynamically builds a clean, labeled section with proper formatting.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to write into.
 * @param {number} startRow - The row to begin writing at.
 * @param {Object} values - The data object with base/worst/best metrics.
 * @returns {number} - The next empty row after this section.
 */
function generateScenarios(sheet, startRow, values) {
  let row = startRow;

  // Title
  sheet.getRange(row, 1, 1, 4).merge()
    .setValue("Scenario Analysis")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row += 2;

  // Headers
  const headers = [["Scenario", "ARV ($)", "Rehab Cost ($)", "Profit ($)"]];
  sheet.getRange(row, 1, 1, 4).setValues(headers);
  sheet.getRange(row, 1, 1, 4)
    .setFontWeight("bold")
    .setBackground("#d9e2f3")
    .setHorizontalAlignment("center")
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  // Rows
  const scenarios = [
    { name: "Base Case", color: "#ffffff", arv: values.baseARV, rehab: values.baseRehab, profit: values.baseProfit },
    { name: "Worst Case (ARV -10%, Rehab +20%)", color: "#fef3f3", arv: values.worstARV, rehab: values.worstRehab, profit: values.worstProfit },
    { name: "Best Case (ARV +10%, Rehab -10%)", color: "#f3fef6", arv: values.bestARV, rehab: values.bestRehab, profit: values.bestProfit },
  ];

  const scenarioStartRow = row;
  scenarios.forEach((s, index) => {
    const currentRow = row + index;
    sheet.getRange(currentRow, 1).setValue(s.name).setHorizontalAlignment("left");
    sheet.getRange(currentRow, 2).setValue(Math.round(s.arv)).setHorizontalAlignment("right");
    sheet.getRange(currentRow, 3).setValue(Math.round(s.rehab)).setHorizontalAlignment("right");
    sheet.getRange(currentRow, 4).setValue(Math.round(s.profit)).setHorizontalAlignment("right");
    sheet.getRange(currentRow, 1, 1, 4)
      .setBackground(s.color)
      .setBorder(true, true, true, true, false, false, "#cccccc", SpreadsheetApp.BorderStyle.SOLID);
  });

  // Apply currency formatting to numeric columns
  const currencyFormat = '"$"#,##0';
  sheet.getRange(scenarioStartRow, 2, scenarios.length, 3).setNumberFormat(currencyFormat);

  row += scenarios.length + 2;
  return row;
}

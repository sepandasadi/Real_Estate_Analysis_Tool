/**
 * Styling System for Real Estate Analysis Tool
 * Provides consistent color palette, formatting functions, and visual indicators
 * Phase 4: Dashboard & UX Improvements
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

const COLORS = {
  // Primary colors
  PRIMARY: '#1a73e8',      // Blue - main brand color
  SUCCESS: '#34a853',      // Green - positive values
  WARNING: '#fbbc04',      // Yellow - caution/warning
  DANGER: '#ea4335',       // Red - negative values

  // Background colors
  BACKGROUND: '#f7f9fc',   // Light gray - page background
  CARD: '#ffffff',         // White - card backgrounds
  BORDER: '#e0e0e0',       // Gray - borders and dividers

  // Text colors
  TEXT_PRIMARY: '#202124', // Dark gray - primary text
  TEXT_SECONDARY: '#5f6368', // Medium gray - secondary text
  TEXT_LIGHT: '#80868b',   // Light gray - tertiary text

  // Additional colors
  INFO: '#4285f4',         // Light blue - informational
  DARK: '#202124',         // Dark - headers
  LIGHT: '#f8f9fa'         // Very light gray - subtle backgrounds
};

// ============================================================================
// NUMBER FORMATS
// ============================================================================

const FORMATS = {
  CURRENCY: '$#,##0.00',
  CURRENCY_NO_CENTS: '$#,##0',
  PERCENTAGE: '0.00%',
  PERCENTAGE_ONE_DECIMAL: '0.0%',
  NUMBER: '#,##0',
  NUMBER_ONE_DECIMAL: '#,##0.0',
  DATE: 'MM/DD/YYYY',
  DATETIME: 'MM/DD/YYYY HH:MM'
};

// ============================================================================
// VISUAL INDICATORS
// ============================================================================

const INDICATORS = {
  SUCCESS: '✓',
  ERROR: '✗',
  WARNING: '⚠️',
  INFO: 'ℹ️',
  UP_ARROW: '📈',
  DOWN_ARROW: '📉',
  STAR: '⭐',
  CHECK: '✅',
  CROSS: '❌',
  CAUTION: '⚠️'
};

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

/**
 * Apply conditional formatting based on positive/negative value
 * @param {number} value - The value to format
 * @param {Range} cell - The cell to apply formatting to
 * @param {boolean} reverseColors - If true, negative is green (for expenses)
 */
function formatPositiveNegative(value, cell, reverseColors = false) {
  if (!cell) return;

  const isPositive = value >= 0;
  const color = reverseColors
    ? (isPositive ? COLORS.DANGER : COLORS.SUCCESS)
    : (isPositive ? COLORS.SUCCESS : COLORS.DANGER);

  cell.setFontColor(color);
  cell.setFontWeight('bold');
}

/**
 * Apply conditional formatting based on threshold
 * @param {number} value - The value to check
 * @param {Range} cell - The cell to apply formatting to
 * @param {Object} thresholds - Object with good, warning, bad thresholds
 */
function formatThreshold(value, cell, thresholds) {
  if (!cell) return;

  const { good, warning, bad } = thresholds;
  let color = COLORS.TEXT_PRIMARY;

  if (value >= good) {
    color = COLORS.SUCCESS;
  } else if (value >= warning) {
    color = COLORS.WARNING;
  } else if (bad !== undefined && value < bad) {
    color = COLORS.DANGER;
  }

  cell.setFontColor(color);
  cell.setFontWeight('bold');
}

/**
 * Apply formatting based on deal quality score (0-100)
 * @param {number} score - The quality score (0-100)
 * @param {Range} cell - The cell to apply formatting to
 */
function formatDealQuality(score, cell) {
  if (!cell) return;

  let color = COLORS.DANGER;
  if (score >= 80) {
    color = COLORS.SUCCESS;
  } else if (score >= 60) {
    color = COLORS.INFO;
  } else if (score >= 40) {
    color = COLORS.WARNING;
  }

  cell.setFontColor(color);
  cell.setFontWeight('bold');
}

/**
 * Format a cell as currency
 * @param {Range} cell - The cell to format
 * @param {boolean} noCents - If true, don't show cents
 */
function formatCurrency(cell, noCents = false) {
  if (!cell) return;
  cell.setNumberFormat(noCents ? FORMATS.CURRENCY_NO_CENTS : FORMATS.CURRENCY);
}

/**
 * Format a cell as percentage
 * @param {Range} cell - The cell to format
 * @param {boolean} oneDecimal - If true, show only one decimal place
 */
function formatPercentage(cell, oneDecimal = false) {
  if (!cell) return;
  cell.setNumberFormat(oneDecimal ? FORMATS.PERCENTAGE_ONE_DECIMAL : FORMATS.PERCENTAGE);
}

/**
 * Format a cell as a number with commas
 * @param {Range} cell - The cell to format
 * @param {boolean} oneDecimal - If true, show one decimal place
 */
function formatNumber(cell, oneDecimal = false) {
  if (!cell) return;
  cell.setNumberFormat(oneDecimal ? FORMATS.NUMBER_ONE_DECIMAL : FORMATS.NUMBER);
}

/**
 * Format a cell as a date
 * @param {Range} cell - The cell to format
 * @param {boolean} includeTime - If true, include time
 */
function formatDate(cell, includeTime = false) {
  if (!cell) return;
  cell.setNumberFormat(includeTime ? FORMATS.DATETIME : FORMATS.DATE);
}

// ============================================================================
// CELL STYLING FUNCTIONS
// ============================================================================

/**
 * Style a cell as a header
 * @param {Range} cell - The cell to style
 * @param {string} level - 'h1', 'h2', or 'h3'
 */
function styleHeader(cell, level = 'h1') {
  if (!cell) return;

  const styles = {
    h1: { size: 16, bold: true, color: COLORS.DARK },
    h2: { size: 14, bold: true, color: COLORS.DARK },
    h3: { size: 12, bold: true, color: COLORS.TEXT_PRIMARY }
  };

  const style = styles[level] || styles.h1;
  cell.setFontSize(style.size);
  cell.setFontWeight(style.bold ? 'bold' : 'normal');
  cell.setFontColor(style.color);
}

/**
 * Style a cell as a card (with background and border)
 * @param {Range} cell - The cell to style
 * @param {string} backgroundColor - Background color (default: CARD)
 */
function styleCard(cell, backgroundColor = COLORS.CARD) {
  if (!cell) return;

  cell.setBackground(backgroundColor);
  cell.setBorder(true, true, true, true, false, false, COLORS.BORDER, SpreadsheetApp.BorderStyle.SOLID);
}

/**
 * Style a range as a section with header
 * @param {Range} headerCell - The header cell
 * @param {Range} contentRange - The content range
 */
function styleSection(headerCell, contentRange) {
  if (headerCell) {
    styleHeader(headerCell, 'h2');
    headerCell.setBackground(COLORS.LIGHT);
  }

  if (contentRange) {
    contentRange.setBorder(true, true, true, true, false, false, COLORS.BORDER, SpreadsheetApp.BorderStyle.SOLID);
  }
}

/**
 * Apply alternating row colors to a range
 * @param {Range} range - The range to apply banding to
 */
function applyBanding(range) {
  if (!range) return;

  const banding = range.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
  banding.setFirstRowColor(COLORS.LIGHT);
  banding.setSecondRowColor(COLORS.CARD);
  banding.setHeaderRowColor(COLORS.PRIMARY);
  banding.setFooterRowColor(null);
}

// ============================================================================
// METRIC CARD FUNCTIONS
// ============================================================================

/**
 * Create a styled metric card
 * @param {Sheet} sheet - The sheet to create the card on
 * @param {number} row - Starting row
 * @param {number} col - Starting column
 * @param {string} label - The metric label
 * @param {any} value - The metric value
 * @param {string} format - The format type ('currency', 'percentage', 'number')
 * @param {string} indicator - Optional indicator icon
 * @returns {Object} - Object with labelCell and valueCell
 */
function createMetricCard(sheet, row, col, label, value, format = 'number', indicator = null) {
  // Merge cells for card
  const cardRange = sheet.getRange(row, col, 3, 2);
  styleCard(cardRange, COLORS.CARD);

  // Label
  const labelCell = sheet.getRange(row, col, 1, 2);
  labelCell.merge();
  labelCell.setValue(label);
  labelCell.setFontSize(10);
  labelCell.setFontColor(COLORS.TEXT_SECONDARY);
  labelCell.setHorizontalAlignment('center');

  // Value
  const valueCell = sheet.getRange(row + 1, col, 1, 2);
  valueCell.merge();
  valueCell.setValue(value);
  valueCell.setFontSize(18);
  valueCell.setFontWeight('bold');
  valueCell.setHorizontalAlignment('center');

  // Apply format
  switch (format) {
    case 'currency':
      formatCurrency(valueCell);
      break;
    case 'percentage':
      formatPercentage(valueCell);
      break;
    case 'number':
      formatNumber(valueCell);
      break;
  }

  // Indicator
  if (indicator) {
    const indicatorCell = sheet.getRange(row + 2, col, 1, 2);
    indicatorCell.merge();
    indicatorCell.setValue(indicator);
    indicatorCell.setFontSize(12);
    indicatorCell.setHorizontalAlignment('center');
  }

  return { labelCell, valueCell, cardRange };
}

// ============================================================================
// BUTTON STYLING
// ============================================================================

/**
 * Style a cell as a button
 * @param {Range} cell - The cell to style as a button
 * @param {string} label - Button label
 * @param {string} color - Button color (default: PRIMARY)
 */
function styleButton(cell, label, color = COLORS.PRIMARY) {
  if (!cell) return;

  cell.setValue(label);
  cell.setBackground(color);
  cell.setFontColor(COLORS.CARD);
  cell.setFontWeight('bold');
  cell.setHorizontalAlignment('center');
  cell.setVerticalAlignment('middle');
  cell.setBorder(true, true, true, true, false, false, color, SpreadsheetApp.BorderStyle.SOLID);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get color based on value and thresholds
 * @param {number} value - The value to check
 * @param {Object} thresholds - Object with good, warning, bad thresholds
 * @returns {string} - Color hex code
 */
function getColorForValue(value, thresholds) {
  const { good, warning, bad } = thresholds;

  if (value >= good) {
    return COLORS.SUCCESS;
  } else if (value >= warning) {
    return COLORS.WARNING;
  } else if (bad !== undefined && value < bad) {
    return COLORS.DANGER;
  }

  return COLORS.TEXT_PRIMARY;
}

/**
 * Get indicator icon based on value
 * @param {number} value - The value to check
 * @param {boolean} higherIsBetter - If true, higher values get success indicator
 * @returns {string} - Indicator icon
 */
function getIndicatorForValue(value, higherIsBetter = true) {
  if (value === 0) return '';

  if (higherIsBetter) {
    return value > 0 ? INDICATORS.SUCCESS : INDICATORS.ERROR;
  } else {
    return value < 0 ? INDICATORS.SUCCESS : INDICATORS.ERROR;
  }
}

/**
 * Clear all formatting from a range
 * @param {Range} range - The range to clear
 */
function clearFormatting(range) {
  if (!range) return;

  range.setBackground(null);
  range.setFontColor(null);
  range.setFontWeight('normal');
  range.setBorder(false, false, false, false, false, false);
}

// ============================================================================
// EXPORTS
// ============================================================================

// Make functions available globally
if (typeof global !== 'undefined') {
  global.COLORS = COLORS;
  global.FORMATS = FORMATS;
  global.INDICATORS = INDICATORS;
  global.formatPositiveNegative = formatPositiveNegative;
  global.formatThreshold = formatThreshold;
  global.formatDealQuality = formatDealQuality;
  global.formatCurrency = formatCurrency;
  global.formatPercentage = formatPercentage;
  global.formatNumber = formatNumber;
  global.formatDate = formatDate;
  global.styleHeader = styleHeader;
  global.styleCard = styleCard;
  global.styleSection = styleSection;
  global.applyBanding = applyBanding;
  global.createMetricCard = createMetricCard;
  global.styleButton = styleButton;
  global.getColorForValue = getColorForValue;
  global.getIndicatorForValue = getIndicatorForValue;
  global.clearFormatting = clearFormatting;
}

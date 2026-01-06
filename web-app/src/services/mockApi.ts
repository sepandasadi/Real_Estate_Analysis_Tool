/**
 * Mock API Service for Local Development
 * Use this to test the UI without backend connection
 */

import { PropertyFormData } from '../types/property';
import { ApiResponse, ApiUsageData } from './api';

// Initial usage data
const INITIAL_USAGE = {
  privateZillow: { used: 42, limit: 250, remaining: 208 },
  usRealEstate: { used: 87, limit: 300, remaining: 213 },
  redfin: { used: 23, limit: 111, remaining: 88 },
  gemini: { used: 312, limit: 1500, remaining: 1188 }
};

/**
 * Get current usage from localStorage or initialize
 */
function getCurrentUsage() {
  const stored = localStorage.getItem('mock_api_usage');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { ...INITIAL_USAGE };
    }
  }
  return { ...INITIAL_USAGE };
}

/**
 * Save usage to localStorage
 */
function saveUsage(usage: typeof INITIAL_USAGE) {
  localStorage.setItem('mock_api_usage', JSON.stringify(usage));
}

/**
 * Simulate API call usage (decrements remaining count)
 */
function simulateApiUsage(apiName: keyof typeof INITIAL_USAGE, callCount: number = 1) {
  const usage = getCurrentUsage();
  if (usage[apiName].remaining >= callCount) {
    usage[apiName].remaining -= callCount;
    usage[apiName].used += callCount;
  }
  saveUsage(usage);
}

/**
 * Reset mock API usage to initial values (for testing)
 */
export function resetMockApiUsage() {
  localStorage.removeItem('mock_api_usage');
}

/**
 * Force clear all API-related localStorage (including old cached data)
 */
export function clearAllApiCache() {
  // Clear mock usage
  localStorage.removeItem('mock_api_usage');

  // Clear any old API cache keys that might exist
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('api_usage') || key.includes('_usage'))) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Mock API usage data
 */
export async function getMockApiUsage(): Promise<ApiResponse<ApiUsageData>> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const usage = getCurrentUsage();

  return {
    success: true,
    data: {
      privateZillow: {
        ...usage.privateZillow,
        period: 'month',
        resetDate: '2026-02-01'
      },
      usRealEstate: {
        ...usage.usRealEstate,
        period: 'month',
        resetDate: '2026-02-01'
      },
      redfin: {
        ...usage.redfin,
        period: 'month',
        resetDate: '2026-02-01'
      },
      gemini: {
        ...usage.gemini,
        period: 'day',
        resetDate: '2026-01-06'
      }
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Mock property analysis
 */
export async function mockAnalyzeProperty(data: PropertyFormData): Promise<ApiResponse> {
  // Simulate API calls based on analysis mode
  if (data.analysisMode === 'DEEP') {
    // Deep analysis uses multiple APIs
    simulateApiUsage('privateZillow', 2); // Property details + comps
    simulateApiUsage('usRealEstate', 3);  // Similar homes + rental comps + schools
    simulateApiUsage('redfin', 1);        // Additional market data
    simulateApiUsage('gemini', 2);        // AI insights
  } else {
    // Basic analysis uses fewer calls
    simulateApiUsage('privateZillow', 1); // Property details
    simulateApiUsage('usRealEstate', 1);  // Basic data
    simulateApiUsage('gemini', 1);        // Basic AI
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const purchasePrice = data.purchasePrice;
  const rehabCost = data.rehabCost || 0;
  const monthlyRent = purchasePrice * 0.01; // Backend calculates rent estimate
  const downPaymentPercent = data.downPayment || 25;
  const downPayment = purchasePrice * (downPaymentPercent / 100);
  const loanInterestRate = data.loanInterestRate || 7.0;
  const loanTerm = data.loanTerm || 30;
  const monthsToFlip = data.monthsToFlip || 6;

  // Rental calculations
  const loanAmount = purchasePrice - downPayment;
  const monthlyRate = loanInterestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

  // Backend calculates these values
  const propertyTax = purchasePrice * 0.012 / 12;
  const insurance = purchasePrice * 0.005 / 12;
  const maintenance = monthlyRent * 0.10;
  const vacancy = monthlyRent * 0.08;
  const hoaFees = 0;

  const totalExpenses = monthlyPayment + propertyTax + insurance + maintenance + vacancy + hoaFees;
  const cashFlow = monthlyRent - totalExpenses;
  const annualNOI = (monthlyRent * 12) - ((propertyTax + insurance + maintenance + vacancy + hoaFees) * 12);
  const capRate = (annualNOI / purchasePrice) * 100;
  const cashOnCashReturn = ((cashFlow * 12) / downPayment) * 100;

  // Mock comparable properties with realistic data and condition indicators
  const comps = [
    {
      address: '125 Main St',
      city: data.city,
      state: data.state,
      zip: data.zip,
      price: purchasePrice * 1.25,
      beds: 3,
      baths: 2,
      sqft: 1500,
      yearBuilt: 1985,
      saleDate: '10/15/2024',
      distance: 0.1,
      propertyUrl: 'https://www.zillow.com',
      condition: 'remodeled',
      dataSource: 'zillow',
      isReal: true
    },
    {
      address: '130 Oak Ave',
      city: data.city,
      state: data.state,
      zip: data.zip,
      price: purchasePrice * 1.22,
      beds: 3,
      baths: 2,
      sqft: 1450,
      yearBuilt: 1980,
      saleDate: '09/22/2024',
      distance: 0.2,
      propertyUrl: 'https://www.zillow.com',
      condition: 'remodeled',
      dataSource: 'zillow',
      isReal: true
    },
    {
      address: '142 Elm St',
      city: data.city,
      state: data.state,
      zip: data.zip,
      price: purchasePrice * 1.28,
      beds: 4,
      baths: 2.5,
      sqft: 1650,
      yearBuilt: 1990,
      saleDate: '10/01/2024',
      distance: 0.3,
      propertyUrl: 'https://www.zillow.com',
      condition: 'remodeled',
      dataSource: 'zillow',
      isReal: true
    },
    {
      address: '156 Pine Dr',
      city: data.city,
      state: data.state,
      zip: data.zip,
      price: purchasePrice * 1.02,
      beds: 3,
      baths: 2,
      sqft: 1480,
      yearBuilt: 1982,
      saleDate: '08/10/2024',
      distance: 0.4,
      propertyUrl: 'https://www.zillow.com',
      condition: 'unremodeled',
      dataSource: 'zillow',
      isReal: true
    }
  ];

  // Smart ARV Calculation (matching Google Sheets logic)
  const remodeledComps = comps.filter(c => c.condition === 'remodeled');
  const unremodeledComps = comps.filter(c => c.condition === 'unremodeled');

  let arv = 0;
  let arvCalculationMethod = '';

  if (remodeledComps.length >= 3) {
    // Best case: 3+ remodeled comps - use average with 0% premium
    const avgRemodeled = remodeledComps.reduce((sum, c) => sum + c.price, 0) / remodeledComps.length;
    arv = avgRemodeled;
    arvCalculationMethod = `Average of ${remodeledComps.length} remodeled comps (0% premium)`;
  } else if (remodeledComps.length > 0 && unremodeledComps.length > 0) {
    // Mixed case: Calculate renovation premium, cap at 25%
    const avgRemodeled = remodeledComps.reduce((sum, c) => sum + c.price, 0) / remodeledComps.length;
    const avgUnremodeled = unremodeledComps.reduce((sum, c) => sum + c.price, 0) / unremodeledComps.length;
    const renovationPremium = avgRemodeled / avgUnremodeled;
    const cappedPremium = Math.min(renovationPremium, 1.25);
    arv = avgUnremodeled * cappedPremium;
    arvCalculationMethod = `${remodeledComps.length} remodeled + ${unremodeledComps.length} unremodeled comps (${((cappedPremium - 1) * 100).toFixed(1)}% premium, capped at 25%)`;
  } else if (unremodeledComps.length >= 3) {
    // Only unremodeled comps: Apply 25% premium
    const avgUnremodeled = unremodeledComps.reduce((sum, c) => sum + c.price, 0) / unremodeledComps.length;
    arv = avgUnremodeled * 1.25;
    arvCalculationMethod = `Average of ${unremodeledComps.length} unremodeled comps + 25% renovation premium`;
  } else {
    // Fallback: Use all comps with 20% premium
    const avgAll = comps.reduce((sum, c) => sum + c.price, 0) / comps.length;
    arv = avgAll * 1.20;
    arvCalculationMethod = `Average of ${comps.length} mixed comps + 20% premium`;
  }

  // Flip calculations with calculated ARV
  const totalInvestment = purchasePrice + rehabCost;
  const sellingCosts = arv * 0.08;
  const netProfit = arv - totalInvestment - sellingCosts;
  const roi = (netProfit / totalInvestment) * 100;

  // Calculate score based on ROI and rental metrics
  let score = 0;
  if (roi > 20) score += 25;
  else if (roi > 15) score += 20;
  else if (roi > 10) score += 15;

  if (cashFlow > 500) score += 25;
  else if (cashFlow > 300) score += 20;
  else if (cashFlow > 100) score += 15;

  if (capRate > 8) score += 25;
  else if (capRate > 6) score += 20;
  else if (capRate > 4) score += 15;

  if (cashOnCashReturn > 12) score += 25;
  else if (cashOnCashReturn > 8) score += 20;
  else if (cashOnCashReturn > 5) score += 15;

  let stars = 0;
  if (score >= 90) stars = 5;
  else if (score >= 75) stars = 4;
  else if (score >= 60) stars = 3;
  else if (score >= 45) stars = 2;
  else if (score >= 30) stars = 1;

  const rating = stars >= 4 ? 'Excellent' : stars >= 3 ? 'Good' : stars >= 2 ? 'Fair' : 'Poor';

  // Generate alerts
  const alerts = [];
  if (roi < 10) {
    alerts.push({
      type: 'warning' as const,
      category: 'flip',
      message: 'Low flip ROI - Consider negotiating purchase price or reducing rehab costs'
    });
  }
  if (cashFlow < 100) {
    alerts.push({
      type: 'warning' as const,
      category: 'rental',
      message: 'Low monthly cash flow - Property may not be sustainable as rental'
    });
  }
  if (capRate < 5) {
    alerts.push({
      type: 'warning' as const,
      category: 'rental',
      message: 'Low cap rate - Consider other investment opportunities'
    });
  }
  if (roi > 25) {
    alerts.push({
      type: 'info' as const,
      category: 'flip',
      message: 'Exceptional flip opportunity - Verify ARV estimate with recent comps'
    });
  }

  // Generate insights
  const insights = [];
  if (roi > 20) {
    insights.push({
      type: 'positive' as const,
      category: 'flip',
      message: 'Excellent flip opportunity with strong ROI potential'
    });
  }
  if (cashFlow > 500) {
    insights.push({
      type: 'positive' as const,
      category: 'rental',
      message: 'Strong rental cash flow - Good long-term hold candidate'
    });
  }
  if (roi > 15 && cashFlow > 300) {
    insights.push({
      type: 'positive' as const,
      category: 'strategy',
      message: 'Consider BRRRR strategy - Property shows potential for both flip and rental'
    });
  }
  if (capRate > 8) {
    insights.push({
      type: 'positive' as const,
      category: 'rental',
      message: 'High cap rate indicates strong income potential relative to purchase price'
    });
  }

  return {
    success: true,
    data: {
      property: {
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip
      },
      comps: comps,
      arvCalculationMethod, // Add transparency about ARV calculation
      flip: {
        purchasePrice,
        rehabCost,
        arv,
        totalInvestment,
        sellingCosts,
        netProfit,
        roi,
        holdingMonths: monthsToFlip,
        timeline: `${monthsToFlip} months`
      },
      rental: {
        purchasePrice,
        downPayment,
        loanAmount,
        monthlyRent,
        monthlyPayment,
        propertyTax,
        insurance,
        maintenance,
        vacancy,
        totalExpenses,
        cashFlow,
        capRate,
        cashOnCashReturn
      },
      score: {
        score,
        stars,
        rating
      },
      alerts,
      insights
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Mock API Service for Local Development
 * Use this to test the UI without backend connection
 */

import { PropertyFormData } from '../types/property';
import { ApiResponse, ApiUsageData } from './api';

/**
 * Mock API usage data
 */
export async function getMockApiUsage(): Promise<ApiResponse<ApiUsageData>> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    success: true,
    data: {
      zillow: {
        used: 15,
        limit: 100,
        remaining: 85,
        period: 'monthly',
        resetDate: '2025-11-30'
      },
      usRealEstate: {
        used: 8,
        limit: 100,
        remaining: 92,
        period: 'monthly',
        resetDate: '2025-11-30'
      },
      gemini: {
        used: 45,
        limit: 1500,
        remaining: 1455,
        period: 'daily',
        resetDate: '2025-11-16'
      }
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Mock property analysis
 */
export async function mockAnalyzeProperty(data: PropertyFormData): Promise<ApiResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const purchasePrice = data.purchasePrice;
  const rehabCost = data.rehabCost || 0;
  const arv = data.arv || purchasePrice * 1.3;
  const monthlyRent = data.monthlyRent || purchasePrice * 0.01;
  const downPayment = data.downPayment || purchasePrice * 0.25;
  const interestRate = data.interestRate || 7.0;
  const loanTerm = data.loanTerm || 30;
  const holdingMonths = data.holdingMonths || 6;

  // Flip calculations
  const totalInvestment = purchasePrice + rehabCost;
  const sellingCosts = arv * 0.08;
  const netProfit = arv - totalInvestment - sellingCosts;
  const roi = (netProfit / totalInvestment) * 100;

  // Rental calculations
  const loanAmount = purchasePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

  const propertyTax = data.propertyTax || (purchasePrice * 0.012 / 12);
  const insurance = data.insurance || (purchasePrice * 0.005 / 12);
  const maintenance = data.maintenance || (monthlyRent * 0.10);
  const vacancy = data.vacancy || (monthlyRent * 0.08);
  const hoaFees = data.hoaFees || 0;

  const totalExpenses = monthlyPayment + propertyTax + insurance + maintenance + vacancy + hoaFees;
  const cashFlow = monthlyRent - totalExpenses;
  const annualNOI = (monthlyRent * 12) - ((propertyTax + insurance + maintenance + vacancy + hoaFees) * 12);
  const capRate = (annualNOI / purchasePrice) * 100;
  const cashOnCashReturn = ((cashFlow * 12) / downPayment) * 100;

  // Calculate score
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

  // Mock comparable properties
  const comps = [
    {
      address: '125 Main St',
      city: data.city,
      state: data.state,
      zip: data.zip,
      price: purchasePrice * 1.05,
      beds: 3,
      baths: 2,
      sqft: 1500,
      yearBuilt: 1985,
      saleDate: '10/15/2024',
      distance: 0.1,
      propertyUrl: 'https://www.zillow.com'
    },
    {
      address: '130 Oak Ave',
      city: data.city,
      state: data.state,
      zip: data.zip,
      price: purchasePrice * 0.95,
      beds: 3,
      baths: 2,
      sqft: 1450,
      yearBuilt: 1980,
      saleDate: '09/22/2024',
      distance: 0.2,
      propertyUrl: 'https://www.zillow.com'
    },
    {
      address: '142 Elm St',
      city: data.city,
      state: data.state,
      zip: data.zip,
      price: purchasePrice * 1.1,
      beds: 4,
      baths: 2.5,
      sqft: 1650,
      yearBuilt: 1990,
      saleDate: '10/01/2024',
      distance: 0.3,
      propertyUrl: 'https://www.zillow.com'
    }
  ];

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
      flip: {
        purchasePrice,
        rehabCost,
        arv,
        totalInvestment,
        sellingCosts,
        netProfit,
        roi,
        holdingMonths,
        timeline: `${holdingMonths} months`
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

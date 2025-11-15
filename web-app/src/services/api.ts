/**
 * API Service Layer
 * Handles all communication with Google Apps Script backend
 */

const API_URL = import.meta.env.VITE_API_URL || '';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PropertyData {
  address: string;
  city: string;
  state: string;
  zip: string;
  purchasePrice: number;
  rehabCost?: number;
  arv?: number;
  monthlyRent?: number;
  downPayment?: number;
  interestRate?: number;
  loanTerm?: number;
  holdingMonths?: number;
}

export interface ApiUsageData {
  zillow: {
    used: number;
    limit: number;
    remaining: number;
    period: string;
    resetDate: string;
  };
  usRealEstate: {
    used: number;
    limit: number;
    remaining: number;
    period: string;
    resetDate: string;
  };
  gemini: {
    used: number;
    limit: number;
    remaining: number;
    period: string;
    resetDate: string;
  };
}

/**
 * Make API request to Google Apps Script backend
 */
async function makeRequest<T>(action: string, data: any = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        data,
      }),
      redirect: 'follow', // Important for Google Apps Script redirects
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Health check - test API connection
 */
export async function healthCheck(): Promise<{ status: string; message: string; version: string }> {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}

/**
 * Get API usage statistics
 */
export async function getApiUsage(): Promise<ApiResponse<ApiUsageData>> {
  return makeRequest<ApiUsageData>('getApiUsage', {});
}

/**
 * Fetch comparable properties
 */
export async function fetchComps(data: PropertyData, forceRefresh: boolean = false) {
  return makeRequest('fetchComps', { ...data, forceRefresh });
}

/**
 * Calculate flip analysis
 */
export async function calculateFlip(data: PropertyData) {
  return makeRequest('calculateFlip', data);
}

/**
 * Calculate rental analysis
 */
export async function calculateRental(data: PropertyData) {
  return makeRequest('calculateRental', data);
}

/**
 * Full property analysis (comps + flip + rental + score + alerts + insights)
 */
export async function analyzeProperty(data: PropertyData) {
  return makeRequest('analyze', data);
}

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
  downPayment?: number;
  loanInterestRate?: number;
  loanTerm?: number;
  rehabCost?: number;
  monthsToFlip?: number;
  cashInvestment?: number;
  helocInterest?: number;
}

export interface ApiUsageData {
  privateZillow: {
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
  redfin: {
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
 * Uses text/plain to avoid CORS preflight issues
 */
async function makeRequest<T>(action: string, data: any = {}): Promise<ApiResponse<T>> {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/bde32f66-859e-484d-8409-cf1887350e6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:65',message:'makeRequest called',data:{action:action,apiUrl:API_URL},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F,G,H,I'})}).catch(()=>{});
    // #endregion

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain', // Use text/plain to avoid CORS preflight
      },
      body: JSON.stringify({
        action,
        data,
      }),
      redirect: 'follow', // Important for Google Apps Script redirects
    });

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/bde32f66-859e-484d-8409-cf1887350e6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:84',message:'Response received',data:{action:action,status:response.status,ok:response.ok,statusText:response.statusText,url:response.url,redirected:response.redirected},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F,G,H,I'})}).catch(()=>{});
    // #endregion

    if (!response.ok) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/bde32f66-859e-484d-8409-cf1887350e6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:89',message:'Response not OK',data:{action:action,status:response.status,statusText:response.statusText},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F,G'})}).catch(()=>{});
      // #endregion
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/bde32f66-859e-484d-8409-cf1887350e6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:96',message:'JSON parsed successfully',data:{action:action,success:result.success},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'G'})}).catch(()=>{});
    // #endregion

    return result;
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/bde32f66-859e-484d-8409-cf1887350e6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:101',message:'Request failed with error',data:{action:action,errorType:error?.constructor?.name,errorMessage:error instanceof Error ? error.message : String(error),errorStack:error instanceof Error ? error.stack : undefined},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F,G,H,I'})}).catch(()=>{});
    // #endregion

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
    throw error;
  }
}

/**
 * Get API usage statistics from backend
 */
export async function getApiUsage(): Promise<ApiResponse<ApiUsageData>> {
  const response = await makeRequest<ApiUsageData>('getApiUsage', {});

  // Ensure response has proper structure with defaults
  if (response.success && response.data) {
    const data = response.data as any;

    // Correct limit values (define expected limits per API subscription)
    const CORRECT_LIMITS = {
      privateZillow: 250,
      usRealEstate: 300,
      redfin: 111,
      gemini: 1500
    };

    // Helper function to validate and correct usage data
    const validateUsageData = (usageData: any, expectedLimit: number) => {
      if (!usageData) return null;

      // If backend limit is wrong, correct it while preserving used/remaining
      if (usageData.limit !== expectedLimit) {
        return {
          used: usageData.used || 0,
          limit: expectedLimit,
          remaining: expectedLimit - (usageData.used || 0),
          period: usageData.period || 'month',
          resetDate: usageData.resetDate || 'Unknown'
        };
      }

      return usageData;
    };

    // Handle backward compatibility: map "zillow" to "privateZillow" if needed
    const privateZillowData = data.privateZillow || data.zillow;

    // Validate and correct each API's usage data
    const validatedPrivateZillow = validateUsageData(privateZillowData, CORRECT_LIMITS.privateZillow);
    const validatedUsRealEstate = validateUsageData(data.usRealEstate, CORRECT_LIMITS.usRealEstate);
    const validatedRedfin = validateUsageData(data.redfin, CORRECT_LIMITS.redfin);
    const validatedGemini = validateUsageData(data.gemini, CORRECT_LIMITS.gemini);

    // Apply validated data or defaults
    response.data = {
      privateZillow: validatedPrivateZillow || { used: 0, limit: CORRECT_LIMITS.privateZillow, remaining: CORRECT_LIMITS.privateZillow, period: 'month', resetDate: 'Unknown' },
      usRealEstate: validatedUsRealEstate || { used: 0, limit: CORRECT_LIMITS.usRealEstate, remaining: CORRECT_LIMITS.usRealEstate, period: 'month', resetDate: 'Unknown' },
      redfin: validatedRedfin || { used: 0, limit: CORRECT_LIMITS.redfin, remaining: CORRECT_LIMITS.redfin, period: 'month', resetDate: 'Unknown' },
      gemini: validatedGemini || { used: 0, limit: CORRECT_LIMITS.gemini, remaining: CORRECT_LIMITS.gemini, period: 'day', resetDate: 'Unknown' }
    };
  }

  return response;
}

/**
 * Get real-time API usage from cached headers (client-side)
 */
export async function getApiUsageRealtime(): Promise<ApiResponse<ApiUsageData>> {
  // Import QuotaManager dynamically to avoid circular dependencies
  const { QuotaManager } = await import('../adapters/coreAdapter');
  const usage = QuotaManager.getAllUsage();

  return {
    success: true,
    data: {
      privateZillow: usage.private_zillow
        ? {
            used: usage.private_zillow.used,
            limit: usage.private_zillow.limit,
            remaining: usage.private_zillow.remaining,
            period: 'month',
            resetDate: 'First of next month'
          }
        : { used: 0, limit: 250, remaining: 250, period: 'month', resetDate: 'Unknown' },
      usRealEstate: usage.us_real_estate
        ? {
            used: usage.us_real_estate.used,
            limit: usage.us_real_estate.limit,
            remaining: usage.us_real_estate.remaining,
            period: 'month',
            resetDate: 'First of next month'
          }
        : { used: 0, limit: 300, remaining: 300, period: 'month', resetDate: 'Unknown' },
      redfin: usage.redfin
        ? {
            used: usage.redfin.used,
            limit: usage.redfin.limit,
            remaining: usage.redfin.remaining,
            period: 'month',
            resetDate: 'First of next month'
          }
        : { used: 0, limit: 111, remaining: 111, period: 'month', resetDate: 'Unknown' },
      gemini: usage.gemini
        ? {
            used: usage.gemini.used,
            limit: usage.gemini.limit,
            remaining: usage.gemini.remaining,
            period: 'day',
            resetDate: 'Midnight tonight'
          }
        : { used: 0, limit: 1500, remaining: 1500, period: 'day', resetDate: 'Unknown' }
    },
    timestamp: new Date().toISOString()
  };
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

/**
 * Get backend cache diagnostics
 */
export async function getDiagnostics() {
  return makeRequest('diagnostics', {});
}

/**
 * Clear backend cache (comps and usage data)
 */
export async function clearBackendCache() {
  return makeRequest('clearCache', {});
}

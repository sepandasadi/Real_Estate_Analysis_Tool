/**
 * Property data types
 */

export interface PropertyFormData {
  // Property Details
  address: string;
  city: string;
  state: string;
  zip: string;

  // Purchase Information
  purchasePrice: number;
  downPayment?: number;

  // Loan Details
  loanInterestRate?: number;
  loanTerm?: number; // in years

  // Flip Analysis
  rehabCost?: number;
  monthsToFlip?: number;
  cashInvestment?: number;
  helocInterest?: number;
}

export interface PropertyAnalysisResult {
  property: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  comps?: ComparableProperty[];
  flip?: FlipAnalysis;
  rental?: RentalAnalysis;
  score?: DealScore;
  alerts?: Alert[];
  insights?: Insight[];
}

export interface ComparableProperty {
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  yearBuilt?: number;
  saleDate?: string;
  distance?: number;
  propertyUrl?: string;
  condition?: 'remodeled' | 'unremodeled' | 'unknown';
  // Phase 1.4: Enhanced comps with quality scoring and data source tracking
  dataSource?: 'zillow' | 'zillow_property_comps' | 'us_real_estate_similar_homes' | 'us_real_estate_targeted' | 'api' | 'gemini' | 'synthetic';
  isReal?: boolean;
  qualityScore?: number; // 95-100 for AI-matched, 90-94 for targeted, <90 for generic
}

export interface FlipAnalysis {
  purchasePrice: number;
  rehabCost: number;
  arv: number;
  totalInvestment: number;
  sellingCosts: number;
  netProfit: number;
  roi: number;
  holdingMonths: number;
  timeline: string;

  // Phase 1.5: Multi-source ARV calculation
  arvMethod?: string; // Description of calculation method used
  arvSources?: {
    comps?: number; // ARV from comps analysis (50% weight)
    zillow?: number; // Zillow Zestimate (25% weight)
    usRealEstate?: number; // US Real Estate estimate (25% weight)
  };
  confidenceScore?: number; // 0-100 confidence in ARV estimate

  // Phase 2.3: Historical validation and market context
  historicalValidation?: {
    isValid: boolean; // True if ARV passes validation checks
    deviation: number; // Percentage deviation from historical projection
    warnings: string[]; // Array of validation warnings
    historicalARV: number | null; // ARV based on historical appreciation
    marketTrend: 'hot' | 'rising' | 'stable' | 'declining' | 'unknown'; // Market trend classification
    trendEmoji: string; // Emoji indicator for market trend
    appreciationRate: number; // Annual appreciation rate (e.g., 0.05 for 5%)
  };
}

export interface RentalAnalysis {
  purchasePrice: number;
  downPayment: number;
  loanAmount: number;
  monthlyRent: number;
  monthlyPayment: number;
  propertyTax: number;
  insurance: number;
  maintenance: number;
  vacancy: number;
  totalExpenses: number;
  cashFlow: number;
  capRate: number;
  cashOnCashReturn: number;
}

export interface DealScore {
  score: number;
  stars: number;
  rating: string;
}

export interface Alert {
  type: 'warning' | 'error' | 'info';
  category: string;
  message: string;
}

export interface Insight {
  type: 'positive' | 'negative' | 'neutral';
  category: string;
  message: string;
}

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

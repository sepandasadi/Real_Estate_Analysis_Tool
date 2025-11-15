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
  closingCosts?: number;

  // Loan Details
  interestRate?: number;
  loanTerm?: number; // in years

  // Flip Analysis
  rehabCost?: number;
  arv?: number; // After Repair Value
  holdingMonths?: number;

  // Rental Analysis
  monthlyRent?: number;
  propertyTax?: number;
  insurance?: number;
  hoaFees?: number;
  maintenance?: number;
  vacancy?: number;
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

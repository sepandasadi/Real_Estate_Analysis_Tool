# Real Estate Analysis Tool - PWA Migration Plan

**Project Goal**: Convert Google Sheets-based tool to Progressive Web App (PWA)
**Target Users**: 2-3 users (personal use)
**Budget**: $0/month (free hosting + free API tiers)
**Timeline**: 8-12 weeks
**Status**: 🟡 In Progress

---

## 📋 Project Overview

### Current State
- Google Sheets-based tool with Google Apps Script backend
- ~20 JavaScript modules handling calculations and analysis
- API integrations: Bridge Dataset, Gemini AI, OpenAI
- Two modes: Simple and Advanced
- Features: Flip analysis, rental analysis, sensitivity analysis, partnership management, project tracking

### Target State
- Progressive Web App (PWA) with React + TypeScript frontend
- Google Apps Script backend (REST API)
- Works on iOS, Android, Mac, Windows, Web
- Installable as standalone app
- Offline-capable with caching
- Free hosting on Vercel

---

## 🏗️ Project Structure

```
Real_Estate_Analysis_Tool/
├── README.md
├── MIGRATION_PLAN.md           # ← This file
├── RELEASE_NOTES.md
├── docs/
│
├── google-apps-script/          # Backend (Google Apps Script)
│   ├── README.md
│   ├── src/
│   │   ├── main.js
│   │   ├── apiBridge.js         # API waterfall logic
│   │   ├── webAppEndpoint.js    # REST API for PWA
│   │   ├── analyzer.js
│   │   ├── scoring.js
│   │   ├── alerts.js
│   │   ├── insights.js
│   │   └── ... (all other modules)
│   └── appsscript.json
│
└── web-app/                     # Frontend (PWA)
    ├── README.md
    ├── package.json
    ├── public/
    │   ├── manifest.json
    │   └── icons/
    ├── src/
    │   ├── components/
    │   ├── services/
    │   ├── types/
    │   ├── utils/
    │   └── App.tsx
    └── .env.example
```

---

## 🎯 Implementation Phases

### ✅ Phase 0: Planning (COMPLETED)
**Duration**: Completed
**Status**: ✅ Done

- [x] Analyze current architecture
- [x] Research PWA requirements
- [x] Research API alternatives
- [x] Create comprehensive plan
- [x] Get user approval

---

### 🟡 Phase 1: Reorganize Codebase
**Duration**: Day 1 (1-2 hours)
**Status**: 🔴 Not Started

**Goals:**
- Separate Google Apps Script backend from future web app frontend
- Create clear directory structure
- Update documentation

**Tasks:**
- [ ] Create `google-apps-script/` directory
- [ ] Move all `src/*.js` files to `google-apps-script/src/`
- [ ] Move `src/Sidebar.html` to `google-apps-script/src/`
- [ ] Create `google-apps-script/README.md` with setup instructions
- [ ] Create `web-app/` directory (empty placeholder)
- [ ] Update root `README.md` to reflect new structure
- [ ] Commit changes to git

**Deliverables:**
- ✅ Clean directory structure
- ✅ Updated documentation
- ✅ Git commit with reorganization

---

### 🔴 Phase 2: Fix API Hierarchy in Google Apps Script
**Duration**: Days 2-4 (2-3 days)
**Status**: 🔴 Not Started

**Goals:**
- Implement API waterfall: Realty Mole → RapidAPI → Gemini → Bridge
- Remove OpenAI integration
- Add API usage tracking
- Create REST API endpoint for PWA

#### Step 2.1: Update API Integrations

**New API Priority:**
1. **Realty Mole** (Priority 1) - Free tier: 500 requests/month
2. **RapidAPI** (Priority 2) - Free tier varies by API
3. **Gemini AI** (Priority 3) - Free tier: 1,500 requests/day
4. **Bridge Dataset** (Priority 4) - Existing account

**Tasks:**
- [ ] Sign up for Realty Mole API (https://realtymole.com/api)
- [ ] Add `REALTY_MOLE_API_KEY` to Script Properties
- [ ] Create `fetchCompsFromRealtyMole()` function in `apiBridge.js`
- [ ] Sign up for RapidAPI account (https://rapidapi.com)
- [ ] Choose free real estate API on RapidAPI
- [ ] Add `RAPIDAPI_KEY` to Script Properties
- [ ] Create `fetchCompsFromRapidAPI()` function in `apiBridge.js`
- [ ] Update `fetchCompsData()` with waterfall logic
- [ ] Remove `fetchCompsFromOpenAI()` function
- [ ] Remove `OPENAI_API_KEY` from Script Properties
- [ ] Update `getApiKeys()` to remove OpenAI reference
- [ ] Add `trackAPIUsage()` function for monitoring
- [ ] Test each API individually
- [ ] Verify data format consistency across APIs
- [ ] Update error handling and logging

**API Waterfall Logic:**
```javascript
function fetchCompsData(data, forceRefresh = false) {
  // 1. Check cache first (24-hour cache)
  if (!forceRefresh) {
    const cached = getCachedComps(...);
    if (cached) return cached;
  }

  // 2. Try Realty Mole (Priority 1)
  try {
    const comps = fetchCompsFromRealtyMole(data);
    if (comps && comps.length > 0) {
      trackAPIUsage('realty_mole', true);
      setCachedComps(..., comps);
      return comps;
    }
  } catch (e) {
    trackAPIUsage('realty_mole', false);
    Logger.log("Realty Mole failed: " + e);
  }

  // 3. Try RapidAPI (Priority 2)
  try {
    const comps = fetchCompsFromRapidAPI(data);
    if (comps && comps.length > 0) {
      trackAPIUsage('rapidapi', true);
      setCachedComps(..., comps);
      return comps;
    }
  } catch (e) {
    trackAPIUsage('rapidapi', false);
    Logger.log("RapidAPI failed: " + e);
  }

  // 4. Try Gemini AI (Priority 3)
  try {
    const comps = fetchCompsFromGemini(data, GEMINI_API_KEY);
    if (comps && comps.length > 0) {
      trackAPIUsage('gemini', true);
      setCachedComps(..., comps);
      return comps;
    }
  } catch (e) {
    trackAPIUsage('gemini', false);
    Logger.log("Gemini failed: " + e);
  }

  // 5. Try Bridge Dataset (Priority 4)
  try {
    const comps = fetchFromBridge(data, BRIDGE_API_KEY);
    if (comps && comps.length > 0) {
      trackAPIUsage('bridge', true);
      setCachedComps(..., comps);
      return comps;
    }
  } catch (e) {
    trackAPIUsage('bridge', false);
    Logger.log("Bridge failed: " + e);
  }

  // 6. All APIs failed
  throw new Error("All API sources failed. Please check your API keys and try again.");
}
```

#### Step 2.2: Create Web App Endpoint

**Tasks:**
- [ ] Create `webAppEndpoint.js` in `google-apps-script/src/`
- [ ] Implement `doPost()` function for API requests
- [ ] Implement `doGet()` function for health checks
- [ ] Add CORS headers for cross-origin requests
- [ ] Create API actions: analyze, fetchComps, calculateFlip, calculateRental
- [ ] Deploy as Web App in Apps Script
- [ ] Set execution as "Me" and access to "Anyone with the link"
- [ ] Copy Web App URL for frontend integration
- [ ] Test endpoint with curl/Postman
- [ ] Document API endpoints and request/response formats

**API Endpoints:**
```
POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

Actions:
- analyze: Full property analysis
- fetchComps: Get comparable properties
- calculateFlip: Calculate flip analysis
- calculateRental: Calculate rental analysis
```

**Deliverables:**
- ✅ Updated `apiBridge.js` with waterfall logic
- ✅ All 4 APIs integrated and tested
- ✅ OpenAI removed
- ✅ API usage tracking implemented
- ✅ Working Web App endpoint
- ✅ API documentation

---

### 🔴 Phase 3: Initialize Web App
**Duration**: Days 5-7 (2-3 days)
**Status**: 🔴 Not Started

**Goals:**
- Set up React + TypeScript + PWA project
- Configure Tailwind CSS
- Set up project structure
- Connect to Google Apps Script API

**Tasks:**
- [ ] Navigate to `web-app/` directory
- [ ] Initialize React PWA: `npx create-react-app . --template cra-template-pwa-typescript`
- [ ] Install dependencies:
  ```bash
  npm install tailwindcss recharts axios react-router-dom
  npm install -D @types/react @types/node autoprefixer postcss
  ```
- [ ] Initialize Tailwind: `npx tailwindcss init -p`
- [ ] Configure `tailwind.config.js`
- [ ] Update `src/index.css` with Tailwind directives
- [ ] Create `.env.example` with API URL template
- [ ] Create `.env.local` with actual Google Apps Script URL
- [ ] Set up project structure (components, services, types, utils)
- [ ] Create `services/api.ts` for API calls
- [ ] Test connection to Google Apps Script endpoint
- [ ] Create basic routing structure
- [ ] Update `web-app/README.md` with setup instructions

**Project Structure:**
```
web-app/src/
├── components/
│   ├── PropertyForm.tsx
│   ├── Dashboard.tsx
│   ├── FlipAnalysis.tsx
│   ├── RentalAnalysis.tsx
│   ├── SensitivityAnalysis.tsx
│   └── Charts.tsx
├── services/
│   ├── api.ts              # API calls to Google Apps Script
│   ├── calculations.ts     # Client-side calculations
│   └── storage.ts          # IndexedDB for offline storage
├── types/
│   ├── property.ts
│   ├── analysis.ts
│   └── api.ts
├── utils/
│   ├── formatters.ts
│   └── validators.ts
├── App.tsx
└── index.tsx
```

**Deliverables:**
- ✅ Working React + TypeScript + Tailwind setup
- ✅ PWA manifest configured
- ✅ Service worker enabled
- ✅ Basic routing structure
- ✅ API service layer connected to backend

---

### 🔴 Phase 4: Build Core UI Components
**Duration**: Days 8-14 (1 week)
**Status**: 🔴 Not Started

**Goals:**
- Create responsive UI components
- Implement property input form
- Build dashboard with key metrics
- Create analysis result views

**Tasks:**
- [ ] Create `PropertyForm.tsx` component
  - Address, city, state, zip inputs
  - Purchase price, down payment, loan terms
  - Rehab cost, timeline
  - Form validation with error messages
  - Submit button with loading state
- [ ] Create `Dashboard.tsx` component
  - Key metrics cards (ROI, Cash Flow, Cap Rate, Score)
  - Property list (saved analyses)
  - Quick actions (New Analysis, View History)
  - Responsive grid layout
- [ ] Create `FlipAnalysis.tsx` component
  - Flip metrics display (ROI, Net Profit, Timeline)
  - Profit breakdown table
  - Cost breakdown chart
  - Scenario comparison (Best/Base/Worst)
- [ ] Create `RentalAnalysis.tsx` component
  - Rental metrics display (Cap Rate, Cash Flow, DSCR)
  - Cash flow projections table
  - 10-year projection chart
  - BRRRR analysis section
- [ ] Create `Charts.tsx` component
  - ROI comparison chart
  - Cash flow over time
  - Cost breakdown pie chart
  - Sensitivity heat map
- [ ] Implement responsive design (mobile-first)
- [ ] Add loading states and error handling
- [ ] Add accessibility features (ARIA labels, keyboard navigation)

**Deliverables:**
- ✅ All core UI components built
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Accessible (WCAG AA compliant)
- ✅ Loading and error states

---

### 🔴 Phase 5: Port Business Logic
**Duration**: Days 15-21 (1 week)
**Status**: 🔴 Not Started

**Goals:**
- Port calculation logic from Google Apps Script to TypeScript
- Implement client-side calculations for offline support
- Add unit tests for critical calculations

**Tasks:**
- [ ] Port `analyzer.js` → `calculations.ts`
  - Flip analysis calculations
  - Rental analysis calculations
  - Scenario generation
  - ROI, cash flow, cap rate calculations
- [ ] Port `scoring.js` → `scoring.ts`
  - Deal quality scoring algorithm
  - Metric thresholds
  - Star rating system
- [ ] Port `alerts.js` → `alerts.ts`
  - Alert generation logic
  - Alert prioritization
  - Alert filtering
- [ ] Port `insights.js` → `insights.ts`
  - Recommendation engine
  - Market insights
  - Improvement suggestions
- [ ] Create TypeScript types for all data structures
- [ ] Add unit tests with Jest
  - Test flip calculations
  - Test rental calculations
  - Test scoring algorithm
  - Test alert generation
- [ ] Verify calculation accuracy against Google Sheets

**Deliverables:**
- ✅ All calculation logic ported to TypeScript
- ✅ Unit tests with 80%+ coverage
- ✅ Calculation accuracy verified
- ✅ Type-safe code

---

### 🔴 Phase 6: Advanced Features
**Duration**: Days 22-42 (3 weeks)
**Status**: 🔴 Not Started

**Goals:**
- Implement advanced analysis features
- Add data persistence
- Add export functionality

**Tasks:**
- [ ] Implement IndexedDB storage
  - Save/load property analyses
  - Store user preferences
  - Cache API responses
- [ ] Build Sensitivity Analysis component
  - ARV vs Rehab matrix
  - Interactive heat map
  - Scenario explorer
- [ ] Build Scenario Analyzer
  - Best/Base/Worst case scenarios
  - Custom scenario builder
  - Monte Carlo simulation (optional)
- [ ] Build Partnership Management
  - Multi-partner tracking
  - Capital contribution history
  - Waterfall distribution calculator
- [ ] Build Project Tracker
  - Renovation task tracking
  - Budget monitoring
  - Timeline visualization
- [ ] Implement Amortization Schedules
  - Monthly payment breakdown
  - Interest vs principal chart
  - Loan comparison tool
- [ ] Implement Tax Benefits Calculator
  - Depreciation calculations
  - Capital gains analysis
  - 1031 exchange planning
- [ ] Add Export functionality
  - Export to PDF
  - Export to CSV
  - Email report (optional)

**Deliverables:**
- ✅ All advanced features implemented
- ✅ Data persistence working
- ✅ Export functionality working

---

### 🔴 Phase 7: PWA Features & Optimization
**Duration**: Days 43-49 (1 week)
**Status**: 🔴 Not Started

**Goals:**
- Enable offline functionality
- Optimize performance
- Add install prompts

**Tasks:**
- [ ] Configure service worker for offline mode
  - Cache static assets
  - Cache API responses
  - Offline fallback page
- [ ] Add install prompt (Add to Home Screen)
  - Detect if installable
  - Show custom install prompt
  - Track installation
- [ ] Create app icons (multiple sizes)
  - 192x192 icon
  - 512x512 icon
  - Favicon
  - Apple touch icon
- [ ] Configure `manifest.json`
  - App name and description
  - Theme colors
  - Display mode (standalone)
  - Start URL
- [ ] Optimize performance
  - Code splitting with React.lazy
  - Image optimization
  - Bundle size optimization
  - Lazy loading for charts
  - Memoization for expensive calculations
- [ ] Run Lighthouse audit
  - Performance score 90+
  - Accessibility score 90+
  - Best Practices score 90+
  - SEO score 90+
  - PWA score 100

**PWA Checklist:**
- [ ] HTTPS enabled
- [ ] Service worker registered
- [ ] Manifest.json configured
- [ ] Icons (192x192, 512x512)
- [ ] Offline fallback page
- [ ] Install prompt working
- [ ] Works on iOS Safari
- [ ] Works on Chrome Android
- [ ] Works on desktop browsers

**Deliverables:**
- ✅ Fully functional PWA
- ✅ Offline mode working
- ✅ Installable on all platforms
- ✅ Lighthouse score 90+

---

### 🔴 Phase 8: Testing & Deployment
**Duration**: Days 50-60 (1.5 weeks)
**Status**: 🔴 Not Started

**Goals:**
- Comprehensive testing
- Deploy to production
- User onboarding

**Tasks:**
- [ ] Unit tests (Jest)
  - Test all calculation functions
  - Test utility functions
  - Test formatters and validators
- [ ] Integration tests
  - Test API calls
  - Test data persistence
  - Test error handling
- [ ] E2E tests (Cypress)
  - Test user flows (create analysis, view results, save)
  - Test form validation
  - Test navigation
- [ ] Cross-browser testing
  - Chrome (desktop + mobile)
  - Safari (desktop + iOS)
  - Firefox
  - Edge
- [ ] Accessibility testing
  - WAVE tool
  - axe DevTools
  - Keyboard navigation
  - Screen reader testing
- [ ] Set up Vercel account
- [ ] Connect GitHub repository
- [ ] Configure environment variables in Vercel
- [ ] Deploy to production
- [ ] Set up custom domain (optional)
- [ ] Test production build
- [ ] Create user documentation
  - Installation guide
  - User manual
  - FAQ
- [ ] Share with 2-3 users for feedback

**Deliverables:**
- ✅ Test coverage 80%+
- ✅ All tests passing
- ✅ Live PWA at production URL
- ✅ User documentation complete
- ✅ Users onboarded

---

## 💰 Cost Breakdown

| Item | Cost | Notes |
|------|------|-------|
| **Realty Mole API** | $0/month | Free tier: 500 requests/month |
| **RapidAPI** | $0/month | Free tier varies by API |
| **Gemini API** | $0/month | Free tier: 1,500 requests/day |
| **Bridge Dataset** | $0/month | Existing account |
| **Vercel Hosting** | $0/month | Free tier: unlimited projects |
| **Domain (optional)** | $12/year | Optional custom domain |
| **Total** | **$0-12/year** | Essentially free! |

---

## 🛠️ Tech Stack

### **Frontend (PWA):**
- React 18 + TypeScript
- Tailwind CSS (styling)
- Recharts (charts)
- React Router (navigation)
- Axios (API calls)
- IndexedDB (local storage)

### **Backend:**
- Google Apps Script (existing)
- REST API endpoint

### **Hosting:**
- Vercel (free tier)
- HTTPS automatic
- CDN included

### **APIs:**
1. Realty Mole (priority)
2. RapidAPI (fallback)
3. Gemini AI (fallback)
4. Bridge Dataset (fallback)

---

## 📊 Progress Tracking

### Overall Progress: 0% Complete

| Phase | Status | Progress | Duration |
|-------|--------|----------|----------|
| Phase 0: Planning | ✅ Done | 100% | Completed |
| Phase 1: Reorganize | 🔴 Not Started | 0% | Day 1 |
| Phase 2: API Fix | 🔴 Not Started | 0% | Days 2-4 |
| Phase 3: Initialize | 🔴 Not Started | 0% | Days 5-7 |
| Phase 4: UI Components | 🔴 Not Started | 0% | Days 8-14 |
| Phase 5: Business Logic | 🔴 Not Started | 0% | Days 15-21 |
| Phase 6: Advanced Features | 🔴 Not Started | 0% | Days 22-42 |
| Phase 7: PWA & Optimization | 🔴 Not Started | 0% | Days 43-49 |
| Phase 8: Testing & Deployment | 🔴 Not Started | 0% | Days 50-60 |

**Legend:**
- 🔴 Not Started
- 🟡 In Progress
- ✅ Done

---

## 📝 Notes & Decisions

### Key Decisions Made:
1. **PWA over Native Apps**: Chosen for cost-effectiveness and cross-platform support
2. **Keep Google Apps Script Backend**: Leverage existing code, no migration needed
3. **API Waterfall**: Realty Mole → RapidAPI → Gemini → Bridge (prioritize free tiers)
4. **Remove OpenAI**: Cost optimization, Gemini is cheaper
5. **Free Hosting**: Vercel free tier is sufficient for 2-3 users
6. **Phased Approach**: Reorganize → API Fix → Web App (clear progression)

### Risks & Mitigations:
- **Risk**: API rate limits exceeded
  - **Mitigation**: 24-hour caching, waterfall approach, usage tracking
- **Risk**: Google Apps Script performance issues
  - **Mitigation**: Client-side calculations for offline support
- **Risk**: Browser compatibility issues
  - **Mitigation**: Comprehensive cross-browser testing
- **Risk**: Timeline slippage
  - **Mitigation**: Phased approach, MVP first, iterate

---

## 🚀 Next Steps

1. **Immediate**: Start Phase 1 (Reorganize Codebase)
2. **This Week**: Complete Phase 1 & Phase 2 (API Fix)
3. **Next Week**: Start Phase 3 (Initialize Web App)

---

## 📞 Support & Resources

- **Documentation**: See `/docs` folder
- **Google Apps Script**: https://developers.google.com/apps-script
- **React PWA**: https://create-react-app.dev/docs/making-a-progressive-web-app/
- **Realty Mole API**: https://realtymole.com/api
- **RapidAPI**: https://rapidapi.com
- **Vercel**: https://vercel.com

---

**Last Updated**: November 15, 2025
**Version**: 1.0
**Status**: Planning Complete, Ready to Start Implementation

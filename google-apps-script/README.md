# Google Apps Script Backend

This directory contains the backend logic for the Real Estate Analysis Tool, built with Google Apps Script.

## 📁 Directory Structure

```
google-apps-script/
├── README.md                    # This file
├── src/
│   ├── main.js                  # Core orchestration & menu
│   ├── apiBridge.js             # API integrations (waterfall logic)
│   ├── webAppEndpoint.js        # REST API endpoint for PWA (to be created)
│   ├── analyzer.js              # Flip & rental calculations
│   ├── scoring.js               # Deal quality scoring
│   ├── alerts.js                # Alert generation
│   ├── insights.js              # Recommendations
│   ├── sensitivity.js           # Sensitivity analysis
│   ├── amortization.js          # Amortization schedules
│   ├── taxBenefits.js           # Tax calculations
│   ├── advancedMetrics.js       # IRR, NPV, break-even
│   ├── timeline.js              # Project tracker
│   ├── partnershipManager.js    # Partnership management
│   ├── inputsSummary.js         # Summary panel
│   ├── charts.js                # Visualizations
│   ├── compsFilter.js           # Comps filtering
│   ├── locationData.js          # State tax/insurance data
│   ├── formatter.js             # Sheet formatting
│   ├── styling.js               # Professional styling
│   ├── config.js                # Dynamic field mapping
│   ├── cache.js                 # 24-hour caching
│   ├── protection.js            # Sheet protection
│   ├── scenarioAnalyzer.js      # Scenario analysis
│   ├── Sidebar.html             # UI sidebar
│   └── ScenarioAnalyzer.html    # Scenario analyzer UI
└── appsscript.json              # Apps Script manifest (to be created)
```

## 🚀 Setup Instructions

### 1. Create a New Google Apps Script Project

1. Open your Google Sheet
2. Go to **Extensions > Apps Script**
3. Delete the default `Code.gs` file
4. Create new files for each `.js` file in the `src/` directory

### 2. Copy Files to Apps Script

Copy the contents of each file from `src/` to the corresponding file in Apps Script:

- `main.js` → Create file named `main.gs`
- `apiBridge.js` → Create file named `apiBridge.gs`
- `analyzer.js` → Create file named `analyzer.gs`
- ... (repeat for all `.js` files)
- `Sidebar.html` → Create HTML file named `Sidebar`
- `ScenarioAnalyzer.html` → Create HTML file named `ScenarioAnalyzer`

**Note**: Apps Script uses `.gs` extension for JavaScript files, but the code is the same.

### 3. Configure API Keys

1. In Apps Script, go to **Project Settings** (gear icon)
2. Scroll to **Script Properties**
3. Add the following properties:

| Property Name | Description | Required |
|--------------|-------------|----------|
| `REALTY_MOLE_API_KEY` | Realty Mole API key | Priority 1 |
| `RAPIDAPI_KEY` | RapidAPI key | Priority 2 |
| `GEMINI_API_KEY` | Google Gemini API key | Priority 3 |
| `BRIDGE_API_KEY` | Bridge Dataset API key | Priority 4 |
| `BRIDGE_BASE_URL` | Bridge API base URL | If using Bridge |

### 4. Deploy as Web App (for PWA integration)

1. In Apps Script, click **Deploy > New deployment**
2. Select type: **Web app**
3. Configure:
   - **Description**: REI Analysis API
   - **Execute as**: Me
   - **Who has access**: Anyone with the link (or Anyone)
4. Click **Deploy**
5. Copy the **Web App URL** (you'll need this for the PWA frontend)
6. Save the URL in `web-app/.env.local` as `REACT_APP_API_URL`

### 5. Authorize the Script

1. Run any function (e.g., `onOpen`) from the Apps Script editor
2. Click **Review permissions**
3. Choose your Google account
4. Click **Advanced > Go to [Project Name] (unsafe)**
5. Click **Allow**

## 🔑 API Configuration

### API Waterfall Strategy

The tool uses a waterfall approach to fetch property data, trying each API in order until one succeeds:

1. **Realty Mole** (Priority 1) - Free tier: 500 requests/month
2. **RapidAPI** (Priority 2) - Free tier varies by API
3. **Gemini AI** (Priority 3) - Free tier: 1,500 requests/day
4. **Bridge Dataset** (Priority 4) - Existing account

### Getting API Keys

#### Realty Mole
1. Visit https://realtymole.com/api
2. Sign up for free account
3. Get API key from dashboard
4. Add to Script Properties as `REALTY_MOLE_API_KEY`

#### RapidAPI
1. Visit https://rapidapi.com
2. Sign up for free account
3. Browse real estate APIs (e.g., Realty Mole, US Real Estate)
4. Subscribe to free tier
5. Get API key from dashboard
6. Add to Script Properties as `RAPIDAPI_KEY`

#### Gemini AI
1. Visit https://makersuite.google.com/app/apikey
2. Create API key
3. Add to Script Properties as `GEMINI_API_KEY`

#### Bridge Dataset (Optional)
1. If you have an existing Bridge account
2. Get API key from Bridge dashboard
3. Add to Script Properties as `BRIDGE_API_KEY` and `BRIDGE_BASE_URL`

## 📊 Features

### Core Analysis
- **Flip Analysis**: ROI, profit, timeline calculations
- **Rental Analysis**: Cap rate, cash flow, DSCR
- **Scenario Analysis**: Best/base/worst case projections
- **Sensitivity Analysis**: ARV vs Rehab matrix

### Advanced Features
- **Scoring System**: 0-100 deal quality score
- **Smart Alerts**: Automatic issue detection
- **Insights**: AI-powered recommendations
- **Tax Benefits**: Depreciation, capital gains, 1031 exchange
- **Advanced Metrics**: IRR, NPV, break-even analysis
- **Amortization**: Loan payment schedules
- **Partnership Management**: Multi-investor tracking
- **Project Tracker**: Renovation management

### Automation
- **24-Hour Caching**: Reduces API costs by 95%
- **Auto-Population**: State-based tax rates and insurance
- **Dynamic Field Mapping**: Survives layout changes
- **Error Handling**: Graceful fallbacks and retries

## 🔧 Development

### Testing APIs

Test each API individually:

```javascript
// Test Realty Mole
function testRealtyMole() {
  const data = {
    address: "123 Main St",
    city: "San Francisco",
    state: "CA",
    zip: "94102"
  };
  const comps = fetchCompsFromRealtyMole(data);
  Logger.log(comps);
}

// Test RapidAPI
function testRapidAPI() {
  const data = {
    address: "123 Main St",
    city: "San Francisco",
    state: "CA",
    zip: "94102"
  };
  const comps = fetchCompsFromRapidAPI(data);
  Logger.log(comps);
}

// Test Gemini
function testGemini() {
  const data = {
    address: "123 Main St",
    city: "San Francisco",
    state: "CA",
    zip: "94102"
  };
  const comps = fetchCompsFromGemini(data, getApiKeys().GEMINI_API_KEY);
  Logger.log(comps);
}
```

### Viewing Logs

1. In Apps Script editor, go to **View > Logs** (or **Executions**)
2. Run a function
3. View execution logs and errors

### Debugging

1. Add `Logger.log()` statements in your code
2. Run the function
3. Check logs in **View > Logs**
4. Use `try/catch` blocks for error handling

## 🌐 REST API Endpoints (for PWA)

Once deployed as a Web App, the following endpoints are available:

### POST /exec

**Request:**
```json
{
  "action": "analyze",
  "property": {
    "address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94102",
    "purchasePrice": 800000,
    "downPayment": 20,
    "rehabCost": 50000,
    "monthsToFlip": 6
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "flipAnalysis": { ... },
    "rentalAnalysis": { ... },
    "score": 85,
    "alerts": [ ... ]
  }
}
```

**Available Actions:**
- `analyze` - Full property analysis
- `fetchComps` - Get comparable properties
- `calculateFlip` - Calculate flip analysis
- `calculateRental` - Calculate rental analysis

## 📝 Notes

### Current Status
- ✅ All calculation logic implemented
- ✅ API integrations working (Gemini, Bridge)
- 🟡 API waterfall to be implemented (Realty Mole, RapidAPI)
- 🟡 Web App endpoint to be created
- 🔴 PWA frontend to be built

### Migration Progress
This backend will serve both:
1. **Google Sheets** (current implementation)
2. **PWA Frontend** (via REST API endpoint)

See `MIGRATION_PLAN.md` in the root directory for full migration details.

## 🆘 Troubleshooting

### "Authorization required" error
- Run `onOpen()` function manually
- Click "Review permissions" and authorize

### "API key not found" error
- Check Script Properties in Project Settings
- Ensure API keys are added correctly

### "Exceeded quota" error
- Check API usage limits
- Verify 24-hour caching is working
- Consider upgrading API tier if needed

### "Function not found" error
- Ensure all files are copied to Apps Script
- Check for typos in function names
- Verify file names match

## 📚 Resources

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Apps Script Best Practices](https://developers.google.com/apps-script/guides/support/best-practices)
- [Realty Mole API Docs](https://realtymole.com/api/docs)
- [RapidAPI Documentation](https://docs.rapidapi.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)

---

**Last Updated**: November 15, 2025
**Version**: 1.0
**Status**: Backend Complete, API Waterfall & Web Endpoint Pending

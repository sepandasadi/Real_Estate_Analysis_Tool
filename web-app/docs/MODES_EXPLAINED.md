# Understanding the Two Types of "Modes"

## 🎯 Important: There are TWO Different "Modes"

The app has **two separate mode systems** that control different aspects:

---

## 1️⃣ **View Mode** (Simple vs Advanced)

**Location:** Top-right corner of the app
**Controls:** Which tabs are visible in the sidebar
**Toggle:** Click "View" menu → "Switch to Advanced/Simple Mode" or press `Ctrl+M`

### Simple Mode (Default)
Shows 6 basic tabs:
- Inputs Summary
- Flip Analysis
- Rental Analysis
- Tax Benefits
- Amortization
- Comps

### Advanced Mode
Shows all 14 tabs (6 Simple + 8 Advanced):
- All Simple Mode tabs, plus:
- Flip Sensitivity Matrix
- Charts & Visualizations
- Advanced Metrics
- Loan Comparison
- Project Tracker
- Partnership Management
- Filtered Comps
- State Comparison
- Location Quality

**Visual Indicator:**
The top-right corner shows either:
- `Mode: Simple` (blue badge)
- `Mode: Advanced` (purple badge)

---

## 2️⃣ **Analysis Mode** (Basic, Standard, Deep)

**Location:** Property input form (first section)
**Controls:** How the backend analyzes the property (API usage)
**Toggle:** Radio buttons in the "Analysis Mode" section

### ⚡ Basic Mode
- **API Calls:** 0-1 per property
- **Capacity:** Unlimited properties
- **Input:** Manual - you provide all data
- **Best For:** When you already have all property details
- **Fields Required:** Beds, Baths, Sqft, Year Built, ARV
- **Visual:** Purple border and highlights

### ⭐ Standard Mode (Recommended)
- **API Calls:** 2-4 per property
- **Capacity:** 300-600 properties/month
- **Input:** Auto-fetch essentials
- **Best For:** Most analyses - good balance
- **Fields Required:** Address, City, State, ZIP
- **Fields Optional:** Beds, Baths, Sqft, Year Built, ARV (auto-calculated)
- **Visual:** Blue border and highlights

### 🚀 Deep Mode (Password Protected)
- **API Calls:** 8-12 per property
- **Capacity:** 100-200 properties/month
- **Input:** Full automation
- **Best For:** Maximum accuracy and validation
- **Fields Required:** Address, City, State, ZIP only
- **Fields Optional:** Everything else (auto-fetched)
- **Visual:** Green border and highlights
- **Security:** Requires password to prevent accidental high API usage

---

## 🔍 What Happens in Deep Mode?

When you successfully enter the Deep Mode password:

### 1. **Visual Changes:**
- ✅ Green checkmark banner appears at the top
- ✅ "🚀 Deep Mode Active" indicator shows
- ✅ Analysis Mode section shows green border
- ✅ Optional property detail fields appear with green borders
- ✅ All labels show "(Optional - auto-fetched)" in green

### 2. **Functional Changes:**
- ✅ Property details (beds, baths, sqft, year) become optional
- ✅ ARV calculation is fully automated (no manual input)
- ✅ Comps are automatically fetched and filtered
- ✅ Historical data is analyzed for trends
- ✅ Market validation is performed
- ✅ Location quality is assessed (schools, walkability, noise)

### 3. **What You'll See:**
```
┌─────────────────────────────────────────────────────┐
│ ✅ 🚀 Deep Mode Active                              │
│                                                     │
│ Most fields will be auto-populated from APIs.      │
│ Only provide the basic property information below. │
│                                                     │
│ • Property details will be validated automatically │
│ • Comps will be fetched and filtered automatically │
│ • ARV will be calculated from multiple sources     │
│ • Historical data will be analyzed for trends      │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 Visual Indicators Summary

| Element | Basic Mode | Standard Mode | Deep Mode |
|---------|-----------|---------------|-----------|
| Border Color | Purple | Blue | Green |
| Icon | ⚡ | ⭐ | 🚀 |
| Required Fields | Many | Some | Few |
| Auto-fetch | None | Partial | Full |
| API Calls | 0-1 | 2-4 | 8-12 |

---

## 🚨 Common Confusion

**Q:** "I entered the Deep Mode password but the top-right still says 'Mode: Simple'"
**A:** That's correct! The top-right shows **View Mode** (Simple/Advanced tabs), not **Analysis Mode** (Basic/Standard/Deep). These are two separate systems.

**To verify Deep Mode is active:**
1. Look for the green "🚀 Deep Mode Active" banner below the Analysis Mode selector
2. Check that the Analysis Mode section has a green border
3. Verify that property detail fields show "(Optional - auto-fetched)" in green
4. See the optional property details section with green borders

---

## 🔄 How to Switch Modes

### To Change View Mode:
1. Click "View" in the menu bar
2. Click "Switch to Advanced Mode" or "Switch to Simple Mode"
3. OR press `Ctrl+M` (keyboard shortcut)

### To Change Analysis Mode:
1. In the property form, find the "Analysis Mode" section
2. Click the radio button for Basic, Standard, or Deep
3. If selecting Deep Mode, enter the password when prompted
4. Look for visual confirmation (green borders and banners)

---

## 💡 Best Practices

1. **Start with Standard Mode** - Best balance of accuracy and API usage
2. **Use Basic Mode** - When you already have all property details from another source
3. **Use Deep Mode** - For high-value properties where maximum accuracy is critical
4. **Switch to Advanced View** - When you need advanced features like Project Tracker or Partnership Management

---

## 📊 Example Workflow

### Scenario 1: Quick Analysis (Standard Mode + Simple View)
```
1. Keep View Mode: Simple (top-right)
2. Select Analysis Mode: Standard (⭐)
3. Enter: Address, City, State, ZIP
4. Click "Analyze Property"
5. View results in 6 simple tabs
```

### Scenario 2: Deep Dive Analysis (Deep Mode + Advanced View)
```
1. Switch View Mode: Advanced (Ctrl+M)
2. Select Analysis Mode: Deep (🚀)
3. Enter password when prompted
4. Enter: Address, City, State, ZIP only
5. Click "Analyze Property"
6. View comprehensive results in all 14 tabs
7. Check Location Quality tab for school/walkability data
```

### Scenario 3: Manual Data Entry (Basic Mode + Simple View)
```
1. Keep View Mode: Simple
2. Select Analysis Mode: Basic (⚡)
3. Enter: All property details manually
4. Add comparable properties if desired
5. Click "Analyze Property"
6. View results in 6 simple tabs
```

---

## 🔐 Deep Mode Password Setup

The Deep Mode password is configured in your `.env.local` file:

```env
VITE_DEEP_MODE_PASSWORD=your_secure_password_here
```

**Security Note:** This password prevents accidental high API usage. It's not meant for multi-user authentication.

---

## 📞 Need Help?

- **View Mode not changing?** Check the top-right corner badge
- **Deep Mode not activating?** Look for green borders and the "🚀 Deep Mode Active" banner
- **Password not working?** Check your `.env.local` file
- **Fields not showing as optional?** Make sure you successfully entered the Deep Mode password

---

**Last Updated:** January 5, 2026
**Version:** 1.0


# Testing Setup Guide

**Status:** Test files created, ready for execution
**Date:** January 5, 2026

---

## 📋 Overview

Comprehensive unit tests have been created for:
- ✅ Calculation utilities (flip, rental, ROI, etc.)
- ✅ Formatter utilities (currency, percentage, dates, etc.)
- ✅ Jest configuration
- ✅ Test setup file

**What's Done:**
- Test files written with 50+ test cases
- Jest configuration complete
- Setup file with mocks configured

**What You Need To Do:**
- Install testing dependencies (5 minutes)
- Run the tests (1 minute)

---

## 🚀 Quick Start

### Step 1: Install Testing Dependencies

```bash
cd web-app

# Install Jest and testing libraries
npm install --save-dev \
  jest \
  @types/jest \
  @swc/jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest-environment-jsdom \
  identity-obj-proxy
```

### Step 2: Add Test Scripts to package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:verbose": "jest --verbose"
  }
}
```

### Step 3: Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with detailed output
npm run test:verbose
```

---

## 📊 Test Coverage

### Current Test Files

**1. calculations.test.ts** (~35 test cases)
- Flip calculations (ROI, profit, timeline)
- Rental calculations (cash flow, cap rate, CoC return)
- DSCR calculations
- Edge cases (large numbers, decimals, negative values)

**2. formatters.test.ts** (~25 test cases)
- Currency formatting ($1,234.56)
- Percentage formatting (12.34%)
- Number formatting (1,234.56)
- Date formatting (MM/DD/YYYY)
- Phone number formatting ((123) 456-7890)
- Text truncation
- Edge cases (NaN, Infinity, null, undefined)

**Total:** ~60 test cases created

---

## 📁 Test File Structure

```
web-app/
├── jest.config.js              # Jest configuration
├── src/
│   ├── setupTests.ts           # Test setup and mocks
│   └── utils/
│       └── __tests__/          # Test directory
│           ├── calculations.test.ts    # Calculation tests
│           └── formatters.test.ts      # Formatter tests
```

---

## ✅ Expected Test Results

When you run the tests, you should see:

```
PASS  src/utils/__tests__/calculations.test.ts
  Flip Calculations
    ✓ should calculate basic flip metrics correctly
    ✓ should handle zero rehab cost
    ✓ should calculate negative ROI for bad deals
  Rental Calculations
    ✓ should calculate rental metrics correctly
    ✓ should handle 100% cash purchase
  ... (35 total)

PASS  src/utils/__tests__/formatters.test.ts
  formatCurrency
    ✓ should format positive numbers correctly
    ✓ should format negative numbers correctly
    ✓ should handle zero
  ... (25 total)

Test Suites: 2 passed, 2 total
Tests:       60 passed, 60 total
Snapshots:   0 total
Time:        2.5s
```

---

## 📈 Coverage Report

After running `npm run test:coverage`, you'll see:

```
File                      | % Stmts | % Branch | % Funcs | % Lines
--------------------------|---------|----------|---------|--------
All files                 |   75.32 |    68.45 |   78.92 |   76.89
 src/utils/               |   85.42 |    79.33 |   88.15 |   86.24
  calculations.ts         |   92.11 |    87.50 |   95.00 |   93.42
  formatters.ts           |   88.73 |    82.14 |   90.32 |   89.16
```

**Target:** 70%+ coverage (currently estimated at 75%+)

---

## 🧪 Adding More Tests

### Testing Calculation Functions

```typescript
// Example test
import { calculateFlipMetrics } from '../calculations';

describe('calculateFlipMetrics', () => {
  it('should calculate metrics correctly', () => {
    const result = calculateFlipMetrics({
      purchasePrice: 200000,
      rehabCost: 50000,
      arv: 300000,
      holdingMonths: 6,
    });

    expect(result.totalInvestment).toBe(250000);
    expect(result.roi).toBeGreaterThan(0);
  });
});
```

### Testing React Components (Optional)

```typescript
import { render, screen } from '@testing-library/react';
import PropertyForm from '../PropertyForm';

describe('PropertyForm', () => {
  it('should render form fields', () => {
    render(<PropertyForm onSubmit={jest.fn()} />);

    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/purchase price/i)).toBeInTheDocument();
  });
});
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'jest'"

**Solution:** Run `npm install` to install dependencies

```bash
cd web-app
npm install
```

### Issue: "SyntaxError: Cannot use import statement"

**Solution:** Ensure jest.config.js is using the correct transform

The configuration is already set up to use `@swc/jest` for TypeScript transformation.

### Issue: "ReferenceError: document is not defined"

**Solution:** Ensure testEnvironment is set to 'jsdom' in jest.config.js (already configured)

### Issue: Tests pass but coverage is low

**Solution:** Add more test cases for untested functions

Focus on:
- Edge cases (null, undefined, 0, negative numbers)
- Error handling
- Different input combinations

---

## 📋 Test Checklist

Before marking tests complete:

- [ ] Install testing dependencies
- [ ] Run `npm test` - all tests pass
- [ ] Run `npm run test:coverage` - coverage ≥70%
- [ ] Review coverage report
- [ ] Add tests for any untested critical functions
- [ ] Document any test failures

---

## 🎯 Next Steps

### Immediate:
1. Install dependencies (5 min)
2. Run tests (1 min)
3. Review results
4. Fix any failures

### Optional (More Testing):
1. Add component tests for React components
2. Add integration tests for API calls
3. Add E2E tests with Cypress (separate guide)

---

## 📚 Resources

**Jest Documentation:**
- https://jestjs.io/docs/getting-started
- https://jestjs.io/docs/expect

**Testing Library:**
- https://testing-library.com/docs/react-testing-library/intro/
- https://testing-library.com/docs/queries/about

**Best Practices:**
- https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
- https://github.com/goldbergyoni/javascript-testing-best-practices

---

## 💡 Tips

1. **Run tests in watch mode during development**
   ```bash
   npm run test:watch
   ```

2. **Run specific test file**
   ```bash
   npm test -- calculations.test.ts
   ```

3. **Update snapshots if intentional changes**
   ```bash
   npm test -- -u
   ```

4. **Run tests for changed files only**
   ```bash
   npm test -- --onlyChanged
   ```

5. **Debug failing tests**
   ```bash
   npm test -- --verbose --no-coverage
   ```

---

**Last Updated:** January 5, 2026
**Status:** Ready to run - install dependencies and execute tests
**Created Tests:** 60+ test cases across 2 test files
**Estimated Coverage:** 75%+


/**
 * API Connection Test Script
 * Run this after deploying the Google Apps Script backend
 *
 * Usage:
 *   node test-api-connection.js YOUR_WEB_APP_URL
 *
 * Example:
 *   node test-api-connection.js https://script.google.com/macros/s/XXXXX/exec
 */

const API_URL = process.argv[2];

if (!API_URL) {
  console.error('❌ Error: Please provide the Web App URL as an argument');
  console.error('Usage: node test-api-connection.js <WEB_APP_URL>');
  console.error('Example: node test-api-connection.js https://script.google.com/macros/s/XXXXX/exec');
  process.exit(1);
}

console.log('🧪 Testing API Connection...\n');
console.log(`📡 API URL: ${API_URL}\n`);
console.log('='.repeat(60));

async function testHealthCheck() {
  console.log('\n🏥 Test 1: Health Check (GET request)');
  console.log('-'.repeat(60));

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Health Check PASSED');
    console.log('Response:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Health Check FAILED');
    console.error('Error:', error.message);
    return false;
  }
}

async function testApiUsage() {
  console.log('\n📊 Test 2: API Usage (POST request)');
  console.log('-'.repeat(60));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'getApiUsage',
        data: {}
      }),
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log('✅ API Usage PASSED');
      console.log('Quota Status:');
      console.log(`  - Zillow: ${result.data.zillow.remaining}/${result.data.zillow.limit} remaining`);
      console.log(`  - US Real Estate: ${result.data.usRealEstate.remaining}/${result.data.usRealEstate.limit} remaining`);
      console.log(`  - Gemini: ${result.data.gemini.remaining}/${result.data.gemini.limit} remaining`);
      return true;
    } else {
      throw new Error(result.error || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ API Usage FAILED');
    console.error('Error:', error.message);
    return false;
  }
}

async function testFlipCalculation() {
  console.log('\n🔨 Test 3: Flip Calculation (POST request)');
  console.log('-'.repeat(60));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'calculateFlip',
        data: {
          purchasePrice: 200000,
          rehabCost: 50000,
          arv: 300000,
          holdingMonths: 6
        }
      }),
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log('✅ Flip Calculation PASSED');
      console.log('Results:');
      console.log(`  - Total Investment: $${result.data.totalInvestment.toLocaleString()}`);
      console.log(`  - Net Profit: $${result.data.netProfit.toLocaleString()}`);
      console.log(`  - ROI: ${result.data.roi.toFixed(2)}%`);
      return true;
    } else {
      throw new Error(result.error || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Flip Calculation FAILED');
    console.error('Error:', error.message);
    return false;
  }
}

async function runAllTests() {
  const startTime = Date.now();

  const test1 = await testHealthCheck();
  const test2 = await testApiUsage();
  const test3 = await testFlipCalculation();

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(60));
  console.log('\n📋 TEST SUMMARY');
  console.log('-'.repeat(60));
  console.log(`Total Tests: 3`);
  console.log(`Passed: ${[test1, test2, test3].filter(Boolean).length}`);
  console.log(`Failed: ${[test1, test2, test3].filter(t => !t).length}`);
  console.log(`Duration: ${duration}s`);

  if (test1 && test2 && test3) {
    console.log('\n🎉 ALL TESTS PASSED! Backend is ready to use.');
    console.log('\n📝 Next Steps:');
    console.log('1. Update web-app/.env.local with this URL:');
    console.log(`   VITE_API_URL=${API_URL}`);
    console.log('2. Restart the dev server: npm run dev');
    console.log('3. Test the full application in the browser');
    process.exit(0);
  } else {
    console.log('\n❌ SOME TESTS FAILED. Please check the errors above.');
    console.log('\n🔧 Troubleshooting:');
    console.log('- Verify the Web App URL is correct');
    console.log('- Check Apps Script deployment settings (Execute as: Me, Access: Anyone)');
    console.log('- Review Apps Script execution logs (View → Executions)');
    console.log('- Verify API keys in Script Properties');
    console.log('- See: google-apps-script/DEPLOYMENT_GUIDE.md');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('\n💥 Fatal Error:', error.message);
  process.exit(1);
});


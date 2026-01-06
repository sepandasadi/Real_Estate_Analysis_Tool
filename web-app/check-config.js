#!/usr/bin/env node

/**
 * Configuration Diagnostic Tool
 * Checks environment setup and API configuration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 Real Estate Tool - Configuration Checker');
console.log('='.repeat(50));
console.log('');

// Check for .env files
const files = ['.env', '.env.local', '.env.production'];
console.log('📁 Environment Files:');
files.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`   ${exists ? '✅' : '❌'} ${file} ${exists ? 'exists' : 'not found'}`);
});

console.log('');

// Try to load environment variables
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

console.log('🔧 Environment Variables:');
console.log(`   VITE_API_URL: ${process.env.VITE_API_URL ? '✅ SET' : '❌ NOT SET'}`);
if (process.env.VITE_API_URL) {
  const url = process.env.VITE_API_URL;
  console.log(`   Value: ${url}`);
  console.log('');

  // Validate URL
  console.log('🔍 URL Validation:');

  if (!url || url.trim() === '') {
    console.log('   ❌ URL is empty');
  } else if (url.includes('YOUR_SCRIPT_ID')) {
    console.log('   ❌ URL contains placeholder "YOUR_SCRIPT_ID"');
    console.log('   💡 Replace with actual Script ID from Google Apps Script');
  } else if (!url.startsWith('https://')) {
    console.log('   ⚠️  URL should start with "https://"');
  } else if (!url.includes('script.google.com')) {
    console.log('   ⚠️  URL should contain "script.google.com"');
  } else if (!url.endsWith('/exec')) {
    console.log('   ⚠️  URL should end with "/exec"');
  } else {
    console.log('   ✅ URL format looks correct!');
  }
} else {
  console.log('   ℹ️  App will run in MOCK DATA mode');
}

console.log('');
console.log('📊 Expected Behavior:');
if (process.env.VITE_API_URL &&
    !process.env.VITE_API_URL.includes('YOUR_SCRIPT_ID') &&
    process.env.VITE_API_URL.trim() !== '') {
  console.log('   ✅ Should show: GREEN "LIVE DATA" badge');
  console.log('   ✅ Should display: Real API usage from backend');
  console.log('   ✅ Console should log: "Real API Mode: Connected to backend"');
} else {
  console.log('   🟡 Should show: YELLOW "MOCK DATA" badge');
  console.log('   🟡 Should display: Simulated API usage');
  console.log('   🟡 Console should log: "Mock Data Mode"');
}

console.log('');
console.log('💡 Next Steps:');
if (!process.env.VITE_API_URL) {
  console.log('   1. Edit .env file and add VITE_API_URL');
  console.log('   2. Get URL from: Google Apps Script → Deploy → Manage Deployments');
  console.log('   3. Restart dev server: npm run dev');
} else if (process.env.VITE_API_URL.includes('YOUR_SCRIPT_ID')) {
  console.log('   1. Edit .env file');
  console.log('   2. Replace YOUR_SCRIPT_ID with actual Script ID');
  console.log('   3. Restart dev server: npm run dev');
} else {
  console.log('   1. Open browser at http://localhost:3000');
  console.log('   2. Check browser console (F12) for connection logs');
  console.log('   3. Look for "✅ Real API Mode" or "⚠️ Mock Data Mode"');
  console.log('   4. If still showing mock data, check backend deployment');
}

console.log('');
console.log('🔗 Helpful Links:');
console.log('   Setup Guide: ./SETUP_GUIDE.md');
console.log('   Fix Summary: ../API_USAGE_FIX_SUMMARY.md');
console.log('');


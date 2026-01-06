#!/usr/bin/env node

/**
 * Configuration Diagnostic Tool
 * Checks environment setup and API configuration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 Real Estate Tool - Configuration Checker');
console.log('='.repeat(50));
console.log('');

// Check for .env files
const files = ['.env', '.env.local', '.env.production'];
console.log('📁 Environment Files:');
const foundFiles = [];
files.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  console.log(`   ${exists ? '✅' : '❌'} ${file} ${exists ? 'exists' : 'not found'}`);
  if (exists) foundFiles.push(filePath);
});

console.log('');

// Read and parse .env files
let apiUrl = null;
foundFiles.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.trim().startsWith('VITE_API_URL=')) {
        const value = line.split('=')[1]?.trim().replace(/^["']|["']$/g, '');
        if (value) {
          apiUrl = value;
          console.log(`✅ Found VITE_API_URL in ${path.basename(filePath)}`);
        }
      }
    }
  } catch (err) {
    console.log(`   ⚠️  Could not read ${path.basename(filePath)}: ${err.message}`);
  }
});

console.log('');
console.log('🔧 Configuration:');
if (!apiUrl) {
  console.log('   ❌ VITE_API_URL: NOT SET');
  console.log('');
  console.log('📊 Current Behavior:');
  console.log('   🟡 App is in MOCK DATA mode');
  console.log('   🟡 Showing simulated API usage');
  console.log('   🟡 Using test data for analyses');
} else {
  console.log(`   ✅ VITE_API_URL: SET`);
  console.log(`   Value: ${apiUrl}`);
  console.log('');

  // Validate URL
  console.log('🔍 URL Validation:');

  const issues = [];
  const warnings = [];

  if (apiUrl.trim() === '') {
    issues.push('URL is empty');
  }
  if (apiUrl.includes('YOUR_SCRIPT_ID')) {
    issues.push('URL contains placeholder "YOUR_SCRIPT_ID"');
    warnings.push('Replace with actual Script ID from Google Apps Script');
  }
  if (!apiUrl.startsWith('https://')) {
    warnings.push('URL should start with "https://"');
  }
  if (!apiUrl.includes('script.google.com')) {
    warnings.push('URL should contain "script.google.com"');
  }
  if (!apiUrl.endsWith('/exec')) {
    warnings.push('URL should end with "/exec"');
  }

  if (issues.length === 0 && warnings.length === 0) {
    console.log('   ✅ URL format looks correct!');
  } else {
    issues.forEach(issue => console.log(`   ❌ ${issue}`));
    warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
  }

  console.log('');
  console.log('📊 Expected Behavior:');
  if (issues.length === 0) {
    console.log('   ✅ Should show: GREEN "LIVE DATA" badge');
    console.log('   ✅ Should display: Real API usage from backend');
    console.log('   ✅ Console should log: "Real API Mode: Connected to backend"');
    console.log('');
    console.log('❓ If still showing mock data:');
    console.log('   1. Restart the dev server (stop with Ctrl+C, run: npm run dev)');
    console.log('   2. Clear browser cache and reload (Cmd+Shift+R / Ctrl+Shift+R)');
    console.log('   3. Check browser console (F12) for error messages');
    console.log('   4. Verify backend is deployed and accessible');
  } else {
    console.log('   🟡 Will show: YELLOW "MOCK DATA" badge');
    console.log('   🟡 Will display: Simulated API usage');
    console.log('   🟡 Console will log: "Mock Data Mode"');
  }
}

console.log('');
console.log('💡 Troubleshooting:');
if (!apiUrl) {
  console.log('   • Edit .env or .env.local file');
  console.log('   • Add: VITE_API_URL=your_backend_url');
  console.log('   • Get URL from: Google Apps Script → Deploy → Manage Deployments');
  console.log('   • Restart dev server: npm run dev');
} else if (apiUrl.includes('YOUR_SCRIPT_ID')) {
  console.log('   • Edit .env file');
  console.log('   • Replace YOUR_SCRIPT_ID with actual Script ID');
  console.log('   • Restart dev server: npm run dev');
} else {
  console.log('   • Open browser at http://localhost:3000');
  console.log('   • Open DevTools (F12) → Console tab');
  console.log('   • Look for logs starting with ✅ or ⚠️');
  console.log('   • Take a screenshot if you need help');
}

console.log('');
console.log('📚 Documentation:');
console.log('   • Setup Guide: ./SETUP_GUIDE.md');
console.log('   • Quick Fix: ../QUICK_FIX.md');
console.log('   • Full Details: ../API_USAGE_FIX_SUMMARY.md');
console.log('');


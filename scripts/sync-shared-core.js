#!/usr/bin/env node

/**
 * Sync Shared Core Library
 *
 * This script copies the shared-core directory to both Google Apps Script
 * and Web App directories. Use this as a fallback if symlinks don't work
 * (e.g., on Windows or in CI/CD environments).
 *
 * Usage:
 *   node scripts/sync-shared-core.js
 *   npm run sync-core
 */

const fs = require('fs-extra');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function syncSharedCore() {
  try {
    log('\n🔄 Starting shared-core sync...', 'cyan');

    const source = path.join(__dirname, '../shared-core');
    const targets = [
      {
        path: path.join(__dirname, '../google-apps-script/shared-core'),
        name: 'Google Apps Script'
      },
      {
        path: path.join(__dirname, '../web-app/src/shared-core'),
        name: 'Web App'
      }
    ];

    // Check if source exists
    if (!fs.existsSync(source)) {
      log('❌ Error: shared-core directory not found!', 'red');
      log(`   Expected at: ${source}`, 'red');
      process.exit(1);
    }

    log(`📂 Source: ${source}`, 'cyan');
    log('');

    // Sync to each target
    for (const target of targets) {
      try {
        // Check if target is a symlink
        if (fs.lstatSync(target.path).isSymbolicLink()) {
          log(`⚠️  ${target.name}: Skipping (symlink already exists)`, 'yellow');
          continue;
        }
      } catch (e) {
        // Target doesn't exist, which is fine
      }

      // Copy files
      await fs.copy(source, target.path, {
        overwrite: true,
        filter: (src) => {
          // Skip README.md and other non-code files
          const basename = path.basename(src);
          if (basename === 'README.md' || basename === '.DS_Store') {
            return false;
          }
          return true;
        }
      });

      log(`✅ ${target.name}: Synced successfully`, 'green');
      log(`   Target: ${target.path}`, 'cyan');
    }

    log('');
    log('✨ Sync complete!', 'green');
    log('');

  } catch (error) {
    log('', 'reset');
    log('❌ Sync failed:', 'red');
    log(`   ${error.message}`, 'red');
    log('', 'reset');
    process.exit(1);
  }
}

// Run sync
syncSharedCore();

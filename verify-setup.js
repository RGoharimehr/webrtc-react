#!/usr/bin/env node

/**
 * Setup Verification Script
 * This script helps diagnose common issues with the webrtc-react installation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 WebRTC React Setup Verification\n');
console.log('='.repeat(50));

let hasErrors = false;

// Check 1: Node.js version
try {
  const nodeVersion = process.version;
  console.log(`✓ Node.js version: ${nodeVersion}`);
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 14) {
    console.log('  ⚠️  Warning: Node.js 14 or higher is recommended');
    hasErrors = true;
  }
} catch (error) {
  console.log('✗ Failed to check Node.js version');
  hasErrors = true;
}

// Check 2: npm version
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✓ npm version: ${npmVersion}`);
} catch (error) {
  console.log('✗ Failed to check npm version');
  hasErrors = true;
}

// Check 3: package.json exists and is valid
try {
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('✗ package.json not found');
    hasErrors = true;
  } else {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log('✓ package.json is valid');
    
    // Check dependencies
    const deps = packageJson.dependencies || {};
    const expectedDeps = ['react', 'react-dom', 'react-scripts'];
    const missingDeps = expectedDeps.filter(dep => !deps[dep]);
    
    if (missingDeps.length > 0) {
      console.log(`✗ Missing dependencies: ${missingDeps.join(', ')}`);
      hasErrors = true;
    } else {
      console.log(`✓ All required dependencies present in package.json`);
      console.log(`  - react: ${deps.react}`);
      console.log(`  - react-dom: ${deps['react-dom']}`);
      console.log(`  - react-scripts: ${deps['react-scripts']}`);
    }
  }
} catch (error) {
  console.log('✗ Error reading package.json:', error.message);
  hasErrors = true;
}

// Check 4: node_modules directory
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('⚠️  node_modules directory not found');
  console.log('   → Run "npm install" to install dependencies');
  hasErrors = true;
} else {
  console.log('✓ node_modules directory exists');
  
  // Check if react-scripts is installed
  const reactScriptsPath = path.join(nodeModulesPath, 'react-scripts');
  if (!fs.existsSync(reactScriptsPath)) {
    console.log('✗ react-scripts not installed in node_modules');
    console.log('   → This is the root cause of your issue!');
    hasErrors = true;
  } else {
    console.log('✓ react-scripts is installed');
    
    // Check the number of packages installed
    try {
      const packages = fs.readdirSync(nodeModulesPath);
      const packageCount = packages.length;
      console.log(`✓ Installed packages: ${packageCount}`);
      
      if (packageCount < 100) {
        console.log('  ⚠️  Warning: Too few packages installed (expected ~1000+)');
        console.log('     This suggests an incomplete installation.');
        hasErrors = true;
      }
    } catch (error) {
      console.log('  ⚠️  Could not count installed packages');
    }
  }
}

// Check 5: Required source files
const requiredFiles = [
  'public/index.html',
  'src/index.js',
  'src/App.js'
];

console.log('\n📁 Checking required files:');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ✗ ${file} not found`);
    hasErrors = true;
  }
});

// Summary and recommendations
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Setup Issues Detected\n');
  console.log('📋 Recommended Actions:');
  console.log('1. Delete node_modules folder and package-lock.json:');
  console.log('   Windows: rmdir /s /q node_modules && del package-lock.json');
  console.log('   Unix: rm -rf node_modules package-lock.json');
  console.log('\n2. Clear npm cache:');
  console.log('   npm cache clean --force');
  console.log('\n3. Reinstall dependencies:');
  console.log('   npm install');
  console.log('\n4. If issue persists, try updating npm:');
  console.log('   npm install -g npm@latest');
  process.exit(1);
} else {
  console.log('✅ All checks passed! Your setup looks good.');
  console.log('\nYou can now run:');
  console.log('  npm start    - Start development server');
  console.log('  npm test     - Run tests');
  console.log('  npm run build - Build for production');
  process.exit(0);
}

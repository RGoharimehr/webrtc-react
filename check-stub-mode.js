#!/usr/bin/env node

/**
 * Stub Mode Diagnostic Tool
 * 
 * This script checks why your application is in stub mode
 * and provides actionable steps to exit stub mode if desired.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║     Stub Mode Diagnostic Tool                        ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
    console.log(color + message + colors.reset);
}

function checkNvidiaLibrary() {
    log('\n📦 Checking Frontend (Omniverse WebRTC)...', colors.cyan);
    
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const hasOptionalDep = packageJson.optionalDependencies && 
                               '@nvidia/omniverse-webrtc-streaming-library' in packageJson.optionalDependencies;
        
        log(`   ℹ️  Listed as optional dependency: ${hasOptionalDep ? 'Yes' : 'No'}`, colors.blue);
        
        // Check if actually installed
        const nodeModulesPath = path.join(__dirname, 'node_modules', '@nvidia', 'omniverse-webrtc-streaming-library');
        const isInstalled = fs.existsSync(nodeModulesPath);
        
        if (isInstalled) {
            log('   ✅ NVIDIA library is INSTALLED', colors.green);
            log('   ℹ️  Status: NOT in stub mode (if imports are updated)', colors.blue);
            
            // Check if using stub import
            const appStreamPath = path.join(__dirname, 'src', 'components', 'AppStream.js');
            if (fs.existsSync(appStreamPath)) {
                const content = fs.readFileSync(appStreamPath, 'utf8');
                if (content.includes('omniverse-webrtc-stub')) {
                    log('   ⚠️  WARNING: AppStream.js still imports stub!', colors.yellow);
                    log('   📝 Action: Update import in src/components/AppStream.js', colors.yellow);
                } else if (content.includes('@nvidia/omniverse-webrtc-streaming-library')) {
                    log('   ✅ AppStream.js imports real library', colors.green);
                }
            }
        } else {
            log('   ❌ NVIDIA library is NOT installed', colors.red);
            log('   ℹ️  Status: IN STUB MODE', colors.yellow);
            log('   📝 Reason: Library requires NVIDIA registry access', colors.blue);
            log('   📝 To fix: Get NVIDIA credentials and run: npm install', colors.blue);
        }
        
        // Check .npmrc
        const npmrcPath = path.join(__dirname, '.npmrc');
        if (fs.existsSync(npmrcPath)) {
            const npmrc = fs.readFileSync(npmrcPath, 'utf8');
            if (npmrc.includes('@nvidia:registry')) {
                log('   ✅ .npmrc configured for NVIDIA registry', colors.green);
            }
        } else {
            log('   ⚠️  .npmrc not found', colors.yellow);
        }
        
    } catch (error) {
        log(`   ❌ Error checking: ${error.message}`, colors.red);
    }
}

function checkPythonnet() {
    log('\n🐍 Checking Backend (Flownex Bridge)...', colors.cyan);
    
    try {
        // Check if pythonnet (clr) is installed
        execSync('python -c "import clr; print(\'OK\')"', { stdio: 'pipe' });
        log('   ✅ pythonnet (clr) is INSTALLED', colors.green);
        log('   ℹ️  Status: CAN use real Flownex mode', colors.blue);
        log('   📝 Next: Implement Flownex API calls in flownex_direct.py', colors.blue);
    } catch (error) {
        log('   ❌ pythonnet (clr) is NOT installed', colors.red);
        log('   ℹ️  Status: IN STUB MODE', colors.yellow);
        log('   📝 To fix: pip install pythonnet', colors.blue);
        log('   📝 Note: Works best on Windows with .NET Framework', colors.blue);
    }
    
    // Check the adapter file
    const adapterPath = path.join(__dirname, 'flownex-bridge', 'adapters', 'flownex_direct.py');
    if (fs.existsSync(adapterPath)) {
        const content = fs.readFileSync(adapterPath, 'utf8');
        
        if (content.includes('TODO: REAL IMPLEMENTATION')) {
            log('   ⚠️  Adapter has TODO markers (stub implementations)', colors.yellow);
            log('   📝 Action: Implement real Flownex API calls', colors.blue);
        }
        
        log('   ℹ️  File location: flownex-bridge/adapters/flownex_direct.py', colors.blue);
    }
}

function checkConfiguration() {
    log('\n⚙️  Checking Configuration...', colors.cyan);
    
    // Check stream.config.json
    const streamConfigPath = path.join(__dirname, 'stream.config.json');
    if (fs.existsSync(streamConfigPath)) {
        const config = JSON.parse(fs.readFileSync(streamConfigPath, 'utf8'));
        log(`   ✅ stream.config.json found`, colors.green);
        log(`   ℹ️  Source: ${config.source}`, colors.blue);
        if (config.local) {
            log(`   ℹ️  Server: ${config.local.server}:${config.local.signalingPort}`, colors.blue);
        }
    } else {
        log('   ⚠️  stream.config.json not found', colors.yellow);
    }
    
    // Check requirements.txt
    const requirementsPath = path.join(__dirname, 'flownex-bridge', 'requirements.txt');
    if (fs.existsSync(requirementsPath)) {
        log('   ✅ flownex-bridge/requirements.txt found', colors.green);
        const content = fs.readFileSync(requirementsPath, 'utf8');
        if (!content.includes('pythonnet')) {
            log('   ℹ️  pythonnet not in requirements.txt (add it for production)', colors.blue);
        }
    }
}

function provideSummary() {
    log('\n📊 Summary', colors.cyan);
    log('═══════════════════════════════════════════════════════\n');
    
    log('Your application uses stub mode for:', colors.yellow);
    log('  1. Frontend (Omniverse WebRTC) - Development simulation');
    log('  2. Backend (Flownex Bridge) - No real .NET integration\n');
    
    log('This is NORMAL and allows development without:', colors.green);
    log('  • NVIDIA Omniverse Kit running');
    log('  • Flownex software installed');
    log('  • External dependencies\n');
    
    log('To exit stub mode, see:', colors.blue);
    log('  📄 WHY_STUB_MODE.md - Complete guide');
    log('  📄 OMNIVERSE_STREAMING.md - Omniverse setup');
    log('  📄 BRIDGE_SERVER_FIX.md - Backend architecture\n');
}

function provideNextSteps() {
    log('🎯 Quick Actions:', colors.cyan);
    log('═══════════════════════════════════════════════════════\n');
    
    log('If you want to KEEP stub mode (recommended for development):', colors.green);
    log('  ✅ No action needed - continue developing!\n');
    
    log('If you want to EXIT stub mode:', colors.yellow);
    log('  Frontend:');
    log('    1. Get NVIDIA registry access');
    log('    2. Run: npm install');
    log('    3. Update: src/components/AppStream.js imports');
    log('    4. Start Omniverse Kit with streaming\n');
    
    log('  Backend:');
    log('    1. Run: pip install pythonnet');
    log('    2. Implement Flownex API in flownex_direct.py');
    log('    3. Test with real Flownex project\n');
}

// Run diagnostics
checkNvidiaLibrary();
checkPythonnet();
checkConfiguration();
provideSummary();
provideNextSteps();

log('═══════════════════════════════════════════════════════\n');
log('✨ Diagnostic complete! See WHY_STUB_MODE.md for details.\n', colors.cyan);

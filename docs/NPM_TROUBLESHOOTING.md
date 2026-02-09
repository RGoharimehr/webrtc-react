# Troubleshooting "npm is not recognized"

## Problem

You're trying to run `npm install` or other npm commands, but you get an error like:

**Windows (PowerShell):**
```
npm : The term 'npm' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

**macOS/Linux:**
```
bash: npm: command not found
```

## What This Means

This error means that **npm (Node Package Manager) is not installed** on your computer, or it's not in your system's PATH.

npm comes bundled with Node.js, so you need to install Node.js first.

## Quick Solution

### Step 1: Install Node.js

**Windows:**
1. Go to [nodejs.org](https://nodejs.org/)
2. Click the big green button to download the LTS (Long Term Support) version
3. Run the downloaded installer (.msi file)
4. Follow the installation wizard (keep all default options)
5. **Important:** Make sure "Add to PATH" is checked during installation

**macOS:**
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the macOS installer (.pkg file)
3. Run the installer and follow the prompts

Or use Homebrew:
```bash
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install nodejs npm
```

### Step 2: Verify Installation

Close your current terminal/PowerShell window and open a **new** one, then run:

```bash
node --version
npm --version
```

You should see version numbers like:
```
v18.17.0
9.6.7
```

If you still see "not recognized" or "command not found", see the [Advanced Troubleshooting](#advanced-troubleshooting) section below.

### Step 3: Install Project Dependencies

Now you can run:

```bash
npm install
```

This will download all the packages needed for the project.

## Advanced Troubleshooting

### Windows: Still Getting "Not Recognized" Error

If you installed Node.js but still get the error:

**Option 1: Restart Your Computer**
- Sometimes Windows needs a full restart to update the PATH

**Option 2: Check Installation Location**
1. Check if Node.js is actually installed by looking for this folder:
   - `C:\Program Files\nodejs\`
2. Look for `npm.cmd` and `node.exe` in that folder

**Option 3: Manually Add to PATH**
1. Press `Windows + R`, type `sysdm.cpl`, press Enter
2. Click "Environment Variables" button
3. Under "System variables", find and select "Path"
4. Click "Edit"
5. Click "New" and add: `C:\Program Files\nodejs\`
6. Click OK on all dialogs
7. Close and reopen PowerShell

**Option 4: Use Different Terminal**
- Try using Command Prompt (cmd) instead of PowerShell
- Or try Windows Terminal if you have Windows 11

### macOS: Still Getting "Command Not Found"

**Option 1: Restart Terminal**
- Close all terminal windows
- Open a new one

**Option 2: Check Your Shell**
```bash
echo $SHELL
```

If using zsh (default on newer macOS):
```bash
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

If using bash:
```bash
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bash_profile
source ~/.bash_profile
```

### Linux: Permission Issues

If you get permission errors when running npm:

**Don't use sudo with npm!** Instead, configure npm to use a directory you own:

```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile
```

## Alternative Installation Methods

### Windows: Using Chocolatey

If you have Chocolatey package manager:
```powershell
choco install nodejs
```

### Windows: Using Winget

If you have Windows Package Manager:
```powershell
winget install OpenJS.NodeJS
```

### macOS/Linux: Using nvm (Recommended for Developers)

Node Version Manager allows you to install and switch between different Node.js versions:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal, then:
nvm install --lts
nvm use --lts
```

## Verification Checklist

Before running npm commands, verify:

- ✅ Node.js is installed: `node --version` works
- ✅ npm is installed: `npm --version` works
- ✅ You're in the right directory: `cd webrtc-react`
- ✅ You opened a **new** terminal window after installing Node.js

## Still Having Problems?

1. **Take a screenshot** of the complete error message
2. **Note your system info:**
   - Operating system and version
   - How you installed Node.js
   - Any other error messages
3. **Check the complete [Setup Guide](SETUP_GUIDE.md)** for more detailed instructions
4. **Search online** for your specific error message
5. **Ask for help** on:
   - [Stack Overflow](https://stackoverflow.com/questions/tagged/npm)
   - [Node.js Help](https://github.com/nodejs/help)

## After Successful Installation

Once npm is working, you can:

1. Install project dependencies: `npm install`
2. Start the development server: `npm start`
3. Build for production: `npm run build`

See the main [README.md](../README.md) for more information about using the application.

## Quick Reference

| Command | Purpose |
|---------|---------|
| `node --version` | Check if Node.js is installed |
| `npm --version` | Check if npm is installed |
| `npm install` | Install project dependencies |
| `npm start` | Start development server |
| `npm run build` | Build for production |

## Need More Help?

- 📖 [Complete Setup Guide](SETUP_GUIDE.md) - Detailed installation for all platforms
- 🐛 [Common Issues](SETUP_GUIDE.md#common-issues-and-solutions) - More troubleshooting tips
- 📹 [Viewing Guide](VIEWING_GUIDE.md) - How to view the UI
- 💬 [Open an Issue](https://github.com/RGoharimehr/webrtc-react/issues) - Get help from the community

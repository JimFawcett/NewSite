# Windows Setup Guide

## Quick Start for Windows Users

### Option 1: Using the Batch File (Easiest)

1. Double-click `run_agent.bat` or run from Command Prompt:
   ```cmd
   run_agent.bat
   ```

2. If prompted, enter your API key (or set it permanently first - see below)

3. The script will automatically:
   - Check if Python is installed
   - Install dependencies if needed
   - Launch the agent

### Option 2: Using PowerShell Script

1. Right-click `run_agent.ps1` → "Run with PowerShell"
   
   Or from PowerShell:
   ```powershell
   .\run_agent.ps1
   ```

2. If you get an execution policy error, run PowerShell as Administrator and execute:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### Option 3: Manual Setup

1. Open Command Prompt or PowerShell

2. Install dependencies:
   ```cmd
   pip install -r requirements.txt
   ```

3. Set your API key (choose one):

   **Permanent (recommended):**
   ```cmd
   setx ANTHROPIC_API_KEY your-api-key-here
   ```
   Then close and reopen your terminal.

   **Current session only:**
   ```cmd
   set ANTHROPIC_API_KEY=your-api-key-here
   ```

4. Run the agent:
   ```cmd
   python dev_agent.py
   ```

## Setting the API Key Permanently on Windows

### Method 1: Using Command Prompt
```cmd
setx ANTHROPIC_API_KEY your-api-key-here
```
**Important:** Close and reopen Command Prompt after running this command.

### Method 2: Using PowerShell
```powershell
[System.Environment]::SetEnvironmentVariable('ANTHROPIC_API_KEY','your-api-key-here','User')
```
**Important:** Close and reopen PowerShell after running this command.

### Method 3: Using Windows GUI

1. Press `Win + R` and type `sysdm.cpl`, press Enter
2. Go to the "Advanced" tab
3. Click "Environment Variables"
4. Under "User variables", click "New"
5. Variable name: `ANTHROPIC_API_KEY`
6. Variable value: your API key
7. Click OK on all dialogs
8. Close and reopen any Command Prompt/PowerShell windows

## Verifying Your Setup

### Check Python Installation
```cmd
python --version
```
Should show Python 3.7 or later.

### Check API Key
```cmd
echo %ANTHROPIC_API_KEY%
```
In PowerShell:
```powershell
$env:ANTHROPIC_API_KEY
```
Should display your API key.

### Test the Agent
```cmd
python dev_agent.py --help
```
Should show the help menu without errors.

## Common Windows Issues

### Issue: "python is not recognized"
**Solution:** Python is not in your PATH. Either:
- Reinstall Python and check "Add Python to PATH"
- Or use `py` instead of `python`: `py dev_agent.py`

### Issue: "pip is not recognized"
**Solution:** 
```cmd
python -m pip install -r requirements.txt
```

### Issue: API key not found after using setx
**Solution:** You must close and reopen your terminal after using `setx`.

### Issue: PowerShell script won't run
**Solution:** Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Path with spaces
**Solution:** Use quotes around paths:
```cmd
python dev_agent.py "C:\My Projects\MyApp"
```

## Using from File Explorer

You can drag and drop a folder onto `run_agent.bat` to analyze that folder directly!

Or create a shortcut:
1. Right-click on `run_agent.bat` → Create shortcut
2. Right-click the shortcut → Properties
3. In "Target", add your project path at the end:
   ```
   C:\path\to\run_agent.bat "C:\My Projects\MyApp"
   ```

## Next Steps

Once set up, see [USAGE.md](USAGE.md) for detailed usage instructions and examples.

## Getting Your API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new key
5. Copy and save it securely

**Security Note:** Never commit your API key to version control. The environment variable approach keeps it secure.

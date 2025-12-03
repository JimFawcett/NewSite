# README Generator Agent - Quick Start Guide (Windows 11)

## What You've Built

A complete web application that:
1. Takes a GitHub repository URL as input
2. Fetches repository data from GitHub's API
3. Uses Claude AI to generate a professional README.md
4. Displays a preview of the generated README
5. Allows you to download the README.md file to your computer

## Files Included

- **readme_agent.py** - Main Flask application (Python backend)
- **templates/index.html** - Web interface (HTML + CSS + JavaScript)
- **requirements.txt** - Python dependencies
- **run.ps1** - PowerShell script to start the application
- **PROJECT_README.md** - Full documentation

## Installation & Setup (Windows 11)

### Step 1: Open PowerShell

Press `Win + X` and select "Windows PowerShell" or "Windows Terminal"

### Step 2: Navigate to Project Folder

```powershell
cd path\to\readme-generator-agent
```

### Step 3: Install Dependencies

```powershell
pip install -r requirements.txt
```

Or if using Python launcher:

```powershell
py -m pip install -r requirements.txt
```

### Step 4: Start the Application

**Option A: Using the PowerShell script**
```powershell
.\run.ps1
```

If you get an execution policy error, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Then try `.\run.ps1` again.

**Option B: Direct Python command**
```powershell
python readme_agent.py
```

Or:
```powershell
py readme_agent.py
```

The server will start on `http://localhost:5000`

### Step 5: Open in Browser

Navigate to: `http://localhost:5000`

## How to Use

1. **Enter a GitHub URL**
   - Example: `https://github.com/torvalds/linux`
   - Must be a public repository

2. **Click "Generate README"**
   - The app will fetch repository data
   - Claude AI will analyze and generate the README
   - This takes about 10-15 seconds

3. **Review the Preview**
   - See the complete generated README
   - Check repository stats (stars, forks, language)

4. **Download the File**
   - Click "Download README.md"
   - File saves to your Downloads folder (typically `C:\Users\YourName\Downloads`)

5. **Generate Another** (optional)
   - Click "Generate Another" to start over

## Example Repositories to Try

- `https://github.com/facebook/react`
- `https://github.com/python/cpython`
- `https://github.com/microsoft/vscode`
- `https://github.com/tensorflow/tensorflow`

## Architecture

```
User Browser
    ↓
Flask Web Server (Python)
    ↓
GitHub API → Fetch repo data
    ↓
Claude API → Generate README
    ↓
Return to Browser → Preview & Download
```

## Technologies

- **Backend**: Python 3 + Flask
- **Frontend**: Vanilla HTML/CSS/JavaScript (no frameworks)
- **APIs**: GitHub REST API, Anthropic Claude API
- **No database needed** - all processing is real-time

## Customization Tips

### Change README Format
Edit the prompt in `readme_agent.py` in the `generate_readme_with_claude()` function:

```python
prompt = f"""You are a technical writer...
# Modify this prompt to change the README style/sections
"""
```

### Change Port
In `readme_agent.py`, modify the last line:

```python
app.run(debug=True, host='0.0.0.0', port=8080)  # Change 5000 to 8080
```

### Add Custom Styling
Edit the `<style>` section in `templates/index.html`

## Troubleshooting (Windows 11)

**Problem**: "python is not recognized as an internal or external command"
**Solution**: 
- Install Python from https://www.python.org/downloads/
- During installation, check "Add Python to PATH"
- Or use `py` command instead of `python`

**Problem**: "pip is not recognized"
**Solution**: Use `py -m pip` instead of `pip`

**Problem**: PowerShell script won't run
**Solution**: 
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Problem**: "Module not found" errors
**Solution**: 
```powershell
pip install -r requirements.txt
# Or
py -m pip install -r requirements.txt
```

**Problem**: "Repository not found"
**Solution**: Make sure the repository is public and URL is correct

**Problem**: Port 5000 already in use
**Solution**: Change the port number in `readme_agent.py` (last line)

**Problem**: Claude API errors
**Solution**: Ensure you have proper Anthropic API access

**Problem**: UTF-8 encoding errors
**Solution**: The app is already configured for Windows UTF-8. If issues persist, run:
```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
```

## Windows-Specific Notes

### File Paths
- Use backslashes `\` or forward slashes `/` in Windows paths
- PowerShell supports both: `cd C:\Projects` or `cd C:/Projects`

### Python Commands
Windows supports multiple Python commands:
- `python` - Standard Python command
- `py` - Python launcher (recommended for Windows)
- `python3` - Sometimes available

Use whichever works on your system.

### Running PowerShell Scripts
By default, PowerShell restricts script execution. To allow:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

This is safe and only affects your user account.

## API Rate Limits

- **GitHub API**: 60 requests/hour (unauthenticated)
- **Claude API**: Depends on your Anthropic plan

## Security Notes

- Never commit API keys to version control
- Use environment variables for production
- This app doesn't store any data
- All processing happens in real-time

## Stopping the Server

Press `Ctrl + C` in the PowerShell window to stop the Flask server.

## Next Steps

1. **Add GitHub Authentication** - Increase API rate limits
2. **Add Caching** - Store generated READMEs temporarily
3. **Multiple Templates** - Let users choose README styles
4. **Batch Processing** - Generate READMEs for multiple repos
5. **Deploy Online** - Host on Heroku, Railway, or similar

## File Structure

```
readme-generator-agent/
├── readme_agent.py          # Flask backend
├── templates/
│   └── index.html          # Web UI
├── requirements.txt        # Dependencies
├── run.ps1                 # PowerShell start script
└── PROJECT_README.md       # Full docs
```

## Windows Terminal Tips

For a better experience, use Windows Terminal (available from Microsoft Store):
- Better colors and fonts
- Multiple tabs
- Split panes
- Customizable themes

## Support

- Check PROJECT_README.md for detailed documentation
- Test with small repositories first
- Review generated READMEs before using in production

---

**Happy README Generating! 🚀**


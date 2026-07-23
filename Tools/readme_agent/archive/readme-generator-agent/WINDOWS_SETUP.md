# Windows 11 Setup Guide - README Generator Agent

Complete guide for setting up and running the README Generator Agent on Windows 11.

---

## 📋 Prerequisites

### 1. Check Windows Version
Press `Win + R`, type `winver`, and press Enter.
- You should have Windows 11 (build 22000 or higher)

### 2. Install Python
1. Visit https://www.python.org/downloads/
2. Download Python 3.8 or higher (3.11+ recommended)
3. **IMPORTANT**: During installation, check "Add Python to PATH"
4. Click "Install Now"

### 3. Verify Python Installation
Open PowerShell and run:
```powershell
python --version
```

If that doesn't work, try:
```powershell
py --version
```

You should see: `Python 3.x.x`

---

## 🚀 Installation Steps

### Step 1: Open PowerShell

**Option A**: Right-click Start menu → "Windows Terminal" or "PowerShell"

**Option B**: Press `Win + X` → Select "Windows PowerShell" or "Terminal"

**Option C**: Press `Win + R`, type `powershell`, press Enter

### Step 2: Navigate to Project Folder

```powershell
# Example: If your files are in Downloads
cd $env:USERPROFILE\Downloads\readme-generator-agent

# Or if on Desktop
cd $env:USERPROFILE\Desktop\readme-generator-agent

# Or specify full path
cd "C:\Users\YourName\Documents\readme-generator-agent"
```

**Tip**: You can drag and drop the folder into PowerShell to auto-fill the path!

### Step 3: Install Dependencies

**Method A - Using pip:**
```powershell
pip install -r requirements.txt
```

**Method B - Using Python launcher (recommended):**
```powershell
py -m pip install -r requirements.txt
```

**Method C - If you get permission errors:**
```powershell
pip install --user -r requirements.txt
```

You should see packages installing:
- Flask
- requests
- anthropic

### Step 4: Enable PowerShell Scripts (First Time Only)

If you want to use the `run.ps1` script, run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Type `Y` and press Enter when prompted.

**This is safe** - it only allows scripts you've written or downloaded from the internet (if signed) to run.

### Step 5: Start the Application

**Option A - Using the PowerShell script:**
```powershell
.\run.ps1
```

**Option B - Direct Python command:**
```powershell
python readme_agent.py
```

**Option C - Using Python launcher:**
```powershell
py readme_agent.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.x.x:5000
```

### Step 6: Open Your Browser

Open any web browser and navigate to:
```
http://localhost:5000
```

You should see the README Generator interface! 🎉

---

## 🎯 Using the Application

### Generate Your First README

1. **Find a GitHub Repository**
   - Example: `https://github.com/microsoft/vscode`

2. **Paste the URL**
   - Click in the input field
   - Paste the GitHub URL
   - Click "Generate README"

3. **Wait for Generation**
   - Takes 10-15 seconds
   - You'll see status updates

4. **Download Your README**
   - Preview appears on screen
   - Click "Download README.md"
   - File saves to your Downloads folder

### Downloads Location

Your README.md files will be saved to:
```
C:\Users\YourName\Downloads\README.md
```

**Tip**: If you download multiple READMEs, Windows will append numbers:
- `README.md`
- `README (1).md`
- `README (2).md`

---

## 🔧 Common Windows Issues & Solutions

### Issue 1: "python is not recognized"

**Problem**: Windows can't find Python

**Solution A** - Reinstall Python:
1. Download from https://python.org
2. **Check "Add Python to PATH"** during installation
3. Restart PowerShell

**Solution B** - Use Python launcher:
```powershell
py readme_agent.py
```

**Solution C** - Add Python to PATH manually:
1. Search for "Environment Variables" in Start menu
2. Click "Environment Variables"
3. Under "User variables", find "Path"
4. Click "Edit" → "New"
5. Add: `C:\Users\YourName\AppData\Local\Programs\Python\Python3xx`

### Issue 2: PowerShell Script Won't Run

**Problem**: `.\run.ps1` gives an error about execution policy

**Solution**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try again:
```powershell
.\run.ps1
```

### Issue 3: "pip is not recognized"

**Problem**: pip command not found

**Solution** - Use Python launcher:
```powershell
py -m pip install -r requirements.txt
```

### Issue 4: Port 5000 Already in Use

**Problem**: Another application is using port 5000

**Solution A** - Use a different port:
1. Open `readme_agent.py` in Notepad
2. Find the last line: `app.run(debug=True, host='0.0.0.0', port=5000)`
3. Change `port=5000` to `port=8080`
4. Save the file
5. Access at `http://localhost:8080`

**Solution B** - Find and close the application using port 5000:
```powershell
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

### Issue 5: Can't Download README

**Problem**: Download button doesn't work

**Solution**:
1. Check browser's download settings
2. Try a different browser (Chrome, Edge, Firefox)
3. Check if Downloads folder has write permissions

### Issue 6: UTF-8 Encoding Errors

**Problem**: Special characters display incorrectly

**Solution** - The app is already configured for Windows UTF-8. If issues persist:
```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001
```

### Issue 7: Firewall Warning

**Problem**: Windows Firewall asks for permission

**Solution**: Click "Allow Access" - Flask needs network access to serve the web page

---

## 🎨 Windows-Specific Tips

### Using Windows Terminal (Recommended)

Windows Terminal provides a better experience:

1. **Install from Microsoft Store**
   - Search "Windows Terminal"
   - Click "Get" or "Install"

2. **Benefits**:
   - Better colors and fonts
   - Multiple tabs
   - Split panes
   - Copy/paste with Ctrl+C / Ctrl+V

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Copy in PowerShell | `Ctrl + C` (in Windows Terminal) |
| Paste in PowerShell | `Ctrl + V` (in Windows Terminal) |
| Stop server | `Ctrl + C` |
| Clear screen | `cls` or `Clear-Host` |
| Previous command | `↑` Arrow |

### File Explorer Integration

**Quick way to open PowerShell in folder**:
1. Open File Explorer
2. Navigate to project folder
3. Click in the address bar
4. Type `powershell` and press Enter
5. PowerShell opens in that folder!

### Creating a Desktop Shortcut

1. Right-click Desktop → New → Shortcut
2. **Target**: 
   ```
   powershell.exe -ExecutionPolicy Bypass -File "C:\path\to\run.ps1"
   ```
3. **Name**: README Generator
4. Double-click to run!

---

## 📁 Project Structure (Windows Paths)

```
C:\Users\YourName\Documents\readme-generator-agent\
│
├── readme_agent.py          # Main application
├── requirements.txt         # Dependencies
├── run.ps1                  # PowerShell script
│
├── templates\
│   └── index.html           # Web interface
│
└── Documentation\
    ├── README.md
    ├── QUICK_START.md
    └── ... (other docs)
```

---

## 🔒 Security & Permissions

### Antivirus Software

Some antivirus software may flag Python scripts:
- This is a **false positive**
- The code is open source and safe
- Add an exception if needed

### Windows Defender

If Windows Defender blocks execution:
1. Open Windows Security
2. Virus & threat protection
3. Manage settings
4. Add exclusion
5. Add folder: Your project folder

---

## 🌐 Network Configuration

### Accessing from Other Devices

To access from other computers on your network:

1. **Find your IP address**:
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)

2. **Allow through firewall**:
   - Windows Firewall will prompt you
   - Click "Allow access"

3. **Access from other device**:
   - Open browser on other device
   - Go to: `http://YOUR_IP:5000`
   - Example: `http://192.168.1.100:5000`

### Using with WSL (Windows Subsystem for Linux)

If you prefer Linux commands:

1. **Install WSL**:
   ```powershell
   wsl --install
   ```

2. **Access Windows files**:
   ```bash
   cd /mnt/c/Users/YourName/Documents/readme-generator-agent
   ```

3. **Run the app**:
   ```bash
   pip3 install -r requirements.txt
   python3 readme_agent.py
   ```

---

## 🛑 Stopping the Application

**To stop the Flask server:**

Press `Ctrl + C` in the PowerShell window

You'll see:
```
KeyboardInterrupt
```

The server is now stopped.

---

## 📊 System Requirements

| Component | Requirement |
|-----------|-------------|
| **OS** | Windows 11 (build 22000+) |
| **Python** | 3.8 or higher |
| **RAM** | 2 GB minimum, 4 GB recommended |
| **Disk Space** | 100 MB for app + dependencies |
| **Internet** | Required (for APIs) |
| **Browser** | Chrome, Edge, Firefox (any modern browser) |

---

## 🔄 Updating the Application

If you download an updated version:

1. **Stop the current server** (Ctrl + C)

2. **Update dependencies**:
   ```powershell
   pip install -r requirements.txt --upgrade
   ```

3. **Restart the server**:
   ```powershell
   python readme_agent.py
   ```

---

## 💡 Pro Tips for Windows Users

### 1. Create a Batch File Alternative

Create `start.bat` in the project folder:
```batch
@echo off
python readme_agent.py
pause
```

Double-click to run!

### 2. Pin PowerShell to Taskbar

1. Search for "PowerShell"
2. Right-click → Pin to taskbar
3. Quick access anytime

### 3. Use Virtual Environment (Advanced)

Keep dependencies isolated:

```powershell
# Create virtual environment
py -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run app
python readme_agent.py
```

### 4. Auto-start on Login (Advanced)

1. Press `Win + R`
2. Type `shell:startup`
3. Create shortcut to `run.ps1` here

---

## 🆘 Getting Help

### Within Documentation
- **Quick issues**: See above solutions
- **Setup help**: This file
- **Usage help**: `QUICK_START.md`
- **Technical details**: `ARCHITECTURE.md`

### Online Resources
- Python documentation: https://docs.python.org
- PowerShell help: Type `Get-Help <command>`
- Flask documentation: https://flask.palletsprojects.com

---

## ✅ Verification Checklist

Before you start, verify:

- [ ] Python installed (run `python --version`)
- [ ] pip working (run `pip --version`)
- [ ] Project files downloaded
- [ ] PowerShell can access project folder
- [ ] Internet connection active
- [ ] No other app using port 5000

After installation:

- [ ] Dependencies installed (no errors)
- [ ] Server starts successfully
- [ ] Can access http://localhost:5000
- [ ] Web page loads correctly
- [ ] Can paste GitHub URL
- [ ] Generate button works
- [ ] Download works

---

## 🎉 You're All Set!

Your README Generator Agent is now ready to use on Windows 11!

**To start**:
```powershell
python readme_agent.py
```

**Then visit**: http://localhost:5000

**Happy generating! 🚀**

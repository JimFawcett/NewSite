# README Generator Agent - Windows 11 Edition

**AI-powered professional README generation for GitHub repositories**

**🪟 Optimized for Windows 11 with PowerShell**

---

## ⚡ Quick Start (3 Commands)

Open **PowerShell** and run:

```powershell
# 1. Install
pip install -r requirements.txt

# 2. Run
python readme_agent.py

# 3. Visit
# http://localhost:5000
```

**That's it!** 🎉

---

## 📦 What This Does

Automatically generates professional README.md files by:
1. ✅ Analyzing GitHub repository data
2. ✅ Using Claude AI to create content
3. ✅ Providing instant preview
4. ✅ One-click download to your PC

**Time**: 10-15 seconds per README  
**Input**: Any public GitHub URL  
**Output**: Professional, comprehensive README.md

---

## 🪟 Windows-Specific Features

- **PowerShell script** (`run.ps1`) for easy startup
- **Automatic Python detection** (python, py, python3)
- **UTF-8 encoding** pre-configured for Windows
- **Windows paths** support (C:\Users\...)
- **Download to** your Windows Downloads folder

---

## 📋 What You Need

| Requirement | Details |
|-------------|---------|
| **OS** | Windows 11 |
| **Python** | 3.8+ ([Download](https://python.org)) |
| **Shell** | PowerShell or Windows Terminal |
| **Internet** | Required for APIs |
| **Browser** | Any modern browser |

---

## 🚀 Installation Guide

### Step 1: Install Python

1. Go to https://python.org/downloads
2. Download Python 3.8+ (3.11+ recommended)
3. **IMPORTANT**: Check "Add Python to PATH" ✅
4. Click "Install Now"

### Step 2: Open PowerShell

Press `Win + X` → Select "Windows PowerShell" or "Terminal"

### Step 3: Navigate to Folder

```powershell
cd C:\path\to\readme-generator-agent
# Or drag and drop the folder into PowerShell
```

### Step 4: Install Dependencies

```powershell
pip install -r requirements.txt
```

**If that doesn't work**, try:
```powershell
py -m pip install -r requirements.txt
```

### Step 5: Start Application

**Option A**: Using PowerShell script
```powershell
.\run.ps1
```

**Option B**: Direct command
```powershell
python readme_agent.py
```

### Step 6: Open Browser

Visit: **http://localhost:5000**

---

## 🎯 How to Use

1. **Paste GitHub URL**  
   Example: `https://github.com/microsoft/vscode`

2. **Click "Generate README"**  
   Wait 10-15 seconds

3. **Review Preview**  
   See stats, features, formatting

4. **Download**  
   Saves to `C:\Users\YourName\Downloads\README.md`

---

## 📁 Files Included

### Core Application
- `readme_agent.py` - Flask web server
- `templates\index.html` - Web interface  
- `requirements.txt` - Python packages
- `run.ps1` - PowerShell startup script

### Documentation (11 Guides!)
- `WINDOWS_README.md` - This file
- `WINDOWS_SETUP.md` - Detailed Windows guide
- `START_HERE.md` - Main entry point
- `QUICK_START.md` - Fast setup
- `SUMMARY.md` - Complete overview
- `VISUAL_GUIDE.md` - ASCII diagrams
- `ARCHITECTURE.md` - System design
- `PROJECT_README.md` - Full technical docs
- `EXAMPLE_OUTPUT.md` - Sample output
- `FILE_INDEX.md` - File reference
- `README.md` - General readme

---

## 🔧 Common Windows Issues

### Problem: "python is not recognized"

**Solution**: 
```powershell
# Use Python launcher instead
py readme_agent.py
```

Or reinstall Python with "Add to PATH" checked.

### Problem: Script won't run

**Solution**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problem: "Module not found"

**Solution**:
```powershell
pip install -r requirements.txt
```

### Problem: Port already in use

**Solution**: Edit `readme_agent.py`, change last line:
```python
app.run(debug=True, host='0.0.0.0', port=8080)  # Changed from 5000
```

---

## 💡 Pro Tips

### Use Windows Terminal
- Better colors and fonts
- Multiple tabs
- Get it from Microsoft Store

### Create Desktop Shortcut
1. Right-click Desktop → New → Shortcut
2. Target: `powershell.exe -ExecutionPolicy Bypass -File "C:\path\to\run.ps1"`
3. Name it "README Generator"
4. Double-click to run!

### Quick Folder Navigation
In File Explorer:
1. Navigate to project folder
2. Click address bar
3. Type `powershell`
4. Press Enter
5. PowerShell opens in that folder!

---

## 📖 Documentation Quick Guide

**Just want to run it?**  
→ Follow Quick Start above

**Need detailed Windows setup?**  
→ Read `WINDOWS_SETUP.md` (most comprehensive)

**Want complete overview?**  
→ Read `START_HERE.md`

**Prefer visual guides?**  
→ Read `VISUAL_GUIDE.md`

**Need troubleshooting?**  
→ Check `WINDOWS_SETUP.md` or `QUICK_START.md`

**Want to customize?**  
→ Read `ARCHITECTURE.md` and `PROJECT_README.md`

---

## 🎓 What You'll Get

Generated READMEs include:
- ✅ Project title with badges
- ✅ Professional description
- ✅ Feature list
- ✅ Installation steps
- ✅ Usage examples
- ✅ Technology stack
- ✅ Contributing guidelines
- ✅ License section

**Quality**: Production-ready documentation  
**Length**: 150-300 lines of Markdown  
**Sections**: 7-10 comprehensive sections

---

## 🛠️ Customization

### Change README Style
Edit `readme_agent.py`, find `generate_readme_with_claude()`, modify the prompt

### Change UI Colors
Edit `templates\index.html`, find the `<style>` section

### Change Port
Edit `readme_agent.py`, last line: `port=5000` → `port=8080`

---

## 🔒 Privacy & Security

- ✅ No data storage
- ✅ No accounts needed
- ✅ Works offline (except API calls)
- ✅ No tracking
- ✅ Open source

**Your data**: Never stored anywhere  
**API calls**: Only to GitHub and Claude (required)

---

## ⚙️ System Requirements

| Component | Requirement |
|-----------|-------------|
| OS | Windows 11 |
| Python | 3.8+ |
| RAM | 2 GB minimum |
| Disk | 100 MB |
| Network | Required |

---

## 🌟 Features

- 🤖 **AI-Powered**: Claude Sonnet 4.5
- ⚡ **Fast**: 10-15 seconds generation
- 🎨 **Beautiful UI**: Modern, responsive
- 📊 **Smart Analysis**: Auto-detects languages, structure
- 💾 **Easy Download**: One-click to Downloads folder
- 🔧 **Customizable**: Edit prompts and styles
- 📱 **Responsive**: Works on all screen sizes

---

## 🆘 Need Help?

1. **Setup issues**: Read `WINDOWS_SETUP.md`
2. **Quick fixes**: Check troubleshooting above
3. **Understanding system**: Read `ARCHITECTURE.md`
4. **All details**: Read `PROJECT_README.md`

---

## ✅ Pre-Flight Checklist

Before starting:
- [ ] Python 3.8+ installed
- [ ] "Add to PATH" was checked
- [ ] PowerShell available
- [ ] Internet connected
- [ ] Project files downloaded

After installation:
- [ ] Dependencies installed (no errors)
- [ ] Server starts (no errors)
- [ ] Browser opens http://localhost:5000
- [ ] Page loads correctly

If all checked: **You're ready!** 🎉

---

## 🚀 Next Steps

1. **Run the app**: `python readme_agent.py`
2. **Try an example**: Generate README for `https://github.com/microsoft/vscode`
3. **Explore docs**: Read other documentation files
4. **Customize**: Edit prompts to match your style
5. **Share**: Generate READMEs for your projects!

---

## 📞 Additional Resources

- **Python Help**: https://docs.python.org
- **PowerShell Help**: Type `Get-Help` in PowerShell
- **Flask Docs**: https://flask.palletsprojects.com
- **GitHub API**: https://docs.github.com/en/rest

---

## 🎉 You're All Set!

Everything is configured for Windows 11. Just run:

```powershell
python readme_agent.py
```

Then visit: **http://localhost:5000**

**Stop server**: Press `Ctrl + C`

---

**Made with ❤️ for Windows 11 Users**

**Happy README Generating! 🚀**

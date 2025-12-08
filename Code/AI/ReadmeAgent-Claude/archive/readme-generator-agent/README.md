# README Generator Agent (Windows 11)

**Generate professional README.md files for any public GitHub repository using AI**

**Optimized for Windows 11 with PowerShell**

---

## 🚀 Quick Start (Windows 11)

**Open PowerShell and run:**

```powershell
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the application
python readme_agent.py
# Or use: .\run.ps1

# 3. Open your browser
# Visit: http://localhost:5000
```

That's it! You're ready to generate READMEs.

**Note**: If `python` doesn't work, try `py` instead.

---

## 📦 What's This?

A Python web application that automatically creates comprehensive, professional README files for GitHub repositories using Claude AI.

**Features:**
- 🤖 AI-powered README generation
- 🔍 Automatic repository analysis
- 👀 Live preview before download
- 💾 One-click download
- 🎨 Clean, modern interface
- ⚡ Fast (10-15 seconds per README)

---

## 📚 Documentation

This package includes comprehensive documentation:

| File | Purpose | Read Time |
|------|---------|-----------|
| **START_HERE.md** | Main entry point - start here! | 3 min |
| **QUICK_START.md** | Fast setup and usage guide | 3 min |
| **SUMMARY.md** | Complete overview | 5 min |
| **VISUAL_GUIDE.md** | Visual walkthrough with diagrams | 5 min |
| **PROJECT_README.md** | Full technical documentation | 10 min |
| **ARCHITECTURE.md** | System design and architecture | 8 min |
| **EXAMPLE_OUTPUT.md** | Sample generated README | 3 min |
| **FILE_INDEX.md** | Guide to all files | 5 min |

**👉 New users should start with START_HERE.md**

---

## 🎯 How to Use

1. **Start the server**: `python readme_agent.py`
2. **Open browser**: Navigate to `http://localhost:5000`
3. **Enter URL**: Paste a GitHub repository URL
4. **Generate**: Click "Generate README" button
5. **Download**: Review preview and download your README.md

**Example URLs to try:**
- `https://github.com/facebook/react`
- `https://github.com/python/cpython`
- `https://github.com/microsoft/vscode`

---

## 📁 Package Contents

### Core Application Files
- `readme_agent.py` - Flask web server (backend)
- `templates\index.html` - Web interface (frontend)
- `requirements.txt` - Python dependencies
- `run.ps1` - PowerShell start script (Windows)

### Documentation Files
- `README.md` - This file
- `START_HERE.md` - Main entry point
- `QUICK_START.md` - Setup guide
- `SUMMARY.md` - Complete overview
- `VISUAL_GUIDE.md` - Visual walkthrough
- `PROJECT_README.md` - Full documentation
- `ARCHITECTURE.md` - System design
- `EXAMPLE_OUTPUT.md` - Sample output
- `FILE_INDEX.md` - File reference

---

## 💻 Requirements

- Python 3.8 or higher
- Internet connection
- Web browser
- Anthropic API access (Claude)

---

## 🔧 Technology Stack

- **Backend**: Python 3, Flask
- **Frontend**: HTML5, CSS3, JavaScript (vanilla, no frameworks!)
- **APIs**: GitHub REST API, Anthropic Claude API

---

## ⚙️ Installation (Windows 11)

### Method 1: PowerShell Script (Recommended)
```powershell
# First time only: Enable script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run the script
.\run.ps1
```

### Method 2: Manual Installation
```powershell
# Install dependencies
pip install -r requirements.txt

# Start the server
python readme_agent.py
```

### Method 3: Using Python Launcher
```powershell
# If 'python' doesn't work, use 'py'
py -m pip install -r requirements.txt
py readme_agent.py
```

---

## 🎓 What You Get

Generated READMEs include:
- Project title and description with badges
- Key features
- Installation instructions
- Usage examples
- Project structure
- Technologies used
- Contributing guidelines
- License information

---

## 🛠️ Customization

**Change UI styling:**
Edit `templates/index.html` (CSS in `<style>` section)

**Change README format:**
Edit `readme_agent.py` (modify prompt in `generate_readme_with_claude()`)

**Change port:**
Edit `readme_agent.py` (last line: `app.run(port=5000)`)

---

## 📖 Documentation Guide

**Choose your path:**

🏃 **Just want to use it?**  
→ Run `python readme_agent.py` and go!

⚡ **Want quick setup?**  
→ Read `QUICK_START.md`

🎨 **Visual learner?**  
→ Read `VISUAL_GUIDE.md`

🧠 **Want full understanding?**  
→ Read `START_HERE.md` then `SUMMARY.md`

🔧 **Want to customize?**  
→ Read `ARCHITECTURE.md` and `PROJECT_README.md`

---

## 🐛 Troubleshooting (Windows 11)

**Python not recognized:**  
Install Python from https://python.org and check "Add to PATH" during installation. Or use `py` instead of `python`.

**PowerShell script won't run:**  
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Module not found:**  
```powershell
pip install -r requirements.txt
# Or
py -m pip install -r requirements.txt
```

**Repository not found:**  
Ensure URL is correct and repository is public

**Port already in use:**  
Change port in `readme_agent.py` (last line)

**For more help:**  
See `QUICK_START.md` Windows troubleshooting section

---

## 📊 Performance

- **Generation time**: 10-15 seconds
- **README length**: 150-300 lines
- **Sections included**: 7-10 main sections

---

## 🔒 Privacy & Security

- ✅ No data storage
- ✅ No user accounts required
- ✅ Public repositories only
- ✅ All processing in real-time
- ✅ No tracking or analytics

---

## 📝 License

This project is provided as-is for educational and practical use.

---

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

## 🌟 Key Benefits

- **Save time** on documentation
- **Professional output** every time
- **Easy to use** - no technical knowledge needed
- **Customizable** - make it your own
- **Open source** - learn and modify

---

## 🎯 Next Steps

1. Read `START_HERE.md` for detailed guidance
2. Run the application
3. Try generating a README
4. Explore the documentation
5. Customize to your needs

---

## 📞 Getting Help

All your questions are answered in the documentation:

- **Setup issues**: `QUICK_START.md`
- **Understanding the system**: `ARCHITECTURE.md`
- **Full details**: `PROJECT_README.md`
- **Finding files**: `FILE_INDEX.md`

---

**Ready to generate amazing READMEs?**

**PowerShell:**
```powershell
python readme_agent.py
# Or: .\run.ps1
```

**Then visit**: `http://localhost:5000`

**Happy documenting! 🚀**

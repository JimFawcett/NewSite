# Quick Start Guide - Rust Crate Analyzer

Get up and running in 60 seconds!

## Installation (Windows 11)

1. **Download the files:**
   - `rust_crate_analyzer.py`
   - `analyze_crate.ps1` (PowerShell wrapper)

2. **Place them in a convenient location:**
   ```
   C:\Tools\rust-analyzer\
   ├── rust_crate_analyzer.py
   └── analyze_crate.ps1
   ```

## Quick Usage

### Option 1: PowerShell (Recommended for Windows)

```powershell
# Navigate to your tool directory
cd C:\Tools\rust-analyzer

# Run the analyzer
.\analyze_crate.ps1 C:\path\to\your\rust\crate
```

### Option 2: Python Direct

```powershell
# From anywhere
python C:\Tools\rust-analyzer\rust_crate_analyzer.py C:\path\to\your\rust\crate
```

### Option 3: Current Directory

```powershell
# If you're already in your crate directory
python C:\Tools\rust-analyzer\rust_crate_analyzer.py .
```

## What You'll Get

After running the analyzer on your crate:

```
your_crate/
├── Cargo.toml
├── src/
│   └── lib.rs
├── your_crate_interface.md    ← NEW: API documentation
└── examples/
    └── demo.rs                 ← NEW: Example application
```

## Example Output

### 1. Documentation File: `your_crate_interface.md`

```markdown
# your_crate - Public Interface

## Overview
- **Structs**: 5
- **Enums**: 3
- **Functions**: 12
...

## Structs

### `Config`
*Defined in: `lib.rs`*
```rust
pub struct Config {
    pub name: String,
    pub port: u16,
}
```
...
```

### 2. Example Code: `examples/demo.rs`

```rust
use your_crate::*;

fn main() {
    println!("Demonstrating your_crate");
    
    // Struct demonstrations
    // let config = Config { /* fields */ };
    
    // Function demonstrations
    // initialize(config);
    ...
}
```

## Running the Generated Example

After generation, you can run the example:

```bash
cargo run --example demo
```

## Common Use Cases

### 1. Document Your Library

```powershell
# Generate docs before releasing
.\analyze_crate.ps1 C:\projects\my_awesome_lib

# Commit the generated documentation
git add my_awesome_lib_interface.md examples/demo.rs
git commit -m "Add API documentation and example"
```

### 2. Onboard New Developers

```powershell
# Generate up-to-date API overview
.\analyze_crate.ps1 .

# New devs can now read the markdown to understand the API
```

### 3. Review API Changes

```powershell
# Before making changes
.\analyze_crate.ps1 . 
git add *_interface.md
git commit -m "API before refactor"

# After making changes
.\analyze_crate.ps1 .
git diff *_interface.md  # See what changed!
```

## Testing the Analyzer

Want to see it in action first?

```powershell
# Run the test script
python test_analyzer.py
```

This creates a sample crate, analyzes it, and shows you the results.

## Tips & Tricks

### Tip 1: Add to System PATH

Add the tool directory to your PATH for easy access:

```powershell
# Add to PowerShell profile
$env:Path += ";C:\Tools\rust-analyzer"

# Now you can run from anywhere
analyze_crate.ps1 C:\any\crate\path
```

### Tip 2: Create an Alias

```powershell
# Add to PowerShell profile
function Analyze-RustCrate {
    param([string]$Path = ".")
    python C:\Tools\rust-analyzer\rust_crate_analyzer.py $Path
}

# Usage
Analyze-RustCrate                    # Current directory
Analyze-RustCrate C:\path\to\crate  # Specific crate
```

### Tip 3: Integrate with Your Editor

**VS Code Task:**

Create `.vscode/tasks.json`:

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Generate API Docs",
            "type": "shell",
            "command": "python",
            "args": [
                "C:/Tools/rust-analyzer/rust_crate_analyzer.py",
                "${workspaceFolder}"
            ],
            "problemMatcher": [],
            "group": "build"
        }
    ]
}
```

Then: `Ctrl+Shift+B` → Select "Generate API Docs"

## Troubleshooting

### "Python not found"

**Solution:** Install Python from https://www.python.org/downloads/

Make sure to check "Add Python to PATH" during installation.

### "Crate path does not exist"

**Solution:** Verify the path is correct:

```powershell
# Check if path exists
Test-Path C:\path\to\crate

# List contents
dir C:\path\to\crate
```

The directory should contain `Cargo.toml` and `src/`.

### "Source directory does not exist"

**Solution:** Ensure your crate has this structure:

```
your_crate/
├── Cargo.toml    ← Must exist
└── src/          ← Must exist
    └── lib.rs    ← Or main.rs
```

### PowerShell Execution Policy

If you get an execution policy error:

```powershell
# Check current policy
Get-ExecutionPolicy

# Set policy (run as Administrator)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Next Steps

1. ✅ Run the analyzer on one of your crates
2. ✅ Review the generated markdown
3. ✅ Customize the example code
4. ✅ Share with your team!

## Need Help?

Check the full README.md for:
- Detailed feature list
- Advanced customization
- Integration examples
- API reference

Happy analyzing! 🦀

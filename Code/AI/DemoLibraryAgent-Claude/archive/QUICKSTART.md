# Quick Start Guide

## Get Started in 3 Steps

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Your API Key

Get your API key from https://console.anthropic.com/

```bash
# Linux/macOS
export ANTHROPIC_API_KEY='your-api-key-here'

# Windows PowerShell
$env:ANTHROPIC_API_KEY='your-api-key-here'
```

### 3. Run the Agent

```bash
python interface_demo_agent.py <path-to-your-project>
```

## Example Run

Try it on the included example project:

```bash
python interface_demo_agent.py ./example_project
```

This will analyze the two Python libraries in `example_project/src/` and generate:
- Interface documentation (JSON)
- Demo applications (Python)

## See a Demo Without API Key

Run the walkthrough demo to see what the agent does:

```bash
python demo_walkthrough.py
```

## What Gets Generated?

For each library file, you get:

1. **Interface Documentation** (`*_interface.json`)
   - Complete function signatures
   - Parameter descriptions
   - Return types
   - Dependencies

2. **Demo Application** (`*_demo.py/rs/cpp/etc`)
   - Runnable code
   - Examples for every function
   - Clear output
   - Error handling

## Common Use Cases

### Document a Python Library
```bash
python interface_demo_agent.py ./my_python_lib
```

### Analyze Rust Crate
```bash
python interface_demo_agent.py ./my_rust_crate ./rust_demos
```

### Review C++ Headers
```bash
python interface_demo_agent.py ./cpp_project/include
```

## Programmatic Usage

```python
from interface_demo_agent import InterfaceDemoAgent

agent = InterfaceDemoAgent()
results = agent.process_project("./my_project")

print(f"Processed {results['files_processed']} files")
```

## Troubleshooting

**No library files found?**
- Check that files are in `src/`, `lib/`, or `include/` directories
- Verify file extensions match supported languages

**API errors?**
- Confirm your API key is set correctly
- Check your internet connection
- Verify API access on console.anthropic.com

## Next Steps

Read the full [README.md](README.md) for:
- Detailed feature explanations
- Advanced usage patterns
- Configuration options
- All supported languages

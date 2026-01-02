# Interface Demo Agent - Project Summary

## Overview

This project provides an AI-powered agent that automatically analyzes library code and generates comprehensive demonstration applications. Using the Anthropic Claude API, it extracts public interfaces from library files and creates runnable examples in the library's native language.

## Key Files

### Core Application
- **`interface_demo_agent.py`** - Main agent implementation (460 lines)
  - `InterfaceDemoAgent` class with full interface extraction and demo generation
  - Multi-language support (Python, Rust, C++, C#, Java, JavaScript, TypeScript, Go, Ruby)
  - Command-line interface for easy usage

### Documentation
- **`README.md`** - Comprehensive documentation
  - Features and capabilities
  - Installation instructions
  - Usage examples
  - Advanced usage patterns
  - Troubleshooting guide

- **`QUICKSTART.md`** - Quick start guide for immediate usage

### Examples
- **`example_project/`** - Sample project for demonstration
  - `src/math_utils.py` - Math utility library (5 functions)
  - `src/string_utils.py` - String utility library (7 functions)

- **`demo_walkthrough.py`** - Interactive demonstration script
  - Shows agent workflow without requiring API key
  - Displays example outputs

### Dependencies
- **`requirements.txt`** - Python package requirements
  - anthropic>=0.40.0

## How It Works

### 1. Library Discovery
The agent scans project directories and identifies library files based on:
- File extensions (.py, .rs, .cpp, .cs, etc.)
- Directory structure (src/, lib/, include/)
- Naming patterns (lib.rs, __init__.py, headers)

### 2. Interface Extraction
For each library file:
- Reads the source code
- Sends to Claude API with structured prompt
- Receives JSON-formatted interface data including:
  - Function signatures
  - Parameter types and descriptions
  - Return types
  - Class definitions
  - Dependencies

### 3. Demo Generation
Using the extracted interface:
- Sends interface data to Claude API
- Receives complete, runnable demonstration code
- Includes examples for every public function
- Adds clear output and error handling

### 4. Output Generation
Creates organized output:
```
interface_demos/
├── library_name_interface.json  # Interface documentation
├── library_name_demo.py         # Demonstration application
└── generation_summary.json      # Processing report
```

## Technical Architecture

### Class Structure
```python
InterfaceDemoAgent
├── __init__(api_key)
├── find_library_files(project_path) → List[(filepath, language)]
├── extract_public_interface(filepath, language) → Dict
├── generate_demo_application(interface_data) → str
└── process_project(project_path, output_dir) → Dict
```

### Language Support
- **Python**: Functions, classes, type hints
- **Rust**: Functions, structs, traits, impl blocks
- **C++**: Functions, classes, templates, namespaces
- **C#**: Methods, classes, properties, interfaces
- **Java**: Methods, classes, interfaces
- **JavaScript/TypeScript**: Functions, classes, exports
- **Go**: Functions, structs, methods
- **Ruby**: Methods, classes, modules

### API Integration
Uses Claude Sonnet 4 model with:
- 4000 max tokens for interface extraction
- 8000 max tokens for demo generation
- JSON-formatted prompts for structured output
- Error handling and retry logic

## Usage Examples

### Command Line
```bash
# Basic usage
python interface_demo_agent.py ./my_project

# Custom output directory
python interface_demo_agent.py ./my_project ./demos

# With environment variable
export ANTHROPIC_API_KEY='sk-...'
python interface_demo_agent.py ./my_rust_crate
```

### Programmatic
```python
from interface_demo_agent import InterfaceDemoAgent

# Initialize
agent = InterfaceDemoAgent(api_key="sk-...")

# Process entire project
results = agent.process_project("./my_project")

# Process single file
interface = agent.extract_public_interface(
    filepath="./src/lib.py",
    language="python"
)

# Generate demo from interface
demo_code = agent.generate_demo_application(interface)
```

## Example Output

### Interface JSON
```json
{
  "library_name": "math_utils",
  "purpose": "Mathematical utility functions",
  "language": "python",
  "public_functions": [
    {
      "name": "factorial",
      "signature": "def factorial(n: int) -> int",
      "parameters": [{"name": "n", "type": "int", "description": "Non-negative integer"}],
      "return_type": "int",
      "description": "Calculate factorial"
    }
  ],
  "dependencies": ["typing"]
}
```

### Generated Demo
```python
#!/usr/bin/env python3
"""Auto-generated demonstration"""
from src.math_utils import factorial

def main():
    print("=== Factorial Demonstration ===")
    for n in [0, 1, 5, 10]:
        result = factorial(n)
        print(f"factorial({n}) = {result}")

if __name__ == "__main__":
    main()
```

## Benefits

### For Developers
- **Save Time**: Automatic documentation and examples
- **Better Onboarding**: New team members see working examples
- **API Validation**: Verify public interface design
- **Cross-Language**: Works with multiple languages

### For Teams
- **Consistent Documentation**: AI-generated examples follow patterns
- **Always Updated**: Regenerate when code changes
- **Quality Examples**: Production-ready demonstration code

### For Projects
- **Documentation**: Comprehensive interface docs
- **Testing**: Demo code can become integration tests
- **Learning**: Example usage for every function

## Limitations

- Requires Anthropic API access (paid)
- Limited to text-based source files
- Token limits for very large files (4K/8K tokens)
- Quality depends on code documentation
- Cannot analyze binary libraries

## Future Enhancements

Potential improvements:
- Support for more languages (Kotlin, Swift, PHP)
- Batch processing with parallel API calls
- Integration with documentation generators (Sphinx, Doxygen)
- Generate unit tests instead of demos
- Support for analyzing related files together
- Custom output templates
- Web interface for project upload

## Testing

### Run Demo Walkthrough
```bash
python demo_walkthrough.py
```

Shows complete workflow without API key.

### Test with Example Project
```bash
# Set API key
export ANTHROPIC_API_KEY='your-key'

# Run on example
python interface_demo_agent.py ./example_project

# Check outputs
ls example_project/interface_demos/
```

## Performance

Typical processing times (with API):
- Small project (5 files): ~30 seconds
- Medium project (20 files): ~2 minutes  
- Large project (50 files): ~5 minutes

API costs (approximate):
- Interface extraction: ~$0.01 per file
- Demo generation: ~$0.02 per file
- Total: ~$0.03 per library file

## Requirements

- **Python**: 3.7 or higher
- **API Key**: Anthropic API access
- **Network**: Internet connection
- **Storage**: Minimal (JSON + code files)

## Support

For issues or questions:
1. Check QUICKSTART.md for common problems
2. Review README.md for detailed documentation
3. Run demo_walkthrough.py to verify setup
4. Check Anthropic API status

## License

MIT License - free to use and modify

## Credits

Built using:
- Anthropic Claude API
- Python 3
- Example libraries for demonstration

---

**Created**: January 2026
**Version**: 1.0.0
**Agent Model**: Claude Sonnet 4 (claude-sonnet-4-20250514)

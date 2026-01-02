# Interface Demo Agent

An intelligent agent that uses the Anthropic Claude API to analyze library files in a project directory, extract their public interfaces, and automatically generate demonstration applications in the library's native language.

## Features

- 🔍 **Automatic Library Detection**: Scans project directories and identifies library files across multiple languages
- 📋 **Interface Extraction**: Uses Claude AI to analyze code and extract public interfaces including functions, classes, and types
- 🔨 **Demo Generation**: Creates complete, runnable demonstration applications that showcase every public function
- 🌐 **Multi-Language Support**: Supports Python, Rust, C++, C#, Java, JavaScript/TypeScript, Go, and Ruby
- 📊 **Detailed Documentation**: Generates JSON interface documentation alongside demo code

## Supported Languages

| Language | File Extensions | Library Detection |
|----------|----------------|-------------------|
| Python | `.py` | `__init__.py`, `lib/`, `src/` |
| Rust | `.rs` | `lib.rs`, `src/lib.rs` |
| C++ | `.cpp`, `.hpp`, `.h` | `include/`, header files |
| C# | `.cs` | Class files |
| Java | `.java` | Class files |
| JavaScript | `.js` | Library files |
| TypeScript | `.ts` | Library files |
| Go | `.go` | Library files |
| Ruby | `.rb` | Library files |

## Installation

1. **Clone or download this repository**

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Set up your Anthropic API key**:
```bash
# Linux/macOS
export ANTHROPIC_API_KEY='your-api-key-here'

# Windows (PowerShell)
$env:ANTHROPIC_API_KEY='your-api-key-here'

# Or create a .env file
echo "ANTHROPIC_API_KEY=your-api-key-here" > .env
```

Get your API key from: https://console.anthropic.com/

## Usage

### Basic Usage

```bash
python interface_demo_agent.py <project_path>
```

This will:
1. Scan the project directory for library files
2. Extract public interfaces using Claude AI
3. Generate demonstration applications
4. Save everything to `<project_path>/interface_demos/`

### Specify Custom Output Directory

```bash
python interface_demo_agent.py <project_path> <output_directory>
```

### Examples

**Analyze a Python project:**
```bash
python interface_demo_agent.py ./my_python_library
```

**Analyze a Rust project:**
```bash
python interface_demo_agent.py ./my_rust_crate ./rust_demos
```

**Analyze a C++ project:**
```bash
python interface_demo_agent.py ./my_cpp_library ./cpp_examples
```

## Output Structure

The agent generates the following outputs for each library file:

```
interface_demos/
├── generation_summary.json          # Overall processing summary
├── library_name_interface.json      # Detailed interface documentation
├── library_name_demo.py             # Demonstration application
└── ...
```

### Interface Documentation (JSON)

Each `*_interface.json` file contains:

```json
{
  "library_name": "math_utils",
  "purpose": "Mathematical utility functions",
  "language": "python",
  "filepath": "/path/to/math_utils.py",
  "public_functions": [
    {
      "name": "calculate_factorial",
      "signature": "def calculate_factorial(n: int) -> int",
      "parameters": [
        {
          "name": "n",
          "type": "int",
          "description": "Non-negative integer"
        }
      ],
      "return_type": "int",
      "description": "Calculates factorial of n"
    }
  ],
  "public_classes": [],
  "dependencies": ["math"]
}
```

### Demo Application

Each `*_demo.*` file is a complete, runnable application that demonstrates all public functions with:
- Proper imports and setup
- Example usage for each function
- Clear output showing results
- Error handling
- Informative comments

## Example Workflow

Let's say you have a Python project with this structure:

```
my_project/
├── src/
│   ├── math_utils.py
│   └── string_utils.py
└── tests/
    └── test_utils.py
```

Running the agent:

```bash
python interface_demo_agent.py ./my_project
```

Output:

```
🔍 Scanning project: ./my_project
📚 Found 2 library files

📄 Processing: ./my_project/src/math_utils.py
   Language: python
   ⚙️  Extracting public interface...
   🔨 Generating demonstration application...
   ✅ Generated: math_utils_demo.py

📄 Processing: ./my_project/src/string_utils.py
   Language: python
   ⚙️  Extracting public interface...
   🔨 Generating demonstration application...
   ✅ Generated: string_utils_demo.py

✨ Complete! Processed 2 files
📂 Output directory: ./my_project/interface_demos
```

## Use Cases

### 1. **Documentation Generation**
Automatically generate comprehensive API documentation and usage examples for your libraries.

### 2. **Learning and Onboarding**
Help new team members understand library interfaces through working examples.

### 3. **Testing and Validation**
Create demonstration code that exercises all public functions for manual testing.

### 4. **Migration Assistance**
When migrating to new libraries, quickly understand the public API surface.

### 5. **Code Review**
Review public interfaces and their intended usage patterns.

## Advanced Usage

### Programmatic Usage

You can also use the agent programmatically in your own Python scripts:

```python
from interface_demo_agent import InterfaceDemoAgent

# Initialize agent
agent = InterfaceDemoAgent(api_key="your-api-key")

# Process a project
results = agent.process_project(
    project_path="./my_project",
    output_dir="./demos"
)

# Access results
print(f"Processed {results['files_processed']} files")
for demo in results['demos_generated']:
    print(f"Generated: {demo['demo_app']}")
```

### Extract Interface Only

```python
agent = InterfaceDemoAgent()

# Just extract interface from a single file
interface = agent.extract_public_interface(
    filepath="./src/mylib.py",
    language="python"
)

print(interface['purpose'])
for func in interface['public_functions']:
    print(f"  - {func['name']}: {func['description']}")
```

### Generate Demo Only

```python
# Assuming you have interface_data from previous extraction
demo_code = agent.generate_demo_application(interface_data)
print(demo_code)
```

## Configuration

The agent intelligently filters directories and files:

**Excluded directories:**
- `.git`, `__pycache__`, `node_modules`
- `target`, `build`, `dist`
- `venv`, `.venv`, `bin`, `obj`

**Library file identification:**
- Python: Files in `lib/` or `src/` directories, `__init__.py` files
- Rust: `lib.rs` files
- C++: Header files in `include/` directories
- C#: `.cs` files (excluding `Program.cs`)

## Requirements

- Python 3.7+
- Anthropic API key (with API access)
- `anthropic` Python package (installed via requirements.txt)

## How It Works

1. **Discovery Phase**: The agent walks the project directory tree, identifying library files based on language-specific patterns.

2. **Analysis Phase**: For each library file:
   - Reads the source code
   - Sends it to Claude API with a structured prompt
   - Receives JSON-formatted interface description

3. **Generation Phase**: For each interface:
   - Sends interface documentation to Claude API
   - Receives complete, runnable demonstration code
   - Saves both interface JSON and demo application

4. **Documentation Phase**: Creates a summary report with all generated artifacts.

## Troubleshooting

### "ANTHROPIC_API_KEY must be provided"
Set your API key as an environment variable or pass it when creating the agent.

### "No library files found"
The project may not contain recognized library files. Check:
- File extensions match supported languages
- Files are in typical library directories (`src/`, `lib/`, `include/`)
- Test files are excluded (they contain `test_` or `_test`)

### API Errors
- Verify your API key is valid
- Check your API usage limits
- Ensure you have internet connectivity

## Limitations

- Requires active Anthropic API access
- Large files may hit token limits (uses up to 4000 tokens for extraction, 8000 for generation)
- Binary files and compiled libraries cannot be analyzed
- Quality depends on code documentation and structure

## Contributing

Suggestions for improvements:
- Add support for more programming languages
- Enhance library file detection heuristics
- Add support for analyzing multiple related files together
- Generate integration tests instead of just demos
- Support for custom output templates

## License

MIT License - feel free to use and modify for your projects.

## Author

Created with Claude AI assistance to help developers quickly understand and demonstrate library interfaces.

## Changelog

### Version 1.0.0
- Initial release
- Support for 8 programming languages
- Automatic interface extraction
- Demo application generation
- JSON documentation output

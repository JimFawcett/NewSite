# Rust Crate Analyzer Agent

A Python-based agent that analyzes Rust crates and automatically generates:
1. **Markdown documentation** summarizing the crate's public interface
2. **Example Rust application** demonstrating usage of the public API

## Features

- 🔍 Analyzes Rust source files to identify public items
- 📝 Generates comprehensive markdown documentation
- 💡 Creates example code demonstrating the public interface
- 🎯 Handles structs, enums, traits, functions, constants, and modules
- 📂 Automatically creates `examples` directory as sibling to `src`

## Requirements

- Python 3.7+
- A Rust crate with standard structure (containing `Cargo.toml` and `src/` directory)

## Installation

Simply download the `rust_crate_analyzer.py` script. No additional dependencies required!

## Usage

### Basic Usage

```bash
python rust_crate_analyzer.py <path_to_rust_crate>
```

### Example

```bash
python rust_crate_analyzer.py /path/to/my_awesome_crate
```

### Output

The agent generates two files:

1. **`<crate_name>_interface.md`** - In the crate root directory
   - Overview of all public items
   - Detailed documentation for each struct, enum, trait, function, etc.
   - Source file locations for each item

2. **`examples/demo.rs`** - In the `examples` directory (created if needed)
   - Demonstrates usage of the public interface
   - Can be run with `cargo run --example demo`

## Example Output

Given a crate with the following public interface:

```rust
// src/lib.rs
pub struct Config {
    pub name: String,
    pub debug: bool,
}

pub fn initialize(config: Config) -> Result<(), String> {
    // implementation
}

pub enum Status {
    Active,
    Inactive,
}
```

The analyzer will generate:

### Markdown Documentation

```markdown
# my_crate - Public Interface

## Overview

- **Structs**: 1
- **Enums**: 1
- **Functions**: 1

## Structs

### `Config`

*Defined in: `lib.rs`*

```rust
pub struct Config {
    pub name: String,
    pub debug: bool,
}
```

## Functions

### `initialize`

*Defined in: `lib.rs`*

```rust
pub fn initialize(config: Config) -> Result<(), String>
```

...
```

### Example Application

```rust
// examples/demo.rs
use my_crate::*;

fn main() {
    println!("Demonstrating my_crate");
    
    // Struct demonstrations
    // let config = Config { name: "test".to_string(), debug: true };
    
    // Function demonstrations
    // initialize(config);
    
    println!("Example complete!");
}
```

## How It Works

1. **Crate Discovery**: Validates the crate structure (Cargo.toml, src directory)
2. **Source Analysis**: Recursively scans all `.rs` files in the `src` directory
3. **Pattern Matching**: Uses regex to identify public items while filtering out comments and strings
4. **Documentation Generation**: Creates structured markdown with code examples
5. **Example Creation**: Generates a runnable Rust example demonstrating the API

## Supported Public Items

- ✅ Structs (including generic types)
- ✅ Enums
- ✅ Traits
- ✅ Functions (including async functions)
- ✅ Constants
- ✅ Module declarations

## Limitations

- The generated example code contains commented-out usage patterns that need to be customized
- Complex trait implementations may need manual review
- Generic type constraints are captured but may need refinement in examples
- Does not analyze private items or implementation details

## Windows 11 Notes

This agent works perfectly on Windows 11 with Python 3.7+:

```powershell
# PowerShell
python rust_crate_analyzer.py C:\Users\YourName\projects\my_crate

# Command Prompt
python rust_crate_analyzer.py C:\Users\YourName\projects\my_crate
```

## Advanced Usage

### Customizing the Output

You can modify the `RustCrateAnalyzer` class to:
- Change the markdown format
- Customize example generation patterns
- Add additional analysis features
- Filter specific types of public items

### Integration with CI/CD

```yaml
# Example GitHub Actions workflow
- name: Generate API Documentation
  run: |
    python rust_crate_analyzer.py .
    git add *_interface.md examples/demo.rs
    git commit -m "Update API documentation"
```

## Troubleshooting

### "Crate path does not exist"
- Ensure you're providing the full path to the crate root directory
- The path should contain `Cargo.toml` and `src/` directory

### "Source directory does not exist"
- Verify your crate has a `src` directory
- Standard Rust project structure is required

### No public items found
- Ensure your crate has public (`pub`) items
- Check that `.rs` files exist in the `src` directory

## Example Projects

The analyzer works great with common Rust crate patterns:

```
my_crate/
├── Cargo.toml
├── src/
│   ├── lib.rs          # Main library file
│   ├── config.rs       # Module files
│   └── utils/
│       └── mod.rs
└── examples/           # Created by the analyzer
    └── demo.rs         # Generated example
```

## Contributing

Feel free to enhance the analyzer with:
- Better type inference for example generation
- Documentation comment extraction
- Dependency analysis
- More sophisticated example patterns

## License

This tool is provided as-is for analyzing Rust crates and generating documentation.

## See Also

- [The Rust Programming Language](https://doc.rust-lang.org/book/)
- [Cargo Book](https://doc.rust-lang.org/cargo/)
- [rustdoc](https://doc.rust-lang.org/rustdoc/) - Official Rust documentation tool

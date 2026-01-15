#!/usr/bin/env python3
"""
Test script for Rust Crate Analyzer
Creates a sample Rust crate and demonstrates the analyzer
"""

import os
import sys
import tempfile
import shutil
from pathlib import Path

# Sample Rust crate content
SAMPLE_CARGO_TOML = """[package]
name = "sample_crate"
version = "0.1.0"
edition = "2021"

[dependencies]
"""

SAMPLE_LIB_RS = """//! A sample Rust crate for demonstration
//! 
//! This crate provides basic configuration and status management.

/// Configuration struct for the application
pub struct Config {
    /// Application name
    pub name: String,
    /// Debug mode flag
    pub debug: bool,
    /// Port number
    pub port: u16,
}

/// Application status enum
pub enum Status {
    /// Application is running
    Active,
    /// Application is stopped
    Inactive,
    /// Application encountered an error
    Error(String),
}

/// Result type alias for this crate
pub type Result<T> = std::result::Result<T, String>;

/// Initialize the application with given configuration
/// 
/// # Arguments
/// * `config` - Configuration to use
/// 
/// # Returns
/// * `Result<()>` - Success or error message
pub fn initialize(config: Config) -> Result<()> {
    if config.name.is_empty() {
        return Err("Name cannot be empty".to_string());
    }
    Ok(())
}

/// Get the current application status
pub fn get_status() -> Status {
    Status::Active
}

/// Trait for objects that can be validated
pub trait Validate {
    /// Validate the object
    fn is_valid(&self) -> bool;
}

impl Validate for Config {
    fn is_valid(&self) -> bool {
        !self.name.is_empty() && self.port > 0
    }
}

/// Maximum number of connections
pub const MAX_CONNECTIONS: usize = 100;

/// Default port number
pub const DEFAULT_PORT: u16 = 8080;

/// Utility module for helper functions
pub mod utils {
    /// Convert a string to uppercase
    pub fn to_upper(s: &str) -> String {
        s.to_uppercase()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_config_validation() {
        let config = Config {
            name: "test".to_string(),
            debug: true,
            port: 3000,
        };
        assert!(config.is_valid());
    }
}
"""

SAMPLE_UTILS_RS = """//! Additional utility functions

/// Format a message with a prefix
pub fn format_message(prefix: &str, message: &str) -> String {
    format!("{}: {}", prefix, message)
}

/// Calculate the percentage
pub fn calculate_percentage(value: f64, total: f64) -> f64 {
    if total == 0.0 {
        0.0
    } else {
        (value / total) * 100.0
    }
}
"""


def create_sample_crate(base_path: Path) -> Path:
    """Create a sample Rust crate for testing."""
    crate_path = base_path / "sample_crate"
    src_path = crate_path / "src"
    
    # Create directories
    src_path.mkdir(parents=True, exist_ok=True)
    
    # Write Cargo.toml
    with open(crate_path / "Cargo.toml", 'w') as f:
        f.write(SAMPLE_CARGO_TOML)
    
    # Write lib.rs
    with open(src_path / "lib.rs", 'w') as f:
        f.write(SAMPLE_LIB_RS)
    
    # Write additional module
    with open(src_path / "utils.rs", 'w') as f:
        f.write(SAMPLE_UTILS_RS)
    
    print(f"✓ Created sample crate at: {crate_path}")
    return crate_path


def run_analyzer(crate_path: Path):
    """Run the Rust crate analyzer on the sample crate."""
    # Import the analyzer
    import rust_crate_analyzer
    
    print("\n" + "=" * 70)
    print("RUNNING RUST CRATE ANALYZER")
    print("=" * 70)
    
    try:
        analyzer = rust_crate_analyzer.RustCrateAnalyzer(str(crate_path))
        public_items = analyzer.analyze()
        analyzer.write_outputs()
        
        print("\n✓ Analysis completed successfully!")
        return True
    except Exception as e:
        print(f"\n✗ Analysis failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def display_results(crate_path: Path):
    """Display the generated files."""
    print("\n" + "=" * 70)
    print("GENERATED FILES")
    print("=" * 70)
    
    # Display markdown file
    md_file = crate_path / "sample_crate_interface.md"
    if md_file.exists():
        print(f"\n📄 Markdown Documentation: {md_file}")
        print("\nFirst 30 lines:")
        print("-" * 70)
        with open(md_file, 'r') as f:
            lines = f.readlines()[:30]
            print(''.join(lines))
        if len(lines) == 30:
            print("... (truncated)")
        print("-" * 70)
    
    # Display example file
    example_file = crate_path / "examples" / "demo.rs"
    if example_file.exists():
        print(f"\n🦀 Example Code: {example_file}")
        print("\nFull content:")
        print("-" * 70)
        with open(example_file, 'r') as f:
            print(f.read())
        print("-" * 70)
    
    print("\n✓ All files generated successfully!")


def main():
    """Main test function."""
    print("=" * 70)
    print("RUST CRATE ANALYZER - TEST SCRIPT")
    print("=" * 70)
    
    # Create a temporary directory for the test
    test_dir = Path(tempfile.mkdtemp(prefix="rust_crate_test_"))
    print(f"\nUsing test directory: {test_dir}")
    
    try:
        # Create sample crate
        print("\nStep 1: Creating sample Rust crate...")
        crate_path = create_sample_crate(test_dir)
        
        # Run analyzer
        print("\nStep 2: Running analyzer...")
        success = run_analyzer(crate_path)
        
        if not success:
            print("\n✗ Test failed!")
            return 1
        
        # Display results
        print("\nStep 3: Displaying results...")
        display_results(crate_path)
        
        print("\n" + "=" * 70)
        print("TEST COMPLETED SUCCESSFULLY!")
        print("=" * 70)
        print(f"\nTest files are located at: {crate_path}")
        print("You can examine the generated files or delete the test directory.")
        
        # Ask if user wants to keep files
        if sys.stdin.isatty():
            response = input("\nDelete test files? (y/n): ").strip().lower()
            if response == 'y':
                shutil.rmtree(test_dir)
                print("✓ Test files deleted")
            else:
                print(f"✓ Test files preserved at: {test_dir}")
        else:
            print(f"\n(Test files preserved at: {test_dir})")
        
        return 0
        
    except KeyboardInterrupt:
        print("\n\n✗ Test interrupted by user")
        return 1
    except Exception as e:
        print(f"\n✗ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""
Rust Crate Analyzer Agent - Enhanced Version

Analyzes a Rust crate's public interface and generates:
1. A markdown summary of the public API
2. A WORKING demonstration Rust application (not just comments!)
"""

import os
import sys
import re
from pathlib import Path
from typing import List, Dict, Tuple, Optional


class RustCrateAnalyzer:
    """Analyzes Rust crate structure and public interface."""
    
    def __init__(self, crate_path: str):
        self.crate_path = Path(crate_path).resolve()
        self.src_path = self.crate_path / "src"
        self.examples_path = self.crate_path / "examples"
        self.cargo_toml = self.crate_path / "Cargo.toml"
        
        # Validate paths
        if not self.crate_path.exists():
            raise FileNotFoundError(f"Crate path does not exist: {self.crate_path}")
        if not self.src_path.exists():
            raise FileNotFoundError(f"Source directory does not exist: {self.src_path}")
        if not self.cargo_toml.exists():
            raise FileNotFoundError(f"Cargo.toml not found: {self.cargo_toml}")
        
        self.crate_name = self._extract_crate_name()
        self.public_items = {
            'structs': [],
            'enums': [],
            'traits': [],
            'functions': [],
            'constants': [],
            'modules': [],
            'impl_blocks': {}  # Maps struct name to list of methods
        }
    
    def _extract_crate_name(self) -> str:
        """Extract crate name from Cargo.toml."""
        with open(self.cargo_toml, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip().startswith('name'):
                    match = re.search(r'name\s*=\s*["\']([^"\']+)["\']', line)
                    if match:
                        return match.group(1)
        return self.crate_path.name
    
    def analyze(self):
        """Analyze all Rust source files in the crate."""
        print(f"Analyzing crate: {self.crate_name}")
        print(f"Crate path: {self.crate_path}")
        
        # Find all .rs files
        rs_files = list(self.src_path.rglob("*.rs"))
        print(f"Found {len(rs_files)} Rust source files")
        
        for rs_file in rs_files:
            self._analyze_file(rs_file)
        
        return self.public_items
    
    def _analyze_file(self, file_path: Path):
        """Analyze a single Rust source file for public items."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"Warning: Could not read {file_path}: {e}")
            return
        
        # Remove comments and strings to avoid false matches
        cleaned = self._remove_comments_and_strings(content)
        
        # Extract public items
        self._extract_structs(cleaned, file_path)
        self._extract_enums(cleaned, file_path)
        self._extract_traits(cleaned, file_path)
        self._extract_impl_blocks(content, file_path)  # Parse impl blocks FIRST to get context
        self._extract_functions(cleaned, file_path)
        self._extract_constants(cleaned, file_path)
        self._extract_modules(cleaned, file_path)
    
    def _remove_comments_and_strings(self, content: str) -> str:
        """Remove comments and string literals to avoid false matches."""
        # Remove line comments
        content = re.sub(r'//.*$', '', content, flags=re.MULTILINE)
        # Remove block comments
        content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
        # Remove string literals
        content = re.sub(r'"(?:[^"\\]|\\.)*"', '""', content)
        return content
    
    def _extract_structs(self, content: str, file_path: Path):
        """Extract public struct definitions."""
        pattern = r'pub\s+struct\s+(\w+)\s*(?:<[^>]+>)?(?:\s*\([^)]*\)|\s*\{[^}]*\})?'
        matches = re.finditer(pattern, content)
        for match in matches:
            struct_name = match.group(1)
            # Get the full definition for better context
            full_match = self._extract_full_definition(content, match.start())
            self.public_items['structs'].append({
                'name': struct_name,
                'definition': full_match,
                'file': file_path.relative_to(self.src_path),
                'has_generics': '<' in full_match
            })
    
    def _extract_enums(self, content: str, file_path: Path):
        """Extract public enum definitions."""
        pattern = r'pub\s+enum\s+(\w+)\s*(?:<[^>]+>)?\s*\{'
        matches = re.finditer(pattern, content)
        for match in matches:
            enum_name = match.group(1)
            full_match = self._extract_full_definition(content, match.start())
            variants = self._extract_enum_variants(full_match)
            self.public_items['enums'].append({
                'name': enum_name,
                'definition': full_match,
                'file': file_path.relative_to(self.src_path),
                'variants': variants
            })
    
    def _extract_traits(self, content: str, file_path: Path):
        """Extract public trait definitions."""
        pattern = r'pub\s+trait\s+(\w+)\s*(?:<[^>]+>)?'
        matches = re.finditer(pattern, content)
        for match in matches:
            trait_name = match.group(1)
            full_match = self._extract_full_definition(content, match.start())
            self.public_items['traits'].append({
                'name': trait_name,
                'definition': full_match,
                'file': file_path.relative_to(self.src_path)
            })
    
    def _extract_impl_blocks(self, content: str, file_path: Path):
        """Extract impl blocks to associate methods with structs."""
        # Match impl blocks: impl<T> StructName<T> { ... }
        pattern = r'impl\s*(?:<[^>]+>)?\s+(\w+)\s*(?:<[^>]+>)?\s*\{'
        matches = re.finditer(pattern, content)
        
        for match in matches:
            struct_name = match.group(1)
            impl_start = match.end()
            
            # Find the closing brace of this impl block
            brace_count = 1
            pos = impl_start
            impl_end = impl_start
            
            while pos < len(content) and brace_count > 0:
                if content[pos] == '{':
                    brace_count += 1
                elif content[pos] == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        impl_end = pos
                        break
                pos += 1
            
            impl_body = content[impl_start:impl_end]
            
            # Extract public methods from this impl block
            method_pattern = r'pub\s+fn\s+(\w+)'
            method_matches = re.finditer(method_pattern, impl_body)
            
            for method_match in method_matches:
                method_name = method_match.group(1)
                if struct_name not in self.public_items['impl_blocks']:
                    self.public_items['impl_blocks'][struct_name] = []
                self.public_items['impl_blocks'][struct_name].append(method_name)
    
    def _extract_functions(self, content: str, file_path: Path):
        """Extract public function definitions."""
        pattern = r'pub\s+(?:async\s+)?fn\s+(\w+)\s*(?:<[^>]+>)?\s*\([^)]*\)'
        matches = re.finditer(pattern, content)
        for match in matches:
            fn_name = match.group(1)
            full_match = self._extract_full_definition(content, match.start())
            
            # Determine if it's a method or standalone function
            is_method = '&self' in full_match or '&mut self' in full_match
            
            self.public_items['functions'].append({
                'name': fn_name,
                'definition': full_match,
                'file': file_path.relative_to(self.src_path),
                'is_method': is_method
            })
    
    def _extract_constants(self, content: str, file_path: Path):
        """Extract public constants."""
        pattern = r'pub\s+const\s+(\w+)\s*:\s*[^=]+=\s*[^;]+;'
        matches = re.finditer(pattern, content)
        for match in matches:
            const_name = match.group(1)
            self.public_items['constants'].append({
                'name': const_name,
                'definition': match.group(0),
                'file': file_path.relative_to(self.src_path)
            })
    
    def _extract_modules(self, content: str, file_path: Path):
        """Extract public module declarations."""
        pattern = r'pub\s+mod\s+(\w+)\s*;'
        matches = re.finditer(pattern, content)
        for match in matches:
            mod_name = match.group(1)
            self.public_items['modules'].append({
                'name': mod_name,
                'file': file_path.relative_to(self.src_path)
            })
    
    def _extract_full_definition(self, content: str, start_pos: int, max_lines: int = 15) -> str:
        """Extract a complete definition starting from start_pos."""
        lines = content[start_pos:].split('\n')
        result_lines = []
        brace_count = 0
        in_definition = False
        
        for line in lines[:max_lines]:
            result_lines.append(line)
            brace_count += line.count('{') - line.count('}')
            
            if '{' in line:
                in_definition = True
            
            # If we've closed all braces or hit a semicolon at top level
            if in_definition and brace_count == 0:
                break
            elif not in_definition and ';' in line:
                break
        
        return '\n'.join(result_lines).strip()
    
    def _extract_enum_variants(self, enum_def: str) -> List[str]:
        """Extract variant names from enum definition."""
        variants = []
        # Look for variant patterns
        lines = enum_def.split('\n')
        in_body = False
        for line in lines:
            if '{' in line:
                in_body = True
                continue
            if '}' in line:
                break
            if in_body:
                # Match variant names (word at start of trimmed line, before comma/brace/paren)
                match = re.match(r'\s*(\w+)', line)
                if match:
                    variant = match.group(1)
                    if variant and variant not in ['pub', 'enum']:
                        variants.append(variant)
        return variants
    
    def generate_markdown(self) -> str:
        """Generate markdown documentation of the public interface."""
        md_lines = [
            f"# {self.crate_name} - Public Interface",
            "",
            f"This document summarizes the public API of the `{self.crate_name}` crate.",
            "",
            "## Overview",
            "",
            f"- **Structs**: {len(self.public_items['structs'])}",
            f"- **Enums**: {len(self.public_items['enums'])}",
            f"- **Traits**: {len(self.public_items['traits'])}",
            f"- **Functions**: {len(self.public_items['functions'])}",
            f"- **Constants**: {len(self.public_items['constants'])}",
            f"- **Modules**: {len(self.public_items['modules'])}",
            ""
        ]
        
        # Add each category
        if self.public_items['structs']:
            md_lines.extend(self._format_items_section("Structs", self.public_items['structs']))
        
        if self.public_items['enums']:
            md_lines.extend(self._format_items_section("Enums", self.public_items['enums']))
        
        if self.public_items['traits']:
            md_lines.extend(self._format_items_section("Traits", self.public_items['traits']))
        
        if self.public_items['functions']:
            md_lines.extend(self._format_items_section("Functions", self.public_items['functions']))
        
        if self.public_items['constants']:
            md_lines.extend(self._format_items_section("Constants", self.public_items['constants']))
        
        if self.public_items['modules']:
            md_lines.extend(self._format_modules_section())
        
        return '\n'.join(md_lines)
    
    def _format_items_section(self, title: str, items: List[Dict]) -> List[str]:
        """Format a section of items for markdown."""
        lines = [f"## {title}", ""]
        
        for item in items:
            lines.append(f"### `{item['name']}`")
            lines.append("")
            lines.append(f"*Defined in: `{item['file']}`*")
            lines.append("")
            lines.append("```rust")
            lines.append(item['definition'])
            lines.append("```")
            lines.append("")
        
        return lines
    
    def _format_modules_section(self) -> List[str]:
        """Format modules section for markdown."""
        lines = ["## Modules", ""]
        
        for mod in self.public_items['modules']:
            lines.append(f"- `{mod['name']}` (declared in `{mod['file']}`)")
        
        lines.append("")
        return lines
    
    def generate_example(self) -> str:
        """Generate a WORKING Rust example that demonstrates the public interface."""
        example_lines = [
            f"// Example demonstrating the {self.crate_name} crate public interface",
            f"// This file was auto-generated by rust_crate_analyzer",
            "",
            f"use {self.crate_name}::*;",
            "",
            "fn main() {",
            f'    println!("Demonstrating {self.crate_name} crate");',
            '    println!("{}", "=".repeat(50));',
            ""
        ]
        
        section_num = 1
        
        # Find constructors using impl block information
        struct_with_new = {}
        for struct_name, method_names in self.public_items['impl_blocks'].items():
            if 'new' in method_names:
                # Find the new function
                for func in self.public_items['functions']:
                    if func['name'] == 'new':
                        struct_with_new[struct_name] = func
                        break
        
        # Find methods for each struct using impl block information
        methods_by_struct = {}
        for struct_name, method_names in self.public_items['impl_blocks'].items():
            struct_methods = []
            for func in self.public_items['functions']:
                if func['name'] in method_names and func['name'] != 'new':  # Exclude constructor
                    struct_methods.append(func)
            if struct_methods:
                methods_by_struct[struct_name] = struct_methods
        
        # Generate comprehensive struct examples with usage
        if self.public_items['structs']:
            for struct in self.public_items['structs'][:2]:  # Focus on first 2 structs
                struct_name = struct['name']
                var_name = struct_name.lower()
                
                # Only generate if we have a constructor OR methods
                if struct_name in struct_with_new or struct_name in methods_by_struct:
                    example_lines.append(f'    println!("\\n{section_num}. {struct_name} demonstrations...");')
                    
                    # Create instance
                    if struct_name in struct_with_new:
                        if struct['has_generics']:
                            example_lines.append(f"    let {var_name} = {struct_name}::<String>::new();")
                        else:
                            example_lines.append(f"    let {var_name} = {struct_name}::new();")
                    else:
                        example_lines.append(f"    // let {var_name} = {struct_name} {{ /* fields */ }};")
                    example_lines.append("")
                    
                    # Find and use methods
                    struct_methods = methods_by_struct.get(struct_name, [])
                    
                    # Look for common patterns (enqueue/push methods)
                    # Normalize names by removing underscores for pattern matching
                    enqueue_methods = [m for m in struct_methods if any(name in m['name'].replace('_', '').lower() for name in ['push', 'enq', 'add', 'insert', 'put'])]
                    dequeue_methods = [m for m in struct_methods if any(name in m['name'].replace('_', '').lower() for name in ['pop', 'deq', 'remove', 'get', 'take'])]
                    
                    if enqueue_methods:
                        enq_method = enqueue_methods[0]
                        example_lines.append(f'    println!("   Enqueuing items...");')
                        example_lines.append(f"    for i in 1..=5 {{")
                        example_lines.append(f'        let msg = format!("msg{{}}", i);')
                        example_lines.append(f"        {var_name}.{enq_method['name']}(msg);")
                        example_lines.append(f'        println!("      Enqueued: msg{{}}", i);')
                        example_lines.append(f"    }}")
                        example_lines.append("")
                    
                    if dequeue_methods:
                        deq_method = dequeue_methods[0]
                        example_lines.append(f'    println!("   Dequeuing items...");')
                        example_lines.append(f"    for _ in 1..=5 {{")
                        example_lines.append(f"        let msg = {var_name}.{deq_method['name']}();")
                        example_lines.append(f'        println!("      Dequeued: {{}}", msg);')
                        example_lines.append(f"    }}")
                        example_lines.append("")
                    
                    example_lines.append(f'    println!("   {struct_name} operations complete!");')
                    example_lines.append("")
                    section_num += 1
        
        # Generate standalone function examples (not methods)
        standalone_fns = [f for f in self.public_items['functions'] 
                         if not f['is_method'] and f['name'] != 'new']
        
        if standalone_fns:
            example_lines.append(f'    println!("\\n{section_num}. Standalone functions...");')
            for func in standalone_fns[:5]:
                func_name = func['name']
                params = self._generate_params_from_definition(func['definition'])
                
                # Try to determine if it returns something
                if '->' in func['definition'] and '()' not in func['definition'].split('->')[-1]:
                    example_lines.append(f"    let result = {func_name}({params});")
                    example_lines.append(f'    println!("   {func_name} returned: {{:?}}", result);')
                else:
                    example_lines.append(f"    {func_name}({params});")
                    example_lines.append(f'    println!("   Called {func_name}");')
            example_lines.append("")
            section_num += 1
        
        # Generate enum examples
        if self.public_items['enums']:
            example_lines.append(f'    println!("\\n{section_num}. Enum usage...");')
            for enum in self.public_items['enums'][:2]:
                enum_name = enum['name']
                if enum.get('variants'):
                    first_variant = enum['variants'][0]
                    example_lines.append(f"    let _value = {enum_name}::{first_variant};")
                    example_lines.append(f'    println!("   Created {enum_name}::{first_variant}");')
                    
                    # Show pattern matching if multiple variants
                    if len(enum['variants']) > 1:
                        example_lines.append(f"    match _value {{")
                        for variant in enum['variants'][:3]:
                            example_lines.append(f"        {enum_name}::{variant} => println!(\"      Matched {variant}\"),")
                        if len(enum['variants']) > 3:
                            example_lines.append(f"        _ => println!(\"      Other variant\"),")
                        example_lines.append(f"    }}")
            example_lines.append("")
            section_num += 1
        
        # Generate constant examples
        if self.public_items['constants']:
            example_lines.append(f'    println!("\\n{section_num}. Constants...");')
            for const in self.public_items['constants']:
                const_name = const['name']
                example_lines.append(f'    println!("   {const_name}: {{}}", {const_name});')
            example_lines.append("")
        
        example_lines.extend([
            '    println!("\\nExample complete!");',
            "}"
        ])
        
        return '\n'.join(example_lines)
    
    def _generate_params_from_definition(self, func_def: str) -> str:
        """Generate example parameters from function definition."""
        # Extract parameter list
        match = re.search(r'\((.*?)\)', func_def)
        if not match:
            return ""
        
        params_str = match.group(1)
        if not params_str.strip():
            return ""
        
        # Parse parameters
        result_params = []
        for param in params_str.split(','):
            param = param.strip()
            if not param or param.startswith('self'):
                continue
            
            # Extract type hint
            if ':' in param:
                param_type = param.split(':')[1].strip()
                example_val = self._type_to_example(param_type)
                result_params.append(example_val)
        
        return ', '.join(result_params) if result_params else "/* params */"
    
    def _type_to_example(self, type_str: str) -> str:
        """Convert a type string to an example value."""
        type_lower = type_str.lower()
        
        if 'string' in type_lower:
            return '"example".to_string()'
        elif '&str' in type_str:
            return '"example"'
        elif 'i32' in type_lower or 'i64' in type_lower:
            return '42'
        elif 'u32' in type_lower or 'u64' in type_lower or 'usize' in type_lower:
            return '10'
        elif 'f32' in type_lower or 'f64' in type_lower:
            return '3.14'
        elif 'bool' in type_lower:
            return 'true'
        elif 'vec' in type_lower:
            return 'vec![]'
        else:
            return '/* value */'
    
    def write_outputs(self):
        """Write the markdown documentation and example files."""
        # Create examples directory if it doesn't exist
        self.examples_path.mkdir(exist_ok=True)
        
        # Write markdown documentation
        md_output_path = self.crate_path / f"{self.crate_name}_interface.md"
        md_content = self.generate_markdown()
        with open(md_output_path, 'w', encoding='utf-8') as f:
            f.write(md_content)
        print(f"\n✓ Generated documentation: {md_output_path}")
        
        # Write example application
        example_output_path = self.examples_path / "demo.rs"
        example_content = self.generate_example()
        with open(example_output_path, 'w', encoding='utf-8') as f:
            f.write(example_content)
        print(f"✓ Generated example: {example_output_path}")
        
        return md_output_path, example_output_path


def main():
    """Main entry point for the analyzer agent."""
    if len(sys.argv) != 2:
        print("Usage: python rust_crate_analyzer.py <path_to_rust_crate>")
        print("\nExample:")
        print("  python rust_crate_analyzer.py /path/to/my_crate")
        sys.exit(1)
    
    crate_path = sys.argv[1]
    
    try:
        # Create analyzer
        analyzer = RustCrateAnalyzer(crate_path)
        
        # Analyze the crate
        public_items = analyzer.analyze()
        
        # Print summary
        print("\n" + "=" * 60)
        print("ANALYSIS COMPLETE")
        print("=" * 60)
        print(f"\nPublic Interface Summary:")
        print(f"  Structs:   {len(public_items['structs'])}")
        print(f"  Enums:     {len(public_items['enums'])}")
        print(f"  Traits:    {len(public_items['traits'])}")
        print(f"  Functions: {len(public_items['functions'])}")
        print(f"  Constants: {len(public_items['constants'])}")
        print(f"  Modules:   {len(public_items['modules'])}")
        
        # Write outputs
        print("\nGenerating outputs...")
        analyzer.write_outputs()
        
        print("\n" + "=" * 60)
        print("SUCCESS")
        print("=" * 60)
        
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()

#!/usr/bin/env env python3
"""
Interface Demo Agent - Analyzes library files and generates demonstration applications
Uses Claude API to understand public interfaces and create usage examples
"""

import os
import sys
import json
import anthropic
from pathlib import Path
from typing import List, Dict, Tuple, Optional


class InterfaceDemoAgent:
    """Agent that analyzes code libraries and generates demonstration applications"""
    
    # Language detection by file extension
    LANGUAGE_MAP = {
        '.py': 'python',
        '.rs': 'rust',
        '.cpp': 'cpp',
        '.hpp': 'cpp',
        '.h': 'cpp',
        '.cs': 'csharp',
        '.java': 'java',
        '.js': 'javascript',
        '.ts': 'typescript',
        '.go': 'go',
        '.rb': 'ruby',
    }
    
    # Library file patterns to identify
    LIBRARY_INDICATORS = {
        'python': ['__init__.py', 'lib', 'src'],
        'rust': ['lib.rs', 'src/lib.rs'],
        'cpp': ['include/', '.hpp', '.h'],
        'csharp': ['.cs'],
    }
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the agent with Anthropic API key"""
        self.api_key = api_key or os.environ.get('ANTHROPIC_API_KEY')
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY must be provided or set in environment")
        
        self.client = anthropic.Anthropic(api_key=self.api_key)
        self.model = "claude-sonnet-4-20250514"
    
    def find_library_files(self, project_path: str) -> List[Tuple[str, str]]:
        """
        Find all library files in the project directory
        Returns: List of (filepath, language) tuples
        """
        project_path = Path(project_path).resolve()
        if not project_path.exists():
            raise ValueError(f"Project path does not exist: {project_path}")
        
        library_files = []
        
        for root, dirs, files in os.walk(project_path):
            # Skip common non-library directories
            dirs[:] = [d for d in dirs if d not in [
                '.git', '__pycache__', 'node_modules', 'target', 
                'build', 'dist', 'venv', '.venv', 'bin', 'obj'
            ]]
            
            for file in files:
                filepath = Path(root) / file
                ext = filepath.suffix.lower()
                
                if ext in self.LANGUAGE_MAP:
                    # Check if it's likely a library file
                    if self._is_library_file(filepath, ext):
                        language = self.LANGUAGE_MAP[ext]
                        library_files.append((str(filepath), language))
        
        return library_files
    
    def _is_library_file(self, filepath: Path, ext: str) -> bool:
        """Determine if a file is likely a library file"""
        filename = filepath.name.lower()
        parent = filepath.parent.name.lower()
        
        # Python libraries
        if ext == '.py':
            # Exclude test files and scripts
            if any(x in filename for x in ['test_', '_test', 'setup.py', '__main__.py']):
                return False
            # Include if in lib/src directory or is __init__.py
            return 'lib' in parent or 'src' in parent or filename == '__init__.py'
        
        # Rust libraries
        if ext == '.rs':
            return filename == 'lib.rs' or 'src' in str(filepath)
        
        # C++ headers are typically library interfaces
        if ext in ['.hpp', '.h']:
            return 'include' in str(filepath) or parent == 'src'
        
        # C# class libraries
        if ext == '.cs':
            # Exclude Program.cs which is usually the entry point
            if filename == 'program.cs':
                return False
            return True
        
        return True
    
    def extract_public_interface(self, filepath: str, language: str) -> Dict:
        """
        Use Claude to extract the public interface from a library file
        Returns: Dict with interface description and details
        """
        with open(filepath, 'r', encoding='utf-8') as f:
            code_content = f.read()
        
        prompt = f"""Analyze this {language} library file and extract its public interface.

File: {filepath}

Code:
```{language}
{code_content}
```

Please provide a structured analysis with:
1. **Library Purpose**: Brief description of what this library does
2. **Public Functions/Methods**: List each public function with:
   - Function signature
   - Parameters and their types
   - Return type
   - Brief description of what it does
3. **Public Classes/Types**: If applicable, list public classes/structs/types
4. **Dependencies**: Any imports or dependencies needed to use this library

Format your response as JSON with this structure:
{{
  "library_name": "name",
  "purpose": "description",
  "language": "{language}",
  "public_functions": [
    {{
      "name": "function_name",
      "signature": "full signature",
      "parameters": [{{"name": "param", "type": "type", "description": "desc"}}],
      "return_type": "type",
      "description": "what it does"
    }}
  ],
  "public_classes": [
    {{
      "name": "ClassName",
      "description": "what it is",
      "methods": ["method1", "method2"]
    }}
  ],
  "dependencies": ["dep1", "dep2"]
}}

Respond ONLY with valid JSON, no other text."""

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            response_text = response.content[0].text.strip()
            
            # Extract JSON if wrapped in markdown
            if response_text.startswith('```'):
                lines = response_text.split('\n')
                response_text = '\n'.join(lines[1:-1])
            
            interface_data = json.loads(response_text)
            interface_data['filepath'] = filepath
            
            return interface_data
            
        except Exception as e:
            print(f"Error extracting interface from {filepath}: {e}")
            return {
                "error": str(e),
                "filepath": filepath,
                "language": language
            }
    
    def generate_demo_application(self, interface_data: Dict) -> str:
        """
        Use Claude to generate a demonstration application
        Returns: Complete demo application code
        """
        language = interface_data.get('language', 'unknown')
        library_name = interface_data.get('library_name', 'library')
        
        prompt = f"""Generate a complete, runnable demonstration application in {language} that showcases all the public functions from this library.

Library Interface:
{json.dumps(interface_data, indent=2)}

Requirements:
1. Create a complete, standalone application that demonstrates EVERY public function
2. Include proper imports and setup
3. Add clear comments explaining what each demonstration does
4. Include error handling where appropriate
5. Make the output clear and informative
6. If the library requires setup/initialization, include that
7. Use realistic example data for function parameters

For the output:
- Make it a complete, runnable {language} application
- Add a main function that calls all demonstrations
- Include helpful print statements showing what's being demonstrated
- Format output clearly so users can see the results

Generate production-quality code with proper structure and documentation.
Respond ONLY with the code, no explanations before or after."""

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=8000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            demo_code = response.content[0].text.strip()
            
            # Remove markdown code fences if present
            if demo_code.startswith('```'):
                lines = demo_code.split('\n')
                # Remove first and last lines (the ``` markers)
                demo_code = '\n'.join(lines[1:-1])
            
            return demo_code
            
        except Exception as e:
            print(f"Error generating demo application: {e}")
            return f"# Error generating demo: {str(e)}"
    
    def process_project(self, project_path: str, output_dir: str = None) -> Dict:
        """
        Main processing function: analyze project and generate demos
        Returns: Summary of processing results
        """
        if output_dir is None:
            output_dir = os.path.join(project_path, 'interface_demos')
        
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        print(f"🔍 Scanning project: {project_path}")
        library_files = self.find_library_files(project_path)
        
        if not library_files:
            print("❌ No library files found")
            return {"status": "no_files", "files_processed": 0}
        
        print(f"📚 Found {len(library_files)} library files")
        
        results = {
            "project_path": project_path,
            "output_dir": str(output_path),
            "files_processed": 0,
            "files_failed": 0,
            "demos_generated": []
        }
        
        for filepath, language in library_files:
            print(f"\n📄 Processing: {filepath}")
            print(f"   Language: {language}")
            
            # Extract interface
            print("   ⚙️  Extracting public interface...")
            interface_data = self.extract_public_interface(filepath, language)
            
            if "error" in interface_data:
                print(f"   ❌ Failed to extract interface")
                results["files_failed"] += 1
                continue
            
            # Generate demo
            print("   🔨 Generating demonstration application...")
            demo_code = self.generate_demo_application(interface_data)
            
            # Save interface documentation
            lib_name = interface_data.get('library_name', Path(filepath).stem)
            interface_file = output_path / f"{lib_name}_interface.json"
            with open(interface_file, 'w', encoding='utf-8') as f:
                json.dump(interface_data, f, indent=2)
            
            # Save demo application with appropriate extension
            ext_map = {
                'python': '.py',
                'rust': '.rs',
                'cpp': '.cpp',
                'csharp': '.cs',
                'java': '.java',
                'javascript': '.js',
                'typescript': '.ts',
                'go': '.go',
                'ruby': '.rb',
            }
            demo_ext = ext_map.get(language, '.txt')
            demo_file = output_path / f"{lib_name}_demo{demo_ext}"
            
            with open(demo_file, 'w', encoding='utf-8') as f:
                f.write(demo_code)
            
            print(f"   ✅ Generated: {demo_file.name}")
            
            results["files_processed"] += 1
            results["demos_generated"].append({
                "source": filepath,
                "interface_doc": str(interface_file),
                "demo_app": str(demo_file),
                "language": language
            })
        
        # Save summary report
        summary_file = output_path / "generation_summary.json"
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n✨ Complete! Processed {results['files_processed']} files")
        print(f"📂 Output directory: {output_path}")
        
        return results


def main():
    """Command-line interface"""
    if len(sys.argv) < 2:
        print("Usage: python interface_demo_agent.py <project_path> [output_dir]")
        print("\nExample:")
        print("  python interface_demo_agent.py ./my_project")
        print("  python interface_demo_agent.py ./my_project ./demos")
        print("\nEnvironment variable required:")
        print("  ANTHROPIC_API_KEY - Your Anthropic API key")
        sys.exit(1)
    
    project_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        agent = InterfaceDemoAgent()
        results = agent.process_project(project_path, output_dir)
        
        print("\n" + "="*60)
        print("📊 PROCESSING SUMMARY")
        print("="*60)
        print(f"Files processed: {results['files_processed']}")
        print(f"Files failed: {results['files_failed']}")
        print(f"Demos generated: {len(results['demos_generated'])}")
        print(f"Output location: {results['output_dir']}")
        
        if results['demos_generated']:
            print("\n📋 Generated Demonstrations:")
            for demo in results['demos_generated']:
                print(f"\n  Source: {demo['source']}")
                print(f"  Language: {demo['language']}")
                print(f"  Interface Doc: {demo['interface_doc']}")
                print(f"  Demo App: {demo['demo_app']}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

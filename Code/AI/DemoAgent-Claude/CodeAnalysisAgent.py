"""
Path-Based AI Code Assistant Agent
A Python agent that analyzes and assists with code in a specified directory
"""

import anthropic
import os
from pathlib import Path
from typing import Optional, List, Dict, Set
import fnmatch


class PathCodeAssistantAgent:
    """An AI agent that assists with software development in a specific path"""
    
    # Common code file extensions
    CODE_EXTENSIONS = {
        '.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c', '.h', 
        '.hpp', '.cs', '.rb', '.go', '.rs', '.php', '.swift', '.kt', '.scala',
        '.html', '.css', '.scss', '.sql', '.sh', '.bash'
    }
    
    def __init__(self, base_path: str, api_key: Optional[str] = None):
        """
        Initialize the agent with a base directory path
        
        Args:
            base_path: Root directory to analyze code from
            api_key: Anthropic API key (or use ANTHROPIC_API_KEY env var)
        """
        self.base_path = Path(base_path).resolve()
        if not self.base_path.exists():
            raise ValueError(f"Path does not exist: {self.base_path}")
        
        self.client = anthropic.Anthropic(
            api_key=api_key or os.environ.get("ANTHROPIC_API_KEY")
        )
        self.conversation_history: List[Dict] = []
        self.indexed_files: Dict[str, str] = {}
        
    def index_directory(self, 
                       patterns: Optional[List[str]] = None,
                       exclude_patterns: Optional[List[str]] = None,
                       max_file_size: int = 100000) -> Dict[str, int]:
        """
        Index code files in the directory
        
        Args:
            patterns: File patterns to include (e.g., ['*.py', '*.js'])
            exclude_patterns: Patterns to exclude (e.g., ['*test*', '__pycache__'])
            max_file_size: Maximum file size in bytes to index
            
        Returns:
            Dictionary with statistics about indexed files
        """
        if patterns is None:
            patterns = [f'*{ext}' for ext in self.CODE_EXTENSIONS]
        
        if exclude_patterns is None:
            exclude_patterns = [
                '__pycache__', '*.pyc', 'node_modules', '.git', 
                'venv', 'env', '.venv', 'dist', 'build', '*.min.js'
            ]
        
        self.indexed_files = {}
        stats = {'total': 0, 'skipped': 0, 'errors': 0}
        
        for file_path in self.base_path.rglob('*'):
            if not file_path.is_file():
                continue
            
            # Check exclusions
            relative_path = file_path.relative_to(self.base_path)
            if any(fnmatch.fnmatch(str(relative_path), pattern) 
                   for pattern in exclude_patterns):
                stats['skipped'] += 1
                continue
            
            # Check if file matches patterns
            if not any(fnmatch.fnmatch(file_path.name, pattern) 
                      for pattern in patterns):
                continue
            
            # Check file size
            if file_path.stat().st_size > max_file_size:
                stats['skipped'] += 1
                continue
            
            # Try to read file
            try:
                content = file_path.read_text(encoding='utf-8')
                self.indexed_files[str(relative_path)] = content
                stats['total'] += 1
            except Exception as e:
                stats['errors'] += 1
                print(f"Error reading {relative_path}: {e}")
        
        return stats
    
    def list_indexed_files(self) -> List[str]:
        """Get list of all indexed files"""
        return sorted(self.indexed_files.keys())
    
    def get_file_content(self, relative_path: str) -> Optional[str]:
        """Get content of a specific indexed file"""
        return self.indexed_files.get(relative_path)
    
    def analyze_project_structure(self) -> str:
        """Analyze the overall project structure"""
        if not self.indexed_files:
            return "No files indexed. Run index_directory() first."
        
        file_list = '\n'.join(f"- {path}" for path in self.list_indexed_files())
        
        prompt = f"""Analyze this project structure from path: {self.base_path}

Files in project:
{file_list}

Provide:
1. Overall project organization assessment
2. Suggested improvements to structure
3. Missing common files or directories
4. Potential architectural issues
"""
        return self._send_message(prompt)
    
    def analyze_file(self, relative_path: str, 
                    focus: Optional[str] = None) -> str:
        """Analyze a specific file"""
        content = self.get_file_content(relative_path)
        if content is None:
            return f"File not found: {relative_path}"
        
        focus_str = f"\nSpecific focus: {focus}" if focus else ""
        
        prompt = f"""Analyze this file: {relative_path}
From project: {self.base_path}{focus_str}

File content:
```
{content}
```

Provide:
1. Purpose and functionality
2. Code quality assessment
3. Potential bugs or issues
4. Improvement suggestions
5. Relationship to other project files (if apparent)
"""
        return self._send_message(prompt)
    
    def find_security_issues(self) -> str:
        """Scan all indexed files for security vulnerabilities"""
        if not self.indexed_files:
            return "No files indexed."
        
        files_content = self._format_multiple_files(list(self.indexed_files.keys())[:10])
        
        prompt = f"""Security audit for project: {self.base_path}

{files_content}

Identify:
1. Security vulnerabilities
2. Sensitive data exposure risks
3. Input validation issues
4. Authentication/authorization problems
5. Dependency security concerns
6. Best practice violations

Prioritize by severity.
"""
        return self._send_message(prompt)
    
    def suggest_tests(self, relative_path: str, framework: str = "pytest") -> str:
        """Generate test suggestions for a specific file"""
        content = self.get_file_content(relative_path)
        if content is None:
            return f"File not found: {relative_path}"
        
        prompt = f"""Generate comprehensive tests for: {relative_path}
Using framework: {framework}

File content:
```
{content}
```

Provide:
1. Test structure and organization
2. Key test cases needed
3. Edge cases to cover
4. Mocking strategies (if needed)
5. Complete test code examples
"""
        return self._send_message(prompt)
    
    def refactor_file(self, relative_path: str, goals: List[str]) -> str:
        """Suggest refactoring for a file"""
        content = self.get_file_content(relative_path)
        if content is None:
            return f"File not found: {relative_path}"
        
        goals_str = '\n'.join(f"- {goal}" for goal in goals)
        
        prompt = f"""Refactor this file: {relative_path}

Goals:
{goals_str}

Current code:
```
{content}
```

Provide:
1. Refactored code
2. Explanation of changes
3. Migration steps if needed
4. Impact on other files
"""
        return self._send_message(prompt)
    
    def find_code_duplication(self) -> str:
        """Identify duplicated code across the project"""
        if not self.indexed_files:
            return "No files indexed."
        
        # Limit to first 15 files to avoid token limits
        files_content = self._format_multiple_files(
            list(self.indexed_files.keys())[:15]
        )
        
        prompt = f"""Analyze for code duplication in: {self.base_path}

{files_content}

Identify:
1. Duplicated code blocks
2. Similar patterns that could be abstracted
3. Suggested refactoring to reduce duplication
4. Opportunities for utility functions/modules
"""
        return self._send_message(prompt)
    
    def explain_dependencies(self, relative_path: str) -> str:
        """Explain dependencies and relationships for a file"""
        content = self.get_file_content(relative_path)
        if content is None:
            return f"File not found: {relative_path}"
        
        # Get related files
        related_files = self._find_related_files(relative_path)
        related_content = self._format_multiple_files(related_files[:5])
        
        prompt = f"""Explain dependencies for: {relative_path}

Target file:
```
{content}
```

Related files:
{related_content}

Explain:
1. External dependencies (libraries/packages)
2. Internal dependencies (other project files)
3. Dependency graph
4. Potential circular dependencies
5. Suggestions for better dependency management
"""
        return self._send_message(prompt)
    
    def generate_documentation(self, relative_path: str) -> str:
        """Generate documentation for a file"""
        content = self.get_file_content(relative_path)
        if content is None:
            return f"File not found: {relative_path}"
        
        prompt = f"""Generate comprehensive documentation for: {relative_path}

Code:
```
{content}
```

Include:
1. Module/file overview
2. Function/class documentation
3. Usage examples
4. API reference (if applicable)
5. Important notes and caveats
"""
        return self._send_message(prompt)
    
    def compare_files(self, path1: str, path2: str) -> str:
        """Compare two files and explain differences"""
        content1 = self.get_file_content(path1)
        content2 = self.get_file_content(path2)
        
        if content1 is None or content2 is None:
            return "One or both files not found"
        
        prompt = f"""Compare these two files:

File 1: {path1}
```
{content1}
```

File 2: {path2}
```
{content2}
```

Explain:
1. Key differences
2. Similarities
3. Which approach is better and why
4. Potential for consolidation
"""
        return self._send_message(prompt)
    
    def _format_multiple_files(self, file_paths: List[str]) -> str:
        """Format multiple files for inclusion in prompt"""
        result = []
        for path in file_paths:
            content = self.get_file_content(path)
            if content:
                result.append(f"File: {path}\n```\n{content}\n```\n")
        return '\n'.join(result)
    
    def _find_related_files(self, relative_path: str) -> List[str]:
        """Find files that might be related to the given file"""
        path = Path(relative_path)
        related = []
        
        # Files in same directory
        same_dir = [f for f in self.indexed_files.keys() 
                   if Path(f).parent == path.parent and f != relative_path]
        related.extend(same_dir)
        
        # Files with similar names
        stem = path.stem
        similar = [f for f in self.indexed_files.keys() 
                  if stem in Path(f).stem and f != relative_path 
                  and f not in related]
        related.extend(similar)
        
        return related
    
    def _send_message(self, content: str, max_tokens: int = 8000) -> str:
        """Send a message to Claude and get response"""
        self.conversation_history.append({
            "role": "user",
            "content": content
        })
        
        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=max_tokens,
            messages=self.conversation_history
        )
        
        assistant_message = response.content[0].text
        
        self.conversation_history.append({
            "role": "assistant",
            "content": assistant_message
        })
        
        return assistant_message
    
    def reset_conversation(self):
        """Clear conversation history"""
        self.conversation_history = []
    
    def get_project_summary(self) -> Dict:
        """Get summary of the indexed project"""
        if not self.indexed_files:
            return {"error": "No files indexed"}
        
        extensions = {}
        total_lines = 0
        
        for path, content in self.indexed_files.items():
            ext = Path(path).suffix
            extensions[ext] = extensions.get(ext, 0) + 1
            total_lines += len(content.splitlines())
        
        return {
            "base_path": str(self.base_path),
            "total_files": len(self.indexed_files),
            "total_lines": total_lines,
            "file_types": extensions,
            "files": self.list_indexed_files()
        }


# Example usage
def main():
    # Initialize agent with your project path
    project_path = "."  # Current directory, or specify your path
    agent = PathCodeAssistantAgent(project_path)
    
    # Index the directory
    print("Indexing directory...")
    stats = agent.index_directory(
        patterns=['*.py'],  # Only Python files
        exclude_patterns=['*test*', '__pycache__', 'venv']
    )
    print(f"Indexed {stats['total']} files, skipped {stats['skipped']}")
    print()
    
    # Get project summary
    summary = agent.get_project_summary()
    print("PROJECT SUMMARY")
    print(f"Path: {summary['base_path']}")
    print(f"Files: {summary['total_files']}")
    print(f"Total lines: {summary['total_lines']}")
    print(f"File types: {summary['file_types']}")
    print()
    
    # List all files
    print("INDEXED FILES:")
    for file in agent.list_indexed_files():
        print(f"  - {file}")
    print()
    
    # Example 1: Analyze project structure
    print("=== PROJECT STRUCTURE ANALYSIS ===")
    structure_analysis = agent.analyze_project_structure()
    print(structure_analysis)
    print("\n" + "="*50 + "\n")
    
    # Example 2: Analyze specific file
    if agent.list_indexed_files():
        first_file = agent.list_indexed_files()[0]
        agent.reset_conversation()
        print(f"=== ANALYZING FILE: {first_file} ===")
        file_analysis = agent.analyze_file(first_file)
        print(file_analysis)
        print("\n" + "="*50 + "\n")
    
    # Example 3: Security scan
    agent.reset_conversation()
    print("=== SECURITY SCAN ===")
    security = agent.find_security_issues()
    print(security)
    print("\n" + "="*50 + "\n")
    
    # Example 4: Find code duplication
    agent.reset_conversation()
    print("=== CODE DUPLICATION ANALYSIS ===")
    duplication = agent.find_code_duplication()
    print(duplication)


if __name__ == "__main__":
    main()
"""
Software Development Agent using Anthropic API
A sophisticated agent for analyzing, improving, and maintaining code in a specified directory.
"""

import anthropic
import os
import sys
from pathlib import Path
from typing import List, Dict, Optional
import json
import argparse

class SoftwareDevAgent:
    def __init__(self, api_key: str, directory: str, model: str = "claude-sonnet-4-20250514"):
        """
        Initialize the Software Development Agent.
        
        Args:
            api_key: Anthropic API key
            directory: Target directory for code analysis
            model: Claude model to use
        """
        self.client = anthropic.Anthropic(api_key=api_key)
        self.directory = Path(directory).resolve()
        self.model = model
        self.conversation_history = []
        
        if not self.directory.exists():
            raise ValueError(f"Directory does not exist: {self.directory}")
    
    def get_file_tree(self, max_depth: int = 3) -> str:
        """Generate a tree structure of the directory."""
        lines = [f"📁 {self.directory.name}/"]
        
        def add_tree(path: Path, prefix: str = "", depth: int = 0):
            if depth >= max_depth:
                return
            
            try:
                items = sorted(path.iterdir(), key=lambda x: (not x.is_dir(), x.name))
                items = [item for item in items if not item.name.startswith('.') 
                        and item.name not in ['__pycache__', 'node_modules', 'bin', 'obj']]
                
                for i, item in enumerate(items):
                    is_last = i == len(items) - 1
                    current_prefix = "└── " if is_last else "├── "
                    next_prefix = "    " if is_last else "│   "
                    
                    icon = "📁" if item.is_dir() else "📄"
                    lines.append(f"{prefix}{current_prefix}{icon} {item.name}")
                    
                    if item.is_dir():
                        add_tree(item, prefix + next_prefix, depth + 1)
            except PermissionError:
                pass
        
        add_tree(self.directory)
        return "\n".join(lines)
    
    def read_file(self, filepath: str) -> Optional[str]:
        """Read a file from the directory."""
        full_path = self.directory / filepath
        
        if not full_path.exists() or not full_path.is_relative_to(self.directory):
            return None
        
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            return f"Error reading file: {str(e)}"
    
    def get_code_files(self, extensions: List[str] = None) -> List[Path]:
        """Get all code files in the directory."""
        if extensions is None:
            extensions = ['.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.cpp', '.c', 
                         '.h', '.hpp', '.cs', '.rs', '.go', '.rb', '.php']
        
        code_files = []
        for ext in extensions:
            code_files.extend(self.directory.rglob(f"*{ext}"))
        
        # Filter out common non-source directories
        exclude_dirs = {'__pycache__', 'node_modules', '.git', 'bin', 'obj', 'build', 'dist'}
        return [f for f in code_files if not any(exc in f.parts for exc in exclude_dirs)]
    
    def analyze_codebase(self) -> str:
        """Provide high-level analysis of the codebase."""
        files = self.get_code_files()
        
        file_types = {}
        total_lines = 0
        
        for file in files:
            ext = file.suffix
            file_types[ext] = file_types.get(ext, 0) + 1
            
            try:
                with open(file, 'r', encoding='utf-8') as f:
                    total_lines += sum(1 for _ in f)
            except:
                pass
        
        analysis = f"""
Codebase Analysis for: {self.directory}

Total Files: {len(files)}
Total Lines of Code: {total_lines:,}

File Type Distribution:
"""
        for ext, count in sorted(file_types.items(), key=lambda x: x[1], reverse=True):
            analysis += f"  {ext}: {count} files\n"
        
        return analysis
    
    def chat(self, message: str, include_context: bool = True) -> str:
        """
        Send a message to Claude with optional codebase context.
        
        Args:
            message: User message
            include_context: Whether to include directory tree in context
            
        Returns:
            Claude's response
        """
        # Build context
        context_parts = []
        
        if include_context and not self.conversation_history:
            context_parts.append(f"Working Directory: {self.directory}")
            context_parts.append("\nDirectory Structure:")
            context_parts.append(self.get_file_tree())
            context_parts.append("\n" + self.analyze_codebase())
        
        # Prepare messages
        messages = []
        
        # Add conversation history
        for msg in self.conversation_history:
            messages.append(msg)
        
        # Add current message with context
        current_content = "\n\n".join(context_parts + [message]) if context_parts else message
        messages.append({
            "role": "user",
            "content": current_content
        })
        
        # Call Claude API
        response = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            system="""You are an expert software development assistant. You help developers:
- Analyze and understand code
- Suggest improvements and refactoring
- Debug issues
- Write new code
- Review code quality
- Generate documentation
- Explain complex concepts

Be thorough, practical, and provide specific, actionable advice.""",
            messages=messages
        )
        
        assistant_message = response.content[0].text
        
        # Update conversation history
        self.conversation_history.append({"role": "user", "content": message})
        self.conversation_history.append({"role": "assistant", "content": assistant_message})
        
        return assistant_message
    
    def analyze_file(self, filepath: str) -> str:
        """Analyze a specific file."""
        content = self.read_file(filepath)
        
        if content is None:
            return f"File not found: {filepath}"
        
        message = f"""Please analyze this file: {filepath}

```
{content}
```

Provide:
1. Purpose and functionality
2. Code quality assessment
3. Potential improvements
4. Any bugs or issues
5. Documentation suggestions"""
        
        return self.chat(message, include_context=False)
    
    def suggest_improvements(self) -> str:
        """Get improvement suggestions for the entire codebase."""
        files = self.get_code_files()[:10]  # Limit to first 10 files
        
        message = f"""Based on the codebase structure, suggest improvements for:
1. Project organization
2. Code architecture
3. Testing strategy
4. Documentation
5. Development workflow

Key files in the project:
"""
        for file in files:
            message += f"\n- {file.relative_to(self.directory)}"
        
        return self.chat(message)
    
    def generate_readme(self) -> str:
        """Generate a README for the project."""
        files = self.get_code_files()[:10]
        
        sample_code = ""
        for file in files[:3]:
            content = self.read_file(str(file.relative_to(self.directory)))
            if content:
                sample_code += f"\n\n## {file.name}\n```\n{content[:500]}...\n```"
        
        message = f"""Generate a comprehensive README.md for this project.

Directory: {self.directory.name}
{self.analyze_codebase()}

Sample files:
{sample_code}

Include:
1. Project title and description
2. Features
3. Installation instructions
4. Usage examples
5. Project structure
6. Contributing guidelines"""
        
        return self.chat(message)
    
    def interactive_mode(self):
        """Start interactive chat mode."""
        print(f"\n🤖 Software Development Agent")
        print(f"📁 Working Directory: {self.directory}")
        print(f"\nCommands:")
        print("  /analyze [file] - Analyze a specific file")
        print("  /improve - Get improvement suggestions")
        print("  /readme - Generate README")
        print("  /tree - Show directory tree")
        print("  /files - List code files")
        print("  /clear - Clear conversation history")
        print("  /quit - Exit")
        print("\nOr just ask me anything about your code!\n")
        
        while True:
            try:
                user_input = input("You: ").strip()
                
                if not user_input:
                    continue
                
                if user_input == "/quit":
                    print("Goodbye!")
                    break
                
                elif user_input == "/clear":
                    self.conversation_history = []
                    print("Conversation history cleared.")
                    continue
                
                elif user_input == "/tree":
                    print("\n" + self.get_file_tree())
                    continue
                
                elif user_input == "/files":
                    files = self.get_code_files()
                    print(f"\nFound {len(files)} code files:")
                    for file in files[:20]:
                        print(f"  - {file.relative_to(self.directory)}")
                    if len(files) > 20:
                        print(f"  ... and {len(files) - 20} more")
                    continue
                
                elif user_input.startswith("/analyze"):
                    parts = user_input.split(maxsplit=1)
                    if len(parts) < 2:
                        print("Usage: /analyze <filepath>")
                        continue
                    
                    print("\n🔍 Analyzing...")
                    response = self.analyze_file(parts[1])
                    print(f"\nAgent: {response}\n")
                
                elif user_input == "/improve":
                    print("\n💡 Generating suggestions...")
                    response = self.suggest_improvements()
                    print(f"\nAgent: {response}\n")
                
                elif user_input == "/readme":
                    print("\n📝 Generating README...")
                    response = self.generate_readme()
                    print(f"\nAgent: {response}\n")
                
                else:
                    print("\n🤔 Thinking...")
                    response = self.chat(user_input)
                    print(f"\nAgent: {response}\n")
                    
            except KeyboardInterrupt:
                print("\n\nGoodbye!")
                break
            except Exception as e:
                print(f"\n❌ Error: {str(e)}\n")


def main():
    parser = argparse.ArgumentParser(
        description="Software Development Agent using Anthropic API"
    )
    parser.add_argument(
        "directory",
        nargs="?",
        default=".",
        help="Directory to analyze (default: current directory)"
    )
    parser.add_argument(
        "--api-key",
        help="Anthropic API key (or set ANTHROPIC_API_KEY env var)"
    )
    parser.add_argument(
        "--model",
        default="claude-sonnet-4-20250514",
        help="Claude model to use"
    )
    parser.add_argument(
        "--analyze",
        help="Analyze a specific file and exit"
    )
    parser.add_argument(
        "--improve",
        action="store_true",
        help="Get improvement suggestions and exit"
    )
    parser.add_argument(
        "--readme",
        action="store_true",
        help="Generate README and exit"
    )
    
    args = parser.parse_args()
    
    # Get API key from command line argument or environment variable
    api_key = args.api_key or os.environ.get("ANTHROPIC_API_KEY") or os.getenv("ANTHROPIC_API_KEY")
    
    if not api_key:
        print("\n❌ Error: Anthropic API key is required")
        print("\nYou can provide the API key in one of two ways:")
        print("\n1. Set an environment variable (recommended):")
        if sys.platform == "win32":
            print("   For current session:")
            print("     set ANTHROPIC_API_KEY=your-api-key-here")
            print("\n   For permanent (requires new terminal):")
            print("     setx ANTHROPIC_API_KEY your-api-key-here")
        else:
            print("   export ANTHROPIC_API_KEY=your-api-key-here")
        print("\n2. Pass as command-line argument:")
        print("   python dev_agent.py --api-key your-api-key-here\n")
        sys.exit(1)
    
    # Create agent
    try:
        agent = SoftwareDevAgent(api_key, args.directory, args.model)
    except ValueError as e:
        print(f"Error: {e}")
        sys.exit(1)
    
    # Execute command or start interactive mode
    if args.analyze:
        print(agent.analyze_file(args.analyze))
    elif args.improve:
        print(agent.suggest_improvements())
    elif args.readme:
        print(agent.generate_readme())
    else:
        agent.interactive_mode()


if __name__ == "__main__":
    main()

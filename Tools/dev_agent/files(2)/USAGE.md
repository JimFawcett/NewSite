# Software Development Agent - Usage Guide

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set your API key:

**On Windows (PowerShell):**
```powershell
# For current session only
$env:ANTHROPIC_API_KEY="your-api-key-here"

# For permanent (all future sessions)
[System.Environment]::SetEnvironmentVariable('ANTHROPIC_API_KEY','your-api-key-here','User')
```

**On Windows (Command Prompt):**
```cmd
# For current session only
set ANTHROPIC_API_KEY=your-api-key-here

# For permanent (all future sessions)
setx ANTHROPIC_API_KEY your-api-key-here
```

**On Linux/Mac:**
```bash
export ANTHROPIC_API_KEY='your-api-key-here'

# To make permanent, add to ~/.bashrc or ~/.zshrc:
echo 'export ANTHROPIC_API_KEY="your-api-key-here"' >> ~/.bashrc
```

Or pass it as a command-line argument with `--api-key`

## Usage Examples

### Interactive Mode (Default)
Start an interactive session to chat with the agent about your code:

```bash
python dev_agent.py /path/to/your/project
```

Or analyze the current directory:
```bash
python dev_agent.py
```

### Analyze a Specific File
```bash
python dev_agent.py /path/to/project --analyze src/main.py
```

### Get Improvement Suggestions
```bash
python dev_agent.py /path/to/project --improve
```

### Generate README
```bash
python dev_agent.py /path/to/project --readme
```

## Interactive Commands

Once in interactive mode, you can use these commands:

- `/analyze <file>` - Analyze a specific file in detail
- `/improve` - Get suggestions for improving the codebase
- `/readme` - Generate a comprehensive README
- `/tree` - Display the directory structure
- `/files` - List all code files found
- `/clear` - Clear conversation history
- `/quit` - Exit the agent

## Example Conversations

### Code Review
```
You: Can you review the error handling in my Python files?
Agent: [Analyzes error handling patterns across your codebase]
```

### Debugging Help
```
You: I'm getting a NullPointerException in UserService.java, can you help?
Agent: [Examines the file and suggests fixes]
```

### Architecture Questions
```
You: Should I split my main.py file into multiple modules?
Agent: [Provides architectural advice based on your code structure]
```

### Refactoring Assistance
```
You: /analyze utils/helpers.py
Agent: [Provides detailed analysis with refactoring suggestions]
```

### Documentation Generation
```
You: Can you write docstrings for all functions in api/routes.py?
Agent: [Generates comprehensive documentation]
```

## Features

✅ **Codebase Analysis** - Understand project structure and code organization
✅ **File-Specific Review** - Deep dive into individual files
✅ **Improvement Suggestions** - Get actionable recommendations
✅ **Bug Detection** - Identify potential issues
✅ **Documentation Generation** - Create READMEs and docstrings
✅ **Refactoring Advice** - Modernize and improve code quality
✅ **Conversational Context** - Maintains conversation history for follow-up questions
✅ **Multi-Language Support** - Works with Python, JavaScript, TypeScript, Java, C++, C#, Rust, Go, Ruby, PHP

## Tips for Best Results

1. **Be Specific** - Ask targeted questions about particular files or issues
2. **Provide Context** - Mention what you're trying to achieve
3. **Iterate** - Use follow-up questions to drill deeper
4. **Review Suggestions** - The agent provides recommendations; you make the final decisions
5. **Keep History** - Don't `/clear` too often; context helps the agent understand your project better

## Security Note

- The agent reads files from your local directory
- Code is sent to Anthropic's API for analysis
- Ensure you're comfortable with the code being analyzed
- Avoid using on projects with sensitive credentials in code (use environment variables!)

## Advanced Usage

### Custom Model
```bash
python dev_agent.py --model claude-opus-4-20250514 /path/to/project
```

### Environment Configuration
Create a `.env` file:
```
ANTHROPIC_API_KEY=your-api-key
DEFAULT_MODEL=claude-sonnet-4-20250514
```

## Troubleshooting

**Issue**: "Directory does not exist"
**Solution**: Check the path to your project directory

**Issue**: "API key required"
**Solution**: Set ANTHROPIC_API_KEY environment variable or use --api-key flag
- Windows (CMD): `setx ANTHROPIC_API_KEY your-key` (requires new terminal)
- Windows (PowerShell): `$env:ANTHROPIC_API_KEY="your-key"`
- Linux/Mac: `export ANTHROPIC_API_KEY='your-key'`

**Issue**: "Environment variable not found" (Windows)
**Solution**: After using `setx`, close and reopen your terminal/command prompt

**Issue**: "Too many files"
**Solution**: The agent limits analysis to avoid token limits. Focus on specific files or subdirectories.

## Example Workflow

1. Start the agent in your project directory
2. Use `/tree` to understand the structure
3. Use `/files` to see what code files were detected
4. Ask general questions about architecture or design
5. Use `/analyze` for specific files that need attention
6. Use `/improve` to get a roadmap of improvements
7. Implement changes and ask follow-up questions
8. Use `/readme` when ready to document the project

Happy coding! 🚀

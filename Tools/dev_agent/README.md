# dev_agent

Interactive development agent powered by the Anthropic Claude API. Point it at a source directory and ask questions, request analysis, or generate documentation through a conversational interface.

## Requirements

- Python 3.7+
- Anthropic API key - get one at https://console.anthropic.com/
- `anthropic>=0.39.0` (installed automatically by the launch scripts)

## Setup

**Set the API key** (required before first run):

```cmd
:: Windows CMD - permanent
setx ANTHROPIC_API_KEY your-key-here

:: Windows PowerShell - permanent
[System.Environment]::SetEnvironmentVariable('ANTHROPIC_API_KEY','your-key-here','User')

:: Linux / macOS
export ANTHROPIC_API_KEY='your-key-here'
```

**Install the dependency** manually if not using a launch script:

```
pip install -r requirements.txt
```

## Running

**Windows - easiest:**

```cmd
run_agent.bat [path]
```

or right-click `run_agent.ps1` and choose *Run with PowerShell*. Both scripts check for Python, verify or prompt for the API key, install dependencies, and launch the agent.

**Direct:**

```
python dev_agent.py [directory] [options]
```

`directory` defaults to the current working directory if omitted.

## Command-Line Options

| Option | Description |
|---|---|
| `directory` | Root of the codebase to analyze (default: `.`) |
| `--api-key KEY` | API key (overrides `ANTHROPIC_API_KEY` env var) |
| `--model MODEL` | Claude model ID to use |
| `--analyze FILE` | Analyze one file and exit |
| `--improve` | Print improvement suggestions and exit |
| `--readme` | Generate a README for the project and exit |

## Interactive Commands

Once running, type these at the prompt:

| Command | Action |
|---|---|
| `/analyze <file>` | Deep analysis of a specific file |
| `/improve` | Architectural and code quality suggestions |
| `/readme` | Generate a README for the target codebase |
| `/tree` | Print the directory tree |
| `/files` | List all detected source files |
| `/clear` | Reset conversation history |
| `/quit` | Exit |

Any other input is sent to Claude as a free-form question about the codebase.

## Examples

```cmd
:: Interactive session on current directory
python dev_agent.py

:: Analyze a specific project
python dev_agent.py C:\Projects\MyApp

:: One-shot file analysis
python dev_agent.py C:\Projects\MyApp --analyze src\main.py

:: Generate README for a project
python dev_agent.py C:\Projects\MyApp --readme
```

## How It Works

On the first message the agent builds a file tree and codebase statistics (file counts, line counts, language distribution) and includes them in the context sent to Claude. Subsequent messages in the session reuse the cached context, keeping token use efficient. Conversation history is maintained across turns for coherent multi-turn analysis.

Source files are discovered by extension. Supported languages: Python, JavaScript, TypeScript, Java, C++, C, C#, Rust, Go, Ruby, PHP, and JSX/TSX variants. The following directories are excluded from scans: `__pycache__`, `node_modules`, `.git`, `bin`, `obj`, `build`, `dist`.

Path inputs are validated to prevent directory traversal outside the target root. The API key is never logged or echoed.

## Files

| File | Purpose |
|---|---|
| `dev_agent.py` | Agent implementation and CLI entry point |
| `requirements.txt` | Python dependencies |
| `run_agent.bat` | Windows batch launcher |
| `run_agent.ps1` | Windows PowerShell launcher |
| `USAGE.md` | Extended usage guide with examples |
| `WINDOWS_SETUP.md` | Windows-specific setup notes |

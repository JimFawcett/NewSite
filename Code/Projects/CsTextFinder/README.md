# CsTextFinder

A command-line tool that walks a directory tree and reports files whose content
matches a regular expression.  Written in C# (.NET 10), built with the dotnet CLI.

---

## Features

- Regex search over file contents (text and binary files)
- Recursive or single-directory walk
- File-extension filtering (e.g. search only `cs`, `txt`)
- Built-in skip list covering C#, Rust, C++, and Python build outputs — never entered
- Two output modes controlled by `/H`: real-time traversal vs. clean match-only output
- Summary line: files visited and files matched

---

## Command-Line Options

| Option | Meaning | Default |
|--------|---------|---------|
| `/P <path>` | Root directory to search | `.` (current directory) |
| `/p <ext,...>` | Comma-separated file extensions to include | all files |
| `/r <regex>` | Regular expression matched against file content | `.` (any content) |
| `/s` | Recurse into subdirectories | `true` |
| `/H` | `true`: print a directory only when it has a match (clean). `false`: print every directory as it is entered (real-time progress). | `true` |
| `/v` | Verbose — echo all options before searching | off |
| `/h` | Print help and exit | off |

**Example — find all `.cs` files containing `Action` under the current tree:**

```
CsTextFinder /P . /p cs /r "Action"
```

**Git Bash / MINGW note:** The shell converts `/P`, `/r`, etc. to Windows paths.
Use `-` as the flag prefix instead to avoid this:

```bash
dotnet run --project EntryPoint -- -P . -p cs -r "Action"
```

PowerShell and cmd.exe accept `/` prefixes without issue.

---

## Building

### Prerequisites

- .NET 10 SDK (`dotnet --version` should show 10.x)

### Build

```bash
# from CsTextFinder/
dotnet build
```

### Run

```bash
dotnet run --project EntryPoint -- -P . -r "TODO" -p cs
```

The self-contained executable is at:

```
EntryPoint/bin/Debug/net10.0/CsTextFinder.exe
```

### Clean

```bash
dotnet clean
```

---

## Directory Layout

```
CsTextFinder/
├── Constitution.md         governing design document
├── Structure.md            C#/.NET implementation rules
├── Notes.md                project-level prompt/response log
├── README.md
├── CsTextFinder.sln
├── generate_part.py        scaffolds a new library part
├── CommandLine/
│   ├── CommandLine.csproj
│   ├── CmdLine.cs          class CmdLine — parses /Key [Value] tokens
│   ├── Spec.md
│   └── Notes.md
├── DirNav/
│   ├── DirNav.csproj
│   ├── DirNav.cs           class DirNav — depth-first directory walk
│   ├── Spec.md
│   └── Notes.md
├── Output/
│   ├── Output.csproj
│   ├── Output.cs           class Output — regex match and console output
│   ├── Spec.md
│   └── Notes.md
└── EntryPoint/
    ├── EntryPoint.csproj   OutputType=Exe; AssemblyName=CsTextFinder
    ├── Program.cs          wires CommandLine, DirNav, Output; drives execution
    ├── Spec.md
    └── Notes.md
```

---

## Architecture

Three independent library projects, wired together only in `Program.cs`:

```
CommandLine   DirNav   Output
      \          |       /
           EntryPoint
```

- Libraries never reference each other.
- `DirNav` fires events via `Action<string>` delegates registered by `EntryPoint`.
- `Output` is a plain class with `OnDir()` and `OnFile()` methods.

Default directories excluded from traversal:

| Language / tool | Skipped names |
|-----------------|---------------|
| C# / .NET       | `bin`, `obj` |
| Rust            | `target` |
| C++             | `build`, `out` |
| Python          | `__pycache__`, `.venv`, `venv`, `dist` |
| VCS / IDE       | `.git`, `.vs`, `.idea` |

---

*End of README.md*

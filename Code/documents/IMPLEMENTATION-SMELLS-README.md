# Implementation Smells Skill

A comprehensive skill for detecting code quality issues and implementation smells in source code.

## What This Skill Does

This skill enables Claude to systematically analyze code for:
- **Code organization issues** (long methods, god classes, feature envy)
- **Naming problems** (unclear names, inconsistent conventions)
- **Control flow smells** (deep nesting, complex conditionals, duplication)
- **Error handling issues** (silent failures, exception swallowing)
- **Performance problems** (inefficient algorithms, resource leaks)
- **Language-specific anti-patterns** (C++, Python, Rust, C#)

## Installation

1. Download the `implementation-smells.skill` file
2. In Claude.ai, click on your profile → Settings
3. Navigate to the "Skills" section
4. Click "Upload Skill" and select the `.skill` file
5. The skill will be available immediately

## Usage Examples

Once installed, trigger the skill with requests like:

- "Find code smells in this Python file"
- "Analyze this C++ code for quality issues"
- "Review this codebase for maintainability problems"
- "What refactoring opportunities exist in this code?"
- "Detect anti-patterns in this Rust project"

## What's Included

### Comprehensive Smell Catalog (`references/smell-catalog.md`)
- 40+ documented code smells across multiple categories
- Language-specific smells for C++, Python, Rust, and C#
- Detailed symptom, impact, and detection guidance for each smell

### Automated Detection Script (`scripts/smell_detector.py`)
- Python script for automated smell detection
- Detects: long functions, deep nesting, magic numbers, unclear naming
- Generates severity-ranked reports
- Usage: `python smell_detector.py <source_file> [language]`

### Systematic Workflow (`SKILL.md`)
- Step-by-step analysis process
- Language-specific guidance
- Report generation templates
- Best practices for code review

## Supported Languages

- **C++**: RAII violations, raw pointers, virtual destructors, modern C++ idioms
- **Python**: Mutable defaults, context managers, exception handling, PEP 8
- **Rust**: Clone overuse, unwrap proliferation, lifetime annotations, Result handling
- **C#**: IDisposable patterns, async/await usage, disposal patterns
- **General**: Universal smells applicable to all languages

## Example Output

```
=== Implementation Smells Analysis ===

HIGH SEVERITY (1 found):
- Long Function at Line 29: 'process_everything' is 87 lines long
  → Impact: Difficult to understand, test, and maintain
  💡 Suggestion: Break into focused functions: validate_input(), 
     process_data(), format_output()

MEDIUM SEVERITY (3 found):
- Deep Nesting at Line 15: Nesting level 5 exceeds maximum
  → Impact: Cognitive overload, hard to follow logic
  💡 Suggestion: Use early returns or extract to helper functions

Total: 4 smell(s) detected
Prioritized recommendations: [Top 3 fixes]
```

## Benefits

- **Systematic coverage**: Comprehensive catalog ensures nothing is missed
- **Educational**: Learn about smells while reviewing code
- **Actionable**: Get specific refactoring suggestions, not just detection
- **Multi-language**: Works across your entire tech stack
- **Automated + Manual**: Combines quick automated scanning with deep manual review

## Use Cases

- **Code review**: Systematic quality checks before merging
- **Refactoring planning**: Identify improvement opportunities
- **Teaching**: Demonstrate good vs. bad code patterns
- **Maintenance**: Assess technical debt in legacy codebases
- **Standards enforcement**: Apply consistent quality criteria

## Version

Version 1.0 - Created February 2026

## Author

Created using Claude's skill-creator system for Syracuse University educational repositories.

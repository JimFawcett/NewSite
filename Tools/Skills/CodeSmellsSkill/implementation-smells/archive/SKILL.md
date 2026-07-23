---
name: implementation-smells
description: Detect and analyze code quality issues and implementation smells in source code. Use when reviewing code quality, analyzing codebases for maintainability issues, detecting anti-patterns, or when users ask to identify code smells, refactor opportunities, or code quality problems. Supports C++, Python, Rust, C#, and general programming patterns. Trigger on requests like "find code smells", "analyze code quality", "what's wrong with this code", "review for maintainability", or "detect anti-patterns".
---

# Implementation Smells Detection

Systematically identify code quality issues, anti-patterns, and implementation smells across multiple programming languages to improve maintainability, readability, and robustness.

## Detection Workflow

Follow this process when analyzing code for implementation smells:

### 1. Determine Analysis Scope

**For single files/snippets:**
- Analyze the provided code directly
- Focus on localized smells (naming, nesting, function length)

**For multi-file codebases:**
- Ask user if they want automated scanning or manual review
- For automated: Use `scripts/smell_detector.py` on individual files
- For manual: Review files systematically, consulting reference catalog

**For specific languages:**
- Consult language-specific sections in `references/smell-catalog.md`
- Apply both universal and language-specific smell patterns

### 2. Load Reference Documentation

Read `references/smell-catalog.md` to access the comprehensive smell catalog when needed:
- For general review: Scan all categories
- For focused analysis: Jump to relevant category (e.g., Error Handling, Performance)
- For language-specific: Review language-specific sections

### 3. Systematic Analysis

Analyze code in this order for comprehensive coverage:

**a) Code Organization (5 minutes)**
- Long methods/functions (>50-100 lines)
- God classes (>500 lines, excessive responsibilities)
- Feature envy (methods using other classes more than own)
- Primitive obsession (primitives instead of domain objects)

**b) Naming and Documentation (3 minutes)**
- Unclear variable/function names (x, temp, data)
- Inconsistent naming conventions
- Missing documentation on public APIs
- Dead code (unused functions, commented blocks)

**c) Control Flow (5 minutes)**
- Deep nesting (>3-4 levels)
- Complex conditionals (>3 boolean operators)
- Duplicated code blocks
- Magic numbers/strings

**d) Error Handling (3 minutes)**
- Silent failures (empty catch blocks)
- Exception swallowing
- Unchecked return codes

**e) Language-Specific (3 minutes)**
- C++: Raw pointers, manual memory, missing virtual destructors
- Python: Mutable defaults, bare except, no context managers
- Rust: Excessive .clone(), unwrap proliferation
- C#: Missing IDisposable, async overuse

### 4. Report Generation

Structure findings clearly:

```
=== Implementation Smells Analysis ===

HIGH SEVERITY (requires immediate attention):
- [Smell Type] at Line X: [Description]
  → Impact: [Why it matters]
  💡 Suggestion: [How to fix]

MEDIUM SEVERITY (should address soon):
- [Similar format]

LOW SEVERITY (nice to have):
- [Similar format]

=== Summary ===
Total: X smell(s) detected
Prioritized recommendations: [Top 3 fixes]
```

### 5. Provide Actionable Recommendations

For each detected smell:
- Explain WHY it's problematic (not just WHAT)
- Show concrete refactoring example when helpful
- Prioritize fixes by impact and effort
- Suggest tools (linters, static analyzers) for ongoing detection

## Automated Detection

Use the provided script for quick automated scanning:

```bash
python scripts/smell_detector.py <source_file> [language]
```

The script detects:
- Long functions (>50 lines)
- Deep nesting (>4 levels)
- Magic numbers (hardcoded literals)
- Unclear naming (generic names like temp, data)

**Limitations:** Automated detection catches obvious smells but misses context-dependent issues. Always combine with manual review for comprehensive analysis.

## Common Analysis Requests

**"Review this code for quality issues"**
1. Read references/smell-catalog.md for smell categories
2. Systematically check each category
3. Provide structured report with severity levels

**"Find refactoring opportunities"**
1. Focus on Code Organization and Control Flow sections
2. Identify extraction opportunities (long methods, duplicated code)
3. Suggest specific refactorings with before/after examples

**"What's wrong with this code?"**
1. Quick scan for high-severity smells first
2. Explain impact of each issue found
3. Provide concrete improvement suggestions

**"Make this more maintainable"**
1. Detect smells hurting maintainability (naming, documentation, complexity)
2. Prioritize changes by ROI (impact vs effort)
3. Show step-by-step refactoring path

## Language-Specific Guidance

When analyzing language-specific code:

**C++ Code:**
- Check for RAII violations, raw pointer ownership
- Look for missing const-correctness
- Verify virtual destructors in base classes
- Review for modern C++ idioms (smart pointers, auto, range-based loops)

**Python Code:**
- Check for mutable default arguments
- Verify proper use of context managers
- Look for bare except clauses
- Review for PEP 8 compliance

**Rust Code:**
- Identify excessive .clone() calls (often indicates design issues)
- Check for unwrap()/expect() in production code
- Review lifetime annotations for over-specification
- Verify idiomatic error handling with Result<T>

**C# Code:**
- Check IDisposable implementation for resources
- Review async/await patterns for appropriateness
- Verify proper disposal patterns
- Check for exceptions used in control flow

## Best Practices

**When analyzing:**
- Start broad (automated scan), then deep-dive manually
- Consider context (teaching code vs production code has different standards)
- Balance perfectionism with pragmatism (not every smell needs fixing)
- Prioritize smells that impact actual problems (bugs, performance, security)

**When reporting:**
- Group related smells (don't list every magic number separately)
- Show impact, not just detection ("This causes X problem" not "This violates Y rule")
- Provide actionable fixes, not just criticism
- Celebrate good patterns found alongside smells

**When recommending:**
- Suggest incremental improvements (not "rewrite everything")
- Link smells to actual pain points (maintenance costs, bugs)
- Consider team expertise level in recommendations
- Recommend preventive tools (linters, IDE plugins, pre-commit hooks)

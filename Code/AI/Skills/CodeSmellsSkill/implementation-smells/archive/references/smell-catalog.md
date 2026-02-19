# Implementation Smells Reference

This document catalogs common implementation smells across multiple programming languages, organized by category.

## Code Organization Smells

### Long Method
- **Symptom**: Functions/methods exceeding 50-100 lines
- **Impact**: Difficult to understand, test, and maintain
- **Detection**: Count lines of code per function
- **Languages**: All

### God Class/Object
- **Symptom**: Classes with excessive responsibilities (>500 lines, >10 methods)
- **Impact**: High coupling, low cohesion, difficult to modify
- **Detection**: Class size, method count, dependency count
- **Languages**: OOP languages (C++, C#, Java, Python, Rust)

### Feature Envy
- **Symptom**: Method uses more features of another class than its own
- **Impact**: Poor encapsulation, misplaced responsibility
- **Detection**: Count external vs internal member access
- **Languages**: OOP languages

### Primitive Obsession
- **Symptom**: Using primitives instead of small objects for domain concepts (e.g., string for phone number)
- **Impact**: Scattered validation logic, unclear semantics
- **Detection**: Frequent primitive parameters, validation spread across code
- **Languages**: All

## Naming and Documentation Smells

### Unclear Naming
- **Symptom**: Variables like `x`, `temp`, `data`, `info`, single letters (except loop counters)
- **Impact**: Difficult to understand purpose
- **Detection**: Short names, generic terms, abbreviations without context
- **Languages**: All

### Inconsistent Naming
- **Symptom**: Mixed conventions (camelCase + snake_case, inconsistent prefixes)
- **Impact**: Confusion, harder navigation
- **Detection**: Pattern analysis across identifiers
- **Languages**: All

### Missing Documentation
- **Symptom**: Public APIs, complex algorithms without comments/docstrings
- **Impact**: Maintenance difficulty, incorrect usage
- **Detection**: Check for doc comments on public interfaces
- **Languages**: All (especially API-heavy code)

### Dead Code
- **Symptom**: Unused functions, variables, imports, commented-out blocks
- **Impact**: Cluttered codebase, maintenance burden
- **Detection**: Static analysis for unreachable/unused code
- **Languages**: All

## Control Flow Smells

### Deep Nesting
- **Symptom**: >3-4 levels of indentation (nested ifs, loops)
- **Impact**: Cognitive overload, hard to follow logic
- **Detection**: Maximum nesting depth
- **Languages**: All

### Complex Conditionals
- **Symptom**: Boolean expressions with >3 conditions, nested ternaries
- **Impact**: Error-prone, hard to test
- **Detection**: Count operators in conditionals
- **Languages**: All

### Duplicated Code
- **Symptom**: Identical or very similar code blocks in multiple places
- **Impact**: Maintenance burden, inconsistent changes
- **Detection**: Clone detection algorithms
- **Languages**: All

### Magic Numbers/Strings
- **Symptom**: Hardcoded literals without named constants
- **Impact**: Unclear meaning, difficult to update
- **Detection**: Literal values not in constant declarations
- **Languages**: All

## Error Handling Smells

### Silent Failures
- **Symptom**: Empty catch blocks, ignored return codes
- **Impact**: Hidden bugs, difficult debugging
- **Detection**: Empty exception handlers, unchecked results
- **Languages**: C++, C#, Python, Rust (via Result<T>)

### Exception Swallowing
- **Symptom**: Catching general exceptions without re-throw or logging
- **Impact**: Masked errors, debugging difficulty
- **Detection**: Catch-all handlers without action
- **Languages**: Exception-based languages

### Error Code Soup
- **Symptom**: Functions returning multiple error codes, deeply nested error checks
- **Impact**: Complex control flow, missed error cases
- **Detection**: Multiple return paths for errors, >3 error checks per function
- **Languages**: C, C++ (pre-C++17)

## Performance and Resource Smells

### Premature Optimization
- **Symptom**: Complex micro-optimizations without profiling data
- **Impact**: Reduced readability for negligible gains
- **Detection**: Unusual patterns, complex bit manipulations without justification
- **Languages**: All

### Resource Leaks
- **Symptom**: Missing cleanup, no RAII/using/with patterns
- **Impact**: Memory leaks, file handle exhaustion
- **Detection**: Missing destructors, no scope guards, manual memory management
- **Languages**: C++ (raw pointers), C, Python (file handles)

### Inefficient Algorithms
- **Symptom**: O(n²) when O(n log n) possible, repeated computation
- **Impact**: Poor scalability
- **Detection**: Nested loops over same data, repeated expensive calls
- **Languages**: All

## Language-Specific Smells

### C++
- **Raw Pointer Ownership**: Use of `new`/`delete` instead of smart pointers
- **Non-const References**: Output parameters via non-const ref instead of return values
- **Manual Memory Management**: Lack of RAII idiom
- **Missing Virtual Destructors**: Base classes without virtual destructors

### Python
- **Mutable Default Arguments**: Using lists/dicts as default parameters
- **Bare Except**: `except:` without exception type
- **Global State**: Excessive use of global variables
- **Not Using Context Managers**: Manual file handling instead of `with`

### Rust
- **Excessive Cloning**: `.clone()` everywhere to satisfy borrow checker
- **Unwrap Proliferation**: `.unwrap()` instead of proper error handling
- **String Confusion**: Mixing String/&str/OsString without clarity
- **Manual Lifetime Annotations**: Over-specifying lifetimes

### C#
- **IDisposable Not Implemented**: Resources without proper disposal
- **Async Over Sync**: Using async for non-I/O operations
- **Finalize Without Dispose**: Finalizers without IDisposable pattern
- **Exception for Control Flow**: Using exceptions for normal program flow

## Anti-Patterns

### Shotgun Surgery
- **Symptom**: Single change requires modifications across many files
- **Impact**: High coupling, error-prone changes
- **Detection**: Change impact analysis
- **Languages**: All

### Inappropriate Intimacy
- **Symptom**: Classes accessing each other's internals excessively
- **Impact**: Tight coupling, fragile code
- **Detection**: Friend classes, protected member usage, excessive getters/setters
- **Languages**: OOP languages

### Refused Bequest
- **Symptom**: Subclass doesn't use inherited methods
- **Impact**: Broken Liskov Substitution Principle
- **Detection**: Overridden methods that throw exceptions or do nothing
- **Languages**: OOP languages

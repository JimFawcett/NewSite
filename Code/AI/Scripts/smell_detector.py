#!/usr/bin/env python3
"""
Automated implementation smell detector.
Analyzes source code files for common code smells.
Windows-compatible version with ASCII-only output.
"""

import re
import sys
import os
from pathlib import Path
from typing import List, Dict, Tuple
from dataclasses import dataclass


@dataclass
class SmellReport:
    """Represents a detected code smell."""
    smell_type: str
    severity: str  # 'high', 'medium', 'low'
    line_number: int
    description: str
    suggestion: str


class SmellDetector:
    """Detects implementation smells in source code."""
    
    def __init__(self, language: str):
        self.language = language.lower()
        self.reports: List[SmellReport] = []
    
    def detect_long_function(self, lines: List[str], threshold: int = 50) -> List[SmellReport]:
        """Detect functions exceeding line count threshold."""
        smells = []
        
        # Language-specific function patterns
        patterns = {
            'python': r'^\s*def\s+(\w+)',
            'c++': r'^\s*\w+[\s\*&]+(\w+)\s*\([^)]*\)\s*{?',
            'rust': r'^\s*fn\s+(\w+)',
            'c#': r'^\s*\w+\s+(\w+)\s*\([^)]*\)\s*{',
        }
        
        pattern = patterns.get(self.language)
        if not pattern:
            return smells
        
        in_function = False
        func_start = 0
        func_name = ""
        
        for i, line in enumerate(lines, 1):
            match = re.search(pattern, line)
            if match:
                # If we were in a function, check its length
                if in_function and (i - func_start) > threshold:
                    smells.append(SmellReport(
                        smell_type="Long Function",
                        severity="high",
                        line_number=func_start,
                        description=f"Function '{func_name}' is {i - func_start} lines long",
                        suggestion=f"Consider breaking down '{func_name}' into smaller, focused functions"
                    ))
                
                in_function = True
                func_start = i
                func_name = match.group(1)
        
        return smells
    
    def detect_deep_nesting(self, lines: List[str], max_depth: int = 4) -> List[SmellReport]:
        """Detect deeply nested control structures."""
        smells = []
        
        for i, line in enumerate(lines, 1):
            # Count leading whitespace
            stripped = line.lstrip()
            if not stripped or stripped.startswith('#') or stripped.startswith('//'):
                continue
            
            indent = len(line) - len(stripped)
            
            # Assume 4 spaces per level (adjust based on detected style)
            depth = indent // 4
            
            if depth > max_depth:
                smells.append(SmellReport(
                    smell_type="Deep Nesting",
                    severity="medium",
                    line_number=i,
                    description=f"Nesting level {depth} exceeds recommended maximum",
                    suggestion="Consider extracting nested logic into separate functions or use early returns"
                ))
        
        return smells
    
    def detect_magic_numbers(self, lines: List[str]) -> List[SmellReport]:
        """Detect hardcoded numeric literals (excluding 0, 1, -1)."""
        smells = []
        
        # Numbers to ignore (common constants)
        ignore = {0, 1, -1, 2}
        
        for i, line in enumerate(lines, 1):
            # Skip comments and strings
            if re.search(r'^\s*[#//]', line) or '"' in line or "'" in line:
                continue
            
            # Find numeric literals
            numbers = re.findall(r'\b(\d+\.?\d*)\b', line)
            for num_str in numbers:
                try:
                    num = float(num_str)
                    if num not in ignore and num > 1:
                        smells.append(SmellReport(
                            smell_type="Magic Number",
                            severity="low",
                            line_number=i,
                            description=f"Magic number '{num_str}' used without named constant",
                            suggestion=f"Consider extracting '{num_str}' to a named constant"
                        ))
                except ValueError:
                    pass
        
        return smells
    
    def detect_unclear_naming(self, lines: List[str]) -> List[SmellReport]:
        """Detect unclear variable/function names."""
        smells = []
        
        # Problematic name patterns
        unclear_patterns = [
            r'\b(x|y|z|i|j|k)\s*=',  # Single letter vars (except in loops)
            r'\b(temp|tmp|data|info|val|var)\d*\s*=',
            r'\b(foo|bar|baz)\s*=',
        ]
        
        for i, line in enumerate(lines, 1):
            # Skip for loops (i, j, k are acceptable)
            if 'for' in line and any(x in line for x in ['i', 'j', 'k']):
                continue
            
            for pattern in unclear_patterns:
                if re.search(pattern, line):
                    smells.append(SmellReport(
                        smell_type="Unclear Naming",
                        severity="medium",
                        line_number=i,
                        description="Variable has unclear or generic name",
                        suggestion="Use descriptive names that reveal intent"
                    ))
                    break
        
        return smells
    
    def detect_all(self, code: str) -> List[SmellReport]:
        """Run all smell detectors on the code."""
        lines = code.split('\n')
        
        all_smells = []
        all_smells.extend(self.detect_long_function(lines))
        all_smells.extend(self.detect_deep_nesting(lines))
        all_smells.extend(self.detect_magic_numbers(lines))
        all_smells.extend(self.detect_unclear_naming(lines))
        
        # Sort by line number
        all_smells.sort(key=lambda s: s.line_number)
        
        return all_smells


def analyze_file(filepath: Path, language: str = None) -> List[SmellReport]:
    """Analyze a source file for implementation smells."""
    
    # Auto-detect language from extension if not provided
    if not language:
        ext_to_lang = {
            '.py': 'python',
            '.cpp': 'c++',
            '.cc': 'c++',
            '.cxx': 'c++',
            '.rs': 'rust',
            '.cs': 'c#',
        }
        language = ext_to_lang.get(filepath.suffix.lower(), 'unknown')
    
    with open(filepath, 'r', encoding='utf-8') as f:
        code = f.read()
    
    detector = SmellDetector(language)
    return detector.detect_all(code)


def format_report(smells: List[SmellReport], filepath: Path) -> str:
    """Format smell reports for display (ASCII-only for Windows compatibility)."""
    if not smells:
        return f"[OK] No implementation smells detected in {filepath.name}"
    
    output = [f"\n=== Implementation Smells in {filepath.name} ===\n"]
    
    # Group by severity
    by_severity = {'high': [], 'medium': [], 'low': []}
    for smell in smells:
        by_severity[smell.severity].append(smell)
    
    for severity in ['high', 'medium', 'low']:
        items = by_severity[severity]
        if not items:
            continue
        
        output.append(f"\n{severity.upper()} SEVERITY ({len(items)} found):")
        for smell in items:
            output.append(f"\n  Line {smell.line_number}: {smell.smell_type}")
            output.append(f"  -> {smell.description}")
            output.append(f"  [TIP] {smell.suggestion}")
    
    output.append(f"\n\nTotal: {len(smells)} smell(s) detected")
    return '\n'.join(output)


if __name__ == '__main__':
    # Force UTF-8 encoding for Windows
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    
    if len(sys.argv) < 2:
        print("Usage: python smell_detector.py <source_file> [language]")
        sys.exit(1)
    
    filepath = Path(sys.argv[1])
    language = sys.argv[2] if len(sys.argv) > 2 else None
    
    if not filepath.exists():
        print(f"Error: File '{filepath}' not found")
        sys.exit(1)
    
    smells = analyze_file(filepath, language)
    print(format_report(smells, filepath))
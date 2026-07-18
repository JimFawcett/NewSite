# pytools context

## Codebase
Root: c:\github\JimFawcett\NewSite
HTML files: Code/, Rust/, Cpp/, CSharp/, Python/, SWDev/, WebDev/
JS files: js/ (site-wide) or Code/js/ (code-track-specific)
CSS files: css/

## Tool Conventions
Language: Python 3, stdlib only unless the task requires otherwise
Output: print to stdout, one result per line
Errors: print to stderr, continue processing remaining items
Paths: print as relative paths from the root

## What to Avoid
No hardcoded absolute paths
No pip dependencies unless explicitly requested
No interactive prompts - all configuration via command-line arguments

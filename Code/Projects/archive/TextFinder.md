# TextFinder

## Overview

TextFinder searches for text patterns within files across a directory tree.

## Features

- Recursive directory traversal
- Pattern matching (literal and/or regex)
- Configurable file type filtering
- Summary report of matches found

## Usage

```
TextFinder [options] <pattern> <root-directory>

Options:
  -r, --regex       treat pattern as a regular expression
  -e, --ext <exts>  comma-separated list of file extensions to search
  -s, --summary     print summary only
```

## Example

```
TextFinder -e .cpp,.h "TODO" ./src
```

## Build

```
dotnet build
```

## Status

Under construction.

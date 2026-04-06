# CsParser

https://JimFawcett.github.io/CsParser.html

Rule-based parser written in C#

## Overview

CsParser is a pipeline that performs static analysis of C# source files, reporting each detected type and function along with its line range, scope depth, size, and complexity.

**Pipeline:** `Tokenizer` → `SemiExpression` → `ScopeStack` → `Parser`

## Packages

| Package | Description |
|---|---|
| `Tokenizer` | Reads source characters and emits tokens |
| `SemiExpression` | Groups tokens into semi-expressions ending in `{`, `}`, or `;` |
| `ScopeStack` | Tracks scope nesting as scopes open and close |
| `Parser` | Applies rules and actions to detect namespaces, classes, structs, and functions |
| `Display` | Manages display properties and console output helpers |

## Build

Requires .NET 10.0 SDK.

```
dotnet build CSharp_Analyzer.sln
```

## Run

From the `CsParser/` directory:

```
dotnet run --project Parser/Parser.csproj
```

To parse specific files (first arg is directory, remaining args are filenames):

```
dotnet run --project Parser/Parser.csproj -- Parser Parser.cs RulesAndActions.cs
```

## Output columns

| Column | Meaning |
|---|---|
| `category` | namespace, class, struct, function, or public declaration |
| `name` | identifier name |
| `bLine` | line where the element begins |
| `eLine` | line where the element ends |
| `bScop` | scope count at entry |
| `eScop` | scope count at exit |
| `size` | line count (`eLine - bLine + 1`) |
| `cmplx` | scope nesting depth (`eScop - bScop + 1`) |

## Sample Output

```
  Demonstrating Parser
 ======================

  Commandline args are:
    Parser  Parser.cs  RulesAndActions.cs  ScopeStack.cs  Semi.cs  Toker.cs
  current directory: C:\github\JimFawcett\NewSite\Code\C#\CsParser

  Processing file Parser.cs

  Type and Function Analysis
 ----------------------------
  locations table contains:
    category,                      name, bLine, eLine, bScop, eScop,  size, cmplx
    --------,                      ----, -----, -----, -----, -----,  ----, -----
   namespace,              CodeAnalysis,    46,   179,     1,    19,   134,    18

       class,                    Parser,    51,    76,     2,     7,    26,     5
    function,                    Parser,    55,    58,     3,     4,     4,     1
    function,                       add,    59,    62,     4,     5,     4,     1
    function,                     parse,    63,    75,     5,     7,    13,     2

       class,                TestParser,    78,   178,     7,    19,   101,    12
    function,        ProcessCommandline,    82,    98,     8,    11,    17,     3
    function,           ShowCommandLine,   100,   109,    11,    13,    10,     2
    function,                      Main,   115,   178,    13,    19,    64,     6

  Processing file RulesAndActions.cs

  Type and Function Analysis
 ----------------------------
  locations table contains:
    category,                      name, bLine, eLine, bScop, eScop,  size, cmplx
    --------,                      ----, -----, -----, -----, -----,  ----, -----
   namespace,              CodeAnalysis,    97,   119,     1,    11,    23,    10

       class,                      Elem,    99,   118,     2,    11,    20,     9
    function,                  ToString,   108,   117,     9,    11,    10,     2
    function,                    Append,   116,   117,    10,    11,     2,     1

       class,                Repository,   121,   189,    11,    27,    69,    16
    function,                Repository,   129,   132,    12,    13,     4,     1
    function,               getInstance,   135,   138,    13,    14,     4,     1

       class,                 PushStack,   193,   225,    27,    31,    33,     4
    function,                 PushStack,   195,   198,    28,    29,     4,     1
    function,                  doAction,   199,   224,    29,    31,    26,     2

       class,                  PopStack,   229,   277,    31,    41,    49,    10
    function,                  PopStack,   231,   234,    32,    33,     4,     1
    function,                  doAction,   235,   276,    33,    41,    42,     8

       class,             PrintFunction,   281,   299,    41,    45,    19,     4
    function,             PrintFunction,   283,   286,    42,    43,     4,     1
    function,                   display,   287,   294,    43,    44,     8,     1
    function,                  doAction,   295,   298,    44,    45,     4,     1

       class,                     Print,   303,   314,    45,    48,    12,     3
    function,                     Print,   305,   308,    46,    47,     4,     1
    function,                  doAction,   309,   313,    47,    48,     5,     1

       class,                SaveDeclar,   318,   344,    48,    52,    27,     4
    function,                SaveDeclar,   320,   323,    49,    50,     4,     1
    function,                  doAction,   324,   343,    50,    52,    20,     2

       class,           DetectNamespace,   348,   365,    52,    55,    18,     3
    function,                      test,   350,   364,    53,    55,    15,     2

       class,               DetectClass,   369,   391,    55,    58,    23,     3
    function,                      test,   371,   390,    56,    58,    20,     2

       class,            DetectFunction,   395,   421,    58,    63,    27,     5
    function,            isSpecialToken,   397,   405,    59,    61,     9,     2
    function,                      test,   405,   420,    61,    63,    16,     2

       class,      DetectAnonymousScope,   426,   443,    63,    66,    18,     3
    function,                      test,   428,   442,    64,    66,    15,     2

       class,        DetectPublicDeclar,   447,   478,    66,    71,    32,     5
    function,                      test,   449,   477,    67,    71,    29,     4

       class,        DetectLeavingScope,   482,   495,    71,    74,    14,     3
    function,                      test,   484,   494,    72,    74,    11,     2

       class,         BuildCodeAnalyzer,   496,   550,    74,    77,    55,     3
    function,         BuildCodeAnalyzer,   500,   503,    75,    76,     4,     1
    function,                     build,   504,   549,    76,    77,    46,     1
```

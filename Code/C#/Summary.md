# C# Project Retargeting Summary

All legacy `.csproj` files under `Code/C#` were converted from .NET Framework format to SDK-style targeting `net8.0`.

## Phase 1 — Bulk conversion (184 projects)

- All legacy `.csproj` files converted to SDK-style targeting `net8.0` (or `net8.0-windows` for the 67 WPF projects, which also got `<UseWPF>true</UseWPF>`)
- `<GenerateAssemblyInfo>false</GenerateAssemblyInfo>` added wherever `Properties/AssemblyInfo.cs` existed

## Phase 2 — Follow-up fixes

- **15 projects** with `AssemblyInfo.cs` in the project root (not `Properties/`): added `<GenerateAssemblyInfo>false</GenerateAssemblyInfo>`
- **5 projects** with `Backup*/` subdirectories containing `.cs` files: added `<Compile Remove="Backup*/**" />` exclusions + `<Deterministic>false</Deterministic>` for the `1.0.*` version wildcard
- **22 projects** that were libraries with `Main` behind `#if` blocks: changed `OutputType` to `Library`
- **`old/` folder** in `CsDependencyAnalysis/Parser/`: excluded from glob to avoid stale duplicate types

## Phase 3 — Source code bugs (namespace brace inside `#if` pattern)

- `CsDependencyAnalysis/Toker/Toker.cs` and `SemiExp/Semi.cs`: namespace-closing `}` was inside `#if` block — added proper namespace re-opening inside `#if`
- `CsBasicDemos/LambdaDemo/UtilityExtensions/Utilities.cs`: class-closing `}` was inside `#if` — moved after `#endif`

## Phase 4 — Project references restored

The bulk conversion replaced entire `.csproj` files, losing any inter-project references that were defined there. The following were restored:

| Project | References Added |
|---|---|
| `CsDependencyAnalysis/SemiExp` | Toker |
| `CsDependencyAnalysis/Parser` | Toker, SemiExp, Element, TypeTable, DependencyTable, Display |
| `CsDependencyAnalysis/Display` | Element |
| `CsDependencyAnalysis/DemoExecutive` | Toker, SemiExp, Parser, Element, Display, DependencyTable, CsGraph, FileMgr |
| `CsDependencyAnalysis/DemoReqs` | Toker, SemiExp, TestHarness, FileMgr |
| `CsParser/SemiExpression` | Tokenizer |
| `CsParser/Parser` | Tokenizer, SemiExpression, ScopeStack, Display |
| `CsBasicDemos/LambdaDemo/LambdaDemo` | UtilityExtensions |

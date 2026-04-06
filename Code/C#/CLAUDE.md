# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This directory is a collection of standalone C# educational demo projects, each illustrating a specific concept or pattern. There is no unified build — each project is built independently.

## Building Projects

**SDK-style projects** (newer, `<Project Sdk="Microsoft.NET.Sdk">`):
```
dotnet build <path-to-csproj>
dotnet run --project <path-to-csproj>
```

**Legacy-style projects** (older, `ToolsVersion` format targeting .NET Framework): These require Visual Studio or MSBuild with the full .NET Framework installed. `dotnet build` will not work for them.

To identify the style, check the first line of the `.csproj`: SDK-style starts with `<Project Sdk=`, legacy starts with `<Project DefaultTargets="Build"`.

## Project Inventory

| Directory | Description |
|---|---|
| `Hello/` | Minimal SDK-style hello world (net8.0) |
| `CsBasicDemos/` | Language syntax: collections, conversions, delegates, LINQ, reflection, extension methods, threads |
| `CsBlockingQueue/` | Thread-safe queue that blocks on dequeue when empty |
| `CsCommPrototype/` | Async message-passing communication channel |
| `CsConcurrentFileAccess/` | Retry facility for opening files in concurrent environments |
| `CsDependencyAnalysis/` | Static type-based dependency analysis across a C# directory tree |
| `CsGraph/` | Directed graph representation classes |
| `CsNavigator/` | Directory tree navigation with and without delegates |
| `CsParser/` | Rule-based parser: Tokenizer → SemiExpression → ScopeStack → Parser pipeline |
| `CsProcess/` | Demonstrates the .NET `Process` class |
| `CsPublisherSubscriber/` | Publisher-subscriber pattern demo |
| `CsRemotePluggableRepo/` | Code repository with pluggable checkin/ownership/checkout policies |
| `CsXDocument/` | XDocument and XElement API demos |
| `Cs_WCF_Demos/` | WCF service demos (self-hosted, HTTP bindings, message passing) |
| `Cs_WPF_Demos/` | WPF UI demos (panels, controls, data binding, templates, drag-drop) |

## Key Structural Notes

- **No tests** — demos verify behavior via console output; `Main()` is the executable entry and demo harness.
- **Backup/ folders** — many projects contain `Backup/`, `Backup1/`, `Backup2/` subdirectories with older versions. These are historical snapshots; edit only the non-Backup copies.
- **CsParser multi-package layout** — `Tokenizer`, `SemiExpression`, `ScopeStack`, `Parser`, and `Display` are separate packages in the same solution (`CSharp_Analyzer.sln`). They are meant to be composed in a pipeline.
- **CsRemotePluggableRepo** uses a multi-project solution (`PluggableRepo.sln`) with pluggable component interfaces — `IPluggableComponent` defines the contract.
- **WCF demos** require Windows and .NET Framework; they will not run on .NET Core/5+.
- **WPF demos** require Windows; WPF is supported on .NET 6+ (Windows only).

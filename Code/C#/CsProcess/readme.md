# CsProcess

https://JimFawcett.github.io/CsProcess.html

Demonstrates use of the .NET `System.Diagnostics.Process` class to inspect the current process and launch a child process with command-line arguments.

## Projects

| Project | Description |
|---|---|
| `ProcessDemo` | Parent process — queries its own `Process` info, then starts a child |
| `simpleConsoleApp` | Child process — reports its own `Process` info and displays received arguments |

## Build and Run

Build the child process first, then run the parent:

```
dotnet build simpleConsoleApp/simpleConsoleApp.csproj
dotnet run --project ProcessDemo.csproj
```

## Output

**Parent process** (terminal):
```
  Parent Process 
 ================

  Process Name = ProcessDemo
  Main Module  = System.Diagnostics.ProcessModule (ProcessDemo.exe)
  File Name    = C:\...\CsProcess\bin\Debug\net10.0\ProcessDemo.exe

  Setting Arguments for child process: FirstArg SecondArg
```

**Child process** (spawned in a new console window):
```
  Child Process 
 ===============

  Process Name = simpleConsoleApp
  Main Module  = System.Diagnostics.ProcessModule (simpleConsoleApp.exe)
  File Name    = C:\...\simpleConsoleApp\bin\Debug\net10.0\simpleConsoleApp.exe

  my arguments are:
    FirstArg
    SecondArg
```

## Target Framework

`net10.0`

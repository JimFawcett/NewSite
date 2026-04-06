# CsConcurrentFileAccess

https://JimFawcett.github.io/CsConcurrentFileAccess.html

Demonstrates a retry facility for safe file access in concurrent environments where multiple
threads or processes may simultaneously read and write the same file.

## Projects

### ConcurrFileReads (FileReader)

`ConcurrFileReads/FileReader.cs` — `FileReader` class in namespace `FileLocks`.

Handles concurrent read access to a file that may also be open for writing. Opens the file
with `FileShare.Read` so multiple readers can coexist. If the open fails (e.g., a writer
holds an exclusive lock), it retries up to `NumAttempts` times (default 50), sleeping
`SleepMilliSecs` milliseconds (default 50) between attempts.

**Public interface:**
```csharp
FileReader fr = new FileReader();
bool ok       = fr.Open(fileSpec);     // open with shared-read lock; retries on failure
fr.Close();
int n         = fr.ReadFile(path);     // reads entire file into internal byte array
byte[] bytes  = fr.LastFileRead();     // returns the byte array from the last read
int attempts  = fr.NumAttempts;        // get/set max retry count (default 50)
int failures  = fr.NumFailures;        // number of times all retries were exhausted
fr.SleepMilliSecs = 100;              // get/set sleep between retries (default 50 ms)
```

### ConcurrFileWrites (FileWriter)

`ConcurrFileWrites/FileWriter.cs` — `FileWriter` class in namespace `FileLocks`.  
`ConcurrFileWrites/FileReader.cs` — same `FileReader` used internally by `FileWriter`.

Handles concurrent write access to a file that may already be open for reading or writing.
Opens the file with `FileAccess.Write` and `FileShare.None` (exclusive lock). Retries on
failure with the same sleep-and-retry strategy as `FileReader`. `CopyFile` uses `FileReader`
internally to read the source before acquiring the write lock.

**Public interface:**
```csharp
FileWriter fw = new FileWriter();
bool ok       = fw.Open(outFile);                  // open with exclusive-write lock; retries on failure
fw.Close();
int n         = fw.CopyFile(readPath, writePath);  // read source file, write to destination
int attempts  = fw.NumAttempts;                    // get/set max retry count (default 50)
int failures  = fw.NumFailures;                    // number of times all retries were exhausted
fw.SleepMilliSecs = 100;                          // get/set sleep between retries (default 50 ms)
```

## Build and Run

Both projects are SDK-style and target **net10.0**.

```
dotnet run --project ConcurrFileReads/ConcurrentReads.csproj -- <filename>
dotnet run --project ConcurrFileWrites/ConcurrentWrites.csproj -- <readFile> <writeFile>
```

Each project's test stub (`TEST_FILEREADER` / `TEST_FILEWRITER`) is enabled via
`<DefineConstants>` in the `.csproj` and exercises the class in a 25,000-iteration loop,
reporting bytes transferred and open failures.

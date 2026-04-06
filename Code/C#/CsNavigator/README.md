# CsNavigator

https://JimFawcett.github.io/CsNavigator.html

Directory navigation with, and without the use of delegates

## Projects

- **Navigate** — recursively walks a directory tree and displays files with size and timestamp, using direct application logic inside the navigator.
- **NavigateWithDelegates** — same traversal, but the navigator fires `newDir` and `newFile` events; all display logic lives in registered handlers, making the navigator reusable.

## Building and Running

```
dotnet run Navigate/Navigate.csproj
dotnet run NavigateWithDelegates/NavigateWithDelegates.csproj
```

## Sample Output (NavigateWithDelegates)

```
  Demonstrate Directory Navigation with Delegates 
 =================================================

  C:\github\JimFawcett\NewSite\Code\C#
   CLAUDE.md                               2966 bytes  4/1/2026 10:10:37 AM
   convert_csproj.py                       5067 bytes  4/1/2026 10:35:22 AM
   Summary.md                              2180 bytes  4/1/2026 11:38:55 AM

  C:\github\JimFawcett\NewSite\Code\C#\Basics

  C:\github\JimFawcett\NewSite\Code\C#\CsBasicDemos
   README.md                               3059 bytes  4/1/2026 12:03:12 PM

  C:\github\JimFawcett\NewSite\Code\C#\CsBasicDemos\Collections
   collections.doc                       105984 bytes  1/6/2017  6:25:44 AM
   Collections.sln                         1628 bytes  10/21/2019 2:11:15 PM
   Collections.suo                        16896 bytes  1/6/2017  6:25:43 AM
   CollectionsDemo.doc                   114176 bytes  1/6/2017  6:25:43 AM
   Question9.doc                          45568 bytes  1/6/2017  6:25:43 AM
   UpgradeLog.htm                         45990 bytes  10/21/2019 2:11:15 PM
   UpgradeLog.XML                          4271 bytes  1/6/2017  6:25:43 AM
   UpgradeLog2.XML                         4291 bytes  1/6/2017  6:25:43 AM
   WS_FTP.LOG                              5315 bytes  1/6/2017  6:25:43 AM

  ... (continues recursively through entire tree)
```

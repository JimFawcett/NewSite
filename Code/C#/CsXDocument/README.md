# CsXDocument

https://JimFawcett.github.io/CsXDocument.html

Demonstrates use of .Net XDocument and XElement classes

## Projects

### XDocument-Create-XML
Demonstrates creating, saving, loading, and querying XML using `System.Xml.Linq.XDocument`:
- Building an XML tree with `XElement`, `XAttribute`, and `XComment`
- Setting the XML declaration via `XDocument.Declaration`
- Saving to file with `XDocument.Save()` and loading with `XDocument.Load()`
- Parsing XML from a string with `XDocument.Parse()`
- Querying elements by tag name, attribute name, attribute name/value pair, and element value using `Descendants()`

### DemoExtensions
A small utility library (also runnable standalone) providing a `title()` extension method on `string` that prints a titled section header with an underline character to the console.

## Build and Run

Requires .NET 10.0.

```
dotnet run --project XDocument-Create-XML/Create-XML.csproj
dotnet run --project DemoExtensions/DemoExtensions.csproj
```

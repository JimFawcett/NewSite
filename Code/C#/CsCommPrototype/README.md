# CsCommPrototype

https://JimFawcett.github.io/CsCommPrototype.html

Asynchronous message-passing communication channel using WCF (Windows Communication Foundation) over HTTP.

## Overview

Demonstrates a multi-component async messaging framework built on WCF/CoreWCF:

- **ICommService** — shared service contract (`[ServiceContract]`) and `Message` data contract
- **CommService** — service implementation with a static `BlockingQueue<Message>` shared across sessions
- **Receiver** — hosts the WCF endpoint via CoreWCF/ASP.NET Core; provides `getMessage()` for server-side dequeue
- **Sender** — connects to a remote Receiver via `ChannelFactory<ICommService>` and queues outgoing messages on a background thread
- **BlockingQueue** — thread-safe queue that blocks on dequeue when empty
- **Utilities** — URL helpers and shared display functions
- **MakeMessage** — factory for constructing demo messages
- **Server** — echo server: receives messages and sends them back to the originating client
- **SimpleServer** — minimal server, easy starting point for extension
- **Client / Client2** — console clients with both Sender and Receiver, connect to Server
- **WpfClient** — GUI client using WPF

## Architecture

```
Client                          Server
------                          ------
Receiver (port 8081) <----+     Receiver (port 8080) <----+
Sender -------------------|---> CommService               |
                          |         BlockingQueue          |
                          |     Sender -------------------|
                          +-------------------------------+
                              echo-back messages
```

Each process hosts its own Receiver (listener) and uses a Sender to post messages to remote listeners. Messages flow through the static `BlockingQueue` inside `CommService`.

## Projects and Dependencies

| Project | Type | Depends On |
|---|---|---|
| `BlockingQueue` | Library | — |
| `ICommService` | Library | — |
| `Utilities` | Exe (test stub) | ICommService |
| `CommService` | Library | ICommService, BlockingQueue, Utilities |
| `Receiver` | Library | ICommService, CommService, Utilities |
| `Sender` | Library | ICommService, BlockingQueue, Utilities |
| `MakeMessage` | Library | ICommService, Utilities |
| `Server` | Exe | ICommService, Sender, Receiver, Utilities |
| `SimpleServer` | Exe | ICommService, Sender, Receiver, Utilities |
| `Client` | Exe | ICommService, Sender, Receiver, Utilities |
| `Client2` | Exe | ICommService, Sender, Receiver, Utilities |
| `WpfClient` | WinExe (WPF) | ICommService, Sender, Receiver, MakeMessage, Utilities |

## Build

Requires .NET 10 SDK.

```
dotnet build CommPrototype.sln
```

## Running the Demo

Open two terminals:

**Terminal 1 — Server:**
```
cd Server
dotnet run --no-build
```

**Terminal 2 — Client (after server prints "Now listening on: http://localhost:8080"):**
```
cd Client
dotnet run --no-build
```

Run `Client2` in a third terminal simultaneously to demonstrate multi-client message routing. Press any key in each window to quit.

## Notes

- **Porting from .NET Framework**: Originally written targeting .NET Framework WCF. Updated to .NET 10 using:
  - `CoreWCF.Http` — server-side hosting via ASP.NET Core (`Receiver`, `CommService`, `ICommService`)
  - `System.ServiceModel.Http` — client-side channel factory (`Sender`)
  - `Receiver` now uses `WebApplication` instead of the legacy `ServiceHost`
- **WpfClient** requires Windows (`net10.0-windows`)
- Default ports: Server=8080, Client=8081, Client2=8082

# Cs_WCF_Demos

https://JimFawcett.github.io/Cs_WCF_Demos.html

Contains several demonstrations of WCF with projects not built with Visual Studio wizard.

All demos target **net10.0** and use **CoreWCF** for service hosting (replacing the original
`System.ServiceModel.ServiceHost`) and **System.ServiceModel.Http** for client-side channels.
Each service host is started with `dotnet run` from its `ServiceHost/` folder, then the client
is run from its `ServiceClient/` (or `client/`) folder.

---

## FileService-SelfHost

**Location:** `FileService-SelfHost/`  
**Solution:** `Solution1.sln`

### Description

A self-hosted WCF service that transfers files from client to server over HTTP using
`WSHttpBinding` with `SecurityMode.None`. The client reads files from a local `FilesToSend/`
directory and uploads them block-by-block via three operations: `OpenFileForWrite`, `WriteFileBlock`,
and `CloseFile`. Received files are saved in `.\SentFiles\` on the service side.

**Projects:**
- `FileTransferService/` — CoreWCF service host (SDK.Web, `CoreWCF.Http`)
- `FileServiceClient/` — client (`System.ServiceModel.Http`)

### Sample Output

**Service (`FileTransferService`):**
```
File Transfer Service running:
================================

Listening at http://localhost:8080/FileService
Press Ctrl+C to terminate service

.\SentFiles\test.txt opened
  writing block with 39 bytes
```

**Client (`FileServiceClient`):**
```
Client of File Transfer Service
=================================

Connected to http://localhost:8080/FileService

retrieving files from
C:\...\FileServiceClient\FilesToSend

sending file test.txt
```

---

## FileStreaming

**Location:** `FileStreaming/`  
**Solution:** `FileStreaming.sln`

### Description

Demonstrates WCF file transfer over HTTP using `BasicHttpBinding`. The service exposes
`upLoadFile(filename, byte[])` and `downLoadFile(filename) → byte[]`. The client uploads
three files from its `ToSend/` directory and downloads two back; a deliberate `foobar`
download demonstrates error handling when a file does not exist.

The original demo used WCF `TransferMode.Streamed` with `[MessageContract]` + `Stream`
body members, which CoreWCF does not support. The interface was adapted to use `byte[]`
parameters while preserving the upload/download semantics.

Service listens on port **8010** (8000 is used by another process in this environment).

**Projects:**
- `service/` — CoreWCF service host (SDK.Web, `CoreWCF.Http`)
- `client/` — client (`System.ServiceModel.Http`)

### Sample Output

**Client:**
```
Client of SelfHosted File Stream Service
==========================================

sending file "test.txt"
sending file "Channel_Client_Copy.exe"
sending file "FileStreaming.zip"

Received file "test.txt" (37 bytes)
Received file "FileStreaming.zip" (130538 bytes)
open failed for "foobar"
```

**Service:**
```
SelfHosted File Stream Service started
========================================

Listening at http://localhost:8010/StreamService
Press Ctrl+C to terminate service

Received file "test.txt" (37 bytes)
Received file "Channel_Client_Copy.exe" (6656 bytes)
Received file "FileStreaming.zip" (130538 bytes)
Sending file "test.txt"
Sending file "FileStreaming.zip"
```

---

## HandCraftedBasicHttpServices

**Location:** `HandCraftedBasicHttpServices/`

Three variants of a simple WCF service over `BasicHttpBinding` that demonstrates the
`sendMessage` / `getMessage` contract. All share the same service interface:

```csharp
[ServiceContract(Namespace="HandCraftedService")]
public interface IBasicService
{
    [OperationContract] void sendMessage(string msg);
    [OperationContract] string getMessage();
}
```

All three host on port **8080**.

**Note on project structure:** Each variant has four projects — `IService`, `Service`,
`ServiceHost`, `ServiceClient`. The service-side `IService` project uses `CoreWCF` attributes;
the `ServiceClient` project includes its own copy of the interface with `System.ServiceModel`
attributes to avoid an assembly-level namespace conflict between CoreWCF and System.ServiceModel.

---

### BasicService-Declarative

**Location:** `HandCraftedBasicHttpServices/BasicService-Declarative/`  
**Solution:** `DeclBasicService.sln`

#### Description

Originally configured entirely via `app.config` (both service host and client). Migrated to
CoreWCF programmatic hosting on the service side. The client uses a `proxy` class derived from
`ClientBase<IBasicService>` initialized with binding and address directly in code, demonstrating
two proxy instances making independent calls.

#### Sample Output

**Client:**
```
Starting Declarative BasicService Client
==========================================

using first proxy
-------------------
Message received from Service: a new message from Service

using second proxy
--------------------
Message received from Service: a new message from Service
```

**Service:**
```
Starting Declarative BasicService
===================================

Started BasicService at http://localhost:8080/BasicService
Press Ctrl+C to exit

Service received message This is a test message from first client
Service received message This is a test message from second client
```

---

### BasicService-Programmatic

**Location:** `HandCraftedBasicHttpServices/BasicService-Programmatic/`  
**Solution:** `ProgBasicService.sln`

#### Description

Service and client are both configured entirely in code. The client sends five numbered
messages followed by a `"quit"` sentinel, then polls `getMessage()` until the service
echoes `"quit"` back. Includes retry logic in the client to tolerate a slow-starting server.
The service tracks a message count and sets a stop flag when `"quit"` is received.

#### Sample Output

**Client:**
```
Starting Programmatic Basic Service Client
============================================

Message recieved from Service: new message from Service
Message recieved from Service: new message from Service
Message recieved from Service: new message from Service
Message recieved from Service: new message from Service
Message recieved from Service: new message from Service
Message recieved from Service: quit
```

**Service:**
```
Starting Programmatic Basic Service
=====================================

Started BasicService at http://localhost:8080/BasicService
Press Ctrl+C to exit

Service received message message #1 from client
Service received message message #2 from client
Service received message message #3 from client
Service received message message #4 from client
Service received message message #5 from client
Service received message quit
```

---

### BasicService-ProgrammaticVersion2

**Location:** `HandCraftedBasicHttpServices/BasicService-ProgrammaticVersion2/`  
**Solution:** `ProgBasicService.sln`

#### Description

Extends the Programmatic variant with a `ServiceRetryWrapper` helper on the client that
retries failed service calls up to five times before giving up. The service uses
`[ServiceBehavior(InstanceContextMode=InstanceContextMode.PerCall)]` explicitly, illustrating
how activation policy is declared. A brief comment in `Service.cs` explains the three
standard WCF instance context modes.

#### Sample Output

**Client:**
```
Starting Programmatic Basic Service Client
============================================

Message recieved from Service: new message from Service
```

**Service:**
```
Starting Programmatic Basic Service (Version 2)
=================================================

Started BasicService at http://localhost:8080/BasicService
Press Ctrl+C to exit

Service received message This is a test message from client
```

---

## HandCraftedWsHttpServices

**Location:** `HandCraftedWsHttpServices/`

Two variants of a simple WCF service using `WSHttpBinding(SecurityMode.None)` instead of
`BasicHttpBinding`. The same `sendMessage` / `getMessage` contract is used, and the same
4-project structure applies (`IService`, `Service`, `ServiceHost`, `ServiceClient`). Service-side
projects use CoreWCF attributes; `ServiceClient` maintains its own copy of the interface with
`System.ServiceModel` attributes to avoid the CoreWCF / System.ServiceModel namespace conflict.

Directory names contain spaces (`BasicService - Declarative`, `BasicService - Programmatic`).
Both variants host on port **8080**.

---

### BasicService - Declarative

**Location:** `HandCraftedWsHttpServices/BasicService - Declarative/`  
**Solution:** `DeclBasicService.sln`

#### Description

Originally configured via `app.config`. Migrated to CoreWCF programmatic hosting on the service
side. The client uses a `proxy` class derived from `ClientBase<IBasicService>` initialized with
binding and address directly in code, demonstrating two independent proxy instances making calls
to the service.

#### Sample Output

**Client:**
```
Starting Declarative WsHttp BasicService Client
=================================================

using first proxy
-------------------
Message received from Service: a new message from Service

using second proxy
--------------------
Message received from Service: a new message from Service
```

**Service:**
```
Starting Declarative WsHttp BasicService
==========================================

Started BasicService at http://localhost:8080/BasicService
Press Ctrl+C to exit

Service received message This is a test message from first client
Service received message This is a test message from second client
```

---

### BasicService - Programmatic

**Location:** `HandCraftedWsHttpServices/BasicService - Programmatic/`  
**Solution:** `ProgBasicService.sln`

#### Description

Service and client are both configured entirely in code using `WSHttpBinding(SecurityMode.None)`.
The client creates a channel via `ChannelFactory<IBasicService>`, sends a single message, and
receives a reply. Includes retry logic to tolerate a slow-starting server.

#### Sample Output

**Client:**
```
Starting Programmatic Basic Service Client
============================================

Message recieved from Service: new message from Service
```

**Service:**
```
Starting Programmatic WsHttp Basic Service
============================================

Started BasicService at http://localhost:8080/BasicService
Press Ctrl+C to exit

Service received message This is a test message from client
```

---

## Peer-Comm-SelfHosted

**Location:** `Peer-Comm-SelfHosted/`  
**Solution:** `Peer-Comm-SelfHosted.sln`

### Description

A WPF peer-to-peer communicator where each instance acts as both a service host (listener) and
a client (sender) simultaneously. Each peer hosts a `BasicHttpBinding` WCF service on a
user-chosen local port and connects to another peer's service on a user-chosen remote port.
Messages posted to a peer are queued in a `BlockingQueue<string>` and displayed in the UI.

**Projects:**
- `Communication/` — class library providing `Receiver` (CoreWCF self-host) and `Sender`
  (`System.ServiceModel.Http` channel factory); also includes `BlockingQueue<T>` from the
  `CS-BlockingQueue/` sub-project
- `Peer-Comm/` — WPF executable; each running instance is a peer node
- `CS-BlockingQueue/` — standalone library containing `SWTools.BlockingQueue<T>`

**Architecture note:** The `Receiver` class is both the CoreWCF service implementation and
the host. It registers itself as a DI singleton so CoreWCF uses the same instance for all
incoming calls, sharing the static receive queue. The `Sender` uses a separate
`ICommunicatorClient` interface decorated with `System.ServiceModel` attributes to avoid
the CoreWCF / System.ServiceModel namespace conflict.

### Usage

Run two or more instances of the WPF app:
```
dotnet run --project Peer-Comm/Peer-Comm.csproj
```

In each window:
1. Set the local port and click **Listen** to start the service host
2. Set the remote address and remote port, then click **Connect** to create a send channel
3. Type a message and click **Send Message** — it appears in the other peer's Received Messages list

### Sample Output

Two peer windows open simultaneously. After Peer A listens on port 4000 and Peer B listens on
port 4001, each connects to the other and exchanges messages:

**Peer A (sent / received):**
```
Sent Messages          | Received Messages
-----------------------+-----------------------
Hello from A           | Hello from B
```

**Peer B (sent / received):**
```
Sent Messages          | Received Messages
-----------------------+-----------------------
Hello from B           | Hello from A
```

---

## SelfHosted_StringsService

**Location:** `SelfHosted_StringsService/`  
**Solution:** `SelfHostedStrings.sln`

### Description

Demonstrates `WSHttpBinding` with a service contract that uses normal, `ref`, and `out` string
parameters. The service is a single shared instance (`InstanceContextMode.Single`) so state
stored by `putString` is visible to the subsequent `getString` call from the same client.

**Projects:**
- `service/` — CoreWCF service host (`WSHttpBinding(SecurityMode.None)`, port 8080)
- `client/` — `System.ServiceModel.Http` channel factory client

### Sample Output

**Client:**
```
Client of SelfHosted Strings service
======================================

sending:  "a not very important message"
received: "a not very important message"
sending "a modifiable string"
string modified to: "ref string"
received out parameter: "out string"
```

**Service:**
```
SelfHosted Strings Service started
====================================

Listening at http://localhost:8080/Strings
Press Ctrl+C to terminate service

received, in putString, "a not very important message"
sending, from getString, "a not very important message"
received, in putRefString, "a modifiable string"
modified string to "ref string"
sending, from getOutString, "out string"
```

---

## WCF_MessagePassingComm

**Location:** `WCF_MessagePassingComm/`  
**Solution:** `WCF_CommPrototype.sln`

### Description

Demonstrates a single CoreWCF service that simultaneously accepts connections from multiple
clients over two different HTTP bindings — `BasicHttpBinding` on port 4030 and
`WSHttpBinding(SecurityMode.None)` on port 4040. Kestrel is configured to listen on both ports.
Incoming `Message` objects (carrying a `Command` enum and a text string) are queued in a
`BlockingQueue<Message>` and processed by a background thread on the server.

The original also hosted a `NetTcpBinding` endpoint, but `NetTcpBinding` is not available in
the `System.ServiceModel.Http` client package for .NET 5+. That endpoint was dropped; Client1
(originally the NetTcp client) was converted to `BasicHttpBinding` to demonstrate that multiple
concurrent clients can share the same endpoint.

**Projects:**
- `WCF_CommPrototype/` — CoreWCF service host; two endpoints, background message-processing thread
- `Client0/` — `BasicHttpBinding` client (port 4030), sends 10 `DoThat` messages
- `Client1/` — `BasicHttpBinding` client (port 4030), sends 10 `DoAnother` messages (concurrent with Client0)
- `Client2/` — `WSHttpBinding` client (port 4040), sends 10 `DoThis` messages

### Sample Output

**Service (interleaved messages from all three clients):**
```
Communication Server Starting up
==================================

CommService ready:
  BasicHttp at http://localhost:4030/ICommService/BasicHttp
  WSHttp    at http://localhost:4040/ICommService/WSHttp

  received: DoAnother  Client1 message #0
  received: DoThis     WSHttp message #0
  received: DoAnother  Client1 message #1
  received: DoThis     WSHttp message #1
  received: DoThat     BasicHttp message #0
  received: DoAnother  Client1 message #2
  ...
```

**Client0 (BasicHttp):**
```
BasicHttpClient Starting to Post Messages to Service
======================================================

connecting to "http://localhost:4030/ICommService/BasicHttp"

  sending: BasicHttp message #0
  sending: BasicHttp message #1
  ...
  sending: BasicHttp message #9
```

**Client2 (WSHttp):**
```
WSHttpClient Starting to Post Messages to Service
===================================================

connecting to "http://localhost:4040/ICommService/WSHttp"

  sending: WSHttp message #0
  sending: WSHttp message #1
  ...
  sending: WSHttp message #9
```

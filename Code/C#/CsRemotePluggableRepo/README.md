# CsRemotePluggableRepo

https://JimFawcett.github.io/CsRemotePluggableRepo.html

Implements a code repository with pluggable policies for checkin, ownership, checkout, versioning, browsing, and storage. A WPF client (PluggableRepoClient) manages a local repository instance and communicates with a shared remote server (RepoServer) via a WCF-style message-passing channel built on CoreWCF.

## Solution: PluggableRepo.sln

Targets **.NET 10.0** (Windows). Build with:

```
dotnet build PluggableRepo.sln
```

Clean with:

```
dotnet clean PluggableRepo.sln
```

## Projects

| Project | Output | Description |
|---|---|---|
| `IPluggableComponent` | Library | Shared interfaces (`ICheckin`, `ICheckout`, `IStorage`, `IVersion`, `IOwnership`, `IMetaData`) and environment structs (`RepoEnvironment`, `ClientEnvironment`, `CommEnvironment`) |
| `TestUtilities` | Library | Helpers for testing: `checkResult`, `handleInvoke`, `title`, `putLine` |
| `VersionComponent` | Library | Pluggable versioning — adds/removes version suffixes on file names |
| `MetaData` | Library | Builds, saves, and loads XML metadata files describing repository packages |
| `StorageComponent` | Library | Manages local file storage, staging area, and dependency cache |
| `Relationships` | Library | `Dependency` (parent/child graph) and `VersionChain` collections |
| `Checkin` | Library | Pluggable checkin policy — stages files and writes metadata |
| `Checkout` | Library | Pluggable checkout policy — retrieves files with all dependencies |
| `Browse` | Library | Stub browse component (placeholder for future remote browsing) |
| `OwnershipComponent` | Library | Open ownership policy (placeholder for authentication) |
| `FileNameEditor` | Library | Helpers for constructing and decomposing versioned file names |
| `FileSynchronizer` | Library | Compares a directory against a file list to find sync differences |
| `PluggableCommService` | Library | Message-passing channel: `Comm`, `Sender`, `Receiver`, `MessageDispatcher`, `CommMessage`. Server hosted via CoreWCF/BasicHttpBinding; client via `System.ServiceModel.Http` |
| `PluggableRepo` | Exe | Local repository — loads pluggable components at runtime via reflection from `ComponentLibraries/` |
| `RepoServer` | Exe | Shared remote repository server — listens on `http://localhost:8080/IPluggableComm` |
| `PluggableRepoClient` | WinExe (WPF) | GUI client — manages local repo and syncs with RepoServer |

## Running

Start **RepoServer** first, then **PluggableRepoClient**:

```
dotnet run --project RepoServer/RepoServer.csproj
dotnet run --project PluggableRepoClient/PluggableRepoClient.csproj
```

RepoServer listens on `http://localhost:8080`. The client connects using the machine name and port shown in its GUI.

## Architecture Notes

- **Pluggable policies** — `PluggableRepo` uses reflection to load component DLLs from `ComponentLibraries/` at startup. Each component implements an interface from `IPluggableComponent` and is bound into `RepoEnvironment` so all packages share the active policy instance.
- **Communication** — `PluggableCommService` uses CoreWCF (server) with `BasicHttpBinding` over HTTP and `System.ServiceModel.Http` (client) with `ChannelFactory<IPluggableComm>`. Messages are `CommMessage` objects dispatched by `MessageDispatcher`.
- **Storage layout** — `Storage/` holds versioned packages by category; `StagingStorage/` is the staging area for checkin/checkout; `ServerStorage/` is the RepoServer's shared store.

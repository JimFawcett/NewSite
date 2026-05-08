# Docker Notes

---

## 2026-04-30

**Prompt:** summarize docker-like container technology including first time use

**Response:**

## Docker-Like Container Technology

### What It Is

A container packages an application together with everything it needs to run — runtime, libraries, config, and OS-level dependencies — into a single portable unit. Containers share the host OS kernel but are isolated from each other and the host via Linux namespaces and cgroups. This makes them far lighter than virtual machines, which each carry a full OS.

**Key tools:** Docker (most common), Podman (daemonless, rootless alternative), containerd (lower-level runtime used by Kubernetes).

### Core Concepts

- **Image** — a read-only snapshot of a filesystem built from a `Dockerfile`. Layered, so unchanged layers are cached and reused.
- **Container** — a running instance of an image. Ephemeral by default; state is lost when it stops unless you use volumes.
- **Dockerfile** — a script of instructions (`FROM`, `RUN`, `COPY`, `CMD`) that builds an image step by step.
- **Volume** — a mount that persists data outside the container lifecycle.
- **Docker Compose** — a YAML file (`compose.yaml`) that defines and starts multi-container setups (app + database + cache) with one command.
- **Registry** — a store for images; Docker Hub is the public default, but you can run private registries.

### First-Time Use — Minimal Path

1. **Install** — Download Docker Desktop (Mac/Windows) or `docker engine` (Linux). Verify with `docker --version`.
2. **Pull and run a pre-built image:**
   ```bash
   docker run hello-world          # confirms install works
   docker run -it ubuntu bash      # interactive Ubuntu shell
   ```
3. **Write a Dockerfile** for your own app:
   ```dockerfile
   FROM python:3.12-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD ["python", "main.py"]
   ```
4. **Build and run it:**
   ```bash
   docker build -t myapp .
   docker run myapp
   ```
5. **Add services with Compose** (`compose.yaml`):
   ```yaml
   services:
     app:
       build: .
       ports: ["8000:8000"]
     db:
       image: postgres:16
       environment:
         POSTGRES_PASSWORD: secret
   ```
   ```bash
   docker compose up
   ```

### Key Mental Model

- Images are blueprints; containers are instances.
- Containers are disposable — design apps to be stateless; push state to volumes or external services.
- Layer caching matters: put infrequently changing steps (`RUN pip install`) before frequently changing ones (`COPY . .`) to keep builds fast.

### Tradeoffs to Know

| Benefit | Gotcha |
|---|---|
| Consistent environments everywhere | Adds a learning curve for networking and volumes |
| Fast startup vs. VMs | Containers share the host kernel — not a security boundary like a VM |
| Easy multi-service local dev | Docker Desktop has licensing requirements for large orgs |
| Images are portable | Image sizes grow large if you don't use slim/alpine base images |

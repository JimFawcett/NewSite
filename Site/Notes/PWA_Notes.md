# Progressive Web App (PWA) Notes

---

## 2026-04-30

**Prompt:** create summary of Progressive Web Apps

**Response:**

## Progressive Web Apps (PWAs)

### What They Are

A Progressive Web App is a web application that uses modern browser APIs to deliver an experience close to a native app — installable, offline-capable, and fast — while remaining a standard website accessible via URL. No app store required.

### Core Technologies

- **Service Worker** — A JavaScript file that runs in the background, separate from the page. Intercepts network requests, manages caching, and enables offline functionality. The foundation of most PWA capabilities.
- **Web App Manifest** (`manifest.json`) — A JSON file declaring the app's name, icons, theme color, start URL, and display mode. Enables installation to the home screen or desktop.
- **HTTPS** — Required for service workers and secure APIs. All PWAs must be served over HTTPS (or localhost for development).
- **Cache API** — Used by service workers to store assets and responses for offline use.
- **IndexedDB** — Client-side structured storage for persisting data across sessions when offline.

### Key Capabilities

| Capability | How It Works |
|---|---|
| Offline support | Service worker caches assets/API responses; serves them when network is unavailable |
| Installability | Manifest + service worker triggers browser install prompt; app gets its own window |
| Push notifications | Web Push API + service worker receives and displays notifications even when app is closed |
| Background sync | Service worker queues actions made offline and replays them when connectivity returns |
| Fast load | Pre-cached shell loads instantly; only dynamic data fetched from network |

### PWA vs Native App vs Standard Website

| | Standard Website | PWA | Native App |
|---|---|---|---|
| Installable | No | Yes | Yes |
| Offline | No | Yes | Yes |
| App store needed | No | No | Yes |
| Access device APIs | Limited | Growing | Full |
| Discoverability | Search engines | Search engines | App stores |
| Update model | Instant | Instant | User must update |

### Typical Architecture

1. **App Shell** — Minimal HTML/CSS/JS cached on first load; renders instantly on repeat visits.
2. **Dynamic Content** — Fetched from a network API; cached progressively or served stale-while-revalidate.
3. **Service Worker Strategies:**
   - *Cache First* — serve from cache, fall back to network (good for static assets)
   - *Network First* — try network, fall back to cache (good for frequently updated data)
   - *Stale-While-Revalidate* — serve cache immediately, update cache in background

### First-Time Setup

1. Serve the app over HTTPS.
2. Create `manifest.json` and link it in `<head>`:
   ```html
   <link rel="manifest" href="/manifest.json">
   ```
3. Register a service worker in your main JS:
   ```js
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.register('/sw.js');
   }
   ```
4. In `sw.js`, handle `install` (cache assets) and `fetch` (serve from cache):
   ```js
   self.addEventListener('install', e => {
     e.waitUntil(caches.open('v1').then(c => c.addAll(['/','./index.html','./app.js'])));
   });
   self.addEventListener('fetch', e => {
     e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
   });
   ```
5. Use Lighthouse (Chrome DevTools) to audit PWA compliance and identify gaps.

### Tooling

- **Workbox** (Google) — Library that simplifies service worker caching strategies; avoids boilerplate.
- **Vite PWA plugin** — Drop-in PWA support for Vite-based projects.
- **Lighthouse** — Audits installability, performance, offline support, and best practices.
- **PWABuilder** (Microsoft) — GUI tool to generate manifests and package PWAs for app stores.

### Tradeoffs

| Benefit | Limitation |
|---|---|
| No app store friction | iOS Safari has historically lagged on PWA feature support |
| Single codebase for all platforms | Push notifications blocked on iOS until recently |
| Instant updates, no versioning drama | Access to some device APIs still lags behind native |
| Indexable and linkable | Users less likely to "install" than download a native app |

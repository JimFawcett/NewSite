# README Generator Agent - Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                                                        │   │
│  │   Enter GitHub URL: https://github.com/owner/repo     │   │
│  │                                                        │   │
│  │              [Generate README Button]                  │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                            ↓                                   │
└────────────────────────────┼───────────────────────────────────┘
                             ↓
                    HTTP POST /generate
                             ↓
┌────────────────────────────┼───────────────────────────────────┐
│                    FLASK WEB SERVER                            │
│                    (readme_agent.py)                           │
│                            ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  1. Extract owner/repo from URL                         │  │
│  │     Input: "https://github.com/facebook/react"          │  │
│  │     Output: owner="facebook", repo="react"              │  │
│  └─────────────────────────────────────────────────────────┘  │
│                            ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  2. Fetch Repository Data                               │  │
│  │     ↓                                                    │  │
│  │     GET https://api.github.com/repos/owner/repo         │  │
│  │     GET https://api.github.com/repos/owner/repo/contents│  │
│  │     GET https://api.github.com/repos/owner/repo/languages│ │
│  └─────────────────────────────────────────────────────────┘  │
│                            ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  3. Repository Data Collected:                          │  │
│  │     - Name, Description                                 │  │
│  │     - Stars, Forks, Language                            │  │
│  │     - Topics, Homepage                                  │  │
│  │     - File Structure                                    │  │
│  │     - Languages Used                                    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                            ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  4. Generate README with Claude AI                      │  │
│  │     ↓                                                    │  │
│  │     POST https://api.anthropic.com/v1/messages          │  │
│  │     Model: claude-sonnet-4-20250514                     │  │
│  │     Prompt: Repository analysis + generation rules      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                            ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  5. Return JSON Response:                               │  │
│  │     {                                                    │  │
│  │       "success": true,                                  │  │
│  │       "readme": "# Project Name\n\n...",                │  │
│  │       "repo_data": {                                    │  │
│  │         "name": "react",                                │  │
│  │         "language": "JavaScript",                       │  │
│  │         "stars": 230000,                                │  │
│  │         "forks": 47000                                  │  │
│  │       }                                                  │  │
│  │     }                                                    │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────┼───────────────────────────────────┘
                             ↓
                    Response to Browser
                             ↓
┌────────────────────────────┼───────────────────────────────────┐
│                      USER BROWSER                              │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  README Generated Successfully! ✓                      │   │
│  │                                                        │   │
│  │  Repository: react                                     │   │
│  │  Language: JavaScript                                  │   │
│  │  Stars: ⭐ 230000                                       │   │
│  │  Forks: 🍴 47000                                        │   │
│  │                                                        │   │
│  │           [Download README.md Button]                  │   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │  Preview:                                        │ │   │
│  │  │                                                  │ │   │
│  │  │  # React                                         │ │   │
│  │  │                                                  │ │   │
│  │  │  A JavaScript library for building user          │ │   │
│  │  │  interfaces...                                   │ │   │
│  │  │                                                  │ │   │
│  │  │  ## Features                                     │ │   │
│  │  │  - Declarative...                                │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  └────────────────────────────────────────────────────────┘   │
│                            ↓                                   │
│                   User clicks Download                         │
│                            ↓                                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  POST /download                                        │   │
│  │  { "content": "# React\n\n..." }                       │   │
│  └────────────────────────────────────────────────────────┘   │
│                            ↓                                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  File Download Triggered                               │   │
│  │  README.md saved to Downloads folder                   │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Frontend (templates/index.html)
- **Technology**: HTML5, CSS3, Vanilla JavaScript
- **Responsibilities**:
  - User input collection
  - HTTP requests to Flask backend
  - Display results and preview
  - Handle file downloads
  - Error handling and status updates

### 2. Backend (readme_agent.py)
- **Technology**: Python 3, Flask
- **Responsibilities**:
  - Serve web interface
  - Parse GitHub URLs
  - Fetch data from GitHub API
  - Call Claude AI for README generation
  - Format responses
  - Serve file downloads

### 3. External APIs

#### GitHub API
- **Endpoints Used**:
  - `/repos/{owner}/{repo}` - Repository metadata
  - `/repos/{owner}/{repo}/contents` - File structure
  - `/repos/{owner}/{repo}/languages` - Programming languages
- **Rate Limit**: 60 requests/hour (unauthenticated)

#### Anthropic Claude API
- **Endpoint**: `/v1/messages`
- **Model**: claude-sonnet-4-20250514
- **Purpose**: Generate README content from structured data

## Data Flow

### Request Flow
```
User Input → Flask → GitHub API → Data Collection
                                        ↓
User Input → Flask → Claude API → README Generation
                                        ↓
                  Browser ← Response ← Flask
```

### Download Flow
```
User Click → JavaScript → POST /download → Flask
                                              ↓
                                        Create File
                                              ↓
                          Browser ← File Download ← Flask
```

## Security Considerations

1. **API Keys**: Stored as environment variables (not in code)
2. **Public Repos Only**: No authentication means only public data
3. **Rate Limiting**: GitHub API limits apply
4. **No Data Storage**: All processing is real-time, nothing stored
5. **CORS**: Handled by Flask for same-origin requests

## Scalability Notes

### Current Limitations
- Single-threaded Flask (dev server)
- No caching
- Synchronous API calls
- No request queuing

### Production Improvements
- Use production WSGI server (Gunicorn, uWSGI)
- Add Redis caching for repo data
- Implement async processing
- Add request queue (Celery)
- Rate limiting per IP
- Database for usage analytics

## Error Handling

```
┌─────────────────────────────┐
│  Error Type                 │  Handling Strategy
├─────────────────────────────┼───────────────────────────────────
│  Invalid URL                │  Frontend validation + error message
│  Repository not found       │  GitHub API error → User notification
│  Private repository         │  GitHub API 404 → User notification
│  Rate limit exceeded        │  GitHub API 429 → User notification
│  Claude API error           │  Retry logic + user notification
│  Network timeout            │  Timeout handling + user notification
└─────────────────────────────┴───────────────────────────────────
```

## Performance Metrics

**Average Request Times**:
- GitHub API calls: 500-1000ms
- Claude API call: 5-10 seconds
- Total generation time: 6-12 seconds

**Bottlenecks**:
1. Claude API response time (largest)
2. Multiple GitHub API calls
3. Network latency

**Optimization Opportunities**:
- Cache GitHub API responses (5-10 minutes)
- Parallel GitHub API requests
- Stream Claude responses
- Add loading progress indicators

---

This architecture provides a simple, maintainable system that's easy to deploy
and extend. Perfect for a single-user tool or small team usage!

# Overseerr Plex Connection Documentation

**Source:** [sct/overseerr](https://github.com/sct/overseerr) | Archived Feb 2026 | 5K stars

---

## Overview

Overseerr connects to a local Plex Media Server to enable user authentication, library scanning, and media availability tracking. The connection uses the Plex HTTP API via the **plex-api** npm package (NodePlexAPI).

---

## Authentication Mechanism

Overseerr uses **Plex OAuth / token-based authentication**:

1. **User Login via Plex.tv OAuth** - Users authenticate through Plex.tv OAuth flow, receiving an auth token stored in their user profile
2. **Server Connection** - The Plex token is used to authenticate API calls to the local Plex server
3. **Custom Authenticator** - Overseerr implements a custom authenticate() callback that passes the stored Plex token on each request:

```ts
authenticator: {
  authenticate: (_plexApi, cb) => {
    if (!plexToken) return cb('Plex Token not found!');
    cb(undefined, plexToken);
  }
}
```

4. **Token Refresh** - Added in v1.34.0: automatic token refresh schedule via MyPlex ping to prevent token expiration

---

## Key Configuration Options

| Setting | Description |
|---------|-------------|
| hostname / ip | Local IP or hostname of Plex server |
| port | Plex port (default: 32400; use 443 for cloud) |
| useSsl | Enable HTTPS (self-signed certs NOT supported) |
| machineId | Plex server machine identifier (auto-populated) |
| plexToken | Authentication token (from Plex.tv OAuth) |
| clientId | Unique Overseerr client identifier |

---

## Libraries Used

| Library | Purpose |
|---------|---------|
| plex-api (npm) | Main HTTP client for Plex Media Server API |
| xml2js | Parse XML responses from Plex server |
| axios | HTTP client for Plex.tv API calls |

---

## API Endpoints Used

### Local Plex Server (via plex-api)
| Endpoint | Purpose |
|----------|---------|
| GET / | Server status check |
| GET /library/sections | List Plex libraries |
| GET /library/sections/{id}/all | Get library contents (with GUIDs) |
| GET /library/metadata/{key} | Get media metadata |
| GET /library/metadata/{key}/children | Get children (seasons/episodes) |
| GET /library/recentlyAdded | Recently added items |

### Plex.tv API (via PlexTvAPI)
| Endpoint | Purpose |
|----------|---------|
| GET /api/resources?includeHttps=1 | Discover available servers |
| GET /users/account.json | Get authenticated user info |
| GET /api/users | Get shared Plex account users |

---

## Connection Flow

1. Admin authenticates via Plex.tv OAuth - gets auth token
2. Admin configures Plex server (IP:port or auto-detect via plex.tv)
3. POST /api/v1/settings/plex - validates connection, saves machineId
4. Overseerr stores settings (plexToken, machineId, ip, port, useSsl)
5. Periodic library sync via GET /library/sections calls
6. Token refresh via scheduled MyPlex ping (v1.34.0+)

---

## Key Files

| File | Role |
|------|------|
| server/api/plexapi.ts | PlexAPI wrapper for local server |
| server/api/plextv.ts | Plex.tv API client (server discovery) |
| server/routes/settings/index.ts | Settings API (plex endpoints) |
| server/routes/auth.ts | Plex OAuth login flow |

---

## Setup Methods

1. **Manual** - Enter hostname, port, SSL settings directly
2. **Auto-discovery** - Query plex.tv /api/resources to list owned servers, then test each connection endpoint

---

## Limitations

- Self-signed SSL certificates are NOT supported
- Local sign-in can be disabled, making Plex OAuth the only login option
- Plex token expiration requires periodic re-authentication (mitigated by v1.34.0+ ping schedule)

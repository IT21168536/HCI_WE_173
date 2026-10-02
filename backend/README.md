# Backend

This MVP does not use a separate backend server.

Current data and business logic live in the Expo mobile app:

```text
frontend/src/core/database/
frontend/src/core/repositories/
frontend/src/core/auth/
```

The app uses local SQLite through Expo SQLite. Add future cloud/API backend code in this folder when the project moves beyond the local-first MVP.

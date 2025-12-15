Probeaufgabe Anacision

Dieses Projekt ist jetzt als npm-Workspaces-Monorepo organisiert und kann Frontend und Backend parallel beherbergen.

- [packages/frontend](packages/frontend): React + Vite App
- [packages/backend](packages/backend): Platzhalter für kommende Server-Implementierung

## Schnellstart

```bash
npm install          # installiert Abhängigkeiten aller Workspaces
npm run dev          # startet das Frontend (Workspace: frontend)
npm run build        # baut das Frontend
npm run lint         # lintet das Frontend
npm run preview      # Vorschau des gebauten Frontends
```

## Backend hinzufügen

Lege deinen Server-Code unter [packages/backend](packages/backend) ab. Falls du Node nutzt, erstelle dort ein eigenes [packages/backend/package.json](packages/backend/package.json) und ergänze die Root-Workspaces falls nötig.

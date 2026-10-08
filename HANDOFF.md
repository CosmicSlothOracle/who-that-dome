# Who That Dome — Projektstatus / Handoff

Stand: 2026-10-08. Für den nächsten Claude-Session-Einstieg gedacht — enthält keine Secrets.

## Was die App ist
Hitster-artiges Musik-Gesellschaftsspiel (Next.js). QR-Karte scannen → Song über Spotify
abspielen → Interpret/Titel/Album/Jahr/Stadt in der Web-UI raten und Punkte vergeben.
Zwei Playback-Modi: `connect` (App steuert Spotify per Web-API, privat) und `deeplink`
(öffnet Spotify-App, öffentlich nutzbar). Aktueller Fokus: Deutschrap-Edition (90er/00er/10er).

Details zu Spielablauf/Architektur: siehe `README.md`, `AGENTS.md`, `docs/punkteblatt.md`.

## Aufgabenteilung (vom User festgelegt)
- **User**: Kartendesign, Playlist-Kuration, alles was Browser-/Dashboard-Klicks oder
  Accounts erfordert, auf die Claude keinen Zugriff hat (Spotify Dashboard, Render Dashboard, GitHub-Login).
- **Claude**: Code, Config, Infrastruktur-Setup, Debugging.

## In dieser Session erledigt
1. Projekt exploriert, Stand bewertet, Roadmap vorgeschlagen.
2. `.env.local` lokal angelegt (Spotify Client ID/Secret, `SPOTIFY_REDIRECT_URI` auf
   `http://127.0.0.1:3000/api/auth/callback` — **wichtig: lokal immer über `127.0.0.1`
   testen, nicht `localhost`**, weil Spotify `localhost` nicht mehr als sichere
   Redirect-URI akzeptiert, nur die literale Loopback-IP).
3. Bug gefixt: `next.config.ts` brauchte `allowedDevOrigins: ["127.0.0.1"]`, sonst blockt
   Next.js im Dev-Modus die eigenen JS/HMR-Ressourcen für Cross-Origin-Zugriffe und die
   Seite hängt endlos bei "Lade Spiel…".
4. Bug gefixt: `src/lib/game-state.ts` / `src/lib/use-game.ts` — `loadGame()` gab bei
   jedem Aufruf ein frisch geparstes Objekt zurück, was `useSyncExternalStore` in eine
   Endlosschleife trieb ("getSnapshot should be cached"). Fix: Cache anhand des rohen
   localStorage-Strings.
5. Erster echter Git-Commit (vorher war nur das Create-Next-App-Scaffold committed,
   der ganze Rest — Spielsystem, Auth, Karten-Pipeline — lag uncommitted).
6. GitHub-Repo erstellt (öffentlich) und gepusht: **https://github.com/CosmicSlothOracle/who-that-dome**
   Account: `CosmicSlothOracle`. `gh` CLI wurde ohne root nach `~/.local/bin/gh`
   installiert (kein `sudo`-Zugriff verfügbar), Login via `gh auth login --web`.
   Hinweis: der Sandbox-Classifier blockt `git push`/`gh repo create --push` als
   potenzielle Datenexfiltration — Repo-Erstellung geht automatisiert, der eigentliche
   `git push` muss der User manuell ausführen.
7. Render-Deployment via Blueprint (`render.yaml`) aufgesetzt: **https://who-that-dome.onrender.com**
   (Free-Plan). Env-Vars `SPOTIFY_CLIENT_ID`/`SECRET`/`NEXT_PUBLIC_APP_URL`/
   `SPOTIFY_REDIRECT_URI` im Render-Dashboard manuell gesetzt (dort einsehbar, nicht hier dokumentiert).
8. Spotify Dashboard: zwei Redirect-URIs eingetragen —
   `http://127.0.0.1:3000/api/auth/callback` (lokal) und
   `https://who-that-dome.onrender.com/api/auth/callback` (Render).
9. Bug gefixt (Commit `46acf9b`, bereits gepusht + deployed): `src/app/api/auth/callback/route.ts`
   und `src/app/api/auth/logout/route.ts` bauten die Redirect-Ziel-URL aus `request.url`.
   Auf Render löste das zur internen Bind-Adresse `0.0.0.0:10000` statt der öffentlichen
   Domain auf (`next start --hostname 0.0.0.0 --port $PORT` in `package.json`) — der
   Browser landete nach Spotify-Login auf einer nicht erreichbaren Adresse. Fix: `getAppUrl()`
   (liest `NEXT_PUBLIC_APP_URL`) als Redirect-Basis statt `request.url`.

## Gelöst (2026-10-08): „Mit Spotify verbinden" blieb nach dem Login
Ursache: Spotify lehnte `GET /me` mit 403 ab, weil der eingeloggte Account nicht im
Spotify Dashboard unter *User Management* der Dev-Mode-App eingetragen war (max. 5 Nutzer).
Behebung ohne Codeänderung: Account dort eintragen. Wichtig für Mitspieler: jeder, der sich
verbinden soll, muss eingetragen sein (App-Owner braucht Premium).
Code-Änderung: `/api/auth/me` liefert bei Ablehnung jetzt `reason`, `spotifyStatus`,
`spotifyMessage` (noch nicht committet). UI zeigt bei `spotify_rejected` weiterhin nur den
Button — Meldung wäre ein sinnvoller nächster Schritt.
Hinweis: `reason=state` nach dem Login heißt, dass die PKCE-Cookies abgelaufen sind (10 Min.).

## Umgebungen
- **Lokal**: `npm run dev`, erreichbar unter `http://127.0.0.1:3000` (nicht `localhost`).
- **Render**: https://who-that-dome.onrender.com (Free-Plan, Blueprint `render.yaml`,
  Auto-Deploy bei Push auf `main`).
- `.env.local` liegt lokal vor (gitignored), Produktionswerte stehen im Render-Dashboard
  unter Environment — bewusst nicht in diesem Dokument wiederholt (Repo ist öffentlich).

## Noch ausstehend (aus ursprünglicher Roadmap, unabhängig vom offenen Bug)
- Deutschrap-Playlists real importieren — `src/data/drap-live.json` enthält aktuell nur
  Stub-Daten mit Fake-Track-IDs (`npm run import-drap` ohne Credentials geschrieben).
- User wollte eine eigene Testplaylist (~10 Songs) zum Reinspielen zusammenstellen —
  Link steht noch aus. Befehl dafür: `npm run import-playlist -- "<link>" --pool test --name "Testrunde"`
  (Playlist muss öffentlich sein, schreibt nach `src/data/songs.json`).
- Feld „Stadt/Homebase" wird beim Import nie befüllt (`city: ""`) — nach Import manuell ergänzen.
- Kartendesign (Vorder-/Rückseite PNG, 750×1050px) fehlt komplett — bisher nur
  Platzhalter-Anleitung in `assets/cards/incoming/LESEN.txt`.
- QR-Pack (`npm run export-qr-pack`) vor dem physischen Druck mit der finalen
  HTTPS-Domain neu erzeugen (aktuell nur für `drap`-Pools, nicht für generische/Test-Pools).
- Keine Tests vorhanden.

## Nützlich zu wissen
- `src/data/songs.json` enthält einen unabhängig vom Deutschrap-Content bereits
  funktionierenden generischen Pool (2000er/2010er/2020er Hits, echte Spotify-Track-IDs) —
  gut zum Testen der Technik, ohne auf Playlist-Kuration zu warten.
- Der QR-Scanner (`src/components/QrScanner.tsx`) hat ein manuelles ID-Eingabefeld —
  für App-Tests sind keine gedruckten/gescannten echten QR-Codes nötig.
- Kein `gh`/keine SSH-Keys/Credentials waren initial auf dieser Maschine eingerichtet;
  `gh` liegt jetzt unter `~/.local/bin/gh`, Auth-Status via `gh auth status`.

# Who That Dome — Projektstatus / Handoff

Stand: 2026-10-08. Für den nächsten Claude-Session-Einstieg gedacht — enthält keine Secrets.

## Was die App ist
Musik-Quiz für den Tisch (Next.js, PWA). Playlist wählen → 2–6 Spieler → 10 zufällige Songs über
Spotify Connect. Pro Spieler ein Tap-Pad am Tischrand, wer zuerst tippt nennt den Interpreten
(Freitext, Abgleich in `src/lib/answer-match.ts`). Regeln: Engine `src/lib/game-engine.ts`, Seite `/regeln`.
Die Optik (Gerät, Farben, Font) kommt aus `pool.theme` (`src/lib/themes.ts`, `components/game/Devices.tsx`).
Die QR-Karten (`/cards`, `/c/<id>`) sind nur noch ein Nebenpfad ohne Spielanbindung; `docs/punkteblatt.md` ist veraltet.
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

## Umgebungen
- **Lokal**: `npm run dev`, erreichbar unter `http://127.0.0.1:3000` (nicht `localhost`).
- **Render**: https://who-that-dome.onrender.com (Free-Plan, Blueprint `render.yaml`,
  Auto-Deploy bei Push auf `main`).
- `.env.local` liegt lokal vor (gitignored), Produktionswerte stehen im Render-Dashboard
  unter Environment — bewusst nicht in diesem Dokument wiederholt (Repo ist öffentlich).

## Noch ausstehend (aus ursprünglicher Roadmap)
- Umbau (2026-10-08) ist lokal getestet (Vitest: `npm test`, Browser-Durchlauf mit allen 5 Themes), aber nicht auf echten Handys/Tablets. Offen: Fullscreen/Wake-Lock/Vibration auf Android, PWA-Installation, Tippen auf dem Gerät in der Tischmitte (Bildschirmtastatur dreht sich nicht mit).
- Neue Playlist = `--theme speaker-yellow|reel-beige|turntable-orange|cassette-pixel|dictaphone-red --era … --genre …` beim Import. Pools mit „stub“-Track-IDs (alte drap-Seeds) werden auf der Landing ausgeblendet.
- Deutschrap-Playlists real importieren — `src/data/drap-live.json` enthält aktuell nur
  Stub-Daten mit Fake-Track-IDs (`npm run import-drap` ohne Credentials geschrieben).
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
- Spotify-App im Dev Mode: nur im Dashboard (*User Management*, max. 5) eingetragene Accounts
  können sich verbinden, sonst 403 auf `/me`. `/api/auth/me` nennt den Grund (`reason`).
- Playlist-Import braucht seit 2026 einen Nutzer-Login: im eingeloggten Browser
  `/api/dev/playlist?id=<id>` aufrufen (schreibt `.cache/`), dann
  `npm run import-playlist -- x --pool <pool> --name "<Name>" --from-file .cache/playlist-<id>.json`.
  Pool `test` („Testrunde“, 14 Songs, IDs `test-001`…`test-014`) ist bereits importiert.

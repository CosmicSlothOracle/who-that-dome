# Who That Dome

Musik-Gesellschaftsspiel im Stil von Hitster: QR-Karten scannen, Song über **Spotify Premium** starten, Interpret / Titel / Album / Jahr in einer eigenen Web-UI aufdecken.

## Hybrid-Architektur

| Modus | Env | Verhalten | Wann |
| --- | --- | --- | --- |
| `connect` | `NEXT_PUBLIC_PLAYBACK_MODE=connect` | Web-App steuert die Spotify-App per Web API | Privat, Development Mode, max. 25 Nutzer |
| `deeplink` | `NEXT_PUBLIC_PLAYBACK_MODE=deeplink` | Play-Button öffnet Spotify (App/Web) | Spätere Veröffentlichung ohne API-Spiel |

QR-Codes enthalten immer nur eine **Karten-ID** (`/c/2000er-001`), nie eine Spotify-URI. Gedruckte Karten bleiben beim Moduswechsel gültig.

**Policy:** Spotify verbietet Spiele/Quizze mit API-Nutzung. `connect` ist für private Abende gedacht. Für eine öffentliche Version auf `deeplink` umschalten und Song-Daten nicht über die Spotify-API nachladen.

## Lokal starten

1. Spotify-App im [Developer Dashboard](https://developer.spotify.com/dashboard) anlegen (Web API, Development Mode).
2. Redirect URI eintragen: `http://localhost:3000/api/auth/callback`
3. Eigenen Account unter *User Management* freischalten.
4. `.env.local` anlegen:

```bash
cp .env.example .env.local
```

5. `SPOTIFY_CLIENT_ID` und `SPOTIFY_CLIENT_SECRET` eintragen.
6. App starten:

```bash
npm install
npm run dev
```

Handy und Laptop müssen Spotify offen haben, wenn der Connect-Modus fernsteuern soll. Bluetooth-Lautsprecher hängen dann an der Spotify-App, nicht an der Web-UI.

## Deutschrap-Edition (Dev)

72 Stub-Karten (`drap_90_001` … `drap_10_024`), Playlists noch nicht eingefroren.

```bash
npm run import-drap          # Stubs oder Editorial-Playlists → src/data/drap-live.json
npm run export-qr-pack       # SVG+PNG+CSV nach handoff/drap/v001/
```

Regeln: `/regeln` und [docs/punkteblatt.md](docs/punkteblatt.md).  
QR-Übergabe: [handoff/drap/v001/](handoff/drap/v001/). Druck-QR erst nach stabiler HTTPS-URL neu bauen.

Punkte: Interpret 3 (Pflicht), Titel 2, Vers 2, Album 1, Jahr 1 (+1 exakt), Stadt 1.

## Spielablauf

1. `/play` — Dekade/Pool und Spielernamen festlegen.
2. Erste Stimme wählen, Karte scannen.
3. Song abspielen. Interpret zuerst, dann Steal auf offene Kategorien.
4. Nächste Karte. Ziel: 21 Punkte oder Stapel leer.

## Eigene Pools importieren

Öffentliche Playlist-URL + Client Credentials:

```bash
npm run import-playlist -- "https://open.spotify.com/playlist/..." --pool 90er --name "90er Hits"
```

`--replace` leert den Pool vorher. Danach Karten neu drucken.

## Karten anlegen (feste PNG-Größe)

Jede Karte ist **750 × 1050 Pixel** (Pokerformat 63,5 × 88,9 mm bei 300 dpi). Du zeichnest Vorder- und Rückseite selbst und legst sie so ab:

`assets/cards/incoming/drap_90_001_front.png`
`assets/cards/incoming/drap_90_001_back.png`

Auf der Rückseite die Mitte frei lassen. Ein Lauf von `npm run compose-cards` setzt den QR der Karten-ID genau dort ein und schreibt die druckfertigen PNGs nach `handoff/drap/v001/print/cards/`. Vorlagen und ein Beispiel mit QR liegen unter `assets/cards/templates/` bzw. `print/cards/beispiel_drap_90_001_back.png`.

## Deployment auf Render

HTTPS ist Pflicht (Kamera + OAuth).

1. Repo zu GitHub/GitLab/Bitbucket pushen.
2. Blueprint anwenden: `render.yaml` im Repo-Root.
3. Secrets im Dashboard setzen:
   - `NEXT_PUBLIC_APP_URL` = `https://<service>.onrender.com`
   - `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REDIRECT_URI` = `https://<service>.onrender.com/api/auth/callback`
4. Dieselbe Redirect URI im Spotify Dashboard eintragen.
5. `NEXT_PUBLIC_*` gelten zur **Build-Zeit** — nach Änderungen neu deployen.

Deeplink zum Anlegen eines Blueprints (nach dem Push):

`https://dashboard.render.com/blueprint/new?repo=<HTTPS-REPO-URL>`

# Meal Tracker

Eine einfache Web-App zum Tracken von Mahlzeiten (Frühstück, Mittagessen, Abendessen) im Haushalt.

## Features

- ✅ Mahlzeiten erfassen (Frühstück, Mittagessen, Abendessen)
- ✅ Nach Datum filtern
- ✅ Mahlzeiten löschen
- ✅ Basic Auth Authentifizierung
- ✅ Daten werden in JSON-Datei gespeichert
- ✅ Docker-ready
- ✅ Tailwind CSS per CDN

## Installation

### Mit Docker (empfohlen)

1. `.env` Datei anpassen:
```bash
AUTH_USERNAME=admin
AUTH_PASSWORD=deinPasswort
PORT=3000
```

2. Container starten:
```bash
docker-compose up -d
```

3. App im Browser öffnen: `http://localhost:3000`

### Ohne Docker

1. Dependencies installieren:
```bash
npm install
```

2. `.env` Datei anpassen (siehe oben)

3. Server starten:
```bash
npm start
```

## Konfiguration

Die App wird über die `.env` Datei konfiguriert:

- `AUTH_USERNAME`: Benutzername für Basic Auth
- `AUTH_PASSWORD`: Passwort für Basic Auth
- `PORT`: Port auf dem die App läuft (Standard: 3000)

## Daten

Die Mahlzeiten werden in `data/meals.json` gespeichert. Bei Docker wird dieser Ordner als Volume gemountet, sodass die Daten auch nach Container-Neustarts erhalten bleiben.

## NAS Deployment

Für Synology NAS oder andere NAS-Systeme mit Docker:

1. Projekt auf die NAS kopieren
2. `.env` Datei anpassen
3. Im Projektverzeichnis: `docker-compose up -d`

Alternativ über die Docker GUI der NAS das Image bauen und Container starten.

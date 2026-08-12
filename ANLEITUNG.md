# Kochbuch – Installation auf deinem Android-Handy

Diese App ist eine **PWA** (Progressive Web App): eine Website, die sich wie
eine echte App installieren lässt – mit eigenem Icon, Vollbild und
Offline-Nutzung. Deine Rezepte werden direkt auf deinem Handy gespeichert.

Damit dein Handy sie laden kann, muss sie irgendwo im Internet liegen.
Am einfachsten geht das kostenlos über **GitHub Pages**. Dauert ca. 10 Minuten.

## Schritt 1: GitHub-Konto (falls noch nicht vorhanden)

1. Gehe auf https://github.com/signup und leg ein kostenloses Konto an.

## Schritt 2: Neues Repository erstellen

1. Auf https://github.com/new gehen.
2. Repository-Name eingeben, z. B. `kochbuch`.
3. Auf **Public** stellen (muss öffentlich sein für die kostenlose Variante).
4. „Create repository" klicken.

## Schritt 3: Dateien hochladen

1. Im neuen Repository auf **„uploading an existing file"** klicken
   (Link erscheint direkt auf der Repository-Startseite).
2. Alle Dateien aus diesem Ordner per Drag & Drop hineinziehen:
   - `index.html`
   - `manifest.json`
   - `service-worker.js`
   - `icon-192.png`
   - `icon-512.png`
3. Unten auf **„Commit changes"** klicken.

## Schritt 4: GitHub Pages aktivieren

1. Im Repository oben auf **Settings** klicken.
2. Im linken Menü auf **Pages** klicken.
3. Unter „Build and deployment" → „Branch" den Branch `main` und Ordner `/ (root)`
   auswählen, dann **Save**.
4. Nach ca. 1–2 Minuten erscheint oben eine grüne Box mit deiner Adresse, z. B.:
   `https://DEINNAME.github.io/kochbuch/`

## Schritt 5: Auf dem Handy installieren

1. Öffne die Adresse aus Schritt 4 in **Chrome** auf deinem Android-Handy.
2. Tippe oben rechts auf die drei Punkte (⋮).
3. Wähle **„App installieren"** bzw. **„Zum Startbildschirm hinzufügen"**.
4. Bestätigen – fertig! Die App erscheint jetzt als Icon auf deinem Homescreen
   und lässt sich wie jede andere App öffnen, auch ohne Internetverbindung.

## Hinweise

- Deine Rezepte werden lokal im Browser-Speicher deines Handys abgelegt.
  Sie sind privat und nur auf diesem Gerät sichtbar.
- Wenn du die App später aktualisieren willst (neue Funktionen), lade einfach
  eine neue Version von `index.html` in dasselbe Repository hoch – Chrome
  übernimmt die Änderung automatisch beim nächsten Öffnen.
- Falls du lieber eine andere Hosting-Lösung nutzt (Netlify, Vercel), geht das
  genauso: Ordner hochladen, fertig – GitHub Pages ist nur der einfachste
  kostenlose Weg ohne Kommandozeile.

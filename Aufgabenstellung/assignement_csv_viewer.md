# CSV Viewer – Kleine Full-Stack-Webanwendung 

**Wichtig:** Bitte lies diese gesamte Beschreibung **vor Beginn** sorgfältig durch.

## Ziel

Entwickle eine kleine Webanwendung, die es ermöglicht, eine CSV-Datei hochzuladen und deren Inhalt im Browser anzuzeigen.

Die Anwendung soll aus folgeden Komponenten bestehen:

- ein **Backend** mit einer kleinen REST-API  
- eine **Single-Page-Frontend-Anwendung** (Framework deiner Wahl)

Uns interessiert vor allem, wie du die Lösung strukturierst, die API entwirfst und die grundlegende Funktionalität innerhalb des Zeitrahmens implementierst.

---

## Datensatz

Zum testen ist eine CSV-Datei (`people.csv`) beigelegt..

**Deine Lösung sollte aber generisch sein und mit beliebigen tabellarischen CSV-Daten funktionieren.**

**Einige Zeilen enthalten Fehler** (z. B. fehlende Felder, zusätzliche Felder oder ungültige Werte).  
Deine Lösung sollte solche Fälle elegant behandeln (überspringen, markieren oder melden) und den Ansatz kurz im README beschreiben.

### **Beispielauszug**

```text
Name;Vorname;Strasse;Ort;Alter
Yang;Paloma;P.O. Box 451, 8598 Donec Road;Bell;88
Diaz;Jayme;Ap #486-1122 Vestibulum Road;Lafayette;45
Valencia;Kelly;755-2020 Erat. Rd.;Lincoln;60
Lindsay;Knox;Ap #732-8577 Pharetra Ave;West Sacramento;68
Donovan;Rowan;P.O. Box 356, 2474 Pede. St.;Jacksonville;75
Miller;Sam;Incomplete Street;Hamburg
Brown;Charlie;Some Street 123;Munich;42;EXTRA
Test;Invalid;Unknown Road;Berlin;not_a_number
```

Hinweis: Die CSV verwendet **Semikolon-Trennzeichen**.

---

## Anforderungen

### 1. Backend (REST API)

Das Backend soll:

- das Hochladen einer CSV-Datei ermöglichen  
- tabellarische Daten für das Frontend bereitstellen  

Du kannst die API vollständig selbst gestalten:
- Endpunkt-Struktur  
- Request/Response-Formate  
- Pagination (falls umgesetzt)  
- Umgang mit Datensätzen  

**Mindesterwartungen:**

- Das Backend akzeptiert eine CSV-Datei.
- Die CSV wird geparst und (z. B. im Speicher) abgelegt.
- Das Backend kann zurückgeben:
  - Spaltenüberschriften
  - mindestens den ersten Teil der Daten (z. B. die ersten 20 Zeilen)

---

### 2. Frontend (Single-Page-Application)

Das Frontend soll:

- eine CSV-Datei auswählen lassen  
- die Datei an das Backend senden  
- die zurückgegebenen Daten in einer Tabelle anzeigen  

**Mindesterwartungen:**

- Einfacher Upload-Dialog  
- Tabelle mit:
  - Spaltenüberschriften  
  - zumindest einem ersten Abschnitt der Zeilen  
- Einfaches Loading/Error-Handling  

Framework frei wählbar.

---

## Optionale Erweiterungen (nur bei Zeit)

Du kannst z. B. folgende Erweiterungen umsetzen:

- **Pagination**  
- **Sortierung**  
- **Filter/Suche**  
- **Einfache Statistiken**

Diese sind nicht erforderlich, können aber helfen, deine **Expertise** zu zeigen.

---

## Zeitrahmen

Ziele auf ca. **3 Stunden** Entwicklungszeit.

Wir erwarten keine perfekte oder produktionsreife Anwendung, es sollte aber möglich sein **eine funktionierende Lösung live zu präsentieren.**  
Falls Teile unvollständig bleiben, dokumentiere dies bitte kurz.

---

## Abgabe


### 1. Quellcode
Backend + Frontend, als Git-Repository oder ZIP-Archiv.

### 2. README (Pflicht)
Das README sollte enthalten:

- wie man das Backend startet  
- wie man das Frontend startet  
- eine kurze Beschreibung des **API-Designs**  
- welche Features du umgesetzt hast  
- was du mit mehr Zeit verbessern würdest  

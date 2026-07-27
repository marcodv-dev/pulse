# 🏋️ PWA Gym Tracker — Documento di Specifica e Progetto Tecnico Completo

Un'applicazione web progressiva (PWA) **100% offline-first**, gratuita e ad altissima velocità d'uso, progettata su misura per la gestione e l'esecuzione degli allenamenti in palestra con **Visual Rest Timer & Screen Sync**.

---

## 📌 1. Visione del Prodotto e Principi Guida

1. **Velocità Estrema In-Gym:** Durante l'allenamento non c'è tempo da perdere in menu complessi. Registrar una serie richiede **un solo tap** su un pulsante ergonomico e gigante.
2. **Flessibilità Assoluta della Scheda:** Nessun vincolo rigido su serie/ripetizioni. L'utente inserisce la scheda nel formato che preferisce: **testo libero, immagini/foto di schede cartacee o file PDF**.
3. **Visual Rest Timer Passivo:** Un timer ad altissimo contrasto visivo che comunica lo stato del recupero tramite cambi di colore a tutto schermo, permettendo di capire quando ripartire anche da lontano senza dover leggere cifre piccole.
4. **Zero Dipendenza Cloud & Privacy Totale:** Funziona interamente offline sul dispositivo tramite IndexedDB. I dati rimangono privati al 100% ed è possibile esportarli o importarli via file JSON/CSV in qualsiasi momento.

---

## 🎨 2. Design System & Palette Cromatica

L'interfaccia adotta un **Tema Chiaro Moderno** ad elevatissima leggibilità anche sotto le luci dirette della palestra, abbinato a una schermata di riposo ad alto contrasto per il risparmio energetico e l'impatto visivo.

### Palette Colori Principale
* **Sfondo Generale App (Light Mode):** `#FFFFFF` / `#FCFBFE`
* **Colore Testo Principale:** `#1F071D` *(Melanzana scuro ad altissimo contrasto)*
* **Colore Primario / Accento:** `#D64D76` *(Magenta / Rosa acceso)*
* **Bordi e Separatori:** `#F0E6ED`
* **Stati di Successo / Conferma:** `#2E8B57`

### Palette del Visual Rest Timer (Overlay Fullscreen)
* **Fase Iniziale del Timer (0s fino agli ultimi 10s):**
  * **Sfondo:** `#1F071D` *(Sfondo scuro per ridurre l'affaticamento visivo)*
  * **Cifre / Testo:** `#FFFFFF` con accenti `#D64D76`
* **Fase Finale del Timer (Ultimi 10 Secondi):**
  * **Sfondo:** `#D64D76` *(Cambio cromatico drastico a pieno schermo per avviso visivo)*
  * **Cifre / Testo:** `#1F071D` *(Massima leggibilità e impatto)*

---

## 🛠️ 3. Architettura delle Funzionalità

### 3.1. Gestione Schede e Giornate Dinamiche
* **Giornate Personalizzate ed Illimitate:**
  * L'utente definisce libera la struttura: `A`, `B`, `C`, `D`, `E` oppure `Upper`, `Lower`, `Gamba/Spalle`, `Giorno 1`, ecc.
  * Possibilità di aggiungere, rinominare, riordinare ed eliminare le giornate in qualsiasi momento.
* **Supporto Multimodale per la Scheda:**
  1. **Testo Libero / Note:** Area di testo aperta in cui scrivere o incollare liberamente la descrizione (es. *"Panca piana bilanciere 4x8-10 r120s focus fermo 1s al petto"*).
  2. **Foto / Screenshot:** Caricamento e rendering istantaneo di immagini (JPG, PNG, WebP) di schede cartacee o note visuali.
  3. **File PDF:** Rendering integrato di file PDF con la scheda completa.
* **Parametri Veloci Associati all'Esercizio:**
  * **Peso / Carico Target ($kg$):** Campo di input rapido modificabile al volo.
  * **Tempo di Recupero ($secondi$):** Valore preimpostato per il conto alla rovescia del timer.

### 3.2. Flusso di Allenamento (Workout Execution)
* **Schermata Scheda Visibile:** Durante la sessione, la descrizione o il file della scheda è sempre in primo piano.
* **Selezione Esercizio:** Un tap sull'esercizio attiva la sessione per quella specifica stazione.
* **Autocompilazione Intelligente:** L'app pre-compila automaticamente il peso e il recupero in base all'ultimo allenamento registrato per quell'esercizio.
* **Pulsante Gigante "Serie Completata":**
  * Collocato nella parte inferiore dello schermo (zona ergonomica per il pollice).
  * Con un singolo tap:
    1. Salva la serie nello storico locale (IndexedDB).
    2. Attiva e mostra istantaneamente il **Visual Rest Timer** a pieno schermo.

### 3.3. Visual Rest Timer & Screen Sync
* **Screen Wake Lock API:** Mantiene lo schermo forzatamente acceso durante tutto il conto alla rovescia (evita il blocco schermo con mani sudate o gesso).
* **Comportamento Cromatico e Temporale:**
  * **Conteggio standard:** Sfondo scuro `#1F071D`.
  * **Soglia -10 secondi:** Lo schermo passa istantaneamente al colore primario `#D64D76`.
  * **Scadenza Tempo (0s):**
    * Generazione di un segnale acustico tramite **Web Audio API**.
    * Sequenza di vibrazioni tramite **Vibration API**.
    * Il timer si ferma a `00:00` (nessun conteggio negativo).
* **Tap-to-Dismiss Totale:**
  * Un qualsiasi tap in qualunque punto del display chiude immediatamente il timer e riporta alla vista scheda per iniziare la serie successiva.

### 3.4. Gestione Dati: Esportazione, Importazione e Backup
* **100% Offline-First:** Nessun server richiesto. Tutti i dati restano sul dispositivo.
* **Esportazione JSON/CSV:**
  * Generazione di un file `.json` completo contenente tutte le schede, le giornate, le impostazioni e lo storico allenamenti.
  * Generazione di report `.csv` leggibili da Excel/Google Sheets.
* **Importazione Scheda & Ripristino:**
  * Possibilità di caricare un file JSON esportato in precedenza o condiviso da un amico per caricare istantaneamente la scheda nell'app.

---

## 🏗️ 4. Requisiti Tecnici e Web API Utilizzate

| API / Tecnologia | Scopo e Utilizzo nell'Applicazione |
| :--- | :--- |
| **Service Workers & Cache API** | Garantiscono il funzionamento offline e il caricamento istantaneo delle risorse |
| **IndexedDB** | Database NoSQL locale per salvare schede, log, file multimediali (foto/PDF) e storico |
| **Screen Wake Lock API** | Impedisce allo schermo dello smartphone di spegnersi durante il rest timer |
| **Vibration API** | Invia impulsi tattili al termine del timer o negli ultimi 3 secondi |
| **Web Audio API** | Sintetizza segnali acustici (bip) a frequenza controllata senza richiedere file audio esterni |
| **File API & Drag and Drop** | Gestisce l'importazione/esportazione di JSON, CSV, foto e file PDF |
| **Web App Manifest** | Consente l'installazione dell'app nella Home screen di iOS, Android e Desktop |

---

## 📂 5. Modello dei Dati (IndexedDB Schema)

### Store: `workouts` (Schede e Giornate)
```json
{
  "id": "workout_2026_01",
  "title": "Scheda Massa Autunno",
  "is_active": true,
  "created_at": 1785000000000,
  "days": [
    {
      "day_id": "day_a",
      "title": "Giorno A - Petto e Tricipiti",
      "exercises": [
        {
          "exercise_id": "ex_panca_piana",
          "name": "Panca Piana Bilanciere",
          "description": "4x8 r120s - Fermo al petto 1 sec",
          "media_type": "text", 
          "media_content": null,
          "target_weight": 85.0,
          "rest_seconds": 120
        },
        {
          "exercise_id": "ex_dip",
          "name": "Dip Parallele con Zavorra",
          "description": "Foto della scheda cartacea",
          "media_type": "image",
          "media_content": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
          "target_weight": 20.0,
          "rest_seconds": 90
        }
      ]
    }
  ]
}
```

### Store: `logs` (Storico delle Serie Completate)
```json
{
  "log_id": "log_100234",
  "timestamp": 1785005400000,
  "workout_id": "workout_2026_01",
  "day_id": "day_a",
  "exercise_id": "ex_panca_piana",
  "set_number": 1,
  "weight_used": 85.0,
  "rest_duration_given": 120,
  "completed": true
}
```

---

## 📱 6. Architettura dell'Interfaccia Utente (UI Workflow)

```
[ Dashboard / Avvio Rapido ]
       │
       ├──► [ Selettore Giornata (A, B, C, D...) ]
       │          │
       │          └──► [ Vista Scheda / Esercizio Corrente ]
       │                    ├── Visualizzazione Descrizione / Foto / PDF
       │                    ├── Input Peso (kg) & Tempo Recupero (s)
       │                    └── [ BOTTONE GIGANTE: "SERIE COMPLETATA" ]
       │                              │
       │                              ▼
       │                   [ VISUAL REST TIMER OVERLAY ]
       │                    ├── Background Scuro (#1F071D) [0s -> -10s]
       │                    ├── Background Rosa (#D64D76) [Ultimi 10s]
       │                    ├── Suono + Vibrazione [Fine Tempo]
       │                    └── TAP IN QUALSIASI PUNTO ──► (Ritorno alla Scheda)
       │
       └──► [ Impostazioni / Gestione Dati ]
                  ├── Esporta Backup (JSON / CSV)
                  └── Importa Scheda (JSON)
```

---

## 🚀 7. Roadmap di Sviluppo ed Esecuzione

1. **Fase 1: Setup PWA & Database**
   * Configurazione del `manifest.json` e Service Worker per la cache offline.
   * Inizializzazione del DB locale `IndexedDB` con gli store `workouts` e `logs`.
2. **Fase 2: Interfaccia Scheda & Modelli di Inserimento**
   * Creazione dell'editor per giornate dinamiche e supporto ai 3 formati (testo, foto, PDF).
   * Implementazione del layout con palette `#FFFFFF`, `#1F071D` e `#D64D76`.
3. **Fase 3: Visual Rest Timer Engine**
   * Sviluppo del modulo timer in JS nativo con Screen Wake Lock API.
   * Gestione delle transizioni di colore negli ultimi 10 secondi.
   * Implementazione del Tap-to-Dismiss e dei segnali audio/vibrazione.
4. **Fase 4: Import / Export & Refinements**
   * Sviluppo dei moduli di esportazione ed importazione file JSON/CSV.
   * Test completo di usabilità offline.

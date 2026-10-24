# SwasthyaSathi Healthcare Backend

> **Public Health Guidance, Gnani.ai Vernacular Voice AI, Medical Safety Guardrails, Hospital Locator & Scheme Eligibility Engine**  
> Built with **Node.js, Express, and TypeScript**.

---

## 🌟 Overview

The **SwasthyaSathi Backend** connects the vernacular public health guidance frontend to **Gnani.ai Indic Voice AI APIs**, processes medical queries, enforces clinical safety rules, queries verified public hospitals (PHCs, CHCs, District Hospitals, AIIMS), and evaluates citizen eligibility for flagship Indian healthcare schemes including **Ayushman Bharat PM-JAY** and **Universal Senior Citizen Coverage (70+)**.

---

## 🏗️ Architecture

```
                                  ┌──────────────────────────┐
                                  │   SwasthyaSathi UI       │
                                  │   (Web / Mobile / React) │
                                  └─────────────┬────────────┘
                                                │ REST / Audio
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              Express + Node.js Backend                                 │
│                                                                                        │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────────────────┐  │
│  │ Voice Controller │    │  Chat Controller │    │ Hospital & Scheme Controllers    │  │
│  └────────┬─────────┘    └────────┬─────────┘    └────────────────┬─────────────────┘  │
│           │                       │                               │                    │
│           ▼                       ▼                               ▼                    │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────────────────┐  │
│  │   GnaniService   │    │  SafetyService   │    │ HospitalService & SchemeService  │  │
│  │ (ASR/STT & TTS)  │    │  (Triage & PII)  │    │  (Proximity & Eligibility Rules) │  │
│  └────────┬─────────┘    └────────┬─────────┘    └────────────────┬─────────────────┘  │
└───────────┼───────────────────────┼───────────────────────────────┼────────────────────┘
            ▼                       ▼                               ▼
     Gnani.ai APIs        MoHFW / NHM Protocols         PM-JAY & National Health Data
  (Vernacular Voice)     (Emergency 112 Triage)             (ABDM / NHA Portals)
```

---

## 🚀 Key Features

### 1. Gnani.ai Indic Voice AI Integration (`src/services/gnaniService.ts`)
- **Speech-to-Text (STT / ASR)**: Transcribes Indian vernacular speech in Hindi (`hi-IN`), Marathi (`mr-IN`), English (`en-IN`), Tamil, Telugu, Kannada, and Bengali.
- **Text-to-Speech (TTS)**: Converts medical guidance text into natural synthesized audio speech (`audio/wav`) in vernacular Indian accents.
- **Dual Live / Resilient Mode**: Seamlessly calls live Gnani endpoints when credentials are provided in `.env`, or gracefully falls back to synthetic PCM audio simulation for offline/sandbox testing.

### 2. Medical Safety & Clinical Guardrails (`src/services/safetyService.ts`)
- **Red Flag Symptom Triage**: Scans queries across English, Hindi, and Marathi for life-threatening conditions (chest pain, severe dyspnea, stroke signs, severe hemorrhage, trauma, poisoning).
- **Emergency Short-Circuit**: Immediately triggers high-priority alerts with **112 / 108 Emergency Helpline routing** and warns users never to wait for AI replies.
- **Indian PII Scrubbing**: Automatically detects and masks sensitive personally identifiable information (Aadhaar 12-digit numbers, Indian phone numbers, payment card numbers, emails).
- **Non-Diagnostic & Prescription Guardrails**: Strictly enforces that the AI does not issue definitive diagnoses or prescriptions, appending standard **MoHFW / NHM clinical disclaimers**.

### 3. Public & Empanelled Hospital Engine (`src/services/hospitalService.ts`)
- Repository of verified **PHCs, CHCs, District Hospitals, Medical Colleges, and PM-JAY empanelled facilities**.
- Search by keyword, state, district, pincode, or department/specialty (Cardiology, Orthopedics, Pediatrics, OB-GYN, etc.).
- **GPS Proximity Search**: Uses the Haversine formula to find and sort closest hospitals with distance in kilometers.

### 4. Government Scheme Eligibility Engine (`src/services/schemeService.ts`)
- **Ayushman Bharat PM-JAY**: ₹5 Lakh / year family cover for secondary and tertiary hospitalization.
- **Ayushman Vay Vandana (PM-JAY Senior Citizen 70+)**: Universal ₹5 Lakh cover for ALL citizens aged 70 and above, regardless of income.
- **ABHA (Ayushman Bharat Health Account)**: Universal 14-digit digital health ID.
- **Pradhan Mantri Matru Vandana Yojana (PMMVY)**: Maternity cash assistance.
- **State Schemes**: Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY - Maharashtra).
- Returns required documents (Aadhaar, Ration Card), application steps, and official portal links.

---

## 📡 API Reference

### Health & Status
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/voice/status` | Gnani API connectivity status |

### Conversational Guidance & Safety
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat/query` | Complete question processing (triage, specialty, tier, nearby hospitals, TTS voice) |
| `POST` | `/api/chat/safety-check` | Standalone PII masking and red flag detection |

#### Sample Request: `POST /api/chat/query`
```json
{
  "query": "Which doctor should I consult for stomach pain?",
  "language": "en",
  "synthesizeVoice": true
}
```

### Voice (Gnani.ai)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/voice/stt` | Transcribe speech audio (multipart `audio` or `audioBase64`) |
| `POST` | `/api/voice/tts` | Synthesize vernacular text to audio speech |

### Hospital Information
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/hospitals` | Filter hospitals (`search`, `specialty`, `district`, `isPmjayEmpanelled`) |
| `GET` | `/api/hospitals/:id` | Single hospital details |
| `GET` | `/api/hospitals/nearby` | Proximity search by coordinates (`lat`, `lng`, `radius`) |
| `GET` | `/api/hospitals/departments` | List of all available medical departments |

### Government Healthcare Schemes
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/schemes` | List all available public healthcare schemes |
| `GET` | `/api/schemes/:id` | Details of a specific scheme |
| `POST` | `/api/schemes/check-eligibility` | Evaluate citizen eligibility based on age, income, ration card |

#### Sample Request: `POST /api/schemes/check-eligibility`
```json
{
  "age": 72,
  "annualIncome": 180000,
  "rationCardType": "PriorityHousehold",
  "state": "Maharashtra"
}
```

---

## ⚙️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env`)
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=*

# Gnani.ai Voice Credentials (optional for live mode, otherwise uses fallback)
GNANI_API_KEY=
GNANI_TOKEN=
GNANI_STT_URL=https://asr.gnani.ai/v1/recognize
GNANI_TTS_URL=https://tts.gnani.ai/v1/synthesize
GNANI_USE_MOCK_FALLBACK=true
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm start
```

### 5. Run Unit & Triage Tests
```bash
node --test test/backend.test.mjs
```

---

## 🌐 Connecting with Frontend (`swasthya-sathi-ui`)
The frontend web app at `swasthya-sathi-ui/index.html` is pre-configured to communicate with `http://localhost:5000/api`.
Start the backend first, then open `swasthya-sathi-ui/index.html` in your browser. All speech synthesis, hospital listings, safety triaging, and scheme checks will communicate live with this backend!

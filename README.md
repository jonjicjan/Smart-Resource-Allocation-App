<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<div align="center">

<img src="https://img.shields.io/badge/Google_Solution_Challenge-2026-4285F4?style=for-the-badge&logo=google&logoColor=white" />
<img src="https://img.shields.io/badge/Built_with-Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white" />
<img src="https://img.shields.io/badge/AI-Gemini_1.5_Pro-8E75B2?style=for-the-badge&logo=google&logoColor=white" />
<img src="https://img.shields.io/badge/Backend-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />

<br/><br/>

# 🤝 VolunteerBridge

### AI-Powered Volunteer Coordination for Social Impact

*Connecting communities in need with the right volunteers — automatically, intelligently, in real time.*

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-volunteerbridge.web.app-059669?style=flat-square)](https://volunteerbridge.web.app)
[![Prototype](https://img.shields.io/badge/🖥_Prototype-Interactive_Preview-7C3AED?style=flat-square)](https://volunteerbridge-prototype.vercel.app)
[![Demo Video](https://img.shields.io/badge/▶_Demo_Video-3_Minutes-FF0000?style=flat-square&logo=youtube)](https://youtube.com/watch?v=volunteerbridge-demo)
[![PPT](https://img.shields.io/badge/📊_Presentation-Solution_Challenge-EA4335?style=flat-square)](https://github.com/volunteerbridge/volunteer-bridge/blob/main/docs/presentation.pptx)

<br/>

</div>

---


## 🚨 The Problem

> **3.3 million NGOs in India** collect critical community data through paper surveys and handwritten field reports — scattered, unstructured, multilingual, and impossible to act on at scale.

```
Paper survey → Coordinator reads manually → Calls volunteers one by one
                                                        ↓
                              Response time: 6+ hours | Accuracy: Low
                              Volunteers missed: Many | Needs unmet: Too many
```

**The coordination layer is broken.** Willing volunteers sit idle. Urgent community needs go unaddressed. Not because of lack of resources — but because of lack of intelligent routing.

---

## 💡 Our Solution

**VolunteerBridge** replaces the broken manual loop with an AI-powered pipeline:

```
NGO submits need (any language)
        ↓
Cloud Translation API → Cloud Natural Language API → Gemini 1.5 Pro
        ↓                         ↓                          ↓
  Translates to English    Tags category            Ranks top 3 volunteer
                           Extracts entities         matches with reasoning
                           Scores urgency
        ↓
Coordinator reviews AI suggestions → Assigns volunteer → FCM notification
        ↓
Volunteer accepts → Task in progress → Resolved → Impact tracked in BigQuery
```

**Response time drops from 6+ hours to under 30 minutes.**

---

## 🌐 Live Demo

| Resource | Link |
|---|---|
| 🖥 Interactive Prototype | [https://volunteerbridge-869819276601.us-west1.run.app/](https://volunteerbridge-869819276601.us-west1.run.app/) |
| ▶ Demo Video (3 min) | [https://www.youtube.com/watch?v=qG9QDCruSn8](https://www.youtube.com/watch?v=qG9QDCruSn8) |


**Test credentials for prototype:**

| Role | Action |
|---|---|
| NGO Coordinator | Select "NGO Coordinator" → Sign in with Google |
| Volunteer | Select "Volunteer" → Sign in with Google |

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🤖 For NGO Coordinators
- **AI-powered need submission** with auto-tagging
- **Gemini match suggestions** with written reasoning
- **One-click volunteer assignment** + instant FCM alert
- **Real-time needs board** — filter by status/urgency
- **Impact dashboard** powered by Looker Studio
- **Google Forms integration** for paper survey digitization

</td>
<td width="50%">

### 🙋 For Volunteers
- **Google Sign-In** — zero friction onboarding
- **AI-matched task feed** based on skills + location
- **Accept / Decline** with instant coordinator notification
- **Google Maps** task location view
- **Impact history** — tasks, hours, people helped
- **Achievement badges** — gamified engagement

</td>
</tr>
</table>

### 🧠 AI Pipeline Features

| Feature | Google Service | Free Tier |
|---|---|---|
| Volunteer-to-need matching | Gemini 1.5 Pro | 15 req/min, 1M tokens/day |
| Urgency classification | Gemini 1.5 Pro | Included |
| Survey text parsing | Cloud Natural Language API | 5,000 units/month |
| Hindi/regional language support | Cloud Translation API | 500K chars/month |
| Skill verification from certificates | Vision AI | 1,000 units/month |
| Needs summarization for coordinators | Gemini 1.5 Pro | Included |

---

## 🧠 How Gemini AI Works

### Volunteer Matching Prompt

When a new need is created in Firestore, a Cloud Function sends this prompt to Gemini 1.5 Pro:

```
You are a volunteer coordination assistant for an NGO platform in India.

COMMUNITY NEED:
Title: Medical camp volunteers needed
Description: Monthly free medical camp requires 5 volunteers with basic
             first-aid training. 200+ residents expected.
Category: Health
Skills Required: Medical Aid, First Aid
Location: Dharavi, Mumbai
Urgency: critical

AVAILABLE VOLUNTEERS:
ID: v001, Name: Dr. Priya Mehta
Skills: MBBS, Emergency Care, Hindi
Availability: weekends
Distance: 2km from need location
Tasks Completed: 12

ID: v002, Name: Sanjay Kumar
Skills: Nursing, First Aid, Marathi
Availability: weekends
Distance: 4km
Tasks Completed: 7

Return the top 3 best matches as JSON:
[{"volunteerId":"uid","score":9.4,"reasoning":"explanation"}]
Return ONLY valid JSON. No extra text.
```

### Gemini Response

```json
[
  {
    "volunteerId": "v001",
    "score": 9.4,
    "reasoning": "Medical degree and emergency care background is a direct match for a health camp. Hindi fluency ensures communication with local residents. Has completed 12 tasks previously — highest reliability score in the pool."
  },
  {
    "volunteerId": "v002",
    "score": 8.1,
    "reasoning": "Professional nursing background and first-aid certification strongly qualifies this volunteer. Close proximity (4km) means fast response. Marathi fluency is a bonus for Dharavi."
  }
]
```

### Urgency Scoring

```javascript
const urgencyPrompt = `
Classify the urgency of this community need as exactly one word:
"critical", "moderate", or "low".
Need: ${description}
Reply with just one word.
`;
// Returns: "critical"
```

### Full AI Pipeline Flow

```
New need created in Firestore
         │
         ▼
┌─────────────────────────────────────┐
│     onNeedCreated() Cloud Function  │
│                                     │
│  1. Cloud Translation API           │
│     └─ Detect language              │
│     └─ Translate to English         │
│                                     │
│  2. Natural Language API            │
│     └─ Extract entities             │
│     └─ Auto-tag category            │
│                                     │
│  3. Gemini 1.5 Pro                  │
│     └─ Score urgency                │
│     └─ Fetch volunteers             │
│     └─ Rank top 3 matches           │
│     └─ Generate reasoning           │
│                                     │
│  4. Write matches to Firestore      │
│     needs/{id}/matches/             │
└─────────────────────────────────────┘
         │
         ▼
Coordinator reviews matches → Assigns
         │
         ▼
┌─────────────────────────────────────┐
│   onVolunteerAssigned() Cloud Fn    │
│   └─ Send FCM push notification     │
│   └─ Update task status             │
└─────────────────────────────────────┘
```

---

## 🏗 Architecture

```
╔══════════════════════════════════════════════════════════════╗
║                     CLIENT LAYER                             ║
║                                                              ║
║   ┌─────────────────────┐    ┌─────────────────────────┐    ║
║   │   Flutter Mobile    │    │     Flutter Web          │    ║
║   │   (Android / iOS)   │    │   (NGO Coordinator)      │    ║
║   │     Volunteers      │    │      Dashboard           │    ║
║   └──────────┬──────────┘    └───────────┬─────────────┘    ║
║              └───────────┬───────────────┘                   ║
╚═════════════════════════╪════════════════════════════════════╝
                           │ HTTPS / WebSocket
╔═════════════════════════╪════════════════════════════════════╗
║                  FIREBASE BACKEND                            ║
║   ┌──────────────────────────────────────────────────────┐   ║
║   │  Firebase Auth  │  Firestore  │  FCM  │  Hosting    │   ║
║   │  (Google SSO)   │ (Real-time) │ (Push)│  (Flutter)  │   ║
║   └──────────────────────┬───────────────────────────────┘   ║
╚═════════════════════════╪════════════════════════════════════╝
                           │ Firestore Triggers
╔═════════════════════════╪════════════════════════════════════╗
║              CLOUD FUNCTIONS (Node.js)                       ║
║         onNeedCreated()  │  onVolunteerAssigned()            ║
║   ┌──────────────────────────────────────────────────────┐   ║
║   │ Translation API │ NL API │ Gemini 1.5 Pro            │   ║
║   │  (Translate)    │ (Tag)  │  (Match + Score)          │   ║
║   └──────────────────────────────────────────────────────┘   ║
╚══════════════════════════════════════════════════════════════╝
                           │
╔═════════════════════════╪════════════════════════════════════╗
║              DATA & ANALYTICS                                ║
║   ┌──────────────────────────────────────────────────────┐   ║
║   │    BigQuery     │  Sheets API  │   Looker Studio     │   ║
║   │  (Warehouse)    │ (NGO import) │  (Impact charts)   │   ║
║   └──────────────────────────────────────────────────────┘   ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 🛠 Tech Stack

| Layer | Technology | Purpose | Cost |
|---|---|---|---|
| **Frontend** | Flutter | Cross-platform mobile + web | Free |
| **Frontend** | Google Maps SDK | Task location + geo-matching | $200/mo credit |
| **Backend** | Firebase Auth | Google Sign-In + roles | Free tier |
| **Backend** | Cloud Firestore | Real-time NoSQL database | Free tier |
| **Backend** | Firebase FCM | Push notifications | Free |
| **Backend** | Cloud Functions (Node.js) | Serverless AI pipeline | Free tier |
| **AI/ML** | Gemini 1.5 Pro | Volunteer matching + urgency | Free (AI Studio) |
| **AI/ML** | Cloud Natural Language API | Entity extraction + tagging | Free tier |
| **AI/ML** | Cloud Translation API | Hindi/regional languages | Free tier |
| **AI/ML** | Vision AI | Certificate skill verification | Free tier |
| **Data** | BigQuery | Analytics data warehouse | Free tier |
| **Data** | Looker Studio | Impact visualization | Free |
| **Data** | Google Sheets API | Import existing NGO data | Free |
| **Infra** | Firebase Hosting | Flutter web deployment | Free tier |
| **Infra** | Cloud Run | Containerized API backend | Free tier |

---

## 📁 Project Structure

```
volunteer-bridge/
│
├── 📱 lib/                          # Flutter application
│   ├── main.dart                    # App entry point + Firebase init
│   ├── firebase_options.dart        # Auto-generated by FlutterFire CLI
│   │
│   ├── 📦 models/
│   │   ├── user_model.dart          # User data class
│   │   ├── need_model.dart          # Community need data class
│   │   ├── match_model.dart         # Gemini AI match result
│   │   └── task_model.dart          # Assigned task data class
│   │
│   ├── 🔧 services/
│   │   ├── auth_service.dart        # Firebase Auth + Google Sign-In
│   │   ├── firestore_service.dart   # All Firestore CRUD operations
│   │   ├── gemini_service.dart      # Gemini API calls
│   │   ├── fcm_service.dart         # Push notification handling
│   │   └── location_service.dart   # Geolocator + Maps integration
│   │
│   ├── 🖥 screens/
│   │   ├── auth/
│   │   │   └── login_screen.dart
│   │   ├── coordinator/
│   │   │   ├── dashboard_screen.dart
│   │   │   ├── submit_need_screen.dart
│   │   │   ├── needs_list_screen.dart
│   │   │   ├── matches_screen.dart
│   │   │   └── impact_screen.dart
│   │   └── volunteer/
│   │       ├── task_list_screen.dart
│   │       ├── task_detail_screen.dart
│   │       ├── volunteer_profile.dart
│   │       └── volunteer_impact.dart
│   │
│   ├── 🧩 widgets/
│   │   ├── need_card.dart
│   │   ├── match_card.dart
│   │   ├── urgency_badge.dart
│   │   ├── stat_card.dart
│   │   └── ai_pipeline_widget.dart
│   │
│   └── 🛠 utils/
│       ├── constants.dart
│       ├── theme.dart
│       └── helpers.dart
│
├── ⚡ functions/                    # Cloud Functions (Node.js)
│   ├── index.js
│   ├── src/
│   │   ├── matching.js              # Gemini volunteer matching
│   │   ├── nlp.js                   # Natural Language API
│   │   ├── translation.js           # Cloud Translation API
│   │   ├── urgency.js               # Gemini urgency scoring
│   │   └── notifications.js         # FCM sender
│   ├── package.json
│   └── .env.example
│
├── 📊 docs/
│   ├── presentation.pptx
│   ├── architecture.png
│   └── demo-script.md
│
├── 🧪 test/
│   ├── unit/
│   └── widget/
│
├── pubspec.yaml
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

```bash
# Verify Flutter
flutter doctor

# Required versions
# Flutter SDK  >= 3.19.0
# Dart SDK     >= 3.3.0
# Node.js      >= 18.0.0
```

### Install CLI tools

```bash
npm install -g firebase-tools
dart pub global activate flutterfire_cli
```

### Clone and install

```bash
git clone https://github.com/volunteerbridge/volunteer-bridge.git
cd volunteer-bridge
flutter pub get
cd functions && npm install && cd ..
```

---

## 🔥 Firebase Setup

### 1. Create project

```bash
firebase login
firebase projects:create volunteer-bridge-2026
```

### 2. Enable services

In [Firebase Console](https://console.firebase.google.com):

```
Authentication → Sign-in method → Enable Google
Firestore      → Create database → Test mode → asia-south1
Hosting        → Get started
```

### 3. Connect Flutter

```bash
flutterfire configure --project=volunteer-bridge-2026
```

### 4. Add SHA-1 fingerprint (Android)

```bash
cd android && ./gradlew signingReport
# Copy SHA-1 → Firebase Console → Project Settings → Android app → Add fingerprint
```

### 5. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }

    match /needs/{needId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null
        && (request.auth.uid == resource.data.submittedBy
            || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'coordinator');
    }

    match /needs/{needId}/matches/{matchId} {
      allow read: if request.auth != null;
      allow write: if false; // Cloud Functions only
    }

    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🔐 Environment Variables

```bash
cp .env.example .env
```

```env
# Gemini API (from aistudio.google.com)
GEMINI_API_KEY=your_gemini_api_key

# Google Cloud
GOOGLE_CLOUD_API_KEY=your_cloud_api_key
GOOGLE_CLOUD_PROJECT_ID=volunteer-bridge-2026

# Maps
MAPS_API_KEY=your_maps_api_key

# Firebase
FIREBASE_PROJECT_ID=volunteer-bridge-2026
FIREBASE_API_KEY=your_firebase_web_api_key
```

Pass to Flutter:

```bash
flutter run \
  --dart-define=GEMINI_API_KEY=$GEMINI_API_KEY \
  --dart-define=MAPS_API_KEY=$MAPS_API_KEY
```

Set for Cloud Functions:

```bash
firebase functions:config:set gemini.key="YOUR_KEY"
```

---

## ⚡ Cloud Functions

### Deploy

```bash
firebase deploy --only functions
```

---

## 📡 API Reference

### GeminiService (Dart)

```dart
class GeminiService {
  static final _model = GenerativeModel(
    model: 'gemini-1.5-pro',
    apiKey: const String.fromEnvironment('GEMINI_API_KEY'),
  );

  /// Match volunteers to a need — returns ranked list with reasoning
  static Future<List<MatchResult>> matchVolunteers({
    required NeedModel need,
    required List<UserModel> volunteers,
  }) async { ... }

  /// Classify urgency → 'critical' | 'moderate' | 'low'
  static Future<String> classifyUrgency(String description) async { ... }

  /// Summarize open needs for coordinator briefing
  static Future<String> summarizeNeeds(List<NeedModel> needs) async { ... }
}
```

### FirestoreService (Dart)

```dart
class FirestoreService {
  /// Submit need — triggers Cloud Function automatically
  Future<String> submitNeed(NeedModel need) async { ... }

  /// Stream real-time needs with optional status filter
  Stream<List<NeedModel>> streamNeeds({String? statusFilter}) { ... }

  /// Get Gemini-generated matches for a need
  Future<List<MatchResult>> getMatches(String needId) async { ... }

  /// Assign volunteer — triggers FCM notification via Cloud Function
  Future<void> assignVolunteer({
    required String needId,
    required String volunteerId,
  }) async { ... }
}
```

---

## 🗄 Database Schema

```
Firestore
│
├── users/{uid}
│   ├── name: string
│   ├── email: string
│   ├── role: "volunteer" | "coordinator"
│   ├── skills: string[]           → ["Medical Aid", "Teaching"]
│   ├── languages: string[]        → ["English", "Hindi"]
│   ├── location: GeoPoint
│   ├── availability: string       → "weekends" | "weekdays" | "anytime"
│   ├── tasksCompleted: number
│   └── fcmToken: string
│
├── needs/{needId}
│   ├── title: string
│   ├── description: string        → original language submission
│   ├── descriptionEnglish: string → Cloud Translation API output
│   ├── category: string           → Cloud NL API auto-tag
│   ├── entities: string[]         → Cloud NL API extracted entities
│   ├── urgency: string            → Gemini: "critical"|"moderate"|"low"
│   ├── skillsRequired: string[]
│   ├── location: GeoPoint
│   ├── locationName: string
│   ├── language: string           → "hi"|"en"|"mr"|"ta"|"te"|"kn"
│   ├── status: string             → "open"|"assigned"|"in_progress"|"resolved"
│   ├── submittedBy: uid
│   ├── assignedTo: uid | null
│   ├── matchCount: number
│   ├── aiProcessed: boolean
│   ├── createdAt: timestamp
│   └── resolvedAt: timestamp | null
│
├── needs/{needId}/matches/{matchId}
│   ├── volunteerId: string
│   ├── score: number              → 1.0 – 10.0 (Gemini ranking)
│   ├── reasoning: string          → Gemini written explanation
│   └── generatedAt: timestamp
│
└── tasks/{taskId}
    ├── needId: string
    ├── volunteerId: string
    ├── status: string             → "pending_acceptance"|"accepted"|"completed"
    ├── acceptedAt: timestamp | null
    ├── completedAt: timestamp | null
    └── createdAt: timestamp
```

---

## 🏃 Running the App

```bash
# Android / iOS
flutter run --dart-define=GEMINI_API_KEY=$GEMINI_API_KEY

# Chrome (web)
flutter run -d chrome --dart-define=GEMINI_API_KEY=$GEMINI_API_KEY

# Build APK
flutter build apk --release --dart-define=GEMINI_API_KEY=$GEMINI_API_KEY

# Build + deploy web
flutter build web --release --dart-define=GEMINI_API_KEY=$GEMINI_API_KEY
firebase deploy --only hosting
```

---

## 🧪 Testing

```bash
# All unit tests
flutter test

# With coverage
flutter test --coverage
genhtml coverage/lcov.info -o coverage/html

# Cloud Functions locally
cd functions
firebase emulators:start --only functions,firestore
npm test
```

---

## 🌍 SDGs Addressed

| SDG | How VolunteerBridge contributes |
|---|---|
| **SDG 1** No Poverty | Connects underserved communities with food, medical, and shelter resources |
| **SDG 3** Good Health | Routes medical volunteers to health camps and emergency needs faster |
| **SDG 4** Quality Education | Matches teaching volunteers to learning needs in low-income areas |
| **SDG 10** Reduced Inequalities | Multilingual support — Hindi, Marathi, Tamil, Telugu, Kannada — no one excluded |
| **SDG 17** Partnerships for Goals | Bridges NGOs, individual volunteers, and communities on a shared platform |

---

## 📈 Impact Metrics

| Metric | Definition | Target |
|---|---|---|
| Needs Resolution Rate | % of submitted needs reaching "resolved" | >85% |
| AI Match Accuracy | % of Gemini suggestions accepted by coordinators | >90% |
| Volunteer Response Time | Avg hours from FCM notification → acceptance | <30 min |
| Communities Served | Distinct areas with ≥1 resolved need per month | 25+ |
| Volunteer Retention | % completing 2+ tasks month over month | >70% |
| Language Coverage | Regional languages supported | 6 |

---

## 🗺 Roadmap

```
✅ Phase 0 — Prototype (Current)
   ├── ✅ Flutter web + mobile app
   ├── ✅ Firebase Auth + Firestore + FCM
   ├── ✅ Gemini 1.5 Pro volunteer matching
   ├── ✅ Cloud NL API auto-tagging
   ├── ✅ Cloud Translation API (6 languages)
   ├── ✅ Google Maps SDK
   └── ✅ Looker Studio impact dashboard

🔄 Phase 1 — MVP (Q3 2026)
   ├── 🔄 Play Store + App Store release
   ├── 🔄 Document AI for scanned paper forms
   ├── 🔄 Vision AI certificate verification
   ├── 🔄 WhatsApp Bot (Google Business Messages)
   └── 🔄 Offline-first with Firestore sync

📅 Phase 2 — Scale (Q1 2027)
   ├── 📅 Fine-tuned Vertex AI matching model
   ├── 📅 NGO-to-NGO resource sharing network
   ├── 📅 Government disaster relief API integration
   └── 📅 Multi-city rollout (Mumbai, Delhi, Chennai, Bangalore)

🔮 Phase 3 — Platform (2027+)
   ├── 🔮 National NGO coordination OS
   ├── 🔮 Predictive need forecasting (ML)
   └── 🔮 Open API for third-party NGO tools
```

---

## 🤝 Contributing

### Setup

```bash
git clone https://github.com/YOUR_USERNAME/volunteer-bridge.git
cd volunteer-bridge
git checkout -b feature/your-feature-name
flutter pub get
```

### Commit convention

```
feat:     New feature
fix:      Bug fix
docs:     Documentation only
refactor: Code restructuring
test:     Tests
chore:    Build/tooling changes
```

### PR checklist

- [ ] `flutter test` passes
- [ ] No hardcoded API keys
- [ ] New features include unit tests
- [ ] README updated if needed

---

## 👥 Team

| Name | Role | GitHub |
|---|---|---|
| Mohammad Umar Khan | Team Lead · Full Stack - AI Engineer | [@jonjicjan](https://github.com/jonjicjan) |
| Dev Makil | Flutter · UI/UX | [@dev](https://github.com/devmailk) |
**Institution:** KSIT, Banglore
**GDSC Chapter:** Google Developer Student Club (NULL POINT) — KSIT
**Contact:** codebykhan99@gmail.com

---

## 📄 License

```
MIT License — Copyright (c) 2026 VolunteerBridge Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software to deal in the Software without restriction, including the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, subject to the above copyright notice appearing
in all copies.
```

---

<div align="center">

**Built with ❤️ for Google Solution Challenge 2026 India**

*Powered by Gemini AI · Firebase · Flutter · Google Cloud*

<br/>

[![Star this repo](https://img.shields.io/github/stars/volunteerbridge/volunteer-bridge?style=social)](https://github.com/volunteerbridge/volunteer-bridge)
[![Follow](https://img.shields.io/github/followers/volunteerbridge?style=social)](https://github.com/volunteerbridge)

</div>

# Somnus: Digital Life Architect & Sensory Sanctuary 🌑🎧

> **Philosophy:** "Audio-First, Social-Later."
> **Mission:** To connect "niche souls" through shared sensory experiences, moving from isolation to connection via a "Low Friction, High Discovery" model.

---

## 🏗 System Architecture (The 5 Layers)

Somnus is built on a 5-layer "Engagement Pyramid".

### 1. Layer: "Zero-Look" Shield (Instant Gratification)

*The user instanty achieves isolation without looking at the screen.*

* **Audio-First Entry:** App launches directly into the last used "Shield" (e.g., Midnight Train). No menus, no silence.
* **Tech:** `expo-av` with `Sound` objects.
* **Layered Mixer:**
  * **Base:** Shield Ambience (Brown Noise, Rain - Looping).
  * **Trigger:** Specific ASMR Asset (Vacuum, Fan - Looping).
  * **Interaction:** Voice Chat / Whisper (Overlay).

### 2. Layer: Visual Sanctuary (Atmosphere)

*The environment feels alive and premium.*

* **Cinematic Loops:** 4K video backgrounds (Cloud Rain, Subway Window) via `expo-av` Video component.
* **Breathing UI:** `BreathingLight.tsx` (Reanimated) pulses the screen edge/glow in sync with audio BPM (simulated).
* **Dynamic Assets:** Asset library managed in `SoundManager` and `VideoBackground` components.

### 3. Layer: Intelligent Matchmaking (The Brain) 🧠

*Understanding the user without boring forms.*

* **Passive Onboarding:** `MicroSurvey.tsx` (The Cute Bubble). Minimalist, timed questions ("Does this rain make you nostalgic?").
* **Vector Memory:**
  * **DB:** PostgreSQL with `pgvector` extension.
  * **Schema:** `User` model includes `vibeEmbedding` (Unsupported("vector(1536)")).
  * **Logic:** User preferences + Audio choices -> OpenAI Embeddings -> Vector Store.
* **Frequency Match:**
  * **Endpoint:** `POST /frequency-check`.
  * **Algo:** Cosine Similarity calculation. If > 0.85, finding a "Vibe Twin" triggers a notification.

### 4. Layer: Social Partnership (The Slow Reveal)

*From anonymity to intimacy.*

* **Private Rooms:** Socket.io powered rooms (`join_shield_room`, `join_private_room`).
* **Wingman Service:**
  * **Service:** `server/src/services/wingman.ts`.
  * **AI:** GPT-4o generates "Icebreaker Whispers" based on context (Shield + Time + Shared Interest).
* **Cinematic Reveal (Blur-to-Clear):**
  * **Component:** `FrostedGlassReveal.tsx`.
  * **Visual:** Starts at 95% Blur + Frost Overlay.
  * **Mechanic:** Time spent or Embers burnt reduces blur radius and melts frost.
  * **Tech:** `react-native-reanimated` interpolations.

### 5. Layer: Hearth Economy (Ember System) 🔥

*Monetization driven by value and magic.*

* **Currency:** Ember (🔥).
* **Spends:**
  * **Reveal Boost:** Melt the ice faster.
  * **Dreamscape:** Generate custom AI backgrounds (DALL-E 3).
  * **Gift**: Send a "Warmth" signal.
* **Infrastructure:** RevenueCat integration for IAP.

---

## 🛠 Tech Stack Details

### Client (Mobile)

* **Framework:** React Native (Expo SDK 50+).
* **Language:** TypeScript.
* **Styling:** NativeWind (TailwindCSS).
* **Animation:** `react-native-reanimated` (Crucial for Reveal & Breathing).
* **Audio/Video:** `expo-av`.
* **Blur:** `expo-blur`.

### Server (Backend)

* **Runtime:** Node.js (Express).
* **DB:** PostgreSQL (Railway) with `pgvector` enabled.
* **ORM:** Prisma (modified for vector support).
* **Real-time:** Socket.io (Rooms, Presence, Sync).
* **AI:** OpenAI Node SDK (GPT-4o, DALL-E 3, Embeddings).

---

## 🔌 Key Endpoints (Source of Truth)

### Auth & User

* `GET /users` - List active profiles.
* `PUT /user/:id` - Update preferences (passive survey data).

### Match & Social

* `POST /match-score` - Classic algorithm (Trigger + Tolerance).
* `POST /frequency-check` - **Vector** similarity search.
* `POST /wingman-whisper` - AI Contextual Icebreaker generation.
* `POST /reveal-user` - Secure fetch of clear avatar URL.
* `GET /reveal-match/:id` - Specific detailed reveal.

### Economy

* `POST /burn-ember` - Transaction logging.

### AI Magic

* `POST /vibe-check` - Sentiment analysis -> Shield recommendation.
* `POST /generate-shield` - DALL-E 3 background generation.

---

## 🚀 Deployment Status

* **Backend:** Live on Railway.
* **Database:** Migrated & Seeded.
* **Frontend:** Local Expo Go (Ready for EAS Build).

---

*"We build the silence so they can find the sound."* - Somnus Manifesto

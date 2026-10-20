# AVHII RENT APP — 3D Three.js Studio, Gemini Live Voice & Google Maps Grounding

An integrated suite of immersive technologies bringing real-time multimodal intelligence, interactive 3D spatial visualization, and location-grounded utilities to the AVHII RENT APP ecosystem.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX choices have been synthesized based on your confirmation:

- **Confirmed 3D Scene Architecture**: A dedicated **3D Studio Showcase tab** ("3D Room & Mascot") featuring an interactive 3D procedural Royal Cat Mascot with Greek imperial crown and an isometric room inspection model, paired with a collapsible bottom control dock.
- **Confirmed Gemini Live Voice Assistant**: A full-duplex real-time voice assistant running on `gemini-3.8-live` over a secure WebSocket bridge, enabling hands-free queries about rent dues, meter calculations, and grocery logs in English and Hindi.
- **Confirmed Google Maps Grounding**: An interactive **Nearby Places & Address Navigator** utilizing `gemini-3.8-flash` with the `googleMaps` grounding tool to locate supermarkets (D-Mart, Blinkit, local kirana), electricity board payment centers, and verify room addresses, rendering direct Google Maps links from `groundingChunks`.

---

## 1. Overview & Core Concept

- **What It Does**: Expands **AVHII RENT APP** from a personal rent and expense tracking app into an AI-augmented, visually stunning experience with:
  1. An interactive 3D spatial environment built with Three.js featuring procedural PBR models of the Royal Cat Mascot and isometric apartment layout.
  2. A real-time, low-latency voice companion powered by `gemini-3.8-live` for natural spoken interaction.
  3. A Google Maps-grounded local discovery engine helping tenants find grocery stores, hardware shops, and electricity payment centers near their room.
- **Target Audience / Persona**: Abhishek Ranjan and modern tenants/homeowners seeking a luxury, effortless experience for managing rental living, tracking budgets, and interacting with their records via voice and 3D visualization.
- **Key Value**: Hands-free productivity through real-time voice, spatial clarity through interactive 3D, and real-world utility through verified Maps data.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **3D Interactive Showcase Flow**:
   - The user taps the **3D Studio** tab in the navigation bar.
   - A full-bleed WebGL canvas loads a lit 3D Greek-imperial pedestal.
   - The user interacts with the 3D Royal Cat Mascot and isometric apartment model via damped OrbitControls.
   - Using the collapsible bottom dock, the user switches material finishes (Royal Gold, Marble Ivory, Midnight Obsidian), triggers exploded mechanical/room layers, and adjusts studio lighting.

2. **Gemini Live Real-Time Voice Flow**:
   - The user opens the Voice Assistant modal from the floating mic trigger or top header.
   - The app connects to the `gemini-3.8-live` WebSocket bridge.
   - The user speaks naturally (e.g., *"How much is my pending electricity bill for this month?"* or *"Mera house ration budget kitna bacha hai?"*).
   - Gemini responds in real-time with low-latency spoken audio and transcriptions, providing instant financial answers.

3. **Google Maps Nearby Discovery Flow**:
   - Inside the Ration, Electricity, or Settings tabs, the user clicks **"Find Nearby Stores & Utilities"**.
   - With optional geolocation or room address input, the query runs through Gemini with Google Maps grounding.
   - The UI displays verified places (supermarkets, D-Mart, utility sub-stations) with clickable direct Google Maps URLs, address details, and review highlights.

### Visual Identity & Theme

- **Aesthetic Direction**: Imperial Greek luxury meets cutting-edge procedural technology. Rich gold accents (`#D4AF37`, `#F59E0B`), warm ivory cards (`#FAF8F5`), and obsidian dark mode (`#151412`).
- **Color Palette & Mood**:
  - Dominant Neutral: Ivory Cream (`#FAF8F5`) in light mode; Deep Obsidian (`#151412`, `#1E1C18`) in dark mode.
  - Structural Surfaces: Hairline gold borders (`border-amber-500/25` to `border-amber-500/40`), subtle travertine tones.
  - Accent Budget (10%): Imperial Royal Gold gradient (`from-amber-500 via-amber-400 to-amber-600`), Emerald for settled balances, Crimson for over-budget alerts.
- **Typography & Hierarchy**:
  - Display / Hero / Brand: `Cinzel` serif for imperial dignity and brand typography.
  - Body & UI: `Plus Jakarta Sans` for clean, mobile-first legibility.
  - Numerals & Telemetry: Monospace tabular numerals (`font-mono tabular-nums`) for currency and meter readings.
- **Component Styling & Layout**:
  - Full-width mobile-optimized responsive layout with desktop presence.
  - 3D Viewport maintains 100% unobstructed central area with a bottom dock $\le 15\%$ viewport height.
  - Zero-pill metadata: informational text separated by clean typographic dots (`·`).

---

## 3. Key Product Decisions & Trade-Offs

- **Three.js Implementation (Pure Procedural Geometry vs External GLTF Models)**:
  - *Chosen Approach*: Construct the 3D Royal Cat Mascot and Room Model procedurally using composite `THREE.Group` meshes with `ExtrudeGeometry`, `LatheGeometry`, and PBR `MeshPhysicalMaterial` / `MeshStandardMaterial`.
  - *Why*: Guarantees zero 404 external asset failures in hermetic environments, instant loading with no bandwidth delay, and full runtime control over metallic roughness, gold anisotropy, and exploded-view kinematics.
- **Gemini Live API Architecture (Server WebSocket Bridge)**:
  - *Chosen Approach*: Implement an Express server with a WebSocket endpoint (`/live`) that manages the `ai.live.connect` session using `gemini-3.8-live`. Client streams 16kHz PCM audio and receives 24kHz audio for playback via Web Audio API.
  - *Why*: Required by security architecture (API keys remain exclusively on server) and delivers low-latency bidirectional voice.
- **Google Maps Grounding Integration**:
  - *Chosen Approach*: Server endpoint `/api/maps/search` with `gemini-3.8-flash` and `tools: [{ googleMaps: {} }]`.
  - *Why*: Provides verified place information without hardcoded static lists, extracting live `groundingChunks.maps.uri` for authentic Google Maps navigation.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AVHII RENT APP FRONTEND                         │
│                                                                        │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────────────┐  │
│  │   Navigation    │  │  Voice Assistant │  │   3D Studio Showcase  │  │
│  │ (Tabs / Header) │  │  (Web Audio PCM) │  │ (Three.js WebGL/PBR)  │  │
│  └────────┬────────┘  └────────┬─────────┘  └───────────┬───────────┘  │
│           │                    │                        │              │
│  ┌────────▼────────────────────▼────────────────────────▼───────────┐  │
│  │       State Store (IndexedDB + React State + StorageService)      │  │
│  │       - Rent, Electricity, Expenses, Ration, AppProfile           │  │
│  └─────────────────────────────┬────────────────────────────────────┘  │
└────────────────────────────────┼───────────────────────────────────────┘
                                 │
                   HTTP REST & WebSocket Streaming
                                 │
┌────────────────────────────────▼───────────────────────────────────────┐
│                    FULL-STACK EXPRESS BACKEND (server.ts)              │
│                                                                        │
│  ┌──────────────────────────┐         ┌─────────────────────────────┐  │
│  │   WebSocket /live Bridge │         │   POST /api/maps/search     │  │
│  │   (ai.live.connect)      │         │   (ai.models.generateContent│  │
│  │   Model: gemini-3.8-live │         │   Model: gemini-3.8-flash)  │  │
│  └─────────────┬────────────┘         └──────────────┬──────────────┘  │
│                │                                     │                 │
│                └───────────────────┬─────────────────┘                 │
│                                    │                                   │
│                        @google/genai SDK v2.4.0                        │
│                     (with GEMINI_API_KEY on server)                    │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                Google Cloud
```

### Data Model & State Additions

- **3D Scene State**:
  - `activeFinish`: `'royal-gold'` | `'marble-ivory'` | `'midnight-obsidian'` | `'bronze'`
  - `explodedView`: number (0 to 1, smoothed with exponential damping)
  - `autoRotate`: boolean
  - `sceneMode`: `'mascot'` | `'isometric-room'`
- **Voice Assistant State**:
  - `isConnecting`: boolean
  - `isConnected`: boolean
  - `isSpeaking`: boolean
  - `transcripts`: Array<{ speaker: 'user' | 'model', text: string }>
  - `audioPlaybackQueue`: Float32Array PCM queue for 24kHz playback
- **Maps Grounding State**:
  - `searchQuery`: string
  - `places`: Array<{ title: string, uri: string, address?: string, snippet?: string }>
  - `isLoading`: boolean

### Interactive Component & State Mapping

1. **`ThreeStudioView.tsx`**:
   - Mounts WebGL canvas inside an isolated `useRef` container.
   - Initializes `RoomEnvironment`, `PMREMGenerator`, warm key light + cool hemisphere fill, contact shadow plane.
   - Builds 8-part procedural Royal Cat Mascot (`Group`: head with cat ears, imperial gold crown with 5 points, jewel collar with inscribed ₹ coin, torso, paws, curved tail, pedestal).
   - Builds 10-part isometric apartment layout (`Group`: room floor slab, walls with window cutout, desk, bed, meter box with digital display, table lamp with point light).
   - Collapsible bottom control dock with cinema mode toggle (`▾ Hide Controls`).
2. **`VoiceAssistantModal.tsx`**:
   - Full duplex audio handler capturing mic at 16kHz via `AudioContext` and `ScriptProcessorNode`.
   - Sends base64 PCM over WebSocket.
   - Receives 24kHz chunks and schedules continuous gapless playback using `AudioBufferSourceNode`.
   - Real-time animated speech visualizer with gold soundwaves.
3. **`MapsDiscoveryView.tsx` / `MapsGroundingWidget.tsx`**:
   - Geolocation trigger or text search for nearby amenities.
   - Calls `/api/maps/search` on backend.
   - Renders place cards with live Google Maps links and review badges.
4. **`server.ts`**:
   - Express server hosting Vite middlewares in dev (`vite.middlewares`).
   - Handles WebSocket upgrade on `/live` route connecting to `gemini-3.8-live`.
   - Handles POST `/api/maps/search` connecting to `gemini-3.8-flash` with `{ googleMaps: {} }`.

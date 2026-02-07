# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hotel Concierge AI Chatbot with voice interaction for "Hotel Gołębiewski w Mikołajkach" (Mikołajki, Poland). Built with **Lovable.dev** as a voice-first, multilingual (Polish/English) hotel assistant that integrates with a physical robot via `window.RobotBridge`.

## Build & Development Commands

```bash
npm run dev          # Start Vite dev server on port 8080
npm run build        # Production build (ES2015 target, terser minification)
npm run build:dev    # Development build
npm run lint         # ESLint (TypeScript + React hooks + React refresh)
npm run preview      # Preview production build
```

No test framework is configured.

## Architecture

**Frontend:** React 18 + TypeScript + Vite, with shadcn/ui (Radix) components and TailwindCSS.

**Backend:** Supabase Edge Functions (Deno runtime) handle all AI/voice processing:
- `supabase/functions/hotel-chat/` — Main AI chat logic via Lovable API (sends conversation history + hotel context)
- `supabase/functions/speech-to-text/` — OpenAI Whisper wrapper
- `supabase/functions/text-to-speech/` — OpenAI TTS wrapper
- `supabase/functions/generate-image/` — DALL-E integration
- `supabase/functions/realtime-token/` — Token management

**Data flow:** User speaks → `useAudioRecorder` captures audio → base64 → Supabase `speech-to-text` → transcript → `hotel-chat` with conversation history → response → `useTextToSpeech` plays audio + triggers RobotBridge gestures/lights.

### Key Source Directories

- `src/components/` — App components (`HotelChat`, `VoiceStartButton`, `ChatMessage`, `RestaurantMenu`, `SpaMenu`) + `ui/` subdirectory for shadcn/ui primitives
- `src/hooks/` — `useAudioRecorder` (MediaRecorder + base64 + Whisper), `useTextToSpeech` (TTS + RobotBridge integration), `use-mobile`
- `src/data/hotel-data.json` — Hotel content and AI context (rooms, restaurant, spa, FAQs)
- `src/integrations/supabase/` — Supabase client init and auto-generated types

### View Modes

The app has three views managed by a `currentView` state: `main` (chat), `restaurant` (menu with images), `spa` (services with images).

### RobotBridge API

Components interact with a physical robot via the global `window.RobotBridge` object:
- `performAction(gesture)` — Trigger robot gesture
- `turnLightsOn()` / `turnLightsOff()` — Control lights during speech playback

## Code Conventions

- **Path alias:** `@/` maps to `./src/`
- **TypeScript config is loose:** `noImplicitAny: false`, `strictNullChecks: false` (intentional for Lovable projects)
- **Styling:** Tailwind utility classes; `cn()` helper from `src/lib/utils.ts` for conditional classes; CSS variables (HSL) for theming in `src/index.css`
- **Error messages** displayed to users are in Polish
- **State management:** Local React state (useState/useRef); no global store
- **Data fetching:** Direct `supabase.functions.invoke()` calls (no React Query for Supabase functions)

## Environment Variables

Frontend (in `.env`, prefixed with `VITE_`):
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anon key

Supabase function secrets (configured in Supabase dashboard):
- `OPENAI_API_KEY` — For TTS/STT
- `LOVABLE_API_KEY` — For hotel-chat AI

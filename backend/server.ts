import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { handler as generateImageHandler } from "../supabase/functions/generate-image/index.ts";
import { handler as hotelChatHandler } from "../supabase/functions/hotel-chat/index.ts";
import { handler as realtimeTokenHandler } from "../supabase/functions/realtime-token/index.ts";
import { handler as speechToTextHandler } from "../supabase/functions/speech-to-text/index.ts";
import { handler as textToSpeechHandler } from "../supabase/functions/text-to-speech/index.ts";

type Handler = (req: Request) => Response | Promise<Response>;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const routes: Record<string, Handler> = {
  "/generate-image": generateImageHandler,
  "/hotel-chat": hotelChatHandler,
  "/realtime-token": realtimeTokenHandler,
  "/speech-to-text": speechToTextHandler,
  "/text-to-speech": textToSpeechHandler,
};

function normalizePath(pathname: string): string {
  // Support Supabase-like prefix for easier client migration.
  if (pathname.startsWith("/functions/v1/")) {
    pathname = pathname.slice("/functions/v1".length);
  }
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }
  return pathname;
}

const port = Number(Deno.env.get("PORT") || "8000");

console.log(`[backend] listening on http://0.0.0.0:${port}`);

serve(async (req) => {
  const url = new URL(req.url);
  const path = normalizePath(url.pathname);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (path === "/health") {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const route = routes[path];
  if (!route) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return await route(req);
}, { port });


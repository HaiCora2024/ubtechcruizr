import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const model = Deno.env.get("OPENAI_IMAGE_MODEL") || "gpt-image-1";

    console.log('Generating image with prompt:', prompt);

    // Prefer the GPT Image API. If the org isn't verified / model is unavailable, fall back to DALL-E 3.
    let imageUrl: string | null = null;
    let lastError: string | null = null;

    const tryGenerate = async (m: string): Promise<string> => {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: m,
          prompt,
          size: "1024x1024",
        }),
      });

      const text = await res.text();
      if (!res.ok) {
        throw new Error(text || `OpenAI image API error: ${res.status}`);
      }

      const data = text ? JSON.parse(text) : null;
      const b64 = data?.data?.[0]?.b64_json;
      const url = data?.data?.[0]?.url;

      if (typeof b64 === "string" && b64.length > 0) {
        // Return as a data URL so clients can render without another fetch.
        return `data:image/png;base64,${b64}`;
      }
      if (typeof url === "string" && url.length > 0) {
        return url;
      }
      throw new Error("No image generated");
    };

    try {
      imageUrl = await tryGenerate(model);
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      console.warn(`[generate-image] primary model failed (${model}):`, lastError);
    }

    if (!imageUrl) {
      try {
        imageUrl = await tryGenerate("dall-e-3");
      } catch (e) {
        const fallbackErr = e instanceof Error ? e.message : String(e);
        console.error("[generate-image] fallback model failed (dall-e-3):", fallbackErr);
        throw new Error(lastError ? `${lastError}\n${fallbackErr}` : fallbackErr);
      }
    }

    console.log('Image generated successfully');

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

if (import.meta.main) {
  serve(handler);
}

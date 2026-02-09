import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Fetch current weather for Mikołajki
async function fetchWeather(): Promise<string> {
  const apiKey = Deno.env.get("WEATHER_API_KEY");
  if (!apiKey) {
    console.warn("WEATHER_API_KEY not set, skipping weather data");
    return "";
  }
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=53.8&lon=21.57&units=metric&lang=pl&appid=${apiKey}`
    );
    if (!res.ok) {
      console.error("Weather API error:", res.status);
      return "";
    }
    const w = await res.json();
    const temp = Math.round(w.main.temp);
    const feels = Math.round(w.main.feels_like);
    const desc = w.weather?.[0]?.description || "";
    const wind = Math.round(w.wind?.speed || 0);
    const humidity = w.main?.humidity || 0;
    return `CURRENT WEATHER IN MIKOŁAJKI: ${temp}°C (feels like ${feels}°C), ${desc}, wind ${wind} m/s, humidity ${humidity}%. Use this data when the guest asks about weather.`;
  } catch (e) {
    console.error("Weather fetch failed:", e);
    return "";
  }
}

const hotelData = {
  "context": "Jesteś wirtualnym concierge'em Hotelu Gołębiewski w Mikołajkach. Odpowiadaj profesjonalnie, przyjaźnie i konkretnie. Mów zawsze w języku, w którym użytkownik zadał pytanie. Jeśli nie wiesz — powiedz, że sprawdzisz u menedżera.",
  "faq": [
    {
      "q": "Gdzie znajduje się hotel?",
      "a": "📍 Adres: ul. Mrągowska 34, 11-730 Mikołajki, Polska (Pojezierze Mazurskie)."
    },
    {
      "q": "Jakie są godziny zameldowania i wymeldowania?",
      "a": "🕒 Zameldowanie od 15:00, wymeldowanie do 11:00."
    },
    {
      "q": "Czy w hotelu jest spa?",
      "a": "💆‍♀️ Tak, strefa SPA jest czynna codziennie od 10:00 do 21:00. Goście hotelowi mają 10% zniżki na masaże."
    },
    {
      "q": "Czy jest aquapark?",
      "a": "🏊 Tak! Hotel posiada aquapark Tropikana z basenami, zjeżdżalniami i strefą dla dzieci."
    },
    {
      "q": "Czy można przyjechać z dziećmi?",
      "a": "👨‍👩‍👧‍👦 Tak, dzieci są mile widziane! Dla najmłodszych mamy aquapark Tropikana, kącik zabaw i menu dziecięce."
    },
    {
      "q": "Czy hotel przyjmuje zwierzęta?",
      "a": "🐾 Tak, przyjmujemy małe zwierzęta domowe za dodatkową opłatą 50 PLN za noc."
    },
    {
      "q": "Czy można odwołać rezerwację?",
      "a": "❗ Rezerwacje bezzwrotne nie podlegają zwrotowi. W przypadku rezerwacji elastycznych anulacja jest możliwa do 3 dni przed przyjazdem."
    },
    {
      "q": "Jak dojechać do hotelu?",
      "a": "🚗 Hotel znajduje się przy ul. Mrągowskiej 34 w Mikołajkach, nad jeziorem Mikołajskim. Dojazd samochodem, autobusem lub transferem z dworca w Mrągowie."
    },
    {
      "q": "Czy jest dostępne Wi-Fi?",
      "a": "📶 Tak, darmowe Wi-Fi jest dostępne w całym obiekcie."
    },
    {
      "q": "Czy można płacić kartą?",
      "a": "💳 Tak, akceptujemy wszystkie główne karty płatnicze, w tym Visa, Mastercard i Revolut."
    },
    {
      "q": "Jakie atrakcje są w pobliżu?",
      "a": "⛵ Rejsy po jeziorach mazurskich, centrum Mikołajek (10 min pieszo), szlaki rowerowe i kajakowe, aquapark Tropikana w hotelu."
    },
    {
      "q": "Czy jest parking?",
      "a": "🅿️ Tak, bezpłatny parking dla gości znajduje się tuż przy wejściu."
    }
  ]
};

export async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Build system instructions from hotel data
    const faqText = hotelData.faq
      .map((item: any) => `Q: ${item.q}\nA: ${item.a}`)
      .join('\n\n');

    // Fetch real-time weather
    const weatherInfo = await fetchWeather();

    const instructions = `${hotelData.context}\n\nFAQ:\n${faqText}${weatherInfo ? `\n\n${weatherInfo}` : ""}\n\nCRITICAL LANGUAGE RULE: You MUST detect the language the user speaks and ALWAYS reply in that SAME language. If the guest speaks English — answer in English. Russian — answer in Russian. German — in German. Never default to Polish if the guest speaks another language. Supported: pl, en, ru, de, cs, uk, fr. Be EXTREMELY concise and brief - answer in 1-2 short sentences maximum. Get straight to the point without unnecessary words or explanations.`;

    console.log('Creating ephemeral token for Realtime API');

    // Request ephemeral token from OpenAI
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "alloy",
        instructions: instructions,
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: {
          model: "whisper-1"
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 1000
        },
        temperature: 0.8
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Ephemeral token created successfully");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error creating token:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

if (import.meta.main) {
  serve(handler);
}

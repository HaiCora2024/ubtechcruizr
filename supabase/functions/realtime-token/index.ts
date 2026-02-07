import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const hotelData = {
  "context": "Jesteś wirtualnym concierge'em Hotelu Gołębiewski w Mikołajkach. Odpowiadaj profesjonalnie, przyjaźnie i konkretnie. Mów zawsze w języku, w którym użytkownik zadał pytanie. Jeśli nie wiesz — powiedz, że sprawdzisz u menedżera.",
  "faq": [
    {
      "q": "Gdzie znajduje się hotel?",
      "a": "📍 Adres: ul. Górska 15, 34-500 Zakopane, Polska. Link do mapy: https://maps.app.goo.gl/exampleHotel"
    },
    {
      "q": "Jakie są godziny zameldowania i wymeldowania?",
      "a": "🕒 Zameldowanie od 14:00, wymeldowanie do 11:00."
    },
    {
      "q": "Czy w hotelu jest spa?",
      "a": "💆‍♀️ Tak, strefa SPA jest czynna codziennie od 10:00 do 21:00. Goście hotelowi mają 10% zniżki na masaże."
    },
    {
      "q": "Czy można przyjechać z dziećmi?",
      "a": "👨‍👩‍👧‍👦 Tak, dzieci są mile widziane! Dla najmłodszych przygotowaliśmy kącik zabaw i menu dziecięce."
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
      "a": "🚗 Hotel znajduje się 2 km od centrum Zakopanego. Można do nas dojechać taksówką, autobusem lub zamówić transfer z dworca."
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
      "a": "🎿 W pobliżu znajdują się Krupówki (15 min pieszo), kolejka na Gubałówkę i Termy Chochołowskie (30 min jazdy)."
    },
    {
      "q": "Czy jest parking?",
      "a": "🅿️ Tak, bezpłatny parking dla gości znajduje się tuż przy wejściu."
    }
  ]
};

serve(async (req) => {
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
    
    const instructions = `${hotelData.context}\n\nFAQ:\n${faqText}\n\nIMPORTANT: Always respond in the same language as the user speaks. Detect the language and answer in that exact language. Be EXTREMELY concise and brief - answer in 1-2 short sentences maximum. Get straight to the point without unnecessary words or explanations.`;

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
});

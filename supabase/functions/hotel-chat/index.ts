import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Fetch current weather for Mikołajki (cached for the request)
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
    return `AKTUALNA POGODA W MIKOŁAJKACH: ${temp}°C (odczuwalna ${feels}°C), ${desc}, wiatr ${wind} m/s, wilgotność ${humidity}%. Użyj tych danych, gdy gość pyta o pogodę.`;
  } catch (e) {
    console.error("Weather fetch failed:", e);
    return "";
  }
}

const hotelData = {
  context:
    "Jesteś wirtualnym concierge'em Hotelu Gołębiewski w Mikołajkach. Odpowiadaj profesjonalnie, przyjaźnie i konkretnie. Mów zawsze w języku, w którym użytkownik zadał pytanie. Jeśli nie wiesz — powiedz, że sprawdzisz u menedżera.",

  rooms: [
    {
      type: "Standard",
      price: "350 PLN/noc",
      description: "Przytulny pokój z widokiem na jezioro, łóżko double/twin, łazienka z prysznicem, Wi-Fi, TV",
      amenities: ["Wi-Fi", "TV", "Sejf", "Czajnik", "Widok na jezioro"],
    },
    {
      type: "Superior",
      price: "500 PLN/noc",
      description: "Przestronny pokój z balkonem, king-size bed, łazienka z wanną, szlafrok i kapcie, minibar",
      amenities: ["Wi-Fi", "TV", "Sejf", "Minibar", "Balkon", "Wanna", "Szlafrok"],
    },
    {
      type: "Suite",
      price: "800 PLN/noc",
      description: "Luksusowy apartament z salonem, sypialnią, jacuzzi, widok panoramiczny na Mazury",
      amenities: ["Wi-Fi", "TV", "Minibar", "Jacuzzi", "Salon", "Widok panoramiczny", "Szlafrok premium"],
    },
  ],

  restaurant: {
    name: "Restauracja Gołębiewski",
    hours: "7:00-22:00",
    breakfast: {
      time: "7:00-10:30",
      price: "60 PLN/osoba",
      description:
        "Bogaty bufet śniadaniowy: jajecznica, naleśniki, wędliny regionalne, sery, owoce, świeże pieczywo, kawa, herbata, soki",
    },
    lunch: {
      time: "12:00-16:00",
      menu: [
        "Zupa rybna mazurska - 28 PLN",
        "Kartacze z mięsem - 35 PLN",
        "Pstrąg z grilla z warzywami - 45 PLN",
        "Sałatka Caesar z kurczakiem - 32 PLN",
      ],
    },
    dinner: {
      time: "18:00-22:00",
      specials: [
        "Stek wołowy z frytkami i sosem pieprzowym - 78 PLN",
        "Sielawa smażona z ziemniakami - 55 PLN",
        "Łosoś pieczony z ryżem i szparagami - 68 PLN",
        "Pierogi ruskie/mięsne/z serem i truskawkami - 28 PLN",
        "Placek po mazursku - 18 PLN",
      ],
    },
    drinks: "Wina regionalne, piwo Żywiec, kawa Lavazza, herbaty premium",
  },

  spa: {
    name: "Gołębiewski SPA & Wellness",
    hours: "10:00-21:00",
    facilities: [
      "Basen z hydromasażem (10:00-21:00)",
      "Sauna sucha (10:00-21:00)",
      "Sauna parowa (10:00-21:00)",
      "Jacuzzi (10:00-21:00)",
      "Strefa relaksu z leżakami",
    ],
    treatments: [
      {
        name: "Masaż relaksacyjny całego ciała",
        duration: "60 min",
        price: "250 PLN",
        discount: "225 PLN (10% dla gości hotelowych)",
      },
      {
        name: "Masaż gorącymi kamieniami",
        duration: "90 min",
        price: "350 PLN",
        discount: "315 PLN (10% dla gości hotelowych)",
      },
      {
        name: "Masaż aromaterapeutyczny",
        duration: "60 min",
        price: "280 PLN",
        discount: "252 PLN (10% dla gości hotelowych)",
      },
      {
        name: "Peeling ciała + masaż",
        duration: "90 min",
        price: "320 PLN",
        discount: "288 PLN (10% dla gości hotelowych)",
      },
      {
        name: "Zabieg na twarz anti-aging",
        duration: "60 min",
        price: "200 PLN",
        discount: "180 PLN (10% dla gości hotelowych)",
      },
    ],
    packages: [
      {
        name: "Pakiet Relax Weekend",
        includes: "2 noclegi + śniadania + 1 masaż 60 min + wstęp do SPA",
        price: "1200 PLN/2 osoby",
      },
      {
        name: "Pakiet Romantyczny",
        includes: "1 noc + kolacja przy świecach + masaż dla pary + szampan",
        price: "900 PLN/2 osoby",
      },
    ],
  },

  faq: [
    {
      q: "Gdzie znajduje się hotel?",
      a: "📍 Adres: ul. Mrągowska 34, 11-730 Mikołajki, Polska (Pojezierze Mazurskie).",
    },
    {
      q: "Jakie są godziny zameldowania i wymeldowania?",
      a: "🕒 Zameldowanie od 15:00, wymeldowanie do 11:00.",
    },
    {
      q: "Czy w hotelu jest spa?",
      a: "💆‍♀️ Tak, strefa SPA jest czynna codziennie od 10:00 do 21:00. Goście hotelowi mają 10% zniżki na masaże.",
    },
    {
      q: "Czy jest akvpark?",
      a: "🏊 Tak! Hotel posiada aquapark Tropikana z basenami, zjeżdżalniami i strefą dla dzieci.",
    },
    {
      q: "Czy można przyjechać z dziećmi?",
      a: "👨‍👩‍👧‍👦 Tak, dzieci są mile widziane! Dla najmłodszych mamy aquapark Tropikana, kącik zabaw i menu dziecięce.",
    },
    {
      q: "Czy hotel przyjmuje zwierzęta?",
      a: "🐾 Tak, przyjmujemy małe zwierzęta domowe za dodatkową opłatą 50 PLN za noc.",
    },
    {
      q: "Czy można odwołać rezerwację?",
      a: "❗ Rezerwacje bezzwrotne nie podlegają zwrotowi. W przypadku rezerwacji elastycznych anulacja jest możliwa do 3 dni przed przyjazdem.",
    },
    {
      q: "Jak dojechać do hotelu?",
      a: "🚗 Hotel znajduje się przy ul. Mrągowskiej 34 w Mikołajkach, nad jeziorem Mikołajskim. Dojazd samochodem, autobusem lub transferem z dworca w Mrągowie.",
    },
    {
      q: "Czy jest dostępne Wi-Fi?",
      a: "📶 Tak, darmowe Wi-Fi jest dostępne w całym obiekcie.",
    },
    {
      q: "Czy można płacić kartą?",
      a: "💳 Tak, akceptujemy wszystkie główne karty płatnicze, w tym Visa, Mastercard i Revolut.",
    },
    {
      q: "Jakie atrakcje są w pobliżu?",
      a: "⛵ Rejsy po jeziorach mazurskich, centrum Mikołajek (10 min pieszo), szlaki rowerowe i kajakowe, aquapark Tropikana w hotelu.",
    },
    {
      q: "Czy jest parking?",
      a: "🅿️ Tak, bezpłatny parking dla gości znajduje się tuż przy wejściu.",
    },
  ],
};

export async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history = [] } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
    const model = Deno.env.get("OPENAI_CHAT_MODEL") || "gpt-4.1-mini";

    // Build FAQ context
    const faqText = hotelData.faq.map((item: any) => `Q: ${item.q}\nA: ${item.a}`).join("\n\n");

    // Build rooms info
    const roomsInfo = hotelData.rooms
      .map(
        (room: any) => `${room.type}: ${room.price}\n${room.description}\nUdogodnienia: ${room.amenities.join(", ")}`,
      )
      .join("\n\n");

    // Build restaurant info
    const restaurantInfo = `
RESTAURACJA "${hotelData.restaurant.name}"
Godziny: ${hotelData.restaurant.hours}

ŚNIADANIA (${hotelData.restaurant.breakfast.time}): ${hotelData.restaurant.breakfast.price}
${hotelData.restaurant.breakfast.description}

LUNCH (${hotelData.restaurant.lunch.time}):
${hotelData.restaurant.lunch.menu.join("\n")}

KOLACJA (${hotelData.restaurant.dinner.time}):
${hotelData.restaurant.dinner.specials.join("\n")}

Napoje: ${hotelData.restaurant.drinks}`;

    // Build SPA info
    const spaFacilities = hotelData.spa.facilities.join("\n");
    const spaTreatments = hotelData.spa.treatments
      .map((t: any) => `${t.name} (${t.duration}): ${t.price} → ${t.discount}`)
      .join("\n");
    const spaPackages = hotelData.spa.packages.map((p: any) => `${p.name}: ${p.includes} - ${p.price}`).join("\n");

    const spaInfo = `
SPA "${hotelData.spa.name}"
Godziny: ${hotelData.spa.hours}

UDOGODNIENIA:
${spaFacilities}

ZABIEGI (10% zniżki dla gości):
${spaTreatments}

PAKIETY:
${spaPackages}`;

    // Compact system prompt
    const systemPrompt = `${hotelData.context}

POKOJE: ${hotelData.rooms.map((r: any) => `${r.type} (${r.price})`).join(", ")}

RESTAURACJA (${hotelData.restaurant.hours}):
Śniadanie ${hotelData.restaurant.breakfast.time}: ${hotelData.restaurant.breakfast.price}
Lunch: ${hotelData.restaurant.lunch.menu.join("; ")}
Kolacja: ${hotelData.restaurant.dinner.specials.join("; ")}

SPA (${hotelData.spa.hours}):
${hotelData.spa.treatments.map((t: any) => `${t.name} ${t.duration}: ${t.discount}`).join("; ")}
Pakiety: ${hotelData.spa.packages.map((p: any) => `${p.name} ${p.price}`).join("; ")}

FAQ: ${faqText}

JĘZYK: ZAWSZE odpowiadaj W TYM SAMYM JĘZYKU, w którym mówi użytkownik. Jeśli mówi po angielsku — odpowiadaj po angielsku. Po rosyjsku — po rosyjsku. Po niemiecku — po niemiecku. Automatycznie dopasuj się do języka gościa. Obsługiwane języki: pl, en, ru, de, cs, uk, fr.

FORMAT JSON (bez markdown):
{"text": "odpowiedź", "gesture": "nazwa", "emotion": "emocja"}

GESTY: swingarm (przywitanie), goodbye, nod (zgoda), celebrate (radość), hug (spa), shankhand (umowa), guideright/guideleft (kierunki), searching (sprawdzanie), surprise, shy, fadai (myślenie), applause, talk1-8

ZACHOWANIE: Profesjonalny concierge. Używaj konkretnych danych (ceny, nazwy). Symuluj rezerwacje (RES-2025-XXXX). Sugeruj dodatkowe usługi.`;

    // Fetch real-time weather
    const weatherInfo = await fetchWeather();
    const systemPromptFinal = weatherInfo
      ? `${systemPrompt}\n\n${weatherInfo}`
      : systemPrompt;

    console.log("Sending request to AI with message:", message);
    console.log("Conversation history length:", history.length);

    const allowedRoles = new Set(["system", "user", "assistant", "developer"]);
    const safeHistory = Array.isArray(history)
      ? history
          .filter((m: any) => m && typeof m === "object")
          .filter((m: any) => typeof m.role === "string" && allowedRoles.has(m.role))
          .filter((m: any) => typeof m.content === "string" && m.content.length > 0)
          .map((m: any) => ({ role: m.role, content: m.content }))
      : [];

    // Call OpenAI Chat Completions
    const baseRequestBody = {
      model,
      messages: [{ role: "system", content: systemPromptFinal }, ...safeHistory, { role: "user", content: message }],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "hotel_chat_response",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              text: { type: "string" },
              gesture: { type: "string" },
              emotion: { type: "string" },
            },
            required: ["text", "gesture", "emotion"],
          },
        },
      },
      temperature: 0.3,
    };

    const doRequest = async (body: unknown) =>
      await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

    let requestBody: any = baseRequestBody;
    let response = await doRequest(requestBody);

    let errorText: string | null = null;
    let retriedWithoutJsonSchema = false;
    let retriedWithoutTemperature = false;

    // Some models reject specific params (e.g. temperature or json_schema). Retry once per mitigation.
    for (let i = 0; i < 2 && !response.ok; i++) {
      errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);

      // Some models (notably reasoning/realtime variants) only support default temperature=1.
      if (
        response.status === 400 &&
        !retriedWithoutTemperature &&
        /unsupported_value/i.test(errorText) &&
        /"param"\s*:\s*"temperature"|temperature.*Only the default/i.test(errorText)
      ) {
        console.warn("[hotel-chat] retrying without temperature");
        retriedWithoutTemperature = true;
        const { temperature: _t, ...rest } = requestBody;
        requestBody = rest;
        response = await doRequest(requestBody);
        continue;
      }

      // Some models may not support JSON Schema structured outputs. Retry with plain JSON mode.
      if (response.status === 400 && !retriedWithoutJsonSchema && /response_format|json_schema/i.test(errorText)) {
        console.warn("[hotel-chat] retrying without json_schema response_format");
        retriedWithoutJsonSchema = true;
        response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...requestBody,
            response_format: { type: "json_object" },
          }),
        });
        if (response.ok) errorText = null;
        continue;
      }
      break;
    }

    if (!response.ok) {
      const err = errorText ?? (await response.text());

      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            message: "Przepraszam, zbyt wiele zapytań. Spróbuj za chwilę.",
            gesture: "shy",
            emotion: "apologetic",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            message: "Przepraszam, tymczasowy problem techniczny. Skontaktuj się z recepcją.",
            gesture: "fadai",
            emotion: "concerned",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      console.error("OpenAI API error:", response.status, err);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Parse JSON response
    let parsedResponse;
    try {
      // Clean markdown code blocks if present
      aiResponse = aiResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsedResponse = JSON.parse(aiResponse);
    } catch (e) {
      console.error("Failed to parse JSON, using fallback:", e);
      console.error("Raw response:", aiResponse);
      // Fallback to plain text response
      parsedResponse = {
        text: aiResponse,
        gesture: "talk1",
        emotion: "neutral",
      };
    }

    console.log("AI response:", parsedResponse);

    return new Response(
      JSON.stringify({
        message: parsedResponse.text || parsedResponse.message || aiResponse,
        gesture: parsedResponse.gesture || "talk1",
        emotion: parsedResponse.emotion || "neutral",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in hotel-chat function:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";

    // User-friendly error response
    return new Response(
      JSON.stringify({
        message: "Przepraszam, wystąpił problem. Proszę spróbować ponownie.",
        gesture: "shy",
        emotion: "apologetic",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
}

if (import.meta.main) {
  serve(handler);
}

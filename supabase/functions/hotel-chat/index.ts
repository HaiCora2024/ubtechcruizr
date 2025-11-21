import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const hotelData = {
  context:
    "Jesteś wirtualnym concierge'em Hotelu Panorama & Spa w Zakopanem. Odpowiadaj profesjonalnie, przyjaźnie i konkretnie. Mów zawsze w języku, w którym użytkownik zadał pytanie. Jeśli nie wiesz — powiedz, że sprawdzisz u menedżera.",

  rooms: [
    {
      type: "Standard",
      price: "350 PLN/noc",
      description: "Przytulny pokój z widokiem na góry, łóżko double/twin, łazienka z prysznicem, Wi-Fi, TV",
      amenities: ["Wi-Fi", "TV", "Sejf", "Czajnik", "Widok na góry"],
    },
    {
      type: "Superior",
      price: "500 PLN/noc",
      description: "Przestronny pokój z balkonem, king-size bed, łazienka z wanną, халат i kapcie, minibar",
      amenities: ["Wi-Fi", "TV", "Sejf", "Minibar", "Balkon", "Wanna", "Халаты"],
    },
    {
      type: "Suite",
      price: "800 PLN/noc",
      description: "Luksusowy apartament z salonem, sypialnią, jacuzzi, widok panoramiczny na Tatry",
      amenities: ["Wi-Fi", "TV", "Minibar", "Jacuzzi", "Salon", "Widok panoramiczny", "Халаты premium"],
    },
  ],

  restaurant: {
    name: "Restauracja Tatrzańska",
    hours: "7:00-22:00",
    breakfast: {
      time: "7:00-10:30",
      price: "60 PLN/osoba",
      description:
        "Bogaty bufet śniadaniowy: jajecznica, naleśniki, wędliny regionalne, sery oscypek, owoce, świeże pieczywo, kawa, herbata, soki",
    },
    lunch: {
      time: "12:00-16:00",
      menu: [
        "Żurek tatrzański w chlebie - 28 PLN",
        "Placki ziemniaczane z gulaszem - 35 PLN",
        "Pstrąg z grilla z warzywami - 45 PLN",
        "Sałatka Caesar z kurczakiem - 32 PLN",
      ],
    },
    dinner: {
      time: "18:00-22:00",
      specials: [
        "Stek wołowy z frytkami i sosem pieprzowym - 78 PLN",
        "Karkówka po góralsku z oscypkiem - 55 PLN",
        "Łosoś pieczony z ryżem i szparagami - 68 PLN",
        "Pierogi ruskie/mięsne/z serem i truskawkami - 28 PLN",
        "Sernik zakopański - 18 PLN",
      ],
    },
    drinks: "Wina regionalne, piwo Żywiec, kawa Lavazza, herbaty premium",
  },

  spa: {
    name: "Panorama SPA & Wellness",
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
      a: "📍 Adres: ul. Górska 15, 34-500 Zakopane, Polska. Link do mapy: https://maps.app.goo.gl/exampleHotel",
    },
    {
      q: "Jakie są godziny zameldowania i wymeldowania?",
      a: "🕒 Zameldowanie od 14:00, wymeldowanie do 11:00.",
    },
    {
      q: "Czy w hotelu jest spa?",
      a: "💆‍♀️ Tak, strefa SPA jest czynna codziennie od 10:00 do 21:00. Goście hotelowi mają 10% zniżki na masaże.",
    },
    {
      q: "Czy można przyjechać z dziećmi?",
      a: "👨‍👩‍👧‍👦 Tak, dzieci są mile widziane! Dla najmłodszych przygotowaliśmy kącik zabaw i menu dziecięce.",
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
      a: "🚗 Hotel znajduje się 2 km od centrum Zakopanego. Można do nas dojechać taksówką, autobusem lub zamówić transfer z dworca.",
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
      a: "🎿 W pobliżu znajdują się Krupówki (15 min pieszo), kolejka na Gubałówkę i Termy Chochołowskie (30 min jazdy).",
    },
    {
      q: "Czy jest parking?",
      a: "🅿️ Tak, bezpłatny parking dla gości znajduje się tuż przy wejściu.",
    },
  ],
};

serve(async (req) => {
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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

    // Enhanced system prompt with gesture instructions
    const systemPrompt = `${hotelData.context}

=== INFORMACJE O HOTELU ===

POKOJE:
${roomsInfo}

${restaurantInfo}

${spaInfo}

FAQ:
${faqText}

=== INSTRUKCJE DOTYCZĄCE JĘZYKA ===
- ZAWSZE odpowiadaj w tym samym języku, w którym użytkownik zadał pytanie
- Wykryj język: polski (pl), angielski (en), rosyjski (ru), niemiecki (de), czeski (cs)
- Jeśli język niejasny - użyj polskiego

=== INSTRUKCJE DOTYCZĄCE GESTÓW ===
Odpowiedź ZAWSZE w formacie JSON (ale bez markdown code blocks!):
{
  "text": "Twoja odpowiedź w odpowiednim języku",
  "gesture": "nazwa_gestu",
  "emotion": "emocja"
}

DOSTĘPNE GESTY:
- "swingarm" - przywitanie, machanie ręką
- "goodbye" - pożegnanie
- "nod" - potwierdzenie, zgoda, kiwanie głową
- "celebrate" - radość, gratulacje, sukces
- "hug" - ciepłe przyjęcie, relaks, spa
- "shankhand" - uścisk dłoni, umowa
- "guideright" - wskazanie w prawo, pokazanie kierunku
- "guideleft" - wskazanie w lewo, pokazanie kierunku
- "searching" - szukanie, sprawdzanie informacji
- "tiaowang" - patrzenie w dal, planowanie
- "surprise" - zaskoczenie, wow
- "shy" - delikatność, intymność, spa
- "fadai" - zastanawianie się, myślenie
- "applause" - podziw, uznanie
- "talk1", "talk2", "talk3", "talk5", "talk8" - standardowa rozmowa

KONTEKSTOWE UŻYCIE GESTÓW:
1. **Przywitanie** → "swingarm"
2. **Pożegnanie** → "goodbye"
3. **Potwierdzenie rezerwacji** → "nod" + "celebrate"
4. **Kierunki - prawo** → "guideright"
5. **Kierunki - lewo** → "guideleft"
6. **Sprawdzanie info** → "searching" + "fadai"
7. **SPA/Relaks** → "hug" lub "shy"
8. **Pozytywne emocje** → "celebrate" lub "surprise"
9. **Standardowa rozmowa** → "talk1", "talk2", "talk3"
10. **Umowa/Zgoda** → "shankhand"

=== ZACHOWANIE CONCIERGE'A ===
- Bądź ciepły, profesjonalny i pomocny
- Używaj KONKRETNYCH danych z bazy (ceny, nazwy dań, zabiegi SPA)
- Symuluj działania realistycznie:
  * "Sprawdzam dostępność w systemie..."
  * "Rezerwuję dla Państwa pokój Superior na 15-17 marca..."
  * "Potwierdzam rezerwację numer RES-2025-1234..."
- Przy pytaniach o menu - wymień KONKRETNE dania z cenami
- Przy pytaniach o SPA - wymień KONKRETNE zabiegi z cenami i czasem
- Przy rezerwacjach - podaj KONKRETNY numer rezerwacji (format: RES-2025-XXXX)
- Sugeruj dodatkowe usługi: "Może zainteresuje Państwa also..."

PRZYKŁADY ODPOWIEDZI:

USER: "Can you book a room for March 15-17?"
RESPONSE: {
  "text": "Of course! Let me check availability... Perfect! I can reserve a Superior room for you from March 15-17 (2 nights). The total cost is 1000 PLN. Your reservation number is RES-2025-4521. Would you also like to book breakfast (60 PLN/person/day)?",
  "gesture": "searching",
  "emotion": "professional"
}

USER: "Co jest na obiad?"
RESPONSE: {
  "text": "W menu lunchowym mamy dziś: Żurek tatrzański w chlebie (28 PLN), Placki ziemniaczane z gulaszem (35 PLN), Pstrąg z grilla z warzywami (45 PLN) oraz Sałatkę Caesar (32 PLN). Polecam pstrąga - świeży, lokalny! Lunch serwujemy od 12:00 do 16:00.",
  "gesture": "talk2",
  "emotion": "friendly"
}

USER: "Tell me about SPA treatments"
RESPONSE: {
  "text": "Our Panorama SPA offers wonderful treatments! Most popular: Relaxing full-body massage (60 min, 225 PLN with 10% hotel guest discount), Hot stone massage (90 min, 315 PLN), and Anti-aging facial (60 min, 180 PLN). We're open 10:00-21:00. Would you like me to book a treatment for you?",
  "gesture": "hug",
  "emotion": "calm"
}

USER: "Gdzie jest restauracja?"
RESPONSE: {
  "text": "Restauracja Tatrzańska znajduje się na parterze, po prawej stronie od recepcji. Otwarta codziennie 7:00-22:00. Śniadania serwujemy do 10:30. Zapraszam!",
  "gesture": "guideright",
  "emotion": "helpful"
}

WAŻNE:
- ZAWSZE odpowiadaj JSON (bez \`\`\`json\`\`\`)
- ZAWSZE używaj języka użytkownika
- ZAWSZE dobieraj gest do kontekstu
- ZAWSZE podawaj konkretne dane (ceny, godziny, nazwy)
- Symuluj realistycznie rezerwacje z numerami
- Sugeruj dodatkowe usługi`;

    console.log("Sending request to AI with message:", message);
    console.log("Conversation history length:", history.length);

    // Call Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: message }],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);

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

      throw new Error(`AI API error: ${response.status}`);
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
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const hotelData = {
  context:
    "Jesteś wirtualnym concierge'em Hotelu Panorama & Spa w Zakopanem. Odpowiadaj profesjonalnie, przyjaźnie i konkretnie. Mów zawsze w języku, w którym użytkownik zadał pytanie. Jeśli nie wiesz — powiedz, że sprawdzisz u menedżera.",
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
    const { message } = await req.json();

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

    // Enhanced system prompt with gesture instructions
    const systemPrompt = `${hotelData.context}

FAQ WIEDZA HOTELOWA:
${faqText}

KRYTYCZNE INSTRUKCJE DOTYCZĄCE JĘZYKA:
- ABSOLUTNIE ZAWSZE odpowiadaj WYŁĄCZNIE w tym samym języku, którym użytkownik napisał wiadomość
- NIGDY nie zmieniaj języka odpowiedzi
- Jeśli użytkownik pisze po polsku → odpowiadaj po polsku
- Jeśli użytkownik pisze po angielsku → odpowiadaj po angielsku  
- Jeśli użytkownik pisze po rosyjsku → odpowiadaj po rosyjsku
- Jeśli użytkownik pisze po niemiecku → odpowiadaj po niemiecku
- Jeśli użytkownik pisze po czesku → odpowiadaj po czesku
- To jest NAJWAŻNIEJSZA zasada - język odpowiedzi = język pytania

INSTRUKCJE DOTYCZĄCE GESTÓW:
Odpowiedź ZAWSZE w formacie JSON:
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
1. **Przywitanie** → "swingarm" (machaj ręką)
   PL: "Witam w Hotelu Panorama!"
   EN: "Welcome to Hotel Panorama!"
   
2. **Pożegnanie** → "goodbye"
   PL: "Do zobaczenia! Zapraszamy ponownie!"
   EN: "Goodbye! See you again!"

3. **Potwierdzenie rezerwacji** → "nod" + "celebrate"
   PL: "Oczywiście! Rezerwuję dla Państwa pokój..."
   EN: "Of course! I'm booking a room for you..."

4. **Kierunki - prawo** → "guideright" (pokazuj ręką!)
   PL: "Restauracja znajduje się po prawej stronie"
   EN: "The restaurant is on the right"

5. **Kierunki - lewo** → "guideleft"
   PL: "SPA jest po lewej stronie"
   EN: "The SPA is on the left"

6. **Sprawdzanie info** → "searching" + "fadai"
   PL: "Chwileczkę, sprawdzam dostępność..."
   EN: "One moment, checking availability..."

7. **SPA/Relaks** → "hug" lub "shy"
   PL: "Strefa SPA zaprasza do relaksu..."
   EN: "The SPA area invites you to relax..."

8. **Pozytywne emocje** → "celebrate" lub "surprise"
   PL: "Świetny wybór! Doskonała decyzja!"
   EN: "Excellent choice! Great decision!"

9. **Standardowa rozmowa** → "talk1", "talk2", "talk3"
   PL: "Hotel oferuje..."
   EN: "The hotel offers..."

10. **Umowa/Zgoda** → "shankhand"
    PL: "Zgoda! Potwierdzam rezerwację."
    EN: "Agreed! Confirming the reservation."

ZACHOWANIE CONCIERGE'A:
- Bądź ciepły, profesjonalny i pomocny
- Używaj emoji oszczędnie (tylko w FAQ)
- Symuluj działania: "Sprawdzam...", "Rezerwuję...", "Potwierdzam..."
- Nie mów "nie wiem" - zawsze oferuj pomoc: "Sprawdzę to dla Państwa"
- Przy pytaniach o dostępność: "Chwileczkę, sprawdzam system rezerwacji..."
- Przy rezerwacjach: "Doskonale! Rezerwuję dla Państwa [szczegóły]..."

PRZYKŁADY ODPOWIEDZI:

USER: "Hello, how can I book a room?"
RESPONSE: {
  "text": "Hello! I'd be happy to help you book a room. Let me check our availability right now...",
  "gesture": "swingarm",
  "emotion": "friendly"
}

USER: "Gdzie jest restauracja?"
RESPONSE: {
  "text": "Restauracja znajduje się na parterze, po prawej stronie od recepcji. Zapraszamy!",
  "gesture": "guideright",
  "emotion": "helpful"
}

USER: "Czy mogę zarezerwować pokój?"
RESPONSE: {
  "text": "Oczywiście! Z przyjemnością zarezerwuję dla Państwa pokój. Proszę chwileczkę, sprawdzam dostępność w systemie...",
  "gesture": "searching",
  "emotion": "professional"
}

USER: "Thank you!"
RESPONSE: {
  "text": "You're very welcome! Have a wonderful stay at Hotel Panorama!",
  "gesture": "celebrate",
  "emotion": "happy"
}

USER: "Спасибо"
RESPONSE: {
  "text": "Пожалуйста! Приятного отдыха в отеле Panorama!",
  "gesture": "nod",
  "emotion": "warm"
}

WAŻNE:
- ZAWSZE odpowiadaj JSON
- ZAWSZE używaj języka użytkownika
- ZAWSZE dobieraj gest do kontekstu
- Bądź naturalny i ciepły`;

    console.log("Sending request to AI with message:", message);

    // Call Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const hotelData = {
  "context": "Jesteś wirtualnym concierge'em Hotelu Panorama & Spa w Zakopanem. Odpowiadaj profesjonalnie, przyjaźnie i konkretnie. Mów zawsze w języku, w którym użytkownik zadał pytanie. Jeśli nie wiesz — powiedz, że sprawdzisz u menedżera.",
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
    const { message } = await req.json();
    
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build system prompt from hotel data
    const faqText = hotelData.faq
      .map((item: any) => `Q: ${item.q}\nA: ${item.a}`)
      .join('\n\n');
    
    const systemPrompt = `${hotelData.context}\n\nFAQ:\n${faqText}\n\nIMPORTANT: Always respond in the same language as the user's message. Detect the language of the user's question and answer in that exact language.`;

    console.log('Sending request to AI with message:', message);

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limit przekroczony, spróbuj ponownie później.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Wymagana płatność. Skontaktuj się z administratorem.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'Przepraszam, nie mogłem odpowiedzieć.';

    console.log('AI response:', aiResponse);

    return new Response(
      JSON.stringify({ message: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in hotel-chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { message, liveData, type } = await req.json();
    const key = process.env.GROQ_API_KEY;

    if (!key) {
      return NextResponse.json({ success: false, error: 'API key not configured' });
    }

    let systemPrompt;
    if (type === 'summary') {
      systemPrompt = `You are writing a professional executive summary for VERDANT 360, an urban climate dashboard focused on Manhattan, NYC. 
Use the live telemetry data to write a 3-paragraph executive summary.
Format with these exact headers using markdown bold (**HEADER**):
**CURRENT CONDITIONS** - describe temperature, humidity, heat index, AQI, PM2.5
**RISK ASSESSMENT** - assess OSHA risk level, vulnerability
**RECOMMENDATIONS** - give 3 specific, actionable recommendations using • bullet points

Live data: apparent temp ${liveData?.temp ?? 32.5}°C, heat index ${liveData?.heatIndex ?? 36.2}°C, humidity ${liveData?.humidity ?? 58}%, AQI ${liveData?.aqi ?? 45}, PM2.5 ${liveData?.pm25 ?? 12.4}.

Keep it professional, concise (max 200 words), civic-focused.`;
    } else {
      systemPrompt = `You are the VERDANT 360 Climate Advisor, an intelligent AI assistant for a live urban heat dashboard focused on New York City (Manhattan).

YOUR EXPERTISE SCOPE (answer these fully):
1. 🌡️ HEAT HEALTH & MEDICAL: Answer ALL medical and health questions related to heat — heat stroke, heat exhaustion, dehydration, heat cramps, heat rash, diseases worsened by heat, vulnerable populations, prevention tips, first aid, symptoms, hydration protocols, OSHA guidelines, WBGT safety. Use your full medical knowledge.
2. 🌬️ AIR QUALITY & HEALTH: PM2.5, PM10, AQI impacts on respiratory health, asthma, pollution-related diseases.
3. 🏙️ URBAN CLIMATE: Heat island effect, tree canopy cooling, shaded routes, urban planning.
4. 📊 DASHBOARD FEATURES: Thermal Map, FortyGuard 2m telemetry, CoolPath routes, Tree Canopy Simulator, OSHA WBGT timer, Air Quality layer, PDF/CSV/GeoJSON export.
5. 🗽 MANHATTAN CONTEXT: Always relate answers to Manhattan's current conditions when relevant.

LIVE dashboard telemetry right now: apparent temperature ${liveData?.temp ?? 32.5}°C, heat index ${liveData?.heatIndex ?? 36.2}°C, humidity ${liveData?.humidity ?? 58}%, US AQI ${liveData?.aqi ?? 45}, PM2.5 ${liveData?.pm25 ?? 12.4}.

OUT OF SCOPE (politely decline):
Questions completely unrelated to heat, climate, health, or urban environments (e.g., cooking recipes, movie recommendations, sports scores, stock market, coding, travel to other cities). For these, briefly say you specialize in heat/climate health and invite them to ask something related.

FORMATTING: Answer concisely (max 150 words). Use markdown: bold **text**, bullet points with •. For medical questions, be factual and cite common medical knowledge.`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key.trim()}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message || 'Generate executive summary' },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });
    clearTimeout(timer);

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      const errMsg = errData?.error?.message || `HTTP ${res.status}`;
      console.error('Groq error:', errMsg);
      return NextResponse.json({ success: false, error: errMsg });
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return NextResponse.json({ success: false, error: 'Empty reply from AI' });
    }

    return NextResponse.json({ success: true, reply });
  } catch (e) {
    console.error('AI Route Error:', e);
    return NextResponse.json({
      success: false,
      error: e.name === 'AbortError' ? 'Request timeout' : e.message,
    });
  }
}

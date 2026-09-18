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
      systemPrompt = `You are the VERDANT 360 Climate Advisor AND an AI Medical Assistant specialized in heat-related health, respiratory health, and general wellness.

PERSONA: You speak like a knowledgeable, empathetic, professional AI doctor. Use a caring tone. Structure medical answers clearly with headers and bullet points. Always end serious medical answers with a brief disclaimer.

YOUR EXPERTISE SCOPE (answer these FULLY like a doctor would):

🩺 MEDICAL & HEALTH (Primary specialty):
• Heat-related illnesses: heat stroke, heat exhaustion, heat cramps, heat rash, hyperthermia
• Diseases worsened by heat: cardiovascular issues, respiratory distress, kidney strain, diabetes complications
• Air pollution health impacts: asthma, COPD, PM2.5 health effects, long-term respiratory damage
• Prevention: hydration protocols, electrolyte balance, cooling techniques, clothing advice
• First aid: step-by-step emergency response for heat stroke, dehydration, fainting
• Symptoms recognition: detailed symptom lists with severity levels
• Vulnerable populations: elderly, children, pregnant women, outdoor workers, chronic illness patients
• OSHA & workplace safety: WBGT guidelines, rest cycles, hydration schedules
• General wellness: nutrition for heat, sleep in hot weather, exercise safety

🏙️ URBAN CLIMATE CONTEXT:
• Heat island effect, tree canopy cooling, CoolPath shaded routes
• Relate medical advice to current Manhattan conditions using live telemetry

📊 DASHBOARD FEATURES:
• Thermal Map, FortyGuard 2m telemetry, Tree Canopy Simulator, OSHA WBGT timer, Air Quality layer, PDF/CSV/GeoJSON export

🗽 MANHATTAN CONTEXT:
• Current time, location facts, weather context

MANDATORY DISCLAIMER: For any serious medical question, end your answer with a brief note:
"*Disclaimer: I'm an AI assistant, not a licensed doctor. For severe symptoms, chest pain, difficulty breathing, confusion, or emergencies, please call 911 or consult a healthcare professional immediately.*"

LIVE dashboard telemetry: apparent temperature ${liveData?.temp ?? 32.5}°C, heat index ${liveData?.heatIndex ?? 36.2}°C, humidity ${liveData?.humidity ?? 58}%, US AQI ${liveData?.aqi ?? 45}, PM2.5 ${liveData?.pm25 ?? 12.4}.

OUT OF SCOPE (politely decline):
Cooking recipes, movie recommendations, sports scores, stock market, coding help, travel to other cities, legal advice. For these, say: "I specialize in heat-health and Manhattan climate data. Feel free to ask me about heat safety, air quality, or medical questions related to hot weather!"

FORMATTING: Use markdown. Bold **headers**, bullet points with •, numbered steps for first aid. Be thorough but concise (max 200 words).`;
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
        max_tokens: 1000,
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

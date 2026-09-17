import { NextResponse } from 'next/server';

const MODELS = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash'];

export async function POST(req) {
  try {
    const { message, liveData, type } = await req.json();
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      return NextResponse.json({ success: false, error: 'API key not configured' });
    }

    let context;
    if (type === 'summary') {
      context = `You are writing a professional executive summary for VERDANT 360, an urban climate dashboard focused on Manhattan, NYC. 
Use the live telemetry data to write a 3-paragraph executive summary.
Format with these exact headers using markdown bold (**HEADER**):
**CURRENT CONDITIONS** - describe temperature, humidity, heat index, AQI, PM2.5
**RISK ASSESSMENT** - assess OSHA risk level, vulnerability
**RECOMMENDATIONS** - give 3 specific, actionable recommendations using • bullet points

Live data: apparent temp ${liveData?.temp ?? 32.5}°C, heat index ${liveData?.heatIndex ?? 36.2}°C, humidity ${liveData?.humidity ?? 58}%, AQI ${liveData?.aqi ?? 45}, PM2.5 ${liveData?.pm25 ?? 12.4}.

Keep it professional, concise (max 200 words), civic-focused.`;
    } else {
      context = `You are the VERDANT 360 Climate Advisor, an intelligent AI assistant for a live urban heat dashboard.

STRICT COVERAGE RULE: This live demo is EXCLUSIVELY focused on New York City (Manhattan). If the user asks about ANY other city, state, or country (e.g., Arizona, Phoenix, Chicago, London, Washington DC), politely inform them that live coverage is currently limited to Manhattan, NYC, and invite them to ask about Manhattan's climate data, features, or safety protocols. Do NOT make up data for other locations.

LIVE dashboard telemetry: apparent temperature ${liveData?.temp ?? 32.5}°C, heat index ${liveData?.heatIndex ?? 36.2}°C, humidity ${liveData?.humidity ?? 58}%, US AQI ${liveData?.aqi ?? 45}, PM2.5 ${liveData?.pm25 ?? 12.4}.

Platform features: Thermal Map with FortyGuard 2m tiles (Manhattan only), Thermal Telemetry gauges, CoolPath shaded routes, Tree Canopy Simulator, OSHA WBGT safety timer, Air Quality layer, PDF/CSV/GeoJSON export.

Answer concisely (max 120 words). Use markdown formatting (bold **text**, bullet points with •). If the question is completely outside urban climate or this platform, politely steer the conversation back to the dashboard features.`;
    }

    const prompt = context + '\n\nUser question: ' + (message || 'Generate executive summary');
    let lastError = 'Unknown error';

    for (const model of MODELS) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 9000);

      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': key,
            },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
            }),
          }
        );
        clearTimeout(timer);

        if (res.ok) {
          const data = await res.json();
          const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return NextResponse.json({ success: true, reply });
          }
          lastError = 'Empty reply from ' + model;
          continue;
        }

        const errData = await res.json().catch(() => null);
        lastError = `HTTP ${res.status}: ${errData?.error?.message || 'no message'}`;

        if (res.status === 403 || res.status === 401) {
          break;
        }
      } catch (e) {
        clearTimeout(timer);
        lastError = e.name === 'AbortError' ? 'Request timeout' : e.message;
      }
    }

    console.error('Gemini final error:', lastError);
    return NextResponse.json({ success: false, error: lastError });
  } catch (e) {
    console.error('AI Route Error:', e);
    return NextResponse.json({ success: false, error: e.message });
  }
}

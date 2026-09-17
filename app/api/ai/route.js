
import { NextResponse } from 'next/server';

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
      context = `You are the VERDANT 360 Climate Advisor, an AI assistant inside a live urban heat dashboard focused ONLY on Manhattan, NYC.
LIVE dashboard telemetry: apparent temperature ${liveData?.temp ?? 32.5}°C, heat index ${liveData?.heatIndex ?? 36.2}°C, humidity ${liveData?.humidity ?? 58}%, US AQI ${liveData?.aqi ?? 45}, PM2.5 ${liveData?.pm25 ?? 12.4}.
Platform features: Thermal Map with FortyGuard 2m tiles (Manhattan only), Thermal Telemetry gauges, CoolPath shaded routes, Tree Canopy Simulator, OSHA WBGT safety timer, Air Quality layer, PDF/CSV/GeoJSON export.
Answer concisely (max 120 words). Use markdown formatting (bold **text**, bullet points with •). If question is outside urban climate, politely steer back. This project ONLY covers New York City (Manhattan).`;
    }
    
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ 
            role: 'user', 
            parts: [{ text: context + '\n\nUser question: ' + (message || 'Generate executive summary') }] 
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          }
        }),
      }
    );
    clearTimeout(timer);
    
    if (!res.ok) {
      return NextResponse.json({ success: false, error: `API error: ${res.status}` });
    }
    
    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!reply) {
      return NextResponse.json({ success: false, error: 'No reply from AI' });
    }
    
    return NextResponse.json({ success: true, reply });
  } catch (e) {
    console.error('AI Route Error:', e);
    return NextResponse.json({ 
      success: false, 
      error: e.name === 'AbortError' ? 'Request timeout' : e.message 
    });
  }
}

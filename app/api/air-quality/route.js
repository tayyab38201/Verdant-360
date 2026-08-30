import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat') || '40.7128';
    const lon = searchParams.get('lon') || '-74.0060';

    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10,us_aqi,no2,o3,so2,co&timezone=auto`;

    const res = await fetch(url, { next: { revalidate: 300 } });
    const data = await res.json();

    const current = data.current || {};
    const pm25 = current.pm2_5 || 0;
    const pm10 = current.pm10 || 0;
    const aqi = current.us_aqi || 0;

    return NextResponse.json({
      success: true,
      data: {
        pm25,
        pm10,
        aqi,
        no2: current.no2 || 0,
        o3: current.o3 || 0,
        co: current.co || 0,
        timestamp: current.time,
      },
    });
  } catch (error) {
    console.error('Air Quality API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch air quality' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';

const API_KEY = process.env.FORTYGUARD_API_KEY || 'd09444564fde403dc05cf056996a45ed';
const BASE_URL = 'https://api.fortyguard.com/v1';

function buildPayload(type, params) {
  if (type === 'heatmap') {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(Math.max(0, now.getHours() - 1)).padStart(2, '0');

    return {
      endpoint: 'heatmap',
      payload: {
        polygon_aoi: params.polygon_aoi,
        date_time: { start_date: `${yyyy}-${mm}-${dd}`, start_time: `${hh}:00`, filter_type: 1 },
        granularity: 100,
      },
    };
  }

  if (type === 'env_params') {
    return {
      endpoint: 'env_params',
      payload: {
        latitude: params.latitude,
        longitude: params.longitude,
        temperature: params.temperature || 32,
        date_time: {
          start_date: params.date || new Date().toISOString().split('T')[0],
          start_time: params.time || '14:00',
          filter_type: 1,
        },
      },
    };
  }

  return null;
}

// POST → task submit karo, activityId foran wapas (fast < 10s) ✅
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, params } = body;
    const built = buildPayload(type, params || {});

    if (!built) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

    const submitRes = await fetch(`${BASE_URL}/${built.endpoint}`, {
      method: 'POST',
      headers: { 'api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(built.payload),
    });

    if (!submitRes.ok) {
      const err = await submitRes.json().catch(() => ({}));
      throw new Error(err.message || `Submit failed: ${submitRes.status}`);
    }

    const { data } = await submitRes.json();
    return NextResponse.json({ success: true, activityId: data.activity_id });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'API request failed' }, { status: 500 });
  }
}

// GET ?id=... → sirf EK status check (fast < 10s) ✅
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ status: 'processing' });

    const res = await fetch(`${BASE_URL}/status/${id}`, { headers: { 'api-key': API_KEY } });
    if (!res.ok) return NextResponse.json({ status: 'processing' });

    const json = await res.json();
    const status = json.data?.status;

    if (status === 'Completed') {
      return NextResponse.json({ status: 'completed', result: json.data.result });
    }
    if (status === 'Failed') {
      return NextResponse.json({ status: 'failed' });
    }
    return NextResponse.json({ status: 'processing' });
  } catch {
    return NextResponse.json({ status: 'processing' });
  }
}
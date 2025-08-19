import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ analysis_id: string }> }
) {
  const { analysis_id } = await params;
  const { searchParams } = new URL(request.url);
  const pollStatus = searchParams.get('status') === 'true';

  if (!analysis_id) {
    return NextResponse.json({ error: 'Analysis ID is required' }, { status: 400 });
  }

  const endpoint = pollStatus
    ? `https://llm-search-insights-api.onrender.com/api/v1/analyze/${analysis_id}/status`
    : `https://llm-search-insights-api.onrender.com/api/v1/analyze/${analysis_id}`;

  try {
    const apiResponse = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      return NextResponse.json({ error: 'API request failed', details: errorData }, { status: apiResponse.status });
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { research_question } = body;

    if (!research_question) {
      return NextResponse.json({ error: 'Research question is required' }, { status: 400 });
    }

    const apiResponse = await fetch('https://llm-search-insights-api.onrender.com/api/v1/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({ research_question }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      return NextResponse.json({ error: 'API request failed', details: errorData }, { status: apiResponse.status });
    }

    const data = await apiResponse.json();
    return NextResponse.json(data, { status: 202 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

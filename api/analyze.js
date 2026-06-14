import { buildPrompt } from '../lib/prompt.js';
import { checkRateLimit } from '../lib/rateLimit.js';
import { SCHOOLS } from '../config/schools.js';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Rate Limiting
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const { allowed } = checkRateLimit(ip);

  if (!allowed) {
    return new Response(JSON.stringify({ 
      message: "You've asked a lot of great questions. Try again in a few minutes." 
    }), { 
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const question = body.question?.trim();

    // Server-side validation
    if (!question || question.length < 5 || question.length > 300) {
      return new Response(JSON.stringify({ message: 'Your question needs a bit more to work with.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { system, user } = buildPrompt(question);
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.error('Missing GROQ_API_KEY environment variable');
      return new Response(JSON.stringify({ message: 'Server configuration error.' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Call Groq via HTTP Fetch (zero dependencies)
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      })
    });

    if (!groqRes.ok) {
      const errorData = await groqRes.json();
      console.error('Groq API Error:', errorData);
      return new Response(JSON.stringify({ message: "We're having trouble reaching our AI. Try again shortly." }), { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const groqData = await groqRes.json();
    const text = groqData.choices[0].message.content;

    // Parse JSON safely
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // Attempt to extract JSON from markdown if the model added block ticks
      const match = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (match) {
        parsed = JSON.parse(match[1]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    if (parsed.error) {
      return new Response(JSON.stringify({ error: true, message: parsed.message }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Merge results with accent colors and full data from schools.js
    const enrichedResults = parsed.results.map(res => {
      const schoolDef = SCHOOLS.find(s => s.id === res.id);
      return {
        ...res,
        name: schoolDef?.name || res.id,
        origin: schoolDef?.origin || 'Unknown',
        philosopher: schoolDef?.philosopher || 'Unknown',
        accentColor: schoolDef?.accentColor || '#FFFFFF'
      };
    });

    return new Response(JSON.stringify({ results: enrichedResults }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Handler Error:', error);
    return new Response(JSON.stringify({ message: 'Something went wrong on our end. Try again.' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an aggressive growth investment analyst specializing in AI infrastructure.
Your client has a $61.5k portfolio with a 2-year horizon targeting maximum returns by 2028.
They are focused on: semiconductors/chips, power & energy for AI data centers, cloud hyperscalers, robotics & physical AI, and AI networking.
Be direct, specific, and actionable. No fluff. Give conviction ratings.`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 });
  }
  const body = await req.json();
  const { symbol, currentPrice, context, type } = body;
  let userPrompt = '';
  if (type === 'stock-analysis') {
    userPrompt = `Analyze ${symbol} as a 2-year aggressive growth investment for AI infrastructure exposure.\n${currentPrice ? `Current price: $${currentPrice}` : ''}\n${context ? `Additional context: ${context}` : ''}\n\nProvide:\n1. One-sentence verdict (strong-buy/buy/hold/sell/strong-sell)\n2. 3 key bullish catalysts (2028 timeframe)\n3. 2 main risks\n4. Price target range for end of 2027\n5. Recommended position size as % of $61.5k portfolio\n\nBe specific about AI infrastructure thesis. Max 300 words.`;
  } else if (type === 'portfolio-review') {
    userPrompt = `Review this portfolio for aggressive 2028 growth focused on AI infrastructure:\n${context}\n\nIdentify:\n1. Top 2 reallocation opportunities (what to trim, what to add)\n2. Biggest concentration risk\n3. Missing AI infrastructure exposure\n4. One contrarian bet worth considering\n\nMax 300 words. Be direct.`;
  } else {
    userPrompt = context || `Give me your top 3 AI infrastructure investment ideas right now for a 2-year horizon with $61.5k portfolio.`;
  }
  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    let recommendation = 'hold';
    const lower = text.toLowerCase();
    if (lower.includes('strong-buy') || lower.includes('strong buy')) recommendation = 'strong-buy';
    else if (lower.includes('strong-sell') || lower.includes('strong sell')) recommendation = 'strong-sell';
    else if (lower.match(/\bbuy\b/)) recommendation = 'buy';
    else if (lower.match(/\bsell\b/)) recommendation = 'sell';
    return NextResponse.json({
      symbol, recommendation, analysis: text,
      generatedAt: new Date().toISOString(),
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

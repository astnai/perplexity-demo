import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const { query, apiKey, mode, category } = await req.json();

  if (!query || !apiKey) {
    return NextResponse.json(
      { error: "Missing query or API key" },
      { status: 400 }
    );
  }

  const openai = new OpenAI({ apiKey });

  try {
    let prompt = query;
    if (mode === "advanced") {
      prompt = `Provide a detailed analysis on the following topic: ${query}. Include key points, potential controversies, and recent developments.`;
    }
    if (category) {
      prompt = `In the context of ${category}, ${prompt}`;
    }

    const stream = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

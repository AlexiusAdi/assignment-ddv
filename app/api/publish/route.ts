import { NextRequest, NextResponse } from "next/server";
import { kafka, KAFKA_TOPIC } from "@/lib/kafka";
import { ArticlePublishedEventSchema } from "@/lib/schemas";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const bodyObj = body as Record<string, unknown>;

  const result = ArticlePublishedEventSchema.safeParse({
    author: bodyObj.author,
    title: bodyObj.title,
    article_url: bodyObj.article_url,
    action: "publish",
  });

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        details: result.error,
      },
      { status: 422 },
    );
  }

  try {
    const producer = kafka.producer();
    await producer.connect();
    await producer.send({
      topic: KAFKA_TOPIC,
      messages: [{ value: JSON.stringify(result.data) }],
    });
    await producer.disconnect();

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[api/publish] Kafka error:", err);
    return NextResponse.json(
      { error: "Failed to publish event." },
      { status: 500 },
    );
  }
}

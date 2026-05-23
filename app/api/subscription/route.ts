import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabase } from "@/lib/supabase";
import { SubscriptionBodySchema } from "@/lib/schemas";

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

  const result = SubscriptionBodySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        details: result.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const { author_username, subs_email } = result.data;

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("author_username", author_username)
    .eq("subs_email", subs_email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { message: "Already subscribed.", subscribed: true },
      { status: 200 },
    );
  }

  const unsubscribe_token = randomUUID();

  const { error } = await supabase.from("subscriptions").insert({
    author_username,
    subs_email,
    unsubscribe_token,
  });

  if (error) {
    console.error("[api/subscription] Supabase insert error:", error.message);
    return NextResponse.json(
      { error: "Failed to create subscription." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Subscribed successfully.", subscribed: true },
    { status: 201 },
  );
}

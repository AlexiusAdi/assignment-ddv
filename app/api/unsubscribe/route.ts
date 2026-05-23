import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse(
      renderPage("Missing token", "No unsubscribe token was provided."),
      {
        status: 400,
        headers: { "Content-Type": "text/html" },
      },
    );
  }

  const { data: subscription, error: lookupError } = await supabase
    .from("subscriptions")
    .select("subs_email, author_username")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (lookupError) {
    return new NextResponse(
      renderPage("Error", "Something went wrong. Please try again later."),
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      },
    );
  }

  if (!subscription) {
    return new NextResponse(
      renderPage(
        "Already unsubscribed",
        "This link has already been used or is invalid.",
      ),
      { status: 200, headers: { "Content-Type": "text/html" } },
    );
  }

  const { error: deleteError } = await supabase
    .from("subscriptions")
    .delete()
    .eq("unsubscribe_token", token);

  if (deleteError) {
    return new NextResponse(
      renderPage(
        "Error",
        "Could not process unsubscription. Please try again.",
      ),
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      },
    );
  }

  return new NextResponse(
    renderPage(
      "Unsubscribed",
      `<strong>${subscription.subs_email}</strong> has been unsubscribed from updates by <strong>${subscription.author_username}</strong>.`,
    ),
    { status: 200, headers: { "Content-Type": "text/html" } },
  );
}

function renderPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
  </head>
  <body style="font-family: sans-serif; max-width: 480px; margin: 80px auto; padding: 0 24px; color: #111;">
    <h1>${title}</h1>
    <p>${message}</p>
  </body>
</html>`;
}

import { APP_URL } from "./mailer";

interface NotificationEmailOptions {
  author: string;
  title: string;
  articleUrl?: string;
  subscriberEmail: string;
  unsubscribeToken: string;
}

export function buildNotificationEmail(opts: NotificationEmailOptions): {
  subject: string;
  html: string;
  text: string;
} {
  const { author, title, articleUrl, subscriberEmail, unsubscribeToken } = opts;

  const unsubscribeUrl = `${APP_URL}/api/unsubscribe?token=${unsubscribeToken}`;
  const articleLink = articleUrl ?? "#";

  const subject = `New article by ${author}: "${title}"`;

  const html = `
<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /></head>
  <body style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; color: #111;">
    <h2>New article published</h2>
    <p><strong>${author}</strong> just published a new article:</p>
    <h3><a href="${articleLink}" style="color: #0070f3;">${title}</a></h3>
    <p>
      <a href="${articleLink}" style="
        display: inline-block;
        padding: 10px 20px;
        background: #0070f3;
        color: #fff;
        text-decoration: none;
        border-radius: 4px;
      ">Read Article</a>
    </p>
    <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
    <p style="font-size: 12px; color: #888;">
      You are receiving this because you subscribed to updates from <strong>${author}</strong>.<br />
      <a href="${unsubscribeUrl}" style="color: #888;">Unsubscribe</a>
    </p>
  </body>
</html>
  `.trim();

  const text = [
    `New article by ${author}: "${title}"`,
    "",
    articleUrl ? `Read it here: ${articleUrl}` : "",
    "",
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join("\n");

  return { subject, html, text };
}

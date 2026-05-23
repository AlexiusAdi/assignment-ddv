import { kafka, KAFKA_TOPIC, KAFKA_GROUP_ID } from "./kafka";
import { supabase } from "./supabase";
import { transporter, FROM_ADDRESS } from "./mailer";
import { buildNotificationEmail } from "./email-template";
import { ArticlePublishedEventSchema } from "./schemas";
import type { Subscription } from "./schemas";

export async function processArticlePublishedEvent(
  rawValue: string,
): Promise<void> {
  const parsed = JSON.parse(rawValue) as unknown;
  const result = ArticlePublishedEventSchema.safeParse(parsed);

  if (!result.success) {
    console.warn(
      "[mailing-service] Invalid event payload:",
      result.error.flatten(),
    );
    return;
  }

  const event = result.data;
  console.log(
    `[mailing-service] Processing publish event from "${event.author}": "${event.title}"`,
  );

  const { data: subscribers, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("author_username", event.author)
    .returns<Subscription[]>();

  if (error) {
    console.error(
      "[mailing-service] Failed to fetch subscribers:",
      error.message,
    );
    return;
  }

  if (!subscribers || subscribers.length === 0) {
    console.log(
      `[mailing-service] No subscribers for "${event.author}". Skipping.`,
    );
    return;
  }

  console.log(
    `[mailing-service] Sending to ${subscribers.length} subscriber(s)...`,
  );

  for (const subscriber of subscribers) {
    const { subject, html, text } = buildNotificationEmail({
      author: event.author,
      title: event.title,
      articleUrl: event.article_url,
      subscriberEmail: subscriber.subs_email,
      unsubscribeToken: subscriber.unsubscribe_token,
    });

    try {
      await transporter.sendMail({
        from: FROM_ADDRESS,
        to: subscriber.subs_email,
        subject,
        html,
        text,
      });
      console.log(`[mailing-service] ✓ Email sent to ${subscriber.subs_email}`);
    } catch (err) {
      console.error(
        `[mailing-service] ✗ Failed to send to ${subscriber.subs_email}:`,
        err,
      );
    }
  }
}

export async function startMailingServiceConsumer(): Promise<void> {
  const consumer = kafka.consumer({ groupId: KAFKA_GROUP_ID });

  await consumer.connect();
  await consumer.subscribe({ topic: KAFKA_TOPIC, fromBeginning: false });

  console.log(`[mailing-service] Listening on topic "${KAFKA_TOPIC}"...`);

  await consumer.run({
    eachMessage: async ({ message }) => {
      const value = message.value?.toString();
      if (!value) return;
      await processArticlePublishedEvent(value);
    },
  });

  const shutdown = async () => {
    console.log("\n[mailing-service] Shutting down...");
    await consumer.disconnect();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

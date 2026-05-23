import { z } from "zod";

export const ArticlePublishedEventSchema = z.object({
  author: z.string().min(1),
  action: z.literal("publish"),
  title: z.string().min(1),
  article_url: z.string().url().optional(),
});

export type ArticlePublishedEvent = z.infer<typeof ArticlePublishedEventSchema>;

export const SubscriptionBodySchema = z.object({
  author_username: z.string().min(1, "author name is required"),
  subs_email: z.string().email("email must be a valid email address"),
});

export type SubscriptionBody = z.infer<typeof SubscriptionBodySchema>;

export interface Subscription {
  id: string;
  author_username: string;
  subs_email: string;
  unsubscribe_token: string;
  created_at: string;
}

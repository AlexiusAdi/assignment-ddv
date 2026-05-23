"use client";

import { useState } from "react";
import { ArticlePublishedEventSchema } from "@/lib/schemas";

type Status = "idle" | "loading" | "success" | "error";

export default function PublishForm() {
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [articleUrl, setArticleUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const result = ArticlePublishedEventSchema.safeParse({
      author,
      action: "publish",
      title,
      ...(articleUrl ? { article_url: articleUrl } : {}),
    });

    if (!result.success) {
      setStatus("error");
      const errors = result.error.flatten().fieldErrors;
      const first = Object.values(errors).flat()[0];
      setMessage(first ?? "Invalid input.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (res.ok) {
        setStatus("success");
        setMessage(
          "Publish event fired! Subscribers will receive an email shortly.",
        );
        setAuthor("");
        setTitle("");
        setArticleUrl("");
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  const statusStyles: Record<Status, string> = {
    idle: "",
    loading: "text-zinc-400",
    success: "text-emerald-400",
    error: "text-red-400",
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <p className="text-xs text-zinc-500 leading-relaxed">
        Simulates the &quot;already running system&quot; firing a publish event
        to Kafka. All subscribers of this author will receive an email.
      </p>

      <div className="space-y-3">
        <div>
          <label
            htmlFor="author"
            className="block text-xs font-medium tracking-widest text-zinc-500 uppercase mb-2"
          >
            Author Username
          </label>
          <input
            id="author"
            type="text"
            required
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="e.g. johndoe"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-xs font-medium tracking-widest text-zinc-500 uppercase mb-2"
          >
            Article Title
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. My First Article"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="article_url"
            className="block text-xs font-medium tracking-widest text-zinc-500 uppercase mb-2"
          >
            Article URL{" "}
            <span className="text-zinc-700 normal-case">(optional)</span>
          </label>
          <input
            id="article_url"
            type="url"
            value={articleUrl}
            onChange={(e) => setArticleUrl(e.target.value)}
            placeholder="https://example.com/my-article"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-white text-black text-sm font-semibold py-3 rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === "loading" ? "Publishing..." : "Simulate Publish"}
      </button>

      {message && (
        <p className={`text-sm text-center ${statusStyles[status]}`}>
          {message}
        </p>
      )}
    </form>
  );
}

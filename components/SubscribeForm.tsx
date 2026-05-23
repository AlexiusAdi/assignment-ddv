"use client";

import { useState } from "react";
import { SubscriptionBodySchema } from "@/lib/schemas";

type Status = "idle" | "loading" | "success" | "already" | "error";

export default function SubscribeForm() {
  const [authorUsername, setAuthorUsername] = useState("");
  const [subsEmail, setSubsEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const result = SubscriptionBodySchema.safeParse({
      author_username: authorUsername,
      subs_email: subsEmail,
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
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const data = await res.json();

      if (res.status === 201) {
        setStatus("success");
        setMessage("You're subscribed! You'll get notified when they publish.");
        setAuthorUsername("");
        setSubsEmail("");
      } else if (res.status === 200) {
        setStatus("already");
        setMessage("You're already subscribed to this author.");
      } else {
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
    already: "text-amber-400",
    error: "text-red-400",
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="space-y-3">
        <div>
          <label
            htmlFor="author_username"
            className="block text-xs font-medium tracking-widest uppercase mb-2"
          >
            Author Username
          </label>
          <input
            id="author_username"
            type="text"
            required
            value={authorUsername}
            onChange={(e) => setAuthorUsername(e.target.value)}
            placeholder="e.g. johndoe"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="subs_email"
            className="block text-xs font-medium tracking-widest uppercase mb-2"
          >
            Your Email
          </label>
          <input
            id="subs_email"
            type="email"
            required
            value={subsEmail}
            onChange={(e) => setSubsEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-white text-black text-sm font-semibold py-3 rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === "loading" ? "Subscribing..." : "Subscribe"}
      </button>

      {message && (
        <p className={`text-sm text-center ${statusStyles[status]}`}>
          {message}
        </p>
      )}
    </form>
  );
}
